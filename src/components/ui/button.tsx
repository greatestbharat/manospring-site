import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'soft' | 'outline' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5',
    soft: 'bg-brand-50 dark:bg-teal-950/60 text-brand-800 dark:text-teal-200 hover:bg-brand-100 dark:hover:bg-teal-900/60',
    outline: 'border border-sage-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-brand-600 dark:hover:border-teal-400 hover:text-brand-600 dark:hover:text-teal-400 shadow-xs',
    subtle: 'text-slate-600 dark:text-slate-400 hover:text-brand-700 dark:hover:text-teal-300 hover:bg-brand-50/50 dark:hover:bg-slate-800',
    danger: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-600 hover:text-white'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
