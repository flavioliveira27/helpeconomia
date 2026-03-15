import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
    className?: string;
    isFixed?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', isFixed = true }) => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`${isFixed ? 'fixed bottom-6 right-6 z-50 shadow-lg' : 'relative'} p-3 rounded-full transition-all ${darkMode
                ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                : 'bg-white text-slate-400 hover:text-blue-600 border border-slate-100'
                } ${className}`}
            aria-label="Alternar tema"
        >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
    );
};
