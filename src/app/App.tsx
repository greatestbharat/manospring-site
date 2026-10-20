import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './theme';
import { LanguageProvider } from './i18n';
import { TopEmergencyBar } from '../components/layout/TopEmergencyBar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../features/home/HeroSection';
import { ExploreTopicsSection } from '../features/home/ExploreTopicsSection';
import { SpecialistGrid } from '../features/specialists/SpecialistGrid';
import { SpecialistBioModal } from '../features/specialists/SpecialistBioModal';
import { HowItWorksSection } from '../features/home/HowItWorksSection';
import { PrivateSpaceSection } from '../features/home/PrivateSpaceSection';
import { NextStepCtaSection } from '../features/home/NextStepCtaSection';
import { ConsultationSuite } from '../features/consultations/ConsultationSuite';
import { PatientPortal } from '../features/patient/PatientPortal';
import { FaqSection } from '../features/contact/FaqSection';
import { FloatingChat } from '../features/ai-chat/FloatingChat';
import { BookingModal } from '../features/appointments/BookingModal';
import { EmergencyModal } from '../components/shared/EmergencyModal';
import { ClinicianLoginModal } from '../components/shared/ClinicianLoginModal';
import { PrivacyRequestModal } from '../components/shared/PrivacyRequestModal';
import { PrivacyModal, TermsModal } from '../components/shared/LegalModals';
import { Specialist } from '../types';
import { currentAppPath, navigateApp, replaceApp } from '../lib/routing';

