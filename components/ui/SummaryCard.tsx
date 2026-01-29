import React, { useState } from 'react';
import { LucideIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'default' | 'success' | 'danger' | 'warning' | 'info';
  details?: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, variant, details }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getColors = () => {
    switch (variant) {
      case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'danger': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const colors = getColors();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all ${isOpen ? 'row-span-2' : ''}`}>
      <div className="p-6 flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">
            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          {details && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mt-2 font-medium"
            >
              {isOpen ? 'Ocultar detalhes' : 'Ver detalhes'}
              {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors}`}>
          <Icon size={24} />
        </div>
      </div>

      {isOpen && details && (
        <div className="px-6 pb-6 pt-0 border-t border-slate-50 bg-slate-50/50">
          <div className="mt-4 text-sm text-slate-600 space-y-1">
            {details}
          </div>
        </div>
      )}
    </div>
  );
};