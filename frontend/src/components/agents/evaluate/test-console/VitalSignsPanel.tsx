import { useMemo } from 'react';
import { Activity, Wrench, BookOpen } from 'lucide-react';
import { LatencyTimeline } from './LatencyTimeline';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { cn } from '@/components/ui';
import type {
  TestCallAgentTurn,
  TestCallTurn,
} from '@/types/testCall';
import { totalLatencyMs } from '@/types/testCall';

/**
 * Right-pane vital signs while a test call is in flight.
 * Shows the active phase, the current agent turn's latency timeline,
 * running counts, and rolling p50/p95.
 */

interface Props {
  /** Current agent turn — null when no agent turn is active. */
  currentAgentTurn: TestCallAgentTurn | null;
  /** All turns revealed so far (used for running counts and aggregate latency). */
  revealedTurns: TestCallTurn[];
  phase: string;
  elapsedMs: number;
}

export function VitalSignsPanel({ currentAgentTurn, revealedTurns, phase, elapsedMs }: Props) {
  const knowledgeBases = useKnowledgeBaseStore((s) => s.knowledgeBases);

  const stats = useMemo(() => {
    const agentTurns = revealedTurns.filter((t): t is TestCallAgentTurn => t.kind === 'agent');
    const totalLatencies = agentTurns.map((t) => totalLatencyMs(t.latency)).sort((a, b) => a - b);
    const p50 = percentile(totalLatencies, 0.5);
    const p95 = percentile(totalLatencies, 0.95);
    const retrievalCount = agentTurns.reduce((s, t) => s + (t.retrievals?.length ?? 0), 0);
    const toolCallCount = agentTurns.reduce((s, t) => s + (t.toolCalls?.length ?? 0), 0);
    return { p50, p95, retrievalCount, toolCallCount, agentTurnCount: agentTurns.length };
  }, [revealedTurns]);

  const activePhaseKey = useMemo(() => {
    // Map the player's phase string to the latency-timeline phase key.
    if (phase !== 'agent-thinking' || !currentAgentTurn) return null;
    // During agent-thinking, scrub through phases proportional to elapsedMs in turn —
    // for now, surface the last non-zero phase we'd "still be in" given the script.
    // Simple model: highlight LLM during thinking unless tool/kb were declared.
    if (currentAgentTurn.toolCalls?.length) return 'tool';
    if (currentAgentTurn.retrievals?.length) return 'kb';
    return 'llm';
  }, [phase, currentAgentTurn]);

  const activeKBs = currentAgentTurn?.retrievals?.map((r) =>
    knowledgeBases.find((kb) => kb.id === r.knowledgeBaseId),
  ).filter(Boolean) ?? [];

  const activeTools = currentAgentTurn?.toolCalls ?? [];

  return (
    <aside className="flex flex-col gap-3">
      {/* Now */}
      <div className="rounded-md border border-border-subtle bg-surface p-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            Now
          </div>
          <span className="text-[11px] tabular-nums text-text-tertiary">
            {formatElapsed(elapsedMs)}
          </span>
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2 h-6 text-[12px] text-accent">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full bg-accent',
              phase !== 'idle' && 'animate-[pi-pulse_1.4s_ease-in-out_infinite]',
            )}
          />
          {humanizePhase(phase)}
        </div>
      </div>

      {/* Latency — current turn */}
      {currentAgentTurn && (
        <div className="rounded-md border border-border-subtle bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-2">
            Latency · current turn
          </div>
          <LatencyTimeline latency={currentAgentTurn.latency} activePhase={activePhaseKey} />
        </div>
      )}

      {/* Active KBs */}
      {activeKBs.length > 0 && (
        <div className="rounded-md border border-border-subtle bg-surface p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-2">
            <BookOpen size={11} className="text-accent-live" />
            Knowledge sources hit
          </div>
          <div className="flex flex-col gap-1">
            {activeKBs.map((kb) => (
              <div key={kb!.id} className="text-[12px] text-text-primary">
                {kb!.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active tools */}
      {activeTools.length > 0 && (
        <div className="rounded-md border border-border-subtle bg-surface p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-2">
            <Wrench size={11} className="text-warning" />
            Tools called
          </div>
          <div className="flex flex-col gap-1">
            {activeTools.map((t) => (
              <div key={t.id} className="text-[12px] font-mono text-text-primary">
                {t.toolName}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="rounded-md border border-border-subtle bg-surface p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-2">
          <Activity size={11} />
          Running stats
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Agent turns" value={stats.agentTurnCount} />
          <Stat label="Retrievals" value={stats.retrievalCount} />
          <Stat label="Tool calls" value={stats.toolCallCount} />
          <Stat label="p50 latency" value={`${stats.p50}ms`} mono />
          <Stat label="p95 latency" value={`${stats.p95}ms`} mono className="col-span-2" />
        </div>
      </div>
    </aside>
  );
}

function Stat({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">{label}</span>
      <span
        className={cn(
          'text-[14px] text-text-primary tabular-nums',
          mono && 'font-mono',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function humanizePhase(phase: string): string {
  switch (phase) {
    case 'user-typing': return 'User speaking';
    case 'agent-thinking': return 'Agent thinking';
    case 'agent-speaking': return 'Agent speaking';
    case 'settled': return 'Listening';
    case 'idle': return 'Idle';
    default: return phase;
  }
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return Math.round(sorted[idx]);
}

/* Pulse keyframe for the active-phase dot — registered once globally. */
const styleId = 'pi-test-console-style';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const el = document.createElement('style');
  el.id = styleId;
  el.textContent = `
@keyframes pi-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(0.85); }
}
  `.trim();
  document.head.appendChild(el);
}
