import React from 'react';
import { useTranslation } from '../../app/i18n';

interface TopEmergencyBarProps {
  onOpenEmergency?: () => void;
  onOpenHelplines?: () => void;
}

export const TopEmergencyBar: React.FC<TopEmergencyBarProps> = ({ 
  onOpenEmergency, 
  onOpenHelplines 
}) => {
  const handleOpen = onOpenEmergency || onOpenHelplines || (() => {});
  const { t } = useTranslation();

  return (
    <aside className="bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs py-1.5 px-4 transition-colors" role="complementary">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap text-center">
        <span className="text-[11px] text-slate-600 dark:text-slate-400">
          {t('topBar.helplineText', '24/7 National Mental Health Helpline (India):')}{' '}
          <strong className="text-slate-900 dark:text-white font-mono">{t('topBar.teleManas', '14416 (Tele-MANAS)')}</strong> ·{' '}
          <strong className="text-slate-900 dark:text-white font-mono">{t('topBar.emergency', 'Emergency: 112')}</strong>
        </span>
        <button
          type="button"
          onClick={handleOpen}
          className="bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-2.5 py-0.5 rounded-full font-medium transition-colors text-[10px] cursor-pointer"
        >
          {t('topBar.directoryBtn', 'Helpline Directory ↗')}
        </button>
      </div>
    </aside>
  );
};
