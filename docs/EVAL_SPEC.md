# EVAL_SPEC — Agent observability, evaluation, prompt enhancement, failure analysis

**Date:** 2026-04-28
**Companion docs:** [decisions/0004-eval-architecture.md](decisions/0004-eval-architecture.md), [DEMO_FLOW.md](DEMO_FLOW.md), [KB_SPEC.md](KB_SPEC.md), [IA.md](IA.md)

> The eval / observability story is the most polished part of the app — that's the success criterion (brief §15). The single best UX idea: **promote a thumbs-down call to a regression eval test case** (brief §7). This spec defines the surfaces, the data shape, and the loop.

---

## 1. The loop (this is the spine)

```
                 +────────────────────────────────────────────+
                 │                                            │
                 ▼                                            │
   1. Calls happen during a campaign or test                  │
                 │                                            │
                 ▼                                            │
   2. Operator drills into a bad call                         │
                 │                                            │
                 ▼                                            │
   3. Operator clicks "Promote to eval test case"             │
                 │                                            │
                 ▼                                            │
   4. Test case lands in the agent's eval suite               │
                 │                                            │
                 ▼                                            │
   5. Eval suite runs against current agent config            │
                 │                                            │
                 ▼                                            │
   6. Failures highlighted; Prompt Enhancement suggests fix   │
                 │                                            │
                 ▼                                            │
   7. Operator accepts suggestion → new prompt variant        │
                 │                                            │
                 ▼                                            │
   8. Eval re-runs → cases pass → pass-rate moves visibly     │
                 │                                            │
                 ▼                                            │
   9. New prompt variant attachable to next campaign     ─────┘
```

If a buyer can see this loop close on a single demo screen, we've won.

---

## 2. Surfaces

| Surface | Path | Purpose | Phase |
|---|---|---|---|
| Live monitoring | `/monitoring` | Calls in flight, sends-by-channel, anomaly markers | 4 |
| Activity feed | `/monitoring/activity` | Cross-cutting log stream (revived [Logs.tsx](../frontend/src/pages/Logs.tsx)) | 4 |
| Call logs | `/monitoring/calls` | Filterable, searchable inventory of all calls | 4 |
| Call drill-down | `/monitoring/calls/:id` and `/agents/:id/transcripts/:callId` | Single call deep-dive (transcript + tools + KB + latency + sentiment) | 4 |
| Agent eval dashboard | `/agents/:id/eval` | Aggregate pass rate, failure modes, scorecard | 4 |
| Eval cases list | `/agents/:id/eval/cases` | Test cases inventory (incl. promoted-from-call) | 4 |
| Single eval case | `/agents/:id/eval/cases/:caseId` | Test definition, run history, judge plan | 4 |
| Prompt Enhancement queue | `/agents/:id/prompt-enhancements` | Suggestions ranked by severity | 4 |
| Failure Analysis | `/agents/:id/failures` | Failure modes with examples and fixes | 4 |

The IA groups the four agent-scoped surfaces (eval, cases, prompt-enhancements, failures) under tabs inside `/agents/:id` so they share the agent header.

---

## 3. Call drill-down — the central artifact

Every other eval surface points back here. Get this right, the rest follows.

### Layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ← back to Call Logs                                                       │
│ Paytm KYC Outreach Voice · call-7f3a · 2026-04-28 14:33                   │
│ Status: ●Failed (tool timeout)   Duration 1m 47s   Latency p95 920ms      │
│ [👎 Flag]  [🧪 Promote to eval test case]  [📋 Share]                     │
│                                                                            │
│ ┌─────────────── Sentiment & intent ribbon ──────────────────────────────┐│
│ │ 😐 neutral → 😀 positive → 😐 neutral → 😟 frustrated → ●ended         ││
│ │ intent: greeting → identity → query → tool_failure → close             ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ ┌─── Latency timeline (1.84 s, longest turn) ─────────────────────────────┐│
│ │ ASR ▮▮ 180  LLM ▮▮▮▮ 420  KB ▮ 90  TOOL ▮▮▮▮▮▮▮▮▮▮ 1100 (timeout) TTS  ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ TRANSCRIPT                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ user (14:33:02)                                                          ││
│ │  "Hi, I want to know where my order is."                                 ││
│ │                                                                          ││
│ │ agent (14:33:04)                                                         ││
│ │  "Sure, can you share your order ID?"                                    ││
│ │                                                                          ││
│ │ user (14:33:09)                                                          ││
│ │  "AUR-882-44213"                                                         ││
│ │                                                                          ││
│ │ agent (14:33:12)                                                         ││
│ │  "One moment, checking that for you."                                    ││
│ │  🔧 tool: check_order_status (failed · 1100 ms · timeout)  ▼ details     ││
│ │                                                                          ││
│ │ agent (14:33:15)                                                         ││
│ │  "I'm having trouble pulling that up right now. Let me                   ││
│ │   take down a callback time so we can follow up."                        ││
│ │  📚 retrieved 0 chunks                                                    ││
│ │                                                                          ││
│ │ user (14:33:22)                                                          ││
│ │  "No, just send me an SMS when you have it."                             ││
│ │                                                                          ││
│ │ agent (14:33:25)                                                         ││
│ │  "Got it. We'll text you on +91-9XXX-12345 the moment                    ││
│ │   we have an update. Anything else?"                                     ││
│ │                                                                          ││
│ │ ...                                                                      ││
│ └─────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────────┘
```

### Three primary actions in the header

#### `👎 Flag this call`

Opens a small dialog:
- Reason (free-text or select: "Tool failure", "Wrong answer", "Tone off", "Compliance risk", "Other")
- Severity (low / medium / high)
- Add to failure analysis (auto-checked if severity ≥ medium)

The flag is recorded against the call. Flagged calls appear in Failure Analysis.

#### `🧪 Promote to eval test case` ⭐ marquee

Opens a modal:

```
┌────────────────────────────────────────────────────────────┐
│ Promote call to eval test case                       ✕     │
│                                                             │
│ Test name                                                   │
│ [ winback_order_status_timeout                          ]  │
│ Auto-suggested. Edit if needed.                             │
│                                                             │
│ Description                                                 │
│ [ Verify agent gracefully handles tool timeouts and offers │
│   a fallback (SMS) when order status cannot be retrieved.  │
│ ]                                                           │
│                                                             │
│ ▼ Mock conversation (8 turns)                               │
│   Imported from call-7f3a. Toggle each turn to mark         │
│   whether it's input (user said this) or fixed (we expect   │
│   the agent to say this).                                   │
│   (table of turns with input/fixed toggles)                 │
│                                                             │
│ Judge plan                                                  │
│ [ The agent must:                                           │
│   - Acknowledge the tool failure                            │
│   - Not invent an order status                              │
│   - Offer an SMS or callback fallback                       │
│   - Confirm the customer's preference and close politely    │
│ ]                                                           │
│ Auto-suggested. Editable.                                   │
│                                                             │
│ Expected outcome                                            │
│ ( ) Strict pass / fail                                      │
│ (•) Score >= [ 0.8 ]                                        │
│                                                             │
│ Tags    [ tool-failure ]  [ fallback ]  [ winback ]    +    │
│                                                             │
│              [ Cancel ]    [ Add to eval suite ]  ← primary │
└────────────────────────────────────────────────────────────┘
```

On save:
1. Eval case created in agent's eval suite, status `pending`.
2. Toast: *"Test case `winback_order_status_timeout` added. [View case]"*
3. Modal closes; the call drill-down shows a small banner: *"This call promoted to eval case · view"*.

#### `📋 Share`

Copy a permalink to the call drill-down. Useful for quoting in PRs and Slack.

---

## 4. Live Monitoring — `/monitoring`

Top-level overview:

- **Now** strip: count of active calls, sends in flight (per channel), conversion-events-this-hour. Updates every 2 s.
- **Active campaigns** strip: live KPI tiles per campaign.
- **In-flight calls table**: row per active call (agent, contact, channel, current step, current intent, duration, latency, status). Click row → open mini-drawer with the live transcript stream; click "Open full" → navigate to the call drill-down.
- **Anomaly markers**: 1–3 cards surfacing real-time deviations (delivery rate dipped, tool failure rate spiked, latency p95 jumped). Click → filter calls / drill in.

### Voice motif on rows

Each in-flight call row shows the live waveform meter (per [DESIGN_SYSTEM.md §4.12](DESIGN_SYSTEM.md)) — animates against mock audio level. Calmly identifies "this is voice".

---

## 5. Call Logs — `/monitoring/calls`

Filterable inventory of every call (active, ended, succeeded, failed).

Filters:
- Agent (multi-select)
- Campaign (multi-select)
- Status: completed / failed / abandoned / no-answer / busy
- Outcome: converted / not-converted / unknown
- Date range
- Has flag · Has eval-promotion · Has tool failure · Has KB retrieval

Columns:
- Time
- Agent
- Campaign
- Contact (masked)
- Duration
- Status
- Outcome
- Sentiment trajectory (mini ribbon)
- Latency p95
- Flags (👎 N) · Promoted (🧪)
- Row-click → drill-down

Bulk action: "Promote selection to eval cases" (limited to ≤ 5 at a time).

### Saved filters

Operator can save a filter (e.g., "All failed Paytm KYC Outreach calls today") and pin it. Useful during incident review.

---

## 6. Aggregate Eval Dashboard — `/agents/:id/eval`

The agent owner's daily-driver surface.

### Top section — pass rate

```
┌──────────────────────────────────────────────────────────────────────┐
│ Eval pass rate                                                        │
│ 88%  ▲ 4pp vs last run                            14 / 16 cases pass  │
│                                                                       │
│ ▁▂▂▃▅▅▆▇▇▇█  (sparkline of pass-rate over last 30 runs)               │
└──────────────────────────────────────────────────────────────────────┘
```

### Failure modes

Top 5 reasons cases fail, with counts and example case-links. Sample modes:
- Agent invents information when KB retrieval returns no results (3 cases)
- Tool timeout not handled gracefully (2 cases)
- Off-topic responses to objection (1 case)

Each row links to the failing case(s).

### Prompt-variant comparison

Side-by-side: variant A (Default) vs variant B (Objection-handler). Pass rate per variant, latency p50/p95 per variant, count of cases each passes/fails. Promote the winning variant to default.

### Latency

p50, p95, p99 across the eval suite over time. Anomaly markers when latency spikes.

### Cases section

Inline table of all eval cases — see §7.

---

## 7. Eval Cases — `/agents/:id/eval/cases`

### List

Columns:
- Case name (link)
- Source (manual / promoted from call)
- Tags
- Last run status (pass / fail / not-run)
- Last run score (or pass/fail)
- Last run time
- Run history sparkline (pass/fail dots over time)
- Actions: Run / Edit / Disable / Delete

Top buttons: **+ New case** (manual) · **Run all** · **Filter**.

### Single case — `/agents/:id/eval/cases/:caseId`

Three sections:

1. **Definition** — name, description, mock conversation, judge plan, expected outcome, tags. Editable.
2. **Run history** — every time this case was run: timestamp, agent prompt variant in effect, result, score, latency, judge rationale (if score-based). Click a run → see the full simulated conversation and the judge's reasoning.
3. **Source** (if promoted) — link back to the original call.

### Run history detail

```
┌──────────────────────────────────────────────────────────────────────┐
│ Run · 2026-04-28 14:55 · Default prompt v1.2 · ●Failed · score 0.62  │
│                                                                       │
│ Mock conversation (judge replayed):                                   │
│  user: …                                                              │
│  agent: … (under prompt v1.2)                                         │
│  …                                                                    │
│                                                                       │
│ Judge rationale:                                                      │
│   "Agent acknowledged the tool failure (✓), did not invent (✓),       │
│    but failed to offer a fallback (✗). The fallback criterion is      │
│    weighted highest, dropping the score below 0.8."                   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 8. Prompt Enhancement — `/agents/:id/prompt-enhancements`

