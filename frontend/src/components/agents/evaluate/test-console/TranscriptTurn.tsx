import { Waveform, cn } from '@/components/ui';
import { LatencyTimeline } from './LatencyTimeline';
import { InlineKBRetrieval } from './InlineKBRetrieval';
import { InlineToolCall } from './InlineToolCall';
import type { TestCallTurn } from '@/types/testCall';

/**
 * One row of the streaming transcript. Renders user or agent turn.
 * Agent turns include footer chips for retrievals, tool calls, and
 * a compact latency timeline. The waveform pulses while the agent is
 * "speaking" (controlled by `live`).
 */

interface Props {
  turn: TestCallTurn;
  startedAt: number;                        // ms since playback start
  agentSeed: string;                        // for the waveform identity
  /** True if this turn is currently being spoken/typed (animates waveform). */
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
        {turn.intent && (
          <span className="text-text-tertiary normal-case tracking-normal font-medium">
            · {turn.intent.replace(/_/g, ' ')}
          </span>
        )}
      </div>
      <div
        className={cn(
          'rounded-md border bg-surface px-3 py-2',
          live ? 'border-accent-live/40' : 'border-border-subtle',
        )}
      >
        <p className="text-[13.5px] leading-5 text-text-primary">{turn.text}</p>
        <div className="mt-2 pt-2 border-t border-border-subtle">
          <LatencyTimeline latency={turn.latency} compact />
        </div>
      </div>
      {/* Annotations */}
      {turn.retrievals?.map((r) => <InlineKBRetrieval key={r.id} event={r} />)}
      {turn.toolCalls?.map((tc) => <InlineToolCall key={tc.id} event={tc} />)}
    </div>
  );
}

function formatTimeOffset(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
