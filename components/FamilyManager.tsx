import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { UserPlusIcon, TrashIcon } from './IconComponents';

interface FamilyManagerProps {
    family: FamilyMember[];
    onAddMember: (memberData: Omit<FamilyMember, 'id' | 'dailyRequirements'>) => Promise<void>;
    onRemoveMember: (id: string) => void;
}

const FamilyManager: React.FC<FamilyManagerProps> = ({ family, onAddMember, onRemoveMember }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
    const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'>('lightly_active');
    const [goal, setGoal] = useState<'lose_weight' | 'maintain_weight' | 'gain_muscle' | 'healthy_growth'>('maintain_weight');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const resetForm = () => {
        setName('');
        setAge('');
        setGender('female');
        setActivityLevel('lightly_active');
        setGoal('maintain_weight');
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || age === '' || age < 0) {
            setError('Por favor, completa el nombre y la edad correctamente.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            const memberGoal = age < 2 && goal !== 'healthy_growth' ? 'healthy_growth' : goal;
            await onAddMember({ name, age, gender, activityLevel, goal: memberGoal });
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudieron calcular los requerimientos.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRemoveMember = (id: string) => {
        onRemoveMember(id);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                    <UserPlusIcon /> <span className="ml-2">Añadir Miembro de la Familia</span>
                </h2>
                <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500" required />
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Edad</label>
                        <input type="number" id="age" value={age} placeholder="Para bebés menores de 1 año, usa 0" onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))} className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500" required min="0" />
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                        <select id="gender" value={gender} onChange={e => setGender(e.target.value as any)} className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500">
                            <option value="female">Mujer</option>
                            <option value="male">Hombre</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="activity" className="block text-sm font-medium text-gray-700">Nivel de Actividad</label>
                        <select id="activity" value={activityLevel} onChange={e => setActivityLevel(e.target.value as any)} className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500">
                            <option value="sedentary">Sedentario</option>
                            <option value="lightly_active">Actividad Ligera</option>
                            <option value="moderately_active">Actividad Moderada</option>
                            <option value="very_active">Muy Activo</option>
                            <option value="extra_active">Extremadamente Activo</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Objetivo</label>
                        <select id="goal" value={goal} onChange={e => setGoal(e.target.value as any)} className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500">
                            <option value="maintain_weight">Mantener peso</option>
                            <option value="lose_weight">Perder peso</option>
                            <option value="gain_muscle">Ganar músculo</option>
                            <option value="healthy_growth">Crecimiento saludable (niños)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 text-right">
                        <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
                            {isLoading ? 'Calculando...' : 'Añadir Miembro'}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {family.length > 0 && (
                <div className="bg-white p-6 rounded-3xl shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Miembros de la Familia</h2>
                    <div className="space-y-4">
                        {family.map(member => (
                            <div key={member.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">{member.name}, <span className="font-normal">{member.age} años</span></p>
                                    <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                        <span><strong className="text-gray-800">{member.dailyRequirements.calories.toFixed(0)}</strong> kcal</span>
                                        <span className="text-red-600"><strong className="text-red-700">{member.dailyRequirements.protein.toFixed(0)}g</strong> Prot</span>
                                        <span className="text-green-600"><strong className="text-green-700">{member.dailyRequirements.carbs.toFixed(0)}g</strong> Carb</span>
                                        <span className="text-blue-600"><strong className="text-blue-700">{member.dailyRequirements.fat.toFixed(0)}g</strong> Grasa</span>
                                    </div>
                                </div>
                                <button onClick={() => handleRemoveMember(member.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyManager;