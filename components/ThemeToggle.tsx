
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
    // Default to light (false) to satisfy user request
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark'; // Only true if explicitly 'dark'
    });

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className={`absolute bottom-6 right-6 p-3 rounded-full shadow-lg transition-all z-50 ${darkMode
                ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                : 'bg-white text-slate-400 hover:text-blue-600'
                }`}
            aria-label="Alternar tema"
        >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
    );
};
