import React, { useState, useEffect } from 'react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Specialist, Appointment } from '../../types';
import { appointmentService } from '../../services/appointment.service';
import { formatCurrency } from '../../lib/utils';
import { specialistService } from '../../services/specialist.service';
import { useTranslation } from '../../app/i18n';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialist?: Specialist | null;
  specialists?: Specialist[];
  initialSpecialistId?: string;
  onBookingComplete?: (appt: Appointment) => void;
  onEnterRoom?: (roomId: string) => void;
}

interface FormErrors {
  specialist?: string;
  date?: string;
  timeSlot?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  consent?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  specialist,
  specialists: propSpecialists,
  initialSpecialistId,
  onBookingComplete,
  onEnterRoom
}) => {
  const [step, setStep] = useState(1);
  const [loadedSpecialists, setLoadedSpecialists] = useState<Specialist[]>(
    propSpecialists || (specialist ? [specialist] : [])
  );
  const [selectedSpecialistId, setSelectedSpecialistId] = useState('');
  const [mode, setMode] = useState<'Video' | 'Audio' | 'Chat'>('Video');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [ageGroup, setAgeGroup] = useState('25–34');
  const [reason, setReason] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (propSpecialists && propSpecialists.length > 0) {
      setLoadedSpecialists(propSpecialists);
    } else if (specialist) {
      setLoadedSpecialists([specialist]);
    } else {
      specialistService.getSpecialists()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setLoadedSpecialists(data);
          }
        })
        .catch(() => {});
    }
  }, [propSpecialists, specialist, isOpen]);

  const docList = loadedSpecialists.length > 0 ? loadedSpecialists : (specialist ? [specialist] : []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      setErrors({});
      setCreatedAppointment(null);
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      setDate(tomorrow);

      const targetId = specialist?.id || initialSpecialistId;
      const doc = docList.find(d => d.id === targetId) || docList[0];
      if (doc) {
        setSelectedSpecialistId(doc.id);
        setTimeSlot(doc.availableSlots?.[0] || '10:30 AM');
      }
    }
  }, [isOpen, specialist, initialSpecialistId, docList.length]);

  const activeDoc = docList.find(d => d.id === selectedSpecialistId) || docList[0];
  const fee = activeDoc
    ? (mode === 'Video' ? (activeDoc.fees?.video || activeDoc.fee || 1200) : mode === 'Audio' ? (activeDoc.fees?.audio || 1000) : (activeDoc.fees?.chat || 800))
    : 1000;

  // STEP 1 VALIDATION
  const validateStep1 = (): boolean => {
    const step1Errors: FormErrors = {};

    if (!selectedSpecialistId) {
      step1Errors.specialist = 'Please choose a specialist.';
    }

    if (!date) {
      step1Errors.date = 'Please choose an appointment date.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date + 'T00:00:00');
      if (isNaN(selectedDate.getTime()) || selectedDate < today) {
        step1Errors.date = 'Appointment date cannot be in the past.';
      }
    }

    if (!timeSlot) {
      step1Errors.timeSlot = 'Please select an available consultation slot.';
    }

    setErrors(prev => ({
      ...prev,
      specialist: step1Errors.specialist,
      date: step1Errors.date,
      timeSlot: step1Errors.timeSlot
    }));

    if (Object.keys(step1Errors).length > 0) {
      setError('Please resolve the highlighted errors in Step 1 before proceeding.');
      return false;
    }

    setError('');
    return true;
  };

  // STEP 2 VALIDATION
  const validateStep2 = (): boolean => {
    const step2Errors: FormErrors = {};

    const trimmedName = patientName.trim();
    if (!trimmedName) {
      step2Errors.patientName = 'Patient full name is required.';
    } else if (trimmedName.length < 2) {
      step2Errors.patientName = 'Name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      step2Errors.patientName = 'Name should only contain letters and standard characters.';
    }

    const trimmedPhone = patientPhone.trim();
    const cleanPhone = trimmedPhone.replace(/[\s()-]/g, '');
    if (!trimmedPhone) {
      step2Errors.patientPhone = 'Mobile number is required for booking confirmations.';
    } else if (!/^(\+?\d{1,4})?\d{8,14}$/.test(cleanPhone) || cleanPhone.replace(/\D/g, '').length < 8) {
      step2Errors.patientPhone = 'Please enter a valid mobile number (e.g. +91 98765 43210).';
    }

    const trimmedEmail = patientEmail.trim();
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        step2Errors.patientEmail = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    if (!consentGranted) {
      step2Errors.consent = 'Telemedicine informed consent (DPDPA 2023) is required to proceed.';
    }

    setErrors(prev => ({
      ...prev,
      patientName: step2Errors.patientName,
      patientPhone: step2Errors.patientPhone,
      patientEmail: step2Errors.patientEmail,
      consent: step2Errors.consent
    }));

    if (Object.keys(step2Errors).length > 0) {
      setError('Please complete all required fields and consent in Step 2.');
      return false;
    }

    setError('');
    return true;
  };

  // TAB CLICK NAVIGATION WITH VALIDATION GATE
  const handleTabClick = (targetStep: number) => {
    if (step === 4 || targetStep === step) return;

    if (targetStep < step) {
      setError('');
      setStep(targetStep);
      return;
    }

    if (targetStep === 2) {
      if (validateStep1()) {
        setError('');
        setStep(2);
      }
      return;
    }

    if (targetStep === 3) {
      if (!validateStep1()) {
        setStep(1);
        return;
      }
      if (!validateStep2()) {
        setStep(2);
        return;
      }
      setError('');
      setStep(3);
      return;
    }
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.createAppointment({
        specialistId: activeDoc.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim(),
        ageGroup,
        mode,
        date,
        timeSlot,
        reason: reason.trim(),
        consentGranted,
        paymentMethod
      });

      if (res.appointment) {
        setCreatedAppointment(res.appointment);
        if (onBookingComplete) {
          onBookingComplete(res.appointment);
        }
        setStep(4);
      }
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!createdAppointment) return;
    const content = `=====================================================
MANOSPRING HEALTHCARE — TELEMEDICINE BOOKING RECEIPT
Compliant with Telemedicine Practice Guidelines India 2020
=====================================================
Booking Reference: ${createdAppointment.id}
Date: ${new Date().toLocaleString('en-IN')}

PATIENT:
Name: ${createdAppointment.patientName}
Mobile: ${createdAppointment.patientPhone}
Email: ${createdAppointment.patientEmail || 'N/A'}

DOCTOR:
Clinician: ${createdAppointment.doctorName}
Title: ${createdAppointment.doctorTitle}
Mode: ${createdAppointment.mode} Teleconsultation
Scheduled Date & Time: ${createdAppointment.date} at ${createdAppointment.timeSlot}
Room ID: ${createdAppointment.roomId}

PAYMENT:
Status: Paid & Confirmed
Amount: INR ₹${createdAppointment.fee}
Payment Method: ${createdAppointment.paymentMethod}
Transaction ID: ${createdAppointment.paymentId}

Link to Room: ${window.location.origin}?room=${createdAppointment.roomId}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manospring-Receipt-${createdAppointment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 1, label: t('booking.step1', 'Specialist & Format'), short: 'Slot' },
    { id: 2, label: t('booking.step3', 'Patient Details'), short: 'Patient' },
    { id: 3, label: t('booking.step4', 'Payment'), short: 'Payment' },
    { id: 4, label: 'Confirmation', short: 'Done' }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('booking.title', 'Schedule a Consultation')} maxWidth="md">
      <div className="space-y-4 text-slate-800 dark:text-slate-100">
        {/* Interactive Tabs Header */}
        <div className="border-b border-sage-200 dark:border-slate-800 pb-2.5">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {tabs.map(tab => {
              const isCurrent = step === tab.id;
              const isCompleted = step > tab.id;
              const isClickable = step !== 4 && (tab.id <= step || (tab.id === 2 && step === 1) || (tab.id === 3 && step <= 2));

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  disabled={!isClickable && tab.id !== 4}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-50 dark:bg-teal-950/80 border border-brand-300 dark:border-teal-700 text-brand-900 dark:text-teal-200 shadow-xs font-bold'
                      : isCompleted
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50'
                      : isClickable
                      ? 'bg-paper-cream dark:bg-slate-800 border border-sage-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sage-100/70 dark:hover:bg-slate-700'
                      : 'bg-paper dark:bg-slate-850 border border-sage-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                  title={
                    isCompleted
                      ? `Go back to ${tab.label}`
                      : isCurrent
                      ? `Current tab: ${tab.label}`
                      : `Validate current step to enter ${tab.label}`
                  }
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-brand-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : tab.id}
                  </span>
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                  <span className="inline sm:hidden">{tab.short}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Bar Indicator */}
          <div className="flex gap-1 mt-2.5">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-brand-600' : 'bg-sage-100 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-700 dark:hover:text-red-200 ml-2 font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* STEP 1: Doctor, Mode, Date, Slot */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Select Specialist & Slot</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pick a registered clinician, consultation format, and preferred appointment time.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Specialist *</label>
              <select
                value={selectedSpecialistId}
                onChange={(e) => {
                  setSelectedSpecialistId(e.target.value);
                  if (errors.specialist) setErrors(prev => ({ ...prev, specialist: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 bg-paper-cream dark:bg-slate-800/90 border rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-brand-600 dark:focus:border-teal-500 ${
                  errors.specialist ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20' : 'border-sage-200 dark:border-slate-700'
                }`}
              >
                <option value="">-- Choose a registered specialist --</option>
                {(docList || []).map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.title || d.role} ({formatCurrency(d.fees?.video || d.fee || 1200)})
                  </option>
                ))}
              </select>
              {errors.specialist && <p className="text-xs text-red-600 dark:text-red-400">{errors.specialist}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Consultation Mode *</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-paper-cream dark:bg-slate-800/90 border border-sage-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-brand-600 dark:focus:border-teal-500"
                >
                  <option value="Video">Video Call</option>
                  <option value="Audio">Voice Call</option>
                  <option value="Chat">Secure Chat</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Appointment Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-paper-cream dark:bg-slate-800/90 border rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-brand-600 dark:focus:border-teal-500 ${
                    errors.date ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20' : 'border-sage-200 dark:border-slate-700'
                  }`}
                />
                {errors.date && <p className="text-xs text-red-600 dark:text-red-400">{errors.date}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Available Slots *</label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Selected: {timeSlot || 'None'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(activeDoc?.availableSlots || ['10:30 AM', '11:15 AM', '2:00 PM', '4:30 PM']).map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setTimeSlot(slot);
                      if (errors.timeSlot) setErrors(prev => ({ ...prev, timeSlot: undefined }));
                    }}
                    className={`py-2 px-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                      timeSlot === slot
                        ? 'bg-brand-600 text-white font-bold border-brand-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-teal-950/50 border-sage-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.timeSlot && <p className="text-xs text-red-600 dark:text-red-400">{errors.timeSlot}</p>}
            </div>

            <div className="bg-paper dark:bg-slate-800/60 p-3.5 rounded-xl border border-sage-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Session Fee:</span>
                <strong className="text-base text-brand-900 dark:text-teal-300">{formatCurrency(fee)}</strong>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Includes 45-min consultation & follow-up care plan</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleStep1Next}>
                Patient Details →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Patient Info & DPDPA Telemedicine Consent */}
        {step === 2 && (
          <form onSubmit={handleStep2Next} className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Patient Details & Telemedicine Consent</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Informed consent in compliance with the Telemedicine Guidelines 2020 & DPDPA 2023.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name *"
                required
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  if (errors.patientName) setErrors(prev => ({ ...prev, patientName: undefined }));
                }}
                placeholder="Patient full name"
                error={errors.patientName}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Age Bracket *</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-paper-cream dark:bg-slate-800/90 border border-sage-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-brand-600 dark:focus:border-teal-500"
                >
                  <option value="18–24">18–24 years</option>
                  <option value="25–34">25–34 years</option>
                  <option value="35–44">35–44 years</option>
                  <option value="45–59">45–59 years</option>
                  <option value="60+">60+ years</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="WhatsApp / Mobile *"
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => {
                  setPatientPhone(e.target.value);
                  if (errors.patientPhone) setErrors(prev => ({ ...prev, patientPhone: undefined }));
                }}
                placeholder="+91 98765 43210"
                error={errors.patientPhone}
              />
              <Input
                label="Email Address (Optional)"
                type="email"
                value={patientEmail}
                onChange={(e) => {
                  setPatientEmail(e.target.value);
                  if (errors.patientEmail) setErrors(prev => ({ ...prev, patientEmail: undefined }));
                }}
                placeholder="you@example.com"
                error={errors.patientEmail}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Concern (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Briefly describe what you'd like to discuss (e.g. anxiety, sleep, burnout)..."
                className="w-full px-3.5 py-2 bg-paper-cream dark:bg-slate-800/90 border border-sage-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-brand-600 dark:focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  errors.consent
                    ? 'bg-red-50/80 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                    : 'bg-warm-50/70 dark:bg-slate-800/60 border-warm-100 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => {
                    setConsentGranted(e.target.checked);
                    if (errors.consent) setErrors(prev => ({ ...prev, consent: undefined }));
                  }}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="leading-snug">
                  <strong>Informed Consent (DPDPA 2023 & NMC Guidelines):</strong> I consent to an online clinical consultation with a registered specialist. I understand telemedicine has clinical boundaries and is not for emergency crises.
                </span>
              </label>
              {errors.consent && <p className="text-xs text-red-600 dark:text-red-400 pl-1">{errors.consent}</p>}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" type="button" size="sm" onClick={() => handleTabClick(1)}>
                ← Back to Specialist
              </Button>
              <Button variant="primary" type="submit" size="sm">
                Proceed to Payment →
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Payment Simulation Checkout */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Review & Payment</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">256-bit SSL encrypted payment simulation in Indian Rupees (INR).</p>
            </div>

            <div className="p-4 bg-paper dark:bg-slate-800/60 rounded-2xl border border-sage-100 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Specialist:</span>
                <strong className="text-slate-900 dark:text-white">{activeDoc.name} ({activeDoc.title || activeDoc.role})</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Date & Time:</span>
                <strong className="text-slate-900 dark:text-white">{date} · {timeSlot}</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Mode:</span>
                <strong className="text-slate-900 dark:text-white">{mode} Teleconsultation</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Patient:</span>
                <strong className="text-slate-900 dark:text-white">{patientName} ({patientPhone})</strong>
              </div>
              <div className="pt-2 border-t border-sage-200 dark:border-slate-700 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Total Amount:</span>
                <strong className="text-lg text-brand-800 dark:text-teal-300 font-extrabold">{formatCurrency(fee)}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Option</label>
              <div className="space-y-2">
                {[
                  'UPI (Google Pay / PhonePe / Paytm / BHIM)',
                  'Credit / Debit Card (Visa, Mastercard, RuPay)',
                  'Net Banking (All Indian Banks)'
                ].map(opt => (
                  <label
                    key={opt}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      paymentMethod === opt
                        ? 'border-brand-600 dark:border-teal-500 bg-brand-50/50 dark:bg-teal-950/60 font-bold text-brand-900 dark:text-teal-200'
                        : 'border-sage-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === opt}
                      onChange={() => setPaymentMethod(opt)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => handleTabClick(2)}>
                ← Edit Patient Details
              </Button>
              <Button variant="primary" size="sm" disabled={loading} onClick={handleConfirmPayment}>
                {loading ? 'Processing...' : `Pay ${formatCurrency(fee)} & Confirm 🔒`}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmed & Receipt */}
        {step === 4 && createdAppointment && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-2xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              ✓
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Appointment Confirmed!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your teleconsultation session has been securely booked.</p>
              <span className="inline-block mt-2 px-3 py-1 bg-brand-50 dark:bg-teal-950/80 text-brand-800 dark:text-teal-200 text-xs font-bold rounded-full border border-brand-200 dark:border-teal-800">
                Reference ID: {createdAppointment.id}
              </span>
            </div>

            <div className="p-4 bg-paper dark:bg-slate-800/60 rounded-2xl border border-sage-100 dark:border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Doctor:</span>
                <strong className="text-slate-900 dark:text-white">{createdAppointment.doctorName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Date & Slot:</span>
                <strong className="text-slate-900 dark:text-white">{createdAppointment.date} at {createdAppointment.timeSlot}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Consultation Format:</span>
                <strong className="text-slate-900 dark:text-white">{createdAppointment.mode} Session</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <strong className="text-emerald-700 dark:text-emerald-400">Paid & Confirmed</strong>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => {
                  onClose();
                  if (onEnterRoom) {
                    onEnterRoom(createdAppointment.roomId);
                  }
                }}
              >
                🎥 Enter Telehealth Room Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleDownloadReceipt}
              >
                📥 Download Booking Receipt
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
