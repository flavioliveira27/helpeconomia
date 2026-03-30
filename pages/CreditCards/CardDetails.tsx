import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreditCards } from '../../contexts/CreditCardContext';
import { CreditCard, CardInvoiceSummary, CardInvoiceDetail, TransactionType, TransactionImportance } from '../../types';
import { formatCurrency, formatShortDate, formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';
import { useFinancial } from '../../contexts/FinancialContext';

export const CardDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { creditCards, getInvoicesSummary, getInvoiceDetails, addCreditTransaction } = useCreditCards();

    const [card, setCard] = useState<CreditCard | null>(null);
    const [invoices, setInvoices] = useState<CardInvoiceSummary[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<CardInvoiceSummary | null>(null);
    const [invoiceDetails, setInvoiceDetails] = useState<CardInvoiceDetail | null>(null);
    const currentYear = new Date().getFullYear();
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([currentYear]));

    const [isLoading, setIsLoading] = useState(true);
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    const [editingTxId, setEditingTxId] = useState<number | null>(null);

    // Transaction Form State
    const { deleteTransaction, updateTransaction, selectedMonth, selectedYear } = useFinancial();
    const [txDesc, setTxDesc] = useState('');
    const [txAmount, setTxAmount] = useState('');
    const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
    const [txCategory, setTxCategory] = useState('');
    const [txImportance, setTxImportance] = useState<TransactionImportance>(TransactionImportance.ESSENTIAL);
    const [txInstallments, setTxInstallments] = useState(1);
    const [txRecurring, setTxRecurring] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const CATEGORIES = [
        'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação',
        'Moradia', 'Compras', 'Serviços', 'Viagem', 'Outros'
    ];

    useEffect(() => {
        if (creditCards.length > 0 && id) {
            const foundCard = creditCards.find(c => String(c.id) === String(id));
            if (foundCard) {
                setCard(foundCard);
                loadInvoices(foundCard.id);
            } else {
                navigate('/cartoes');
            }
        }
    }, [creditCards, id]);

    const loadInvoices = async (cardId: number) => {
        setIsLoading(true);
        try {
            const summaries = await getInvoicesSummary(cardId);
            
            if (summaries && summaries.length > 0) {
                setInvoices(summaries);
                // Tenta achar a fatura do mês atual global. Se achar, seleciona ela, senão pega a última (posição 0 do sort DESC da API).
                const targetInvoice = summaries.find(s => Number(s.month) === (Number(selectedMonth) + 1) && Number(s.year) === Number(selectedYear));
                
                await loadInvoiceDetails(cardId, targetInvoice || summaries[0]);
            } else {
                setInvoices([]);
                setSelectedInvoice(null);
                setInvoiceDetails(null);
            }
        } catch (error) {
            console.error('Failed to load invoices', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadInvoiceDetails = async (cardId: number, summary: CardInvoiceSummary) => {
        try {
            setSelectedInvoice(summary);
            const details = await getInvoiceDetails(cardId, summary.month, summary.year);
            setInvoiceDetails(details);
        } catch (error) {
            console.error('Failed to load invoice details', error);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!card) return;

        setIsSubmitting(true);
        try {
            if (editingTxId) {
                await updateTransaction(editingTxId, {
                    description: txDesc,
                    amount: parseCurrencyInput(txAmount),
                    date: txDate,
                    category: txCategory || 'Outros',
                    importance: txImportance as any,
                    installments: txInstallments
                });
            } else {
                setTxImportance(TransactionImportance.ESSENTIAL);
                await addCreditTransaction(card.id, {
                    description: txDesc,
                    amount: parseCurrencyInput(txAmount),
                    date: txDate,
                    category: txCategory || 'Outros',
                    importance: txImportance as any,
                    installments: txInstallments,
                    recurring: txRecurring
                });
            }
            setIsAddTxModalOpen(false);
            resetTxForm();
            await loadInvoices(card.id); // Reload summary
            if (selectedInvoice) {
                await loadInvoiceDetails(card.id, selectedInvoice); // Reload details
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao lançar ou editar despesa no cartão');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetTxForm = () => {
        setTxDesc('');
        setTxAmount('');
        setTxDate(new Date().toISOString().split('T')[0]);
        setTxCategory('');
        setTxImportance(TransactionImportance.ESSENTIAL);
        setTxInstallments(1);
        setTxRecurring(false);
        setEditingTxId(null);
    };

    if (isLoading || !card) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // O valor na base de dados para cartões já vem dividido na parcela pela API backend.
    const getAdjustedAmount = (tx: any) => {
        return Number(tx.amount);
    }

    const usedLimit = invoiceDetails ? invoiceDetails.transactions.reduce((sum, tx) => sum + getAdjustedAmount(tx), 0) : 0;
    const availableLimit = card.limit_amount - (invoiceDetails ? invoiceDetails.total : 0); // Limit is affected by total debt, but invoice total is specific
    const limitPercent = Math.min(((card.limit_amount - availableLimit) / card.limit_amount) * 100, 100);

    const getMonthName = (monthNum: number) => {
        const d = new Date(2024, monthNum - 1, 1);
        return d.toLocaleString('pt-BR', { month: 'long' });
    };

    return (
        <div className="space-y-6">
            {/* Header with Card Mini-preview */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/cartoes')}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-icons-round">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">{card.name}</h1>
                        <p className="text-slate-500 text-sm">{card.brand} • Vencimento dia {card.due_day}</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsAddTxModalOpen(true)}
                    className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg shadow-blue-200 dark:shadow-none w-full md:w-auto justify-center"
                >
                    <span className="material-icons-round">payment</span>
                    Lançar Despesa
                </button>
            </div>

            {/* Limit Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Limite Disponível</span>
                        <p className={`text-2xl font-bold ${availableLimit < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {formatCurrency(availableLimit)}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Limite Total</span>
                        <p className="text-lg font-bold">{formatCurrency(card.limit_amount)}</p>
                    </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mt-4 overflow-hidden flex">
                    {/* Limit used bar */}
                    <div
                        className={`h-full transition-all duration-1000 ease-out ${limitPercent > 90 ? 'bg-rose-500' : 'bg-primary'}`}
                        style={{ width: `${Math.max(limitPercent, 0)}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Invoice Months Sidebar */}
                <div className="lg:col-span-1">
                    <h3 className="font-bold text-lg mb-4 px-2">Faturas</h3>
                    {invoices.length === 0 ? (
                        <div className="text-slate-500 text-sm px-2">Nenhuma fatura lançada.</div>
                    ) : (() => {
                        // Group invoices by year
                        const byYear = invoices.reduce<Record<number, CardInvoiceSummary[]>>((acc, inv) => {
                            const y = Number(inv.year);
                            if (!acc[y]) acc[y] = [];
                            acc[y].push(inv);
                            return acc;
                        }, {});
                        const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

                        const toggleYear = (year: number) => {
                            setExpandedYears(prev => {
                                const next = new Set(prev);
                                next.has(year) ? next.delete(year) : next.add(year);
                                return next;
                            });
                        };

                        return (
                            <div className="space-y-3">
                                {years.map(year => {
                                    const yearInvoices = byYear[year];
                                    const isExpanded = expandedYears.has(year);
                                    const yearTotal = yearInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);

                                    return (
                                        <div key={year} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                            {/* Year Header */}
                                            <button
                                                onClick={() => toggleYear(year)}
                                                className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="material-icons-round text-slate-500 dark:text-slate-400 transition-transform duration-300"
                                                        style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                                                    >
                                                        expand_more
                                                    </span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{year}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                    {formatCurrency(yearTotal)}
                                                </span>
                                            </button>

                                            {/* Month Buttons */}
                                            <div
                                                className="overflow-hidden transition-all duration-300 ease-in-out"
                                                style={{ maxHeight: isExpanded ? `${yearInvoices.length * 80}px` : '0px' }}
                                            >
                                                <div className="space-y-1 p-1">
                                                    {yearInvoices.map(inv => (
                                                        <button
                                                            key={inv.month_year}
                                                            onClick={() => loadInvoiceDetails(card.id, inv)}
                                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex justify-between items-center
                                                                ${selectedInvoice?.month_year === inv.month_year
                                                                    ? 'bg-primary text-white shadow-md'
                                                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            <div>
                                                                <p className="font-bold capitalize">{getMonthName(inv.month)}</p>
                                                                <p className={`text-xs ${selectedInvoice?.month_year === inv.month_year ? 'text-blue-100' : 'text-slate-500'}`}>
                                                                    Venc: {formatShortDate(inv.invoice_date)}
                                                                </p>
                                                            </div>
                                                            <p className="font-semibold text-sm">{formatCurrency(inv.total_amount)}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>

                {/* Invoice Details */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                            <div>
                                <h2 className="text-xl font-bold capitalize">Fatura de {selectedInvoice ? getMonthName(selectedInvoice.month) : 'Mês atual'}</h2>
                                <p className="text-slate-500 text-sm">
                                    {selectedInvoice ? `Vencimento em ${formatShortDate(selectedInvoice.invoice_date)}` : ''}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total da Fatura</p>
                                <p className="text-3xl font-bold text-rose-500">
                                    {formatCurrency(invoiceDetails ? invoiceDetails.total : 0)}
                                </p>
                            </div>
                        </div>

                        <div className="p-0 flex-1 overflow-auto">
                            {!invoiceDetails || invoiceDetails.transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center p-6">
                                    <span className="material-icons-round text-5xl mb-4 text-slate-300 dark:text-slate-700">receipt_long</span>
                                    <p className="font-medium text-lg text-slate-700 dark:text-slate-400">Nenhum lançamento nesta fatura</p>
                                    <p className="text-sm mt-1 max-w-sm">Faça compras no dia a dia usando a função "Lançar Despesa".</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {invoiceDetails.transactions.map((tx) => (
                                        <div key={tx.id} className="group p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                                                    <span className="material-icons-round text-sm">shopping_bag</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{tx.description}</p>
                                                    <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                                                        <span>{formatShortDate(tx.date)}</span>
                                                        <span>•</span>
                                                        <span>{tx.category}</span>
                                                        {Boolean(tx.recurring) && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="font-medium text-emerald-500">RECORRENTE</span>
                                                            </>
                                                        )}
                                                        {tx.importance && (
                                                            <>
                                                                <span>•</span>
                                                                <span className={`font-medium ${tx.importance === TransactionImportance.SUPERFLUOUS ? 'text-red-500' : 'text-blue-500'}`}>
                                                                    {tx.importance === TransactionImportance.SUPERFLUOUS ? 'SUPÉRFLUO' : 'ESSENCIAL'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                                    {formatCurrency(getAdjustedAmount(tx))}
                                                </p>
                                                {tx.installments && tx.installments > 1 && (
                                                    <p className="text-xs text-slate-500">
                                                        {tx.installment_number}/{tx.installments}
                                                    </p>
                                                )}
                                                <div className="flex justify-end gap-2 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingTxId(tx.id);
                                                            setTxDesc(tx.description);
                                                            setTxAmount(formatCurrencyInput(Number(tx.amount)));
                                                            setTxDate(tx.date.substring(0, 10));
                                                            setTxCategory(tx.category);
                                                            setTxImportance(tx.importance || TransactionImportance.ESSENTIAL);
                                                            setTxInstallments(tx.installments || 1);
                                                            setIsAddTxModalOpen(true);
                                                        }}
                                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500 hover:text-blue-500"
                                                    >
                                                        <span className="material-icons-round text-[16px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm("Deseja excluir este lançamento?")) {
                                                                await deleteTransaction(tx.id);
                                                                await loadInvoices(card.id);
                                                                if (selectedInvoice) await loadInvoiceDetails(card.id, selectedInvoice);
                                                            }
                                                        }}
                                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500 hover:text-red-500"
                                                    >
                                                        <span className="material-icons-round text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lançar Despesa Modal */}
            {isAddTxModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg">{editingTxId ? 'Editar Despesa' : 'Nova Despesa no Cartão'}</h3>
                            <button
                                onClick={() => {
                                    setIsAddTxModalOpen(false);
                                    resetTxForm();
                                }}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleAddTransaction} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Descrição</label>
                                    <input
                                        type="text"
                                        required
                                        value={txDesc}
                                        onChange={e => setTxDesc(e.target.value)}
                                        placeholder="Ex: Supermercado"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Valor Total (R$)</label>
                                        <input
                                            type="text"
                                            required
                                            value={txAmount}
                                            onChange={e => setTxAmount(formatCurrencyInput(parseCurrencyInput(e.target.value)))}
                                            onFocus={(e) => e.target.select()}
                                            placeholder="R$ 0,00"
                                            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Data da Compra</label>
                                        <input
                                            type="date"
                                            required
                                            value={txDate}
                                            onChange={e => setTxDate(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Categoria</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={txCategory}
                                                onChange={e => setTxCategory(e.target.value)}
                                                className="w-full p-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Selecione</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="material-icons-round text-slate-400">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Parcelas</label>
                                        <div className="relative">
                                            <select
                                                value={txInstallments}
                                                onChange={e => setTxInstallments(parseInt(e.target.value))}
                                                className="w-full p-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value={1}>À vista</option>
                                                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                                    <option key={n} value={n}>{n} vezes</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="material-icons-round text-slate-400">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Importância</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={txImportance}
                                            onChange={e => setTxImportance(e.target.value as TransactionImportance)}
                                            className="w-full p-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value={TransactionImportance.ESSENTIAL}>ESSENCIAL</option>
                                            <option value={TransactionImportance.SUPERFLUOUS}>SUPÉRFLUO</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="material-icons-round text-slate-400">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recurring checkbox — same pattern as TransactionModal */}
                                {!editingTxId && (
                                    <div
                                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
                                        onClick={() => setTxRecurring(prev => !prev)}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${txRecurring ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-500'}`}>
                                            {txRecurring && <span className="material-icons-round text-white text-sm">check</span>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={txRecurring} readOnly />
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer select-none flex-1">
                                            Repetir mensalmente? (Despesa Recorrente)
                                        </label>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddTxModalOpen(false);
                                            resetTxForm();
                                        }}
                                        className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Salvando...' : 'Lançar Compra'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
