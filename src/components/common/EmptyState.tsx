import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={48} className="text-text-secondary" strokeWidth={1.5} />
      <h3 className="mt-4 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p>
      {ctaLabel && ctaHref && (
        <Link
          to={ctaHref}
          className="mt-6 inline-flex items-center rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
