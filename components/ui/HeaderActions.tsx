import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const HeaderActions: React.FC = () => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={toggleTheme}
                className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-yellow-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Alternar Tema"
            >
                <span className="material-icons-round text-xl">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
        </div>
    );
};
