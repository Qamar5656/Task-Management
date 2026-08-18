import { Router } from 'express';
import { activityController } from '../controllers/activity.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', activityController.getRecentActivities);

export default router;