A queue of suggestions ranked by severity. Each card:

- **Title:** e.g., *"Add fallback handling for tool timeouts"*
- **Severity:** high / medium / low (colored)
- **Confidence:** 0–100 %
- **Evidence:** "Triggered by 2 failing eval cases and 7 failed calls in the last 30 days." (links)
- **Proposed change:** a unified diff between current prompt and proposed prompt.
- **Actions:** **Accept** (creates new prompt variant) · **Modify** (opens diff in an editor) · **Dismiss** (with reason).

### Accept flow

1. Modal with the diff applied: shows what the new prompt looks like in full.
2. Optional: name the new variant (default: `v1.3 — fallback handling`).
3. Confirm → variant created, attached as `pending` to the agent config.
4. Toast: *"Prompt variant v1.3 created. Run eval suite to verify."* with a primary "Run eval" button.
5. Click Run → eval suite runs (mocked progress), pass rate updates visibly.
6. If pass rate improves, the operator can promote v1.3 to default.

This is the loop's closing moment.

---

## 9. Failure Analysis — `/agents/:id/failures`

A backward-looking view: what's been going wrong, in aggregate.

### Sections

- **Failure mode summary** — same as eval dashboard's Failure Modes but populated from real (mock) call traffic, not just eval cases.
- **Tool failure breakdown** — per tool: success rate, error types, p95 latency, recent failure examples.
- **KB retrieval insights** — per KB: queries with no good match (score < threshold), queries the agent didn't cite, drift over time.
- **Compliance flags** — calls flagged by content filtering or PII detection (if any).
- **Recent flagged calls** — ten most recent operator-flagged calls.

