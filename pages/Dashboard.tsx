import React, { useMemo, useState, useEffect } from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { TransactionType } from '../types';
import { CATEGORY_THEMES } from '../constants';
import { Link } from 'react-router-dom';
import { generateFinancialInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { MonthSelector } from '../components/ui/MonthSelector';
import { HeaderActions } from '../components/ui/HeaderActions';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const { getSummary, user, filteredTransactions, selectedMonth, selectedYear, setSelectedMonth } = useFinancial();
  const summary = getSummary(); // Now returns summaries based on filtered transactions
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Format helpers
  const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Calculate chart distribution (Income, Fixed, Variable, Investments)
  // We want to visualize where money goes vs income, or just a breakdown.
  // Standard financial distribution usually shows: Fixed, Variable, Investment, Remaining (Balance).
  // User asked for: "entradas, despesas fixas, gastos e investimentos".
  // Let's assume a breakdown of the Total Income found vs its usage.

  const totalIncome = summary.totalIncome;
  const totalFixed = summary.totalFixedExpenses;
  const totalVariable = summary.totalVariableExpenses;
  const totalInvestments = summary.totalInvestments;

  // Calculate remaining balance/surplus for accurate pie completion if income > expenses
  // However, often users want to see the composition of their MONEY.
  // Let's use Total Income as the 100% mark. IF total expenses > income, we use total expenses.
  const baseTotal = Math.max(totalIncome, (totalFixed + totalVariable + totalInvestments));

  const percentIncome = baseTotal > 0 ? (totalIncome / baseTotal) * 100 : 0; // Usually 100% or less if deficit
  // We will plot the USAGE of money: Fixed, Variable, Investments, and Remaining Balance.

  const percentFixed = baseTotal > 0 ? (totalFixed / baseTotal) * 100 : 0;
  const percentVariable = baseTotal > 0 ? (totalVariable / baseTotal) * 100 : 0;
  const percentInvestments = baseTotal > 0 ? (totalInvestments / baseTotal) * 100 : 0;
  // Balance is what is left from Income. If negative, 0.
  const balanceVal = Math.max(0, totalIncome - (totalFixed + totalVariable + totalInvestments));
  const percentBalance = baseTotal > 0 ? (balanceVal / baseTotal) * 100 : 0;

  // SVG Circumference for radius 90 is 2 * pi * 90 = 565.48
  const circumference = 565.48;
  const strokeFixed = (percentFixed / 100) * circumference;
  const strokeVariable = (percentVariable / 100) * circumference;
  const strokeInvestments = (percentInvestments / 100) * circumference;
  const strokeBalance = (percentBalance / 100) * circumference;

  // Reset AI state when month changes
  useEffect(() => {
    setInsight("");
    setHasLoaded(false);
  }, [selectedMonth, selectedYear]);

  // Recent transactions (last 4 from filtered)
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [filteredTransactions]);

  const handleGenerateInsight = async () => {
    setLoading(true);
    // Pass filtered transactions to AI
    const result = await generateFinancialInsights(filteredTransactions);
    setInsight(result);
    setLoading(false);
    setHasLoaded(true);
  };

  const getCategoryTheme = (category: string) => {
    return CATEGORY_THEMES[category] || CATEGORY_THEMES['Outros'];
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Olá, {user?.name}! 👋</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Resumo de <span className="font-bold text-primary">{months[selectedMonth]}</span> de {selectedYear}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <HeaderActions />
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>
      </header>

      {/* AI Section - Hidden on Mobile, Visible on Desktop (lg+) */}
      <section className="hidden lg:block bg-gradient-to-r from-pastel-sky to-pastel-purple dark:from-indigo-900/40 dark:to-purple-900/40 p-8 rounded-2xl border border-blue-100 dark:border-indigo-800 relative overflow-hidden transition-all">
        <div className="relative z-10 flex flex-col items-start gap-6 w-full">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 w-full">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-xl shadow-blue-100 dark:shadow-none shrink-0 text-center md:text-left">
              <span className="material-icons-round text-6xl text-primary animate-bounce">auto_awesome</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                Consultor IA
                <span className="bg-primary text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">Smart</span>
              </h3>
              {!hasLoaded && !loading && (
                <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed mx-auto md:mx-0">
                  Clique para gerar insights sobre suas finanças de <strong>{months[selectedMonth]}</strong>.
                </p>
              )}
            </div>
            <button
              onClick={handleGenerateInsight}
              disabled={loading}
              className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className={`material-icons-round text-xl ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'refresh' : 'auto_awesome'}
              </span>
              {loading ? 'Gerando...' : (hasLoaded ? 'Gerar Novamente' : 'Gerar Insights')}
            </button>
          </div>

          {/* AI Result Area */}
          {(hasLoaded || loading) && (
            <div className="w-full bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 mt-4 backdrop-blur-sm border border-white/50 dark:border-slate-700/50">
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-4 bg-primary/20 rounded w-full"></div>
                  <div className="h-4 bg-primary/20 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                  <ReactMarkdown>{insight}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="order-2 md:order-none bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Receitas</p>
            <div className="bg-pastel-mint dark:bg-teal-900/30 p-3 rounded-2xl text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <span className="material-icons-round">trending_up</span>
            </div>
          </div>
          <p className="text-2xl font-bold">{formatMoney(summary.totalIncome)}</p>
          <Link to="/reports" className="text-xs text-slate-400 mt-4 flex items-center gap-1 hover:text-primary transition-colors">
            Ver detalhes <span className="material-icons-round text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="order-3 md:order-none bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Despesas</p>
            <div className="bg-pastel-coral dark:bg-rose-900/30 p-3 rounded-2xl text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <span className="material-icons-round">trending_down</span>
            </div>
          </div>
          <p className="text-2xl font-bold">{formatMoney(summary.totalFixedExpenses + summary.totalVariableExpenses)}</p>
          <Link to="/reports" className="text-xs text-slate-400 mt-4 flex items-center gap-1 hover:text-primary transition-colors">
            Ver detalhes <span className="material-icons-round text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="order-4 md:order-none bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Investimentos</p>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <span className="material-icons-round">savings</span>
            </div>
          </div>
          <p className="text-2xl font-bold">{formatMoney(summary.totalInvestments)}</p>
          <Link to="/reports" className="text-xs text-slate-400 mt-4 flex items-center gap-1 hover:text-primary transition-colors">
            Ver detalhes <span className="material-icons-round text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="order-1 md:order-none bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-white to-pastel-mint dark:from-slate-900 dark:to-teal-900/10">
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 text-center">Saldo em Caixa</p>
          <p className={`text-4xl font-extrabold text-center drop-shadow-sm ${summary.balance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatMoney(summary.balance)}
          </p>
          <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${summary.balance >= 0 ? 'bg-teal-500' : 'bg-rose-500'}`}
              style={{ width: `${summary.totalIncome > 0 ? Math.min(100, Math.max(0, (summary.balance / summary.totalIncome) * 100)) : 0}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-center mt-2 text-slate-400 font-bold uppercase tracking-widest min-h-[15px]">
            {summary.balance > 0 ? 'Saldo Positivo' : summary.balance < 0 ? 'Saldo Negativo' : 'Saldo Zerado'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribution Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-6">Distribuição de Gastos</h3>
          <div className="flex justify-center relative py-4">
            <PieChart width={240} height={240}>
              <Pie
                data={[
                  { name: 'Despesas Fixas', value: totalFixed, color: '#c084fc' },
                  { name: 'Gastos', value: totalVariable, color: '#f87171' },
                  { name: 'Metas', value: totalInvestments, color: '#38bdf8' },
                  { name: 'Saldo Restante', value: balanceVal, color: '#34d399' }
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {[
                  { name: 'Despesas Fixas', value: totalFixed, color: '#c084fc' },
                  { name: 'Gastos', value: totalVariable, color: '#f87171' },
                  { name: 'Metas', value: totalInvestments, color: '#38bdf8' },
                  { name: 'Saldo Restante', value: balanceVal, color: '#34d399' }
                ].filter(item => item.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatMoney(value)}
                itemStyle={{ color: '#334155', fontWeight: 600 }}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                cursor={false}
                wrapperStyle={{ zIndex: 50 }}
              />
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">{formatMoney(balanceVal)}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Saldo Restante</span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-sm font-medium">Despesas Fixas</span>
              </div>
              <span className="text-sm font-bold">{Math.round(percentFixed)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm font-medium">Gastos</span>
              </div>
              <span className="text-sm font-bold">{Math.round(percentVariable)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-400"></div>
                <span className="text-sm font-medium">Metas</span>
              </div>
              <span className="text-sm font-bold">{Math.round(percentInvestments)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-sm font-medium">Saldo Restante</span>
              </div>
              <span className="text-sm font-bold">{Math.round(percentBalance)}%</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-bold">Transações de {months[selectedMonth]}</h3>
            <Link to="/transactions" className="text-sm font-bold text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="p-4 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4 px-4">Descrição</th>
                    <th className="pb-4 px-4">Categoria</th>
                    <th className="pb-4 px-4">Data</th>
                    <th className="pb-4 px-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Nenhuma transação encontrada neste mês.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pastel-sky/50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                              <span className="material-icons-round text-xl">shopping_basket</span>
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{transaction.description}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded border text-xs font-bold shadow-sm whitespace-nowrap ${getCategoryTheme(transaction.category)}`}>{transaction.category}</span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className={`py-4 px-4 text-right font-bold ${transaction.type === TransactionType.INCOME ? 'text-teal-600' : 'text-rose-500'
                          }`}>
                          {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatMoney(transaction.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  Nenhuma transação encontrada neste mês.
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-500 shadow-sm">
                          <span className="material-icons-round text-xl">
                            {transaction.type === TransactionType.INCOME ? 'trending_up' : 'shopping_basket'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">{transaction.description}</p>
                          <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${transaction.type === TransactionType.INCOME ? 'text-teal-600' : 'text-rose-500'}`}>
                        {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatMoney(transaction.amount)}
                      </div>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded border text-[10px] font-bold shadow-sm whitespace-nowrap ${getCategoryTheme(transaction.category)}`}>
                        {transaction.category}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/message/4OZZDQTHZIRJI1"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
        title="Falar com Suporte"
      >
        <div className="absolute opacity-0 group-hover:opacity-100 right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none">
          Falar com Suporte
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="fill-current"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      </a>
    </>
  );
};