export const AppContent: React.FC = () => {
  // Modal states
  const [emergencyOpen, setEmergencyOpen] = useState<boolean>(false);
  const [clinicianLoginOpen, setClinicianLoginOpen] = useState<boolean>(false);
  const [privacyRequestOpen, setPrivacyRequestOpen] = useState<boolean>(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);
  
  // Specialist selection & booking states
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedBioSpecialist, setSelectedBioSpecialist] = useState<Specialist | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [activeRoomId, setActiveRoomId] = useState<string>('mano-sess-sample');

  // Personal Wellness Guide (Floating conversation) controlled states
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [guidePrompt, setGuidePrompt] = useState<string>('');

  // Clean Path-based Navigation (works with GitHub Pages base path)
  const handleNavigate = (path: string, sectionId?: string) => {
    navigateApp(path);
    if (sectionId === 'home' || path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sync scroll position with clean URLs on load and popstate
  useEffect(() => {
    const handleUrlRouting = () => {
      // 1. Convert legacy hash (e.g. /#specialists -> /specialists)
      const hash = window.location.hash;
      if (hash && hash.startsWith('#')) {
        const cleanPath = hash.replace(/^#\/?/, '/');
        replaceApp(cleanPath);
      }

      const path = currentAppPath();
      const sectionMap: Record<string, string> = {
        '/specialists': 'specialists',
        '/how-it-works': 'how-it-works',
        '/wellness': 'wellness',
        '/sessions': 'sessions',
        '/consultations': 'consultations',
        '/faq': 'faq',
        '/contact': 'contact'
      };

      if (path === '/' || path === '') {
        // Home
      } else if (sectionMap[path]) {
        setTimeout(() => {
          document.getElementById(sectionMap[path])?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (path.startsWith('/sessions')) {
        setTimeout(() => {
          document.getElementById('sessions')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  const handleStartBooking = (spec?: Specialist) => {
    setSelectedSpecialist(spec || null);
    setBookingModalOpen(true);
  };

  const handleOpenGuideWithTopic = (topicId: string, promptText: string) => {
    setGuidePrompt(promptText);
    setGuideOpen(true);
  };

  const handleJoinConsultation = (roomId: string) => {
    setActiveRoomId(roomId);
    handleNavigate('/consultations', 'consultations');
  };

  return (
    <div className="min-h-screen flex flex-col bg-warm-white dark:bg-[#0a120f] text-slate-800 dark:text-slate-100 font-sans selection:bg-teal-100 dark:selection:bg-teal-900 selection:text-teal-900 dark:selection:text-teal-100 transition-colors duration-200">
      
      {/* 1. Discreet Crisis Helplines Alert Bar */}
      <TopEmergencyBar onOpenEmergency={() => setEmergencyOpen(true)} />

      {/* 2. Professional Healthcare Header Navigation */}
      <Header
        onBookClick={() => handleStartBooking()}
        onOpenClinicianLogin={() => setClinicianLoginOpen(true)}
        onOpenEmergency={() => setEmergencyOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main Patient Journey */}
      <main id="main-content" className="flex-1">
        
        {/* Section 1: Hero Section */}
        <HeroSection
          onBookConsultation={() => handleStartBooking()}
          onFindSpecialist={() => handleNavigate('/specialists', 'specialists')}
          onSelectDoctor={() => handleStartBooking()}
        />

        {/* Section 2: Explore what you are experiencing */}
        <ExploreTopicsSection
          onSelectTopic={(topicId, promptText) => handleOpenGuideWithTopic(topicId, promptText)}
          onBrowseSpecialists={() => handleNavigate('/specialists', 'specialists')}
        />

        {/* Section 3: Meet our specialists */}
        <SpecialistGrid
          onBookSpecialist={(spec) => handleStartBooking(spec)}
          onViewBio={(spec) => setSelectedBioSpecialist(spec)}
        />

        {/* Section 4: How Manospring works */}
        <HowItWorksSection
          onStartCare={() => handleStartBooking()}
        />

        {/* Section 5: A private space to talk */}
        <PrivateSpaceSection
          onOpenGuide={() => setGuideOpen(true)}
        />

        {/* Section 6: Your next step (Booking Call to Action) */}
        <NextStepCtaSection
          onBookConsultation={() => handleStartBooking()}
          onFindSpecialist={() => handleNavigate('/specialists', 'specialists')}
        />

        {/* Telehealth Consultation Suite */}
        <ConsultationSuite
          initialRoomId={activeRoomId}
        />

        {/* Patient Appointments & Clinician Portal */}
        <PatientPortal
          onJoinRoom={(roomId) => handleJoinConsultation(roomId)}
        />

        {/* Section 7: Frequently Asked Questions & Care Coordination */}
        <FaqSection />

      </main>

      {/* Section 8: Professional Healthcare Footer */}
      <Footer
        onOpenEmergency={() => setEmergencyOpen(true)}
        onOpenPrivacy={() => setPrivacyPolicyOpen(true)}
        onOpenTerms={() => setTermsOpen(true)}
        onOpenPrivacyRequest={() => setPrivacyRequestOpen(true)}
        onOpenClinicianLogin={() => setClinicianLoginOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Section 6: Personal Wellness Guide (Floating Conversation Widget) */}
      <FloatingChat
        isOpenControlled={guideOpen}
        onOpenControlled={() => setGuideOpen(true)}
        onCloseControlled={() => setGuideOpen(false)}
        incomingPrompt={guidePrompt}
        onBookWithDoctor={() => handleStartBooking()}
        onOpenEmergency={() => setEmergencyOpen(true)}
      />

      {/* Shared Modals */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />

      <ClinicianLoginModal
        isOpen={clinicianLoginOpen}
        onClose={() => setClinicianLoginOpen(false)}
        onLoginSuccess={(user) => {
          const clinicianUser = {
            id: user.id || 'spec_1',
            name: user.name || 'Dr. Ananya Sharma',
            role: 'clinician',
            email: user.email || 'doctor@manospring.com',
            title: user.title || 'Consultant Psychiatrist (MD NIMHANS, KMC-78421)'
          };
          localStorage.setItem('manospring_user', JSON.stringify(clinicianUser));
          handleNavigate('/sessions?view=clinician', 'sessions');
        }}
      />

      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        specialist={selectedSpecialist}
        onEnterRoom={(roomId) => handleJoinConsultation(roomId)}
      />

      <SpecialistBioModal
        isOpen={!!selectedBioSpecialist}
        onClose={() => setSelectedBioSpecialist(null)}
        specialist={selectedBioSpecialist}
        onBook={(spec) => {
          setSelectedBioSpecialist(null);
          handleStartBooking(spec);
        }}
      />

      <PrivacyRequestModal
        isOpen={privacyRequestOpen}
        onClose={() => setPrivacyRequestOpen(false)}
      />

      <PrivacyModal
        isOpen={privacyPolicyOpen}
        onClose={() => setPrivacyPolicyOpen(false)}
      />

      <TermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
