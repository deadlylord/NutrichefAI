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
        if (days === 0) return <span className="font-black text-red italic">¡Vence hoy!</span>;
        if (days === 1) return <span className="font-black text-orange italic">Vence mañana</span>;
        return `Vence en ${days} días`;
    };

    return (
        <div className="bg-orange-light border border-orange/20 text-ink p-6 rounded-[2rem] shadow-sm animate-slide-up">
            <div className="flex items-start gap-4">
                <div className="text-orange bg-white p-2 rounded-xl shadow-sm">
                    <AlertIcon />
                </div>
                <div className="flex-1">
                    <h3 className="font-black text-lg italic text-ink">Frutas y Verduras por <span className="text-orange">Vencer</span></h3>
                    <p className="mt-1 text-[11px] text-muted font-bold leading-relaxed">
                        Prioriza el uso de estos alimentos para evitar el desperdicio. Las fechas son estimadas por IA.
                    </p>
                    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 bg-white/50 p-2 rounded-xl border border-orange/10 text-[11px] font-bold text-ink capitalize">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange"></span>
                                <span className="flex-1">{item.name}</span>
                                <span className="text-[10px] uppercase tracking-wider opacity-80">{getDaysLeftText(item.daysLeft)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SpoilageAlerts;