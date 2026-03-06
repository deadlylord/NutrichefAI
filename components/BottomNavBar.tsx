
import React from 'react';
import { HomeIcon, CalendarIcon, UsersIcon, LightBulbIcon } from './IconComponents';
import { Tab } from '../types';

interface BottomNavBarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const NavButton: React.FC<{
    tabName: Tab;
    label: string;
    Icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}> = ({ tabName, label, Icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center w-full h-full group transition-colors duration-300 ${isActive ? 'text-[#1E4620]' : 'text-slate-400 hover:text-slate-600'}`}
            aria-label={label}
        >
            {isActive && (
                <span className="absolute -top-3 w-12 h-1 bg-[#1E4620] rounded-b-lg shadow-sm animate-fade-in"></span>
            )}
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-green-50 scale-110' : ''}`}>
                 <Icon className="h-6 w-6" />
            </div>
            
            <span className="text-[10px] font-medium mt-1">
                {label}
            </span>
        </button>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        { tab: 'foods', label: 'Alimentos', Icon: HomeIcon },
        { tab: 'mealPlan', label: 'Plan', Icon: CalendarIcon },
        { tab: 'family', label: 'Familia', Icon: UsersIcon },
        { tab: 'tips', label: 'Tips', Icon: LightBulbIcon },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-around pb-2 border-t border-slate-100">
             {navItems.map(item => (
                <NavButton
                    key={item.tab}
                    tabName={item.tab as Tab}
                    label={item.label}
                    Icon={item.Icon}
                    isActive={activeTab === item.tab}
                    onClick={() => onTabChange(item.tab as Tab)}
                />
            ))}
        </nav>
    );
};

export default BottomNavBar;
