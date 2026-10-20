import { Request, Response, NextFunction } from 'express';
import { createAppointmentSchema, updateAppointmentSchema } from '../../validators/appointment.validator.js';
import { appointmentService } from './appointment.service.js';

export class AppointmentController {
  public getAll(req: Request, res: Response) {
    const { phone, email, status } = req.query as { [key: string]: string };
    const list = appointmentService.getAll({ phone, email, status });
    return res.json({ ok: true, count: list.length, appointments: list });
  }

  public getById(req: Request, res: Response) {
    const id = String(req.params.id);
    const appt = appointmentService.getById(id);
    if (!appt) {
      return res.status(404).json({ ok: false, error: 'Appointment not found' });
    }
    return res.json({ ok: true, appointment: appt });
  }

  public create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createAppointmentSchema.parse(req.body);
      const result = appointmentService.create(validated);
      return res.status(201).json({
        ok: true,
        message: 'Appointment booked successfully',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  public update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const validated = updateAppointmentSchema.parse(req.body);
      const updated = appointmentService.update(id, validated);
      if (!updated) {
        return res.status(404).json({ ok: false, error: 'Appointment not found' });
      }
      return res.json({
        ok: true,
        message: 'Appointment updated successfully',
        appointment: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

export const appointmentController = new AppointmentController();
