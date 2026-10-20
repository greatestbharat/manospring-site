import { Appointment, ConsultationRoom } from '../types';
import { filterSpecialists, getSpecialistById } from './specialists';
import { processLocalChat } from './local-chat';

const STORAGE_KEY = 'manospring_static_appointments';

function loadAppointments(): Appointment[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Appointment[];
  } catch {
    /* ignore */
  }
  return [
    {
      id: 'MANO-784210',
      specialistId: 'spec_1',
      doctorName: 'Dr. Ananya Sharma',
      specialistName: 'Dr. Ananya Sharma',
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
      aiPreSummary:
        'Patient notes persistent sleep-onset insomnia and heightened worry related to new work responsibilities.',
      clinicianNotes: 'Initial intake conducted. Advised sleep hygiene protocol.',
      consentGranted: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'MANO-549112',
      specialistId: 'spec_2',
      doctorName: 'Dr. Nikhil Rao',
      specialistName: 'Dr. Nikhil Rao',
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
      aiPreSummary: 'Patient reports intrusive worries and repetitive checking behaviors.',
      clinicianNotes: '',
      consentGranted: true,
      createdAt: new Date().toISOString()
    }
  ];
}

function saveAppointments(list: Appointment[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

const rooms: Record<string, ConsultationRoom> = {
  'ROOM-784210': {
    roomId: 'ROOM-784210',
    appointmentId: 'MANO-784210',
    doctorName: 'Dr. Ananya Sharma',
    patientName: 'Rohan Mehta',
    mode: 'Video',
    status: 'ready',
    messages: [
      {
        id: 'm1',
        sender: 'system',
        text: 'End-to-end encrypted consultation room initialized.',
        time: '10:29 AM'
      },
      {
        id: 'm2',
        sender: 'doctor',
        text: 'Hello Rohan, good morning. I have reviewed your preliminary notes.',
        time: '10:30 AM'
      }
    ],
    clinicalNotes: 'Initial intake: stress-induced sleep fragmentation.',
    prescriptions: ['Sleep Hygiene Protocol', '4-7-8 breathing twice daily']
  }
};

function parseBody(options: RequestInit): Record<string, unknown> {
  if (!options.body || typeof options.body !== 'string') return {};
  try {
    return JSON.parse(options.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function pathAndQuery(endpoint: string): { path: string; params: URLSearchParams } {
  const [pathPart, query = ''] = endpoint.split('?');
  return { path: pathPart.replace(/\/$/, '') || '/', params: new URLSearchParams(query) };
}

/** In-browser mock API used on GitHub Pages (no server, no secrets). */
export async function handleMockApi(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  // Simulate a short network delay for a realistic demo feel
  await new Promise((r) => setTimeout(r, 120));

  const method = (options.method || 'GET').toUpperCase();
  const { path, params } = pathAndQuery(endpoint);
  const body = parseBody(options);

  if (path === '/specialists' && method === 'GET') {
    return {
      ok: true,
      specialists: filterSpecialists({
        specialty: params.get('specialty'),
        mode: params.get('mode'),
        language: params.get('language'),
        search: params.get('search')
      })
    };
  }

  const specialistMatch = path.match(/^\/specialists\/([^/]+)$/);
  if (specialistMatch && method === 'GET') {
    const specialist = getSpecialistById(specialistMatch[1]);
    if (!specialist) throw new Error('Specialist not found');
    return { ok: true, specialist };
  }

  if (path === '/chat' && method === 'POST') {
    const messages = (body.messages as Parameters<typeof processLocalChat>[0]) || [];
    return processLocalChat(messages);
  }

  if (path === '/appointments' && method === 'GET') {
    return { ok: true, appointments: loadAppointments() };
  }

  if (path === '/appointments' && method === 'POST') {
    const doc =
      getSpecialistById(String(body.specialistId || 'spec_1')) || filterSpecialists()[0];
    const modeStr = String(body.mode || 'Video');
    const modeKey = modeStr.toLowerCase().includes('audio')
      ? 'audio'
      : modeStr.toLowerCase().includes('chat')
        ? 'chat'
        : 'video';
    const idSuffix = Math.floor(100000 + Math.random() * 900000);
    const appointment: Appointment = {
      id: `apt-${idSuffix}`,
      specialistId: doc.id,
      doctorName: doc.name,
      specialistName: doc.name,
      doctorTitle: doc.title,
      doctorAvatar: doc.avatar,
      patientName: String(body.patientName || 'Guest'),
      patientPhone: String(body.patientPhone || ''),
      patientEmail: String(body.patientEmail || ''),
      ageGroup: String(body.ageGroup || ''),
      mode: modeStr as Appointment['mode'],
      date: String(body.date || ''),
      timeSlot: String(body.timeSlot || ''),
      status: 'confirmed',
      fee: doc.fees[modeKey],
      paymentMethod: String(body.paymentMethod || 'UPI'),
      paymentId: `PAY-${idSuffix}`,
      reason: String(body.reason || 'General evaluation'),
      roomId: `mano-${idSuffix}`,
      aiPreSummary: 'Patient booked consultation online (static demo).',
      clinicianNotes: '',
      consentGranted: Boolean(body.consentGranted),
      createdAt: new Date().toISOString()
    };
    const list = loadAppointments();
    list.unshift(appointment);
    saveAppointments(list);
    rooms[appointment.roomId] = {
      roomId: appointment.roomId,
      appointmentId: appointment.id,
      doctorName: appointment.doctorName,
      patientName: appointment.patientName,
      mode: appointment.mode,
      status: 'ready',
      messages: [
        {
          id: 'm0',
          sender: 'system',
          text: 'Secure Teleconsultation Session initialized (demo).',
          time: 'System'
        }
      ],
      clinicalNotes: '',
      prescriptions: []
    };
    return {
      ok: true,
      appointment,
      joinUrl: `/consultations?room=${appointment.roomId}`
    };
  }

  const apptMatch = path.match(/^\/appointments\/([^/]+)$/);
  if (apptMatch && method === 'PATCH') {
    const list = loadAppointments();
    const idx = list.findIndex(
      (a) => a.id === apptMatch[1] || a.id.toLowerCase() === apptMatch[1].toLowerCase()
    );
    if (idx < 0) throw new Error('Appointment not found');
    if (body.status) list[idx] = { ...list[idx], status: body.status as Appointment['status'] };
    saveAppointments(list);
    return { ok: true, appointment: list[idx] };
  }

  const roomMatch = path.match(/^\/consultations?\/([^/]+)$/);
  if (roomMatch && method === 'GET') {
    const roomId = roomMatch[1];
    if (!rooms[roomId]) {
      rooms[roomId] = {
        roomId,
        appointmentId: `apt-${roomId}`,
        doctorName: 'Dr. Ananya Sharma',
        patientName: 'Guest Patient',
        mode: 'Video',
        status: 'ready',
        messages: [
          {
            id: 'm1',
            sender: 'doctor',
            text: 'Welcome to your secure consultation room.',
            time: 'Just now'
          }
        ],
        clinicalNotes: '',
        prescriptions: []
      };
    }
    return { ok: true, room: rooms[roomId] };
  }

  const msgMatch = path.match(/^\/consultations?\/([^/]+)\/message$/);
  if (msgMatch && method === 'POST') {
    const room = rooms[msgMatch[1]];
    if (!room) throw new Error('Room not found');
    const msg = {
      id: `m${Date.now()}`,
      sender: String(body.sender || 'patient'),
      text: String(body.text || ''),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    room.messages = [...(room.messages || []), msg];
    return { ok: true, message: msg, room };
  }

  const notesMatch = path.match(/^\/consultations?\/([^/]+)\/notes$/);
  if (notesMatch && method === 'POST') {
    const room = rooms[notesMatch[1]];
    if (!room) throw new Error('Room not found');
    room.clinicalNotes = String(body.clinicalNotes || '');
    return { ok: true, room };
  }

  if (path === '/auth/login' && method === 'POST') {
    const email = String(body.email || '');
    const isClinician =
      body.role === 'clinician' ||
      email.includes('doctor') ||
      email.includes('sharma') ||
      email.endsWith('@manospring.com');

    if (isClinician) {
      return {
        ok: true,
        token: 'token_clinician_demo_78421',
        user: {
          id: 'spec_1',
          name: 'Dr. Ananya Sharma',
          role: 'clinician',
          title: 'Consultant Psychiatrist',
          token: 'token_clinician_demo_78421'
        }
      };
    }

    return {
      ok: true,
      token: `token_patient_demo_${Date.now()}`,
      user: {
        id: `patient_${Date.now().toString().slice(-6)}`,
        name: String(body.name || 'Patient User'),
        phone: String(body.phone || '+91 98765 43210'),
        role: 'patient',
        token: `token_patient_demo_${Date.now()}`
      }
    };
  }

  if (path === '/privacy/request' && method === 'POST') {
    return { ok: true, ticketId: `PRIV-${Math.floor(100000 + Math.random() * 900000)}` };
  }

  if (
    (path === '/contact/inquiry' || path === '/contact') &&
    (method === 'POST' || method === 'GET')
  ) {
    if (method === 'POST') {
      return { ok: true, ticketId: `INQ-${Math.floor(100000 + Math.random() * 900000)}` };
    }
  }

  if (path === '/health' && method === 'GET') {
    return {
      ok: true,
      service: 'Manospring Healthcare Platform',
      version: '2.1.0-static',
      aiConfigured: false,
      environment: 'github-pages',
      time: new Date().toISOString()
    };
  }

  throw new Error(`Mock API: unsupported ${method} ${path}`);
}
