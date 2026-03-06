
import React, { useState } from 'react';
import { WeeklyMealPlan, Meal, DailyMeal, FamilyMember, ExtraFoodItem } from '../types';
import { CalendarIcon, SparklesIcon, WaterDropIcon, BookOpenIcon, PlusCircleIcon, CheckCircleIcon, TrashIcon, CameraIcon, YouTubeIcon, LeafIcon, AppleIcon, MeatIcon } from './IconComponents';
import ProgressBar from './ProgressBar';
import { searchFoodDatabase } from '../services/geminiService';

interface WeeklyMenuDisplayProps {
  menu: WeeklyMealPlan | null;
  family: FamilyMember[];
  onGenerateImage: (dayKey: keyof WeeklyMealPlan, mealKey: keyof Omit<DailyMeal, 'waterIntakeLiters'>) => void;
  onSearchImage: (dayKey: keyof WeeklyMealPlan, mealKey: keyof Omit<DailyMeal, 'waterIntakeLiters'>) => void;
  consumedMeals: Set<string>;
  onToggleMeal: (day: string, mealType: string) => void;
  extraFoods: Record<string, ExtraFoodItem[]>;
  onAddExtra: (day: string, food: ExtraFoodItem) => void;
  onRemoveExtra: (day: string, foodId: string) => void;
}

const dayTranslations: { [key: string]: string } = {
    sunday: 'Domingo',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
};

const ImagePlaceholder = () => (
    <div className="w-full h-32 bg-gray-100 flex flex-col items-center justify-center text-center p-2 rounded-t-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
        </svg>
        <span className="text-xs text-gray-400">Sin imagen</span>
    </div>
);

const ImageLoadingSpinner = () => (
    <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-t-2xl">
        <div className="w-8 h-8 border-2 border-t-2 border-t-green-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
);

const BalanceIndicator: React.FC<{ type: 'veg' | 'fruit' | 'prot', level?: 'high' | 'medium' | 'low' }> = ({ type, level }) => {
    if (!level) return null;
    
    let Icon = LeafIcon;
    let colorClass = 'text-gray-400 bg-gray-100 border-gray-200';
    let label = '';
    let shortLabel = '';

    if (type === 'veg') {
        Icon = LeafIcon;
        label = 'Verduras';
        shortLabel = 'Veg';
        if (level === 'high') colorClass = 'text-green-700 bg-green-100 border-green-200';
        else if (level === 'medium') colorClass = 'text-green-600 bg-green-50 border-green-100';
    } else if (type === 'fruit') {
        Icon = AppleIcon;
        label = 'Frutas';
        shortLabel = 'Fruit';
        if (level === 'high') colorClass = 'text-red-700 bg-red-100 border-red-200';
        else if (level === 'medium') colorClass = 'text-red-600 bg-red-50 border-red-100';
    } else {
        Icon = MeatIcon;
        label = 'Proteína';
        shortLabel = 'Prot';
        if (level === 'high') colorClass = 'text-orange-700 bg-orange-100 border-orange-200';
        else if (level === 'medium') colorClass = 'text-orange-600 bg-orange-50 border-orange-100';
    }

    const levelText = level === 'high' ? 'Alto' : level === 'medium' ? 'Medio' : 'Bajo';

    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${colorClass}`} title={`${label}: ${levelText}`}>
            <Icon />
            <div className="flex flex-col leading-none">
                 <span className="text-[8px] uppercase opacity-70 font-bold">{shortLabel}</span>
                 <span className="text-[10px] font-bold uppercase">{levelText}</span>
            </div>
        </div>
    );
};

const DailyBalanceOverview: React.FC<{ menu: DailyMeal }> = ({ menu }) => {
    const calculateOverall = (category: 'vegetables' | 'fruits' | 'protein') => {
        const meals = [menu.breakfast, menu.morningSnack, menu.lunch, menu.afternoonSnack, menu.dinner];
        let totalScore = 0;
        let count = 0;
        const map = { high: 3, medium: 2, low: 1 };

        meals.forEach(meal => {
            if (meal && meal.foodBalance && meal.foodBalance[category]) {
                const val = meal.foodBalance[category];
                if (val) {
                    totalScore += map[val as keyof typeof map] || 0;
                    count++;
                }
            }
        });

        if (count === 0) return { label: '-', color: 'text-gray-400 bg-gray-50 border-gray-200' };
        const avg = totalScore / count;
        
        if (avg >= 2.3) return { label: 'Alto', color: 'text-green-700 bg-green-100 border-green-200' };
        if (avg >= 1.6) return { label: 'Medio', color: 'text-yellow-700 bg-yellow-100 border-yellow-200' };
        return { label: 'Bajo', color: 'text-red-700 bg-red-100 border-red-200' };
    };

    const veg = calculateOverall('vegetables');
    const fruit = calculateOverall('fruits');
    const prot = calculateOverall('protein');

    // Only render if we have data (count > 0 implied by label !== '-')
    if (veg.label === '-' && fruit.label === '-' && prot.label === '-') return null;

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <SparklesIcon /> Balance Nutricional del Día
            </h4>
            <div className="grid grid-cols-3 gap-3">
                <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${veg.color}`}>
                    <LeafIcon /> 
                    <span className="text-[10px] uppercase font-bold opacity-70 mt-1">Verduras</span>
                    <span className="text-sm font-bold">{veg.label}</span>
                </div>
                <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${fruit.color}`}>
                    <AppleIcon />
                    <span className="text-[10px] uppercase font-bold opacity-70 mt-1">Frutas</span>
                    <span className="text-sm font-bold">{fruit.label}</span>
                </div>
                <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${prot.color}`}>
                    <MeatIcon />
                    <span className="text-[10px] uppercase font-bold opacity-70 mt-1">Proteína</span>
                    <span className="text-sm font-bold">{prot.label}</span>
                </div>
            </div>
        </div>
    );
};

