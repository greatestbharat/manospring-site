import React from 'react';
import { Specialist } from '../../types';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '../../lib/utils';

interface SpecialistCardProps {
  specialist: Specialist;
  onBook: (specialist: Specialist) => void;
  onViewBio: (specialist: Specialist) => void;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({
  specialist,
  onBook,
  onViewBio
}) => {
  const displayTitle = specialist.title || specialist.role || 'Mental Health Specialist';
  const displayDegrees = specialist.degrees || specialist.qualifications || 'Certified Practitioner';
  const specialtiesList = Array.isArray(specialist.specialties) ? specialist.specialties : [];
  const feeAmount = specialist.fees?.video || specialist.fee || 1200;

  return (
    <Card hover className="p-6 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex gap-3.5 items-center mb-3.5">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-100 dark:border-teal-800/80 flex items-center justify-center text-3xl shrink-0">
            {specialist.avatar || '👨🏽‍⚕️'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{specialist.name}</h3>
              <Badge variant="teal">✓ Verified</Badge>
            </div>
            <p className="text-xs font-semibold text-teal-800 dark:text-teal-300 mt-0.5 truncate">{displayTitle.split('—')[0]}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayDegrees.split('—')[0]} · {specialist.experienceYears || 5}+ yrs exp</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 my-3">
          {specialtiesList.slice(0, 3).map((s, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-0.5 bg-slate-50 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-base font-extrabold text-teal-950 dark:text-teal-200">
            {formatCurrency(feeAmount)}
          </span>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500">per 45-min video</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewBio(specialist)}>
            Bio
          </Button>
          <Button variant="primary" size="sm" onClick={() => onBook(specialist)}>
            Book ↗
          </Button>
        </div>
      </div>
    </Card>
  );
};
