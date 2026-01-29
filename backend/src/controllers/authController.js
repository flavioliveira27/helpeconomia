import db from '../config/database.js';
import jwt from 'jsonwebtoken';

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const [users] = await db.query(
            'SELECT id, name, email, password, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const user = users[0];

        // Simple password comparison (in production, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        delete user.password;

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};
