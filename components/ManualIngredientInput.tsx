
import React, { useState, useRef, useEffect } from 'react';
import { searchFoodDatabase } from '../services/geminiService';
import { TrashIcon, PlusCircleIcon, SparklesIcon } from './IconComponents';

interface ManualIngredientInputProps {
    manualIngredients: string[];
    onIngredientsChange: (ingredients: string[]) => void;
}

const QUICK_INGREDIENTS = {
    'Básicos': ['Arroz', 'Huevos', 'Leche', 'Pan', 'Arepas', 'Aceite', 'Sal', 'Azúcar'],
    'Verduras': ['Tomate', 'Cebolla', 'Zanahoria', 'Papa', 'Lechuga', 'Pimentón', 'Ajo', 'Aguacate'],
    'Frutas': ['Banano', 'Manzana', 'Limón', 'Mango', 'Fresa', 'Naranja'],
    'Proteínas': ['Pollo', 'Carne de Res', 'Cerdo', 'Atún', 'Lentejas', 'Frijoles', 'Queso'],
    'Snacks': ['Galletas', 'Yogurt', 'Café', 'Chocolate']
};

interface SearchResult {
    name: string;
    calories: number;
    category: string;
    servingSize?: string;
}

const ManualIngredientInput: React.FC<ManualIngredientInputProps> = ({ manualIngredients, onIngredientsChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    
    // Simple debounce to avoid too many API calls while typing
    const debounceTimeout = useRef<number | null>(null);

    const handleAddIngredient = (ingredientName: string) => {
        const trimmed = ingredientName.trim();
        if (trimmed && !manualIngredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
            onIngredientsChange([...manualIngredients, trimmed]);
        }
        setInputValue('');
        setSearchResults([]);
    };

    const handleRemoveIngredient = (indexToRemove: number) => {
        onIngredientsChange(manualIngredients.filter((_, index) => index !== indexToRemove));
    };

    const handleClearAll = () => {
        if (window.confirm('¿Estás seguro de borrar todos los ingredientes manuales?')) {
            onIngredientsChange([]);
        }
    };

    const handleSearch = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);
        const results = await searchFoodDatabase(query);
        setSearchResults(results as SearchResult[]);
        setIsLoading(false);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (val.length >= 3) {
            debounceTimeout.current = window.setTimeout(() => {
                handleSearch(val);
            }, 600);
        } else {
            setSearchResults([]);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div>
                <div className="flex justify-between items-end mb-3">
                    <label htmlFor="manual-ingredient" className="label-small ml-1">
                        Ingredientes Manuales
                    </label>
                    <button 
                        onClick={() => setShowQuickAdd(!showQuickAdd)}
                        className={`text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 transition-all uppercase tracking-wider ${showQuickAdd ? 'bg-green text-paper shadow-md' : 'bg-warm text-muted hover:bg-border/50'}`}
                    >
                        <PlusCircleIcon className="w-3 h-3" /> {showQuickAdd ? 'Ocultar Menú' : 'Selección Rápida'}
                    </button>
                </div>
                
                {/* Prominent Delete Button */}
                {manualIngredients.length > 0 && (
                    <div className="flex justify-end mb-3">
                        <button 
                            onClick={handleClearAll}
                            className="text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 transition-all bg-red-light text-red hover:bg-red hover:text-white border border-red/10 shadow-sm uppercase tracking-wider"
                            title="Borrar toda la lista"
                        >
                            <TrashIcon className="w-3 h-3" /> Borrar Todos ({manualIngredients.length})
                        </button>
                    </div>
                )}

                {/* Quick Add Menu */}
                {showQuickAdd && (
                    <div className="mb-6 bg-paper border border-border rounded-[2rem] p-6 shadow-sm animate-slide-up">
                        <p className="label-small mb-4 text-muted">Selección Estratégica:</p>
                        <div className="space-y-6">
                            {Object.entries(QUICK_INGREDIENTS).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="text-[10px] uppercase tracking-widest font-black text-green mb-3 ml-1">{category}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map((item) => {
                                            const isAdded = manualIngredients.some(i => i.toLowerCase() === item.toLowerCase());
                                            return (
                                                <button
                                                    key={item}
                                                    onClick={() => !isAdded && handleAddIngredient(item)}
                                                    disabled={isAdded}
                                                    className={`text-[11px] font-black px-4 py-2 rounded-xl border transition-all uppercase tracking-wide ${
                                                        isAdded 
                                                        ? 'bg-green-light text-green border-green/20 cursor-default opacity-70' 
                                                        : 'bg-white text-ink border-border hover:border-green hover:shadow-sm'
                                                    }`}
                                                >
                                                    {item} {isAdded && '✓'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rich Search Input */}
                <div className="relative">
                    <div className="flex shadow-sm relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <SparklesIcon className="w-5 h-5" />
                            )}
                        </div>
                        <input
                            id="manual-ingredient"
                            type="text"
                            value={inputValue}
                            onChange={onInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch(inputValue);
                                }
                            }}
                            placeholder="Buscar alimento (ej. Atún, Proteína...)"
                            className="flex-grow w-full pl-12 pr-4 py-4 border border-border rounded-l-2xl focus:outline-none focus:ring-1 focus:ring-green/20 bg-paper text-ink font-bold placeholder:text-muted/50 transition-all"
                        />
                        <button
                            onClick={() => handleAddIngredient(inputValue)}
                            className="px-8 py-4 bg-ink text-paper font-black rounded-r-2xl hover:bg-ink/90 disabled:bg-warm disabled:text-muted transition-all uppercase tracking-widest text-[11px]"
                            disabled={!inputValue.trim()}
                        >
                            Añadir
                        </button>
                    </div>

                    {/* Rich Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <ul className="absolute z-20 w-full mt-3 bg-white border border-border rounded-[2rem] shadow-xl max-h-72 overflow-y-auto overflow-x-hidden animate-slide-up p-2">
                            <li className="px-6 py-3 text-[10px] font-black text-muted uppercase tracking-widest border-b border-border/50 sticky top-0 bg-white/90 backdrop-blur-sm">
                                Resultados sugeridos
                            </li>
                            {searchResults.map((result, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handleAddIngredient(result.name)}
                                    className="px-6 py-4 cursor-pointer hover:bg-green-light border-b border-border/30 last:border-0 flex justify-between items-center group transition-all rounded-xl"
                                >
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-ink group-hover:text-green italic">{result.name}</p>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{result.category} • {result.servingSize || 'Porción normal'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-muted bg-warm px-3 py-1 rounded-full group-hover:bg-white group-hover:text-ink transition-all">
                                            {result.calories} kcal
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Active Ingredient List */}
            {manualIngredients.length > 0 && (
                <div className="bg-paper p-4 rounded-2xl border border-border">
                    <div className="flex flex-wrap gap-2">
                        {manualIngredients.map((ing, index) => (
                            <span key={index} className="flex items-center bg-white border border-border text-ink text-[11px] font-black pl-4 pr-2 py-2 rounded-xl group hover:border-green/30 transition-all shadow-sm">
                                <span className="italic">{ing}</span>
                                <button 
                                    onClick={() => handleRemoveIngredient(index)} 
                                    className="ml-2 p-1.5 text-muted hover:text-red hover:bg-red-light rounded-lg transition-all"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualIngredientInput;
