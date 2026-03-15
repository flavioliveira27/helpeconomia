import { Transaction, TransactionType } from './types';

export const APP_VERSION = '1.0.0';
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: 'Salário Mensal',
    amount: 5500.00,
    type: TransactionType.INCOME,
    category: 'Salário',
    date: '2023-10-05',
  },
  {
    id: 2,
    description: 'Freelance Design',
    amount: 1200.00,
    type: TransactionType.INCOME,
    category: 'Extras',
    date: '2023-10-15',
  },
  {
    id: 3,
    description: 'Aluguel',
    amount: 1800.00,
    type: TransactionType.FIXED_EXPENSE,
    category: 'Moradia',
    date: '2023-10-10',
  },
  {
    id: 4,
    description: 'Internet Fibra',
    amount: 120.00,
    type: TransactionType.FIXED_EXPENSE,
    category: 'Contas',
    date: '2023-10-10',
  },
  {
    id: 5,
    description: 'Supermercado Semanal',
    amount: 450.50,
    type: TransactionType.VARIABLE_EXPENSE,
    category: 'Alimentação',
    date: '2023-10-12',
  },
  {
    id: 6,
    description: 'Jantar Fora',
    amount: 180.00,
    type: TransactionType.VARIABLE_EXPENSE,
    category: 'Lazer',
    date: '2023-10-20',
  },
  {
    id: 7,
    description: 'Uber',
    amount: 45.00,
    type: TransactionType.VARIABLE_EXPENSE,
    category: 'Transporte',
    date: '2023-10-22',
  },
  {
    id: 8,
    description: 'Tesouro Direto',
    amount: 500.00,
    type: TransactionType.INVESTMENT,
    category: 'Renda Fixa',
    date: '2023-10-01',
  },
  {
    id: 9,
    description: 'Fundo Imobiliário',
    amount: 300.00,
    type: TransactionType.INVESTMENT,
    category: 'Renda Variável',
    date: '2023-10-02',
  }
];

// Categorias Gerais (Income/Expenses)
export const GENERAL_CATEGORIES = [
  'Salário', 'Extras', 'Moradia', 'Contas', 'Alimentação', 'Lazer', 'Transporte', 'Veículo', 'Assinatura', 'Saúde', 'Educação', 'Outros'
];

// Categorias de Investimento
export const INVESTMENT_CATEGORIES = [
  'Renda Fixa', 'Renda Variável', 'Reserva de Emergência', 'Meta',
  'Investimento Fixo', 'Criptomoeda', 'Fundo Cambial', 'Poupança',
  'Reserva Geral', 'Doação', 'Outros'
];

// Categorias de Receitas
export const INCOME_CATEGORIES = [
  'Salário', 'Extras', 'Freelance', 'Outros'
];

// Categorias de Despesas Fixas
export const FIXED_EXPENSE_CATEGORIES = [
  'Moradia', 'Assinatura', 'Transporte', 'Concessionárias', 'Juros',
  'Alimentação', 'Prestação', 'Saúde', 'Educação', 'Outros'
];

// Categorias de Gastos (Variáveis)
export const VARIABLE_EXPENSE_CATEGORIES = [
  'Moradia', 'Assinatura', 'Juros', 'Alimentação', 'Prestação',
  'Saúde', 'Educação', 'Lazer', 'Extras', 'Transporte',
  'Veículo', 'Diversos', 'Outros'
];

// Combine for backward compatibility
export const CATEGORIES = [...new Set([...GENERAL_CATEGORIES, ...INVESTMENT_CATEGORIES, ...INCOME_CATEGORIES, ...FIXED_EXPENSE_CATEGORIES, ...VARIABLE_EXPENSE_CATEGORIES])];

