import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import aiRoutes from './routes/ai.js';
import webhookRoutes from './routes/webhooks.js';
import profileRoutes from './routes/profile.js';
import creditCardRoutes from './routes/credit_cards.js';
import cardInvoiceRoutes from './routes/card_invoices.js';
import { syncDatabase } from './config/initDb.js';

dotenv.config();

// Sync Database Schema
syncDatabase();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'HelpEconomia API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/credit-cards', creditCardRoutes);
app.use('/api/credit-cards/:cardId/invoices', cardInvoiceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor',
        code: err.code || 'INTERNAL_SERVER_ERROR'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}`);
    console.log(`✅ Health: http://localhost:${PORT}/health`);
});
