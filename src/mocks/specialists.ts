import { Specialist } from '../types';

export const MOCK_SPECIALISTS: Specialist[] = [
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

function enrich(s: Specialist): Specialist {
  return {
    ...s,
    role: s.role || s.title,
    registrationNumber: s.registrationNumber || s.regNumber,
    specialty: s.specialty || s.title,
    qualifications: s.qualifications || s.degrees,
    fee: s.fee || s.fees.video
  };
}

export function filterSpecialists(filters?: {
  specialty?: string | null;
  mode?: string | null;
  language?: string | null;
  search?: string | null;
}): Specialist[] {
  let result = MOCK_SPECIALISTS.map(enrich);

  if (filters?.specialty && filters.specialty !== 'all') {
    const s = filters.specialty.toLowerCase();
    result = result.filter(
      (doc) =>
        doc.title.toLowerCase().includes(s) ||
        doc.specialties.some((sp) => sp.toLowerCase().includes(s))
    );
  }

  if (filters?.mode && filters.mode !== 'all') {
    const m = filters.mode.toLowerCase();
    result = result.filter((doc) => doc.modes.some((mod) => mod.toLowerCase().includes(m)));
  }

  if (filters?.language && filters.language !== 'all') {
    const l = filters.language.toLowerCase();
    result = result.filter((doc) => doc.languages.some((lang) => lang.toLowerCase().includes(l)));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.title.toLowerCase().includes(q) ||
        doc.specialties.some((sp) => sp.toLowerCase().includes(q))
    );
  }

  return result;
}

export function getSpecialistById(id: string): Specialist | undefined {
  const found = MOCK_SPECIALISTS.find((s) => s.id === id);
  return found ? enrich(found) : undefined;
}
