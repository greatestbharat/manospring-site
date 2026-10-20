import React from 'react';
import { Badge } from '../../components/ui/badge';
import { 
  CloudSun, Moon, HeartCrack, Wind, Briefcase, 
  RefreshCw, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { useTranslation } from '../../app/i18n';

interface ExploreTopicsSectionProps {
  onSelectTopic: (topic: string, promptText: string) => void;
  onBrowseSpecialists: () => void;
}

export const ExploreTopicsSection: React.FC<ExploreTopicsSectionProps> = ({
  onSelectTopic,
  onBrowseSpecialists
}) => {
  const { t } = useTranslation();

  const topics = [
    {
      id: 'anxiety',
      title: t('explore.anxietyTitle', 'Anxiety & Worry'),
      description: t('explore.anxietyDesc', 'Racing thoughts, constant tension, or physical restlessness that feels difficult to quiet.'),
      icon: Wind,
      starter: 'I have been dealing with persistent anxiety and worry lately, and I would like gentle guidance on coping.'
    },
    {
      id: 'sleep',
      title: t('explore.sleepTitle', 'Sleep Difficulties'),
      description: t('explore.sleepDesc', 'Trouble falling asleep, waking up in the middle of the night, or waking unrefreshed.'),
      icon: Moon,
      starter: 'I am struggling with sleep disruption and would like to understand healthy sleep hygiene and relaxation.'
    },
    {
      id: 'stress',
      title: t('explore.stressTitle', 'Stress & Overwhelm'),
      description: t('explore.stressDesc', 'Balancing responsibilities when demands feel too heavy and restorative downtime feels out of reach.'),
      icon: CloudSun,
      starter: 'I feel overwhelmed by daily responsibilities and stress. Can we explore simple grounding techniques?'
    },
    {
      id: 'low-mood',
      title: t('explore.moodTitle', 'Low Mood & Sadness'),
      description: t('explore.moodDesc', 'Persistent emptiness, losing interest in activities you usually enjoy, or lingering fatigue.'),
      icon: HeartCrack,
      starter: 'I have been feeling quite low and unmotivated. I want a supportive space to reflect on what I feel.'
    },
    {
      id: 'burnout',
      title: t('explore.burnoutTitle', 'Work & Burnout'),
      description: t('explore.burnoutDesc', 'Mental exhaustion, cynicism, boundary challenges, and reduced sense of accomplishment.'),
      icon: Briefcase,
      starter: 'I am experiencing intense workplace burnout and pressure. How can I protect my emotional energy?'
    },
    {
      id: 'transitions',
      title: t('explore.transitionsTitle', 'Life Transitions'),
      description: t('explore.transitionsDesc', 'Navigating relocations, relationship changes, grief, career pivots, or identity shifts.'),
      icon: RefreshCw,
      starter: 'I am going through a major life transition and need help processing all the changes.'
    }
  ];

  return (
    <section id="wellness" className="py-16 sm:py-20 bg-slate-50 dark:bg-[#0a120f] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <Badge variant="teal" className="mb-3">
            {t('explore.badge', 'Thoughtful Exploration')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 dark:text-white tracking-tight">
            {t('explore.title', 'Explore what you are experiencing.')}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('explore.subtitle', 'Select any area that resonates with you to start a private reflection or browse specialists experienced in that domain.')}
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic.id, topic.starter)}
                className="bg-white dark:bg-[#13221d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-teal-300 dark:hover:border-teal-500 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-teal-900 dark:group-hover:text-teal-300 transition-colors flex items-center justify-between">
                    <span>{topic.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-teal-800 dark:text-teal-300">
                  <span>{t('explore.startReflection', 'Start conversation')}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {t('chat.confidentialBadge', 'Confidential')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Transparency Note */}
        <div className="mt-10 p-4 rounded-2xl bg-white dark:bg-[#13221d] border border-slate-200 dark:border-slate-800 flex items-start gap-3 max-w-3xl transition-colors">
          <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">{t('explore.confidentialNotice', 'Confidential & non-diagnostic.')}</strong>{' '}
            {t('privateSpace.f3Desc', 'Our Personal Wellness Guide provides active empathetic listening and gentle psychoeducation. It never claims to be a doctor, diagnose medical conditions, or prescribe pharmaceuticals.')}
            <button
              type="button"
              onClick={onBrowseSpecialists}
              className="ml-2 text-teal-800 dark:text-teal-300 font-semibold underline hover:text-teal-950 dark:hover:text-teal-200 inline-block cursor-pointer"
            >
              {t('explore.browseAllSpecialists', 'Browse All Specialists')} →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
