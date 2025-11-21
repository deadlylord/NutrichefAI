import React from 'react';
import { AnalysisResult, Ingredient } from '../types';
import { ClockIcon, BookOpenIcon, SparklesIcon } from './IconComponents';

interface AnalysisDisplayProps {
  result: AnalysisResult | null;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  if (!result) return null;

  // Group ingredients by category
  const groupedIngredients = result.identifiedIngredients.reduce((acc, item) => {
    const category = item.category || 'Otros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] animate-fade-in border border-slate-50">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <SparklesIcon /> <span className="ml-2">Tu Inventario</span>
            </h2>
            <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {result.identifiedIngredients.length} productos
            </span>
        </div>

        <div className="space-y-6">
            {Object.entries(groupedIngredients).map(([category, items]) => (
                <div key={category}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">{category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(items as Ingredient[]).map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:bg-green-50/50 transition-colors group">
                                <span className="font-medium text-slate-700 capitalize text-sm truncate mr-2">{item.name}</span>
                                <div className="flex-shrink-0 flex items-center text-[10px] text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm group-hover:text-green-700">
                                    <ClockIcon />
                                    <span className="ml-1 whitespace-nowrap">{item.spoilageTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] animate-fade-in border border-slate-50" style={{animationDelay: '150ms'}}>
        <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center border-b border-slate-100 pb-4">
            <BookOpenIcon /> <span className="ml-2">Ideas para Cocinar</span>
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {result.recipeSuggestions.map((recipe, index) => (
            <div key={index} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-slate-50/30 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800">{recipe.title}</h3>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed flex-grow">{recipe.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                  {recipe.ingredientsUsed.map((ing, i) => (
                    <span key={i} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                      {ing}
                    </span>
                  ))}
              </div>

              <details className="mt-4 group">
                <summary className="cursor-pointer text-sm font-semibold text-green-700 hover:text-green-800 flex items-center w-fit px-3 py-1.5 bg-green-50 rounded-lg transition-colors">
                    <span>Ver paso a paso</span>
                    <svg className="w-4 h-4 ml-1 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="mt-3 text-slate-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-slate-100 whitespace-pre-wrap shadow-sm">
                    {recipe.instructions}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};