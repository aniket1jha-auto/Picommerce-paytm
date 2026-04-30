/**
 * Aggregations for the Performance Review page (Phase 4 D.1.5).
 *
 * Computed from `mockCalls` + the scripts they reference. Pure functions —
 * no React, no state. Re-usable from /monitoring and from per-agent failure
 * analysis pages (D.2).
 */

import type { Call, FailureModeMeta } from '@/types/call';
import type { TestCallAgentTurn, TestCallScript } from '@/types/testCall';
import { totalLatencyMs } from '@/types/testCall';
import { mockCalls, failureModeCatalog } from '@/data/mock/calls';
import { testCallScripts } from '@/data/mock/testCallScripts';
import { ALL_TOOLS } from '@/data/toolConstants';

/* ─── Time helpers ───────────────────────────────────────────────────── */

const DAY_MS = 24 * 60 * 60 * 1000;

function isWithinHoursOf(iso: string, fromMs: number, toMs: number): boolean {
  const t = new Date(iso).getTime();
  return t >= fromMs && t < toMs;
}

/** Anchor "today" off the most-recent call in the seed — keeps the page
 *  meaningful even if the demoer is running this on a date weeks after the
 *  mock data was cut. We aim for stable, non-empty numbers regardless. */
function dataAnchorMs(): number {
  if (mockCalls.length === 0) return Date.now();
  return Math.max(...mockCalls.map((c) => new Date(c.startedAt).getTime()));
}

export interface TimeWindow {
  todayMs: number;
  yesterdayStart: number;
  todayStart: number;
  weekStart: number;
}

export function getTimeWindow(): TimeWindow {
  const todayMs = dataAnchorMs();
  const todayStart = new Date(todayMs);
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();
  return {
    todayMs,
    todayStart: todayStartMs,
    yesterdayStart: todayStartMs - DAY_MS,
    weekStart: todayStartMs - 7 * DAY_MS,
  };
}

/* ─── Daily KPIs ─────────────────────────────────────────────────────── */

export interface DailyKPIs {
  todayCalls: number;
  yesterdayCalls: number;
  todaySuccessful: number;
  yesterdaySuccessful: number;
  todayFailures: number;
  yesterdayFailures: number;
  todayAvgP95: number;
  yesterdayAvgP95: number;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function computeDailyKPIs(calls: Call[] = mockCalls): DailyKPIs {
  const w = getTimeWindow();
  const todays = calls.filter((c) => isWithinHoursOf(c.startedAt, w.todayStart, w.todayStart + DAY_MS));
  const yest = calls.filter((c) => isWithinHoursOf(c.startedAt, w.yesterdayStart, w.todayStart));
  return {
    todayCalls: todays.length,
    yesterdayCalls: yest.length,
    todaySuccessful: todays.filter((c) => c.status === 'completed').length,
    yesterdaySuccessful: yest.filter((c) => c.status === 'completed').length,
    todayFailures: todays.filter((c) => c.status === 'failed').length,
    yesterdayFailures: yest.filter((c) => c.status === 'failed').length,
    todayAvgP95: avg(todays.map((c) => c.latencyP95Ms)),
    yesterdayAvgP95: avg(yest.map((c) => c.latencyP95Ms)),
  };
}

export function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/* ─── Failure-mode rollup (last 7 days) ───────────────────────────────── */

export interface FailureModeRollup {
  meta: FailureModeMeta;
  count: number;
  /** Calls grouped under this mode in window. Newest first. */
  exampleCalls: Call[];
  /** Subset of exampleCalls that are still un-promoted (good targets for promote-to-eval). */
  unpromotedExamples: Call[];
}

export function computeFailureModes(
  windowDays = 7,
  calls: Call[] = mockCalls,
): FailureModeRollup[] {
  const w = getTimeWindow();
  const start = w.todayStart - (windowDays - 1) * DAY_MS;
  const end = w.todayStart + DAY_MS;
  const windowed = calls.filter(
    (c) => c.status === 'failed' && isWithinHoursOf(c.startedAt, start, end),
  );

  const buckets: Record<string, Call[]> = {};
  for (const c of windowed) {
    const mode = c.failureMode ?? 'tool_error';
    (buckets[mode] ??= []).push(c);
  }

  return failureModeCatalog
    .map((meta) => {
      const examples = (buckets[meta.id] ?? []).sort((a, b) =>
        b.startedAt.localeCompare(a.startedAt),
      );
      return {
        meta,
        count: examples.length,
        exampleCalls: examples.slice(0, 5),
        unpromotedExamples: examples.filter((c) => !c.promotedToEvalCaseId).slice(0, 3),
      };
    })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

/* ─── Tool-call analysis (last 7 days) ───────────────────────────────── */

export interface ToolCallStat {
  toolId: string;
  toolName: string;
  invocations: number;
  failures: number;
  failureRate: number;
  /** Calls where this tool likely failed (rooted via failureMode.rootToolId). */
  exampleFailedCallIds: string[];
}

const SCRIPT_BY_ID: Record<string, TestCallScript> = Object.fromEntries(
  testCallScripts.map((s) => [s.id, s]),
);

const FAILURE_MODE_TO_ROOT_TOOL: Record<string, string | undefined> = Object.fromEntries(
  failureModeCatalog.map((m) => [m.id, m.rootToolId]),
);

const TOOL_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.id, t.name]),
);

