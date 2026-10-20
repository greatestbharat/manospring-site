import { ConsultationRoom } from '../../types/index.js';

export const INITIAL_ROOMS: Record<string, ConsultationRoom> = {
  'ROOM-784210': {
    roomId: 'ROOM-784210',
    appointmentId: 'MANO-784210',
    doctorName: 'Dr. Ananya Sharma',
    patientName: 'Rohan Mehta',
    mode: 'Video',
    status: 'ready',
    messages: [
      { id: 'm1', sender: 'system', text: 'End-to-end encrypted consultation room initialized in compliance with India Telemedicine Practice Guidelines 2020.', time: '10:29 AM' },
      { id: 'm2', sender: 'doctor', text: 'Hello Rohan, good morning. I have reviewed your preliminary notes. Please take a seat comfortably and let me know when you can hear me clearly.', time: '10:30 AM' }
    ],
    clinicalNotes: 'Initial intake: Patient experiencing stress-induced sleep fragmentation. Advised sleep hygiene protocol, structured relaxation, and scheduled 2-week follow up.',
    prescriptions: ['Sleep Hygiene Protocol (consistent wake time, digital sunset 60m before bed)', 'Grounding Exercises: 4-7-8 breathing practice twice daily', 'Follow-up review in 14 days']
  },
  'MANO-DEMO-ROOM': {
    roomId: 'MANO-DEMO-ROOM',
    appointmentId: 'MANO-DEMO',
    doctorName: 'Dr. Ananya Sharma',
    patientName: 'Guest Patient',
    mode: 'Video',
    status: 'in_progress',
    messages: [
      { id: 'm1', sender: 'system', text: 'Secure Teleconsultation Session connected. Audio and video encrypted.', time: 'Just now' },
      { id: 'm2', sender: 'doctor', text: 'Welcome to your Manospring session. I am here to listen and help you work through what has been on your mind.', time: 'Just now' }
    ],
    clinicalNotes: 'Interactive demo consultation room. Clinicians can annotate clinical notes, document symptoms, and generate signed summary care plans.',
    prescriptions: ['Guided relaxation audio', 'Maintain daily emotional check-in log']
  }
};

export class ConsultationService {
  private rooms: Record<string, ConsultationRoom> = { ...INITIAL_ROOMS };

  public getRoom(roomId: string): ConsultationRoom {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = {
        roomId,
        appointmentId: 'apt-' + roomId,
        doctorName: 'Dr. Ananya Sharma',
        patientName: 'Confidential Patient',
        mode: 'Video',
        status: 'ready',
        messages: [
          { id: 'm1', sender: 'doctor', text: 'Welcome to your secure consultation room. Please take your time.', time: 'Just now' }
        ],
        clinicalNotes: 'Intake consultation room active.',
        prescriptions: []
      };
    }
    return this.rooms[roomId];
  }

  public createRoom(params: { roomId: string; appointmentId: string; doctorName: string; patientName: string; mode: 'Video' | 'Audio' | 'Chat' | 'video' | 'audio' | 'chat' }): ConsultationRoom {
    const room: ConsultationRoom = {
      roomId: params.roomId,
      appointmentId: params.appointmentId,
      doctorName: params.doctorName,
      patientName: params.patientName,
      mode: params.mode,
      status: 'ready',
      messages: [
        { id: 'm0', sender: 'system', text: 'Secure Teleconsultation Session initialized. Video, voice, and text streams are end-to-end encrypted.', time: 'System' },
        { id: 'm1', sender: 'doctor', text: `Hello ${params.patientName}, I am ${params.doctorName}. I look forward to speaking with you.`, time: 'System' }
      ],
      clinicalNotes: '',
      prescriptions: []
    };
    this.rooms[params.roomId] = room;
    return room;
  }

  public addMessage(roomId: string, sender: 'doctor' | 'patient', text: string) {
    const room = this.rooms[roomId];
    if (!room) return undefined;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = {
      id: 'm_' + Date.now(),
      sender,
      text: text.trim().slice(0, 1000),
      time: timeStr
    };
    room.messages.push(msg);
    return msg;
  }

  public saveNotes(roomId: string, notes?: string, prescriptions?: string[]) {
    const room = this.rooms[roomId];
    if (!room) return undefined;

    if (notes !== undefined) room.clinicalNotes = notes;
    if (prescriptions) room.prescriptions = prescriptions;
    return room;
  }
}

export const consultationService = new ConsultationService();
