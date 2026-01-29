import React from 'react';

interface MonthSelectorProps {
    selectedMonth: number;
    selectedYear: number;
    onMonthChange: (month: number) => void;
    onYearChange?: (year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
    selectedMonth,
    selectedYear,
    onMonthChange
}) => {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons-round text-slate-400 text-lg">calendar_today</span>
            </div>
            <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                className="block w-full pl-10 pr-10 py-2.5 text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:ring-primary/20 focus:border-primary/40 transition-all appearance-none cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
            >
                {months.map((month, index) => (
                    <option key={index} value={index}>{month} de {selectedYear}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="material-icons-round text-slate-400 text-base">expand_more</span>
            </div>
        </div>
    );
};
