import { useEffect, useMemo, useRef } from 'react';
import { Play, Square, Sparkles, Lock } from 'lucide-react';
import type { Agent } from '@/types/agent';
import type { TestCallTurn, TestCallAgentTurn } from '@/types/testCall';
import { totalLatencyMs } from '@/types/testCall';
import { pickScriptForUseCase } from '@/data/mock/testCallScripts';
import { useTestCallPlayer } from '@/hooks/useTestCallPlayer';
import { Button, Waveform, cn } from '@/components/ui';
import { TranscriptTurn } from './test-console/TranscriptTurn';
import { VitalSignsPanel } from './test-console/VitalSignsPanel';

/**
 * Live Test Console — Phase 2.11
 *
 * Three states:
 *   idle    → big "Start Test Call" CTA centered, with the voice motif and a
 *             one-line description of the script that will play.
 *   running → split layout: streaming transcript (left) + vital signs (right).
 *   ended   → summary card (duration, latency p50/p95, retrievals/tool calls)
 *             with "Run again" + (disabled) "Promote to eval" surfaces.
 *
 * Real LLM / telephony are out of scope for v1. The conversation is a hand-
 * curated Paytm-themed script picked by useCase. See data/mock/testCallScripts.ts
 * and docs/EVAL_SPEC.md §3.
 */

interface Props {
  agent: Agent;
}

export function TestConsole({ agent }: Props) {
  const script = useMemo(
    () => pickScriptForUseCase(agent.config.useCase),
    [agent.config.useCase],
  );
  const player = useTestCallPlayer(script);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript as turns reveal.
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [player.revealedTurns.length, player.phase]);

  return (
    <div className="rounded-md border border-border-subtle bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle bg-surface-sunken px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Waveform
            seed={agent.id}
            mode={player.phase === 'agent-speaking' ? 'live' : 'static'}
            bars={5}
            height={14}
          />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-text-primary">Live Test Console</div>
            {player.status !== 'idle' && (
              <div className="text-[11px] text-text-secondary truncate">
                {player.status === 'running' ? 'Test call in progress' : 'Test call ended'}
              </div>
            )}
          </div>
        </div>
        <TopActions player={player} />
      </div>

      {/* Body */}
      {player.status === 'idle' && <IdleView onStart={player.start} />}
      {player.status === 'running' && (
        <RunningView
          revealedTurns={player.revealedTurns.map((r) => r.turn)}
          revealStartedAt={player.revealedTurns.map((r) => r.startedAt)}
          phase={player.phase}
          currentAgentTurn={player.currentAgentTurn}
          elapsedMs={player.elapsedMs}
          agentSeed={agent.id}
          transcriptRef={transcriptRef}
        />
      )}
      {player.status === 'ended' && (
        <EndedView
          revealedTurns={player.revealedTurns.map((r) => r.turn)}
          revealStartedAt={player.revealedTurns.map((r) => r.startedAt)}
          elapsedMs={player.elapsedMs}
          agentSeed={agent.id}
          onRunAgain={player.start}
        />
      )}
    </div>
  );
}

/* ─── Header actions ───────────────────────────────────────────────────── */

function TopActions({ player }: { player: ReturnType<typeof useTestCallPlayer> }) {
  if (player.status === 'running') {
    return (
      <Button variant="danger" size="sm" iconLeft={<Square size={12} />} onClick={player.stop}>
        End call
      </Button>
    );
  }
  if (player.status === 'ended') {
    return (
      <Button variant="primary" size="sm" iconLeft={<Play size={12} />} onClick={player.start}>
        Run again
      </Button>
    );
  }
  return null;
}

/* ─── Idle ─────────────────────────────────────────────────────────────── */

function IdleView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent"
        aria-hidden
      >
        <Play size={28} />
      </div>
      <div className="text-center max-w-md">
        <h3 className="text-[15px] font-semibold text-text-primary">Talk to the agent</h3>
        <p className="mt-1 text-[13px] text-text-secondary">
          See per-turn latency, knowledge-base retrievals, and tool calls as they happen.
        </p>
      </div>
      <Button variant="primary" iconLeft={<Play size={14} />} onClick={onStart}>
        Start test call
      </Button>
    </div>
  );
}

/* ─── Running ──────────────────────────────────────────────────────────── */

interface RunningProps {
  revealedTurns: TestCallTurn[];
  revealStartedAt: number[];
  phase: ReturnType<typeof useTestCallPlayer>['phase'];
  currentAgentTurn: TestCallAgentTurn | null;
  elapsedMs: number;
  agentSeed: string;
  transcriptRef: React.RefObject<HTMLDivElement | null>;
}

