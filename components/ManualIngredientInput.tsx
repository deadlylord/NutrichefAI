import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getIngredientSuggestions } from '../services/geminiService';
import { TrashIcon } from './IconComponents';

interface ManualIngredientInputProps {
    manualIngredients: string[];
    onIngredientsChange: (ingredients: string[]) => void;
}

const ManualIngredientInput: React.FC<ManualIngredientInputProps> = ({ manualIngredients, onIngredientsChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimeout = useRef<number | null>(null);

    const handleAddIngredient = (ingredient: string) => {
        const trimmed = ingredient.trim();
        if (trimmed && !manualIngredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
            onIngredientsChange([...manualIngredients, trimmed]);
        }
        setInputValue('');
        setSuggestions([]);
    };

    const handleRemoveIngredient = (indexToRemove: number) => {
        onIngredientsChange(manualIngredients.filter((_, index) => index !== indexToRemove));
    };

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        const result = await getIngredientSuggestions(query, manualIngredients);
        setSuggestions(result);
        setIsLoading(false);
    }, [manualIngredients]);

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        if (inputValue) {
            debounceTimeout.current = window.setTimeout(() => {
                fetchSuggestions(inputValue);
            }, 300);
        } else {
            setSuggestions([]);
        }

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [inputValue, fetchSuggestions]);

    return (
        <div className="w-full">
            <label htmlFor="manual-ingredient" className="block text-sm font-medium text-gray-700 mb-1">
                Añadir Ingredientes Manualmente
            </label>
            <div className="relative">
                <div className="flex shadow-sm">
                    <input
                        id="manual-ingredient"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddIngredient(inputValue);
                            }
                        }}
                        placeholder="Ej: Tomates, Cebolla..."
                        className="flex-grow w-full px-4 py-2 border border-gray-200 rounded-l-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                        onClick={() => handleAddIngredient(inputValue)}
                        className="px-5 py-2 bg-green-500 text-white font-semibold rounded-r-full hover:bg-green-600 disabled:bg-gray-400"
                        disabled={!inputValue.trim()}
                    >
                        Añadir
                    </button>
                </div>
                {(isLoading || suggestions.length > 0) && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {isLoading && <li className="px-4 py-2 text-gray-500">Buscando...</li>}
                        {!isLoading && suggestions.map(suggestion => (
                            <li
                                key={suggestion}
                                onClick={() => handleAddIngredient(suggestion)}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {manualIngredients.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-sm text-gray-600">Ingredientes añadidos:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {manualIngredients.map((ing, index) => (
                            <span key={index} className="flex items-center bg-green-100 text-green-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                                {ing}
                                <button onClick={() => handleRemoveIngredient(index)} className="ml-2 text-green-600 hover:text-green-800">
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