function toolIdsInScript(script: TestCallScript): string[] {
  const ids = new Set<string>();
  for (const t of script.turns) {
    if (t.kind === 'agent' && t.toolCalls) {
      for (const tc of t.toolCalls) ids.add(tc.toolId);
    }
  }
  return Array.from(ids);
}

export function computeToolCallStats(
  windowDays = 7,
  calls: Call[] = mockCalls,
): ToolCallStat[] {
  const w = getTimeWindow();
  const start = w.todayStart - (windowDays - 1) * DAY_MS;
  const end = w.todayStart + DAY_MS;
  const windowed = calls.filter((c) => isWithinHoursOf(c.startedAt, start, end));

  const stats = new Map<
    string,
    { invocations: number; failures: number; exampleFailed: string[] }
  >();

  for (const call of windowed) {
    const script = SCRIPT_BY_ID[call.scriptId];
    if (!script) continue;
    const ids = toolIdsInScript(script);
    for (const toolId of ids) {
      const s = stats.get(toolId) ?? { invocations: 0, failures: 0, exampleFailed: [] };
      s.invocations += 1;
      stats.set(toolId, s);
    }

    if (call.status === 'failed' && call.failureMode) {
      const rootTool = FAILURE_MODE_TO_ROOT_TOOL[call.failureMode];
      if (rootTool && ids.includes(rootTool)) {
        const s = stats.get(rootTool)!;
        s.failures += 1;
        if (s.exampleFailed.length < 3) s.exampleFailed.push(call.id);
      }
    }
  }

  return Array.from(stats.entries())
    .map(([toolId, s]) => ({
      toolId,
      toolName: TOOL_NAME_BY_ID[toolId] ?? toolId,
      invocations: s.invocations,
      failures: s.failures,
      failureRate: s.invocations === 0 ? 0 : s.failures / s.invocations,
      exampleFailedCallIds: s.exampleFailed,
    }))
    .sort((a, b) => {
      // Sort by failures desc, then invocations desc.
      if (b.failures !== a.failures) return b.failures - a.failures;
      return b.invocations - a.invocations;
    });
}

/* ─── Flagged calls (last 7 days) ────────────────────────────────────── */

export function recentFlaggedCalls(limit = 5, calls: Call[] = mockCalls): Call[] {
  return calls
    .filter((c) => c.flags.length > 0)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit);
}

/* ─── Worst-latency turn helper (used in drill-down) ─────────────────── */

export function worstLatencyTurnInScript(script: TestCallScript): TestCallAgentTurn | null {
  return script.turns
    .filter((t): t is TestCallAgentTurn => t.kind === 'agent')
    .reduce<TestCallAgentTurn | null>((acc, t) => {
      if (!acc) return t;
      return totalLatencyMs(t.latency) > totalLatencyMs(acc.latency) ? t : acc;
    }, null);
}

/* ─── Prompt-enhancement teasers (mocked for Phase 4 D.1.5) ──────────── */
/* D.2 will replace this with a real per-agent feed. For the Performance
 * Review page we synthesize 2-3 high-signal suggestions from the failure
 * rollup so the page links to *real example calls*, not lorem ipsum. */

export interface PromptEnhancementTeaser {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  /** Why this surfaced — references a real failure mode. */
  rationale: string;
  exampleCallIds: string[];
  /** Stub link target (Phase 4 D.2 will replace with the real PE queue page). */
  detailsHref: string;
}

export function computePromptEnhancementTeasers(): PromptEnhancementTeaser[] {
  const rollups = computeFailureModes();
  const out: PromptEnhancementTeaser[] = [];

  for (const r of rollups.slice(0, 3)) {
    if (r.count === 0) continue;
    const sample = r.exampleCalls[0];
    if (!sample) continue;
    const severity: 'high' | 'medium' | 'low' = r.count >= 4 ? 'high' : r.count >= 2 ? 'medium' : 'low';
    out.push({
      id: `pe-${r.meta.id}`,
      agentId: sample.agentId,
      agentName: sample.agentName,
      title: titleForFailureMode(r.meta.id),
      severity,
      rationale: `${r.count} call${r.count === 1 ? '' : 's'} in the last 7 days hit "${r.meta.label}". Suggest tightening the agent's response when this fires.`,
      exampleCallIds: r.exampleCalls.slice(0, 3).map((c) => c.id),
      detailsHref: `/agents/${sample.agentId}/prompt-enhancements`,
    });
  }

  return out;
}

function titleForFailureMode(modeId: string): string {
  switch (modeId) {
    case 'aadhaar_otp_timeout':
      return 'Add fallback handling for Aadhaar OTP timeouts';
    case 'transfer_unavailable':
      return "Handle saturated transfer queue gracefully";
    case 'agent_off_script':
      return 'Tighten guardrails when customers object';
    case 'tool_error':
      return 'Generic tool error recovery';
    default:
      return `Improve handling of ${modeId.replace(/_/g, ' ')}`;
  }
}
