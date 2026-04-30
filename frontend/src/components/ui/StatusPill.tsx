import type { ReactNode } from 'react';
import { cn } from './cn';

export type StatusKind = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent';

interface StatusPillProps {
  status: StatusKind;
  children: ReactNode;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const COLOR: Record<StatusKind, { bg: string; text: string; dot: string }> = {
  success: { bg: 'bg-success-soft', text: 'text-success', dot: 'bg-success' },
  warning: { bg: 'bg-warning-soft', text: 'text-warning', dot: 'bg-warning' },
  error: { bg: 'bg-error-soft', text: 'text-error', dot: 'bg-error' },
  info: { bg: 'bg-info-soft', text: 'text-info', dot: 'bg-info' },
  neutral: { bg: 'bg-neutral-soft', text: 'text-text-secondary', dot: 'bg-neutral' },
  accent: { bg: 'bg-brand-50', text: 'text-brand-700', dot: 'bg-brand-500' },
};

export function StatusPill({
  status,
  children,
  showDot = true,
  size = 'md',
  className,
}: StatusPillProps) {
  const c = COLOR[status];
  const sz = size === 'sm' ? 'text-[11px] px-2 h-5 gap-1' : 'text-xs px-2.5 h-6 gap-1.5';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        c.bg,
        c.text,
        sz,
        className,
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', c.dot)} />}
      {children}
    </span>
  );
}
