import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border-subtle rounded-[10px] shadow-[var(--shadow-card)]',
        'p-5',
        interactive &&
          'transition-colors hover:border-border-default focus-within:border-brand-500 cursor-pointer',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-3 flex items-start justify-between gap-3', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-[16px] font-semibold text-text-primary', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardSubtitle({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-[13px] text-text-secondary', className)} {...rest}>
      {children}
    </div>
  );
}
