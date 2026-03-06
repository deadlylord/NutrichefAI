
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
        <div className="space-y-8 animate-slide-up">
            <div className="card-base p-6 md:p-8">
                <h2 className="text-2xl font-black mb-8 text-ink flex items-center italic">
                    {editingId ? <PencilIcon className="w-6 h-6 mr-2" /> : <UserPlusIcon className="w-6 h-6 mr-2" />} 
                    <span>{editingId ? 'Editar Miembro' : 'Añadir Miembro'}</span>
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="label-small ml-1">Nombre Completo</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                className="w-full px-4 py-3 rounded-2xl border border-border focus:border-green focus:ring-1 focus:ring-green/20 bg-paper text-ink font-bold placeholder:text-muted/50 transition-all" 
                                placeholder="Ej. Juan Pérez"
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="label-small ml-1">Edad (Años)</label>
                            <input 
                                type="number" 
                                value={age} 
                                placeholder="0 para bebés" 
                                onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))} 
                                className="w-full px-4 py-3 rounded-2xl border border-border focus:border-green focus:ring-1 focus:ring-green/20 bg-paper text-ink font-bold placeholder:text-muted/50 transition-all" 
                                required 
                                min="0" 
                            />
                        </div>
                    </div>

                    {/* Gender Buttons */}
                    <div className="space-y-3">
                        <label className="label-small ml-1">Género</label>
                        <div className="flex flex-wrap gap-2">
                            {GENDER_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setGender(opt.value as any)}
                                    className={`px-5 py-2 rounded-full text-[11px] font-black transition-all uppercase tracking-wider ${
                                        gender === opt.value 
                                        ? 'bg-green text-paper shadow-md' 
                                        : 'bg-warm text-muted hover:bg-border/50'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity Buttons */}
                    <div className="space-y-3">
                        <label className="label-small ml-1">Nivel de Actividad</label>
                        <div className="flex flex-wrap gap-2">
                            {ACTIVITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setActivityLevel(opt.value as any)}
                                    className={`px-5 py-2 rounded-full text-[11px] font-black transition-all uppercase tracking-wider ${
                                        activityLevel === opt.value 
                                        ? 'bg-blue text-paper shadow-md' 
                                        : 'bg-warm text-muted hover:bg-border/50'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Goal Buttons */}
                    <div className="space-y-3">
                        <label className="label-small ml-1">Objetivo Nutricional</label>
                        <div className="flex flex-wrap gap-2">
                            {GOAL_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setGoal(opt.value as any)}
                                    className={`px-5 py-2 rounded-full text-[11px] font-black transition-all uppercase tracking-wider ${
                                        goal === opt.value 
                                        ? 'bg-purple text-paper shadow-md' 
                                        : 'bg-warm text-muted hover:bg-border/50'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={resetForm}
                                className="px-6 py-3 rounded-2xl text-muted font-black hover:bg-warm transition-colors uppercase tracking-widest text-[10px]"
                            >
                                Cancelar
                            </button>
                        )}
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="btn-primary px-10 py-3 disabled:opacity-50"
                        >
                            {isLoading ? 'Procesando...' : (editingId ? 'Guardar Cambios' : 'Añadir Miembro')}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red text-xs mt-4 bg-red-light p-4 rounded-2xl font-bold italic">{error}</p>}
            </div>

            {family.length > 0 && (
                <div className="card-base p-6 md:p-8">
                    <h2 className="text-2xl font-black mb-8 text-ink italic">Tu Familia</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {family.map(member => (
                            <div key={member.id} className="border border-border bg-paper rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-green-mid/30 hover:bg-white transition-all">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <p className="font-black text-xl text-ink italic">{member.name}</p>
                                        <span className="badge bg-warm text-muted">{member.age} años</span>
                                        <span className="badge bg-green-light text-green">
                                            {GOAL_OPTIONS.find(g => g.value === member.goal)?.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-ink"></div>
                                            <span className="text-sm font-black text-ink">{member.dailyRequirements.calories.toFixed(0)} <span className="label-small text-[8px]">kcal</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red"></div>
                                            <span className="text-sm font-black text-ink">{member.dailyRequirements.protein.toFixed(0)}g <span className="label-small text-[8px]">Prot</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green"></div>
                                            <span className="text-sm font-black text-ink">{member.dailyRequirements.carbs.toFixed(0)}g <span className="label-small text-[8px]">Carb</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue"></div>
                                            <span className="text-sm font-black text-ink">{member.dailyRequirements.fat.toFixed(0)}g <span className="label-small text-[8px]">Grasa</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEditClick(member)}
                                        className="p-3 rounded-2xl bg-warm text-muted hover:text-blue hover:bg-blue-light transition-all"
                                        title="Editar miembro"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => onRemoveMember(member.id)} 
                                        className="p-3 rounded-2xl bg-warm text-muted hover:text-red hover:bg-red-light transition-all"
                                        title="Eliminar miembro"
                                    >
                                        <TrashIcon className="w-5 h-5" />
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
