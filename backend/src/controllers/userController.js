import db from '../config/database.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};

// Create user (Admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

// Update user (Admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (password) {
            updates.push('password = ?');
            values.push(password);
        }
        if (role) {
            updates.push('role = ?');
            values.push(role);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }

        values.push(id);

        await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Você não pode excluir a si mesmo' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
};

// Update own profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, currentPassword, newPassword } = req.body;

        if (!name && !newPassword) {
            return res.status(400).json({ error: 'Nenhum dado para atualizar' });
        }

        // Get current user to verify password if needed
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        const user = users[0];

        // Verify current password if changing to a new one
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
            }
            // In production, use bcrypt.compare here
            if (user.password !== currentPassword) {
                return res.status(400).json({ error: 'Senha atual incorreta' });
            }
        }

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (newPassword) {
            updates.push('password = ?');
            values.push(newPassword);
        }

        values.push(userId);

        await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};
