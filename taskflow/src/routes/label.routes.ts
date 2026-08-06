import { Router } from 'express';
import { labelController } from '../controllers/label.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/create', labelController.create);
router.get('/:workspaceId', labelController.getByWorkspace);
router.post('/attach', labelController.attach);

export default router;
