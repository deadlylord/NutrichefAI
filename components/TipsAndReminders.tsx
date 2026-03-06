import React from 'react';
import { LightBulbIcon, SparklesIcon } from './IconComponents';

interface TipsAndRemindersProps {
    tips: string[];
    isLoading: boolean;
    onGenerate: () => void;
}

const TipsAndReminders: React.FC<TipsAndRemindersProps> = ({ tips, isLoading, onGenerate }) => {
    return (
        <div className="max-w-3xl mx-auto animate-slide-up">
            <div className="card-base p-8 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <LightBulbIcon className="w-6 h-6 text-green" />
                    <h2 className="text-2xl font-black text-ink italic">Consejos de <span className="text-green">Bienestar</span></h2>
                </div>
                <p className="text-muted text-sm max-w-md mx-auto">
                    Recibe consejos generados por IA para mejorar tu alimentación y estilo de vida familiar.
                </p>
                <div className="mt-8">
                    <button
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="btn-primary px-8 py-3 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        <span>
                            {isLoading ? 'Generando...' : 'Generar Nuevos Consejos'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-10">
                {isLoading && tips.length === 0 ? (
                    <div className="flex justify-center items-center p-12">
                        <div className="w-10 h-10 border-4 border-t-4 border-t-green border-warm rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tips.map((tip, index) => (
                            <div
                                key={index}
                                className="card-base p-5 flex items-start gap-4 animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex-shrink-0 h-10 w-10 bg-green-light text-green rounded-full flex items-center justify-center">
                                    <LightBulbIcon className="w-5 h-5" />
                                </div>
                                <p className="text-ink text-sm leading-relaxed font-bold">{tip}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TipsAndReminders;