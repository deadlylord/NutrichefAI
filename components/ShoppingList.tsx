
import React from 'react';
import { ShoppingListItem } from '../types';
import { ClipboardListIcon, TrashIcon } from './IconComponents';

interface ShoppingListProps {
    items: ShoppingListItem[];
    onToggleItem: (id: string) => void;
    onDeleteItem: (id: string) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onToggleItem, onDeleteItem }) => {
    if (items.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-3xl shadow-md animate-fade-in border border-slate-50 mt-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <ClipboardListIcon /> <span className="ml-2">Lista de Compras</span>
                </h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {items.length} ítems
                </span>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <input 
                                type="checkbox" 
                                checked={item.checked} 
                                onChange={() => onToggleItem(item.id)}
                                className="w-5 h-5 rounded-md border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className={`font-medium truncate text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {item.name}
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">{item.category}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onDeleteItem(item.id)}
                            className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShoppingList;
