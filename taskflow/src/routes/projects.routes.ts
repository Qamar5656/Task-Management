import { Router } from 'express';
import {projectController} from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Protect ALL project routes
router.use(authMiddleware);

router.post('/create', projectController.createProject)
router.get('/getProjects', projectController.getProjects)
router.get('/:id', projectController.getById);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

export default router;