import type { ReactNode } from 'react';
import { cn } from './cn';

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

interface TabsProps<T extends string> {
  items: ReadonlyArray<TabItem<T>>;
  active: T;
  onChange: (id: T) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}

export function Tabs<T extends string>({ items, active, onChange, className, variant = 'underline' }: TabsProps<T>) {
  if (variant === 'pill') {
    return (
      <div className={cn('inline-flex items-center gap-1 rounded-md bg-surface-raised p-1', className)}>
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={it.disabled}
              onClick={() => onChange(it.id)}
              className={cn(
                'px-3 h-7 rounded-[6px] text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-surface text-text-primary shadow-[var(--shadow-card)]'
                  : 'text-text-secondary hover:text-text-primary',
                it.disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {it.label}
              {it.count !== undefined && (
                <span className="ml-1.5 text-text-tertiary tabular-nums">{it.count}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn('flex items-center gap-1 border-b border-border-subtle', className)}
    >
      {items.map((it) => {
        const isActive = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={it.disabled}
            onClick={() => onChange(it.id)}
            className={cn(
              'relative h-8 px-3 text-[13px] font-medium transition-colors',
              isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
              it.disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {it.label}
              {it.count !== undefined && (
                <span className="text-text-tertiary tabular-nums">{it.count}</span>
              )}
            </span>
            <span
              className={cn(
                'absolute left-3 right-3 -bottom-px h-0.5 rounded-full transition-opacity',
                isActive ? 'bg-brand-500 opacity-100' : 'opacity-0',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
