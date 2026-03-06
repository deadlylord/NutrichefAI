
import React from 'react';
import type { PurchaseRecord } from '../types';
import { RefreshIcon, TrashIcon } from './IconComponents';

interface PurchaseHistoryDisplayProps {
    history: PurchaseRecord[];
    onReuse: (record: PurchaseRecord) => void;
    onDelete: (recordId: string) => void;
}

const PurchaseHistoryDisplay: React.FC<PurchaseHistoryDisplayProps> = ({ history, onReuse, onDelete }) => {
    return (
        <div className="card-base p-5">
            <h2 className="text-sm font-black mb-4 text-ink uppercase tracking-widest flex items-center italic">
                <span className="mr-2">🕒</span> Historial
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map(record => (
                    <div key={record.id} className="border border-border rounded-2xl p-3 bg-paper hover:bg-white hover:shadow-card transition-all group">
                        <div className="flex justify-between items-center mb-1">
                            <span className="label-small">
                                {new Date(record.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onReuse(record)}
                                    className="p-1.5 text-green hover:bg-green-light rounded-lg transition-colors"
                                    title="Reutilizar"
                                >
                                    <RefreshIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(record.id)}
                                    className="p-1.5 text-muted hover:text-red rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {record.ingredients.slice(0, 4).map(ing => (
                                <span key={ing.name} className="bg-warm text-[9px] font-bold text-muted px-2 py-0.5 rounded-full capitalize">
                                    {ing.name}
                                </span>
                            ))}
                            {record.ingredients.length > 4 && (
                                <span className="text-[9px] text-muted px-1">+{record.ingredients.length - 4}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PurchaseHistoryDisplay;
