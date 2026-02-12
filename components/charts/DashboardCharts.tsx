import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { useFinancial } from '../../contexts/FinancialContext';
import { TransactionType, TransactionImportance } from '../../types';
import { getTransactionsForMonth } from '../../utils/financialUtils';

import { CATEGORY_COLORS } from '../../constants';

const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || '#94a3b8'; // Default to slate if not found
};

const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


export const CategoryChart: React.FC = () => {
  const { filteredTransactions } = useFinancial();

  const { data: expenseData, totalExpenses } = useMemo(() => {
    const expenses = filteredTransactions.filter(t =>
      t.type === TransactionType.FIXED_EXPENSE ||
      t.type === TransactionType.VARIABLE_EXPENSE
    );

    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    const data = Object.keys(categoryTotals)
      .map((cat, index) => ({
        name: cat,
        value: categoryTotals[cat],
        color: getCategoryColor(cat)
      }))
      .sort((a, b) => b.value - a.value);

    return { data, totalExpenses: total };
  }, [filteredTransactions]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Gastos por Categoria</h3>

      <div className="flex justify-center relative py-4 shrink-0">
        <div className="h-64 w-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {expenseData.map((entry, index) => (
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
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">
              {formatMoney(totalExpenses)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Total
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {expenseData.length > 0 ? (
          expenseData.map((item) => (
            <div key={item.name} className="flex items-center justify-between group cursor-default py-0.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0}%
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
                  {formatMoney(item.value)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-400 py-4 text-xs">
            Sem registros.
          </div>
        )}
      </div>
    </div>
  );
};

export const Rule503020: React.FC = () => {
  const { filteredTransactions } = useFinancial();

  const rule503020 = useMemo(() => {
    let income = 0;
    let essentials = 0;
    let lifestyle = 0;
    let investments = 0;

    filteredTransactions.forEach(t => {
      const val = Number(t.amount);
      if (t.type === TransactionType.INCOME) {
        income += val;
      } else {
        const category = t.category;
        const investCats = ['Renda Fixa', 'Renda Variável', 'Reserva de Emergência', 'Meta', 'Investimento Fixo', 'Criptomoeda', 'Fundo Cambial', 'Poupança', 'Reserva Geral', 'Doação'];
        const essentialCats = ['Moradia', 'Assinatura', 'Transporte', 'Concessionárias', 'Alimentação', 'Saúde', 'Educação'];
        const lifestyleCats = ['Juros', 'Prestação', 'Lazer', 'Extras', 'Veículo', 'Diversos'];

        if (investCats.includes(category) || t.type === TransactionType.INVESTMENT) {
          investments += val;
        } else if (essentialCats.includes(category)) {
          essentials += val;
        } else if (lifestyleCats.includes(category)) {
          lifestyle += val;
        } else {
          // Fallback logic
          if (t.importance === TransactionImportance.ESSENTIAL) {
            essentials += val;
          } else {
            lifestyle += val;
          }
        }
      }
    });

    const base = income > 0 ? income : 1;

    return {
      income,
      essentials: { value: essentials, percent: Math.round((essentials / base) * 100) },
      lifestyle: { value: lifestyle, percent: Math.round((lifestyle / base) * 100) },
      investments: { value: investments, percent: Math.round((investments / base) * 100) }
    };
  }, [filteredTransactions]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Regra 50/30/20</h3>
            <p className="text-xs text-slate-500 mt-1">Análise ideal de distribuição de renda</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            <span className="material-icons-round text-xl">pie_chart</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Essentials */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-600 dark:text-slate-300">Essenciais (50%)</span>
              <span className={`font-bold ${rule503020.essentials.percent > 55 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {rule503020.essentials.percent}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${rule503020.essentials.percent > 55 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, rule503020.essentials.percent)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{formatMoney(rule503020.essentials.value)} gastos</p>
          </div>

          {/* Lifestyle */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-600 dark:text-slate-300">Estilo de Vida (30%)</span>
              <span className={`font-bold ${rule503020.lifestyle.percent > 35 ? 'text-rose-500' : 'text-blue-500'}`}>
                {rule503020.lifestyle.percent}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${rule503020.lifestyle.percent > 35 ? 'bg-rose-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, rule503020.lifestyle.percent)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{formatMoney(rule503020.lifestyle.value)} gastos</p>
          </div>

          {/* Investments */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-600 dark:text-slate-300">Investimentos (20%)</span>
              <span className={`font-bold ${rule503020.investments.percent < 10 ? 'text-orange-500' : 'text-purple-500'}`}>
                {rule503020.investments.percent}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${rule503020.investments.percent < 10 ? 'bg-orange-500' : 'bg-purple-500'}`}
                style={{ width: `${Math.min(100, rule503020.investments.percent)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{formatMoney(rule503020.investments.value)} investidos</p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
        <p className="text-xs text-slate-400 italic text-center">Renda Total: {formatMoney(rule503020.income)}</p>
      </div>
    </div>
  );
};

export const TopVillains: React.FC = () => {
  const { filteredTransactions } = useFinancial();

  const topVillains = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === TransactionType.VARIABLE_EXPENSE)
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);
  }, [filteredTransactions]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Maiores Gastos</h3>
          <p className="text-xs text-slate-500 mt-1">5 maiores gastos do mês</p>
        </div>
        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500 dark:text-rose-400">
          <span className="material-icons-round text-xl">money_off</span>
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        {topVillains.length > 0 ? (
          topVillains.map((t, idx) => (
            <div key={t.id} className="flex items-center gap-4 group">
              <span className="text-2xl font-bold text-slate-200 dark:text-slate-700 group-hover:text-rose-200 transition-colors">0{idx + 1}</span>
              <div className="flex-1">
                <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                <p className="text-xs text-slate-400">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <span className="font-bold text-rose-500">{formatMoney(t.amount)}</span>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 py-6">Nenhuma despesa alta registrada.</p>
        )}
      </div>
    </div>
  );
};

export const Trends: React.FC = () => {
  const { filteredTransactions, transactions, selectedMonth, selectedYear } = useFinancial();

  const monthComparison = useMemo(() => {
    let currentIncome = 0;
    let currentExpense = 0;

    filteredTransactions.forEach(t => {
      if (t.type === TransactionType.INCOME) currentIncome += Number(t.amount);
      else if (t.type !== TransactionType.INVESTMENT) currentExpense += Number(t.amount);
    });

    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;

    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear = selectedYear - 1;
    }

    const prevTransactions = getTransactionsForMonth(transactions, prevYear, prevMonth);

    let prevIncome = 0;
    let prevExpense = 0;

    prevTransactions.forEach(t => {
      if (t.type === TransactionType.INCOME) prevIncome += Number(t.amount);
      else if (t.type !== TransactionType.INVESTMENT) prevExpense += Number(t.amount);
    });

    const calcDelta = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      incomeDelta: calcDelta(currentIncome, prevIncome),
      expenseDelta: calcDelta(currentExpense, prevExpense),
      prevIncome,
      prevExpense
    };
  }, [filteredTransactions, transactions, selectedMonth, selectedYear]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Tendências</h3>
            <p className="text-xs text-slate-500 mt-1">Comparado ao mês anterior</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
            <span className="material-icons-round text-xl">show_chart</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Income Trend */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-emerald-500 shadow-sm">
                <span className="material-icons-round text-lg">arrow_upward</span>
              </div>
              <span className="font-medium text-slate-600 dark:text-slate-300">Receitas</span>
            </div>
            <div className="text-right">
              <div className={`font-bold ${monthComparison.incomeDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {monthComparison.incomeDelta > 0 ? '+' : ''}{Math.round(monthComparison.incomeDelta)}%
              </div>
              <div className="text-xs text-slate-400">vs. {formatMoney(monthComparison.prevIncome)}</div>
            </div>
          </div>

          {/* Expense Trend */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-rose-500 shadow-sm">
                <span className="material-icons-round text-lg">arrow_downward</span>
              </div>
              <span className="font-medium text-slate-600 dark:text-slate-300">Despesas</span>
            </div>
            <div className="text-right">
              {/* If expenses went DOWN (negative delta), that's GOOD (Emerald). If UP, BAD (Rose) */}
              <div className={`font-bold ${monthComparison.expenseDelta <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {monthComparison.expenseDelta > 0 ? '+' : ''}{Math.round(monthComparison.expenseDelta)}%
              </div>
              <div className="text-xs text-slate-400">vs. {formatMoney(monthComparison.prevExpense)}</div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
        Automático com base no histórico.
      </p>
    </div>
  );
};

export const SixMonthEvolutionChart: React.FC = () => {
  const { transactions, selectedMonth, selectedYear } = useFinancial();

  const data = useMemo(() => {
    // Generate last 6 months list based on selected date
    // Note: This logic assumes we want to see [Month-5, ... , SelectedMonth]
    const result = [];
    let currentDate = new Date(selectedYear, selectedMonth, 1);

    // Go back 5 months to start
    currentDate.setMonth(currentDate.getMonth() - 5);

    for (let i = 0; i < 6; i++) {
      const m = currentDate.getMonth();
      const y = currentDate.getFullYear();

      // Filter transactions for this month/year using the shared utility
      const monthTrans = getTransactionsForMonth(transactions, y, m);

      // Sum Income and Expenses
      let income = 0;
      let expense = 0;
      monthTrans.forEach(t => {
        if (t.type === TransactionType.INCOME) income += Number(t.amount);
        else if (t.type === TransactionType.FIXED_EXPENSE || t.type === TransactionType.VARIABLE_EXPENSE) expense += Number(t.amount);
      });

      // Add to result
      // Format name like "Jan/24"
      const name = new Date(y, m, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      result.push({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        Receitas: income,
        Despesas: expense
      });

      // Next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return result;
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Evolução Semestral</h3>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(val) => `R$ ${val / 1000}k`}
            />
            <Tooltip
              formatter={(value: number) => formatMoney(value)}
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const InvestmentDistributionChart: React.FC = () => {
  const { filteredTransactions } = useFinancial();

  const { data: investmentData, totalInvested } = useMemo(() => {
    const investments = filteredTransactions.filter(t => t.type === TransactionType.INVESTMENT);

    const categoryTotals: Record<string, number> = {};
    investments.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    const data = Object.keys(categoryTotals)
      .map((cat) => ({
        name: cat,
        value: categoryTotals[cat],
        color: getCategoryColor(cat)
      }))
      .sort((a, b) => b.value - a.value);

    return { data, totalInvested: total };
  }, [filteredTransactions]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Distribuição de Investimentos</h3>

      <div className="flex justify-center relative py-4 shrink-0">
        <div className="h-64 w-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={investmentData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {investmentData.map((entry, index) => (
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
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">
              {formatMoney(totalInvested)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Total
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {investmentData.length > 0 ? (
          investmentData.map((item) => (
            <div key={item.name} className="flex items-center justify-between group cursor-default py-0.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalInvested > 0 ? Math.round((item.value / totalInvested) * 100) : 0}%
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
                  {formatMoney(item.value)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-400 py-4 text-xs">
            Sem investimentos.
          </div>
        )}
      </div>
    </div>
  );
};

// Deprecated wrapper to maintain backward compatibility if used anywhere else
// But mostly to just import everything
export const IncomeChart: React.FC = () => {
  const { filteredTransactions } = useFinancial();

  const { data: incomeData, totalIncome } = useMemo(() => {
    const incomes = filteredTransactions.filter(t => t.type === TransactionType.INCOME);

    const categoryTotals: Record<string, number> = {};
    incomes.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    const data = Object.keys(categoryTotals)
      .map((cat, index) => ({
        name: cat,
        value: categoryTotals[cat],
        color: getCategoryColor(cat)
      }))
      .sort((a, b) => b.value - a.value);

    return { data, totalIncome: total };
  }, [filteredTransactions]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Receitas por Categoria</h3>

      <div className="flex justify-center relative py-4 shrink-0">
        <div className="h-64 w-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {incomeData.map((entry, index) => (
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
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">
              {formatMoney(totalIncome)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Total
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {incomeData.length > 0 ? (
          incomeData.map((item) => (
            <div key={item.name} className="flex items-center justify-between group cursor-default py-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalIncome > 0 ? Math.round((item.value / totalIncome) * 100) : 0}%
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
                  {formatMoney(item.value)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-400 py-4 text-xs">
            Sem receitas.
          </div>
        )}
      </div>
    </div>
  );
};

export const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Rule503020 />
      <TopVillains />
      <Trends />
      <CategoryChart />
      <SixMonthEvolutionChart />
      <InvestmentDistributionChart />
    </div>
  );
}

export default DashboardCharts;