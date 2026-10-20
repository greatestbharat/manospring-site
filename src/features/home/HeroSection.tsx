import React from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ShieldCheck, Video, Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../app/i18n';

interface HeroSectionProps {
  onBookConsultation: () => void;
  onFindSpecialist: () => void;
  onSelectDoctor?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookConsultation,
  onFindSpecialist,
  onSelectDoctor
}) => {
  const { t } = useTranslation();

  return (
    <section id="home" className="pt-8 pb-16 sm:py-20 bg-warm-white dark:bg-[#0a120f] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Focused Healthcare Message */}
          <div className="lg:col-span-7 space-y-6 max-w-2xl">
            {/* Small eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 rounded-full text-xs font-semibold border border-teal-200/80 dark:border-teal-800/60">
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400" />
              {t('hero.badge', 'Mental healthcare, centred around you')}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-medium tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              {t('hero.title', 'A healthier mind begins with being heard.')}
            </h1>

            {/* Supporting copy */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              {t('hero.subtitle', 'Explore your feelings, find trusted mental health professionals, and take your next step towards wellbeing in a private, supportive environment.')}
            </p>

            {/* Primary & Secondary Buttons */}
            <div className="flex items-center gap-3.5 flex-wrap pt-1">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={onBookConsultation}
                className="font-semibold text-sm px-6 py-3 cursor-pointer"
              >
                {t('hero.bookBtn', 'Book a Consultation')}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={onFindSpecialist}
                className="font-medium text-sm px-6 py-3 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('hero.findBtn', 'Find a Specialist')}
              </Button>
            </div>

            {/* Small reassurance line */}
            <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {t('hero.reassurance', 'Private conversations · Professional support · Care at your pace')}
              </span>
            </div>
          </div>

          {/* Right Column: Genuine Licensed Clinician Profile & Care Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Decorative subtle ambient backdrop */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-teal-100/50 dark:from-teal-900/30 via-sage-100/30 dark:via-emerald-950/20 to-amber-50/50 dark:to-teal-950/20 rounded-3xl blur-xl -z-10" />

              <div className="bg-white dark:bg-[#13221d] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 transition-colors">
                
                {/* Genuine Clinician Profile Banner */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-100 dark:border-teal-800/80 flex items-center justify-center text-3xl shrink-0">
                    👩🏽‍⚕️
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">Dr. Ananya Sharma</h3>
                      <Badge variant="teal" className="text-[10px] py-0.5">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-teal-800 dark:text-teal-300 mt-0.5">
                      {t('hero.doctorRole', 'Consultant Psychiatrist')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      MBBS, MD (Psychiatry) — NIMHANS, Bengaluru
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>KMC-78421 · National Medical Commission</span>
                    </div>
                  </div>
                </div>

                {/* Focus areas pills */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-2">
                    Areas of Expertise
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Anxiety & Panic', 'Adult ADHD', 'Sleep Medicine', 'Mood Health'].map((topic) => (
                      <span
                        key={topic}
                        className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Consultation Details & Slot */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                      Consultation Formats
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">HD Video · Voice · Secure Chat</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                      Earliest Available Slot
                    </span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      Today, 5:30 PM
                    </span>
                  </div>
                </div>

                {/* Call to action */}
                <button
                  type="button"
                  onClick={onSelectDoctor || onBookConsultation}
                  className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 dark:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Schedule Consultation with Dr. Sharma</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Reassurance footer items */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Telemedicine Guidelines 2020</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>DPDPA 2023 Encrypted</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
