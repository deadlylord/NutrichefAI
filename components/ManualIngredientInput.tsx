
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
        <div className="w-full space-y-4">
            <div>
                <div className="flex justify-between items-end mb-2">
                    <label htmlFor="manual-ingredient" className="block text-sm font-bold text-gray-700">
                        Ingredientes Manuales
                    </label>
                    <button 
                        onClick={() => setShowQuickAdd(!showQuickAdd)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${showQuickAdd ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <PlusCircleIcon /> {showQuickAdd ? 'Ocultar Menú' : 'Selección Rápida'}
                    </button>
                </div>
                
                {/* Prominent Delete Button */}
                {manualIngredients.length > 0 && (
                    <div className="flex justify-end mb-2">
                        <button 
                            onClick={handleClearAll}
                            className="text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 shadow-sm"
                            title="Borrar toda la lista"
                        >
                            <TrashIcon /> Borrar Todos ({manualIngredients.length})
                        </button>
                    </div>
                )}

                {/* Quick Add Menu */}
                {showQuickAdd && (
                    <div className="mb-4 bg-white border border-green-100 rounded-2xl p-4 shadow-sm animate-fade-in">
                        <p className="text-xs text-gray-500 mb-3 font-medium">Selecciona para agregar rápidamente:</p>
                        <div className="space-y-4">
                            {Object.entries(QUICK_INGREDIENTS).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-green-700 mb-2 ml-1">{category}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map((item) => {
                                            const isAdded = manualIngredients.some(i => i.toLowerCase() === item.toLowerCase());
                                            return (
                                                <button
                                                    key={item}
                                                    onClick={() => !isAdded && handleAddIngredient(item)}
                                                    disabled={isAdded}
                                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                                        isAdded 
                                                        ? 'bg-green-100 text-green-800 border-green-200 cursor-default opacity-70' 
                                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-green-400 hover:bg-white hover:shadow-sm'
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
                    <div className="flex shadow-sm relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <SparklesIcon />
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
                            className="flex-grow w-full pl-10 pr-4 py-3 border border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-slate-50 focus:bg-white transition-colors"
                        />
                        <button
                            onClick={() => handleAddIngredient(inputValue)}
                            className="px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-r-xl hover:bg-slate-900 disabled:bg-slate-300 transition-colors"
                            disabled={!inputValue.trim()}
                        >
                            Añadir
                        </button>
                    </div>

                    {/* Rich Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden animate-fade-in">
                            <li className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                                Resultados sugeridos
                            </li>
                            {searchResults.map((result, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handleAddIngredient(result.name)}
                                    className="px-4 py-3 cursor-pointer hover:bg-green-50 border-b border-gray-50 last:border-0 flex justify-between items-center group transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 group-hover:text-green-800">{result.name}</p>
                                        <p className="text-[10px] text-gray-500">{result.category} • {result.servingSize || 'Porción normal'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full group-hover:bg-white">
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
                <div className="bg-white p-3 rounded-2xl border border-slate-100">
                    <div className="flex flex-wrap gap-2">
                        {manualIngredients.map((ing, index) => (
                            <span key={index} className="flex items-center bg-green-50 border border-green-100 text-green-800 text-sm font-medium pl-3 pr-1 py-1 rounded-lg group hover:border-green-300 transition-colors">
                                {ing}
                                <button 
                                    onClick={() => handleRemoveIngredient(index)} 
                                    className="ml-1 p-1 text-green-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                >
                                    <TrashIcon />
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
