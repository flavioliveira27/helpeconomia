import React from 'react';
import { Plus, Trash2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Goal, useGoals } from '../../contexts/GoalContext';

interface GoalCardProps {
    goal: Goal;
    onDeposit?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onDeposit }) => {
    const { deleteGoal } = useGoals();

    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const isCompleted = goal.status === 'COMPLETED';

    const remainingDays = () => {
        const today = new Date();
        const end = new Date(goal.deadline);
        const diff = end.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const days = remainingDays();

    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja excluir a meta "${goal.name}"? Os valores já depositados continuarão registrados como investimentos.`)) {
            try {
                await deleteGoal(goal.id);
            } catch (error) {
                alert('Erro ao excluir meta');
            }
        }
    };

    return (
        <div className={`rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${
            isCompleted 
                ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-900/10' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2">
                         <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{goal.name}</h3>
                         {isCompleted && <CheckCircle2 size={18} className="text-emerald-500" />}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-slate-500 dark:text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>Expira em: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {!isCompleted && (
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} />
                                <span className={days < 7 ? 'text-rose-500 dark:text-rose-400 font-bold' : ''}>
                                    {days > 0 ? `${days} dias restantes` : days === 0 ? 'Expira hoje' : 'Expirada'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {!isCompleted && onDeposit && (
                        <button 
                            onClick={onDeposit}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Adicionar Valor"
                        >
                            <Plus size={20} />
                        </button>
                    )}
                    <button 
                        onClick={handleDelete}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        title="Excluir Meta"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acumulado</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.current_amount)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Alvo</p>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target_amount)}
                        </p>
                    </div>
                </div>

                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                                isCompleted 
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' 
                                    : 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                                {isCompleted ? 'Meta Atingida' : `${progress.toFixed(0)}% concluído`}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2.5 mb-2 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
                        <div 
                            style={{ width: `${progress}%` }} 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
