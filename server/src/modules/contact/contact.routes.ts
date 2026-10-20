import { Router } from 'express';
import { contactController } from './contact.controller.js';

const router = Router();

router.post('/', (req, res, next) => contactController.submitInquiry(req, res, next));
router.post('/inquiry', (req, res, next) => contactController.submitInquiry(req, res, next));
router.post('/privacy/request', (req, res, next) => contactController.submitPrivacyRequest(req, res, next));

export default router;
