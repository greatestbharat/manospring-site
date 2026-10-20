import { Request, Response, NextFunction } from 'express';
import { contactInquirySchema, privacyRequestSchema } from '../../validators/contact.validator.js';
import { contactService } from './contact.service.js';

export class ContactController {
  public submitInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = contactInquirySchema.parse(req.body);
      const inquiry = contactService.submitInquiry(validated);
      return res.status(201).json({
        ok: true,
        message: 'Thank you for contacting Manospring. Our care coordination team will respond within 24 hours.',
        referenceId: inquiry.id,
        ticketId: inquiry.id,
        inquiry
      });
    } catch (err) {
      next(err);
    }
  }

  public submitPrivacyRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = privacyRequestSchema.parse(req.body);
      const ticket = contactService.submitPrivacyRequest(validated);
      return res.status(201).json({
        ok: true,
        message: 'Your request under the Digital Personal Data Protection Act 2023 has been logged. Our Data Protection Officer will process it within 72 business hours.',
        ticketId: ticket.id,
        trackingId: ticket.id,
        referenceId: ticket.id,
        ticket
      });
    } catch (err) {
      next(err);
    }
  }
}

export const contactController = new ContactController();
