
import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { UserPlusIcon, TrashIcon, PencilIcon } from './IconComponents';

interface FamilyManagerProps {
    family: FamilyMember[];
    onAddMember: (memberData: Omit<FamilyMember, 'id' | 'dailyRequirements'>) => Promise<void>;
    onRemoveMember: (id: string) => void;
    onUpdateMember: (id: string, memberData: Omit<FamilyMember, 'id' | 'dailyRequirements'>) => Promise<void>;
}

const GENDER_OPTIONS = [
    { value: 'female', label: 'Mujer' },
    { value: 'male', label: 'Hombre' },
    { value: 'other', label: 'Otro' }
];

const ACTIVITY_OPTIONS = [
    { value: 'sedentary', label: 'Sedentario' },
    { value: 'lightly_active', label: 'Ligero' },
    { value: 'moderately_active', label: 'Moderado' },
    { value: 'very_active', label: 'Activo' },
    { value: 'extra_active', label: 'Muy Activo' }
];

const GOAL_OPTIONS = [
    { value: 'maintain_weight', label: 'Mantener' },
    { value: 'lose_weight', label: 'Bajar Peso' },
    { value: 'gain_muscle', label: 'Ganar Músculo' },
    { value: 'healthy_growth', label: 'Crecimiento' }
];

const FamilyManager: React.FC<FamilyManagerProps> = ({ family, onAddMember, onRemoveMember, onUpdateMember }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
    const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'>('lightly_active');
    const [goal, setGoal] = useState<'lose_weight' | 'maintain_weight' | 'gain_muscle' | 'healthy_growth'>('maintain_weight');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const resetForm = () => {
        setName('');
        setAge('');
        setGender('female');
        setActivityLevel('lightly_active');
        setGoal('maintain_weight');
        setEditingId(null);
        setError('');
    };

    const handleEditClick = (member: FamilyMember) => {
        setEditingId(member.id);
        setName(member.name);
        setAge(member.age);
        setGender(member.gender);
        setActivityLevel(member.activityLevel);
        setGoal(member.goal);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || age === '' || age < 0) {
            setError('Por favor, completa el nombre y la edad correctamente.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            const memberGoal = age < 2 && goal !== 'healthy_growth' ? 'healthy_growth' : goal;
            
            if (editingId) {
                await onUpdateMember(editingId, { name, age, gender, activityLevel, goal: memberGoal });
            } else {
                await onAddMember({ name, age, gender, activityLevel, goal: memberGoal });
            }
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudieron calcular los requerimientos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-50">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    {editingId ? <PencilIcon /> : <UserPlusIcon />} 
                    <span className="ml-2">{editingId ? 'Editar Miembro' : 'Añadir Miembro'}</span>
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-green-500 bg-slate-50" 
                                placeholder="Ej. Juan Pérez"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Edad</label>
                            <input 
                                type="number" 
                                value={age} 
                                placeholder="0 para bebés" 
                                onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))} 
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-green-500 bg-slate-50" 
                                required 
                                min="0" 
                            />
                        </div>
                    </div>

                    {/* Gender Buttons */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Género</label>
                        <div className="flex flex-wrap gap-2">
                            {GENDER_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setGender(opt.value as any)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        gender === opt.value 
                                        ? 'bg-green-600 text-white shadow-md shadow-green-200' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Buttons */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nivel de Actividad</label>
                        <div className="flex flex-wrap gap-2">
                            {ACTIVITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setActivityLevel(opt.value as any)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        activityLevel === opt.value 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Goal Buttons */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Objetivo Nutricional</label>
                        <div className="flex flex-wrap gap-2">
                            {GOAL_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setGoal(opt.value as any)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        goal === opt.value 
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={resetForm}
                                className="px-5 py-2.5 rounded-full text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="px-8 py-2.5 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-900 disabled:bg-slate-400 transition-all shadow-lg"
                        >
                            {isLoading ? 'Procesando...' : (editingId ? 'Guardar Cambios' : 'Añadir Miembro')}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-500 text-sm mt-4 bg-red-50 p-3 rounded-xl">{error}</p>}
            </div>

            {family.length > 0 && (
                <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-50">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Tu Familia</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {family.map(member => (
                            <div key={member.id} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 flex items-center justify-between group hover:border-green-200 hover:bg-green-50/30 transition-all">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-lg text-slate-800">{member.name}</p>
                                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{member.age} años</span>
                                        <span className="text-[10px] uppercase tracking-wider bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                                            {GOAL_OPTIONS.find(g => g.value === member.goal)?.label}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 mt-2 flex flex-wrap gap-3">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-800"></span> <strong>{member.dailyRequirements.calories.toFixed(0)}</strong> kcal</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> <strong>{member.dailyRequirements.protein.toFixed(0)}g</strong> Prot</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> <strong>{member.dailyRequirements.carbs.toFixed(0)}g</strong> Carb</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> <strong>{member.dailyRequirements.fat.toFixed(0)}g</strong> Grasa</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEditClick(member)}
                                        className="p-2.5 rounded-xl bg-white text-slate-400 border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all"
                                        title="Editar miembro"
                                    >
                                        <PencilIcon />
                                    </button>
                                    <button 
                                        onClick={() => onRemoveMember(member.id)} 
                                        className="p-2.5 rounded-xl bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-300 hover:shadow-sm transition-all"
                                        title="Eliminar miembro"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyManager;
