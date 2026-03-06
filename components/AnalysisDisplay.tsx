
import React from 'react';
import { AnalysisResult, Ingredient } from '../types';
import { ClockIcon, BookOpenIcon, SparklesIcon, YouTubeIcon } from './IconComponents';

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

  const openYouTube = (query: string) => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="card-base p-5 md:p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
            <h2 className="text-lg font-black text-ink flex items-center italic">
            <SparklesIcon /> <span className="ml-2">Inventario</span>
            </h2>
            <span className="badge bg-green-light text-green">
                {result.identifiedIngredients.length} productos
            </span>
        </div>

        <div className="space-y-5">
            {Object.entries(groupedIngredients).map(([category, items]) => (
                <div key={category}>
                    <h3 className="label-small mb-2 ml-1">{category}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {(items as Ingredient[]).map((item, index) => (
                            <div key={index} className="flex flex-col p-2.5 rounded-xl bg-warm border border-transparent hover:border-green-mid hover:bg-white transition-all group">
                                <span className="font-bold text-ink capitalize text-[11px] truncate mb-1">{item.name}</span>
                                <div className="flex items-center text-[9px] text-muted">
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

      <div className="card-base p-5 md:p-6 animate-slide-up" style={{animationDelay: '150ms'}}>
        <h2 className="text-lg font-black mb-5 text-ink flex items-center border-b border-border pb-3 italic">
            <BookOpenIcon /> <span className="ml-2">Ideas de Recetas</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.recipeSuggestions.map((recipe, index) => (
            <div key={index} className="border border-border rounded-2xl p-4 bg-paper flex flex-col hover:bg-white hover:shadow-card transition-all group">
              <h3 className="text-sm font-black text-ink">{recipe.title}</h3>
              <p className="text-muted mt-1 text-[11px] leading-relaxed flex-grow line-clamp-2 group-hover:line-clamp-none">{recipe.description}</p>
              
              <div className="mt-3 flex flex-wrap gap-1">
                  {recipe.ingredientsUsed.slice(0, 3).map((ing, i) => (
                    <span key={i} className="bg-warm text-muted text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {ing}
                    </span>
                  ))}
                  {recipe.ingredientsUsed.length > 3 && (
                    <span className="text-[9px] text-muted px-1">+{recipe.ingredientsUsed.length - 3}</span>
                  )}
              </div>

              <div className="mt-3 flex gap-2">
                  <details className="group flex-grow">
                    <summary className="cursor-pointer text-[11px] font-black text-green hover:opacity-80 flex items-center w-fit px-2.5 py-1 bg-green-light rounded-lg transition-colors uppercase tracking-wider">
                        <span>Pasos</span>
                        <svg className="w-3 h-3 ml-1 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div className="mt-2 text-ink text-[11px] leading-relaxed bg-white p-3 rounded-xl border border-border whitespace-pre-wrap shadow-sm">
                        {recipe.instructions}
                    </div>
                  </details>

                  {recipe.youtubeQuery && (
                      <button 
                        onClick={() => openYouTube(recipe.youtubeQuery || recipe.title)}
                        className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 bg-red-light text-red hover:opacity-80 rounded-lg text-[11px] font-black transition-colors uppercase tracking-wider"
                      >
                          <YouTubeIcon />
                          <span>Video</span>
                      </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
