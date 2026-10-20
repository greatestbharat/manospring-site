import { Router } from 'express';
import { chatController } from './chat.controller.js';
import { chatLimiter } from '../../middleware/rate-limiter.middleware.js';

const router = Router();

router.post('/', chatLimiter, (req, res, next) => chatController.handleChat(req, res, next));

export default router;
