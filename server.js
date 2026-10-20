import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: '32kb' }));

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' }
});

const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: 25,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages in a short time. Please take a breath and try again in a minute.' }
});

app.use('/api/', apiLimiter);
app.use('/api/chat', chatLimiter);

// Serve static assets from public
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// ==========================================
// DATA STORE (In-Memory with Preloaded Data)
// ==========================================

const SPECIALISTS = [
  {
    id: 'spec_1',
    name: 'Dr. Ananya Sharma',
    avatar: '👩🏽‍⚕️',
    title: 'Consultant Psychiatrist',
    degrees: 'MBBS, MD (Psychiatry) — NIMHANS, Bengaluru',
    council: 'Karnataka Medical Council',
    regNumber: 'KMC-78421',
    verified: true,
    experienceYears: 12,
    languages: ['English', 'Kannada', 'Hindi'],
    specialties: ['Adult ADHD', 'Anxiety & Panic Disorders', 'Clinical Depression', 'Sleep Medicine'],
    modes: ['Video', 'Audio', 'Chat'],
    fees: { video: 1200, audio: 1000, chat: 800 },
    rating: 4.92,
    reviewsCount: 184,
    nextSlot: 'Today, 5:30 PM',
    availableSlots: ['Today 5:30 PM', 'Today 7:00 PM', 'Tomorrow 10:30 AM', 'Tomorrow 3:00 PM', 'Tomorrow 6:15 PM'],
    bio: 'Specialist in the neurobiology of mood disorders and evidence-informed psychopharmacology. Trained at NIMHANS, Bengaluru. Emphasizes conservative medication, lifestyle rhythm interventions, and collaborative, stigma-free patient partnerships.',
    telemedicineCertified: true
  },
  {
    id: 'spec_2',
    name: 'Dr. Nikhil Rao',
    avatar: '👨🏽‍⚕️',
    title: 'Licensed Clinical Psychologist',
    degrees: 'M.Phil in Clinical Psychology — CIP Ranchi, Ph.D.',
    council: 'Rehabilitation Council of India (RCI)',
    regNumber: 'RCI CRR #A54921',
    verified: true,
    experienceYears: 9,
    languages: ['English', 'Hindi', 'Bengali'],
    specialties: ['Cognitive Behavioral Therapy (CBT)', 'OCD (Exposure & Response Prevention)', 'Health Anxiety', 'Workplace Burnout'],
    modes: ['Video', 'Audio', 'Chat'],
    fees: { video: 1100, audio: 900, chat: 750 },
    rating: 4.95,
    reviewsCount: 230,
    nextSlot: 'Tomorrow, 10:00 AM',
    availableSlots: ['Tomorrow 10:00 AM', 'Tomorrow 11:30 AM', 'Tomorrow 2:00 PM', 'Tomorrow 4:30 PM'],
    bio: 'RCI-certified clinical psychologist specializing in third-wave CBT, Acceptance & Commitment Therapy (ACT), and structured behavioral interventions. Warm, methodical approach focused on actionable coping tools.',
    telemedicineCertified: true
  },
  {
    id: 'spec_3',
    name: 'Dr. Sunita Kulkarni',
    avatar: '👩🏻‍⚕️',
    title: 'Senior Consultant Psychiatrist',
    degrees: 'MBBS, MD (Psychiatry) — AIIMS New Delhi, DNB',
    council: 'Delhi Medical Council',
    regNumber: 'DMC-44912',
    verified: true,
    experienceYears: 16,
    languages: ['English', 'Hindi', 'Marathi'],
    specialties: ['Bipolar Spectrum', 'Women’s Mental Health (Perinatal/Postpartum)', 'Treatment-Resistant Depression'],
    modes: ['Video', 'Audio'],
    fees: { video: 1500, audio: 1200, chat: 950 },
    rating: 4.89,
    reviewsCount: 312,
    nextSlot: 'Tomorrow, 2:30 PM',
    availableSlots: ['Tomorrow 2:30 PM', 'Tomorrow 5:00 PM', 'Day after 11:00 AM', 'Day after 4:00 PM'],
    bio: 'Former faculty at premier medical institutes with over 16 years of clinical practice. Extensive experience in holistic psychiatric diagnosis, women’s reproductive life-cycle mental health, and patient psychoeducation.',
    telemedicineCertified: true
  },
  {
    id: 'spec_4',
    name: 'Ms. Priya Venkatesh',
    avatar: '👩🏽‍💼',
    title: 'Counseling Psychologist & Family Therapist',
    degrees: 'M.Sc Counseling Psychology, PG Dip Systemic Family Therapy',
    council: 'Bharatiya Counseling Psychology Association',
    regNumber: 'BCPA #2019-892',
    verified: true,
    experienceYears: 7,
    languages: ['English', 'Tamil', 'Kannada'],
    specialties: ['Relationship & Marital Therapy', 'Grief & Bereavement', 'Young Adult Identity', 'Imposter Syndrome'],
    modes: ['Video', 'Audio', 'Chat'],
    fees: { video: 900, audio: 750, chat: 600 },
    rating: 4.86,
    reviewsCount: 142,
    nextSlot: 'Today, 7:00 PM',
    availableSlots: ['Today 7:00 PM', 'Tomorrow 1:00 PM', 'Tomorrow 6:00 PM', 'Day after 3:30 PM'],
    bio: 'Compassionate, trauma-informed therapist dedicated to creating safe, non-judgmental conversational spaces. Focuses on interpersonal dynamics, emotional boundaries, and healthy communication.',
    telemedicineCertified: true
  },
  {
    id: 'spec_5',
    name: 'Dr. Rajesh Menokari',
    avatar: '👨🏻‍⚕️',
    title: 'Consultant Psychiatrist',
    degrees: 'MBBS, DPM, DNB (Psychiatry) — KEM Hospital Mumbai',
    council: 'Maharashtra Medical Council',
    regNumber: 'MMC-2008/04/1120',
    verified: true,
    experienceYears: 14,
    languages: ['English', 'Hindi', 'Malayalam'],
    specialties: ['Academic Stress & Exam Anxiety', 'Social Anxiety Disorder', 'Sleep Rhythm Optimization'],
    modes: ['Video', 'Audio', 'Chat'],
    fees: { video: 1300, audio: 1050, chat: 800 },
    rating: 4.91,
    reviewsCount: 198,
    nextSlot: 'Oct 21, 11:30 AM',
    availableSlots: ['Tomorrow 4:00 PM', 'Oct 21 11:30 AM', 'Oct 21 3:00 PM'],
    bio: 'Empathetic young-adult and student mental health specialist. Blends neurobiological understanding with practical cognitive reframing to help clients overcome performance paralysis and chronic social fatigue.',
    telemedicineCertified: true
  }
];

