
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
}> = ({ label, Icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? 'text-green scale-110' : 'text-muted'}`}
            aria-label={label}
        >
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md bg-paper/96 border-t border-border z-50 flex items-center justify-around py-3 px-6">
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