// --- Meal Card Component ---
const MealCard: React.FC<{ 
    meal: Meal, 
    mealType: string, 
    day: string,
    isConsumed: boolean,
    onToggle: () => void,
    onGenerate: () => void,
    onSearch: () => void
}> = ({ meal, mealType, day, isConsumed, onToggle, onGenerate, onSearch }) => {
    
    const openYouTube = () => {
        const query = meal.youtubeQuery || `Receta ${meal.name} Colombiana`;
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
    };

    return (
        <div className={`rounded-2xl shadow-md overflow-hidden flex flex-col transition-all duration-300 ${isConsumed ? 'bg-green-50 border-2 border-green-300 shadow-green-100' : 'bg-white border border-transparent hover:shadow-lg'}`}>
            <div className="relative group min-h-[128px]">
                {meal.isImageLoading ? <ImageLoadingSpinner /> : (
                    meal.imageUrl ? 
                        <img src={meal.imageUrl} alt={meal.name} className={`w-full h-32 object-cover ${isConsumed ? 'opacity-70 grayscale-[0.3]' : ''}`} /> :
                        <ImagePlaceholder />
                )}
                
                {/* Action Buttons Overlay */}
                {!meal.isImageLoading && (
                    <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${meal.imageUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSearch(); }}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white text-gray-800 font-bold rounded-full hover:bg-green-50 text-xs shadow-md transform hover:scale-105 transition-all w-32 justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>Buscar Foto</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 text-xs shadow-md transform hover:scale-105 transition-all w-32 justify-center"
                        >
                            <SparklesIcon />
                            <span>Generar IA</span>
                        </button>
                    </div>
                )}
                
                {/* Checkbox Overlay */}
                <button 
                    onClick={onToggle}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${isConsumed ? 'bg-green-500 text-white scale-110' : 'bg-white text-gray-300 hover:text-green-400'}`}
                >
                    <CheckCircleIcon />
                </button>
            </div>
            
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h4 className={`font-bold text-xs uppercase tracking-wider ${isConsumed ? 'text-green-800' : 'text-green-600'}`}>{mealType}</h4>
                    <button 
                        onClick={(e) => { e.stopPropagation(); openYouTube(); }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition-colors flex items-center gap-1"
                        title="Ver receta en YouTube"
                    >
                        <YouTubeIcon />
                    </button>
                </div>
                
                <p className={`font-bold flex-grow mb-3 text-sm leading-tight ${isConsumed ? 'text-green-900 line-through decoration-green-500/50' : 'text-gray-800'}`}>{meal.name}</p>
                
                {/* Balance Indicators Row */}
                <div className="flex flex-wrap gap-1 mb-3">
                    <BalanceIndicator type="veg" level={meal.foodBalance?.vegetables} />
                    <BalanceIndicator type="fruit" level={meal.foodBalance?.fruits} />
                    <BalanceIndicator type="prot" level={meal.foodBalance?.protein} />
                </div>

                <div className="mt-auto text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="font-bold text-base text-slate-800">{meal.calories} <span className="text-[10px] text-gray-400 font-normal">kcal</span></span>
                    </div>
                    <div className="flex justify-between font-medium text-[10px] text-gray-500">
                        <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">{meal.protein}g P</span>
                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">{meal.carbs}g C</span>
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">{meal.fat}g G</span>
                    </div>
                </div>

                {(meal.instructions) && (
                     <div className="mt-2 pt-2 border-t border-gray-100">
                        <details className="text-xs group">
                            <summary className="cursor-pointer text-gray-500 font-semibold hover:text-gray-800 flex items-center transition-colors">
                                <BookOpenIcon />
                                <span className="ml-1.5">Ver Instrucciones</span>
                            </summary>
                            <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-gray-600 whitespace-pre-wrap leading-relaxed shadow-inner">
                                {meal.instructions}
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Agile Extra Food Menu Component ---

const QUICK_ADDS = {
    'Frutas': [
        { name: 'Manzana', cal: 52, p: 0.3, c: 14, f: 0.2 },
        { name: 'Banano', cal: 89, p: 1.1, c: 23, f: 0.3 },
        { name: 'Naranja', cal: 47, p: 0.9, c: 12, f: 0.1 },
        { name: 'Pera', cal: 57, p: 0.4, c: 15, f: 0.1 }
    ],
    'Snacks': [
        { name: 'Yogurt Griego', cal: 59, p: 10, c: 3.6, f: 0.4 },
        { name: 'Galletas (2)', cal: 100, p: 1, c: 14, f: 4 },
        { name: 'Nueces (30g)', cal: 196, p: 4, c: 4, f: 19 },
        { name: 'Chocolate (20g)', cal: 110, p: 1, c: 12, f: 6 }
    ],
    'Bebidas': [
        { name: 'Jugo Naranja', cal: 110, p: 2, c: 26, f: 0.5 },
        { name: 'Gaseosa', cal: 140, p: 0, c: 39, f: 0 },
        { name: 'Café con leche', cal: 40, p: 2, c: 4, f: 1.5 },
        { name: 'Cerveza', cal: 150, p: 1, c: 13, f: 0 }
    ],
    'Harinas': [
        { name: 'Pan Tajado', cal: 70, p: 3, c: 13, f: 1 },
        { name: 'Arepa', cal: 150, p: 3, c: 25, f: 2 },
        { name: 'Arroz (1/2 tza)', cal: 100, p: 2, c: 22, f: 0.2 }
    ]
};

const ExtraFoodInput: React.FC<{ onAdd: (food: ExtraFoodItem) => void; family: FamilyMember[] }> = ({ onAdd, family }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showQuickMenu, setShowQuickMenu] = useState(false);
    
    // Manual state
    const [name, setName] = useState('');
    const [cals, setCals] = useState(0);
    const [prot, setProt] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fat, setFat] = useState(0);
    const [assignedTo, setAssignedTo] = useState<string>('all'); // 'all' or memberId
    
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name) {
            onAdd({
                id: Date.now().toString(),
                name,
                calories: cals,
                protein: prot,
                carbs,
                fat,
                assignedTo: assignedTo === 'all' ? undefined : assignedTo
            });
            setName(''); setCals(0); setProt(0); setCarbs(0); setFat(0); setAssignedTo('all');
            setIsOpen(false);
        }
    };

    const handleQuickAdd = (item: any) => {
        onAdd({
            id: Date.now().toString() + Math.random(),
            name: item.name,
            calories: item.cal,
            protein: item.p,
            carbs: item.c,
            fat: item.f,
            assignedTo: assignedTo === 'all' ? undefined : assignedTo
        });
    };

    const handleSearch = async () => {
        if (!name) return;
        setIsSearching(true);
        setSearchResults([]);
        try {
            const results = await searchFoodDatabase(name);
            setSearchResults(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    const selectSearchResult = (item: any) => {
        setName(item.name);
        setCals(item.calories);
        setProt(item.protein);
        setCarbs(item.carbs);
        setFat(item.fat);
        setSearchResults([]);
    };

    return (
        <div className="mt-4">
            {/* Member Selection for Addition */}
             <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-gray-500">Para:</span>
                <select 
                    value={assignedTo} 
                    onChange={e => setAssignedTo(e.target.value)}
                    className="text-xs border border-gray-300 rounded-lg p-1.5 bg-white text-gray-700 focus:ring-green-500 focus:border-green-500"
                >
                    <option value="all">Toda la Familia</option>
                    {family.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button 
                    onClick={() => { setShowQuickMenu(!showQuickMenu); setIsOpen(false); }}
                    className={`flex items-center text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${showQuickMenu ? 'bg-green-600 text-white' : 'text-green-600 bg-white border border-green-200 hover:bg-green-50'}`}
                >
                    <PlusCircleIcon />
                    <span className="ml-2">Agregar Rápido</span>
                </button>
                <button 
                    onClick={() => { setIsOpen(!isOpen); setShowQuickMenu(false); }}
                    className={`flex items-center text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm ${isOpen ? 'bg-slate-800 text-white' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'}`}
                >
                    <span>Manual / Búsqueda</span>
                </button>
            </div>

            {/* Quick Menu Accordion */}
            {showQuickMenu && (
                <div className="mt-4 bg-white p-4 rounded-2xl border border-green-100 shadow-sm animate-fade-in">
                    <h4 className="font-bold text-gray-800 text-sm mb-3">
                        Selecciona para agregar a <span className="text-green-600">{assignedTo === 'all' ? 'Todos' : family.find(f => f.id === assignedTo)?.name}</span>:
                    </h4>
                    <div className="space-y-3">
                        {Object.entries(QUICK_ADDS).map(([category, items]) => (
                            <div key={category}>
                                <h5 className="text-xs font-bold text-green-700 uppercase mb-2 ml-1">{category}</h5>
                                <div className="flex flex-wrap gap-2">
                                    {items.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickAdd(item)}
                                            className="group flex items-center bg-slate-50 hover:bg-green-600 hover:text-white border border-slate-200 rounded-lg px-3 py-1.5 transition-all active:scale-95"
                                        >
                                            <span className="text-sm font-medium">{item.name}</span>
                                            <span className="ml-1 text-[10px] text-gray-400 group-hover:text-green-200">({item.cal})</span>
                                            <span className="ml-2 bg-green-100 text-green-700 group-hover:bg-white group-hover:text-green-700 rounded-full w-4 h-4 flex items-center justify-center text-xs">+</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Manual Form */}
            {isOpen && (
                <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in relative">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Registrar Alimento Personalizado</h4>
                    
                    <form onSubmit={handleManualSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="col-span-2 sm:col-span-5 relative flex gap-2">
                             <input 
                                type="text" 
                                placeholder="Alimento (ej. Proteína, Empanada)" 
                                className="flex-grow rounded-lg border-gray-300 text-sm p-2 bg-slate-50 focus:ring-2 focus:ring-green-400 outline-none" 
                                value={name} 
                                onChange={e => setName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                                required 
                            />
                            <button 
                                type="button" 
                                onClick={handleSearch}
                                disabled={isSearching || !name}
                                className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 disabled:opacity-50 flex items-center"
                                title="Buscar"
                            >
                                {isSearching ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <span className="flex items-center gap-1">🔍 Buscar</span>
                                )}
                            </button>
                        </div>
                        
                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="col-span-2 sm:col-span-5 bg-white border border-green-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                                <p className="p-2 text-[10px] bg-green-50 text-green-700 font-bold uppercase tracking-wider">Resultados Sugeridos</p>
                                {searchResults.map((res, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => selectSearchResult(res)}
                                        className="p-2 hover:bg-green-50 cursor-pointer border-b border-gray-50 flex justify-between items-center text-sm"
                                    >
                                        <div>
                                            <span className="font-bold text-gray-800 block">{res.name}</span>
                                            <span className="text-[10px] text-gray-500">{res.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{res.calories} kcal</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                       
                        <input type="number" placeholder="Kcal" className="rounded-lg border-gray-300 text-sm p-2 bg-slate-50" value={cals || ''} onChange={e => setCals(Number(e.target.value))} />
                        <input type="number" placeholder="Prot" className="rounded-lg border-gray-300 text-sm p-2 bg-slate-50" value={prot || ''} onChange={e => setProt(Number(e.target.value))} />
                        <input type="number" placeholder="Carb" className="rounded-lg border-gray-300 text-sm p-2 bg-slate-50" value={carbs || ''} onChange={e => setCarbs(Number(e.target.value))} />
                        <input type="number" placeholder="Grasa" className="rounded-lg border-gray-300 text-sm p-2 bg-slate-50" value={fat || ''} onChange={e => setFat(Number(e.target.value))} />
                        
                        <div className="col-span-2 sm:col-span-5 flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 text-xs font-semibold px-3 py-1.5">Cancelar</button>
                            <button type="submit" className="bg-green-600 text-white text-xs font-bold px-6 py-1.5 rounded-full hover:bg-green-700 shadow-lg shadow-green-100">Guardar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

// --- Daily Family Summary (Projected) ---
const DailyFamilySummary: React.FC<{
    family: FamilyMember[],
    plannedMacros: { calories: number, protein: number, carbs: number, fat: number },
    extras: ExtraFoodItem[]
}> = ({ family, plannedMacros, extras }) => {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2 text-lg">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Análisis de Cobertura Familiar
            </h4>
            <p className="text-xs text-gray-500 mb-4">
                Proyección basada en el menú del día + extras asignados.
            </p>
            <div className="space-y-5">
                {family.map(member => {
                    const portionMultiplier = plannedMacros.calories > 0 
                        ? member.dailyRequirements.calories / plannedMacros.calories 
                        : 1;
                    
                    // Filter extras for this member (assigned specifically OR shared)
                    const memberExtras = extras.filter(e => e.assignedTo === member.id || !e.assignedTo);
                    const extrasTotals = memberExtras.reduce((acc, curr) => ({
                        p: acc.p + curr.protein,
                        c: acc.c + curr.carbs,
                        f: acc.f + curr.fat
                    }), { p: 0, c: 0, f: 0 });

                    const projected = {
                        protein: (plannedMacros.protein * portionMultiplier) + extrasTotals.p,
                        carbs: (plannedMacros.carbs * portionMultiplier) + extrasTotals.c,
                        fat: (plannedMacros.fat * portionMultiplier) + extrasTotals.f
                    };

                    return (
                        <div key={member.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <span className="font-bold text-gray-800 block">{member.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
                                        Meta: {member.dailyRequirements.calories.toFixed(0)} kcal
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`block text-sm font-bold px-2 py-0.5 rounded-md ${portionMultiplier > 1.1 ? 'bg-blue-100 text-blue-700' : portionMultiplier < 0.9 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        Servir: x{portionMultiplier.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Visual List of Extras for this person */}
                            {memberExtras.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-1">
                                    {memberExtras.map(ex => (
                                        <span key={ex.id} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                            + {ex.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                <ProgressBar 
                                    label="Proteína" 
                                    color="bg-red-400" 
                                    value={projected.protein} 
                                    total={member.dailyRequirements.protein} 
                                />
                                <ProgressBar 
                                    label="Carb" 
                                    color="bg-green-400" 
                                    value={projected.carbs} 
                                    total={member.dailyRequirements.carbs} 
                                />
                                <ProgressBar 
                                    label="Grasa" 
                                    color="bg-blue-400" 
                                    value={projected.fat} 
                                    total={member.dailyRequirements.fat} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const WeeklyMenuDisplay: React.FC<WeeklyMenuDisplayProps> = ({ 
    menu, 
    family, 
    onGenerateImage,
    onSearchImage,
    consumedMeals, 
    onToggleMeal,
    extraFoods,
    onAddExtra,
    onRemoveExtra
}) => {
  if (!menu) return null;

  const weekDays = Object.keys(menu) as (keyof WeeklyMealPlan)[];
  const mealTypes: (keyof Omit<DailyMeal, 'waterIntakeLiters'>)[] = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'];

  const calculateDailyTotal = (day: string, onlyConsumed: boolean = true) => {
      let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      // Add meals (from the plan)
      mealTypes.forEach(type => {
          if (!onlyConsumed || consumedMeals.has(`${day}-${type}`)) {
              const meal = menu[day as keyof WeeklyMealPlan][type] as Meal;
              total.calories += meal.calories;
              total.protein += meal.protein;
              total.carbs += meal.carbs;
              total.fat += meal.fat;
          }
      });
      // Add SHARED extras to the generic daily total view.
      const extras = extraFoods[day] || [];
      extras.forEach(extra => {
         // Assuming unassigned extras count towards the "general" daily view
         if(!extra.assignedTo) {
            total.calories += extra.calories;
            total.protein += extra.protein;
            total.carbs += extra.carbs;
            total.fat += extra.fat;
         }
      });

      return total;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-md animate-fade-in">
         <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
            <CalendarIcon /> <span className="ml-2">Tu Menú Semanal Nutricional</span>
        </h2>
        <div className="space-y-3">
            {weekDays.map((day, index) => {
                const consumedTotal = calculateDailyTotal(day, true);
                const plannedTotal = calculateDailyTotal(day, false); // Base plan without extras
                const extras = extraFoods[day] || [];
                const dailyMenu = menu[day];

                const mainProgress = family.length > 0 
                    ? (consumedTotal.calories / family[0].dailyRequirements.calories) * 100
                    : 0;

                return (
                    <details
                        key={day}
                        className="group bg-gray-50/70 rounded-2xl open:ring-2 open:ring-green-200 transition-all duration-300"
                        open={index === 0}
                    >
                        <summary className="p-4 list-none flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-800 capitalize">{dayTranslations[day]}</h3>
                                {family.length > 0 && (
                                    <div className="hidden sm:flex gap-1 flex-col justify-center">
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full transition-all duration-500" style={{width: `${Math.min(100, mainProgress)}%`}}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full w-fit">
                                    <WaterDropIcon />
                                    <span>{dailyMenu.waterIntakeLiters.toFixed(1)} L</span>
                                </div>
                                <div className="w-5 h-5 text-gray-500 transform transition-transform duration-300 group-open:rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </summary>
                        <div className="p-4 border-t border-gray-200">
                            
                            <DailyBalanceOverview menu={dailyMenu} />

                            {family.length > 0 && (
                                <DailyFamilySummary family={family} plannedMacros={plannedTotal} extras={extras} />
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {mealTypes.map(type => (
                                    <MealCard 
                                        key={type}
                                        meal={dailyMenu[type] as Meal} 
                                        mealType={type === 'morningSnack' ? 'Snack AM' : type === 'afternoonSnack' ? 'Snack PM' : type === 'breakfast' ? 'Desayuno' : type === 'lunch' ? 'Almuerzo' : 'Cena'} 
                                        day={day}
                                        isConsumed={consumedMeals.has(`${day}-${type}`)}
                                        onToggle={() => onToggleMeal(day, type)}
                                        onGenerate={() => onGenerateImage(day, type)}
                                        onSearch={() => onSearchImage(day, type)} 
                                    />
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                {extras.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-bold text-gray-700 text-sm mb-2">Extras Agregados:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {extras.map(item => (
                                                <span key={item.id} className="inline-flex items-center bg-orange-50 border border-orange-200 text-orange-800 text-xs px-2 py-1 rounded-lg">
                                                    {item.name} ({item.calories} kcal)
                                                    {item.assignedTo && <span className="ml-1 text-[10px] text-orange-600 bg-orange-100 px-1 rounded">
                                                        {family.find(f => f.id === item.assignedTo)?.name || 'Miembro'}
                                                    </span>}
                                                    <button onClick={() => onRemoveExtra(day, item.id)} className="ml-2 text-orange-600 hover:text-red-600">
                                                        <TrashIcon />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <ExtraFoodInput onAdd={(food) => onAddExtra(day, food)} family={family} />
                            </div>
                        </div>
                    </details>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyMenuDisplay;
