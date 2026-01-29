import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionPaymentMethod, TransactionImportance } from '../../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useFinancial } from '../../contexts/FinancialContext';
import { TransactionModal } from './TransactionModal';
import { Button } from '../ui/Button';

interface TransactionBlockProps {
  title: string;
  filterTypes: TransactionType[];
  colorClass: string;
  showExtraColumns?: boolean;
}

export const TransactionBlock: React.FC<TransactionBlockProps> = ({ title, filterTypes, colorClass, showExtraColumns }) => {
  const { filteredTransactions, updateTransaction, addTransaction, deleteTransaction } = useFinancial();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const blockTransactions = filteredTransactions.filter(t => filterTypes.includes(t.type));

  // Context now handles the installment math, so we just sum the amount provided
  const total = blockTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSave = (data: Partial<Transaction>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data as Omit<Transaction, 'id'>);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Parse colorClass (e.g., 'bg-emerald-100') to get the base color name
  // This assumes the format 'bg-COLOR-SHADE'
  const baseColor = colorClass.split('-')[1] || 'slate';

  const getCategoryTheme = (category: string) => {
    const themes: Record<string, string> = {
      'Salário': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Extras': 'bg-teal-100 text-teal-800 border-teal-200',
      'Renda Fixa': 'bg-blue-100 text-blue-800 border-blue-200',
      'Renda Variável': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Moradia': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Contas': 'bg-red-100 text-red-800 border-red-200',
      'Saúde': 'bg-rose-100 text-rose-800 border-rose-200',
      'Educação': 'bg-violet-100 text-violet-800 border-violet-200',
      'Alimentação': 'bg-orange-100 text-orange-800 border-orange-200',
      'Transporte': 'bg-amber-100 text-amber-800 border-amber-200',
      'Lazer': 'bg-pink-100 text-pink-800 border-pink-200',
      'Outros': 'bg-slate-100 text-slate-800 border-slate-200',
      // Novos Investimentos
      'Reserva de Emergência': 'bg-sky-100 text-sky-800 border-sky-200',
      'Meta': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      'Investimento Fixo': 'bg-blue-50 text-blue-900 border-blue-200',
      'Criptomoeda': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Fundo Cambial': 'bg-emerald-50 text-emerald-900 border-emerald-200',
      'Poupança': 'bg-lime-100 text-lime-800 border-lime-200',
      'Reserva Geral': 'bg-slate-200 text-slate-800 border-slate-300',
      'Doação': 'bg-rose-50 text-rose-900 border-rose-200',
    };
    return themes[category] || themes['Outros'];
  };

  return (
    <div className={`flex flex-col h-full bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden font-inter`}>
      {/* Header - Colored Background */}
      <div className={`px-5 py-4 border-b border-${baseColor}-200 flex justify-between items-center bg-${baseColor}-100`}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-full bg-${baseColor}-200 text-${baseColor}-700`}>
            {/* Icon placeholder or just visual dot */}
            <div className={`w-2 h-2 rounded-full bg-${baseColor}-600`}></div>
          </div>
          <h3 className={`font-bold text-${baseColor}-900 text-lg tracking-tight`}>{title}</h3>
          <span className={`px-2 py-0.5 rounded text-xs font-bold bg-white/50 text-${baseColor}-700 border border-${baseColor}-200`}>
            {blockTransactions.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-bold text-${baseColor}-900 text-lg`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddClick}
            className={`bg-white border-${baseColor}-200 text-${baseColor}-700 hover:bg-${baseColor}-50 hover:text-${baseColor}-900 hover:border-${baseColor}-300`}
          >
            <Plus size={16} className="mr-1" /> Novo
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className={`bg-${baseColor}-50/50 text-${baseColor}-900 font-semibold border-b border-${baseColor}-100 sticky top-0 z-10 backdrop-blur-sm`}>
            <tr>
              <th className="px-5 py-3 w-32">Data</th>
              <th className="px-5 py-3">Descrição</th>
              <th className="px-5 py-3 w-32">Categoria</th>
              {showExtraColumns && <th className="px-5 py-3 w-48">Forma de Pagto</th>}
              {showExtraColumns && <th className="px-5 py-3 w-32">Importância</th>}
              {showExtraColumns && <th className="px-5 py-3 text-right w-32">Valor Parcela</th>}
              <th className="px-5 py-3 text-right w-36 whitespace-nowrap">Valor Total</th>
              <th className="px-5 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {blockTransactions.map((t) => (
              <tr key={t.id} className={`hover:bg-${baseColor}-50/30 transition-colors group`}>
                <td className="px-5 py-4 text-slate-600 font-medium">
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-4 text-slate-900 font-semibold">
                  {t.description}
                </td>
                <td className="px-5 py-4 w-32">
                  <span className={`px-2.5 py-1 rounded border text-xs font-bold shadow-sm whitespace-nowrap ${getCategoryTheme(t.category)}`}>
                    {t.category}
                  </span>
                </td>
                {showExtraColumns && (
                  <td className="px-5 py-4 text-slate-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{t.paymentMethod || '-'}</span>
                    </div>
                  </td>
                )}
                {showExtraColumns && (
                  <td className="px-5 py-4">
                    <span className={`font-medium ${t.importance === TransactionImportance.SUPERFLUOUS ? 'text-red-500 font-bold' : 'text-slate-600'}`}>
                      {t.importance === TransactionImportance.SUPERFLUOUS ? 'SUPÉRFLUO' : (t.importance || '-')}
                    </span>
                  </td>
                )}
                {showExtraColumns && (
                  <td className="px-5 py-4 text-right font-mono text-slate-600">
                    {t.paymentMethod === TransactionPaymentMethod.CREDIT_INSTALLMENTS
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))
                      : '-'}
                  </td>
                )}
                <td className="px-5 py-4 text-right font-bold text-slate-900 font-mono tracking-tight whitespace-nowrap">
                  {/* Show original amount (total) if it exists, otherwise the current amount (which relates to 'amount' in context for non-installments) */}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.originalAmount ?? t.amount))}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(t)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {blockTransactions.length === 0 && (
              <tr>
                <td colSpan={showExtraColumns ? 8 : 4} className="py-12 text-center text-slate-400 italic">
                  Nenhum lançamento encontrado neste período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingTransaction || undefined}
        type={editingTransaction?.type || filterTypes[0]}
        showExtraColumns={showExtraColumns}
        title={editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
      />
    </div>
  );
};