
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
        <div className="mt-8 card-base p-8 animate-slide-up">
            <h2 className="text-2xl font-black mb-4 text-ink flex items-center italic">
                <ShoppingCartIcon className="w-6 h-6 mr-2" />
                <span>Sugerencias para <span className="text-green">Complementar</span></span>
            </h2>
            <p className="mb-8 text-muted text-sm leading-relaxed max-w-2xl">
                Basado en tu plan y las necesidades de tu familia, considera añadir estos productos estratégicos para una nutrición aún más completa.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((item, index) => {
                    const added = isAdded(item.productName);
                    return (
                        <div key={index} className="bg-paper border border-border rounded-2xl p-5 flex justify-between items-start gap-4 hover:border-green/30 transition-all">
                            <div className="space-y-2">
                                <h3 className="font-black text-ink text-sm italic">{item.productName}</h3>
                                <p className="text-[11px] text-muted font-bold leading-relaxed">{item.reason}</p>
                            </div>
                            <button
                                onClick={() => onAddToList({ item: item.productName, category: 'Complementarios', reason: item.reason })}
                                className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${added ? 'text-green bg-green-light' : 'text-muted bg-warm hover:text-green hover:bg-green-light'}`}
                                title="Agregar a lista de compras"
                            >
                                {added ? <CheckCircleIcon className="w-5 h-5" /> : <PlusCircleIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ComplementarySuggestionsDisplay;
