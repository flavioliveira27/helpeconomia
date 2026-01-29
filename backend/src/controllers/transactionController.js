import db from '../config/database.js';


// Get all transactions for the current user
export const getAllTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
};

// Create transaction
export const createTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            description,
            amount,
            type,
            category,
            date,
            observation,
            paymentMethod,
            importance,
            installments,
            recurring
        } = req.body;

        if (!description || !amount || !type || !category || !date) {
            return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        }

        const [result] = await db.query(
            `INSERT INTO transactions 
       (user_id, description, amount, type, category, date, observation, payment_method, importance, installments, recurring)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, description, amount, type, category, date, observation || null, paymentMethod || null, importance || null, installments || null, recurring || false]
        );

        const [newTransaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: 'Transação criada com sucesso',
            transaction: newTransaction[0]
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Erro ao criar transação' });
    }
};

// Update transaction
export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if transaction belongs to user
        const [existing] = await db.query(
            'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        const updates = [];
        const values = [];

        const fields = ['description', 'amount', 'type', 'category', 'date', 'observation', 'paymentMethod', 'importance', 'installments', 'recurring'];
        const dbFields = ['description', 'amount', 'type', 'category', 'date', 'observation', 'payment_method', 'importance', 'installments', 'recurring'];

        fields.forEach((field, index) => {
            if (req.body[field] !== undefined) {
                updates.push(`${dbFields[index]} = ?`);
                values.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }

        values.push(id);

        await db.query(
            `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        const [updated] = await db.query('SELECT * FROM transactions WHERE id = ?', [id]);

        res.json({
            message: 'Transação atualizada com sucesso',
            transaction: updated[0]
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [result] = await db.query(
            'DELETE FROM transactions WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.json({ message: 'Transação excluída com sucesso' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ error: 'Erro ao excluir transação' });
    }
};

// Get financial summary
export const getSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const [transactions] = await db.query(
            'SELECT type, amount, payment_method, installments FROM transactions WHERE user_id = ?',
            [userId]
        );

        const summary = {
            totalIncome: 0,
            totalFixedExpenses: 0,
            totalVariableExpenses: 0,
            totalInvestments: 0,
            balance: 0
        };

        transactions.forEach(t => {
            const amount = parseFloat(t.amount);

            switch (t.type) {
                case 'INCOME':
                    summary.totalIncome += amount;
                    summary.balance += amount;
                    break;
                case 'FIXED_EXPENSE':
                    summary.totalFixedExpenses += amount;
                    summary.balance -= amount;
                    break;
                case 'VARIABLE_EXPENSE':
                    summary.totalVariableExpenses += amount;
                    summary.balance -= amount;
                    break;
                case 'INVESTMENT':
                    summary.totalInvestments += amount;
                    summary.balance -= amount;
                    break;
            }
        });

        res.json(summary);
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Erro ao calcular resumo' });
    }
};
