import React, { useState, useEffect } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useGoals } from '../../contexts/GoalContext';
import { useFinancial } from '../../contexts/FinancialContext';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalId: number;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, goalId }) => {
    const { depositGoal, goals } = useGoals();
    const { selectedMonth, selectedYear } = useFinancial();
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const goal = goals.find(g => g.id === goalId);

    // Build a date string for the selected month – uses today's day clamped to valid range
    const getDateForSelectedMonth = () => {
        const today = new Date();
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const day = Math.min(today.getDate(), daysInMonth);
        const mm = String(selectedMonth + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${selectedYear}-${mm}-${dd}`;
    };

    const [depositDate, setDepositDate] = useState('');

    // Reset form whenever the modal opens
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDepositDate(getDateForSelectedMonth());
        }
    }, [isOpen, selectedMonth, selectedYear]);

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setAmount('');
            return;
        }
        const floatValue = parseFloat(value) / 100;
        setAmount(floatValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
            await depositGoal(goalId, numericAmount, depositDate);
            setAmount('');
            onClose();
        } catch (error) {
            alert('Erro ao realizar depósito.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-400">Depositar na Meta</h3>
                    <button onClick={onClose} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors">
                        <X size={20} className="text-blue-600 dark:text-blue-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Meta Selecionada</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{goal.name}</p>
                    </div>

                    {/* Date field */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Data do Depósito</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:[color-scheme:dark]"
                            value={depositDate}
                            onChange={e => setDepositDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor do Depósito (R$)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">R$</span>
                            <input
                                type="text"
                                required
                                autoFocus
                                placeholder="0,00"
                                className="w-full pl-14 pr-4 py-4 text-3xl font-bold text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={amount}
                                onChange={handleCurrencyChange}
                            />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center italic">
                            Este valor será registrado como um investimento no seu histórico financeiro.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            <PlusCircle size={20} />
                            {isSubmitting ? 'Processando...' : 'Confirmar Depósito'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
