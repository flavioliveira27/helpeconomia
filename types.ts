export enum TransactionType {
  INCOME = 'INCOME',
  FIXED_EXPENSE = 'FIXED_EXPENSE',
  VARIABLE_EXPENSE = 'VARIABLE_EXPENSE',
  INVESTMENT = 'INVESTMENT'
}

export enum TransactionPaymentMethod {
  CREDIT = 'CREDITO',
  DEBIT = 'DEBITO',
  PIX = 'PIX',
  CREDIT_INSTALLMENTS = 'CREDITO PARCELADO'
}

export enum TransactionImportance {
  ESSENTIAL = 'ESSENCIAL',
  SUPERFLUOUS = 'SUPERFLUO'
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  observation?: string;
  paymentMethod?: TransactionPaymentMethod;
  importance?: TransactionImportance;
  installments?: number;
  installment_number?: number;
  credit_card_id?: number | null;
  invoice_date?: string | null;
  originalAmount?: number; // Used for view purposes (total debt vs monthly parcel)
  recurring?: boolean; // If true, repeats in subsequent months
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Added for authentication logic
  role: 'ADMIN' | 'USER';
  photo_url?: string;
  subscription_status?: 'active' | 'inactive' | 'trial' | 'canceled';
  trial_ends_at?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalInvestments: number;
  balance: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export type Period = 'month' | 'year';

export interface CreditCard {
  id: number;
  user_id: number;
  name: string;
  brand: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color_theme: string;
  used_limit?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface CardInvoiceSummary {
  month_year: string;
  month: number;
  year: number;
  total_amount: number;
  invoice_date: string;
}

export interface CardInvoiceDetail {
  month: number;
  year: number;
  total: number;
  transactions: Transaction[];
}