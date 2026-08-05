import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Protect ALL workspace routes with the auth middleware
router.use(authMiddleware);

router.post('/create', workspaceController.create);
router.get('/', workspaceController.getAll);
router.get('/:id', workspaceController.getById);
router.put('/:id', workspaceController.update);
router.delete('/:id', workspaceController.delete);

// Member Routes
router.post('/:id/members', workspaceController.addMember);
router.get('/:id/members', workspaceController.getMembers);
router.delete('/:id/members/:userId', workspaceController.removeMember);

export default router;
