import React, { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import { Transaction, TransactionType } from '../../types';
import { CATEGORIES } from '../../constants';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';

export const Spreadsheet: React.FC = () => {
  const { transactions, updateTransaction, deleteTransaction, addTransaction } = useFinancial();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  
  // New row state
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: TransactionType.VARIABLE_EXPENSE,
    category: 'Outros',
    amount: 0,
    description: ''
  });

  const handleEditClick = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm(t);
  };

  const handleSaveClick = () => {
    if (editingId && editForm) {
      updateTransaction(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAddSave = () => {
    if (newRow.description && newRow.amount !== undefined) {
      addTransaction(newRow as Omit<Transaction, 'id'>);
      setIsAdding(false);
      setNewRow({
        date: new Date().toISOString().split('T')[0],
        type: TransactionType.VARIABLE_EXPENSE,
        category: 'Outros',
        amount: 0,
        description: ''
      });
    }
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME: return 'bg-emerald-100 text-emerald-800';
      case TransactionType.FIXED_EXPENSE: return 'bg-orange-100 text-orange-800';
      case TransactionType.VARIABLE_EXPENSE: return 'bg-rose-100 text-rose-800';
      case TransactionType.INVESTMENT: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100';
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
        case TransactionType.INCOME: return 'Renda';
        case TransactionType.FIXED_EXPENSE: return 'Despesa Fixa';
        case TransactionType.VARIABLE_EXPENSE: return 'Despesa Variável';
        case TransactionType.INVESTMENT: return 'Investimento';
        default: return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-6 bg-accent rounded-full"></span>
            Lançamentos
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Nova Linha
        </button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0">
            <tr>
              <th className="px-6 py-3 w-32">Data</th>
              <th className="px-6 py-3 w-40">Tipo</th>
              <th className="px-6 py-3 w-40">Categoria</th>
              <th className="px-6 py-3">Descrição</th>
              <th className="px-6 py-3 text-right w-32">Valor (R$)</th>
              <th className="px-6 py-3 text-center w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isAdding && (
              <tr className="bg-blue-50/50 animate-pulse">
                 <td className="px-6 py-3">
                    <input 
                        type="date" 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                        value={newRow.date}
                        onChange={e => setNewRow({...newRow, date: e.target.value})}
                    />
                 </td>
                 <td className="px-6 py-3">
                    <select 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                        value={newRow.type}
                        onChange={e => setNewRow({...newRow, type: e.target.value as TransactionType})}
                    >
                        {Object.values(TransactionType).map(t => (
                            <option key={t} value={t}>{getTypeLabel(t)}</option>
                        ))}
                    </select>
                 </td>
                 <td className="px-6 py-3">
                     <select 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                        value={newRow.category}
                        onChange={e => setNewRow({...newRow, category: e.target.value})}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </td>
                 <td className="px-6 py-3">
                    <input 
                        type="text" 
                        placeholder="Descrição..."
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                        value={newRow.description}
                        onChange={e => setNewRow({...newRow, description: e.target.value})}
                    />
                 </td>
                 <td className="px-6 py-3 text-right">
                    <input 
                        type="number" 
                        step="0.01"
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-right"
                        value={newRow.amount}
                        onChange={e => setNewRow({...newRow, amount: parseFloat(e.target.value)})}
                    />
                 </td>
                 <td className="px-6 py-3 flex justify-center gap-2">
                    <button onClick={handleAddSave} className="text-emerald-600 hover:text-emerald-800"><Save size={16} /></button>
                    <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                 </td>
              </tr>
            )}

            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                {editingId === t.id ? (
                  <>
                     <td className="px-6 py-3">
                        <input 
                            type="date" 
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                            value={editForm.date}
                            onChange={e => setEditForm({...editForm, date: e.target.value})}
                        />
                     </td>
                     <td className="px-6 py-3">
                        <select 
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                            value={editForm.type}
                            onChange={e => setEditForm({...editForm, type: e.target.value as TransactionType})}
                        >
                            {Object.values(TransactionType).map(type => (
                                <option key={type} value={type}>{getTypeLabel(type)}</option>
                            ))}
                        </select>
                     </td>
                     <td className="px-6 py-3">
                        <select 
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                            value={editForm.category}
                            onChange={e => setEditForm({...editForm, category: e.target.value})}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </td>
                     <td className="px-6 py-3">
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                            value={editForm.description}
                            onChange={e => setEditForm({...editForm, description: e.target.value})}
                        />
                     </td>
                     <td className="px-6 py-3 text-right">
                        <input 
                            type="number" 
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-right"
                            value={editForm.amount}
                            onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                        />
                     </td>
                     <td className="px-6 py-3 flex justify-center gap-2">
                        <button onClick={handleSaveClick} className="text-emerald-600 hover:text-emerald-800"><Save size={16} /></button>
                        <button onClick={handleCancelClick} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                     </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(t.type)}`}>
                        {getTypeLabel(t.type)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{t.category}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{t.description}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-700'}`}>
                      R$ {t.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(t)} className="text-slate-400 hover:text-accent"><Edit2 size={16} /></button>
                      <button onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-danger"><Trash2 size={16} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {transactions.length === 0 && !isAdding && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Nenhuma transação registrada. Clique em "Nova Linha" para começar.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};