function RunningView({
  revealedTurns,
  revealStartedAt,
  phase,
  currentAgentTurn,
  elapsedMs,
  agentSeed,
  transcriptRef,
}: RunningProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
      {/* Transcript */}
      <div ref={transcriptRef} className="max-h-[520px] overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {revealedTurns.length === 0 && (
          <div className="text-[12px] text-text-tertiary py-6 text-center">
            Connecting…
          </div>
        )}
        {revealedTurns.map((turn, i) => (
          <TranscriptTurn
            key={i}
            turn={turn}
            startedAt={revealStartedAt[i] ?? 0}
            agentSeed={agentSeed}
            live={i === revealedTurns.length - 1 && phase === 'agent-speaking'}
          />
        ))}
        {phase === 'user-typing' && <ThinkingIndicator label="User speaking" />}
        {phase === 'agent-thinking' && <ThinkingIndicator label="Agent thinking" />}
      </div>

      {/* Vital signs */}
      <div className="px-4 py-4">
        <VitalSignsPanel
          currentAgentTurn={currentAgentTurn}
          revealedTurns={revealedTurns}
          phase={phase}
          elapsedMs={elapsedMs}
        />
      </div>
    </div>
  );
}

function ThinkingIndicator({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 self-start text-[11px] text-text-tertiary">
      <span className="inline-flex gap-0.5">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </span>
      {label}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1 w-1 rounded-full bg-text-tertiary"
      style={{ animation: `pi-pulse 1.4s ease-in-out ${delay}ms infinite` }}
    />
  );
}

/* ─── Ended ────────────────────────────────────────────────────────────── */

interface EndedProps {
  revealedTurns: TestCallTurn[];
  revealStartedAt: number[];
  elapsedMs: number;
  agentSeed: string;
  onRunAgain: () => void;
}

function EndedView({ revealedTurns, revealStartedAt, elapsedMs, agentSeed, onRunAgain }: EndedProps) {
  const stats = useMemo(() => {
    const agentTurns = revealedTurns.filter(
      (t): t is TestCallAgentTurn => t.kind === 'agent',
    );
    const totals = agentTurns.map((t) => totalLatencyMs(t.latency)).sort((a, b) => a - b);
    const sum = totals.reduce((a, b) => a + b, 0);
    return {
      duration: elapsedMs,
      agentTurns: agentTurns.length,
      avgLatency: agentTurns.length === 0 ? 0 : Math.round(sum / agentTurns.length),
      p50: pct(totals, 0.5),
      p95: pct(totals, 0.95),
      retrievals: agentTurns.reduce((s, t) => s + (t.retrievals?.length ?? 0), 0),
      toolCalls: agentTurns.reduce((s, t) => s + (t.toolCalls?.length ?? 0), 0),
      toolFailures: agentTurns.reduce(
        (s, t) => s + (t.toolCalls?.filter((c) => c.status === 'failure').length ?? 0),
        0,
      ),
    };
  }, [revealedTurns, elapsedMs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
      {/* Transcript replay */}
      <div className="max-h-[520px] overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {revealedTurns.map((turn, i) => (
          <TranscriptTurn
            key={i}
            turn={turn}
            startedAt={revealStartedAt[i] ?? 0}
            agentSeed={agentSeed}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="px-4 py-4 flex flex-col gap-3">
        <div className="rounded-md border border-success-soft bg-success-soft px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Test call complete
          </div>
        </div>

        <div className="rounded-md border border-border-subtle bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-2">
            Summary
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <SummaryStat label="Duration" value={formatDuration(stats.duration)} />
            <SummaryStat label="Agent turns" value={stats.agentTurns} />
            <SummaryStat label="Avg latency" value={`${stats.avgLatency}ms`} mono />
            <SummaryStat label="p50 / p95" value={`${stats.p50} / ${stats.p95}ms`} mono />
            <SummaryStat label="Retrievals" value={stats.retrievals} />
            <SummaryStat
              label="Tool calls"
              value={
                <span className="inline-flex items-center gap-1">
                  {stats.toolCalls}
                  {stats.toolFailures > 0 && (
                    <span className="text-error">· {stats.toolFailures} failed</span>
                  )}
                </span>
              }
            />
          </div>
        </div>

        {/* Promote to eval — disabled, Phase 4 */}
        <div
          className={cn(
            'rounded-md border border-dashed border-border-default bg-surface-sunken p-3',
            'text-[11px] text-text-tertiary',
          )}
        >
          <div className="flex items-center gap-1.5 mb-1 text-text-secondary">
            <Sparkles size={11} className="text-accent" />
            <span className="font-medium">Promote to eval</span>
            <Lock size={10} className="ml-auto" />
          </div>
          Land in Phase 4. From any test or live call, save the transcript as a regression
          eval case for this agent. See{' '}
          <a
            href="/docs/EVAL_SPEC.md"
            className="underline hover:text-text-primary"
            onClick={(e) => e.preventDefault()}
            title="See docs/EVAL_SPEC.md"
          >
            EVAL_SPEC §3
          </a>
          .
        </div>

        <Button variant="secondary" size="md" iconLeft={<Play size={12} />} onClick={onRunAgain}>
          Run again
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary">{label}</span>
      <span
        className={cn(
          'text-[13px] text-text-primary tabular-nums',
          mono && 'font-mono',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function pct(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return Math.round(sorted[idx]);
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
