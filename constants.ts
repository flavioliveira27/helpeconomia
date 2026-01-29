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
  'Salário', 'Extras', 'Moradia', 'Contas', 'Alimentação', 'Lazer', 'Transporte', 'Veículo', 'Assinaturas', 'Saúde', 'Educação', 'Outros'
];

// Categorias de Investimento
export const INVESTMENT_CATEGORIES = [
  'Renda Fixa', 'Renda Variável', 'Reserva de Emergência', 'Meta',
  'Investimento Fixo', 'Criptomoeda', 'Fundo Cambial', 'Poupança',
  'Reserva Geral', 'Doação', 'Outros'
];

// Combine for backward compatibility
export const CATEGORIES = [...new Set([...GENERAL_CATEGORIES, ...INVESTMENT_CATEGORIES])];

export const APP_NAME = "FinanSmart";
