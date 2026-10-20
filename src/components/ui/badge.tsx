import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'verified' | 'amber' | 'slate' | 'teal';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  className
}) => {
  const variants = {
    green: 'bg-brand-50 dark:bg-emerald-950/60 text-brand-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40',
    verified: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-700/50',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-transparent dark:border-amber-800/40',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-700',
    teal: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200/60 dark:border-teal-700/50'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
