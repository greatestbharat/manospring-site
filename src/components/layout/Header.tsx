import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Menu, X, HeartPulse, Sun, Moon, Languages, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../../app/theme';
import { useTranslation } from '../../app/i18n';
import { cn } from '../../lib/utils';
import { appPath, currentAppPath, navigateApp } from '../../lib/routing';

interface HeaderProps {
  onBookClick: () => void;
  onOpenClinicianLogin?: () => void;
  onOpenEmergency?: () => void;
  onNavigate?: (path: string, sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onBookClick,
  onOpenClinicianLogin,
  onOpenEmergency,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState('/');
  const langRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages, currentLangInfo } = useTranslation();

  const navItems = [
    { label: t('nav.home', 'Home'), path: '/', sectionId: 'home' },
    { label: t('nav.specialists', 'Find a Specialist'), path: '/specialists', sectionId: 'specialists' },
    { label: t('nav.howItWorks', 'How It Works'), path: '/how-it-works', sectionId: 'how-it-works' },
    { label: t('nav.wellness', 'Mental Wellness'), path: '/wellness', sectionId: 'wellness' },
    { label: t('nav.sessions', 'My Appointments'), path: '/sessions', sectionId: 'sessions' }
  ];

  /* Track current path for active nav state */
  useEffect(() => {
    const syncPath = () => setActivePath(currentAppPath());
    syncPath();
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  /* Scroll-aware elevation */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Outside-click closes language dropdown */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Escape closes dropdown, then drawer */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (langMenuOpen) setLangMenuOpen(false);
        else if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [langMenuOpen, mobileMenuOpen]);

  /* Lock body scroll while drawer is open; focus the close button */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) =>
    path === '/' ? activePath === '/' : activePath.startsWith(path);

