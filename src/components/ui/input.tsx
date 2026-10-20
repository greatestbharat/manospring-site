import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-3.5 py-2.5 bg-paper-cream dark:bg-slate-800/90 border border-sage-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-brand-600 dark:focus:border-teal-500 focus:ring-2 focus:ring-brand-500/15',
          error && 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/15',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
