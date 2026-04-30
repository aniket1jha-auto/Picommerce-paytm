import { forwardRef } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helper, error, className, children, ...rest },
  ref,
) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[12px] font-medium text-text-secondary">{label}</span>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-8 w-full appearance-none bg-surface-sunken border border-border-default rounded-md pl-3 pr-8 text-sm text-text-primary',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-100)]',
            'disabled:opacity-50 transition-colors',
            error && 'border-error focus:ring-error/20',
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
      </div>
      {(helper || error) && (
        <span className={cn('text-[11px]', error ? 'text-error' : 'text-text-tertiary')}>
          {error ?? helper}
        </span>
      )}
    </label>
  );
});
