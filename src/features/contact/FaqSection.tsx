import React, { useState } from 'react';
import { 
  ChevronDown, HelpCircle, Send, CheckCircle2, AlertCircle, 
  Mail, Phone, ShieldCheck, HeartPulse 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { api } from '../../services/api';

const FAQS = [
  {
    question: 'Is the Personal Wellness Guide a replacement for a doctor?',
    answer: 'No. The Personal Wellness Guide provides psychoeducation, grounding exercises, and active empathetic listening. It is an automated, non-clinical tool that cannot make definitive medical diagnoses, cannot prescribe pharmaceuticals, and cannot replace personalized clinical judgment from a licensed psychiatrist or psychologist.'
  },
  {
    question: 'What should I do if I am experiencing an acute psychological crisis?',
    answer: 'If you or someone you know is in immediate danger or experiencing thoughts of self-harm, please dial India’s 24/7 National Mental Health Helpline (Tele-MANAS) at 14416 or 1800-891-4416, or call Emergency Services at 112 immediately. Manospring is an elective outpatient telemedicine platform and not equipped for emergency dispatch.'
  },
  {
    question: 'How are Manospring clinicians verified?',
    answer: 'Every psychiatrist on our platform holds a recognized MD/DNB in Psychiatry registered with the National Medical Commission (NMC). Every clinical psychologist holds an M.Phil in Clinical Psychology and is licensed by the Rehabilitation Council of India (RCI). We verify credentials directly with statutory regulatory registries.'
  },
  {
    question: 'How is my private health data protected under Indian law?',
    answer: 'In strict compliance with the Digital Personal Data Protection Act (DPDPA 2023) and the Telemedicine Practice Guidelines, all communication is encrypted in transit using TLS 1.3 and at rest with AES-256. We never sell patient data, train public foundation models on private user logs, or record video sessions without explicit informed consent.'
  },
  {
    question: 'Can I reschedule or cancel my appointment?',
    answer: 'Yes. You can cancel or reschedule up to 4 hours prior to your scheduled consultation time directly from your Sessions portal for a 100% full refund.'
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  // Inquiry Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [category, setCategory] = useState<string>('General Support');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await api.contact.submitInquiry({
        name: name.trim(),
        email: email.trim(),
        category,
        message: message.trim()
      });
      setSubmitSuccess('Your message has been delivered to the Manospring Clinical Care Coordination team. A response will be sent to your email.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to transmit message. Please email care@manospring.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 dark:bg-[#0a120f] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* FAQ Accordion (7 cols) */}
          <div className="lg:col-span-7">
            <Badge variant="teal" className="mb-3">
              Clear &amp; Transparent
            </Badge>
            <h2 className="text-3xl font-serif font-medium text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm mb-8">
              Everything you need to know about our clinical standards, consultations, and privacy safeguards.
            </p>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#13221d] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-medium text-slate-900 dark:text-white hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-medium pr-2">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
                        openIndex === idx ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
                      }`}
                    />
                  </button>
                  {openIndex === idx && (
                    <div className="px-5 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Helpline quick badge */}
            <div className="mt-8 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
              <HeartPulse className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <span className="font-semibold block mb-0.5">Need immediate emotional crisis support?</span>
                Dial National Tele-MANAS at <strong className="text-amber-950 dark:text-amber-100 font-mono">14416</strong> or <strong className="text-amber-950 dark:text-amber-100 font-mono">1800-891-4416</strong>. Toll-free, confidential, and available 24/7 across all Indian languages.
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form (5 cols) */}
          <div id="contact" className="lg:col-span-5">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#13221d]">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl font-serif text-slate-900 dark:text-white">
                  Connect with Care Coordination
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Have a question about scheduling, corporate mental health, or data requests? We respond within 4 business hours.
                </p>
              </CardHeader>
              <CardContent className="pt-5">
                {submitSuccess ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-medium">Thank You for Reaching Out</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">{submitSuccess}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 text-xs"
                      onClick={() => setSubmitSuccess(null)}
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    {submitError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Meera Nair"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="meera@example.com"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Topic / Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      >
                        <option value="General Support">General Inquiries</option>
                        <option value="Booking & Billing">Appointment &amp; Billing Assistance</option>
                        <option value="Clinician Partnership">Doctor / Clinical Partnership</option>
                        <option value="Privacy & DPDPA">Data Protection &amp; Privacy Officer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        How can we help? *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your question or requirement..."
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full justify-center text-xs"
                      disabled={submitting}
                    >
                      {submitting ? 'Transmitting Securely...' : 'Send Message to Care Team'}
                      <Send className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
