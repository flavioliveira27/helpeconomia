import React, { useState } from 'react';
import { Target, TrendingUp, DollarSign } from 'lucide-react';
import { useGoals } from '../contexts/GoalContext';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { DepositModal } from '../components/goals/DepositModal';
import { ThemeToggle } from '../components/ThemeToggle';

export const Goals: React.FC = () => {
    const { 
        activeGoals, 
        completedGoals, 
        totalAccumulated, 
        totalTarget, 
        overallProgress,
        isLoading 
    } = useGoals();

    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

    const handleOpenDeposit = (goalId: number) => {
        setSelectedGoalId(goalId);
        setIsDepositModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Minhas Metas</h1>
                <div className="flex items-center gap-3">
                    <ThemeToggle isFixed={false} className="p-2" />
                    <button
                        onClick={() => setIsGoalModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        <Target size={18} />
                        Nova Meta
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Metas Ativas</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activeGoals.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Acumulado</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAccumulated)}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalTarget)}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between items-end mb-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Progresso Geral</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{overallProgress.toFixed(1)}%</p>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                            <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(overallProgress, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Goals */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 px-1">Metas em Andamento</h2>
                {activeGoals.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border text-center border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
                         <Target size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhuma meta ativa</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            Crie sua primeira meta para começar a poupar e acompanhar seu progresso.
                        </p>
                         <button
                            onClick={() => setIsGoalModalOpen(true)}
                            className="mt-6 border border-blue-600 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                        >
                            Criar Nova Meta
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {activeGoals.map(goal => (
                            <GoalCard 
                                key={goal.id} 
                                goal={goal} 
                                onDeposit={() => handleOpenDeposit(goal.id)} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 px-1 flex items-center gap-2">
                        <span className="text-emerald-500">★</span> Metas Concluídas
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-75 grayscale-[30%]">
                        {completedGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))}
                    </div>
                </div>
            )}

            <GoalModal 
                isOpen={isGoalModalOpen} 
                onClose={() => setIsGoalModalOpen(false)} 
            />

            {selectedGoalId && (
                <DepositModal
                    isOpen={isDepositModalOpen}
                    onClose={() => {
                        setIsDepositModalOpen(false);
                        setSelectedGoalId(null);
                    }}
                    goalId={selectedGoalId}
                />
            )}
        </div>
    );
};
