import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Transaction, TransactionType, TransactionPaymentMethod, TransactionImportance } from '../../types';
import { CATEGORIES, GENERAL_CATEGORIES, INVESTMENT_CATEGORIES, INCOME_CATEGORIES, FIXED_EXPENSE_CATEGORIES, VARIABLE_EXPENSE_CATEGORIES } from '../../constants';
import { Button } from '../ui/Button';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Transaction>) => void;
    initialData?: Partial<Transaction>;
    type: TransactionType;
    showExtraColumns?: boolean;
    title: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    type,
    showExtraColumns,
    title
}) => {
    const getLocalDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState<Partial<Transaction>>({
        date: getLocalDate(),
        description: '',
        amount: 0,
        category: 'Outros',
        type: type,
        paymentMethod: undefined,
        importance: undefined,
        installments: undefined,
        recurring: false
    });

    // Local state for installment value
    const [installmentValue, setInstallmentValue] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    date: initialData.date ? initialData.date.split('T')[0] : getLocalDate(),
                    description: initialData.description ? initialData.description.replace(/\s\(\d+\/\d+\)$/, '') : '',
                    paymentMethod: initialData.paymentMethod || undefined,
                    importance: initialData.importance || undefined,
                    installments: initialData.installments || undefined,
                    recurring: initialData.recurring || false
                });
                // Calculate installment value if applicable
                if (initialData.paymentMethod === TransactionPaymentMethod.CREDIT_INSTALLMENTS && initialData.amount && initialData.installments) {
                    setInstallmentValue(Number((initialData.amount / initialData.installments).toFixed(2)));
                } else {
                    setInstallmentValue(0);
                }
            } else {
                setFormData({
                    date: getLocalDate(),
                    description: '',
                    amount: 0,
                    category: 'Outros',
                    type: type,
                    importance: showExtraColumns ? TransactionImportance.ESSENTIAL : undefined,
                    paymentMethod: undefined,
                    installments: undefined,
                    recurring: false
                });
                setInstallmentValue(0);
            }
        }
    }, [isOpen, initialData, type, showExtraColumns]);

    // Calculate total amount when installments or installment value changes
    useEffect(() => {
        if (formData.paymentMethod === TransactionPaymentMethod.CREDIT_INSTALLMENTS) {
            const parcels = formData.installments || 0;
            const value = installmentValue || 0;
            if (parcels > 0 && value > 0) {
                setFormData(prev => ({ ...prev, amount: Number((parsedVal(value) * parcels).toFixed(2)) }));
            }
        }
    }, [installmentValue, formData.installments, formData.paymentMethod]);

    // Helper to safely parse
    const parsedVal = (v: any) => parseFloat(v) || 0;

    // Helper to format currency input (BRL)
    const formatCurrencyInput = (value: number | undefined): string => {
        // Always return a formatted string, default to 0,00
        const val = value || 0;
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Helper to parse currency string input
    const parseCurrencyInput = (value: string): number => {
        const numbers = value.replace(/\D/g, '');
        return Number(numbers) / 100;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const isCreditInstallments = formData.paymentMethod === TransactionPaymentMethod.CREDIT_INSTALLMENTS;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Data</label>
                    <input
                        type="date"
                        required
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm dark:[color-scheme:dark]"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Descrição</label>
                    <input
                        type="text"
                        required
                        placeholder="Ex: Compras no mercado"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {showExtraColumns && (
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Forma de Pagamento</label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm appearance-none cursor-pointer"
                                    value={formData.paymentMethod || ''}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as TransactionPaymentMethod })}
                                >
                                    <option value="" disabled>Selecione</option>
                                    {Object.values(TransactionPaymentMethod).map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="material-icons-round text-slate-400">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dynamic Value Section */}
                {isCreditInstallments ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Valor da Parcela</label>
                            <input
                                type="text"
                                required
                                pattern="^(?!0,00$).*"
                                title="O valor da parcela deve ser maior que zero"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                value={formatCurrencyInput(installmentValue)}
                                onChange={e => {
                                    const val = parseCurrencyInput(e.target.value);
                                    setInstallmentValue(val);
                                }}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Parcelas</label>
                            <input
                                type="number"
                                required
                                min="1"
                                title="Informe o número de parcelas"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                value={formData.installments || ''}
                                onChange={e => setFormData({ ...formData, installments: parseInt(e.target.value) || undefined })}
                            />
                        </div>
                    </div>
                ) : (
                    <></>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Valor Total (R$)</label>
                        <input
                            type="text"
                            required
                            pattern="^(?!0,00$).*"
                            title="O valor deve ser maior que zero"
                            readOnly={isCreditInstallments}
                            className={`w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm ${isCreditInstallments ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100'}`}
                            value={formatCurrencyInput(formData.amount)}
                            onChange={e => {
                                const val = parseCurrencyInput(e.target.value);
                                setFormData({ ...formData, amount: val });
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Categoria</label>
                        <div className="relative">
                            <select
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm appearance-none cursor-pointer"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {(type === TransactionType.INVESTMENT
                                    ? INVESTMENT_CATEGORIES
                                    : type === TransactionType.INCOME
                                        ? INCOME_CATEGORIES
                                        : type === TransactionType.FIXED_EXPENSE
                                            ? FIXED_EXPENSE_CATEGORIES
                                            : VARIABLE_EXPENSE_CATEGORIES
                                ).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="material-icons-round text-slate-400">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                {showExtraColumns && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Importância</label>
                        <div className="relative">
                            <select
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm appearance-none cursor-pointer"
                                value={formData.importance || ''}
                                onChange={e => setFormData({ ...formData, importance: e.target.value as TransactionImportance })}
                            >
                                {Object.values(TransactionImportance).map(i => (
                                    <option key={i} value={i}>
                                        {i === TransactionImportance.SUPERFLUOUS ? 'SUPÉRFLUO' : i}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="material-icons-round text-slate-400">expand_more</span>
                            </div>
                        </div>
                        {isCreditInstallments && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                                * A primeira parcela será cobrada e somada apenas no próximo mês.
                            </p>
                        )}
                        {formData.paymentMethod === TransactionPaymentMethod.CREDIT && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                                * O valor será cobrado apenas no próximo mês.
                            </p>
                        )}
                    </div>
                )}

                {/* Recurring Checkbox - For Fixed Expenses, Investments, and now Credit Variable Expenses */}
                {(type === TransactionType.FIXED_EXPENSE || type === TransactionType.INVESTMENT || (type === TransactionType.VARIABLE_EXPENSE && formData.paymentMethod === TransactionPaymentMethod.CREDIT)) && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, recurring: !formData.recurring })}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.recurring ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-500'}`}>
                            {formData.recurring && <span className="material-icons-round text-white text-sm">check</span>}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={Boolean(formData.recurring)}
                            readOnly
                        />
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer select-none flex-1">
                            {type === TransactionType.INVESTMENT
                                ? 'Investimento Recorrente? (Repetir mensalmente)'
                                : 'Repetir mensalmente? (Despesa Recorrente)'}
                        </label>
                    </div>
                )}

                <div className="pt-6 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} className="px-6 py-2.5">Cancelar</Button>
                    <Button type="submit" variant="primary" className="px-8 py-2.5 shadow-lg shadow-blue-200 dark:shadow-none">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};
