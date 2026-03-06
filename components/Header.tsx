
import React from 'react';
import { Tab } from '../types';
import { HomeIcon, CalendarIcon, UsersIcon, LightBulbIcon, NutriChefLogo, PencilIcon } from './IconComponents';

interface HeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    familyName: string;
    onFamilyNameChange: (newName: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, familyName, onFamilyNameChange }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editedName, setEditedName] = React.useState(familyName);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setEditedName(familyName);
    }, [familyName]);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editedName.trim()) {
            onFamilyNameChange(editedName.trim());
        } else {
            setEditedName(familyName); // Revert if empty
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditedName(familyName);
            setIsEditing(false);
        }
    };
    
    const navItems = [
        { tab: 'foods', label: 'Alimentos', Icon: HomeIcon },
        { tab: 'mealPlan', label: 'Plan', Icon: CalendarIcon },
        { tab: 'family', label: 'Familia', Icon: UsersIcon },
        { tab: 'tips', label: 'Tips', Icon: LightBulbIcon },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
            <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
                        <NutriChefLogo />
                    </div>
                    <div>
                        <p className="text-[#8BA888] text-[10px] font-bold uppercase tracking-wider mb-0.5">NutriChef AI</p>
                        <div className="flex items-center gap-2 group">
                            {isEditing ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    onBlur={handleSave}
                                    onKeyDown={handleKeyDown}
                                    className="bg-white border border-slate-300 rounded px-2 py-0.5 text-lg font-bold text-[#1E4620] focus:outline-none focus:ring-2 focus:ring-[#8BA888] w-48"
                                />
                            ) : (
                                <h1 className="text-lg md:text-xl font-bold text-[#1E4620] truncate max-w-[200px] md:max-w-none">
                                    {familyName}
                                </h1>
                            )}
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#1E4620] transition-all p-1"
                                    title="Editar nombre"
                                >
                                    <PencilIcon />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => (
                        <button
                            key={item.tab}
                            onClick={() => onTabChange(item.tab as Tab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeTab === item.tab 
                                ? 'bg-[#1E4620] text-white shadow-md shadow-green-900/10' 
                                : 'text-slate-500 hover:text-[#1E4620] hover:bg-white'
                            }`}
                        >
                            <item.Icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#1E4620] hover:border-green-300 transition-all cursor-pointer shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Header;
