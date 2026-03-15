import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { useFinancial } from './FinancialContext';

export interface Goal {
    id: number;
    user_id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
    status: 'ACTIVE' | 'COMPLETED';
    color_theme: string;
    created_at?: string;
    updated_at?: string;
}

interface GoalContextType {
    goals: Goal[];
    activeGoals: Goal[];
    completedGoals: Goal[];
    isLoading: boolean;
    totalAccumulated: number;
    totalTarget: number;
    overallProgress: number;
    loadGoals: () => Promise<void>;
    addGoal: (goal: Partial<Goal>) => Promise<void>;
    updateGoal: (id: number, goal: Partial<Goal>) => Promise<void>;
    depositGoal: (id: number, amount: number, date?: string) => Promise<void>;
    deleteGoal: (id: number) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { isAuthenticated, loadData: loadFinancialData } = useFinancial();

    const loadGoals = async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const data = await apiService.request('/api/goals');
            setGoals(data);
        } catch (error) {
            console.error('Failed to load goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadGoals();
        } else {
            setGoals([]);
        }
    }, [isAuthenticated]);

    const activeGoals = useMemo(() => goals.filter(g => g.status === 'ACTIVE'), [goals]);
    const completedGoals = useMemo(() => goals.filter(g => g.status === 'COMPLETED'), [goals]);

    const totalAccumulated = useMemo(() => goals.reduce((acc, g) => acc + Number(g.current_amount), 0), [goals]);
    const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + Number(g.target_amount), 0), [goals]);
    const overallProgress = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0;

    const addGoal = async (goal: Partial<Goal>) => {
        try {
            await apiService.request('/api/goals', {
                method: 'POST',
                body: JSON.stringify(goal)
            });
            await loadGoals();
        } catch (error) {
            console.error('Failed to add goal:', error);
            throw error;
        }
    };

    const updateGoal = async (id: number, updates: Partial<Goal>) => {
        try {
            await apiService.request(`/api/goals/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            await loadGoals();
        } catch (error) {
            console.error('Failed to update goal:', error);
            throw error;
        }
    };

    const depositGoal = async (id: number, amount: number, date?: string) => {
        try {
            await apiService.request(`/api/goals/${id}/deposit`, {
                method: 'POST',
                body: JSON.stringify({ amount, date })
            });
            await loadGoals();
            await loadFinancialData(); // Refresh transactions as a new INVESTMENT was created
        } catch (error) {
            console.error('Failed to deposit to goal:', error);
            throw error;
        }
    };

    const deleteGoal = async (id: number) => {
        try {
            await apiService.request(`/api/goals/${id}`, {
                method: 'DELETE'
            });
            await loadGoals();
            await loadFinancialData(); // Refresh transactions since goal deposits were deleted
        } catch (error) {
            console.error('Failed to delete goal:', error);
            throw error;
        }
    };

    return (
        <GoalContext.Provider value={{
            goals,
            activeGoals,
            completedGoals,
            isLoading,
            totalAccumulated,
            totalTarget,
            overallProgress,
            loadGoals,
            addGoal,
            updateGoal,
            depositGoal,
            deleteGoal
        }}>
            {children}
        </GoalContext.Provider>
    );
};

export const useGoals = () => {
    const context = useContext(GoalContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalProvider');
    }
    return context;
};
