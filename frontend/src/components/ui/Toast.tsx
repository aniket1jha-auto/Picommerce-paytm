import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from './cn';

export type ToastKind = 'success' | 'warning' | 'error' | 'info';

interface ToastInput {
  kind?: ToastKind;
  title: string;
  body?: string;
  durationMs?: number;
}

interface ToastEntry extends ToastInput {
  id: string;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const Ctx = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastEntry[]>([]);
  const counter = useRef(0);

  const toast = useCallback((input: ToastInput) => {
    const id = `t-${++counter.current}`;
    setItems((s) => [...s, { ...input, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((s) => s.filter((i) => i.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-5 bottom-5 z-[60] flex flex-col gap-2">
        {items.map((it) => (
          <ToastCard key={it.id} item={it} onDismiss={() => dismiss(it.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastEntry; onDismiss: () => void }) {
  useEffect(() => {
    if (item.kind === 'error') return;
    const t = setTimeout(onDismiss, item.durationMs ?? 5000);
    return () => clearTimeout(t);
  }, [item, onDismiss]);

  const Icon = ICONS[item.kind ?? 'info'];
  const tone = TONE[item.kind ?? 'info'];
  return (
    <div
      className={cn(
        'pointer-events-auto flex w-[340px] items-start gap-3 rounded-md border bg-surface-raised p-3 shadow-[var(--shadow-popover)]',
        'border-border-subtle',
      )}
    >
      <Icon size={18} className={tone} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-primary">{item.title}</div>
        {item.body && <div className="mt-0.5 text-[13px] text-text-secondary">{item.body}</div>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-text-tertiary hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const TONE = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      toast: (input: ToastInput) => {
        if (typeof console !== 'undefined') {
          console.warn('[ToastProvider missing]', input.title);
        }
      },
    };
  }
  return ctx;
}
