export interface Specialist {
  id: string;
  name: string;
  avatar: string;
  title: string;
  role?: string;
  degrees: string;
  qualifications?: string;
  council: string;
  regNumber: string;
  registrationNumber?: string;
  verified: boolean;
  experienceYears: number;
  languages: string[];
  specialties: string[];
  specialty?: string;
  modes: ('Video' | 'Audio' | 'Chat' | 'video' | 'audio' | 'chat')[];
  fees: { video: number; audio: number; chat: number };
  fee?: number;
  rating: number;
  reviewsCount: number;
  nextSlot: string;
  availableSlots: string[];
  bio: string;
  telemedicineCertified: boolean;
}

export interface Appointment {
  id: string;
  specialistId: string;
  doctorName: string;
  doctorTitle: string;
  doctorAvatar: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  ageGroup: string;
  mode: 'Video' | 'Audio' | 'Chat' | 'video' | 'audio' | 'chat';
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'rescheduled' | 'cancelled';
  fee: number;
  paymentMethod: string;
  paymentId: string;
  reason: string;
  roomId: string;
  aiPreSummary: string;
  clinicianNotes: string;
  consentGranted: boolean;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConsultationRoom {
  roomId: string;
  appointmentId: string;
  doctorName: string;
  patientName: string;
  mode: 'Video' | 'Audio' | 'Chat' | 'video' | 'audio' | 'chat';
  status: 'ready' | 'in_progress' | 'completed';
  messages: { id: string; sender: 'doctor' | 'patient' | 'system'; text: string; time: string }[];
  clinicalNotes: string;
  prescriptions: string[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface PrivacyRequest {
  id: string;
  type: 'data_access' | 'data_erasure' | 'consent_withdrawal' | 'data_correction';
  fullName: string;
  email: string;
  phone: string;
  details: string;
  status: string;
  receivedAt: string;
}
