import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  Wrench,
  Sparkles,
  Flag as FlagIcon,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { mockCalls } from '@/data/mock/calls';
import {
  computeDailyKPIs,
  computeFailureModes,
  computeToolCallStats,
  computePromptEnhancementTeasers,
  recentFlaggedCalls,
  deltaPct,
  type FailureModeRollup,
  type ToolCallStat,
  type PromptEnhancementTeaser,
} from '@/utils/performanceAggregations';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusPill, cn } from '@/components/ui';
import { formatTimeAgoShort } from '@/utils/formatRelative';
import type { Call } from '@/types/call';

/**
 * Performance Review — Phase 4 (D.1.5 refactor)
 *
 * Pivoted from the live cycling-calls dashboard ("monitoring as toy") to a
 * Growth-Manager-shaped morning review. The persona opens this page to:
 *   - check yesterday's results
 *   - see what failed and why (with example calls)
 *   - act on prompt-enhancement opportunities
 *   - inspect tool-call hotspots
 *   - review flagged calls
 *
 * No live event stream. No "Connected" status pills cycling every 1.6s.
 * Every panel links to a real call drill-down so the Growth Manager can
 * verify and act.
 */

export function Monitoring() {
  const kpis = useMemo(() => computeDailyKPIs(mockCalls), []);
  const failures = useMemo(() => computeFailureModes(7), []);
  const toolStats = useMemo(() => computeToolCallStats(7), []);
  const enhancements = useMemo(() => computePromptEnhancementTeasers(), []);
  const flagged = useMemo(() => recentFlaggedCalls(5), []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Performance"
        subtitle="Yesterday's results, today's failures, and what to act on next."
      />

      {/* ── Today's snapshot ──────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Today" hint="Compared to yesterday" />
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiTile
            label="Calls"
            value={kpis.todayCalls}
            previous={kpis.yesterdayCalls}
            icon={PhoneCall}
            tone="accent"
            invertDelta={false}
          />
          <KpiTile
            label="Successful"
            value={kpis.todaySuccessful}
            previous={kpis.yesterdaySuccessful}
            icon={CheckCircle2}
            tone="success"
            invertDelta={false}
          />
          <KpiTile
            label="Failures"
            value={kpis.todayFailures}
            previous={kpis.yesterdayFailures}
            icon={XCircle}
            tone={kpis.todayFailures > kpis.yesterdayFailures ? 'error' : 'neutral'}
            invertDelta
          />
          <KpiTile
            label="Avg p95 latency"
            value={kpis.todayAvgP95 > 0 ? `${kpis.todayAvgP95}ms` : '—'}
            rawValue={kpis.todayAvgP95}
            previous={kpis.yesterdayAvgP95}
            icon={Clock}
            tone="info"
            invertDelta
          />
        </div>
      </section>

      {/* ── Failure modes (last 7 days) ───────────────────────────────── */}
      <section>
        <SectionHeader
          title="Top failure modes"
          hint="Last 7 days · grouped by what went wrong"
        />
        {failures.length === 0 ? (
          <EmptyPanel icon={CheckCircle2} body="No failures this week. Nice." />
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {failures.map((f) => (
              <FailureModeCard key={f.meta.id} rollup={f} />
            ))}
          </div>
        )}
      </section>

      {/* ── Tool call analysis ─────────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Tool call analysis"
          hint="Last 7 days · invocations and failure rate per tool"
        />
        {toolStats.length === 0 ? (
          <EmptyPanel icon={Wrench} body="No tool invocations recorded yet." />
        ) : (
          <div className="mt-3 rounded-md border border-border-subtle bg-surface overflow-hidden">
            {toolStats.map((s, i) => (
              <ToolStatRow key={s.toolId} stat={s} divider={i > 0} />
            ))}
          </div>
        )}
      </section>

      {/* ── Prompt enhancement opportunities (D.2 stub) ───────────────── */}
      <section>
        <SectionHeader
          title="Prompt enhancement opportunities"
          hint="Auto-suggested from failure patterns"
        />
        {enhancements.length === 0 ? (
          <EmptyPanel
            icon={Sparkles}
            body="No suggestions yet — failures are too varied to cluster."
          />
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {enhancements.map((pe) => (
              <PromptEnhancementCard key={pe.id} item={pe} />
            ))}
          </div>
        )}
      </section>

      {/* ── Flagged calls ────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Recently flagged" hint="Calls flagged by you or your team" />
        {flagged.length === 0 ? (
          <EmptyPanel icon={FlagIcon} body="No flagged calls in the last 7 days." />
        ) : (
          <div className="mt-3 rounded-md border border-border-subtle bg-surface overflow-hidden">
            {flagged.map((c, i) => (
              <FlaggedCallRow key={c.id} call={c} divider={i > 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── Section header ───────────────────────────────────────────────────── */

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-[14px] font-semibold text-text-primary">{title}</h2>
      {hint && <span className="text-[11px] text-text-tertiary">{hint}</span>}
    </div>
  );
}

/* ─── KPI tile ─────────────────────────────────────────────────────────── */

interface KpiTileProps {
  label: string;
  value: string | number;
  rawValue?: number;
  previous: number;
  icon: typeof PhoneCall;
  tone: 'accent' | 'success' | 'error' | 'info' | 'neutral';
  /** When true, deltas read inversely — e.g. failures going up is bad. */
  invertDelta: boolean;
}

const TONE_CLASSES: Record<KpiTileProps['tone'], string> = {
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  error: 'bg-error-soft text-error',
  info: 'bg-info-soft text-info',
  neutral: 'bg-neutral-soft text-text-secondary',
};

function KpiTile({ label, value, rawValue, previous, icon: Icon, tone, invertDelta }: KpiTileProps) {
  const current = typeof rawValue === 'number' ? rawValue : typeof value === 'number' ? value : 0;
  const pct = deltaPct(current, previous);
  let DeltaIcon = Minus;
  let deltaTone = 'text-text-tertiary';
  if (pct !== null && Math.abs(pct) > 0.5) {
    const isUp = pct > 0;
    const isGood = invertDelta ? !isUp : isUp;
    DeltaIcon = isUp ? ArrowUpRight : ArrowDownRight;
    deltaTone = isGood ? 'text-success' : 'text-error';
  }
  return (
    <div className="rounded-md border border-border-subtle bg-surface p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
          {label}
        </span>
        <span className={cn('flex h-5 w-5 items-center justify-center rounded-md', TONE_CLASSES[tone])}>
          <Icon size={11} />
        </span>
      </div>
      <div className="text-[24px] font-semibold text-text-primary tabular-nums">{value}</div>
      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-text-secondary tabular-nums">
        <DeltaIcon size={11} className={deltaTone} />
        <span className={deltaTone}>
          {pct === null ? '—' : `${Math.abs(pct).toFixed(1)}%`}
        </span>
        <span>vs yesterday</span>
      </div>
    </div>
  );
}

/* ─── Failure mode card ───────────────────────────────────────────────── */

function FailureModeCard({ rollup }: { rollup: FailureModeRollup }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning shrink-0" />
            <span className="text-[14px] font-semibold text-text-primary truncate">
              {rollup.meta.label}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-text-secondary">
            {rollup.meta.description}
          </p>
        </div>
        <span className="rounded-full bg-error-soft px-2 h-6 inline-flex items-center text-[11px] font-medium text-error tabular-nums shrink-0">
          {rollup.count} call{rollup.count === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle">
        <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary mb-1.5">
          Example calls
        </div>
        <div className="flex flex-col gap-1">
          {rollup.exampleCalls.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              to={`/monitoring/calls/${c.id}`}
              className="group flex items-center justify-between gap-2 rounded px-2 py-1 text-[12px] text-text-primary hover:bg-surface-raised"
            >
              <span className="truncate inline-flex items-center gap-2">
                <span className="font-medium">{c.agentName}</span>
                <span className="text-text-tertiary">·</span>
                <span className="text-text-secondary">{c.contactPhoneMasked}</span>
              </span>
              <span className="shrink-0 inline-flex items-center gap-1 text-text-tertiary group-hover:text-accent">
                {formatTimeAgoShort(c.startedAt)}
                <ChevronRight size={11} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Tool stat row ───────────────────────────────────────────────────── */

function ToolStatRow({ stat, divider }: { stat: ToolCallStat; divider: boolean }) {
  const failurePct = stat.failureRate * 100;
  const isFailing = stat.failures > 0;
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        divider && 'border-t border-border-subtle',
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning-soft text-warning shrink-0">
        <Wrench size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-text-primary truncate">
          {stat.toolName}
          <span className="ml-2 text-[11px] font-normal text-text-tertiary">
            {stat.toolId}
          </span>
        </div>
        <div className="mt-0.5 text-[11px] text-text-secondary tabular-nums">
          {stat.invocations} invocation{stat.invocations === 1 ? '' : 's'} ·{' '}
          <span className={isFailing ? 'text-error font-medium' : ''}>
            {stat.failures} failed
          </span>
          {isFailing && (
            <span className={cn('ml-1', failurePct > 5 ? 'text-error' : 'text-warning')}>
              ({failurePct.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>
      {stat.exampleFailedCallIds.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {stat.exampleFailedCallIds.map((id) => (
            <Link
              key={id}
              to={`/monitoring/calls/${id}`}
              className="rounded-full border border-border-subtle bg-surface-raised px-2 h-6 inline-flex items-center text-[11px] text-text-primary hover:border-accent gap-1 font-mono"
              title="Example failed call"
            >
              {id.slice(-5)}
              <ExternalLink size={9} className="text-text-tertiary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Prompt enhancement card ─────────────────────────────────────────── */

function PromptEnhancementCard({ item }: { item: PromptEnhancementTeaser }) {
  const sevTone =
    item.severity === 'high'
      ? { kind: 'error' as const, label: 'High' }
      : item.severity === 'medium'
        ? { kind: 'warning' as const, label: 'Medium' }
        : { kind: 'neutral' as const, label: 'Low' };
  return (
    <div className="rounded-md border border-border-subtle bg-surface p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles size={12} className="text-accent shrink-0" />
          <span className="text-[13px] font-semibold text-text-primary line-clamp-2">
            {item.title}
          </span>
        </div>
        <StatusPill status={sevTone.kind} size="sm" showDot={false}>
          {sevTone.label}
        </StatusPill>
      </div>

      <p className="text-[12px] text-text-secondary leading-5">{item.rationale}</p>

      <div className="flex items-center justify-between pt-2 mt-1 border-t border-border-subtle">
        <Link
          to={`/agents/${item.agentId}`}
          className="text-[11px] text-text-tertiary hover:text-text-primary inline-flex items-center gap-1"
        >
          {item.agentName}
        </Link>
        <div className="flex items-center gap-1">
          {item.exampleCallIds.slice(0, 2).map((id) => (
            <Link
              key={id}
              to={`/monitoring/calls/${id}`}
              className="rounded-full bg-surface-sunken px-1.5 h-5 inline-flex items-center text-[10px] font-mono text-text-secondary hover:bg-accent-soft hover:text-accent"
              title="Open example call"
            >
              {id.slice(-4)}
            </Link>
          ))}
        </div>
      </div>

      <Link
        to={item.detailsHref}
        className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline self-start"
      >
        Open enhancement queue
        <ChevronRight size={11} />
      </Link>
    </div>
  );
}

/* ─── Flagged call row ─────────────────────────────────────────────────── */

function FlaggedCallRow({ call, divider }: { call: Call; divider: boolean }) {
  const flag = call.flags[0];
  return (
    <Link
      to={`/monitoring/calls/${call.id}`}
      className={cn(
        'flex items-center gap-3 px-4 py-3 hover:bg-surface-raised transition-colors',
        divider && 'border-t border-border-subtle',
      )}
    >
      <FlagIcon size={14} className="text-warning shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-text-primary truncate">
          {call.agentName}
          <span className="ml-2 text-[11px] font-normal text-text-tertiary">
            {call.contactPhoneMasked}
          </span>
        </div>
        {flag && (
          <div className="mt-0.5 text-[11px] text-text-secondary truncate">
            {flag.reason}
          </div>
        )}
      </div>
      <span className="text-[11px] text-text-tertiary shrink-0">
        {formatTimeAgoShort(call.startedAt)}
      </span>
      <ChevronRight size={12} className="text-text-tertiary shrink-0" />
    </Link>
  );
}

/* ─── Empty panel ──────────────────────────────────────────────────────── */

function EmptyPanel({ icon: Icon, body }: { icon: typeof PhoneCall; body: string }) {
  return (
    <div className="mt-3 rounded-md border border-dashed border-border-default bg-surface-sunken p-6 text-center">
      <Icon size={16} className="mx-auto mb-2 text-text-tertiary" />
      <p className="text-[13px] text-text-secondary">{body}</p>
    </div>
  );
}
