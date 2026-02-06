import db from '../config/database.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { OAuth2Client } from 'google-auth-library';


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to calculate trial end
const getTrialEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date;
};

// Register User (Public)
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const trialEnd = getTrialEndDate();

        // Create user with trial status
        const [result] = await db.query(
            `INSERT INTO users (name, email, password, role, subscription_status, trial_ends_at) 
             VALUES (?, ?, ?, 'USER', 'trial', ?)`,
            [name, email, password, trialEnd]
        );

        const newUser = { id: result.insertId, name, email, role: 'USER', subscription_status: 'trial', trial_ends_at: trialEnd };

        // Auto-login (generate token)
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: 'USER' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Conta criada com sucesso',
            user: newUser,
            token
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
};

// Login with Email/Password
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const [users] = await db.query(
            'SELECT id, name, email, password, role, subscription_status, trial_ends_at, photo_url FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const user = users[0];

        // Only check password if user has one (Google users might not)
        if (user.password && user.password !== password) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        if (!user.password) {
            return res.status(401).json({ error: 'Use o login com Google para esta conta' });
        }

        // Check Subscription
        const now = new Date();
        const trialEnds = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
        let isAccessGranted = false;

        if (user.role === 'ADMIN') isAccessGranted = true;
        else if (user.subscription_status === 'active') isAccessGranted = true;
        else if (user.subscription_status === 'trial' && trialEnds && trialEnds > now) isAccessGranted = true;

        if (!isAccessGranted) {
            return res.status(403).json({
                error: 'Assinatura necessária',
                code: 'SUBSCRIPTION_REQUIRED',
                user: { id: user.id, name: user.name, email: user.email }
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.password;
        res.json({ message: 'Login realizado', token, user });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// Google Login
export const googleLogin = async (req, res) => {
    try {
        const { token: googleToken } = req.body;

        // Verify Google Token (In production, use client ID verification)
        // For now, we decode to get payload.
        // const ticket = await googleClient.verifyIdToken({ idToken: googleToken, audience: process.env.GOOGLE_CLIENT_ID });
        // const payload = ticket.getPayload();

        // Mock verification for speed if client id not set, but recommended to fetch from Google
        // Let's assume the frontend sends a valid token and we decode it or fetch user info.
        // Direct fetch from Google UserInfo endpoint is safer if configured.

        // BETTER APPROACH: Use the client library to decode without verify if just prototyping, 
        // OR fetch from https://oauth2.googleapis.com/tokeninfo?id_token=XYZ

        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
        if (!response.ok) throw new Error('Invalid Google Token');
        const payload = await response.json();

        const { email, name, sub: googleId, picture } = payload;

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        let user;
        let isNewUser = false;

        if (users.length > 0) {
            user = users[0];
            // Update Google Info
            await db.query('UPDATE users SET google_id = ?, photo_url = ? WHERE id = ?', [googleId, picture, user.id]);
        } else {
            // Create New User (Start Trial)
            isNewUser = true;
            const trialEnd = getTrialEndDate();
            const [result] = await db.query(
                `INSERT INTO users (name, email, role, subscription_status, trial_ends_at, google_id, photo_url) 
                 VALUES (?, ?, 'USER', 'trial', ?, ?, ?)`,
                [name, email, trialEnd, googleId, picture]
            );
            user = { id: result.insertId, name, email, role: 'USER', subscription_status: 'trial', trial_ends_at: trialEnd, photo_url: picture };
        }

        // Check Subscription (Similar logic)
        const now = new Date();
        const trialEnds = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
        let isAccessGranted = false;

        if (user.role === 'ADMIN') isAccessGranted = true;
        else if (user.subscription_status === 'active') isAccessGranted = true;
        else if (user.subscription_status === 'trial' && trialEnds && trialEnds > now) isAccessGranted = true;

        if (!isAccessGranted) {
            return res.status(403).json({
                error: 'Assinatura necessária',
                code: 'SUBSCRIPTION_REQUIRED',
                user: { id: user.id, name: user.name, email: user.email, photo_url: user.photo_url }
            });
        }

        const jwtToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.password;

        res.json({
            message: isNewUser ? 'Conta criada com sucesso!' : 'Login realizado com sucesso',
            token: jwtToken,
            user,
            isNewUser
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ error: 'Falha na autenticação com Google' });
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
// Forgot Password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        const user = users[0];

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

        await db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [resetToken, resetPasswordExpires, user.id]);

        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: 'E-mail de recuperação enviado' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Erro ao enviar e-mail de recuperação' });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);

        if (users.length === 0) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }
        const user = users[0];

        // Updating password (plain text as per current system, strictly should be hashed)
        await db.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [newPassword, user.id]);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
};
