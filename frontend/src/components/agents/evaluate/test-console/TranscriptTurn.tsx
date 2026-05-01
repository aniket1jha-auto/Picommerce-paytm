import { Waveform, cn } from '@/components/ui';
import type { TestCallTurn } from '@/types/testCall';

interface Props {
  turn: TestCallTurn;
  startedAt: number;
  agentSeed: string;
  /** True if this turn is currently being spoken (animates waveform). */
  live?: boolean;
}

export function TranscriptTurn({ turn, startedAt, agentSeed, live }: Props) {
  if (turn.kind === 'user') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          <span>User</span>
          <span className="text-text-tertiary tabular-nums">{formatTimeOffset(startedAt)}</span>
        </div>
        <div className="rounded-md border border-border-subtle bg-surface-sunken px-3 py-2">
          <p className="text-[13.5px] leading-5 text-text-primary">{turn.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
        <Waveform seed={agentSeed} mode={live ? 'live' : 'static'} bars={4} height={10} />
        <span>Agent</span>
        <span className="text-text-tertiary tabular-nums">{formatTimeOffset(startedAt)}</span>
      </div>
      <div
        className={cn(
          'rounded-md border bg-surface px-3 py-2',
          live ? 'border-accent-live/40' : 'border-border-subtle',
        )}
      >
        <p className="text-[13.5px] leading-5 text-text-primary">{turn.text}</p>
      </div>
    </div>
  );
}

function formatTimeOffset(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
