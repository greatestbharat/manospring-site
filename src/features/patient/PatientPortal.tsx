import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Video, User, FileText, CheckCircle2, 
  XCircle, Download, ShieldCheck, Stethoscope, Sparkles, 
  LogIn, LogOut, ArrowRight, Phone, Mail, Lock, AlertCircle,
  Eye, Check, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Appointment, UserSession } from '../../types';
import { appointmentService } from '../../services/appointment.service';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../services/api';
import { currentAppPath, replaceApp } from '../../lib/routing';

interface PatientPortalProps {
  onJoinRoom: (roomId: string) => void;
  onStartBooking?: () => void;
}

interface PatientQueueItem {
  id: string;
  name: string;
  age: number;
  timeSlot: string;
  mode: 'Video' | 'Audio';
  status: 'In Waiting Room' | 'Confirmed' | 'Completed';
  chiefConcern: string;
  preliminaryIntake: string;
  clinicalNotes: string;
  roomId: string;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ 
  onJoinRoom,
  onStartBooking 
}) => {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'patient' | 'clinician'>('patient');
  
  // Auth Form State
  const [authRole, setAuthRole] = useState<'patient' | 'clinician'>('patient');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Patient Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelStatus, setCancelStatus] = useState<string | null>(null);

  // Clinician workspace queue state
  const [clinicianQueue, setClinicianQueue] = useState<PatientQueueItem[]>([
    {
      id: 'KM-842',
      name: 'Kavita Menon',
      age: 29,
      timeSlot: '11:00 AM (In 15 mins)',
      mode: 'Video',
      status: 'In Waiting Room',
      chiefConcern: 'Workplace performance anxiety, sleep latency & restlessness',
      preliminaryIntake: 'Patient conversed with the Personal Wellness Guide prior to booking. Primary themes: anticipatory anxiety surrounding upcoming appraisal, bedtime rumination, and somatic muscle tension.',
      clinicalNotes: 'Patient presented with anticipatory anxiety regarding upcoming performance review. Practiced 4-7-8 diaphragmatic breathing; advised sleep hygiene consistency and cognitive reframing journal.',
      roomId: 'mano-sess-sample'
    },
    {
      id: 'RM-109',
      name: 'Rohan Mehta',
      age: 34,
      timeSlot: '03:30 PM Today',
      mode: 'Audio',
      status: 'Confirmed',
      chiefConcern: 'Follow-up on insomnia protocol & workplace boundary setting',
      preliminaryIntake: 'Patient noted improved sleep onset after discontinuing late-night laptop use. Reports continuing mid-afternoon fatigue.',
      clinicalNotes: 'Reviewed sleep diary. Patient averaging 6.5 hours compared to 4.5 hours last month. Re-emphasized scheduled wind-down period.',
      roomId: 'mano-sess-room-109'
    },
    {
      id: 'PI-549',
      name: 'Pooja Iyer',
      age: 23,
      timeSlot: '05:00 PM Today',
      mode: 'Video',
      status: 'Confirmed',
      chiefConcern: 'Repetitive checking worries, study stress, post-graduate entrance exams',
      preliminaryIntake: 'First-time consultation. Patient reported feeling overwhelmed by syllabus volume and difficulty relaxing after study sessions.',
      clinicalNotes: 'Initial intake scheduled. Prepare psychoeducation handout on test anxiety management and somatic grounding.',
      roomId: 'mano-sess-room-549'
    }
  ]);

  const [selectedQueuePatientId, setSelectedQueuePatientId] = useState<string>('KM-842');
  const [doctorNotesInput, setDoctorNotesInput] = useState<string>('');
  const [notesSavedNotice, setNotesSavedNotice] = useState<boolean>(false);

  // Current selected patient in clinician view
  const currentSelectedPatient = clinicianQueue.find(p => p.id === selectedQueuePatientId) || clinicianQueue[0];

  // Keep notes input updated when selected patient changes
  useEffect(() => {
    if (currentSelectedPatient) {
      setDoctorNotesInput(currentSelectedPatient.clinicalNotes);
      setNotesSavedNotice(false);
    }
  }, [selectedQueuePatientId]);

  // Synchronize with URL query / hash on mount & hashchange
  useEffect(() => {
    // 1. Check saved session in localStorage
    const saved = localStorage.getItem('manospring_user');
    let loadedUser: UserSession | null = null;
    if (saved) {
      try {
        loadedUser = JSON.parse(saved);
        setCurrentUser(loadedUser);
      } catch {
        localStorage.removeItem('manospring_user');
      }
    }

    const parseUrl = () => {
      // Migrate legacy hash if any (e.g. /#sessions -> /sessions)
      if (window.location.hash.startsWith('#sessions')) {
        const query = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
        const clean = '/sessions' + (query ? '?' + query : '');
        replaceApp(clean);
      }

      const pathname = currentAppPath();
      const search = window.location.search;

      if (search.includes('view=clinician') || search.includes('view=admin')) {
        setActiveTab('clinician');
        setAuthRole('clinician');
      } else if (search.includes('view=patient')) {
        setActiveTab('patient');
        setAuthRole('patient');
      } else if (pathname.startsWith('/sessions')) {
        if (loadedUser) {
          const roleView = loadedUser.role === 'clinician' ? 'clinician' : 'patient';
          setActiveTab(roleView);
          updateUrlPath(roleView);
        } else {
          setActiveTab('patient');
        }
      }
    };

    parseUrl();

    // Listen for storage changes from other components (e.g. ClinicianLoginModal)
    const handleStorageChange = () => {
      const updated = localStorage.getItem('manospring_user');
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setCurrentUser(parsed);
          const roleView = parsed.role === 'clinician' ? 'clinician' : 'patient';
          setActiveTab(roleView);
          updateUrlPath(roleView);
        } catch {}
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('popstate', parseUrl);
    window.addEventListener('hashchange', parseUrl);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('popstate', parseUrl);
      window.removeEventListener('hashchange', parseUrl);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [currentUser]);

  const updateUrlPath = (view: 'patient' | 'clinician') => {
    const targetUrl = `/sessions?view=${view}`;
    const current = `${currentAppPath()}${window.location.search}`;
    if (current !== targetUrl) {
      replaceApp(targetUrl);
    }
  };

  const handleTabChange = (view: 'patient' | 'clinician') => {
    setActiveTab(view);
    setAuthRole(view);
    updateUrlPath(view);
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAppointments();
      if (Array.isArray(data) && data.length > 0) {
        setAppointments(data);
      } else {
        setAppointments(getDefaultMockAppointments());
      }
    } catch {
      setAppointments(getDefaultMockAppointments());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMockAppointments = (): Appointment[] => [
    {
      id: 'apt-78421',
      specialistId: 'spec_1',
      specialistName: 'Dr. Ananya Sharma',
      doctorName: 'Dr. Ananya Sharma',
      specialistRole: 'Consultant Psychiatrist',
      doctorTitle: 'Consultant Psychiatrist (MD NIMHANS)',
      patientName: currentUser?.name || 'Kavita Menon',
      patientEmail: currentUser?.email || 'kavita.m@example.com',
      patientPhone: currentUser?.phone || '+91 98765 43210',
      mode: 'Video',
      date: 'Tomorrow',
      timeSlot: '11:00 AM',
      fee: 1200,
      status: 'confirmed',
      roomId: 'mano-sess-sample',
      paymentStatus: 'paid',
      notes: 'Experiencing sleep disruption and anxiety regarding work responsibilities.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-54911',
      specialistId: 'spec_2',
      specialistName: 'Dr. Nikhil Rao',
      doctorName: 'Dr. Nikhil Rao',
      specialistRole: 'Licensed Clinical Psychologist',
      doctorTitle: 'Licensed Clinical Psychologist (M.Phil NIMHANS)',
      patientName: currentUser?.name || 'Kavita Menon',
      patientEmail: currentUser?.email || 'kavita.m@example.com',
      patientPhone: currentUser?.phone || '+91 98765 43210',
      mode: 'Audio',
      date: '14 Oct 2026',
      timeSlot: '04:30 PM',
      fee: 900,
      status: 'completed',
      roomId: 'mano-sess-past-1',
      paymentStatus: 'paid',
      notes: 'CBT session for workplace stress reduction. Practiced cognitive reframing.',
      clinicianNotes: 'Patient showed good adaptation to sleep scheduling. Advised continuation of daily journal.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];

  // Login handler
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const payload = authRole === 'clinician'
        ? { email: loginEmail || 'doctor@manospring.com', password: loginPassword || 'demo123', role: 'clinician' }
        : { email: loginEmail || 'kavita.m@example.com', phone: loginPhone || '+91 98765 43210', role: 'patient' };

      const res = await api.post<{ ok: boolean; user: UserSession; token?: string }>('/auth/login', payload);

      if (res.ok && res.user) {
        const session: UserSession = {
          ...res.user,
          role: authRole,
          email: payload.email,
          phone: payload.phone
        };
        setCurrentUser(session);
        localStorage.setItem('manospring_user', JSON.stringify(session));
        setActiveTab(authRole);
        updateUrlPath(authRole);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 1-Click Fast Verification Logins
  const handleDemoLogin = (role: 'patient' | 'clinician') => {
    setAuthRole(role);
    if (role === 'patient') {
      const demoPatient: UserSession = {
        id: 'pt-101',
        name: 'Kavita Menon',
        role: 'patient',
        email: 'kavita.m@example.com',
        phone: '+91 98765 43210'
      };
      setCurrentUser(demoPatient);
      localStorage.setItem('manospring_user', JSON.stringify(demoPatient));
      setActiveTab('patient');
      updateUrlPath('patient');
    } else {
      const demoDoctor: UserSession = {
        id: 'spec_1',
        name: 'Dr. Ananya Sharma',
        role: 'clinician',
        title: 'Consultant Psychiatrist (MD NIMHANS, KMC-78421)',
        email: 'doctor@manospring.com'
      };
      setCurrentUser(demoDoctor);
      localStorage.setItem('manospring_user', JSON.stringify(demoDoctor));
      setActiveTab('clinician');
      updateUrlPath('clinician');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('manospring_user');
    window.history.replaceState(null, '', '/sessions');
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment? Full refunds apply for cancellations made >4 hours in advance.')) {
      return;
    }
    try {
      await appointmentService.cancelAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      setCancelStatus('Appointment cancelled successfully. Refund initiated to original payment method.');
      setTimeout(() => setCancelStatus(null), 5000);
    } catch {
      // Fallback update locally for seamless demo
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      setCancelStatus('Appointment cancelled. Refund initiated to original payment method.');
      setTimeout(() => setCancelStatus(null), 5000);
    }
  };

  const handleDownloadReceipt = (apt: Appointment) => {
    const text = `MANOSPRING TELEHEALTH RECEIPT
--------------------------------------
Appointment ID: ${apt.id}
Date & Time: ${apt.date} at ${apt.timeSlot}
Doctor: ${apt.doctorName || apt.specialistName} (${apt.doctorTitle || apt.specialistRole})
Patient Name: ${apt.patientName}
Consultation Mode: ${String(apt.mode).toUpperCase()}
Amount Paid: INR ₹${apt.fee}
Payment Status: ${(apt.paymentStatus || 'PAID').toUpperCase()}
Encrypted Room Code: ${apt.roomId}
--------------------------------------
Telemedicine Practice Guidelines (NMC India) Compliant
Thank you for prioritizing your mental health with Manospring.`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Manospring_Receipt_${apt.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveClinicianNotes = () => {
    setClinicianQueue(prev => prev.map(p => 
      p.id === selectedQueuePatientId ? { ...p, clinicalNotes: doctorNotesInput } : p
    ));
    setNotesSavedNotice(true);
    setTimeout(() => setNotesSavedNotice(false), 3000);
  };

  // Filtered appointments for patient
  const filteredAppointments = appointments.filter(apt => {
    if (appointmentFilter === 'upcoming') return apt.status === 'confirmed';
    if (appointmentFilter === 'completed') return apt.status === 'completed';
    if (appointmentFilter === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  return (
    <section id="sessions" className="py-16 sm:py-20 bg-white dark:bg-[#0a120f] border-t border-slate-200/80 dark:border-slate-800 scroll-mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Role Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="teal">
                Patient &amp; Clinical Management
              </Badge>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                URL: /sessions?view={activeTab}
              </span>
            </div>
            <h2 className="text-3xl font-serif font-medium text-slate-900 dark:text-white tracking-tight">
              My Appointments &amp; Workspace
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
              Review your scheduled consultations, encrypted room access, and clinical care records.
            </p>
          </div>

          {/* User Session Bar or Role Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2.5 pl-2">
                  <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {currentUser.role === 'clinician' ? '👨🏽‍⚕️' : '👩🏽'}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-teal-800 dark:text-teal-300 font-medium capitalize">
                      {currentUser.role === 'clinician' ? 'Verified Clinician' : 'Patient Account'}
                    </span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleTabChange('patient')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    activeTab === 'patient'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Patient Portal
                </button>
                <button
                  onClick={() => handleTabChange('clinician')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'clinician'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <span>Clinician / Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {cancelStatus && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{cancelStatus}</span>
          </div>
        )}

        {/* 1. NOT LOGGED IN: Beautiful Healthcare Authentication Card with 1-Click Demo */}
        {!currentUser && (
          <div className="max-w-xl mx-auto py-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#13221d] overflow-hidden">
              <CardHeader className="bg-slate-50/70 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 pb-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center mx-auto mb-2 border border-teal-100 dark:border-teal-800">
                  <LogIn className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-serif text-slate-900 dark:text-white">
                  {authRole === 'patient' ? 'Patient Portal Sign In' : 'Clinician & Admin Workspace'}
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {authRole === 'patient' 
                    ? 'Access your confirmed consultations, encrypted room codes, and receipts.' 
                    : 'Access clinical consultations, patient queues, and electronic medical records.'}
                </p>

                {/* Sub-tab switcher */}
                <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl max-w-xs mx-auto mt-4">
                  <button
                    type="button"
                    onClick={() => handleTabChange('patient')}
                    className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      authRole === 'patient' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('clinician')}
                    className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      authRole === 'clinician' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Doctor / Clinician
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* 1-Click Fast Verification Buttons */}
                <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900/60 space-y-2.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-teal-900 dark:text-teal-300 block">
                    Quick Verification (1-Click)
                  </span>
                  {authRole === 'patient' ? (
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('patient')}
                      className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-semibold rounded-xl text-xs flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>👩🏽</span>
                        <span>Sign In as <strong>Kavita Menon</strong> (Patient)</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('clinician')}
                      className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-semibold rounded-xl text-xs flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span>👨🏽‍⚕️</span>
                        <span>Sign In as <strong>Dr. Ananya Sharma</strong> (Clinician)</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    </button>
                  )}
                </div>

                <div className="relative my-2 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                  <span className="relative bg-white dark:bg-[#13221d] px-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Or with credentials</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                  {authRole === 'patient' ? (
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number or Email</label>
                      <input
                        type="text"
                        value={loginPhone || loginEmail}
                        onChange={(e) => {
                          setLoginPhone(e.target.value);
                          setLoginEmail(e.target.value);
                        }}
                        placeholder="+91 98765 43210 or name@example.com"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Clinician Registered Email</label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="doctor@manospring.com"
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center py-2.5 text-xs cursor-pointer"
                    disabled={authLoading}
                  >
                    {authLoading ? 'Verifying...' : `Access ${authRole === 'patient' ? 'Patient Portal' : 'Clinician Workspace'}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. LOGGED IN AS PATIENT: Dynamic Patient Appointment Dashboard */}
        {currentUser && currentUser.role === 'patient' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Welcome & Contact Summary Banner */}
            <div className="bg-slate-50 dark:bg-[#13221d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-200/50 dark:border-teal-800/60">
                    Patient Profile #PT-842
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Karnataka, India</span>
                </div>
                <h3 className="text-2xl font-serif font-medium text-slate-900 dark:text-white">
                  Welcome back, {currentUser.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-4 flex-wrap pt-0.5">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {currentUser.phone || '+91 98765 43210'}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {currentUser.email || 'kavita.m@example.com'}</span>
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium"><ShieldCheck className="w-3.5 h-3.5" /> DPDPA Encrypted</span>
                </p>
              </div>

              {onStartBooking && (
                <Button variant="primary" size="sm" onClick={onStartBooking} className="shrink-0 text-xs font-semibold px-4 py-2.5 cursor-pointer">
                  + Book a New Consultation
                </Button>
              )}
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-[#13221d] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Upcoming Consultations</span>
                <strong className="text-xl font-bold text-teal-800 dark:text-teal-300">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </strong>
              </div>
              <div className="p-4 bg-white dark:bg-[#13221d] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Completed Sessions</span>
                <strong className="text-xl font-bold text-slate-700 dark:text-slate-200">
                  {appointments.filter(a => a.status === 'completed').length}
                </strong>
              </div>
              <div className="p-4 bg-white dark:bg-[#13221d] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Care Provider</span>
                <strong className="text-xs font-semibold text-slate-800 dark:text-white block truncate mt-1">
                  Dr. Ananya Sharma
                </strong>
              </div>
              <div className="p-4 bg-white dark:bg-[#13221d] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-500 block">Telemedicine Status</span>
                <strong className="text-xs font-semibold text-emerald-700 block truncate mt-1">
                  Verified &amp; Active
                </strong>
              </div>
            </div>

            {/* Appointments Section with Filter Tabs */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-semibold text-slate-800">Your Consultations Record</h4>
                  <span className="text-xs text-slate-400 font-mono">({filteredAppointments.length})</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setAppointmentFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      appointmentFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All ({appointments.length})
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('upcoming')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      appointmentFilter === 'upcoming' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Upcoming ({appointments.filter(a => a.status === 'confirmed').length})
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('completed')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      appointmentFilter === 'completed' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Completed ({appointments.filter(a => a.status === 'completed').length})
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('cancelled')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      appointmentFilter === 'cancelled' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Loading encrypted appointment records...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <Card className="text-center p-8 bg-slate-50 dark:bg-[#13221d] border-slate-200 dark:border-slate-800">
                  <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-slate-800 dark:text-white">No {appointmentFilter !== 'all' ? appointmentFilter : ''} appointments found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Ready to take the next step? Explore our verified clinicians and schedule a private 1-on-1 session.
                  </p>
                  {onStartBooking && (
                    <div className="mt-4">
                      <Button variant="primary" size="sm" onClick={onStartBooking} className="cursor-pointer">
                        Browse Specialists
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAppointments.map((apt) => {
                    const isConfirmed = apt.status === 'confirmed';
                    const isCompleted = apt.status === 'completed';
                    const isCancelled = apt.status === 'cancelled';

                    return (
                      <Card key={apt.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#13221d] hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={isConfirmed ? 'teal' : isCompleted ? 'slate' : 'slate'} 
                                className={`text-[10px] ${isCancelled ? 'text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60' : ''}`}
                              >
                                {apt.status.toUpperCase()}
                              </Badge>
                              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{apt.id}</span>
                            </div>
                            <CardTitle className="text-base mt-2 font-serif text-slate-900 dark:text-white">
                              {apt.doctorName || apt.specialistName}
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{apt.doctorTitle || apt.specialistRole}</p>
                          </CardHeader>

                          <CardContent className="pt-4 space-y-2.5 text-xs">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                              <span>Date: <strong>{apt.date}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                              <span>Time: <strong>{apt.timeSlot}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Video className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                              <span>Format: <strong className="capitalize">{apt.mode} Consultation</strong></span>
                            </div>

                            {apt.clinicianNotes && (
                              <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                                <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Clinical Summary Note:</strong>
                                <span>{apt.clinicianNotes}</span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span>Fee Paid: <strong className="text-slate-900 dark:text-white">{formatCurrency(apt.fee)}</strong></span>
                              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                                Room: {apt.roomId}
                              </span>
                            </div>
                          </CardContent>
                        </div>

                        {/* Card Actions */}
                        <div className="p-4 pt-0 space-y-2">
                          {isConfirmed && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full justify-center text-xs cursor-pointer"
                              onClick={() => onJoinRoom(apt.roomId)}
                            >
                              <Video className="w-3.5 h-3.5 mr-1.5" />
                              Join Consultation Room
                            </Button>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 justify-center text-[11px] cursor-pointer"
                              onClick={() => handleDownloadReceipt(apt)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Receipt
                            </Button>
                            {isConfirmed && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] cursor-pointer"
                                onClick={() => handleCancelAppointment(apt.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. LOGGED IN AS CLINICIAN / ADMIN: Dedicated Clinician Workspace */}
        {currentUser && currentUser.role === 'clinician' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Clinician Profile Banner */}
            <div className="bg-teal-900 dark:bg-[#071913] text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-teal-800 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-800 dark:bg-teal-950 border-2 border-teal-700 dark:border-teal-800 flex items-center justify-center text-3xl shadow-inner">
                  👨🏽‍⚕️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-serif font-medium text-white">{currentUser.name}</h3>
                    <Badge variant="teal" className="bg-teal-800 dark:bg-teal-900 text-teal-200 border-teal-700 text-[10px]">
                      Doctor Active &amp; Supervisor
                    </Badge>
                  </div>
                  <p className="text-xs text-teal-200 mt-0.5">
                    Consultant Psychiatrist · MBBS, MD (Psychiatry) NIMHANS · KMC-78421
                  </p>
                  <p className="text-[11px] text-teal-300/80 mt-1">
                    Telemedicine Practice Guidelines Verified · Karnataka Medical Council
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-teal-800/80 dark:bg-teal-950/70 px-4 py-3 rounded-2xl border border-teal-700 dark:border-teal-800 text-xs">
                <div>
                  <span className="text-[10px] text-teal-300 block">Today's Schedule</span>
                  <strong className="text-sm text-white">{clinicianQueue.length} Patients</strong>
                </div>
                <div className="h-6 w-px bg-teal-700 dark:bg-teal-800" />
                <div>
                  <span className="text-[10px] text-teal-300 block">Next Patient</span>
                  <strong className="text-sm text-emerald-300">11:00 AM (Next)</strong>
                </div>
              </div>
            </div>

            {/* Clinician Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Today's Queue (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Today's Consultation Schedule</h4>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Click patient to inspect records</span>
                </div>

                <div className="space-y-3">
                  {clinicianQueue.map((patient) => {
                    const isSelected = patient.id === selectedQueuePatientId;
                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedQueuePatientId(patient.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50/70 dark:bg-teal-950/50 border-teal-300 dark:border-teal-600 shadow-xs'
                            : 'bg-white dark:bg-[#13221d] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white text-sm">{patient.name}</span>
                              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">#{patient.id}</span>
                              <Badge 
                                variant={patient.status === 'In Waiting Room' ? 'teal' : 'slate'} 
                                className="text-[10px]"
                              >
                                {patient.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {patient.timeSlot} · {patient.mode} Consultation · Age {patient.age}
                            </p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
                              Chief Concern: <span className="text-slate-600 dark:text-slate-400 font-normal">{patient.chiefConcern}</span>
                            </p>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            className="shrink-0 text-xs cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJoinRoom(patient.roomId);
                            }}
                          >
                            <Video className="w-3.5 h-3.5 mr-1" />
                            Start Call
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Care Notes & Intake Summary (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    EHR Care Notes — {currentSelectedPatient.name} (#{currentSelectedPatient.id})
                  </h4>
                  {notesSavedNotice ? (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Notes Saved
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Electronic Health Record</span>
                  )}
                </div>

                <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-[#13221d]">
                  <CardContent className="p-4 space-y-3.5">
                    
                    {/* Preliminary Intake Summary */}
                    <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 rounded-xl border border-teal-100 dark:border-teal-900 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
                        Preliminary Intake Highlights (Personal Wellness Guide)
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {currentSelectedPatient.preliminaryIntake}
                      </p>
                    </div>

                    {/* Doctor Care Notes Editor */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Physician Observation &amp; Care Plan
                      </label>
                      <textarea
                        rows={7}
                        value={doctorNotesInput}
                        onChange={(e) => setDoctorNotesInput(e.target.value)}
                        className="w-full text-xs font-mono p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 dark:text-slate-100 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Room: <code>{currentSelectedPatient.roomId}</code>
                      </span>
                      <Button variant="primary" size="sm" onClick={handleSaveClinicianNotes} className="text-xs cursor-pointer">
                        Save Clinical Notes
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
