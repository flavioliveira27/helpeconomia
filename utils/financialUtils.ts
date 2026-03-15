
import { Transaction, TransactionType, TransactionPaymentMethod } from '../types';

export const getTransactionsForMonth = (
    transactions: Transaction[],
    selectedYear: number,
    selectedMonth: number
): Transaction[] => {
    return transactions.flatMap(t => {
        const [tYear, tMonth] = t.date.split('-').map(Number);
        const tDate = new Date(tYear, tMonth - 1);
        const selectedDate = new Date(selectedYear, selectedMonth);

        // 1. Recurring transaction logic
        // Checks if the transaction is recurring and handles projection
        // We use Boolean(t.recurring) to handle both boolean true and number 1 from DB
        if ((t.type === TransactionType.FIXED_EXPENSE || t.type === TransactionType.INVESTMENT || t.type === TransactionType.VARIABLE_EXPENSE || t.type === TransactionType.INCOME) &&
            Boolean(t.recurring)) {

            const diffMonths = (selectedYear - tYear) * 12 + (selectedMonth - (tMonth - 1));

            // For Credit Card transactions, they appear in the NEXT month (bill)
            // So recurrent credit transactions also start 1 month later
            const isCredit = t.paymentMethod === TransactionPaymentMethod.CREDIT;
            const minDiff = isCredit ? 1 : 0;

            if (diffMonths >= minDiff) {
                // Create a new date for this occurrence
                // We use the original day, but the selected month and year
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
        if (t.installments && t.installments > 1 && t.paymentMethod === TransactionPaymentMethod.CREDIT) {
            const diffMonths = (selectedYear - tYear) * 12 + (selectedMonth - (tMonth - 1));

            // Installments start the NEXT month after the transaction date (Credit Card logic)
            // Se a diferença de meses for maior ou igual a 1 (próximo mês) e menor ou igual as parcelas
            if (diffMonths >= 1 && diffMonths <= t.installments) {
                const installmentValue = t.amount / t.installments;
                const currentInstallment = diffMonths;

                return [{
                    ...t,
                    amount: installmentValue,
                    originalAmount: t.amount,
                    description: `${t.description} (${currentInstallment}/${t.installments})`
                }];
            }
            // Se não estiver dentro do range de meses, não exibe
            return [];
        } else if (t.installments && t.installments > 1 && t.paymentMethod !== TransactionPaymentMethod.CREDIT) {
           // Se for parcelado mas não for crédito (ex: algum outro tipo futuro), fraciona na hora
            const installmentValue = t.amount / t.installments;
            return [{
                 ...t,
                 amount: installmentValue,
                 originalAmount: t.amount
            }];
        }

        // 3. Credit Card (Next Month) logic
        // If payment method is CREDIT and NOT installments, it appears next month
        if (t.paymentMethod === TransactionPaymentMethod.CREDIT && (!t.installments || t.installments <= 1)) {
            const diffMonths = (selectedYear - tYear) * 12 + (selectedMonth - (tMonth - 1));

            if (diffMonths === 1) {
                const originalDay = parseInt(t.date.split('-')[2]);
                // Ensure valid date handling (e.g. going from Jan 31 to Feb)
                // New Date(year, month, day) handles overflow automatically (e.g. Feb 30 -> Mar 1/2)
                // But for financial apps, usually we want the last day of month if overflow?
                // For simplicity and consistency with other logic here:
                const newDate = new Date(selectedYear, selectedMonth, originalDay);

                return [{
                    ...t,
                    date: newDate.toISOString().split('T')[0]
                }];
            }
            return [];
        }

        // 4. Simple transaction
        if (tDate.getTime() === selectedDate.getTime()) {
            return [t];
        }

        return [];
    });
};
