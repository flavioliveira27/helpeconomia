import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-all z-50 ${darkMode
                ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                : 'bg-white text-slate-400 hover:text-blue-600'
                }`}
            aria-label="Alternar tema"
        >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
    );
};
