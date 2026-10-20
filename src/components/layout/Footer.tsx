import React from 'react';
import { useTranslation } from '../../app/i18n';

interface FooterProps {
  onOpenEmergency?: () => void;
  onOpenHelplines?: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenPrivacyRequest: () => void;
  onOpenClinicianLogin?: () => void;
  onClinicianLoginClick?: () => void;
  onNavigate?: (path: string, sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenEmergency,
  onOpenHelplines,
  onOpenPrivacy,
  onOpenTerms,
  onOpenPrivacyRequest,
  onOpenClinicianLogin,
  onClinicianLoginClick,
  onNavigate
}) => {
  const { t } = useTranslation();
  const handleEmergency = onOpenEmergency || onOpenHelplines || (() => {});
  const handleClinician = onOpenClinicianLogin || onClinicianLoginClick || (() => {});

  const handleNav = (e: React.MouseEvent, path: string, sectionId: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path, sectionId);
    } else {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-10 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Contacts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-teal-800 flex items-center justify-center text-white">
                <svg viewBox="0 0 40 40" fill="none" className="w-4 h-4" aria-hidden="true">
                  <path d="M20 34C13 28 5 22 7 14C9 7 17 8 20 15C23 8 31 7 33 14C35 22 27 28 20 34Z" fill="#d4eda8" />
                  <path d="M12 20Q16 15 20 21Q24 15 28 20M20 15V28" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-xl font-serif font-bold text-white tracking-tight">manospring</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              {t('footer.tagline', 'Professional, confidential mental healthcare and personal wellbeing guidance across India.')}
            </p>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>Care Coordination: <strong>care@manospring.com</strong></div>
              <div>Data Protection Officer: <strong>dpo@manospring.com</strong></div>
            </div>
          </div>

          {/* Clinical Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              {t('footer.careServices', 'Care Services')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="/specialists" onClick={(e) => handleNav(e, '/specialists', 'specialists')} className="hover:text-white transition-colors cursor-pointer">{t('footer.psychiatry', 'Consult Psychiatrists (MD/DNB)')}</a></li>
              <li><a href="/specialists" onClick={(e) => handleNav(e, '/specialists', 'specialists')} className="hover:text-white transition-colors cursor-pointer">{t('footer.psychology', 'Clinical Psychologists (M.Phil, RCI)')}</a></li>
              <li><a href="/wellness" onClick={(e) => handleNav(e, '/wellness', 'wellness')} className="hover:text-white transition-colors cursor-pointer">{t('nav.wellness', 'Mental Wellness')}</a></li>
              <li><a href="/sessions" onClick={(e) => handleNav(e, '/sessions', 'sessions')} className="hover:text-white transition-colors cursor-pointer">{t('footer.portal', 'Patient Portal & Sessions')}</a></li>
            </ul>
          </div>

          {/* Patient Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">Patient Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="/how-it-works" onClick={(e) => handleNav(e, '/how-it-works', 'how-it-works')} className="hover:text-white transition-colors cursor-pointer">{t('nav.howItWorks', 'How Manospring Works')}</a></li>
              <li><a href="/sessions" onClick={(e) => handleNav(e, '/sessions', 'sessions')} className="hover:text-white transition-colors cursor-pointer">{t('nav.sessions', 'My Appointments')}</a></li>
              <li><a href="/faq" onClick={(e) => handleNav(e, '/faq', 'faq')} className="hover:text-white transition-colors cursor-pointer">Frequently Asked Questions</a></li>
              <li><a href="/contact" onClick={(e) => handleNav(e, '/contact', 'contact')} className="hover:text-white transition-colors cursor-pointer">Contact Care Team</a></li>
              <li><button onClick={handleEmergency} className="hover:text-rose-400 transition-colors text-left font-medium text-rose-300 cursor-pointer">{t('footer.emergencySupport', '24/7 Crisis Helplines')}</button></li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              {t('footer.governance', 'Governance & Legal')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={onOpenPrivacy} className="hover:text-white transition-colors text-left cursor-pointer">{t('footer.privacy', 'Privacy Policy (DPDPA 2023)')}</button></li>
              <li><button onClick={onOpenTerms} className="hover:text-white transition-colors text-left cursor-pointer">{t('footer.terms', 'Terms of Healthcare Service')}</button></li>
              <li><button onClick={onOpenTerms} className="hover:text-white transition-colors text-left cursor-pointer">{t('footer.cancellation', 'Cancellation & Refund Policy')}</button></li>
              <li><button onClick={onOpenPrivacyRequest} className="hover:text-white transition-colors text-left cursor-pointer">{t('footer.dpdpa', 'Manage DPDPA Privacy Rights')}</button></li>
              <li><button onClick={handleClinician} className="hover:text-white transition-colors text-left text-teal-400 cursor-pointer">{t('nav.clinician', 'Clinician')} Workspace Login →</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Manospring Healthcare Pvt. Ltd. {t('footer.copyright', 'All rights reserved.')}
          </div>
          <div className="text-[11px] text-slate-400">
            Immediate psychological crisis? Dial <strong className="text-white">14416</strong> (Tele-MANAS) or Emergency <strong className="text-white">112</strong>.
          </div>
        </div>

      </div>
    </footer>
  );
};
