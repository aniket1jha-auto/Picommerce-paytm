import { useState } from 'react';
import { ChevronRight, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/components/ui';
import type { TestCallToolEvent } from '@/types/testCall';

/**
 * Inline tool-call chip — appears beneath an agent turn that called a tool.
 * Status pill (success/failure), latency, expand to see input/output payload
 * as JSON.
 */

interface Props {
  event: TestCallToolEvent;
}

export function InlineToolCall({ event }: Props) {
  const [open, setOpen] = useState(false);
  const isSuccess = event.status === 'success';

  return (
    <div className="ml-3 mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border bg-surface',
          'px-2 h-6 text-[11px] hover:border-border-default transition-colors',
          isSuccess ? 'border-border-subtle text-text-secondary hover:text-text-primary' : 'border-error/40 text-error hover:text-error',
        )}
      >
        <Wrench size={11} className={cn(isSuccess ? 'text-warning' : 'text-error')} />
        <span className="font-mono text-text-primary">{event.toolName}</span>
        {isSuccess ? (
          <span className="inline-flex items-center gap-1 text-success">
            <CheckCircle2 size={10} />
            success
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-error">
            <AlertTriangle size={10} />
            {event.errorMessage ? 'error' : 'failed'}
          </span>
        )}
        <span className="text-text-tertiary tabular-nums">· {event.latencyMs}ms</span>
        <ChevronRight
          size={11}
          className={cn('transition-transform', open && 'rotate-90')}
        />
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
          <PayloadBlock label="Input" data={event.input} />
          {isSuccess ? (
            <PayloadBlock label="Output" data={event.output ?? null} />
          ) : (
            <div className="rounded-md border border-error/30 bg-error/5 p-2 text-[12px] text-error">
              <div className="font-semibold mb-1">Error</div>
              <div className="font-mono text-[11px] leading-5">
                {event.errorMessage ?? 'Tool failed without a message.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PayloadBlock({ label, data }: { label: string; data: unknown }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-sunken p-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-tertiary mb-1">
        {label}
      </div>
      <pre className="text-[11px] leading-[16px] font-mono text-text-mono whitespace-pre-wrap break-words">
        {data === null || data === undefined ? '—' : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