// In-Memory store for appointments
const APPOINTMENTS = [
  {
    id: 'MANO-784210',
    specialistId: 'spec_1',
    doctorName: 'Dr. Ananya Sharma',
    doctorTitle: 'Consultant Psychiatrist',
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
    clinicianNotes: '',
    consentGranted: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'MANO-549112',
    specialistId: 'spec_2',
    doctorName: 'Dr. Nikhil Rao',
    doctorTitle: 'Licensed Clinical Psychologist',
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

// Room consultation messages & notes
const CONSULTATION_ROOMS = {
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
    clinicalNotes: 'Initial intake: Patient experiencing stress-induced sleep fragmentation. Advised sleep hygiene protocol, structured relaxation, and scheduled 2-week follow up. No pharmacotherapy indicated at this stage.',
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

const CONTACT_MESSAGES = [];
const PRIVACY_REQUESTS = [];

// ==========================================
// CRISIS & AI SYSTEM CONFIGURATION
// ==========================================

const urgentPattern = /\b(kill myself|suicid(e|al)|end my life|want to die|don't want to live|do not want to live|hurt myself|harm myself|self[- ]harm|overdose|take all (the )?pills|going to hurt someone|kill someone|cut my wrist|hang myself|end it all)\b/i;

const urgentReply = `I hear how much pain you are in right now, and your safety is the absolute most important thing. You do not have to carry this alone.

Because I am an AI assistant, I cannot provide crisis intervention or emergency medical care. Please reach out right now to one of these free, confidential, 24x7 support lines in India:

• Tele-MANAS (Govt of India, 24/7 National Mental Health Helpline): Call 14416 or 1800-891-4416
• National Emergency Services: Call 112 or visit the nearest hospital emergency room
• Vandrevala Foundation (24/7 Helpline & Crisis Counseling): Call +91 9999 666 555
• KIRAN (Mental Health Rehabilitation Helpline): Call 1800-599-0019

If you can, please stay with or call a family member, close friend, or someone you trust right this second and let them know you need support.`;

const systemPrompt = `You are Manospring Guide, a warm, compassionate, culturally sensitive AI mental wellbeing companion for Manospring, a professional mental health platform in India. You are an AI guide, NOT a clinician, doctor, or therapist.

CORE MISSION & ETHICAL BOUNDARIES:
- Provide empathetic emotional support, active listening, gentle psychoeducation, and low-risk grounding techniques.
- NEVER make medical diagnoses, prescribe medications, alter existing prescriptions, or claim to provide psychological therapy or cure.
- NEVER claim to be a doctor, psychiatrist, or licensed professional.
- Explain clearly that your responses are for general wellbeing guidance and support, not individualized medical treatment.

NATURAL LANGUAGE UNDERSTANDING & INDIAN CONTEXT:
- Read all messages with profound charity, kindness, and human context.
- Naturally understand Indian English, colloquial expressions, and emotion words:
  * "kinda stressed yaar", "too much tension", "not feeling ok tbh", "bohot tension hai", "feeling low", "brain fog", "cant focus at work", "family pressure", "feeling overwhelmed", "burnout".
- Never ask the user to fix spelling, punctuation, or grammar. Decode informal shorthand ("v low", "pls", "rn", "cant sleep", "idk") seamlessly.
- If someone introduces themselves ("hi, i'm arjun" or "hello my name is priya"), acknowledge them warmly by name without treating it as formal intake.
- Respect diverse family, relationship, social, and cultural realities in India without judgment or presumption.

CONVERSATION PACING & INTERACTION RULES:
- Keep responses concise, warm, and readable: 2 to 4 thoughtful paragraphs/sentences. Avoid wall-of-text responses.
- Start with validation: explicitly acknowledge what the user shared before offering any ideas.
- Ask at most ONE gentle follow-up question per message. Never conduct an interrogation or rapid-fire clinical intake.
- When appropriate, share gentle, evidence-informed coping ideas (e.g. 5-4-3-2-1 grounding, box breathing, sleep hygiene, journaling, gentle walking).
- Suggest booking a consultation with a qualified psychiatrist or clinical psychologist after approximately 8–10 user messages, or IMMEDIATELY whenever the user asks about diagnosis, medication, severe chronic distress, or professional therapy.
- In emergencies (suicide, self-harm, severe violence), immediately provide the 112 and Tele-MANAS 14416 helplines.`;

// Compassionate contextual fallback generator if Groq is offline or network-blocked
function generateCompassionateFallback(lastMsg, turnCount) {
  const text = lastMsg.toLowerCase();
  let suggestion = 'Would you like to explore what has been causing you the most stress lately?';
  let coping = 'Taking a slow, deep breath and giving yourself permission to pause can be a small first step.';

  if (/sleep|insomnia|wake up|night|tired|exhausted/.test(text)) {
    coping = 'Sleep disruptions often reflect an overburdened nervous system. A gentle bedtime wind-down, stepping away from screens 45 minutes before sleep, and keeping a notebook by your bed to jot down racing thoughts can sometimes help ease the night.';
    suggestion = 'How many nights in the past week have felt restless or difficult for you?';
  } else if (/anxious|anxiety|panic|heart racing|overwhelm|nervous|worry/.test(text)) {
    coping = 'When anxiety runs high, our body goes into overdrive. A helpful grounding exercise is the 5-4-3-2-1 technique: notice 5 things you can see around you, 4 things you can touch, 3 sounds you can hear, 2 scents, and 1 slow breath.';
    suggestion = 'Does this feeling feel more physical in your body, or is it racing thoughts keeping you on edge?';
  } else if (/low|sad|empty|crying|depress|hopeless|lonely|alone/.test(text)) {
    coping = 'Feeling low or depleted is heavy, and it takes courage just to acknowledge it. Please remember that you do not have to have everything figured out today; taking things hour by hour is more than enough.';
    suggestion = 'Has anyone close to you noticed how heavy things have been feeling lately, or have you been holding this on your own?';
  } else if (/work|job|boss|burnout|study|exam|college|deadline/.test(text)) {
    coping = 'Chronic burnout and relentless performance pressure can slowly drain your emotional reserves. Protecting even 15 minutes of uninterrupted quiet time away from Slack or study material is essential care, not a luxury.';
    suggestion = 'What part of your daily routine feels like it is demanding the most energy from you right now?';
  } else if (/relationship|marriage|partner|parents|family|fight|breakup/.test(text)) {
    coping = 'Interpersonal tensions can feel intensely destabilizing because our closest bonds matter so deeply. Giving yourself time to process your emotions before reacting can help protect your peace.';
    suggestion = 'Would it be helpful to talk about what happened, or would you prefer ideas on finding calm right now?';
  }

  const response = `Thank you for sharing that with me. It sounds like things have been truly challenging, and what you are feeling is completely valid.\n\n${coping}\n\n${suggestion}`;
  return response;
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Manospring Mental Healthcare Platform',
    version: '2.0.0',
    aiConfigured: Boolean(GROQ_API_KEY),
    model: GROQ_MODEL,
    time: new Date().toISOString()
  });
});

// Specialists Directory
app.get('/api/specialists', (req, res) => {
  const { specialty, mode, language, search } = req.query;
  let results = [...SPECIALISTS];

  if (specialty && specialty !== 'all') {
    const s = String(specialty).toLowerCase();
    results = results.filter(doc =>
      doc.title.toLowerCase().includes(s) ||
      doc.specialties.some(sp => sp.toLowerCase().includes(s))
    );
  }

  if (mode && mode !== 'all') {
    const m = String(mode).toLowerCase();
    results = results.filter(doc =>
      doc.modes.some(mod => mod.toLowerCase().includes(m))
    );
  }

  if (language && language !== 'all') {
    const l = String(language).toLowerCase();
    results = results.filter(doc =>
      doc.languages.some(lang => lang.toLowerCase().includes(l))
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(doc =>
      doc.name.toLowerCase().includes(q) ||
      doc.title.toLowerCase().includes(q) ||
      doc.specialties.some(sp => sp.toLowerCase().includes(q))
    );
  }

  res.json({ ok: true, count: results.length, specialists: results });
});

// Single Specialist
app.get('/api/specialists/:id', (req, res) => {
  const doc = SPECIALISTS.find(s => s.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Specialist not found' });
  res.json({ ok: true, specialist: doc });
});

// Appointments: List
app.get('/api/appointments', (req, res) => {
  const { phone, email, status } = req.query;
  let list = [...APPOINTMENTS];
  if (phone) {
    const cleanPhone = String(phone).replace(/\D/g, '');
    list = list.filter(a => a.patientPhone.replace(/\D/g, '').includes(cleanPhone));
  }
  if (email) {
    list = list.filter(a => a.patientEmail.toLowerCase() === String(email).toLowerCase());
  }
  if (status) {
    list = list.filter(a => a.status === status);
  }
  res.json({ ok: true, count: list.length, appointments: list });
});

// Appointments: Create
app.post('/api/appointments', (req, res) => {
  try {
    const {
      specialistId,
      patientName,
      patientPhone,
      patientEmail,
      ageGroup,
      mode,
      date,
      timeSlot,
      reason,
      consentGranted,
      paymentMethod
    } = req.body;

    if (!patientName || !patientPhone || !date || !timeSlot) {
      return res.status(400).json({ error: 'Please provide full patient name, mobile number, date, and time slot.' });
    }

    if (!consentGranted) {
      return res.status(400).json({ error: 'Informed telemedicine consent under DPDPA 2023 is required to book a consultation.' });
    }

    const doc = SPECIALISTS.find(s => s.id === specialistId) || SPECIALISTS[0];
    const modeKey = (mode || 'Video').toLowerCase().includes('video') ? 'video' :
                    (mode || '').toLowerCase().includes('audio') ? 'audio' : 'chat';
    const fee = doc.fees[modeKey] || 1000;

    const idSuffix = Math.floor(100000 + Math.random() * 900000);
    const appointmentId = `MANO-${idSuffix}`;
    const roomId = `ROOM-${idSuffix}`;
    const paymentId = `PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const newAppt = {
      id: appointmentId,
      specialistId: doc.id,
      doctorName: doc.name,
      doctorTitle: doc.title,
      doctorAvatar: doc.avatar,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: (patientEmail || '').trim(),
      ageGroup: ageGroup || '25–34',
      mode: mode || 'Video',
      date,
      timeSlot,
      status: 'confirmed',
      fee,
      paymentMethod: paymentMethod || 'UPI (Google Pay)',
      paymentId,
      reason: (reason || 'Routine consultation').trim(),
      roomId,
      aiPreSummary: 'Patient booked consultation online. Clinical assessment to be initiated during the scheduled session.',
      clinicianNotes: '',
      consentGranted: true,
      createdAt: new Date().toISOString()
    };

    APPOINTMENTS.unshift(newAppt);

    // Initialize consultation room
    CONSULTATION_ROOMS[roomId] = {
      roomId,
      appointmentId,
      doctorName: doc.name,
      patientName: newAppt.patientName,
      mode: newAppt.mode,
      status: 'ready',
      messages: [
        { id: 'm0', sender: 'system', text: 'Secure Teleconsultation Session initialized. Video, voice, and text streams are end-to-end encrypted.', time: 'System' },
        { id: 'm1', sender: 'doctor', text: `Hello ${newAppt.patientName}, I am ${doc.name}. I look forward to speaking with you at ${timeSlot}. Feel free to drop any questions here beforehand.`, time: 'System' }
      ],
      clinicalNotes: '',
      prescriptions: []
    };

    res.status(201).json({
      ok: true,
      message: 'Appointment booked successfully',
      appointment: newAppt,
      joinUrl: `/consultation?room=${roomId}`
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Failed to process appointment. Please try again.' });
  }
});

// Appointments: Get single
app.get('/api/appointments/:id', (req, res) => {
  const appt = APPOINTMENTS.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  res.json({ ok: true, appointment: appt });
});

// Appointments: Update (Reschedule, Cancel, Clinical Notes)
app.patch('/api/appointments/:id', (req, res) => {
  const appt = APPOINTMENTS.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  const { status, date, timeSlot, clinicianNotes } = req.body;
  if (status) appt.status = status;
  if (date) appt.date = date;
  if (timeSlot) appt.timeSlot = timeSlot;
  if (clinicianNotes !== undefined) appt.clinicianNotes = clinicianNotes;

  res.json({ ok: true, message: 'Appointment updated successfully', appointment: appt });
});

// Consultation Room: Get Details
app.get('/api/consultation/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = CONSULTATION_ROOMS[roomId];
  if (!room) {
    // If room is not found, check if it matches an appointment ID or create a sandbox session
    return res.status(404).json({ error: 'Consultation room not found or session has expired.' });
  }
  res.json({ ok: true, room });
});

// Consultation Room: Post in-session chat message
app.post('/api/consultation/:roomId/message', (req, res) => {
  const { roomId } = req.params;
  const { sender, text } = req.body;
  const room = CONSULTATION_ROOMS[roomId];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgObj = {
    id: 'm_' + Date.now(),
    sender: sender || 'patient',
    text: text.trim().slice(0, 1000),
    time: timeStr
  };

  room.messages.push(msgObj);
  res.status(201).json({ ok: true, message: msgObj });
});

// Consultation Room: Save Clinical Notes
app.post('/api/consultation/:roomId/notes', (req, res) => {
  const { roomId } = req.params;
  const { clinicalNotes, prescriptions } = req.body;
  const room = CONSULTATION_ROOMS[roomId];
  if (!room) return res.status(404).json({ error: 'Room not found' });

  if (clinicalNotes !== undefined) room.clinicalNotes = clinicalNotes;
  if (Array.isArray(prescriptions)) room.prescriptions = prescriptions;

  res.json({ ok: true, message: 'Clinical notes saved successfully', room });
});

// Contact Inquiries
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const inquiry = {
    id: `INQ-${Date.now().toString().slice(-6)}`,
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    subject: (subject || 'General Inquiry').trim(),
    message: message.trim(),
    submittedAt: new Date().toISOString()
  };

  CONTACT_MESSAGES.push(inquiry);
  res.status(201).json({
    ok: true,
    message: 'Thank you for contacting Manospring. Our care coordination team will respond within 24 hours.',
    referenceId: inquiry.id
  });
});

// DPDPA 2023 Data Privacy Requests
app.post('/api/privacy/request', (req, res) => {
  const { type, email, phone, fullName, details } = req.body;
  if (!type || (!email && !phone)) {
    return res.status(400).json({ error: 'Request type and contact information are required.' });
  }

  const ticket = {
    id: `DPDPA-${Date.now().toString().slice(-6)}`,
    type: type, // 'data_access', 'data_erasure', 'consent_withdrawal'
    fullName: (fullName || 'Valued User').trim(),
    email: (email || '').trim(),
    phone: (phone || '').trim(),
    details: (details || '').trim(),
    status: 'received',
    grievanceOfficer: 'dpo@manospring.com',
    receivedAt: new Date().toISOString()
  };

  PRIVACY_REQUESTS.push(ticket);
  res.status(201).json({
    ok: true,
    message: 'Your request under the Digital Personal Data Protection Act 2023 has been logged. Our Data Protection Officer will process it within 72 business hours.',
    ticketId: ticket.id
  });
});

// Authentication Simulation (Clinician & Patient)
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (role === 'clinician') {
    if (email === 'doctor@manospring.com' && (password === 'clinician2026' || password === 'demo123')) {
      return res.json({
        ok: true,
        user: {
          id: 'spec_1',
          name: 'Dr. Ananya Sharma',
          role: 'clinician',
          title: 'Consultant Psychiatrist',
          token: 'token_clinician_demo_78421'
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid clinician credentials. (Demo login: doctor@manospring.com / demo123)' });
    }
  }

  // Patient OTP / Quick Login
  if (!email && !req.body.phone) {
    return res.status(400).json({ error: 'Mobile number or email required.' });
  }

  return res.json({
    ok: true,
    user: {
      id: 'patient_' + Date.now().toString().slice(-6),
      name: req.body.name || 'Patient User',
      phone: req.body.phone || '+91 98765 43210',
      role: 'patient',
      token: 'token_patient_demo_' + Date.now()
    }
  });
});

// AI Mental Wellness Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const incoming = req.body?.messages;
    if (!Array.isArray(incoming) || incoming.length < 1 || incoming.length > 24) {
      return res.status(400).json({ error: 'Please send a valid conversation array.' });
    }

    const messages = incoming.map(m => {
      if (!m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string') {
        throw new Error('invalid');
      }
      const content = m.content.trim();
      if (!content || content.length > 1500) throw new Error('invalid');
      return { role: m.role, content };
    });

    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return res.status(400).json({ error: 'A user message is required.' });

    // Urgent Risk Interception
    if (urgentPattern.test(lastUser.content)) {
      return res.json({
        reply: urgentReply,
        urgent: true,
        suggestAppointment: false
      });
    }

    const userTurnCount = messages.filter(m => m.role === 'user').length;
    const wantsConsultation = /\b(book|appointment|psychiat|doctor|therapist|clinician|cost|fees|consult)\b/i.test(lastUser.content);
    const shouldSuggest = userTurnCount >= 8 || wantsConsultation;

    // Try Groq API if key is present
    if (GROQ_API_KEY) {
      try {
        const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 0.65,
            max_completion_tokens: 400,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ]
          }),
          signal: AbortSignal.timeout(18_000)
        });

        if (upstream.ok) {
          const payload = await upstream.json();
          const reply = payload?.choices?.[0]?.message?.content;
          if (typeof reply === 'string' && reply.trim()) {
            return res.json({
              reply: reply.trim().slice(0, 2800),
              urgent: false,
              suggestAppointment: shouldSuggest,
              source: 'groq'
            });
          }
        }
      } catch (upstreamErr) {
        // Network or timeout to upstream Groq; proceed to local compassionate mental wellness engine
        console.log('Groq upstream call paused or offline, falling back to local wellness engine:', upstreamErr.message);
      }
    }

    // Compassionate local fallback engine
    const fallbackReply = generateCompassionateFallback(lastUser.content, userTurnCount);
    return res.json({
      reply: fallbackReply,
      urgent: false,
      suggestAppointment: shouldSuggest,
      source: 'local_wellness_engine'
    });

  } catch (error) {
    if (error.message === 'invalid') {
      return res.status(400).json({ error: 'One of the messages was invalid or exceeded maximum character length.' });
    }
    return res.status(500).json({ error: 'Something went wrong while preparing a response. Please try again.' });
  }
});

// Global Fallback to index.html for SPA Navigation (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌿 Manospring Mental Healthcare Platform listening on http://localhost:${PORT}`);
});
