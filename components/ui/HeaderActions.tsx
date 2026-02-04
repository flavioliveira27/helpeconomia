import React from 'react';

export const HeaderActions: React.FC = () => {
    return (
        <div className="flex items-center gap-3">


            <button
                onClick={() => document.documentElement.classList.toggle('dark')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-yellow-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Alternar Tema"
            >
                <span className="material-icons-round text-xl">dark_mode</span>
            </button>
        </div>
    );
};
