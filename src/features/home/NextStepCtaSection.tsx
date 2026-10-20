import React from 'react';
import { Button } from '../../components/ui/button';
import { Calendar, UserCheck, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../app/i18n';

interface NextStepCtaSectionProps {
  onBookConsultation: () => void;
  onFindSpecialist: () => void;
}

export const NextStepCtaSection: React.FC<NextStepCtaSectionProps> = ({
  onBookConsultation,
  onFindSpecialist
}) => {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 bg-teal-900 dark:bg-[#071913] text-white relative overflow-hidden transition-colors duration-200">
      {/* Subtle organic background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800/50 dark:bg-teal-900/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-950/40 dark:bg-emerald-950/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-800/80 dark:bg-teal-950/80 text-teal-200 text-xs font-semibold border border-teal-700/60 dark:border-teal-800/60">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            {t('nextStep.badge', 'Your Next Step')}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white leading-tight">
            {t('nextStep.title', 'Take the first step towards feeling supported.')}
          </h2>

          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-xl mx-auto">
            {t('nextStep.desc', 'Professional care is available whenever you feel ready. Consult verified psychiatrists and clinical psychologists privately from home.')}
          </p>

          <div className="flex items-center justify-center gap-3.5 flex-wrap pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onBookConsultation}
              className="bg-white! hover:bg-slate-100! dark:bg-teal-600! dark:hover:bg-teal-500! text-teal-950! dark:text-white! font-semibold text-sm px-6 py-3 cursor-pointer"
            >
              {t('nextStep.bookBtn', 'Book a Consultation')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onFindSpecialist}
              className="bg-transparent! border-teal-500/80! text-white! hover:bg-teal-800/60! font-medium text-sm px-6 py-3"
            >
              {t('nextStep.browseBtn', 'Browse All Specialists')}
            </Button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-teal-200/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-300" />
              <span>{t('nextStep.sameDay', 'Same-day slots often available')}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-300" />
              <span>{t('nextStep.verifiedDoctors', 'NMC & RCI Verified Doctors')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>{t('nextStep.confidentialEncrypted', '100% Confidential & Encrypted')}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