// Map de Cores (Centralizado)
// Map de Cores (Hex para Gráficos)
export const CATEGORY_COLORS: Record<string, string> = {
  // Receitas
  'Salário': '#10b981', // emerald-500
  'Extras': '#14b8a6', // teal-500
  'Freelance': '#a855f7', // purple-500

  // Despesas
  'Moradia': '#0ea5e9', // sky-500
  'Contas': '#ef4444', // red-500
  'Assinaturas': '#8b5cf6', // violet-500
  'Assinatura': '#8b5cf6', // violet-500
  'assinatura': '#8b5cf6', // violet-500
  'Juros': '#991b1b', // red-800
  'juros': '#991b1b', // red-800
  'Alimentação': '#f97316', // orange-500
  'Prestação': '#db2777', // pink-600
  'prestação': '#db2777', // pink-600
  'Prestacao': '#db2777', // pink-600
  'Saúde': '#f43f5e', // rose-500
  'Educação': '#6366f1', // indigo-500
  'Lazer': '#ec4899', // pink-500
  'Transporte': '#f59e0b', // amber-500
  'Veículo': '#4338ca', // indigo-700
  'Veiculo': '#4338ca', // indigo-700
  'veiculo': '#4338ca', // indigo-700
  'Concessionárias': '#0891b2', // cyan-600
  'Concessionarias': '#0891b2', // cyan-600
  'Diversos': '#15803d', // green-700
  'diversos': '#15803d', // green-700
  'Outros': '#64748b', // slate-500
  'Extras (Despesa)': '#14b8a6', // teal-500 

  // Investimentos
  'Renda Fixa': '#3b82f6', // blue-500
  'Renda Variável': '#6366f1', // indigo-500
  'Reserva de Emergência': '#0ea5e9', // sky-500
  'Meta': '#d946ef', // fuchsia-500
  'Investimento Fixo': '#2563eb', // blue-600
  'Criptomoeda': '#eab308', // yellow-500
  'Fundo Cambial': '#059669', // emerald-600
  'Poupança': '#84cc16', // lime-500
  'Reserva Geral': '#94a3b8', // slate-400
  'Doação': '#e11d48', // rose-600
};

// Map de Temas (Classes Tailwind)
export const CATEGORY_THEMES: Record<string, string> = {
  // Receitas
  'Salário': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Extras': 'bg-teal-100 text-teal-800 border-teal-200',
  'Freelance': 'bg-purple-100 text-purple-800 border-purple-200',
  'Renda Fixa': 'bg-blue-100 text-blue-800 border-blue-200',
  'Renda Variável': 'bg-indigo-100 text-indigo-800 border-indigo-200',

  // Despesas Fixas / Gastos
  'Moradia': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'moradia': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Contas': 'bg-red-100 text-red-800 border-red-200',
  'contas': 'bg-red-100 text-red-800 border-red-200',
  'Assinatura': 'bg-violet-100 text-violet-800 border-violet-200',
  'Assinaturas': 'bg-violet-100 text-violet-800 border-violet-200',
  'assinatura': 'bg-violet-100 text-violet-800 border-violet-200',
  'assinaturas': 'bg-violet-100 text-violet-800 border-violet-200',
  'Juros': 'bg-red-50 text-red-900 border-red-200',
  'juros': 'bg-red-50 text-red-900 border-red-200',
  'Alimentação': 'bg-orange-100 text-orange-800 border-orange-200',
  'alimentação': 'bg-orange-100 text-orange-800 border-orange-200',
  'alimentacao': 'bg-orange-100 text-orange-800 border-orange-200',
  'Prestação': 'bg-pink-100 text-pink-800 border-pink-200',
  'prestação': 'bg-pink-100 text-pink-800 border-pink-200',
  'Prestacao': 'bg-pink-100 text-pink-800 border-pink-200',
  'prestacao': 'bg-pink-100 text-pink-800 border-pink-200',
  'Saúde': 'bg-rose-100 text-rose-800 border-rose-200',
  'saúde': 'bg-rose-100 text-rose-800 border-rose-200',
  'saude': 'bg-rose-100 text-rose-800 border-rose-200',
  'Educação': 'bg-violet-100 text-violet-800 border-violet-200',
  'educação': 'bg-violet-100 text-violet-800 border-violet-200',
  'educacao': 'bg-violet-100 text-violet-800 border-violet-200',
  'Lazer': 'bg-pink-100 text-pink-800 border-pink-200',
  'lazer': 'bg-pink-100 text-pink-800 border-pink-200',
  'Transporte': 'bg-amber-100 text-amber-800 border-amber-200',
  'transporte': 'bg-amber-100 text-amber-800 border-amber-200',
  'Veículo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Veiculo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'veiculo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'veículo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Concessionárias': 'bg-sky-100 text-sky-800 border-sky-200',
  'Concessionarias': 'bg-sky-100 text-sky-800 border-sky-200',
  'concessionárias': 'bg-sky-100 text-sky-800 border-sky-200',
  'Diversos': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'diversos': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Reserva Geral': 'bg-slate-200 text-slate-800 border-slate-300',
  'Outros': 'bg-slate-100 text-slate-800 border-slate-200',
  'outros': 'bg-slate-100 text-slate-800 border-slate-200',

  // Investimentos
  'Reserva de Emergência': 'bg-sky-100 text-sky-800 border-sky-200',
  'Meta': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'Investimento Fixo': 'bg-blue-50 text-blue-900 border-blue-200',
  'Criptomoeda': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Fundo Cambial': 'bg-emerald-50 text-emerald-900 border-emerald-200',
  'Poupança': 'bg-lime-100 text-lime-800 border-lime-200',
  'Doação': 'bg-rose-50 text-rose-900 border-rose-200',
};

export const APP_NAME = "HelpEconomia";