Each row links to the underlying call drill-down.

---

## 10. Activity feed — `/monitoring/activity`

Reuses [pages/Logs.tsx](../frontend/src/pages/Logs.tsx) (currently dark code). Wire it up. Stream of events: agent deployed, agent paused, campaign launched, campaign anomaly, KB indexed, eval case promoted, prompt variant accepted, integration error.

Filters by level (success / info / warning / error) and source (agents / campaigns / system / kb / eval). Click → entity detail.

This is also where the "delivery team did X on behalf of client" events live (scope point 11) — visible audit of internal work.

---

## 11. Mock data shape

Lives in `frontend/src/data/mock/eval.ts` and extensions to existing files (Phase 4).

### Call

```ts
type CallStatus = 'completed' | 'failed' | 'abandoned' | 'no_answer' | 'busy' | 'in_progress';
type CallOutcome = 'converted' | 'not_converted' | 'unknown';

interface Call {
  id: string;                              // 'call-7f3a'
  agentId: string;
  campaignId?: string;                     // optional — test calls have no campaign
  contactPhoneMasked: string;              // '+91 9XXX 12345'
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  status: CallStatus;
  outcome: CallOutcome;
  latencyP50Ms: number;
  latencyP95Ms: number;
  flags: CallFlag[];
  promotedToEvalCaseId?: string;
}

interface CallFlag {
  id: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  addedToFailureAnalysis: boolean;
  createdBy: string;                       // user id
  createdAt: string;
}
```

### CallTranscript (extends today's [types/agent.ts](../frontend/src/types/agent.ts))

```ts
interface CallTranscript {
  id: string;
  callId: string;
  agentId: string;
  turns: TranscriptTurn[];
  retrievalEvents?: CallRetrievalEvent[];   // see KB_SPEC.md
  toolCallEvents: ToolCallEvent[];
  sentimentTrajectory: SentimentPoint[];
  intentTrajectory: IntentPoint[];
  metadata: {
    campaignId?: string;
    cost?: number;
    [key: string]: unknown;
  };
}

interface TranscriptTurn {
  id: string;
  index: number;
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'frustrated';
  intent?: string;
  latencyMs?: number;                      // for agent turns
}

interface ToolCallEvent {
  id: string;
  turnIndex: number;
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorType?: 'timeout' | 'http_error' | 'validation' | 'rate_limit' | 'other';
  errorMessage?: string;
  status: 'success' | 'failure';
  latencyMs: number;
  timestamp: string;
}

type SentimentPoint = { turnIndex: number; sentiment: TranscriptTurn['sentiment'] };
type IntentPoint = { turnIndex: number; intent: string };
```

### EvalCase

