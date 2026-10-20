import { Request, Response } from 'express';
import { specialistService } from './specialist.service.js';

export class SpecialistController {
  public getAll(req: Request, res: Response) {
    const { specialty, mode, language, search } = req.query as { [key: string]: string };
    const list = specialistService.getAll({ specialty, mode, language, search });
    return res.json({ ok: true, count: list.length, specialists: list });
  }

  public getById(req: Request, res: Response) {
    const id = String(req.params.id);
    const doc = specialistService.getById(id);
    if (!doc) {
      return res.status(404).json({ ok: false, error: 'Specialist not found' });
    }
    return res.json({ ok: true, specialist: doc });
  }
}

export const specialistController = new SpecialistController();
