import express from 'express';
import { updateProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Route to update own profile
router.put('/', updateProfile);

export default router;
