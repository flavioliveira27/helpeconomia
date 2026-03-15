import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Transaction, TransactionType, FinancialSummary, User } from '../types';
import { apiService } from '../services/apiService';
import { getTransactionsForMonth } from '../utils/financialUtils';

interface FinancialContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  rawTransactions: Transaction[];
  filteredRawTransactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  user: User | null;
  usersList: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  logout: () => void;
  addUser: (name: string, email: string, role: 'ADMIN' | 'USER', password: string) => Promise<void>;
  updateUser: (id: number, data: Partial<Omit<User, 'id'>>) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  refreshUser: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: number, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  getSummary: () => FinancialSummary;
  loadData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Global Date State
  const currentDate = new Date();

  // Initialize from localStorage or default to current date
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem('selectedMonth');
    return saved ? parseInt(saved) : currentDate.getMonth();
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('selectedYear');
    return saved ? parseInt(saved) : currentDate.getFullYear();
  });

  // Persist date selection
  useEffect(() => {
    localStorage.setItem('selectedMonth', selectedMonth.toString());
    localStorage.setItem('selectedYear', selectedYear.toString());
  }, [selectedMonth, selectedYear]);

  const refreshUser = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
          await loadData(currentUser);
        } catch (error) {
          console.error('Session expired:', error);
          apiService.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loadData = async (currentUser?: User) => {
    try {
      const targetUser = currentUser || user;
      const isAdmin = targetUser?.role === 'ADMIN';

      // Always fetch transactions
      const transactionsData = await apiService.getAllTransactions();
      // Only keep transactions that do not belong directly to a credit card invoice
      const cashFlowTransactions = transactionsData.filter(t => !t.credit_card_id);

      try {
        const creditCards = await apiService.request('/api/credit-cards');
        const cardMap = creditCards.reduce((acc: any, c: any) => ({ ...acc, [c.id]: c.name }), {});

        const creditTx = transactionsData.filter(t => t.credit_card_id);
        const invoiceGroups: { [key: string]: number } = {};
        const invoiceDates: { [key: string]: string } = {};

        creditTx.forEach(t => {
          if (!t.invoice_date) return;
          const invoiceMonthKey = t.invoice_date.substring(0, 7); // YYYY-MM
          const key = `${t.credit_card_id}-${invoiceMonthKey}`;
          if (!invoiceGroups[key]) {
            invoiceGroups[key] = 0;
            invoiceDates[key] = t.invoice_date;
          }
          invoiceGroups[key] += Number(t.amount);
        });

        let dummyIdCounter = -10000;
        const invoiceTransactions: Transaction[] = Object.keys(invoiceGroups).map(key => {
          const cardId = key.split('-')[0];
          const cardName = cardMap[cardId] || `Cartão`;
          dummyIdCounter--;
          return {
            id: dummyIdCounter,
            user_id: targetUser?.id || 0,
            description: `Fatura ${cardName}`,
            amount: Number(invoiceGroups[key].toFixed(2)),
            type: TransactionType.VARIABLE_EXPENSE,
            category: 'Cartão de Crédito',
            date: invoiceDates[key],
            payment_method: 'CREDITO',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Transaction;
        });

        const allCombined = [...cashFlowTransactions, ...invoiceTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(allCombined);
      } catch (e) {
        console.error("Failed to process credit card invoices for dashboard", e);
        setTransactions(cashFlowTransactions);
      }

      setRawTransactions(transactionsData);

      // Only fetch users if admin
      if (isAdmin) {
        const usersData = await apiService.getAllUsers();
        setUsersList(usersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredTransactions = useMemo(() => {
    return getTransactionsForMonth(transactions, selectedYear, selectedMonth);
  }, [transactions, selectedMonth, selectedYear]);

  const filteredRawTransactions = useMemo(() => {
    return getTransactionsForMonth(rawTransactions, selectedYear, selectedMonth);
  }, [rawTransactions, selectedMonth, selectedYear]);


  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      await loadData(response.user);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage = error.message || 'Erro desconhecido';
      const errorCode = error.code || undefined;

      return { success: false, error: errorMessage, code: errorCode };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.registerUser({ name, email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      await loadData(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await apiService.googleLogin(token);
      setUser(response.user);
      setIsAuthenticated(true);
      await loadData(response.user);
      return { success: true, isNewUser: response.isNewUser };
    } catch (error: any) {
      console.error('Google Login error:', error);
      return { success: false, error: error.message, code: error.code };
    }
  };

  const logout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setTransactions([]);
    setUsersList([]);
  };

  const addUser = async (name: string, email: string, role: 'ADMIN' | 'USER', password: string) => {
    try {
      await apiService.createUser({ name, email, role, password });
      const usersData = await apiService.getAllUsers();
      setUsersList(usersData);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: number, data: Partial<Omit<User, 'id'>>) => {
    try {
      await apiService.updateUser(id, data);
      const usersData = await apiService.getAllUsers();
      setUsersList(usersData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const removeUser = async (id: number) => {
    if (user?.id === id) {
      alert("Você não pode excluir a si mesmo.");
      return;
    }

    try {
      await apiService.deleteUser(id);
      const usersData = await apiService.getAllUsers();
      setUsersList(usersData);
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    try {
      await apiService.createTransaction(t);
      await loadData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: number, updates: Partial<Transaction>) => {
    try {
      await apiService.updateTransaction(id, updates);
      await loadData();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await apiService.deleteTransaction(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const getSummary = (): FinancialSummary => {
    // Use filteredTransactions by default for the dashboard and reports context
    return filteredTransactions.reduce((acc, t) => {
      const val = Number(t.amount);
      if (t.type === TransactionType.INCOME) {
        acc.totalIncome += val;
        acc.balance += val;
      } else if (t.type === TransactionType.FIXED_EXPENSE) {
        acc.totalFixedExpenses += val;
        acc.balance -= val;
      } else if (t.type === TransactionType.VARIABLE_EXPENSE) {
        acc.totalVariableExpenses += val;
        acc.balance -= val;
      } else if (t.type === TransactionType.INVESTMENT) {
        acc.totalInvestments += val;
        acc.balance -= val;
      }
      return acc;
    }, {
      totalIncome: 0,
      totalFixedExpenses: 0,
      totalVariableExpenses: 0,
      totalInvestments: 0,
      balance: 0
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <FinancialContext.Provider value={{
      transactions,
      filteredTransactions,
      rawTransactions,
      filteredRawTransactions,
      selectedMonth,
      selectedYear,
      setSelectedMonth,
      setSelectedYear,
      user,
      usersList,
      isAuthenticated,
      isLoading,
      login,
      register,
      googleLogin,
      logout,
      addUser,
      updateUser,
      removeUser,
      refreshUser,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getSummary,
      loadData
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancial must be used within a FinancialProvider');
  return context;
};