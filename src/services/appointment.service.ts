import { apiFetch } from './api';
import { Appointment, ConsultationRoom } from '../types';

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const res = await apiFetch<{ ok: boolean; appointments: Appointment[] }>('/appointments');
    return res.appointments || [];
  },

  async createAppointment(data: {
    specialistId: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    ageGroup: string;
    mode: string;
    date: string;
    timeSlot: string;
    reason?: string;
    consentGranted: boolean;
    paymentMethod: string;
  }): Promise<{ appointment: Appointment; joinUrl: string }> {
    return apiFetch<{ ok: boolean; appointment: Appointment; joinUrl: string }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    const res = await apiFetch<{ ok: boolean; appointment: Appointment }>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' })
    });
    return res.appointment;
  },

  async getConsultationRoom(roomId: string): Promise<ConsultationRoom> {
    const res = await apiFetch<{ ok: boolean; room: ConsultationRoom }>(`/consultation/${roomId}`);
    return res.room;
  },

  async sendRoomMessage(roomId: string, text: string, sender: 'patient' | 'doctor'): Promise<any> {
    return apiFetch(`/consultation/${roomId}/message`, {
      method: 'POST',
      body: JSON.stringify({ sender, text })
    });
  },

  async saveRoomNotes(roomId: string, clinicalNotes: string): Promise<any> {
    return apiFetch(`/consultation/${roomId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ clinicalNotes })
    });
  }
};
