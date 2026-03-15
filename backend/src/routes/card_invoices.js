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

// Calculate the invoice date based on purchase date and card closing day
const calculateInvoiceDate = (purchaseDateStr, closingDay, dueDay) => {
    const purchaseDate = new Date(purchaseDateStr);
    let invoiceMonth = purchaseDate.getMonth();
    let invoiceYear = purchaseDate.getFullYear();

    // Se a compra foi feita no dia de fechamento ou depois, vai para a próxima fatura
    if (purchaseDate.getDate() >= closingDay) {
        invoiceMonth++;
        if (invoiceMonth > 11) {
            invoiceMonth = 0;
            invoiceYear++;
        }
    }

    // Data base da fatura é o dia de vencimento daquele mês
    return new Date(invoiceYear, invoiceMonth, dueDay);
};

// Add a transaction to the credit card
router.post('/transactions', authMiddleware, checkCardOwnership, async (req, res) => {
    const { cardId } = req.params;
    const { description, amount, category, date, importance, installments = 1, observation = '' } = req.body;
    const card = req.creditCard;

    if (!description || !amount || !category || !date) {
        return res.status(400).json({ error: 'Faltam campos obrigatórios' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const basePurchaseDate = new Date(date);
        const transactionsToInsert = [];

        for (let i = 0; i < installments; i++) {
            // Calcula a data da compra original + i meses para determinar a fatura
            const currentDateForCalc = new Date(basePurchaseDate);
            currentDateForCalc.setMonth(basePurchaseDate.getMonth() + i);

            const invoiceDate = calculateInvoiceDate(currentDateForCalc, card.closing_day, card.due_day);
            const formattedInvoiceDate = invoiceDate.toISOString().split('T')[0];

            const installmentAmount = (amount / installments).toFixed(2);
            let installmentDesc = description;
            if (installments > 1) {
                installmentDesc = `${description} (${i + 1}/${installments})`;
            }

            transactionsToInsert.push([
                req.user.id,
                installmentDesc,
                installmentAmount,
                'VARIABLE_EXPENSE', // Compra no crédito é tratada como despesa variável
                category,
                date, // Data original da compra
                observation,
                'CREDITO',
                importance || null,
                cardId,
                installments,
                i + 1,
                formattedInvoiceDate
            ]);
        }

        const insertQuery = `
            INSERT INTO transactions 
            (user_id, description, amount, type, category, date, observation, payment_method, importance, credit_card_id, installments, installment_number, invoice_date) 
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
