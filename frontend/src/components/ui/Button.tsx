import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  amber: 'btn-amber',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-50 text-red-600 font-display font-semibold text-sm hover:bg-red-100 transition-all duration-150 min-h-[44px]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs min-h-[36px]',
  md: '',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