  const handleNav = (e: React.MouseEvent, path: string, sectionId: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path, sectionId);
    } else {
      navigateApp(path);
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setActivePath(path);
    setMobileMenuOpen(false);
  };

  const navLinkClass = (path: string) =>
    cn(
      'px-2 py-2 text-[11px] xl:px-3.5 xl:py-2 xl:text-sm font-medium tracking-tight whitespace-nowrap rounded-full transition-colors cursor-pointer pointer-events-auto',
      isActive(path)
        ? 'text-brand-700 dark:text-teal-300 bg-brand-50 dark:bg-teal-950/60'
        : 'text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-teal-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
    );

  return (
    <>
      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-shadow duration-300',
          scrolled && 'shadow-[0_4px_24px_rgba(15,40,32,0.08)]'
        )}
      >
        <div className="relative w-full h-16 px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-3">

          {/* Skip link lives with brand for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 z-50 focus:bg-brand-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-xs focus:font-semibold"
          >
            Skip to main content
          </a>

          {/* Left: Brand */}
          <a
            href={appPath('/')}
            onClick={(e) => handleNav(e, '/', 'home')}
            className="flex items-center gap-2.5 group shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-xl"
            aria-label="manospring — Home"
          >
            <span className="w-9 h-9 rounded-xl bg-teal-800 dark:bg-teal-700 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-700 transition-colors">
              <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5" aria-hidden="true">
                <path d="M20 34C13 28 5 22 7 14C9 7 17 8 20 15C23 8 31 7 33 14C35 22 27 28 20 34Z" fill="#d4eda8" />
                <path d="M12 20Q16 15 20 21Q24 15 28 20M20 15V28" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              manospring
            </span>
          </a>

          {/* Center: Primary Navigation (pinned to exact viewport center) */}
          <nav
            className="hidden lg:flex absolute inset-0 items-center justify-center gap-0.5 pointer-events-none"
            aria-label="Main"
          >
            {navItems.map((item) => (
              <a
                key={item.path}
                href={appPath(item.path)}
                onClick={(e) => handleNav(e, item.path, item.sectionId)}
                className={navLinkClass(item.path)}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Crisis helpline */}
            {onOpenEmergency && (
              <button
                type="button"
                onClick={onOpenEmergency}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/70 dark:border-rose-900/50 h-9 px-3 rounded-full transition-colors cursor-pointer"
                title="Immediate 24/7 crisis support"
              >
                <HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{t('nav.emergency', 'Helpline 14416')}</span>
              </button>
            )}

            {/* Utilities frame: language + theme */}
            <div className="hidden sm:flex items-center h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shadow-xs">
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="h-8 pl-2 pr-1.5 rounded-full flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-teal-300 transition-colors cursor-pointer"
                  aria-label={t('languages.selectLanguage', 'Select language')}
                  aria-haspopup="menu"
                  aria-expanded={langMenuOpen}
                >
                  <Languages className="w-3.5 h-3.5 text-brand-600 dark:text-teal-400 shrink-0" />
                  <span className="font-semibold text-[11px] text-slate-800 dark:text-slate-200">{currentLangInfo.short}</span>
                  <ChevronDown className={cn('w-2.5 h-2.5 text-slate-400 transition-transform duration-200', langMenuOpen && 'rotate-180')} />
                </button>

                {langMenuOpen && (
                  <div
                    role="menu"
                    aria-label={t('languages.selectLanguage', 'Select language')}
                    className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-200/80 dark:ring-slate-700/80 py-1.5 z-50 origin-top-right"
                  >
                    <div className="px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                      {t('languages.selectLanguage', 'Select language')}
                    </div>
                    {availableLanguages.map((lang) => {
                      const isSelected = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangMenuOpen(false);
                          }}
                          className={cn(
                            'w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-brand-50 dark:bg-teal-950/60 text-brand-800 dark:text-teal-200 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          )}
                        >
                          <span>{lang.nativeName}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-teal-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

              <button
                type="button"
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                  : <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />}
              </button>
            </div>

            {/* Primary CTA */}
            <Button
              variant="primary"
              size="sm"
              onClick={onBookClick}
              className="h-9 px-4 sm:px-5 text-xs font-semibold shrink-0"
            >
              <span className="hidden xl:inline">{t('nav.book', 'Book a Consultation')}</span>
              <span className="xl:hidden">Book</span>
            </Button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer: backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer: panel */}
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed top-0 right-0 z-[60] h-dvh w-full max-w-xs bg-white dark:bg-slate-900 shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-out',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800">
          <span className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-teal-800 dark:bg-teal-700 flex items-center justify-center">
              <svg viewBox="0 0 40 40" fill="none" className="w-4.5 h-4.5" aria-hidden="true">
                <path d="M20 34C13 28 5 22 7 14C9 7 17 8 20 15C23 8 31 7 33 14C35 22 27 28 20 34Z" fill="#d4eda8" />
                <path d="M12 20Q16 15 20 21Q24 15 28 20M20 15V28" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-serif text-lg font-bold text-slate-900 dark:text-white">manospring</span>
          </span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="Mobile">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={appPath(item.path)}
              onClick={(e) => handleNav(e, item.path, item.sectionId)}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                isActive(item.path)
                  ? 'bg-brand-50 dark:bg-teal-950/60 text-brand-800 dark:text-teal-200'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <span>{item.label}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </a>
          ))}
        </nav>

        {/* Drawer actions */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/60 dark:bg-slate-950/40">

          {/* Language picker */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 px-1">
              <Languages className="w-3.5 h-3.5 text-brand-600 dark:text-teal-400" />
              <span>{t('languages.selectLanguage', 'Select language')}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {availableLanguages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-brand-600 dark:bg-teal-700 text-white font-semibold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
                    )}
                    aria-pressed={isSelected}
                  >
                    {lang.nativeName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
              <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            </span>
            <span className="text-[11px] font-semibold text-brand-700 dark:text-teal-400">Switch</span>
          </button>

          {/* Primary CTA */}
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={() => { setMobileMenuOpen(false); onBookClick(); }}
          >
            {t('nav.book', 'Book a Consultation')}
          </Button>

          {/* Crisis helpline */}
          {onOpenEmergency && (
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onOpenEmergency(); }}
              className="w-full py-2 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>24/7 Crisis Line (14416 / 112)</span>
            </button>
          )}

          {/* Clinician login */}
          {onOpenClinicianLogin && (
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onOpenClinicianLogin(); }}
              className="w-full py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              Clinician workspace login →
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
