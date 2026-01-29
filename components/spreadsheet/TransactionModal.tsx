import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Transaction, TransactionType, TransactionPaymentMethod, TransactionImportance } from '../../types';
import { CATEGORIES, GENERAL_CATEGORIES, INVESTMENT_CATEGORIES } from '../../constants';
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
    const [formData, setFormData] = useState<Partial<Transaction>>({
        date: new Date().toISOString().split('T')[0],
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
                    date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
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
                    date: new Date().toISOString().split('T')[0],
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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Data</label>
                    <input
                        type="date"
                        required
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Descrição</label>
                    <input
                        type="text"
                        required
                        placeholder="Ex: Compras no mercado"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {showExtraColumns && (
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Forma de Pagamento</label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.paymentMethod || ''}
                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as TransactionPaymentMethod })}
                            >
                                <option value="" disabled>Selecione</option>
                                {Object.values(TransactionPaymentMethod).map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Dynamic Value Section */}
                {isCreditInstallments ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Valor da Parcela</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formatCurrencyInput(installmentValue)}
                                onChange={e => {
                                    const val = parseCurrencyInput(e.target.value);
                                    setInstallmentValue(val);
                                }}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Parcelas</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.installments || ''}
                                onChange={e => setFormData({ ...formData, installments: parseInt(e.target.value) || undefined })}
                            />
                        </div>
                    </div>
                ) : (
                    // Standard Value Input (hidden if credit installments layout is active above, but we show Total separately below)
                    <></>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Valor Total (R$)</label>
                        <input
                            type="text"
                            required
                            readOnly={isCreditInstallments}
                            className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isCreditInstallments ? 'bg-slate-100 text-slate-500' : ''}`}
                            value={formatCurrencyInput(formData.amount)}
                            onChange={e => {
                                const val = parseCurrencyInput(e.target.value);
                                setFormData({ ...formData, amount: val });
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Categoria</label>
                        <select
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            {(type === TransactionType.INVESTMENT ? INVESTMENT_CATEGORIES : GENERAL_CATEGORIES).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {showExtraColumns && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Importância</label>
                        <select
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.importance || ''}
                            onChange={e => setFormData({ ...formData, importance: e.target.value as TransactionImportance })}
                        >
                            {Object.values(TransactionImportance).map(i => (
                                <option key={i} value={i}>
                                    {i === TransactionImportance.SUPERFLUOUS ? 'SUPÉRFLUO' : i}
                                </option>
                            ))}
                        </select>
                        {isCreditInstallments && (
                            <p className="text-xs text-amber-600 mt-1">
                                * A primeira parcela será cobrada e somada apenas no próximo mês.
                            </p>
                        )}
                    </div>
                )}

                {/* Recurring Checkbox - Only for Fixed Expenses */}
                {/* Recurring Checkbox - For Fixed Expenses and Investments */}
                {(type === TransactionType.FIXED_EXPENSE || type === TransactionType.INVESTMENT) && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            type="checkbox"
                            id="recurring"
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            checked={Boolean(formData.recurring)}
                            onChange={e => setFormData({ ...formData, recurring: e.target.checked })}
                        />
                        <label htmlFor="recurring" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                            {type === TransactionType.INVESTMENT
                                ? 'Investimento Recorrente? (Repetir mensalmente)'
                                : 'Repetir mensalmente? (Despesa Recorrente)'}
                        </label>
                    </div>
                )}

                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="primary">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};
