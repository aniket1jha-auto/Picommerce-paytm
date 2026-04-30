import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from './cn';

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-md border border-border-subtle bg-surface">
      <table
        className={cn('w-full border-collapse text-sm text-text-primary', className)}
        {...rest}
      />
    </div>
  );
}

export function THead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'bg-surface text-[11px] font-semibold uppercase tracking-[0.05em] text-text-secondary',
        className,
      )}
      {...rest}
    />
  );
}

export function TBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('', className)} {...rest} />;
}

interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean;
}
export function Tr({ className, hover = true, ...rest }: TrProps) {
  return (
    <tr
      className={cn(
        'border-t border-border-subtle first:border-t-0',
        hover && 'transition-colors hover:bg-surface-raised',
        className,
      )}
      {...rest}
    />
  );
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-3 h-9 text-left font-semibold align-middle whitespace-nowrap', className)}
      {...rest}
    />
  );
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}
export function Td({ className, numeric, ...rest }: TdProps) {
  return (
    <td
      className={cn(
        'px-3 h-10 align-middle',
        numeric && 'text-right tabular-nums',
        className,
      )}
      {...rest}
    />
  );
}
