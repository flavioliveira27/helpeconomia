import express from 'express';
import db from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all credit cards for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT c.*, COALESCE(SUM(t.amount), 0) AS used_limit
             FROM credit_cards c
             LEFT JOIN transactions t ON c.id = t.credit_card_id 
                AND MONTH(t.invoice_date) = MONTH(CURRENT_DATE())
                AND YEAR(t.invoice_date) = YEAR(CURRENT_DATE())
             WHERE c.user_id = ?
             GROUP BY c.id
             ORDER BY c.name ASC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching credit cards:', error);
        res.status(500).json({ error: 'Erro ao buscar cartões de crédito' });
    }
});

// Create a new credit card
router.post('/', authMiddleware, async (req, res) => {
    const { name, brand, limit_amount, closing_day, due_day, color_theme } = req.body;

    if (!name || !brand || !limit_amount || !closing_day || !due_day) {
        return res.status(400).json({ error: 'Nome, Bandeira, Limite, Dia de Fechamento e Dia de Vencimento são obrigatórios.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO credit_cards (user_id, name, brand, limit_amount, closing_day, due_day, color_theme) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, name, brand, limit_amount, closing_day, due_day, color_theme || 'purple']
        );
        res.status(201).json({
            id: result.insertId,
            name,
            brand,
            limit_amount,
            closing_day,
            due_day,
            color_theme: color_theme || 'purple'
        });
    } catch (error) {
        console.error('Error creating credit card:', error);
        res.status(500).json({ error: 'Erro ao criar cartão de crédito' });
    }
});

// Update a credit card
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, brand, limit_amount, closing_day, due_day, color_theme } = req.body;

    try {
        // Verify ownership
        const [existing] = await db.query('SELECT user_id FROM credit_cards WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Cartão não encontrado' });
        if (existing[0].user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });

        await db.query(
            'UPDATE credit_cards SET name = ?, brand = ?, limit_amount = ?, closing_day = ?, due_day = ?, color_theme = ? WHERE id = ?',
            [name, brand, limit_amount, closing_day, due_day, color_theme, id]
        );
        res.json({ message: 'Cartão atualizado com sucesso' });
    } catch (error) {
        console.error('Error updating credit card:', error);
        res.status(500).json({ error: 'Erro ao atualizar cartão de crédito' });
    }
});

// Delete a credit card
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        // Verify ownership
        const [existing] = await db.query('SELECT user_id FROM credit_cards WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Cartão não encontrado' });
        if (existing[0].user_id !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });

        await db.query('DELETE FROM credit_cards WHERE id = ?', [id]);
        res.json({ message: 'Cartão excluído com sucesso' });
    } catch (error) {
        console.error('Error deleting credit card:', error);
        res.status(500).json({ error: 'Erro ao excluir cartão de crédito' });
    }
});

export default router;
