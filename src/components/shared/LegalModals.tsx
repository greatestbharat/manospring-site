import React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Privacy Policy & DPDPA Compliance" maxWidth="lg">
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <h4 className="font-bold text-slate-900">1. Data Fiduciary Commitment</h4>
        <p>Manospring Healthcare Pvt. Ltd. operates as a Data Fiduciary under the Digital Personal Data Protection Act (DPDPA 2023). Personal health data is collected solely for direct clinical care and care coordination.</p>

        <h4 className="font-bold text-slate-900">2. Encryption & Confidentiality</h4>
        <p>All video, audio, and chat consultation streams are end-to-end encrypted. We never monetize or sell personal health records to third-party advertisers or insurance aggregators.</p>

        <h4 className="font-bold text-slate-900">3. Grievance Redressal</h4>
        <p>Our Data Protection Officer can be reached directly at <strong>dpo@manospring.com</strong>. Grievances and erasure requests are processed within 72 business hours.</p>

        <div className="pt-3 text-right">
          <Button variant="primary" size="sm" onClick={onClose}>
            I Understand
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export const TermsModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Telemedicine Terms of Service" maxWidth="lg">
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <h4 className="font-bold text-slate-900">1. Telemedicine Framework</h4>
        <p>Consultations follow the Telemedicine Practice Guidelines issued by the Board of Governors / Medical Council of India (March 25, 2020).</p>

        <h4 className="font-bold text-slate-900">2. Outpatient Care Scope</h4>
        <p>Online consultations are designed for assessment, psychotherapy, and management of mild-to-moderate mental health conditions. Acute life-threatening psychiatric emergencies require physical hospital emergency department care.</p>

        <h4 className="font-bold text-slate-900">3. Prescribing Safeguards</h4>
        <p>Registered Medical Practitioners on Manospring prescribe only medications authorized under List O, A, and B of the Telemedicine Guidelines. Schedule X controlled drugs are strictly prohibited by law from online prescription.</p>

        <div className="pt-3 text-right">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
