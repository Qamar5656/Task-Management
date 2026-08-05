import {Router} from 'express';
import {commentController} from '../controllers/comment.controller.js';
import {authMiddleware} from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/create', commentController.createComment);
router.get('/task/:taskId', commentController.getComments);
router.get('/:id', commentController.getById);
router.put('/:id', commentController.update);
router.delete('/:id', commentController.delete);

export default router;