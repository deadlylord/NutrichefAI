
import React from 'react';
import { HomeIcon, CalendarIcon, UsersIcon, LightBulbIcon } from './IconComponents';
import { Tab } from '../App';

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
            className="relative flex flex-col items-center justify-center w-full h-full group"
            aria-label={label}
        >
            <div className={`absolute -top-1 w-8 h-1 rounded-b-full transition-all duration-300 ${isActive ? 'bg-green-600' : 'bg-transparent'}`}></div>
            
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-green-50 text-green-700 translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}`}>
                 <Icon className="h-6 w-6" />
            </div>
            
            <span className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${isActive ? 'text-green-700' : 'text-slate-400'}`}>
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
        <nav className="md:hidden fixed bottom-6 left-4 right-4 mx-auto max-w-lg h-20 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 z-50">
            <div className="flex justify-around items-center h-full px-2">
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
            </div>
        </nav>
    );
};

export default BottomNavBar;
