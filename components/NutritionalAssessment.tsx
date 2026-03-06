
import React from 'react';
import { NutritionalAssessment, SuggestionItem, ShoppingListItem } from '../types';
import { ChartPieIcon, PlusCircleIcon, CheckCircleIcon } from './IconComponents';

interface NutritionalAssessmentProps {
    assessment: NutritionalAssessment;
    onAddToList: (item: SuggestionItem) => void;
    shoppingList: ShoppingListItem[];
}

const NutritionalAssessmentDisplay: React.FC<NutritionalAssessmentProps> = ({ assessment, onAddToList, shoppingList }) => {
    
    const isAdded = (itemName: string) => {
        return shoppingList.some(i => i.name === itemName);
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green bg-green-light border-green/20';
        if (score >= 5) return 'text-orange bg-orange-light border-orange/20';
        return 'text-red bg-red-light border-red/20';
    };

    return (
        <div className="card-base p-6 animate-slide-up mb-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h2 className="text-xl font-black text-ink flex items-center italic">
                    <ChartPieIcon className="w-5 h-5 mr-2" /> <span>Evaluación <span className="text-green">Nutricional</span></span>
                </h2>
                <div className={`px-4 py-1.5 rounded-full border font-black text-[10px] uppercase tracking-wider ${getScoreColor(assessment.score)}`}>
                    Score: {assessment.score}/10
                </div>
            </div>

            <p className="text-muted mb-6 italic text-sm leading-relaxed">"{assessment.summary}"</p>

            {assessment.missingGroups.length > 0 && (
                <div className="mb-8">
                    <h3 className="label-small mb-3">Grupos a reforzar</h3>
                    <div className="flex flex-wrap gap-2">
                        {assessment.missingGroups.map((group, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-light text-orange rounded-lg text-[11px] font-black border border-orange/10 uppercase tracking-wide">
                                ⚠️ {group}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="label-small mb-4">Sugerencias Estratégicas</h3>
                <div className="grid gap-3">
                    {assessment.suggestions.map((suggestion, idx) => {
                        const added = isAdded(suggestion.item);
                        return (
                            <div key={idx} className={`p-4 rounded-2xl border transition-all ${added ? 'bg-green-light border-green/20' : 'bg-paper border-border hover:border-green/40'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="font-black text-ink text-sm">{suggestion.item}</p>
                                        <p className="text-[11px] text-muted font-bold italic">{suggestion.reason}</p>
                                    </div>
                                    <button 
                                        onClick={() => onAddToList(suggestion)}
                                        className={`ml-3 p-2 rounded-xl transition-all ${added ? 'text-green bg-white shadow-sm' : 'text-muted bg-warm hover:text-green hover:bg-green-light'}`}
                                    >
                                        {added ? <CheckCircleIcon className="w-5 h-5" /> : <PlusCircleIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NutritionalAssessmentDisplay;
