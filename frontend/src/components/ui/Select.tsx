import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && <label htmlFor={selectId} className="label">{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={cn('input-field', error && 'border-red-400', className)}
          {...props}
        >
          {children}
        </select>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
