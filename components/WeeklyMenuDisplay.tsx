
import React, { useState } from 'react';
import { WeeklyMealPlan, Meal, DailyMeal, FamilyMember, ExtraFoodItem } from '../types';
import { CalendarIcon, SparklesIcon, WaterDropIcon, BookOpenIcon, PlusCircleIcon, CheckCircleIcon, TrashIcon } from './IconComponents';
import ProgressBar from './ProgressBar';

interface WeeklyMenuDisplayProps {
  menu: WeeklyMealPlan | null;
  family: FamilyMember[];
  onGenerateImage: (dayKey: keyof WeeklyMealPlan, mealKey: keyof Omit<DailyMeal, 'waterIntakeLiters'>) => void;
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
        </svg>
    </div>
);

const ImageLoadingSpinner = () => (
    <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-t-2xl">
        <div className="w-8 h-8 border-2 border-t-2 border-t-green-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
);

// --- Meal Card Component ---
const MealCard: React.FC<{ 
    meal: Meal, 
    mealType: string, 
    day: string,
    isConsumed: boolean,
    onToggle: () => void,
    onGenerate: () => void 
}> = ({ meal, mealType, day, isConsumed, onToggle, onGenerate }) => (
    <div className={`rounded-2xl shadow-md overflow-hidden flex flex-col transition-all duration-300 ${isConsumed ? 'bg-green-50 border-2 border-green-300 shadow-green-100' : 'bg-white border border-transparent hover:shadow-lg'}`}>
        <div className="relative group">
            {meal.isImageLoading ? <ImageLoadingSpinner /> : (
                meal.imageUrl ? 
                    <img src={meal.imageUrl} alt={meal.name} className={`w-full h-32 object-cover ${isConsumed ? 'opacity-70 grayscale-[0.3]' : ''}`} /> :
                    <ImagePlaceholder />
            )}
             {!meal.imageUrl && !meal.isImageLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
                    <button
                        onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                        className="inline-flex items-center px-3 py-1.5 bg-white text-gray-800 font-semibold rounded-full hover:bg-green-100 text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <SparklesIcon /> <span className="ml-1">Generar Imagen</span>
                    </button>
                </div>
            )}
            
            {/* Checkbox Overlay */}
            <button 
                onClick={onToggle}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isConsumed ? 'bg-green-500 text-white scale-110' : 'bg-white text-gray-300 hover:text-green-400'}`}
            >
                <CheckCircleIcon />
            </button>
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
            <h4 className={`font-bold text-sm ${isConsumed ? 'text-green-800' : 'text-green-600'}`}>{mealType}</h4>
            <p className={`font-semibold flex-grow my-1 text-base ${isConsumed ? 'text-green-900 line-through decoration-green-500/50' : 'text-gray-800'}`}>{meal.name}</p>
            
            <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p><span className="font-bold text-lg text-black">{meal.calories}</span> kcal</p>
                <div className="flex justify-between font-medium text-gray-600">
                    <span><span className="font-bold text-red-500">{meal.protein}g</span> P</span>
                    <span><span className="font-bold text-green-500">{meal.carbs}g</span> C</span>
                    <span><span className="font-bold text-blue-500">{meal.fat}g</span> F</span>
                </div>
            </div>

            {(meal.instructions || meal.micronutrients) && (
                <div className="pt-2 mt-2 border-t border-gray-100">
                    {meal.instructions && (
                        <details className="mt-1 text-xs">
                            <summary className="cursor-pointer text-gray-500 font-semibold hover:text-gray-800 flex items-center">
                                <BookOpenIcon />
                                <span className="ml-1.5">Preparación</span>
                            </summary>
                            <div className="prose prose-sm mt-2 text-gray-700 whitespace-pre-wrap p-2 bg-gray-50/70 rounded-md">
                                {meal.instructions}
                            </div>
                        </details>
                    )}
                </div>
            )}
        </div>
    </div>
);

// --- Extra Food Input ---
const ExtraFoodInput: React.FC<{ onAdd: (food: ExtraFoodItem) => void }> = ({ onAdd }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [cals, setCals] = useState(0);
    const [prot, setProt] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fat, setFat] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name) {
            onAdd({
                id: Date.now().toString(),
                name,
                calories: cals,
                protein: prot,
                carbs,
                fat
            });
            setName(''); setCals(0); setProt(0); setCarbs(0); setFat(0);
            setIsOpen(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="mt-4 flex items-center text-sm font-medium text-green-600 hover:text-green-800 bg-white border border-green-200 hover:bg-green-50 px-4 py-2 rounded-full transition-colors shadow-sm"
            >
                <PlusCircleIcon />
                <span className="ml-2">Agregar comida adicional</span>
            </button>
        );
    }

    return (
        <div className="mt-4 bg-white p-4 rounded-xl border border-green-200 shadow-sm">
            <h4 className="font-bold text-gray-800 text-sm mb-2">Registrar Alimento Extra</h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <input 
                    type="text" 
                    placeholder="Alimento (ej. Galleta)" 
                    className="col-span-2 sm:col-span-2 rounded-lg border-gray-300 text-sm p-2" 
                    value={name} onChange={e => setName(e.target.value)} required 
                />
                <input type="number" placeholder="Kcal" className="rounded-lg border-gray-300 text-sm p-2" value={cals || ''} onChange={e => setCals(Number(e.target.value))} />
                <input type="number" placeholder="Prot (g)" className="rounded-lg border-gray-300 text-sm p-2" value={prot || ''} onChange={e => setProt(Number(e.target.value))} />
                <input type="number" placeholder="Carb (g)" className="rounded-lg border-gray-300 text-sm p-2" value={carbs || ''} onChange={e => setCarbs(Number(e.target.value))} />
                <input type="number" placeholder="Grasa (g)" className="rounded-lg border-gray-300 text-sm p-2" value={fat || ''} onChange={e => setFat(Number(e.target.value))} />
                
                <div className="col-span-2 sm:col-span-5 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 text-xs font-semibold px-3 py-1.5">Cancelar</button>
                    <button type="submit" className="bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-green-700">Agregar</button>
                </div>
            </form>
        </div>
    );
};

// --- Daily Family Summary (Projected) ---
const DailyFamilySummary: React.FC<{
    family: FamilyMember[],
    plannedMacros: { calories: number, protein: number, carbs: number, fat: number }
}> = ({ family, plannedMacros }) => {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2 text-lg">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Análisis de Cobertura Familiar
            </h4>
            <p className="text-xs text-gray-500 mb-4">
                Proyección basada en el menú completo del día. Ajusta la ración de cada persona según la sugerencia.
            </p>
            <div className="space-y-5">
                {family.map(member => {
                    // Calculate Portion Multiplier based on Calories
                    // Assume the "Base Plan" is 1 portion. How many portions does this member need?
                    const portionMultiplier = plannedMacros.calories > 0 
                        ? member.dailyRequirements.calories / plannedMacros.calories 
                        : 1;
                    
                    const projected = {
                        protein: plannedMacros.protein * portionMultiplier,
                        carbs: plannedMacros.carbs * portionMultiplier,
                        fat: plannedMacros.fat * portionMultiplier
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
                                    <span className="text-[10px] text-gray-400">ración sugerida</span>
                                </div>
                            </div>
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
      
      // Add meals
      mealTypes.forEach(type => {
          if (!onlyConsumed || consumedMeals.has(`${day}-${type}`)) {
              const meal = menu[day as keyof WeeklyMealPlan][type] as Meal;
              total.calories += meal.calories;
              total.protein += meal.protein;
              total.carbs += meal.carbs;
              total.fat += meal.fat;
          }
      });

      // Add extra foods (Assume extras are part of the daily nutrition plan if they exist)
      const extras = extraFoods[day] || [];
      extras.forEach(extra => {
          total.calories += extra.calories;
          total.protein += extra.protein;
          total.carbs += extra.carbs;
          total.fat += extra.fat;
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
                const plannedTotal = calculateDailyTotal(day, false);
                const extras = extraFoods[day] || [];

                // Calculate general progress for the summary bar based on the FIRST family member as a proxy for "General Completion"
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
                                        <span className="text-[10px] text-gray-400 font-medium text-center">Progreso del día</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full w-fit">
                                    <WaterDropIcon />
                                    <span>{menu[day].waterIntakeLiters.toFixed(1)} L</span>
                                </div>
                                <div className="w-5 h-5 text-gray-500 transform transition-transform duration-300 group-open:rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                        </summary>
                        <div className="p-4 border-t border-gray-200">
                            {family.length > 0 && (
                                <DailyFamilySummary family={family} plannedMacros={plannedTotal} />
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <MealCard 
                                    meal={menu[day].breakfast} 
                                    mealType="Desayuno" 
                                    day={day}
                                    isConsumed={consumedMeals.has(`${day}-breakfast`)}
                                    onToggle={() => onToggleMeal(day, 'breakfast')}
                                    onGenerate={() => onGenerateImage(day, 'breakfast')} 
                                />
                                <MealCard 
                                    meal={menu[day].morningSnack} 
                                    mealType="Snack Mañana" 
                                    day={day}
                                    isConsumed={consumedMeals.has(`${day}-morningSnack`)}
                                    onToggle={() => onToggleMeal(day, 'morningSnack')}
                                    onGenerate={() => onGenerateImage(day, 'morningSnack')} 
                                />
                                <MealCard 
                                    meal={menu[day].lunch} 
                                    mealType="Almuerzo" 
                                    day={day}
                                    isConsumed={consumedMeals.has(`${day}-lunch`)}
                                    onToggle={() => onToggleMeal(day, 'lunch')}
                                    onGenerate={() => onGenerateImage(day, 'lunch')} 
                                />
                                <MealCard 
                                    meal={menu[day].afternoonSnack} 
                                    mealType="Snack Tarde" 
                                    day={day}
                                    isConsumed={consumedMeals.has(`${day}-afternoonSnack`)}
                                    onToggle={() => onToggleMeal(day, 'afternoonSnack')}
                                    onGenerate={() => onGenerateImage(day, 'afternoonSnack')} 
                                />
                                <MealCard 
                                    meal={menu[day].dinner} 
                                    mealType="Cena" 
                                    day={day}
                                    isConsumed={consumedMeals.has(`${day}-dinner`)}
                                    onToggle={() => onToggleMeal(day, 'dinner')}
                                    onGenerate={() => onGenerateImage(day, 'dinner')} 
                                />
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                {extras.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-bold text-gray-700 text-sm mb-2">Extras Consumidos (Global):</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {extras.map(item => (
                                                <span key={item.id} className="inline-flex items-center bg-orange-50 border border-orange-200 text-orange-800 text-xs px-2 py-1 rounded-lg">
                                                    {item.name} ({item.calories} kcal)
                                                    <button onClick={() => onRemoveExtra(day, item.id)} className="ml-2 text-orange-600 hover:text-red-600">
                                                        <TrashIcon />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <ExtraFoodInput onAdd={(food) => onAddExtra(day, food)} />
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
