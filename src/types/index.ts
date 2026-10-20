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
  doctorName?: string;
  specialistName?: string;
  doctorTitle?: string;
  specialistRole?: string;
  doctorAvatar?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  ageGroup?: string;
  mode: 'Video' | 'Audio' | 'Chat' | 'video' | 'audio' | 'chat';
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'rescheduled' | 'cancelled';
  fee: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentId?: string;
  reason?: string;
  notes?: string;
  roomId: string;
  aiPreSummary?: string;
  intakeSummary?: string;
  clinicianNotes?: string;
  consentGranted?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  time?: string;
  isUrgent?: boolean;
}

export interface ConsultationRoom {
  roomId: string;
  appointmentId: string;
  doctorName?: string;
  specialistName?: string;
  specialistRole?: string;
  patientName: string;
  mode: 'Video' | 'Audio' | 'Chat' | 'video' | 'audio' | 'chat';
  status: 'ready' | 'in_progress' | 'completed' | 'in-progress';
  messages?: { id: string; sender: string; text: string; time: string }[];
  clinicalNotes?: string;
  prescriptions?: string[];
  createdAt?: string;
}

export interface UserSession {
  id: string;
  name: string;
  role: 'patient' | 'clinician';
  email?: string;
  phone?: string;
  title?: string;
  token?: string;
}
