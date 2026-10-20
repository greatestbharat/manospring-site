import { Request, Response, NextFunction } from 'express';
import { chatRequestSchema } from '../../validators/chat.validator.js';
import { chatService } from './chat.service.js';

export class ChatController {
  public async handleChat(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = chatRequestSchema.parse(req.body);
      const result = await chatService.processChat(validated.messages);
      return res.json({
        ok: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
}

export const chatController = new ChatController();
