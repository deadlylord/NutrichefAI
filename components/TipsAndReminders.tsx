import React from 'react';
import { LightBulbIcon, SparklesIcon } from './IconComponents';

interface TipsAndRemindersProps {
    tips: string[];
    isLoading: boolean;
    onGenerate: () => void;
}

const TipsAndReminders: React.FC<TipsAndRemindersProps> = ({ tips, isLoading, onGenerate }) => {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-3xl shadow-md text-center">
                <div className="flex justify-center items-center gap-2">
                    <LightBulbIcon />
                    <h2 className="text-2xl font-bold text-gray-800">Consejos de Salud y Bienestar</h2>
                </div>
                <p className="text-gray-600 mt-2">
                    Recibe consejos generados por IA para mejorar tu alimentación y estilo de vida.
                </p>
                <div className="mt-6">
                    <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-green-300"
                    >
                        <SparklesIcon />
                        <span className="ml-2">
                            {isLoading ? 'Generando...' : 'Generar Nuevos Consejos'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {isLoading && tips.length === 0 ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="w-12 h-12 border-4 border-t-4 border-t-green-500 border-gray-200 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tips.map((tip, index) => (
                            <div
                                key={index}
                                className="bg-white p-4 rounded-xl shadow-md flex items-start gap-4 animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex-shrink-0 h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <LightBulbIcon />
                                </div>
                                <p className="text-gray-700">{tip}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TipsAndReminders;