import React from 'react';
import { TransactionBlock } from '../components/spreadsheet/TransactionBlock';
import { TransactionType } from '../types';
import { useFinancial } from '../contexts/FinancialContext';
import { MonthSelector } from '../components/ui/MonthSelector';

export const Transactions: React.FC = () => {
  const { selectedMonth, selectedYear, setSelectedMonth } = useFinancial();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Planilha de Controle</h1>
          <p className="text-slate-500 mt-1">
            Gerenciando lançamentos de <span className="font-bold text-primary">{months[selectedMonth]}</span> de {selectedYear}
          </p>
        </div>
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1: Income Block - Full Width */}
        <div className="md:col-span-2 h-full">
          <TransactionBlock
            title="Entradas"
            filterTypes={[TransactionType.INCOME]}
            colorClass="bg-emerald-100"
          />
        </div>

        {/* Row 2 Left: Fixed Expenses Block */}
        <div className="h-full">
          <TransactionBlock
            title="Despesas Fixas"
            filterTypes={[TransactionType.FIXED_EXPENSE]}
            colorClass="bg-purple-100"
          />
        </div>

        {/* Row 2 Right: Investments Block */}
        <div className="h-full">
          <TransactionBlock
            title="Investimentos"
            filterTypes={[TransactionType.INVESTMENT]}
            colorClass="bg-sky-100"
          />
        </div>

        {/* Row 3: Variable Expenses (Gastos) Block - Full Width */}
        <div className="md:col-span-2 h-full">
          <TransactionBlock
            title="Gastos"
            filterTypes={[TransactionType.VARIABLE_EXPENSE]}
            colorClass="bg-red-100"
            showExtraColumns={true}
          />
        </div>
      </div>
    </div>
  );
};