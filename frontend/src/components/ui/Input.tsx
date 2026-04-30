import { forwardRef } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: string;
}

const baseField =
  'w-full bg-surface-sunken border border-border-default rounded-md px-3 text-sm text-text-primary placeholder:text-text-tertiary ' +
  'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-100)] transition-colors ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, error, className, id, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[12px] font-medium text-text-secondary">{label}</span>
      )}
      <input
        id={fieldId}
        ref={ref}
        className={cn(baseField, 'h-8', error && 'border-error focus:ring-error/20', className)}
        {...rest}
      />
      {(helper || error) && (
        <span
          className={cn(
            'text-[11px]',
            error ? 'text-error' : 'text-text-tertiary',
          )}
        >
          {error ?? helper}
        </span>
      )}
    </label>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helper, error, className, ...rest },
  ref,
) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[12px] font-medium text-text-secondary">{label}</span>
      )}
      <textarea
        ref={ref}
        className={cn(
          baseField,
          'py-2 leading-5 min-h-[88px] resize-y',
          error && 'border-error focus:ring-error/20',
          className,
        )}
        {...rest}
      />
      {(helper || error) && (
        <span
          className={cn(
            'text-[11px]',
            error ? 'text-error' : 'text-text-tertiary',
          )}
        >
          {error ?? helper}
        </span>
      )}
    </label>
  );
});
