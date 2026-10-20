import React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="24/7 Crisis & Emergency Helplines (India)">
      <div className="space-y-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          If you or someone you care about is experiencing active suicidal thoughts, overwhelming distress, or immediate danger, please connect immediately with these verified, free, confidential Indian emergency services:
        </p>

        <div className="space-y-3">
          <div className="border border-brand-100 bg-brand-50/40 p-4 rounded-xl flex items-center justify-between gap-3">
            <div>
              <strong className="block text-sm text-brand-900">Tele-MANAS (Govt. of India)</strong>
              <span className="text-xs text-slate-600">24/7 National Mental Health Toll-Free Service · Multi-language</span>
            </div>
            <a href="tel:14416" className="inline-flex items-center gap-1 bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-brand-700 transition-colors">
              📞 14416
            </a>
          </div>

          <div className="border border-red-100 bg-red-50/40 p-4 rounded-xl flex items-center justify-between gap-3">
            <div>
              <strong className="block text-sm text-red-950">National Emergency Services</strong>
              <span className="text-xs text-slate-600">Immediate Police, Ambulance & Fire Response across India</span>
            </div>
            <a href="tel:112" className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-700 transition-colors">
              🚨 112
            </a>
          </div>

          <div className="border border-sage-200 bg-white p-4 rounded-xl flex items-center justify-between gap-3">
            <div>
              <strong className="block text-sm text-slate-900">Vandrevala Foundation</strong>
              <span className="text-xs text-slate-600">24/7 Crisis Counseling & Mental Health De-escalation</span>
            </div>
            <a href="tel:+919999666555" className="inline-flex items-center gap-1 border border-sage-300 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sage-50 transition-colors">
              📞 +91 9999 666 555
            </a>
          </div>

          <div className="border border-sage-200 bg-white p-4 rounded-xl flex items-center justify-between gap-3">
            <div>
              <strong className="block text-sm text-slate-900">KIRAN Helpline</strong>
              <span className="text-xs text-slate-600">Ministry of Social Justice & Empowerment Helpline (24/7)</span>
            </div>
            <a href="tel:18005990019" className="inline-flex items-center gap-1 border border-sage-300 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sage-50 transition-colors">
              📞 1800-599-0019
            </a>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Window
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
