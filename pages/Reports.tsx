import React, { useMemo, useState } from 'react';
import {
  CategoryChart,
  Rule503020,
  TopVillains,
  Trends,
  SixMonthEvolutionChart,
  InvestmentDistributionChart,
  IncomeChart
} from '../components/charts/DashboardCharts';
import { useFinancial } from '../contexts/FinancialContext';
import { MonthSelector } from '../components/ui/MonthSelector';
import { HeaderActions } from '../components/ui/HeaderActions';
import { Printer, ChevronDown, ChevronUp, Download } from 'lucide-react';
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

  const handleExportExcel = () => {
    // 1. Define Styles and content for the HTML-based Excel file
    // This allows us to use colors, fonts, and borders without external libraries like exceljs (which requires npm).

    // Helper to format currency for the Excel view
    const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fmtDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

    let tableRows = '';

    filteredTransactions.forEach(t => {
      // Determine Row Color based on Type
      // Using light pastels for readability
      let bgStyle = '';
      let textStyle = 'color: #334155;'; // Slate 700

      if (t.type === 'receita') {
        bgStyle = 'background-color: #d1fae5;'; // Emerald 100
        textStyle = 'color: #065f46;'; // Emerald 800
      } else if (t.type === 'despesa_fixa' || t.type === 'despesa_variavel') {
        bgStyle = 'background-color: #ffe4e6;'; // Rose 100
        textStyle = 'color: #9f1239;'; // Rose 800
      } else if (t.type === 'investimento') {
        bgStyle = 'background-color: #dbeafe;'; // Blue 100
        textStyle = 'color: #1e40af;'; // Blue 800
      }

      tableRows += `
        <tr style="${bgStyle} ${textStyle}">
          <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${fmtDate(t.date)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">${t.description}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">${t.category}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: right; font-weight: bold;">${fmt(Number(t.amount))}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">${t.paymentMethod || '-'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">${t.importance || '-'}</td>
        </tr>
      `;
    });

    // Create the full HTML content
    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Relatório ${months[selectedMonth]}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Arial', sans-serif; }
          .title { font-size: 18px; font-weight: bold; text-align: center; color: #0f172a; margin-bottom: 10px; }
          .subtitle { font-size: 12px; text-align: center; color: #64748b; margin-bottom: 20px; }
          th { background-color: #1e293b; color: #ffffff; padding: 10px; font-weight: bold; border: 1px solid #0f172a; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="6" class="title" style="background-color: #f1f5f9; height: 40px; font-size: 20px; vertical-align: middle;">HelpEconomia - Relatório Mensal</td>
          </tr>
          <tr>
            <td colspan="6" class="subtitle" style="text-align: center; color: #64748b;">
              Período: ${months[selectedMonth]} de ${selectedYear} | Gerado em: ${new Date().toLocaleDateString('pt-BR')}
            </td>
          </tr>
          <tr>
            <td colspan="6"></td>
          </tr>
          <!-- Table Headers -->
          <tr>
            <th style="width: 100px;">Data</th>
            <th style="width: 300px;">Descrição</th>
            <th style="width: 150px;">Categoria</th>
            <th style="width: 120px;">Valor</th>
            <th style="width: 150px;">Método</th>
            <th style="width: 120px;">Importância</th>
          </tr>
          <!-- Data -->
          ${tableRows}
          <!-- Totals Row -->
           <tr>
            <td colspan="6"></td>
          </tr>
           <tr style="background-color: #f8fafc; font-weight: bold;">
            <td colspan="3" style="text-align: right; padding: 10px;">Saldo Líquido:</td>
            <td style="text-align: right; color: ${summary.balance >= 0 ? '#059669' : '#e11d48'}; border: 1px solid #cbd5e1;">${fmt(summary.balance)}</td>
            <td colspan="2"></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Create Blob with Excel MIME type
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Note: .xls extension triggers the HTML parsing in Excel
    link.setAttribute('download', `Relatorio_HelpEconomia_${months[selectedMonth]}_${selectedYear}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const investmentBreakdown = useMemo(() => {
    const investments = filteredTransactions.filter(t => t.type === TransactionType.INVESTMENT);
    const byCategory = investments.reduce((acc, t) => {
      const category = t.category || 'Outros';
      acc[category] = (acc[category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Derived state for Print Report (Expense Categories)
  const expenseCategoryBreakdown = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === TransactionType.FIXED_EXPENSE || t.type === TransactionType.VARIABLE_EXPENSE);
    const byCategory = expenses.reduce((acc, t) => {
      const category = t.category || 'Outros';
      acc[category] = (acc[category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Derived state for Print Report (Income Categories - Detailed)
  const incomeCategoryBreakdown = useMemo(() => {
    const incomes = filteredTransactions.filter(t => t.type === TransactionType.INCOME);
    const byCategory = incomes.reduce((acc, t) => {
      const category = t.category || 'Outros';
      acc[category] = (acc[category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Top 5 Expenses for Print Report
  const topExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === TransactionType.FIXED_EXPENSE || t.type === TransactionType.VARIABLE_EXPENSE)
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);
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

      {/* Screen Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold">Relatórios Financeiros</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Análise detalhada de <span className="font-bold text-primary">{months[selectedMonth]}</span> de {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <HeaderActions />
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors font-medium text-sm shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
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

      {/* --- PROFESSIONAL PRINT LAYOUT (A4) --- */}
      <div className="hidden print:block w-full text-slate-900">
        {/* Print Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-1">HelpEconomia</h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">Relatório Financeiro Mensal</p>
          <div className="mt-4 flex justify-center items-center gap-4">
            <span className="px-3 py-1 bg-slate-100 rounded text-sm font-bold">{months[selectedMonth]} {selectedYear}</span>
            <span className="text-xs text-slate-400">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 border border-slate-200 rounded-lg bg-emerald-50 text-center">
            <span className="block text-xs uppercase font-bold text-slate-500 mb-1">Receitas</span>
            <span className="text-xl font-bold text-emerald-700">{formatMoney(summary.totalIncome)}</span>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-rose-50 text-center">
            <span className="block text-xs uppercase font-bold text-slate-500 mb-1">Despesas</span>
            <span className="text-xl font-bold text-rose-700">{formatMoney(summary.totalFixedExpenses + summary.totalVariableExpenses)}</span>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-blue-50 text-center">
            <span className="block text-xs uppercase font-bold text-slate-500 mb-1">Investimentos</span>
            <span className="text-xl font-bold text-blue-700">{formatMoney(summary.totalInvestments)}</span>
          </div>
          <div className={`p-4 border border-slate-200 rounded-lg text-center ${summary.balance >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
            <span className="block text-xs uppercase font-bold text-slate-600 mb-1">Saldo Líquido</span>
            <span className={`text-xl font-bold ${summary.balance >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>{formatMoney(summary.balance)}</span>
          </div>
        </div>

        {/* Top Expenses Section */}
        <div className="mb-8 break-inside-avoid p-6 border border-slate-200 rounded-xl">
          <h3 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-300 pb-2 mb-4">5 maiores gastos do mês</h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-xs text-slate-500 uppercase">
              <tr>
                <th className="py-2 px-3 text-left">Descrição</th>
                <th className="py-2 px-3 text-left">Categoria</th>
                <th className="py-2 px-3 text-center">Data</th>
                <th className="py-2 px-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topExpenses.map((expense, idx) => (
                <tr key={expense.id || idx} className="even:bg-slate-50/50">
                  <td className="py-2 px-3 font-medium text-slate-700">{expense.description}</td>
                  <td className="py-2 px-3 text-slate-500 text-xs">{expense.category}</td>
                  <td className="py-2 px-3 text-center text-slate-500 text-xs">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-600">{formatMoney(Number(expense.amount))}</td>
                </tr>
              ))}
              {topExpenses.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-slate-400 italic">Nenhum gasto registrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detailed Columns Grid - Stacked Vertically */}
        <div className="flex flex-col gap-6">
          {/* Income Column */}
          <div className="break-inside-avoid w-full p-6 border border-slate-200 rounded-xl">
            <h3 className="text-sm font-bold uppercase text-slate-800 border-b border-emerald-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Detalhamento Receitas
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 font-semibold">Categoria</th>
                  <th className="text-right py-2 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomeCategoryBreakdown.map((item) => (
                  <tr key={item.name}>
                    <td className="py-2 text-slate-600">{item.name}</td>
                    <td className="py-2 text-right font-medium text-emerald-600">{formatMoney(item.value)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td className="py-2 text-slate-800 pl-2">Total</td>
                  <td className="py-2 text-right text-emerald-700">{formatMoney(summary.totalIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Expenses Column */}
          <div className="break-inside-avoid w-full p-6 border border-slate-200 rounded-xl">
            <h3 className="text-sm font-bold uppercase text-slate-800 border-b border-rose-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Detalhamento Despesas
            </h3>
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 font-semibold">Categoria</th>
                  <th className="text-right py-2 font-semibold">%</th>
                  <th className="text-right py-2 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenseCategoryBreakdown.map((item) => {
                  const total = summary.totalFixedExpenses + summary.totalVariableExpenses;
                  const percent = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <tr key={item.name}>
                      <td className="py-2 text-slate-600 truncate">{item.name}</td>
                      <td className="py-2 text-right text-slate-400 text-xs font-mono">{Math.round(percent)}%</td>
                      <td className="py-2 text-right font-medium text-rose-600">{formatMoney(item.value)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td className="py-2 text-slate-800 pl-2">Total</td>
                  <td className="py-2 text-right">100%</td>
                  <td className="py-2 text-right text-rose-700">{formatMoney(summary.totalFixedExpenses + summary.totalVariableExpenses)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Investments Section */}
        {summary.totalInvestments > 0 && (
          <div className="mt-2 break-inside-avoid p-6 border border-slate-200 rounded-xl">
            <h3 className="text-sm font-bold uppercase text-slate-800 border-b border-blue-500 pb-2 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Investimentos
            </h3>
            {/* Visual Distribution Bar */}
            <div className="flex h-4 w-full rounded-md overflow-hidden bg-slate-100 mb-6">
              {investmentBreakdown.map((item, idx) => {
                const colors = ['bg-blue-600', 'bg-indigo-500', 'bg-sky-500', 'bg-cyan-500', 'bg-teal-500'];
                const color = colors[idx % colors.length];
                const width = (item.value / summary.totalInvestments) * 100;
                if (width < 0.5) return null;
                return <div key={item.name} className={`${color} h-full border-r border-white/20`} style={{ width: `${width}%` }} title={`${item.name} (${Math.round(width)}%)`}></div>;
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {investmentBreakdown.map((item) => (
                <div key={item.name} className="flex justify-between items-center p-3 border border-slate-100 rounded bg-slate-50/50">
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  <span className="text-sm font-bold text-blue-700">{formatMoney(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info/Signature area */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col items-center justify-center text-xs text-slate-400 text-center gap-1 opacity-70">
          <p className="font-semibold uppercase tracking-wider">{user?.name || 'Usuário'}</p>
          <p>Relatório gerado automaticamente • HelpEconomia</p>
        </div>
      </div>

      {/* --- INTERACTIVE DASHBOARD (Screen Only) --- */}
      <div className="space-y-8 print:hidden">

        {/* Top Section: Breakdown & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detailed Breakdown Card - Spans 2 cols */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
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
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 pb-4 pt-2 animate-fade-in">
                    <div className="space-y-3">
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
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 pb-4 pt-2 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Payment Method Column */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Por Método</p>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Cartão de Crédito (À vista)</span>
                          <span className="font-mono text-xs font-bold text-rose-500">{formatMoney(expenseBreakdown.creditCard)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Cartão de Crédito (Parcelas)</span>
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
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 border-l-4 border-l-blue-500">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Essencial</span>
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{formatMoney(expenseBreakdown.essentials)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 border-l-4 border-l-red-500">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Supérfluo</span>
                          <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">{formatMoney(expenseBreakdown.superfluous)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SLAMS / INVESTIMENTOS */}
              <div className="group">
                <button
                  onClick={() => toggleSection('investment')}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                      <span className="material-icons-round">savings</span>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-700 dark:text-slate-200">Total Investido</div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aportes do Mês</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatMoney(summary.totalInvestments)}</span>
                    {expandedSection === 'investment' ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
                  </div>
                </button>

                {expandedSection === 'investment' && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 pb-4 pt-2 animate-fade-in">
                    <div className="space-y-3">
                      {investmentBreakdown.length > 0 ? (
                        investmentBreakdown.map((item) => (
                          <div key={item.name} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{formatMoney(item.value)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Nenhum investimento registrado neste mês.</p>
                      )}
                    </div>
                  </div>
                )}
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

          {/* Tip Card - Spans 1 col */}
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

                <div className="flex justify-between items-end mt-2">
                  <span className="text-sm text-slate-500">Investimentos</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{formatMoney(summary.totalInvestments)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (summary.totalInvestments / (summary.totalIncome || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 break-inside-avoid no-print">
          {/* Row 1: KPI & Trends */}
          <div className="h-full"><Rule503020 /></div>
          <div className="h-full"><TopVillains /></div>
          <div className="h-full"><Trends /></div>

          {/* Row 2: Category | Evolution | Investments */}
          <div className="h-full"><CategoryChart /></div>
          <div className="h-full"><SixMonthEvolutionChart /></div>
          <div className="h-full"><InvestmentDistributionChart /></div>
        </div>

      </div>

    </div>
  );
};