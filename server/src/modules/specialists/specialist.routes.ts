import { Router } from 'express';
import { specialistController } from './specialist.controller.js';

const router = Router();

router.get('/', (req, res) => specialistController.getAll(req, res));
router.get('/:id', (req, res) => specialistController.getById(req, res));

export default router;
