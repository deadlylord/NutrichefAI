import React from 'react';
import type { ExpiringItem } from '../types';

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

interface SpoilageAlertsProps {
    items: ExpiringItem[];
}

const SpoilageAlerts: React.FC<SpoilageAlertsProps> = ({ items }) => {
    if (items.length === 0) {
        return null;
    }

    const getDaysLeftText = (days: number) => {
        if (days === 0) return <span className="font-bold text-red-600">¡Vence hoy!</span>;
        if (days === 1) return <span className="font-bold text-orange-600">Vence mañana</span>;
        return `Vence en ${days} días`;
    };

    return (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-3xl shadow-md animate-fade-in">
            <div className="flex items-start">
                <div className="text-amber-500 mt-0.5">
                    <AlertIcon />
                </div>
                <div className="ml-3">
                    <h3 className="font-bold text-lg">Frutas y Verduras por Vencer</h3>
                    <p className="mt-1 text-sm text-amber-800">
                        Prioriza el uso de estas frutas y verduras para evitar el desperdicio. Las fechas son estimadas.
                    </p>
                    <ul className="mt-3 list-disc list-inside space-y-1 text-amber-800">
                        {items.map((item, index) => (
                            <li key={index} className="capitalize">
                                {item.name}: {getDaysLeftText(item.daysLeft)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SpoilageAlerts;