import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CreditCard, CardInvoiceSummary, CardInvoiceDetail, Transaction } from '../types';
import { apiService } from '../services/apiService';
import { useFinancial } from './FinancialContext';

interface CreditCardContextType {
    creditCards: CreditCard[];
    isLoadingCards: boolean;
    fetchCreditCards: () => Promise<void>;
    createCreditCard: (data: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CreditCard>;
    updateCreditCard: (id: number, data: Partial<CreditCard>) => Promise<void>;
    deleteCreditCard: (id: number) => Promise<void>;

    // Invoices
    getInvoicesSummary: (cardId: number) => Promise<CardInvoiceSummary[]>;
    getInvoiceDetails: (cardId: number, month: number, year: number) => Promise<CardInvoiceDetail>;
    addCreditTransaction: (cardId: number, data: any) => Promise<void>;
}

const CreditCardContext = createContext<CreditCardContextType | undefined>(undefined);

export const CreditCardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [isLoadingCards, setIsLoadingCards] = useState<boolean>(true);
    const { isAuthenticated, loadData } = useFinancial();

    const fetchCreditCards = async () => {
        if (!isAuthenticated) return;
        setIsLoadingCards(true);
        try {
            const data = await apiService.request('/api/credit-cards');
            setCreditCards(data);
        } catch (error) {
            console.error('Error fetching credit cards:', error);
        } finally {
            setIsLoadingCards(false);
        }
    };

    useEffect(() => {
        fetchCreditCards();
    }, [isAuthenticated]);

    const createCreditCard = async (data: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        try {
            const newCard = await apiService.request('/api/credit-cards', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            setCreditCards(prev => [...prev, newCard].sort((a, b) => a.name.localeCompare(b.name)));
            return newCard;
        } catch (error) {
            console.error('Error creating credit card:', error);
            throw error;
        }
    };

    const updateCreditCard = async (id: number, data: Partial<CreditCard>) => {
        try {
            await apiService.request(`/api/credit-cards/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            setCreditCards(prev => prev.map(card => card.id === id ? { ...card, ...data } : card));
        } catch (error) {
            console.error('Error updating credit card:', error);
            throw error;
        }
    };

    const deleteCreditCard = async (id: number) => {
        try {
            await apiService.request(`/api/credit-cards/${id}`, {
                method: 'DELETE',
            });
            setCreditCards(prev => prev.filter(card => card.id !== id));
            await loadData();
        } catch (error) {
            console.error('Error deleting credit card:', error);
            throw error;
        }
    };

    const getInvoicesSummary = async (cardId: number) => {
        try {
            return await apiService.request(`/api/credit-cards/${cardId}/invoices`);
        } catch (error) {
            console.error('Error fetching invoices summary:', error);
            throw error;
        }
    };

    const getInvoiceDetails = async (cardId: number, month: number, year: number) => {
        try {
            return await apiService.request(`/api/credit-cards/${cardId}/invoices/${month}/${year}`);
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            throw error;
        }
    };

    const addCreditTransaction = async (cardId: number, data: any) => {
        try {
            await apiService.request(`/api/credit-cards/${cardId}/invoices/transactions`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            await loadData(); // Triggers refresh on the main context
        } catch (error) {
            console.error('Error adding credit transaction:', error);
            throw error;
        }
    };

    return (
        <CreditCardContext.Provider value={{
            creditCards,
            isLoadingCards,
            fetchCreditCards,
            createCreditCard,
            updateCreditCard,
            deleteCreditCard,
            getInvoicesSummary,
            getInvoiceDetails,
            addCreditTransaction
        }}>
            {children}
        </CreditCardContext.Provider>
    );
};

export const useCreditCards = () => {
    const context = useContext(CreditCardContext);
    if (!context) throw new Error('useCreditCards must be used within a CreditCardProvider');
    return context;
};
