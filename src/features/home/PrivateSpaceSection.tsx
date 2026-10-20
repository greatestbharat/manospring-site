import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ShieldCheck, Lock, MessageSquareHeart, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../app/i18n';

interface PrivateSpaceSectionProps {
  onOpenGuide: () => void;
}

export const PrivateSpaceSection: React.FC<PrivateSpaceSectionProps> = ({ onOpenGuide }) => {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 bg-slate-50 dark:bg-[#0a120f] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Text & Features */}
          <div className="lg:col-span-7 space-y-6 max-w-2xl">
            <Badge variant="teal">
              {t('privateSpace.badge', 'Patient Confidentiality')}
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 dark:text-white tracking-tight leading-snug">
              {t('privateSpace.title', 'A private, confidential space to talk.')}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('privateSpace.p1', 'Mental health is deeply personal. At Manospring, every interaction—from reflective conversations with our Personal Wellness Guide to 1-on-1 consultations with specialists—is held to the highest ethical and legal privacy standards.')}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100 dark:border-teal-800">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('privateSpace.f1Title', 'Informed Consent & Data Rights')}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {t('privateSpace.f1Desc', 'In compliance with the Digital Personal Data Protection Act (DPDPA 2023), you hold full ownership of your data. You may request record access, correction, or permanent erasure at any time.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100 dark:border-teal-800">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('privateSpace.f2Title', 'End-to-End Encryption')}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {t('privateSpace.f2Desc', 'All consultation rooms, prescriptions, and notes are protected with TLS 1.3 in transit and AES-256 at rest. Video and audio streams are never recorded without explicit written authorization.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100 dark:border-teal-800">
                  <MessageSquareHeart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('privateSpace.f3Title', 'Non-Diagnostic Support')}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {t('privateSpace.f3Desc', 'Our Personal Wellness Guide provides active empathetic listening and gentle psychoeducation. It never claims to be a doctor, diagnose medical conditions, or prescribe pharmaceuticals.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Button 
                variant="primary" 
                size="md" 
                onClick={onOpenGuide}
                className="font-medium text-xs px-5 py-2.5 cursor-pointer"
              >
                {t('privateSpace.talkGuideBtn', 'Start a Private Conversation')} →
              </Button>
            </div>
          </div>

          {/* Right: Security & Consent Trust Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-[#13221d] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-teal-800 dark:bg-teal-700 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Patient Privacy Commitments</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Statutory Compliance Under Indian Law</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>No selling or marketing of sensitive health data</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>No public foundation model training on conversation logs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Verified credentials on official statutory registries</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Dedicated Data Protection &amp; Grievance Officer</span>
                </li>
              </ul>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/70 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <strong className="text-slate-700 dark:text-slate-200 block font-medium">Need data assistance?</strong>
                <p>
                  Submit a privacy request to review or delete your stored records anytime directly from our footer.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
