
import React from 'react';
import { ShoppingListItem } from '../types';
import { ClipboardListIcon, TrashIcon, SparklesIcon } from './IconComponents';

interface ShoppingListProps {
    items: ShoppingListItem[];
    onToggleItem: (id: string) => void;
    onDeleteItem: (id: string) => void;
    onAddAllToIngredients?: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onToggleItem, onDeleteItem, onAddAllToIngredients }) => {
    if (items.length === 0) return null;

    return (
        <div className="card-base p-5 animate-slide-up">
            <div className="flex flex-col gap-4 mb-6 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-ink uppercase tracking-widest flex items-center italic">
                        <ClipboardListIcon className="w-4 h-4 mr-2" /> Lista de Compra
                    </h2>
                    <span className="badge bg-warm text-muted">
                        {items.length} items
                    </span>
                </div>
                
                {onAddAllToIngredients && (
                    <button 
                        onClick={onAddAllToIngredients}
                        className="btn-secondary btn-full flex items-center justify-center gap-2 text-[10px]"
                    >
                        <SparklesIcon className="w-3 h-3" />
                        <span>Añadir todo al inventario</span>
                    </button>
                )}
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${item.checked ? 'bg-green-light border-green-mid/20 opacity-60' : 'bg-paper border-border hover:border-green-mid'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <input 
                                type="checkbox" 
                                checked={item.checked} 
                                onChange={() => onToggleItem(item.id)}
                                className="w-4 h-4 rounded border-border text-green focus:ring-green cursor-pointer"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className={`font-bold truncate text-[12px] ${item.checked ? 'text-muted line-through' : 'text-ink'}`}>
                                    {item.name}
                                </span>
                                <span className="label-small text-[8px]">{item.category}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onDeleteItem(item.id)}
                            className="text-muted hover:text-red p-1 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShoppingList;
