import { cn } from '@/components/ui';
import type { TurnLatency } from '@/types/testCall';
import { totalLatencyMs } from '@/types/testCall';

/**
 * Horizontal latency-timeline bars per phase: ASR → LLM → KB → TOOL → TTS.
 * Phase widths are proportional to actual ms. Used inline within an agent
 * turn footer and in the right-pane vital-signs panel.
 */

interface Props {
  latency: TurnLatency;
  /** Highlight one phase (used during live streaming). */
  activePhase?: 'asr' | 'llm' | 'kb' | 'tool' | 'tts' | null;
  className?: string;
  /** Compact = no labels, single line. Used inline. */
  compact?: boolean;
}

const PHASES = [
  { key: 'asr', label: 'ASR', tone: 'bg-info' },
  { key: 'llm', label: 'LLM', tone: 'bg-accent' },
  { key: 'kb', label: 'KB', tone: 'bg-accent-live' },
  { key: 'tool', label: 'TOOL', tone: 'bg-warning' },
  { key: 'tts', label: 'TTS', tone: 'bg-success' },
] as const;

export function LatencyTimeline({ latency, activePhase, className, compact }: Props) {
  const total = totalLatencyMs(latency);
  if (total === 0) return null;

  const segments = PHASES.map((p) => {
    const value =
      p.key === 'asr'
        ? latency.asrMs
        : p.key === 'llm'
        ? latency.llmMs
        : p.key === 'kb'
        ? latency.kbMs ?? 0
        : p.key === 'tool'
        ? latency.toolMs ?? 0
        : latency.ttsMs;
    const pct = total === 0 ? 0 : (value / total) * 100;
    return { ...p, value, pct };
  }).filter((s) => s.value > 0);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-surface-sunken">
        {segments.map((s) => (
          <div
            key={s.key}
            className={cn(
              s.tone,
              'h-full transition-opacity',
              activePhase && activePhase !== s.key && 'opacity-50',
            )}
            style={{ width: `${s.pct}%` }}
            title={`${s.label} ${s.value}ms`}
          />
        ))}
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-secondary">
          {segments.map((s) => (
            <span
              key={s.key}
              className={cn(
                'inline-flex items-center gap-1 tabular-nums',
                activePhase === s.key && 'text-text-primary font-medium',
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', s.tone)} />
              {s.label} {s.value}ms
            </span>
          ))}
          <span className="ml-auto tabular-nums text-text-tertiary">total {total}ms</span>
        </div>
      )}
    </div>
  );
}
