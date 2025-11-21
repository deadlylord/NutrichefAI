import React from 'react';
import { ComplementarySuggestion } from '../types';
import { ShoppingCartIcon } from './IconComponents';

interface ComplementarySuggestionsDisplayProps {
    suggestions: ComplementarySuggestion[];
}

const ComplementarySuggestionsDisplay: React.FC<ComplementarySuggestionsDisplayProps> = ({ suggestions }) => {
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
                {suggestions.map((item, index) => (
                    <div key={index} className="bg-green-50/70 border border-green-100 rounded-xl p-4">
                        <h3 className="font-bold text-green-800">{item.productName}</h3>
                        <p className="text-sm text-green-700 mt-2">{item.reason}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComplementarySuggestionsDisplay;