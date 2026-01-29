import React, { useMemo, useState } from 'react';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { useFinancial } from '../contexts/FinancialContext';
import { MonthSelector } from '../components/ui/MonthSelector';
import { Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { TransactionType, TransactionPaymentMethod, TransactionImportance } from '../types';

export const Reports: React.FC = () => {
  const { getSummary, user, filteredTransactions, selectedMonth, selectedYear, setSelectedMonth } = useFinancial();
  const summary = getSummary(); // Now returns summaries based on filteredTransactions
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Use filteredTransactions instead of all transactions
  const incomeBreakdown = useMemo(() => {
    const incomes = filteredTransactions.filter(t => t.type === TransactionType.INCOME);
    const salary = incomes.filter(t => t.category === 'Salário').reduce((sum, t) => sum + Number(t.amount), 0);
    const others = incomes.filter(t => t.category !== 'Salário').reduce((sum, t) => sum + Number(t.amount), 0);
    return { salary, others };
  }, [filteredTransactions]);

  const expenseBreakdown = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === TransactionType.FIXED_EXPENSE || t.type === TransactionType.VARIABLE_EXPENSE);

    // By Method
    const creditCard = expenses
      .filter(t => t.paymentMethod === TransactionPaymentMethod.CREDIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const creditInstallments = expenses
      .filter(t => t.paymentMethod === TransactionPaymentMethod.CREDIT_INSTALLMENTS)
      .reduce((sum, t) => {
        // In filteredTransactions, installments are already divided, so we just sum the amount
        return sum + Number(t.amount);
      }, 0);

    const others = expenses
      .filter(t => ![TransactionPaymentMethod.CREDIT, TransactionPaymentMethod.CREDIT_INSTALLMENTS].includes(t.paymentMethod as TransactionPaymentMethod))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // By Importance
    const essentials = expenses.filter(t => t.importance === TransactionImportance.ESSENTIAL).reduce((sum, t) => sum + Number(t.amount), 0);
    const superfluous = expenses.filter(t => t.importance === TransactionImportance.SUPERFLUOUS).reduce((sum, t) => sum + Number(t.amount), 0);

    return { creditCard, creditInstallments, others, essentials, superfluous };
  }, [filteredTransactions]);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Header with Month Selector */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold">Relatórios Financeiros</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Análise detalhada de <span className="font-bold text-primary">{months[selectedMonth]}</span> de {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Imprimir PDF</span>
          </button>

          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>
      </header>

      {/* Print Header (Visible only on print) */}
      <div className="hidden print:block mb-8 border-b border-slate-300 pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Relatório Financeiro Mensal</h1>
        <p className="text-slate-600 mt-2">Período: {months[selectedMonth]} de {selectedYear}</p>
        <p className="text-slate-500 text-sm">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Report Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Breakdown Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Detalhamento do Período</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Clique nas categorias para expandir os detalhes</p>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {/* RECEITAS */}
              <div className="group">
                <button
                  onClick={() => toggleSection('income')}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <span className="material-icons-round">trending_up</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-700 dark:text-slate-200">Receitas Totais</div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Entradas do Mês</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(summary.totalIncome)}</span>
                    {expandedSection === 'income' ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
                  </div>
                </button>

                {expandedSection === 'income' && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-6 pb-6 pt-2 animate-fade-in">
                    <div className="pl-14 space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Salários</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(incomeBreakdown.salary)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Outras Fontes</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(incomeBreakdown.others)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DESPESAS */}
              <div className="group">
                <button
                  onClick={() => toggleSection('expense')}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
                      <span className="material-icons-round">trending_down</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-700 dark:text-slate-200">Despesas Totais</div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Saídas do Mês</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-rose-500 dark:text-rose-400">{formatMoney(summary.totalFixedExpenses + summary.totalVariableExpenses)}</span>
                    {expandedSection === 'expense' ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
                  </div>
                </button>

                {expandedSection === 'expense' && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-6 pb-6 pt-2 animate-fade-in">
                    <div className="pl-14 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Payment Method Column */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Por Método</p>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Cartão de Crédito</span>
                          <span className="font-mono text-xs font-bold text-rose-500">{formatMoney(expenseBreakdown.creditCard)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Crédito Parcelado</span>
                          <span className="font-mono text-xs font-bold text-rose-500">{formatMoney(expenseBreakdown.creditInstallments)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Outros (Pix/Débito)</span>
                          <span className="font-mono text-xs font-bold text-rose-500">{formatMoney(expenseBreakdown.others)}</span>
                        </div>
                      </div>

                      {/* Importance Column */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Por Importância</p>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 border-l-4 border-l-orange-400">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Essencial</span>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{formatMoney(expenseBreakdown.essentials)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 border-l-4 border-l-cyan-400">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Supérfluo</span>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{formatMoney(expenseBreakdown.superfluous)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SLAMS / INVESTIMENTOS */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                    <span className="material-icons-round">savings</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-700 dark:text-slate-200">Total Investido</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aportes do Mês</div>
                  </div>
                </div>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatMoney(summary.totalInvestments)}</span>
              </div>

              {/* SALDO FINAL */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${summary.balance >= 0 ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400' : 'bg-rose-100 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                    <span className="material-icons-round">account_balance</span>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-800 dark:text-white">Saldo Líquido</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{summary.balance >= 0 ? 'Positivo' : 'Negativo'}</div>
                  </div>
                </div>
                <span className={`text-2xl font-extrabold ${summary.balance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatMoney(summary.balance)}
                </span>
              </div>

            </div>
          </div>

          <div className="break-inside-avoid no-print">
            <DashboardCharts />
          </div>
        </div>

        {/* Sidebar Summary Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-pastel-sky dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-indigo-800">
            <h3 className="font-bold text-slate-800 dark:text-blue-100 mb-2">Dica Financeira</h3>
            <p className="text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              {summary.balance > 0
                ? "Parabéns! Seu saldo está positivo neste mês. Considere aumentar seus aportes em investimentos."
                : "Atenção! Seus gastos superaram seus ganhos. Revise os itens supérfluos para equilibrar as contas."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Resumo Rápido</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm text-slate-500">Receitas</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{formatMoney(summary.totalIncome)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>

              <div className="flex justify-between items-end mt-2">
                <span className="text-sm text-slate-500">Despesas</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{formatMoney(summary.totalFixedExpenses + summary.totalVariableExpenses)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((summary.totalFixedExpenses + summary.totalVariableExpenses) / (summary.totalIncome || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="text-center text-xs text-slate-400 mt-8 hidden print:block">
        Relatório gerado automaticamente pelo sistema FinanSmart.
      </div>
    </div>
  );
};