import crypto from 'node:crypto';
import { Appointment } from '../../types/index.js';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../../validators/appointment.validator.js';
import { specialistService } from '../specialists/specialist.service.js';
import { consultationService } from '../consultations/consultation.service.js';

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'MANO-784210',
    specialistId: 'spec_1',
    doctorName: 'Dr. Ananya Sharma',
    doctorTitle: 'Consultant Psychiatrist',
    doctorAvatar: '👩🏽‍⚕️',
    patientName: 'Rohan Mehta',
    patientPhone: '+91 98765 43210',
    patientEmail: 'rohan.m@example.com',
    ageGroup: '25–34',
    mode: 'Video',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    timeSlot: '10:30 AM',
    status: 'confirmed',
    fee: 1200,
    paymentMethod: 'UPI (Google Pay)',
    paymentId: 'PAY-MANO-8914',
    reason: 'Frequent workplace anxiety and difficulty falling asleep for the past 6 weeks.',
    roomId: 'ROOM-784210',
    aiPreSummary: 'Patient notes persistent sleep-onset insomnia and heightened worry related to new work responsibilities. No red flags reported. Seeking clinical evaluation.',
    clinicianNotes: 'Initial intake conducted. Advised sleep hygiene protocol.',
    consentGranted: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'MANO-549112',
    specialistId: 'spec_2',
    doctorName: 'Dr. Nikhil Rao',
    doctorTitle: 'Licensed Clinical Psychologist',
    doctorAvatar: '👨🏽‍⚕️',
    patientName: 'Pooja Iyer',
    patientPhone: '+91 98123 45678',
    patientEmail: 'pooja.iyer@example.com',
    ageGroup: '18–24',
    mode: 'Audio',
    date: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
    timeSlot: '11:15 AM',
    status: 'confirmed',
    fee: 900,
    paymentMethod: 'Credit Card',
    paymentId: 'PAY-MANO-5491',
    reason: 'Repetitive checking behaviors and intrusive health worries.',
    roomId: 'ROOM-549112',
    aiPreSummary: 'Patient reports intrusive worries and repetitive checking behaviors impacting study routines. Follow-up ERP evaluation suggested.',
    clinicianNotes: '',
    consentGranted: true,
    createdAt: new Date().toISOString()
  }
];

export class AppointmentService {
  private appointments: Appointment[] = [...INITIAL_APPOINTMENTS];

  public getAll(filters?: { phone?: string; email?: string; status?: string }): Appointment[] {
    let result = [...this.appointments];
    if (filters?.phone) {
      const cleanPhone = filters.phone.replace(/\D/g, '');
      result = result.filter(a => a.patientPhone.replace(/\D/g, '').includes(cleanPhone));
    }
    if (filters?.email) {
      result = result.filter(a => a.patientEmail.toLowerCase() === filters.email!.toLowerCase());
    }
    if (filters?.status) {
      result = result.filter(a => a.status === filters.status);
    }
    return result;
  }

  public getById(id: string): Appointment | undefined {
    return this.appointments.find(a => a.id === id || a.id.toLowerCase() === id.toLowerCase());
  }

  public create(input: CreateAppointmentInput): { appointment: Appointment; joinUrl: string } {
    const doc = specialistService.getById(input.specialistId) || specialistService.getAll()[0];
    const modeKey = input.mode.toLowerCase().includes('video') ? 'video' :
                    input.mode.toLowerCase().includes('audio') ? 'audio' : 'chat';
    const fee = input.fee || (doc.fees ? doc.fees[modeKey] : 1200) || 1200;

    const idSuffix = Math.floor(100000 + Math.random() * 900000);
    const appointmentId = `apt-${idSuffix}`;
    const roomId = `mano-${idSuffix}`;
    const paymentId = `PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const newAppt: Appointment = {
      id: appointmentId,
      specialistId: doc.id,
      doctorName: doc.name,
      doctorTitle: doc.title,
      doctorAvatar: doc.avatar,
      patientName: input.patientName,
      patientPhone: input.patientPhone,
      patientEmail: input.patientEmail || '',
      ageGroup: input.ageGroup,
      mode: input.mode,
      date: input.date,
      timeSlot: input.timeSlot,
      status: 'confirmed',
      fee,
      paymentMethod: input.paymentMethod,
      paymentId,
      reason: input.reason || 'General evaluation',
      roomId,
      aiPreSummary: 'Patient booked consultation online. Clinical assessment to be initiated during the scheduled session.',
      clinicianNotes: '',
      consentGranted: true,
      createdAt: new Date().toISOString()
    };

    this.appointments.unshift(newAppt);

    // Auto-initialize consultation room in consultations module
    consultationService.createRoom({
      roomId,
      appointmentId,
      doctorName: doc.name,
      patientName: newAppt.patientName,
      mode: newAppt.mode
    });

    return {
      appointment: newAppt,
      joinUrl: `/consultation?room=${roomId}`
    };
  }

  public update(id: string, input: UpdateAppointmentInput): Appointment | undefined {
    const appt = this.getById(id);
    if (!appt) return undefined;

    if (input.status) appt.status = input.status;
    if (input.date) appt.date = input.date;
    if (input.timeSlot) appt.timeSlot = input.timeSlot;
    if (input.clinicianNotes !== undefined) appt.clinicianNotes = input.clinicianNotes;

    return appt;
  }
}

export const appointmentService = new AppointmentService();
