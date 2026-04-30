import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-text-on-accent hover:bg-brand-600 active:bg-brand-700 disabled:bg-neutral disabled:text-text-tertiary',
  secondary:
    'bg-surface-raised text-text-primary border border-border-default hover:border-border-strong disabled:opacity-50',
  tertiary:
    'bg-transparent text-text-primary hover:bg-surface-raised disabled:opacity-50',
  danger:
    'bg-error text-text-on-accent hover:opacity-90 disabled:opacity-50',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary disabled:opacity-50',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-[13px] gap-1.5',
  md: 'h-8 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-[15px] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', iconLeft, iconRight, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
});