```ts
type EvalCaseStatus = 'pending' | 'enabled' | 'disabled';
type EvalRunResult = 'pass' | 'fail';

interface EvalCase {
  id: string;
  agentId: string;
  name: string;                            // 'winback_order_status_timeout'
  description: string;
  source: 'manual' | 'promoted_from_call';
  sourceCallId?: string;                   // if source === 'promoted_from_call'
  mockConversation: TranscriptTurn[];
  inputTurnIndices: number[];              // which turns are user inputs
  fixedTurnIndices: number[];              // which agent turns the judge expects
  judgePlan: string;
  expectedOutcome:
    | { kind: 'pass_fail' }
    | { kind: 'score_threshold'; threshold: number };
  tags: string[];
  status: EvalCaseStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface EvalRun {
  id: string;
  caseId: string;
  agentId: string;
  promptVariantId: string;
  result: EvalRunResult;
  score?: number;
  judgeRationale?: string;
  latencyMs: number;
  conversation: TranscriptTurn[];          // judge's replayed conversation
  ranAt: string;
  ranBy: string;                           // user or 'system'
}

interface EvalSuiteSummary {
  agentId: string;
  caseCount: number;
  passingCount: number;
  passRate: number;                        // 0-1
  passRateTrend: number[];                 // last 30 runs
  topFailureModes: { label: string; count: number; exampleCaseIds: string[] }[];
  latency: { p50: number; p95: number; p99: number };
}
```

### PromptVariant

```ts
interface PromptVariant {
  id: string;
  agentId: string;
  name: string;                            // 'v1.2 — Default' / 'v1.3 — fallback handling'
  promptText: string;
  status: 'default' | 'pending' | 'archived';
  createdBy: string;
  createdAt: string;
  parentVariantId?: string;                // when accepted from a suggestion
}

interface PromptEnhancement {
  id: string;
  agentId: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  confidence: number;                      // 0-1
  evidence: { label: string; href?: string; count?: number }[];
  proposedDiff: { from: string; to: string };
  status: 'open' | 'accepted' | 'dismissed' | 'modified';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
```

### FailureMode

```ts
interface FailureMode {
  id: string;
  agentId: string;
  label: string;
  description: string;
  count30d: number;
  exampleCallIds: string[];
  exampleCaseIds: string[];
  proposedFix?: string;                    // links to a PromptEnhancement
}
```

### Seed data (Paytm-themed, Phase 4)

- 3 agents × ~250 calls each, with ~5 % failed and ~15 % flagged
- 12 manual eval cases per agent, 2–4 promoted-from-call cases
- 5 prompt variants total, 3 prompt enhancements pending
- 1 cross-agent failure mode catalog with 5 entries

---

## 12. Acceptance criteria

A senior PM, with no narration, should be able to:

1. From `/monitoring`, identify a failed call and click into it.
2. On the call drill-down, scan the transcript with sentiment/intent/latency/tool/KB inline annotations and form a hypothesis about what went wrong.
3. Click "Promote to eval test case" and complete the flow — get a confirmation that the test exists.
4. Navigate to `/agents/:id/eval`, see the new case in the suite, and run the suite.
5. Review the resulting failure, click into Prompt Enhancement, accept a suggestion, and re-run the eval to see the case pass.
6. Walk away saying "this is built by people who understand voice AI."

---

## 13. Out of scope for v1

- Real LLM-as-judge — judge rationales are mock.
- Real call audio playback in the drill-down (mention "recordings stored, fetch on demand"; demo without audio is fine).
- Prompt-variant A/B-traffic in production (UI ready; runtime not built).
- Cross-agent eval cases / shared test libraries.
- Metric customization — pass-rate, p95, failure modes are fixed v1; "scorecard" is the place to add custom metrics later.
- Continuous evaluation in CI / on every config change (manual run only).
- Dataset import for evals (only manual + promotion).

---

## 14. Why this design wins the demo

- The promote-to-eval action is **one click from a bad call**. Every other product makes you write tests in a separate tool.
- The **same transcript surface** (call drill-down) is used for live monitoring, post-hoc review, and eval case definition. One mental model.
- **KB retrieval and tool calls are first-class in the transcript** — operators see exactly what knowledge and what tools the agent used. No black box.
- **Prompt enhancement closes the loop** — bad call becomes test, test becomes suggestion, suggestion becomes new variant, variant verified by re-run.
- The pattern is **agent-scoped**. Eval lives where the agent lives. Buyers don't have to remember a separate "evals app."
