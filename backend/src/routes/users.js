import express from 'express';
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
