import { Router } from 'express';
import { consultationController } from './consultation.controller.js';

const router = Router();

router.get('/:roomId', (req, res) => consultationController.getRoom(req, res));
router.get('/room/:roomId', (req, res) => consultationController.getRoom(req, res));
router.post('/:roomId/message', (req, res) => consultationController.sendMessage(req, res));
router.post('/:roomId/notes', (req, res) => consultationController.saveNotes(req, res));

export default router;
