import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js'; 

const router = Router();

// Protect ALL task routes
router.use(authMiddleware);

router.post('/create', taskController.create);
router.get('/', taskController.getByProject);
router.get('/:id', taskController.getById);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

export default router;
