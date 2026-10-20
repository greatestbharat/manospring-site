import { z } from 'zod';

export const createAppointmentSchema = z.object({
  specialistId: z.string().min(1, 'Specialist selection is required'),
  specialistName: z.string().optional(),
  specialistRole: z.string().optional(),
  patientName: z.string().trim().min(2, 'Full patient name is required').max(100),
  patientPhone: z.string().trim().min(8, 'Valid phone number is required').max(20),
  patientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  ageGroup: z.string().default('25–34'),
  mode: z.enum(['Video', 'Audio', 'Chat', 'video', 'audio', 'chat']).default('Video'),
  date: z.string().min(1, 'Appointment date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  fee: z.number().optional(),
  reason: z.string().max(1000).optional().default(''),
  notes: z.string().max(1000).optional().default(''),
  consentGranted: z.boolean().optional().default(true),
  paymentMethod: z.string().default('UPI (Google Pay)')
});

export const updateAppointmentSchema = z.object({
  status: z.enum(['confirmed', 'in_progress', 'completed', 'rescheduled', 'cancelled']).optional(),
  paymentStatus: z.string().optional(),
  date: z.string().optional(),
  timeSlot: z.string().optional(),
  clinicianNotes: z.string().optional()
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
