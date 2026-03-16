import express from 'express';
import db from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true }); // Merge params to get cardId

// Middleware to check if card belongs to user
const checkCardOwnership = async (req, res, next) => {
    const { cardId } = req.params;
    try {
        const [cards] = await db.query('SELECT * FROM credit_cards WHERE id = ? AND user_id = ?', [cardId, req.user.id]);
        if (cards.length === 0) {
            return res.status(404).json({ error: 'Cartão não encontrado ou sem permissão.' });
        }
        req.creditCard = cards[0];
        next();
    } catch (error) {
        console.error('Error checking card ownership:', error);
        res.status(500).json({ error: 'Erro ao verificar cartão' });
    }
};

// Get invoices summary for a card (Grouped by month/year)
router.get('/', authMiddleware, checkCardOwnership, async (req, res) => {
    const { cardId } = req.params;

    try {
        const query = `
            SELECT 
                DATE_FORMAT(invoice_date, '%Y-%m') as month_year,
                MONTH(invoice_date) as month,
                YEAR(invoice_date) as year,
                SUM(amount) as total_amount,
                MAX(invoice_date) as invoice_date
            FROM transactions
            WHERE credit_card_id = ? AND invoice_date IS NOT NULL
            GROUP BY month_year, month, year
            ORDER BY invoice_date ASC
        `;
        const [invoices] = await db.query(query, [cardId]);
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Erro ao buscar faturas' });
    }
});

// Get transactions for a specific invoice month/year
router.get('/:month/:year', authMiddleware, checkCardOwnership, async (req, res) => {
    const { cardId, month, year } = req.params;

    try {
        const query = `
            SELECT * FROM transactions 
            WHERE credit_card_id = ? 
            AND MONTH(invoice_date) = ? 
            AND YEAR(invoice_date) = ?
            ORDER BY date DESC
        `;
        const [transactions] = await db.query(query, [cardId, month, year]);

        // Calculate total
        const total = transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

        res.json({
            month: parseInt(month),
            year: parseInt(year),
            total,
            transactions
        });
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes da fatura' });
    }
});

// Parse a 'YYYY-MM-DD' string without timezone conversion.
// Using new Date('YYYY-MM-DD') interprets the string as UTC midnight,
// which causes off-by-one day errors in servers running UTC (e.g. production).
const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return { year, month: month - 1, day }; // month is 0-indexed
};

// Calculate the invoice date based on purchase date and card closing day
const calculateInvoiceDate = (purchaseDateStr, closingDay, dueDay) => {
    const { year, month, day } = parseLocalDate(purchaseDateStr);

    let invoiceMonth = month;
    let invoiceYear = year;

    // Se a compra foi feita no dia de fechamento ou depois, ela cai no fechamento do próximo mês
    if (day >= closingDay) {
        invoiceMonth++;
        if (invoiceMonth > 11) {
            invoiceMonth = 0;
            invoiceYear++;
        }
    }

    // Calcula quando é o vencimento: se o dia de vencimento é menor que o de fechamento, o vencimento é no mês SEGUINTE ao fechamento
    let dueMonth = invoiceMonth;
    let dueYear = invoiceYear;

    if (dueDay < closingDay) {
        dueMonth++;
        if (dueMonth > 11) {
            dueMonth = 0;
            dueYear++;
        }
    }

    // Retorna a data formatada
    const m = dueMonth + 1;
    return `${dueYear}-${String(m).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;
};

// Add a transaction to the credit card
router.post('/transactions', authMiddleware, checkCardOwnership, async (req, res) => {
    const { cardId } = req.params;
    const { description, amount, category, date, importance, installments = 1, observation = '', recurring = false } = req.body;
    const card = req.creditCard;

    if (!description || !amount || !category || !date) {
        return res.status(400).json({ error: 'Faltam campos obrigatórios' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { year: baseYear, month: baseMonth, day: baseDay } = parseLocalDate(date);
        const transactionsToInsert = [];

        // Calculate the first invoice date for the purchase
        const firstInvoiceDateStr = calculateInvoiceDate(date, card.closing_day, card.due_day);
        const firstInvoice = parseLocalDate(firstInvoiceDateStr);
        // firstInvoice.month is 0-indexed

        if (recurring && installments === 1) {
            // Expand recurring: create one entry per month from the first invoice month until December of the same year
            const endMonth = 11; // December (0-indexed)
            const endYear = firstInvoice.year;

            for (let m = firstInvoice.month; m <= endMonth; m++) {
                // The invoice_date for each recurrence: same due_day, advancing month
                const iYear = endYear;
                const iMonth = m + 1; // 1-indexed
                const invoiceDateStr = `${iYear}-${String(iMonth).padStart(2, '0')}-${String(card.due_day).padStart(2, '0')}`;

                transactionsToInsert.push([
                    req.user.id,
                    description,
                    Number(amount).toFixed(2),
                    'VARIABLE_EXPENSE',
                    category,
                    date,
                    observation,
                    'CREDITO',
                    importance || null,
                    cardId,
                    1,   // installments
                    1,   // installment_number
                    invoiceDateStr,
                    1    // recurring
                ]);
            }
        } else {
            // Original installment logic
            for (let i = 0; i < installments; i++) {
                let calcMonth = baseMonth + i; // 0-indexed
                let calcYear = baseYear;
                while (calcMonth > 11) { calcMonth -= 12; calcYear++; }
                const calcDateStr = `${calcYear}-${String(calcMonth + 1).padStart(2, '0')}-${String(baseDay).padStart(2, '0')}`;

                const formattedInvoiceDate = calculateInvoiceDate(calcDateStr, card.closing_day, card.due_day);

                const installmentAmount = (amount / installments).toFixed(2);
                let installmentDesc = description;
                if (installments > 1) {
                    installmentDesc = `${description} (${i + 1}/${installments})`;
                }

                transactionsToInsert.push([
                    req.user.id,
                    installmentDesc,
                    installmentAmount,
                    'VARIABLE_EXPENSE',
                    category,
                    date,
                    observation,
                    'CREDITO',
                    importance || null,
                    cardId,
                    installments,
                    i + 1,
                    formattedInvoiceDate,
                    recurring ? 1 : 0
                ]);
            }
        }

        const insertQuery = `
            INSERT INTO transactions 
            (user_id, description, amount, type, category, date, observation, payment_method, importance, credit_card_id, installments, installment_number, invoice_date, recurring) 
            VALUES ?
        `;

        await conn.query(insertQuery, [transactionsToInsert]);
        await conn.commit();

        res.status(201).json({ message: 'Transação(ões) de crédito adicionada(s) com sucesso' });
    } catch (error) {
        await conn.rollback();
        console.error('Error adding credit transaction:', error);
        res.status(500).json({ error: 'Erro ao adicionar transação no cartão' });
    } finally {
        conn.release();
    }
});

// Pay an invoice
router.post('/:month/:year/pay', authMiddleware, checkCardOwnership, async (req, res) => {
    const { cardId, month, year } = req.params;
    // Pagar fatura significa que o usuário vai tirar do fluxo de caixa e registrar o pagamento real
    // Requer o valor atual pago.

    // PENDENTE IMPLEMENTAÇÃO COMPLETA:
    // Na Opção A pura, a fatura paga apenas reduz o saldo real.
    // Marcar as faturas como pagas poderia ser um campo a mais, mas para manter simples
    // podemos apenas adicionar uma transação de débito no nome "Pagamento Fatura [Cartão]"

    res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
