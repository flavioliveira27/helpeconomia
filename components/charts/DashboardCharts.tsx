import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useFinancial } from '../../contexts/FinancialContext';
import { TransactionType } from '../../types';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export const DashboardCharts: React.FC = () => {
  const { transactions } = useFinancial();

  // Prepare Data for Expenses by Category
  const expenseData = React.useMemo(() => {
    const expenses = transactions.filter(t => 
      t.type === TransactionType.FIXED_EXPENSE || 
      t.type === TransactionType.VARIABLE_EXPENSE
    );
    
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    return Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: categoryTotals[cat]
    }));
  }, [transactions]);

  // Prepare Data for Income vs Expense
  const balanceData = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    let invest = 0;

    transactions.forEach(t => {
      const val = Number(t.amount);
      if (t.type === TransactionType.INCOME) income += val;
      else if (t.type === TransactionType.INVESTMENT) invest += val;
      else expense += val;
    });

    return [
      { name: 'Entradas', value: income, fill: '#10b981' },
      { name: 'Saídas', value: expense, fill: '#ef4444' },
      { name: 'Investido', value: invest, fill: '#3b82f6' },
    ];
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Expenses by Category */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Gastos por Categoria</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Flow Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Fluxo Financeiro</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={balanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value) => `R$ ${value}`} cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {balanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};