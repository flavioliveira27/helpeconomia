
import { Transaction, TransactionType } from '../types';

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

            if (diffMonths >= 0) {
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
        if (t.installments && t.installments > 1) {
            const diffMonths = (selectedYear - tYear) * 12 + (selectedMonth - (tMonth - 1));

            // Installments start the NEXT month after the transaction date (Credit Card logic)
            if (diffMonths >= 1 && diffMonths <= t.installments) {
                const installmentValue = t.amount / t.installments;
                const currentInstallment = diffMonths;

                return [{
                    ...t,
                    amount: installmentValue,
                    originalAmount: t.amount,
                    description: `${t.description} (${currentInstallment}/${t.installments})`
                    // Date is usually the original date, but for display in a monthly report, 
                    // the consumer uses 'selectedYear/Month'. 
                    // However, we might want to update the date to match the view month?
                    // FinancialContext didn't update the date for installments, 
                    // relying on the fact that this list is already filtered FOR this month.
                }];
            }
            return [];
        }

        // 3. Simple transaction
        if (tDate.getTime() === selectedDate.getTime()) {
            return [t];
        }

        return [];
    });
};
