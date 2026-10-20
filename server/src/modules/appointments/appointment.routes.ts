import { Router } from 'express';
import { appointmentController } from './appointment.controller.js';

const router = Router();

router.get('/', (req, res) => appointmentController.getAll(req, res));
router.post('/', (req, res, next) => appointmentController.create(req, res, next));
router.get('/:id', (req, res) => appointmentController.getById(req, res));
router.patch('/:id', (req, res, next) => appointmentController.update(req, res, next));

export default router;
