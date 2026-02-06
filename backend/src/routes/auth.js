import express from 'express';
import { login, googleLogin, register, getCurrentUser, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.post('/register', register);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
