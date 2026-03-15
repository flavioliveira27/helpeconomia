import db from '../config/database.js';

// Get all goals for the user
export const getGoals = async (req, res) => {
    try {
        const [goals] = await db.query(
            'SELECT * FROM goals WHERE user_id = ? ORDER BY status ASC, deadline ASC',
            [req.user.id]
        );
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Erro ao buscar metas' });
    }
};

// Create a new goal
export const createGoal = async (req, res) => {
    try {
        const { name, target_amount, deadline, color_theme } = req.body;

        if (!name || !target_amount || !deadline) {
            return res.status(400).json({ error: 'Nome, valor alvo e prazo são obrigatórios' });
        }

        const query = `
            INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, color_theme, status)
            VALUES (?, ?, ?, 0.00, ?, ?, 'ACTIVE')
        `;
        
        const [result] = await db.query(query, [
            req.user.id, 
            name, 
            target_amount, 
            deadline, 
            color_theme || 'blue'
        ]);

        const [newGoal] = await db.query('SELECT * FROM goals WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: 'Meta criada com sucesso',
            goal: newGoal[0]
        });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Erro ao criar meta' });
    }
};

// Deposit into a goal
export const depositGoal = async (req, res) => {
    try {
        const goalId = req.params.id;
        const { amount, date } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valor de depósito inválido' });
        }

        const [goals] = await db.query('SELECT * FROM goals WHERE id = ? AND user_id = ?', [goalId, req.user.id]);
        
        if (goals.length === 0) {
            return res.status(404).json({ error: 'Meta não encontrada' });
        }

        const goal = goals[0];
        const newCurrentAmount = Number(goal.current_amount) + Number(amount);
        const newStatus = newCurrentAmount >= Number(goal.target_amount) ? 'COMPLETED' : 'ACTIVE';

        // Start Transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Update Goal
            await connection.query(
                'UPDATE goals SET current_amount = ?, status = ? WHERE id = ?',
                [newCurrentAmount, newStatus, goalId]
            );

            // 2. Create Transaction (Investment) using the date provided by the user
            // Falls back to today's date if none is provided
            const transactionDate = req.body.date || new Date().toISOString().split('T')[0];
            const transactionQuery = `
                INSERT INTO transactions (user_id, description, amount, type, category, date, payment_method, importance)
                VALUES (?, ?, ?, 'INVESTMENT', 'Metas', ?, 'PIX', 'ESSENCIAL')
            `;
            await connection.query(transactionQuery, [
                req.user.id,
                `Depósito na Meta: ${goal.name}`,
                amount,
                transactionDate
            ]);

            await connection.commit();

            const [updatedGoal] = await connection.query('SELECT * FROM goals WHERE id = ?', [goalId]);
            
            res.json({
                message: 'Depósito realizado com sucesso',
                goal: updatedGoal[0]
            });

        } catch (txError) {
            await connection.rollback();
            throw txError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error depositing to goal:', error);
        res.status(500).json({ error: 'Erro ao depositar na meta' });
    }
};

// Update a goal
export const updateGoal = async (req, res) => {
    try {
        const goalId = req.params.id;
        const { name, target_amount, deadline, color_theme, status } = req.body;

        const [goals] = await db.query('SELECT * FROM goals WHERE id = ? AND user_id = ?', [goalId, req.user.id]);
        
        if (goals.length === 0) {
            return res.status(404).json({ error: 'Meta não encontrada' });
        }

        const query = `
            UPDATE goals 
            SET name = ?, target_amount = ?, deadline = ?, color_theme = ?, status = ?
            WHERE id = ?
        `;
        
        await db.query(query, [
            name || goals[0].name,
            target_amount || goals[0].target_amount,
            deadline || goals[0].deadline,
            color_theme || goals[0].color_theme,
            status || goals[0].status,
            goalId
        ]);

        const [updatedGoal] = await db.query('SELECT * FROM goals WHERE id = ?', [goalId]);

        res.json({
            message: 'Meta atualizada com sucesso',
            goal: updatedGoal[0]
        });

    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Erro ao atualizar meta' });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    try {
        const goalId = req.params.id;

        const [goals] = await db.query('SELECT * FROM goals WHERE id = ? AND user_id = ?', [goalId, req.user.id]);
        
        if (goals.length === 0) {
            return res.status(404).json({ error: 'Meta não encontrada' });
        }

        const goal = goals[0];

        // Use a transaction to atomically delete the goal and its related transactions
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Delete linked investment transactions (deposits made for this goal)
            await connection.query(
                "DELETE FROM transactions WHERE user_id = ? AND description = ? AND type = 'INVESTMENT'",
                [req.user.id, `Depósito na Meta: ${goal.name}`]
            );

            // 2. Delete the goal itself
            await connection.query('DELETE FROM goals WHERE id = ?', [goalId]);

            await connection.commit();
            res.json({ message: 'Meta e transações relacionadas excluídas com sucesso' });

        } catch (txError) {
            await connection.rollback();
            throw txError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Erro ao excluir meta' });
    }
};
