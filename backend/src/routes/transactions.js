import express from 'express';
import {
    getAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getSummary
} from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All transaction routes require authentication
router.use(authMiddleware);

router.get('/', getAllTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/summary', getSummary);

export default router;
