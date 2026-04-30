/**
 * Call + transcript types — Phase 4 (D.1).
 * Spec: docs/EVAL_SPEC.md §11
 *
 * Calls reference scripts from data/mock/testCallScripts.ts (Phase 2.11). At
 * render time, the drill-down resolves the script + applies any per-call
 * `scriptOverrides` to produce the rendered transcript. This avoids
 * duplicating turn-level data across hundreds of calls in the mock.
 */

import type { TestCallToolEvent } from './testCall';

export type CallStatus =
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'abandoned'
  | 'no_answer'
  | 'busy';

export type CallOutcome = 'converted' | 'not_converted' | 'unknown';

export type CallFlagSeverity = 'low' | 'medium' | 'high';

export interface CallFlag {
  id: string;
  reason: string;
  severity: CallFlagSeverity;
  addedToFailureAnalysis: boolean;
  createdBy: string;
  createdAt: string;
}

/**
 * Per-call overrides applied to the referenced script at render time.
 * Lets us seed a "failure" call from a happy-path script without duplicating
 * all the script content.
 */
export interface CallScriptOverrides {
  /** Force a tool-call event id to a different status / error message. */
  toolCalls?: Record<
    string,
    Partial<Pick<TestCallToolEvent, 'status' | 'errorMessage' | 'output' | 'latencyMs'>>
  >;
}

export interface Call {
  id: string;                                // 'call-7f3a9'
  agentId: string;
  /** Denormalized for cheap row rendering. */
  agentName: string;
  campaignId?: string;
  campaignName?: string;
  /** Maps to a TestCallScript.id. */
  scriptId: string;
  contactPhoneMasked: string;
  startedAt: string;
  endedAt?: string;
  /** Wall duration in ms. Set on terminal status. */
  durationMs?: number;
  status: CallStatus;
  outcome: CallOutcome;
  /** Aggregate latencies across the call's agent turns. */
  latencyP50Ms: number;
  latencyP95Ms: number;
  flags: CallFlag[];
  /** Set when the call has been promoted to an eval case. */
  promotedToEvalCaseId?: string;
  scriptOverrides?: CallScriptOverrides;
  /**
   * Slug-style label categorizing why this call failed.
   * Set when status === 'failed'. Used by the Performance Review page to
   * group failures by mode and surface example calls per mode.
   * Example: 'aadhaar_otp_timeout', 'tool_error', 'agent_off_script'.
   */
  failureMode?: string;
}

/** Display metadata for a failure mode. Keep keys in sync with Call.failureMode. */
export interface FailureModeMeta {
  id: string;                                // matches Call.failureMode
  label: string;                             // human-readable
  description: string;                       // 1-line context
  /** Tool id this failure mode is rooted in (drives "tool call analysis" links). */
  rootToolId?: string;
}

/* ─── Eval types ──────────────────────────────────────────────────────── */

export type EvalCaseStatus = 'pending' | 'enabled' | 'disabled';
export type EvalCaseSource = 'manual' | 'promoted_from_call';
export type EvalRunResult = 'pass' | 'fail';

export interface EvalCase {
  id: string;
  agentId: string;
  /** Slug-style: 'kyc_aadhaar_otp_timeout'. */
  name: string;
  description: string;
  source: EvalCaseSource;
  /** When source === 'promoted_from_call'. */
  sourceCallId?: string;
  /** Mock conversation imported from the source call's transcript. */
  scriptId?: string;
  /** Per-turn input/fixed-expected mark, by turn index. */
  turnRoles?: Array<'input' | 'fixed'>;
  judgePlan: string;
  expectedOutcome:
    | { kind: 'pass_fail' }
    | { kind: 'score_threshold'; threshold: number };
  tags: string[];
  status: EvalCaseStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Result of the most recent run, if any. */
  lastRun?: {
    result: EvalRunResult;
    score?: number;
    ranAt: string;
    promptVariantId: string;
  };
}
