
import React from 'react';
import { ComplementarySuggestion, ShoppingListItem, SuggestionItem } from '../types';
import { ShoppingCartIcon, PlusCircleIcon, CheckCircleIcon } from './IconComponents';

interface ComplementarySuggestionsDisplayProps {
    suggestions: ComplementarySuggestion[];
    onAddToList: (item: SuggestionItem) => void;
    shoppingList: ShoppingListItem[];
}

const ComplementarySuggestionsDisplay: React.FC<ComplementarySuggestionsDisplayProps> = ({ suggestions, onAddToList, shoppingList }) => {
    
    const isAdded = (name: string) => shoppingList.some(item => item.name === name);

    return (
        <div className="mt-8 bg-white p-6 rounded-3xl shadow-md animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <ShoppingCartIcon />
                <span className="ml-2">Sugerencias para Complementar tu Plan</span>
            </h2>
            <p className="mb-6 text-gray-600">
                Basado en tu plan y las necesidades de tu familia, considera añadir estos productos a tu próxima compra para una nutrición aún más completa.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((item, index) => {
                    const added = isAdded(item.productName);
                    return (
                        <div key={index} className="bg-green-50/70 border border-green-100 rounded-xl p-4 flex justify-between items-start gap-3">
                            <div>
                                <h3 className="font-bold text-green-800">{item.productName}</h3>
                                <p className="text-sm text-green-700 mt-2">{item.reason}</p>
                            </div>
                            <button
                                onClick={() => onAddToList({ item: item.productName, category: 'Complementarios', reason: item.reason })}
                                className={`flex-shrink-0 p-2 rounded-full transition-colors ${added ? 'text-green-600 bg-green-200' : 'text-green-600 hover:bg-green-200 bg-white shadow-sm'}`}
                                title="Agregar a lista de compras"
                            >
                                {added ? <CheckCircleIcon /> : <PlusCircleIcon />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ComplementarySuggestionsDisplay;
