import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.put('/me/password', userController.updatePassword);

export default router;
