import React from 'react';
import { Specialist } from '../../types';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '../../lib/utils';

interface SpecialistBioModalProps {
  specialist: Specialist | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (specialist: Specialist) => void;
}

export const SpecialistBioModal: React.FC<SpecialistBioModalProps> = ({
  specialist,
  isOpen,
  onClose,
  onBook
}) => {
  if (!specialist) return null;

  const displayTitle = specialist.title || specialist.role || 'Mental Health Specialist';
  const displayDegrees = specialist.degrees || specialist.qualifications || 'Recognized Clinical Qualifications';
  const displayCouncil = specialist.council || 'National Medical Commission (NMC)';
  const displayReg = specialist.regNumber || specialist.registrationNumber || 'Verified Registration';
  const specialties = Array.isArray(specialist.specialties) ? specialist.specialties : [];
  const videoFee = specialist.fees?.video || specialist.fee || 1200;
  const audioFee = specialist.fees?.audio || Math.round(videoFee * 0.85);
  const chatFee = specialist.fees?.chat || Math.round(videoFee * 0.65);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={specialist.name} maxWidth="lg">
      <div className="space-y-6">
        <div className="flex gap-4 items-start flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/80 flex items-center justify-center text-4xl shrink-0 border border-teal-100 dark:border-teal-800">
            {specialist.avatar || '👨🏽‍⚕️'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{specialist.name}</h3>
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">{displayTitle}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{displayDegrees}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-medium rounded-full border border-emerald-200 dark:border-emerald-800/60">
              <span>🏛️</span> Registered with <strong>{displayCouncil}</strong> ({displayReg})
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Clinical Background &amp; Philosophy</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{specialist.bio || 'Dedicated to evidence-based compassionate mental healthcare.'}</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Areas of Clinical Focus</h4>
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s, idx) => (
              <Badge key={idx} variant="teal" className="py-1 px-3 text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Video Session</span>
            <strong className="text-base text-teal-900 dark:text-teal-300">{formatCurrency(videoFee)}</strong>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Voice Call</span>
            <strong className="text-base text-teal-900 dark:text-teal-300">{formatCurrency(audioFee)}</strong>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Private Chat</span>
            <strong className="text-base text-teal-900 dark:text-teal-300">{formatCurrency(chatFee)}</strong>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onBook(specialist);
            }}
          >
            Book with {specialist.name.split(' ')[1] || specialist.name} →
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
