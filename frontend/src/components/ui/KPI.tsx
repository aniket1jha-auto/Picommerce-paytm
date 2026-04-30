import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from './cn';

interface KPIProps {
  label: string;
  value: ReactNode;
  delta?: number;
  deltaLabel?: string;
  trend?: 'up' | 'down' | 'flat';
  hint?: ReactNode;
  className?: string;
}

export function KPI({ label, value, delta, deltaLabel, trend, hint, className }: KPIProps) {
  const trendColor =
    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-text-tertiary';
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  return (
    <div
      className={cn(
        'bg-surface border border-border-subtle rounded-[10px] p-4 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
        {label}
      </div>
      <div className="mt-2 text-[28px] leading-9 font-semibold text-text-primary tabular-nums">
        {value}
      </div>
      {(delta !== undefined || hint) && (
        <div className="mt-2 flex items-center gap-2 text-[12px] text-text-secondary">
          {delta !== undefined && (
            <span className={cn('inline-flex items-center gap-1 font-medium', trendColor)}>
              <Icon size={12} />
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)}%
            </span>
          )}
          {deltaLabel && <span>{deltaLabel}</span>}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  );
}
