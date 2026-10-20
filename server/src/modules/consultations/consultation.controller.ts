import { Request, Response } from 'express';
import { consultationService } from './consultation.service.js';

export class ConsultationController {
  public getRoom(req: Request, res: Response) {
    const roomId = String(req.params.roomId);
    const room = consultationService.getRoom(roomId);
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Consultation room not found or session has expired.' });
    }
    return res.json({ ok: true, room });
  }

  public sendMessage(req: Request, res: Response) {
    const roomId = String(req.params.roomId);
    const { sender, text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ ok: false, error: 'Valid message text is required.' });
    }

    const msg = consultationService.addMessage(roomId, sender || 'patient', text);
    if (!msg) {
      return res.status(404).json({ ok: false, error: 'Room not found.' });
    }
    return res.status(201).json({ ok: true, message: msg });
  }

  public saveNotes(req: Request, res: Response) {
    const roomId = String(req.params.roomId);
    const { clinicalNotes, prescriptions } = req.body;
    const room = consultationService.saveNotes(roomId, clinicalNotes, prescriptions);
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found.' });
    }
    return res.json({ ok: true, message: 'Clinical notes saved successfully', room });
  }
}

export const consultationController = new ConsultationController();
