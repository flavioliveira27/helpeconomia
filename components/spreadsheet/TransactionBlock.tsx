import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionPaymentMethod, TransactionImportance } from '../../types';
import { CATEGORY_THEMES } from '../../constants';
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
    if (!category) return CATEGORY_THEMES['Outros'];

    // Try exact match first
    if (CATEGORY_THEMES[category]) return CATEGORY_THEMES[category];

    // Try lowercase match
    if (CATEGORY_THEMES[category.toLowerCase()]) return CATEGORY_THEMES[category.toLowerCase()];

    // Try trimmed match (in case of extra spaces)
    if (CATEGORY_THEMES[category.trim()]) return CATEGORY_THEMES[category.trim()];

    // Try trimmed lowercase match
    if (CATEGORY_THEMES[category.trim().toLowerCase()]) return CATEGORY_THEMES[category.trim().toLowerCase()];

    // Fallback
    return CATEGORY_THEMES['Outros'];
  };

  return (
    <div className={`flex flex-col h-full bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden font-inter`}>
      {/* Header - Colored Background */}
      <div className={`px-5 py-4 border-b border-${baseColor}-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 bg-${baseColor}-100`}>
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
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          <span className={`font-bold text-${baseColor}-900 text-lg`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddClick}
            className={`bg-white border-${baseColor}-200 text-${baseColor}-700 hover:bg-${baseColor}-50 hover:text-${baseColor}-900 hover:border-${baseColor}-300`}
          >
            <Plus size={16} className="mr-1" /> Novo
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className={`hidden md:table-header-group bg-${baseColor}-50/50 text-${baseColor}-900 font-semibold border-b border-${baseColor}-100 sticky top-0 z-10 backdrop-blur-sm`}>
            <tr>
              <th className="px-5 py-3 w-32">Data</th>
              <th className="px-5 py-3">Descrição</th>
              <th className="px-5 py-3 w-32">Categoria</th>
              {showExtraColumns && <th className="px-5 py-3 w-48">Forma de Pagto</th>}
              {showExtraColumns && <th className="px-5 py-3 w-32">Importância</th>}
              <th className="px-5 py-3 text-right w-36 whitespace-nowrap">Valor Total</th>
              <th className="px-5 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {blockTransactions.map((t) => (
              <React.Fragment key={t.id}>
                {/* Desktop View */}
                <tr className={`hidden md:table-row hover:bg-${baseColor}-50/30 transition-colors group`}>
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

                {/* Mobile View (Card) */}
                <tr className="md:hidden border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td colSpan={showExtraColumns ? 8 : 4} className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-900 line-clamp-2">{t.description}</span>
                          <span className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div className="font-bold text-slate-900 font-mono tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.originalAmount ?? t.amount))}
                          </div>
                          {showExtraColumns && t.paymentMethod === TransactionPaymentMethod.CREDIT_INSTALLMENTS && (
                            <div className="text-xs text-slate-400">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}/mês
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded border text-[10px] font-bold shadow-sm whitespace-nowrap ${getCategoryTheme(t.category)}`}>
                          {t.category}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="text-slate-400 hover:text-blue-600 p-1"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {showExtraColumns && (t.paymentMethod || t.importance) && (
                        <div className="flex flex-wrap gap-2 mt-1 pt-2 border-t border-slate-50">
                          {t.paymentMethod && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{t.paymentMethod}</span>}
                          {t.importance && <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.importance === TransactionImportance.SUPERFLUOUS ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>{t.importance === TransactionImportance.SUPERFLUOUS ? 'SUPÉRFLUO' : t.importance}</span>}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
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