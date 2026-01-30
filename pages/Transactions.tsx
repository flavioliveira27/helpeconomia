import React from 'react';
import { TransactionBlock } from '../components/spreadsheet/TransactionBlock';
import { TransactionType } from '../types';
import { useFinancial } from '../contexts/FinancialContext';
import { MonthSelector } from '../components/ui/MonthSelector';
import { HeaderActions } from '../components/ui/HeaderActions';

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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Planilha de Controle</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gerenciando lançamentos de <span className="font-bold text-primary">{months[selectedMonth]}</span> de {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HeaderActions />
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Block 1: Income */}
        <div className="w-full">
          <TransactionBlock
            title="Entradas"
            filterTypes={[TransactionType.INCOME]}
            colorClass="bg-emerald-100"
          />
        </div>

        {/* Block 2: Fixed Expenses */}
        <div className="w-full">
          <TransactionBlock
            title="Despesas Fixas"
            filterTypes={[TransactionType.FIXED_EXPENSE]}
            colorClass="bg-purple-100"
          />
        </div>

        {/* Block 3: Investments */}
        <div className="w-full">
          <TransactionBlock
            title="Investimentos"
            filterTypes={[TransactionType.INVESTMENT]}
            colorClass="bg-sky-100"
          />
        </div>

        {/* Block 4: Variable Expenses (Gastos) */}
        <div className="w-full">
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