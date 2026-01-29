import express from 'express';
import { getFinancialInsights } from '../controllers/aiController.js';

const router = express.Router();

router.post('/insights', getFinancialInsights);

export default router;
