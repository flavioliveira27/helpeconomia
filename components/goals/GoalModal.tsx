import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useGoals, Goal } from '../../contexts/GoalContext';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal?: Goal; // If provided, we are editing
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goal }) => {
    const { addGoal, updateGoal } = useGoals();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (goal) {
            setName(goal.name);
            setTargetAmount(goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            setDeadline(new Date(goal.deadline).toISOString().split('T')[0]);
        } else {
            setName('');
            setTargetAmount('');
            setDeadline('');
        }
    }, [goal, isOpen]);

    if (!isOpen) return null;

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setTargetAmount('');
            return;
        }
        const floatValue = parseFloat(value) / 100;
        setTargetAmount(floatValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const numericAmount = parseFloat(targetAmount.replace(/\./g, '').replace(',', '.'));
            const goalData = {
                name,
                target_amount: numericAmount,
                deadline
            };

            if (goal) {
                await updateGoal(goal.id, goalData);
            } else {
                await addGoal(goalData);
            }
            onClose();
        } catch (error) {
            alert('Erro ao salvar meta. Verifique os campos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {goal ? 'Editar Meta' : 'Nova Meta'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Meta</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Viagem de Férias, Reserva de Emergência"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Alvo (R$)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                            <input
                                type="text"
                                required
                                placeholder="0,00"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                value={targetAmount}
                                onChange={handleCurrencyChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Final (Prazo)</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {isSubmitting ? 'Salvando...' : 'Salvar Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
