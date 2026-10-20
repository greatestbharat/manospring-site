import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Compass, UserCheck, CalendarDays, Video, Shield } from 'lucide-react';
import { useTranslation } from '../../app/i18n';

interface HowItWorksSectionProps {
  onStartCare?: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onStartCare }) => {
  const { t } = useTranslation();

  const steps = [
    {
      step: '01',
      title: t('howItWorks.step1Title', 'Explore support'),
      description: t('howItWorks.step1Desc', 'Reflect on what you are experiencing with our Personal Wellness Guide or browse topics at your own pace without pressure.'),
      icon: Compass
    },
    {
      step: '02',
      title: t('howItWorks.step2Title', 'Choose a specialist'),
      description: t('howItWorks.step2Desc', 'Select from verified psychiatrists (MD/DNB) and licensed clinical psychologists (M.Phil, RCI) based on your needs and language preferences.'),
      icon: UserCheck
    },
    {
      step: '03',
      title: t('howItWorks.step3Title', 'Book a convenient time'),
      description: t('howItWorks.step3Desc', 'Choose an available time slot and select your consultation format—encrypted HD video, audio phone call, or secure private messaging.'),
      icon: CalendarDays
    },
    {
      step: '04',
      title: t('howItWorks.step4Title', 'Attend your consultation'),
      description: t('howItWorks.step4Desc', 'Join your private consultation suite. Work collaboratively with your specialist to receive an evidence-informed care and recovery plan.'),
      icon: Video
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white dark:bg-[#0a120f] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="teal" className="mb-3">
            {t('howItWorks.badge', 'Clear & Transparent Journey')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 dark:text-white tracking-tight">
            {t('howItWorks.title', 'How Manospring works.')}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('howItWorks.subtitle', 'From initial exploration to ongoing clinical care, every step is designed to be calm, confidential, and completely within your control.')}
          </p>
        </div>

        {/* 4-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.step}
                className="bg-slate-50/70 dark:bg-[#13221d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500 hover:bg-white dark:hover:bg-[#172c25] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2.5 py-1 rounded-md border border-teal-200/60 dark:border-teal-800/60">
                      Step {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-800 dark:text-teal-300 flex items-center justify-center shadow-xs">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
                  {t('hero.reassurance', 'Private conversations · Professional support · Care at your pace')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Telemedicine & Clinical Framework Disclaimer */}
        <div className="mt-12 bg-teal-50/50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 rounded-2xl p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3 max-w-3xl mx-auto">
          <Shield className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-teal-950 dark:text-teal-200 font-semibold">National Telemedicine Practice Guidelines (2020):</strong> All consultations are conducted in strict compliance with statutory Indian telemedicine regulations. Doctors record patient consent, verify identity, and maintain confidential clinical case summaries.
          </div>
        </div>

      </div>
    </section>
  );
};
