import React from 'react';
import type { PurchaseRecord } from '../types';
import { RefreshIcon } from './IconComponents';

// Fix: Defined the props interface for the component.
interface PurchaseHistoryDisplayProps {
    history: PurchaseRecord[];
    onReuse: (record: PurchaseRecord) => void;
}

const PurchaseHistoryDisplay: React.FC<PurchaseHistoryDisplayProps> = ({ history, onReuse }) => {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Historial de Compras</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {history.map(record => (
                    <details key={record.id} className="border border-gray-100 rounded-xl p-3 hover:border-green-300 transition-colors group">
                        <summary className="font-semibold cursor-pointer text-gray-700 flex justify-between items-center">
                            <span>{new Date(record.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    onReuse(record);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-800 font-semibold px-2.5 py-1 rounded-full hover:bg-green-200"
                                title="Reutilizar esta compra para un nuevo menú"
                            >
                                <RefreshIcon />
                                Reutilizar
                            </button>
                        </summary>
                        <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {record.ingredients.map(ing => (
                                <li key={ing.name} className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-md capitalize">{ing.name}</li>
                            ))}
                        </ul>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default PurchaseHistoryDisplay;