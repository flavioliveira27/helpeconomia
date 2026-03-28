import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonthSelector } from '../../components/ui/MonthSelector';
import { useCreditCards } from '../../contexts/CreditCardContext';
import { HeaderActions } from '../../components/ui/HeaderActions';
import { useFinancial } from '../../contexts/FinancialContext';

import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

export const CreditCards: React.FC = () => {
    const navigate = useNavigate();
    const { creditCards, isLoadingCards, createCreditCard, deleteCreditCard, getInvoicesSummary } = useCreditCards();
    const { selectedMonth, selectedYear, setSelectedMonth } = useFinancial();
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [monthlyUsedLimits, setMonthlyUsedLimits] = useState<Record<number, number>>({});

    // Quando mudar o array de cartões ou o mês selecionado globalmente, recalcular os saldos atuais
    React.useEffect(() => {
        const loadLimits = async () => {
            if (creditCards.length === 0) return;
            const limitsMap: Record<number, number> = {};
            
            await Promise.all(
                creditCards.map(async (card) => {
                    try {
                        const summaries = await getInvoicesSummary(card.id);
                        if (summaries && summaries.length > 0) {
                            // Find specific month invoice
                            const targetInvoice = summaries.find(s => Number(s.month) === (Number(selectedMonth) + 1) && Number(s.year) === Number(selectedYear));
                            limitsMap[card.id] = targetInvoice ? Number(targetInvoice.total_amount) : 0;
                        } else {
                            limitsMap[card.id] = 0;
                        }
                    } catch (e) {
                        console.error('Failed fetching limit for card', card.id, e);
                        limitsMap[card.id] = 0;
                    }
                })
            );
            
            setMonthlyUsedLimits(limitsMap);
        };
        
        loadLimits();
    }, [creditCards, selectedMonth, selectedYear, getInvoicesSummary]);

    const handleDeleteCard = async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();
        if (window.confirm(`Tem certeza que deseja excluir o cartão ${name}? Essa ação não pode ser desfeita.`)) {
            await deleteCreditCard(id);
        }
    };

    // Form State
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('Mastercard');
    const [limit, setLimit] = useState('');
    const [closingDay, setClosingDay] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [colorTheme, setColorTheme] = useState('purple');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createCreditCard({
                name,
                brand,
                limit_amount: parseCurrencyInput(limit),
                closing_day: parseInt(closingDay),
                due_day: parseInt(dueDay),
                color_theme: colorTheme
            });
            setIsAddCardModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error adding card', error);
            alert('Erro ao adicionar cartão');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setBrand('Mastercard');
        setLimit('');
        setClosingDay('');
        setDueDay('');
        setColorTheme('purple');
    };

    const THEMES = [
        { id: 'purple', name: 'Roxo (Nubank)', bg: 'bg-indigo-600', gradient: 'from-indigo-500 to-purple-600' },
        { id: 'orange', name: 'Laranja (Itaú)', bg: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600' },
        { id: 'blue', name: 'Azul (Caixa/BB)', bg: 'bg-blue-600', gradient: 'from-blue-500 to-blue-700' },
        { id: 'green', name: 'Verde (Sicredi/Next)', bg: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600' },
        { id: 'red', name: 'Vermelho (Santander)', bg: 'bg-red-600', gradient: 'from-red-500 to-red-700' },
        { id: 'black', name: 'Black Premium', bg: 'bg-zinc-800', gradient: 'from-zinc-700 to-zinc-900' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                {/* Título + Botão sempre juntos */}
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Meus Cartões</h1>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Gerencie seus limites e faturas</p>
                    </div>
                </div>
                {/* Ações à direita */}
                <div className="flex items-center gap-3">
                    <HeaderActions />
                    <button
                        onClick={() => setIsAddCardModalOpen(true)}
                        className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        <span className="material-icons-round">add</span>
                        <span className="hidden sm:inline">Adicionar Cartão</span>
                    </button>
                    <div className="hidden lg:block">
                        <MonthSelector 
                            selectedMonth={selectedMonth} 
                            selectedYear={selectedYear} 
                            onMonthChange={setSelectedMonth} 
                        />
                    </div>
                </div>
            </div>

            {isLoadingCards ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : creditCards.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <span className="material-icons-round text-3xl">credit_card</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Nenhum cartão cadastrado</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                        Adicione seus cartões de crédito para organizar o pagamento das suas faturas separadamente de suas contas correntes.
                    </p>
                    <button
                        onClick={() => setIsAddCardModalOpen(true)}
                        className="text-primary font-medium hover:underline"
                    >
                        Adicionar meu primeiro cartão
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {creditCards.map(card => {
                        const theme = THEMES.find(t => t.id === card.color_theme) || THEMES[0];
                        return (
                            <div
                                key={card.id}
                                onClick={() => navigate(`/cartoes/${card.id}`)}
                                className={`w-full max-w-[480px] mx-auto aspect-[1.58] rounded-2xl p-5 sm:p-6 text-white bg-gradient-to-br ${theme.gradient} shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1`}
                            >
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>

                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg tracking-wide">{card.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/20 backdrop-blur-md text-xs px-2 py-1 rounded-md font-medium">
                                                {card.brand}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeleteCard(e, card.id, card.name)}
                                                className="bg-white/10 hover:bg-red-500/80 backdrop-blur-md p-1.5 rounded-md transition-colors"
                                            >
                                                <span className="material-icons-round text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <span className="text-white/70 text-sm font-medium">Limite Total</span>
                                            <p className="text-2xl font-bold tracking-tight">{formatCurrency(card.limit_amount)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-white/70 text-sm font-medium">Disponível</span>
                                            <p className="text-xl font-bold tracking-tight text-emerald-300">
                                                {formatCurrency(Number(card.limit_amount) - Number(monthlyUsedLimits[card.id] || 0))}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/20 pt-3 mt-auto">
                                        <div>
                                            <span className="text-white/70 text-[11px] block uppercase tracking-wider">Vencimento</span>
                                            <span className="font-semibold text-sm">Dia {card.due_day}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-white/70 text-[11px] block uppercase tracking-wider">Fechamento</span>
                                            <span className="font-semibold text-sm">Dia {card.closing_day}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Card Modal */}
            {isAddCardModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Novo Cartão</h3>
                            <button
                                onClick={() => {
                                    setIsAddCardModalOpen(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Preview */}
                                <div className={`w-full aspect-[1.58] max-w-[320px] mx-auto rounded-xl bg-gradient-to-br ${THEMES.find(t => t.id === colorTheme)?.gradient || THEMES[0].gradient} p-5 text-white flex flex-col justify-between mb-6 shadow-md transition-all`}>
                                    <div className="flex justify-between items-center opacity-80">
                                        <span className="font-semibold">{name || 'Nome do Cartão'}</span>
                                        <span className="text-xs uppercase">{brand}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs opacity-70">Limite</span>
                                        <p className="font-bold text-lg">{limit ? formatCurrency(parseCurrencyInput(limit)) : 'R$ 0,00'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Apelido do Cartão</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={30}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Ex: Nubank, Itaú Principal"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bandeira</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={brand}
                                                onChange={e => setBrand(e.target.value)}
                                                className="w-full p-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="Mastercard">Mastercard</option>
                                                <option value="Visa">Visa</option>
                                                <option value="Elo">Elo</option>
                                                <option value="American Express">Amex</option>
                                                <option value="Outro">Outro</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="material-icons-round text-slate-400">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Limite (R$)</label>
                                        <input
                                            type="text"
                                            required
                                            value={limit}
                                            onChange={e => setLimit(formatCurrencyInput(parseCurrencyInput(e.target.value)))}
                                            onFocus={(e) => e.target.select()}
                                            placeholder="R$ 0,00"
                                            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dia Vencimento</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="31"
                                            value={dueDay}
                                            onChange={e => setDueDay(e.target.value)}
                                            placeholder="10"
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dia Fechamento</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="31"
                                            value={closingDay}
                                            onChange={e => setClosingDay(e.target.value)}
                                            placeholder="03"
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Tema/Cor</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {THEMES.map(theme => (
                                            <button
                                                key={theme.id}
                                                type="button"
                                                onClick={() => setColorTheme(theme.id)}
                                                className={`w-10 h-10 rounded-full ${theme.bg} ${colorTheme === theme.id ? 'ring-4 ring-offset-2 ring-primary dark:ring-offset-slate-900' : 'opacity-70 hover:opacity-100'} transition-all`}
                                                title={theme.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddCardModalOpen(false);
                                            resetForm();
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
                                        {isSubmitting ? 'Salvando...' : 'Salvar Cartão'}
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
