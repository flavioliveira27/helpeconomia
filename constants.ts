import { Transaction, TransactionType } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    description: 'Salário Mensal',
    amount: 5500.00,
    type: TransactionType.INCOME,
    category: 'Salário',
    date: '2023-10-05',
  },
  {
    id: '2',
    description: 'Freelance Design',
    amount: 1200.00,
    type: TransactionType.INCOME,
    category: 'Extras',
    date: '2023-10-15',
  },
  {
    id: '3',
    description: 'Aluguel',
    amount: 1800.00,
    type: TransactionType.FIXED_EXPENSE,
    category: 'Moradia',
    date: '2023-10-10',
  },
  {
    id: '4',
    description: 'Internet Fibra',
    amount: 120.00,
    type: TransactionType.FIXED_EXPENSE,
    category: 'Contas',
    date: '2023-10-10',
  },
  {
    id: '5',
    description: 'Supermercado Semanal',
    amount: 450.50,
    type: TransactionType.VARIABLE_EXPENSE,
    category: 'Alimentação',
    date: '2023-10-12',
  },
  {
    id: '6',
    description: 'Jantar Fora',
    amount: 180.00,
    type: TransactionType.VARIABLE_EXPENSE,
    category: 'Lazer',
    date: '2023-10-20',
  },
  {
    id: '7',
    description: 'Uber',
    amount: 45.00,
    type: TransactionType.VARIABLE_EXPENSE,
    category: 'Transporte',
    date: '2023-10-22',
  },
  {
    id: '8',
    description: 'Tesouro Direto',
    amount: 500.00,
    type: TransactionType.INVESTMENT,
    category: 'Renda Fixa',
    date: '2023-10-01',
  },
  {
    id: '9',
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
export const CATEGORY_COLORS: Record<string, string> = {
  // Receitas
  'Salário': '#10b981', // emerald-500
  'Extras': '#14b8a6', // teal-500
  'Freelance': '#a855f7', // purple-500

  // Despesas
  'Moradia': '#0ea5e9', // sky-500
  'Contas': '#ef4444', // red-500
  'Assinaturas': '#8b5cf6', // violet-500 (Legacy)
  'Assinatura': '#8b5cf6', // violet-500
  'assinatura': '#8b5cf6', // violet-500 (lowercase)
  'Juros': '#991b1b', // red-800
  'juros': '#991b1b', // red-800 (lowercase)
  'Alimentação': '#f97316', // orange-500
  'Prestação': '#db2777', // pink-600
  'prestação': '#db2777', // pink-600 (lowercase)
  'Prestacao': '#db2777', // pink-600 (no accent)
  'prestacao': '#db2777', // pink-600 (lowercase no accent)
  'Saúde': '#f43f5e', // rose-500
  'Educação': '#6366f1', // indigo-500
  'Lazer': '#ec4899', // pink-500
  'Transporte': '#f59e0b', // amber-500
  'Veículo': '#4338ca', // indigo-700
  'Veiculo': '#4338ca', // indigo-700 (no accent)
  'veiculo': '#4338ca', // indigo-700 (lowercase)
  'Concessionárias': '#0891b2', // cyan-600
  'Concessionarias': '#0891b2', // cyan-600 (no accent)
  'Diversos': '#15803d', // green-700
  'diversos': '#15803d', // green-700 (lowercase)
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

export const APP_NAME = "HelpEconomia";
