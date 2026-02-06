
import express from 'express';
import { handleKiwifyWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/kiwify', handleKiwifyWebhook);

export default router;
