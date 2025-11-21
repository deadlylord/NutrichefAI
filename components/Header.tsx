
import React from 'react';
import { Tab } from '../App';
import { HomeIcon, CalendarIcon, UsersIcon, LightBulbIcon } from './IconComponents';

interface HeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
    
    const navItems = [
        { tab: 'foods', label: 'Alimentos', Icon: HomeIcon },
        { tab: 'mealPlan', label: 'Plan', Icon: CalendarIcon },
        { tab: 'family', label: 'Familia', Icon: UsersIcon },
        { tab: 'tips', label: 'Tips', Icon: LightBulbIcon },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-slate-100 transition-all duration-300 shadow-sm">
            <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('foods')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-green-200 shadow-lg transform hover:scale-105 transition-transform">
                        N
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                            NutriChef <span className="text-green-600">AI</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Tu asistente personal</p>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-100">
                    {navItems.map((item) => (
                        <button
                            key={item.tab}
                            onClick={() => onTabChange(item.tab as Tab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeTab === item.tab 
                                ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                        >
                            <item.Icon className={`w-4 h-4 ${activeTab === item.tab ? 'text-green-600' : 'text-slate-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Header;
