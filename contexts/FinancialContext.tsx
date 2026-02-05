import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Transaction, TransactionType, FinancialSummary, User } from '../types';
import { apiService } from '../services/apiService';

interface FinancialContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  user: User | null;
  usersList: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (name: string, email: string, role: 'ADMIN' | 'USER', password: string) => Promise<void>;
  updateUser: (id: number, data: Partial<Omit<User, 'id'>>) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  refreshUser: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: number, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  getSummary: () => FinancialSummary;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
      setTransactions(transactionsData);

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
    return transactions.flatMap(t => {
      const [tYear, tMonth] = t.date.split('-').map(Number);
      const tDate = new Date(tYear, tMonth - 1);
      const selectedDate = new Date(selectedYear, selectedMonth);

      // 1. Recurring transaction logic (Fixed Expenses AND Investments) - PRIORITIZED
      // Ensure t.recurring is treated as boolean (DB might return 1/0)
      if ((t.type === TransactionType.FIXED_EXPENSE || t.type === TransactionType.INVESTMENT) && (t.recurring === true || t.recurring === 1 || Boolean(t.recurring) === true)) {
        // Compare Year/Month
        const diffMonths = (selectedYear - tYear) * 12 + (selectedMonth - (tMonth - 1));

        if (diffMonths >= 0) {
          const originalDay = parseInt(t.date.split('-')[2]);
          const newDate = new Date(selectedYear, selectedMonth, originalDay);

          return [{
            ...t,
            date: newDate.toISOString().split('T')[0]
          }];
        }
        return [];
      }

      // 2. Installment transaction logic
      if (t.installments && t.installments > 1) {
        const diffMonths = (selectedYear - tYear) * 12 + (selectedMonth - (tMonth - 1));

        if (diffMonths >= 1 && diffMonths <= t.installments) {
          const installmentValue = t.amount / t.installments;
          const currentInstallment = diffMonths;

          return [{
            ...t,
            amount: installmentValue,
            originalAmount: t.amount,
            description: `${t.description} (${currentInstallment}/${t.installments})`
            // Date is NOT modified
          }];
        }
        return [];
      }

      // 3. Simple transaction (Standard)
      if (tDate.getTime() === selectedDate.getTime()) {
        return [t];
      }






      return [];
    });
  }, [transactions, selectedMonth, selectedYear]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);

      // Load data after login
      const transactionsData = await apiService.getAllTransactions();
      setTransactions(transactionsData);

      if (response.user.role === 'ADMIN') {
        const usersData = await apiService.getAllUsers();
        setUsersList(usersData);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
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
      const newTransaction = await apiService.createTransaction(t);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: number, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await apiService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await apiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
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
      selectedMonth,
      selectedYear,
      setSelectedMonth,
      setSelectedYear,
      user,
      usersList,
      isAuthenticated,
      isLoading,
      login,
      logout,
      addUser,
      updateUser,
      removeUser,
      refreshUser,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getSummary
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