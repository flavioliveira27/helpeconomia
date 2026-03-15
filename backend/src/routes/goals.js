import express from 'express';
import { getGoals, createGoal, depositGoal, updateGoal, deleteGoal } from '../controllers/goalController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All goal routes require authentication
router.use(authMiddleware);

router.get('/', getGoals);
router.post('/', createGoal);
router.post('/:id/deposit', depositGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
