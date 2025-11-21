
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
        if (score >= 8) return 'text-green-600 bg-green-100 border-green-200';
        if (score >= 5) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
        return 'text-red-600 bg-red-100 border-red-200';
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-md animate-fade-in border border-slate-50 mb-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <ChartPieIcon /> <span className="ml-2">Evaluación Nutricional</span>
                </h2>
                <div className={`px-4 py-1.5 rounded-full border font-bold text-sm ${getScoreColor(assessment.score)}`}>
                    Score: {assessment.score}/10
                </div>
            </div>

            <p className="text-slate-600 mb-4 italic">"{assessment.summary}"</p>

            {assessment.missingGroups.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Grupos a reforzar</h3>
                    <div className="flex flex-wrap gap-2">
                        {assessment.missingGroups.map((group, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100">
                                ⚠️ {group}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Sugerencias para comprar</h3>
                <div className="grid gap-3">
                    {assessment.suggestions.map((suggestion, idx) => {
                        const added = isAdded(suggestion.item);
                        return (
                            <div key={idx} className={`p-3 rounded-xl border transition-all ${added ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:border-green-300'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-800">{suggestion.item}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{suggestion.reason}</p>
                                    </div>
                                    <button 
                                        onClick={() => onAddToList(suggestion)}
                                        className={`ml-3 p-1.5 rounded-full transition-colors ${added ? 'text-green-600 bg-green-100' : 'text-slate-400 hover:text-green-600 hover:bg-slate-50'}`}
                                    >
                                        {added ? <CheckCircleIcon /> : <PlusCircleIcon />}
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
