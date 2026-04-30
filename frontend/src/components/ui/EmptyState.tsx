import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from './cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  body?: ReactNode;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, body, primaryCta, secondaryCta, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-[420px] flex-col items-center justify-center text-center py-12 px-4',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-surface-raised text-text-tertiary">
          <Icon size={20} strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-text-primary">{title}</h3>
      {body && <p className="mt-1.5 text-sm text-text-secondary">{body}</p>}
      {(primaryCta || secondaryCta) && (
        <div className="mt-5 flex items-center gap-2">
          {primaryCta}
          {secondaryCta}
        </div>
      )}
    </div>
  );
}
