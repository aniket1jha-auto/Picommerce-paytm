# Phase 4 — Progress

**Date:** 2026-04-29 (slice D.1 — Live Monitoring + Call drill-down + Promote-to-eval modal; D.1.5 — Performance pivot + Campaign UX refactor; D.1.6 — Campaign entry simplification + Clone/Edit on list)
**Branch:** `claude/vibrant-chatterjee-81a38d`
**Build:** ✅ `npm run build` passes (tsc + vite, 0 errors). All 4 invariants pass.
**Companion docs:** [EVAL_SPEC.md](EVAL_SPEC.md), [DEMO_FLOW.md](DEMO_FLOW.md), [PHASING.md](PHASING.md), [PHASE_3_PROGRESS.md](PHASE_3_PROGRESS.md)

> Phase 4 is the closing showpiece of the brief — the eval / observability story.
> Slice D.1 lights up the **Live Monitoring → Call drill-down → Promote-to-eval**
> arc. The eval-suite landing surface (aggregate dashboard, run-eval, prompt
> enhancement) is D.2 in the next turn.

---

## What landed

### 4.A — Call + eval types ✅
[types/call.ts](../frontend/src/types/call.ts) — `Call`, `CallStatus`, `CallOutcome`, `CallFlag`, `CallScriptOverrides`, `EvalCase`, `EvalCaseSource`. Calls reference Phase 2.11 `TestCallScript`s by id; per-call `scriptOverrides.toolCalls` lets us seed a "failed" call from a happy script without duplicating turns.

### 4.B — Mock calls ✅
[data/mock/calls.ts](../frontend/src/data/mock/calls.ts) — ~40 historical calls plus two seeded marquee calls:

| ID | Notes |
|---|---|
| `call-paytm-kyc-failed` | KYC outreach where the `send_text` tool **fails with Aadhaar OTP gateway timeout**. The demoer's promote-to-eval target. |
| `call-paytm-loan-flagged` | Loan recovery call, operator-flagged for review. Surfaces in the Flagged tab of /monitoring/calls. |

Generation is deterministic — same time → same calls — so the demo is stable.
Each generated call gets jittered duration / latency / outcome from the script
baseline, with a small flag rate (~3%) and per-script failure / abandon rates.

### 4.C — `evalStore` ✅
[store/evalStore.ts](../frontend/src/store/evalStore.ts) — zustand store with `createCase` + accessors. Ships empty (no seed cases yet); D.2 will add ~12 manual cases per deployed agent. Promote-from-call writes here.

### 4.D — Mock live event stream ✅
[hooks/useLiveCalls.ts](../frontend/src/hooks/useLiveCalls.ts) — maintains a pool of 8 active calls. Every ~1.6s the hook advances each call's lifecycle (`ringing → connected → in_progress → completed/failed/no_answer`) and refills the pool. Tracks `endedSinceStart` and `failuresSinceStart` so the page can surface anomaly cards when failure rate exceeds the threshold.

This isn't full streaming infrastructure (4.14) — it's the minimum needed to make /monitoring feel alive. Same hook pattern can extend in D.2 for live eval-run animation.

### 4.1 — Live Monitoring page ✅
[pages/Monitoring.tsx](../frontend/src/pages/Monitoring.tsx) — replaces the Phase 1 stub. Sections:

- **"Now" stats strip** — Active calls / Completed / Failures / Avg latency. KPI tiles in semantic accent.
- **Anomaly card** — appears when `failuresSinceStart >= 2`. Calls out tool-failure-rate spike with an "Investigate" deep-link to `/monitoring/calls?status=failed`.
- **Active campaigns strip** — chips per active campaign (sent count, link to detail).
- **Calls in flight table** — 8 rows that update live. Each row: waveform identity (live mode for connected/in_progress), agent name (link to AgentDetail), masked phone, status pill, current intent, latency, elapsed.
- **Recently ended table** — last 5 terminal calls with outcome.

### 4.3 — Call Logs page ✅
[pages/CallLogs.tsx](../frontend/src/pages/CallLogs.tsx) — replaces the Phase 1 stub. Filterable inventory of all calls in `mockCalls`.

- **Filter tabs** (pill variant): All / Completed / Failed / Abandoned / Flagged. Counts on each tab.
- **Search** by agent / contact / call ID / script.
- **`?status=` query param** synced to the URL — the anomaly-card deep link from /monitoring lands here with `status=failed` pre-filtered.
- Each row links to `/monitoring/calls/:id`.
- Sparkles icon next to agent name when the call has been promoted to eval.
- Failed-flag badge with count.
- p95 latency rendered red when > 1000ms.

### 4.E — Sentiment + Intent ribbon ✅
[components/calls/SentimentIntentRibbon.tsx](../frontend/src/components/calls/SentimentIntentRibbon.tsx) — strip across the top of the call drill-down. Shows sentiment markers per turn (😀 😐 😟 😠) walking the call's arc, with an intent label row beneath. Mirrors the EVAL_SPEC §3 mockup.

### 4.6 — PromoteToEvalModal ✅ (the marquee interaction)
[components/calls/PromoteToEvalModal.tsx](../frontend/src/components/calls/PromoteToEvalModal.tsx) — the brief-defining modal. Auto-suggests sensible defaults from the call:

| Field | Auto-source |
|---|---|
| Test name | `<scriptId>_<toolId>_<reason>` slug — e.g. `kyc_aadhaar_send_text_timeout` |
| Description | If a tool failed, references the tool + error mode |
| Mock conversation | Imported from the call's transcript with per-turn input/fixed toggles (defaults: user turns = input, agent turns = fixed) |
| Judge plan | Auto-generates 4 criteria when there's a tool failure — acknowledge failure / don't invent / offer fallback / close politely |
| Expected outcome | Toggle between strict pass/fail and score threshold (default ≥ 0.8) |
| Tags | `<scriptId>` + auto: `failure`, `timeout`, `flagged` if applicable |

On save, writes to `evalStore`, fires a success toast, returns the new case id. The drill-down page picks up the promoted state and surfaces a banner.

### 4.4 — Call drill-down ✅ (the central artifact)
[pages/CallDetail.tsx](../frontend/src/pages/CallDetail.tsx) at `/monitoring/calls/:id`. Re-uses **all** the Phase 2.11 transcript subparts (TranscriptTurn, InlineToolCall, InlineKBRetrieval, LatencyTimeline) so the failed-call view shows the same level of detail as the test console.

- **Header**: waveform + agent name + status pill + call ID (mono). Three actions: **Flag** / **Promote to eval** / **Share**. Promote button is disabled (and copy changes to "Promoted to eval") if the call has already been promoted in this session.
- **Cross-section chips**: agent (link to AgentDetail) + campaign (link to CampaignDetail) when present.
- **Stats strip**: Duration / Latency p50 / Latency p95 (red if > 1000ms) / Outcome.
- **Promotion banner** — appears once promoted, links to the (Phase 4 D.2) eval suite.
- **Sentiment + intent ribbon**.
- **Worst-turn latency timeline** — surfaces the agent turn with the highest total latency.
- **Full transcript** — turn by turn with all annotations. Override-applied turns (e.g. forced tool failure) render with the right error UX automatically because of the override system.

### 4.F — Routes ✅
[app/routes.tsx](../frontend/src/app/routes.tsx) — `/monitoring/calls/:id` wired.

---

## Build status

```
$ npm run build
✓ 2981 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-BxpteIXe.css    124.06 kB │ gzip:  20.77 kB
dist/assets/index-cwmxq3Gy.js   1,932.11 kB │ gzip: 513.17 kB
✓ built in 1.54s
```

- TypeScript: 0 errors. (Two unused-import warnings on first run; cleaned up.)
- All 4 invariants pass.
- Bundle: +31 KB raw / +8 KB gzip vs Phase 3 final — Live Monitoring + drill-down + ~40 mock calls + modal.

---

## Senior PM / tech lead pre-flight — the demo loop

The dev server is at `http://localhost:3002`.

### Steps 8 → 9 of the [DEMO_FLOW.md](DEMO_FLOW.md) golden path

1. **Sidebar → OBSERVE → Live Monitoring**.
2. Watch the **"Now"** stats tick. Calls cycle every few seconds — connected → in progress → completed/failed.
3. Wait until 2+ failures appear in the session — the **anomaly card** surfaces ("Tool failure rate elevated"). Click **Investigate**.
4. Lands on `/monitoring/calls?status=failed` — failed-tab pre-selected.
5. Find the seeded call **`call-paytm-kyc-failed`** at the top (today's date). Click it.
6. **Call drill-down loads.** You see:
   - Header with waveform + agent name + Failed pill + ID.
   - Three actions: Flag / **Promote to eval** / Share.
   - Cross-section chips: agent → AgentDetail, campaign → KYC Completion Drive.
   - Sentiment ribbon walks the call: neutral → neutral → frustrated → ended.
   - Latency timeline of the worst turn — TOOL bar dominates because of the timeout.
   - Full transcript — scroll down. The **Aadhaar OTP `send_text` turn** shows a red error chip; expand it to see the error payload ("Aadhaar OTP gateway timeout (UIDAI service unreachable)").
   - The KB-retrieval chip on the explain-KYC turn expands into the cited Paytm KYC FAQ chunks.
7. Click **Promote to eval**.
8. **Modal opens with everything pre-filled**:
   - Test name: `kyc_aadhaar_send_text_timeout`
   - Description references the timeout mode.
   - Mock conversation: 8 turns with input/fixed toggles. Default = user turns input, agent turns fixed. Click any to flip.
   - Judge plan: auto-suggested 4-criteria spec.
   - Expected outcome: Score ≥ 0.8.
   - Tags: `kyc-aadhaar, failure, timeout`.
9. Edit any field if you want, then **Add to eval suite**.
10. Toast: *"Eval case added — kyc_aadhaar_send_text_timeout saved to {agent name}'s eval suite."*
11. Modal closes. **Drill-down page now shows a promotion banner** — *"This call is promoted to eval case … Eval suite UI lands in Phase 4 — D.2."* Promote button is now disabled and reads "Promoted to eval".

That's the loop closing for D.1. **D.2 will land the eval-suite UI** so the new case actually appears in `/agents/:id/eval`, and the rest of the loop (run eval → fail → prompt enhancement → accept → re-run → pass) will play out.

### Other things to verify

- **Filter tabs** on /monitoring/calls — counts on each, switching reflects in `?status=`.
- **Search** filters by agent / contact / ID / script.
- **Recently ended** rows on /monitoring rotate as calls complete.
- The **flagged** seeded call (`call-paytm-loan-flagged`) appears in the Flagged tab; warning-tinted.
- Click **Share** on the drill-down → permalink copied to clipboard with toast confirmation.
- Click **Flag** → honest toast saying full flag dialog lands in D.2.

---

## What's still mocked / out of scope this slice

- Streaming live calls is a pool-cycling animation, not a real event stream.
- The drill-down's transcript is rendered from a script, not a real recording. There's no audio playback (mention only — recordings exist in concept but aren't part of v1).
- "Promote to eval" persists to in-memory `evalStore` — no backend, no persistence across refresh.
- The eval-suite UI (where the new case should appear in a list) is the D.2 deliverable. The promotion banner explicitly notes this.

---

## Files this slice touched

| File | Status |
|---|---|
| `frontend/src/types/call.ts` | new |
| `frontend/src/data/mock/calls.ts` | new (~40 historical + 2 marquee seeded) |
| `frontend/src/store/evalStore.ts` | new |
| `frontend/src/hooks/useLiveCalls.ts` | new |
| `frontend/src/pages/Monitoring.tsx` | rewrite from stub |
| `frontend/src/pages/CallLogs.tsx` | rewrite from stub |
| `frontend/src/pages/CallDetail.tsx` | new |
| `frontend/src/components/calls/SentimentIntentRibbon.tsx` | new |
| `frontend/src/components/calls/PromoteToEvalModal.tsx` | new |
| `frontend/src/app/routes.tsx` | `/monitoring/calls/:id` route |

---

## D.2 — what's coming next turn

Per [PHASING.md Phase 4](PHASING.md):

| # | Deliverable |
|---|---|
| 4.7 | Aggregate eval dashboard at `/agents/:id/eval` — pass-rate + trend + failure modes + prompt-variant comparison |
| 4.8 | Eval cases list `/agents/:id/eval/cases` and single case `/agents/:id/eval/cases/:id` |
| 4.9 | Run-eval flow — animated mock progression with results updating |
| 4.10 | Prompt Enhancement queue `/agents/:id/prompt-enhancements` — Accept-and-create-variant flow |
| 4.11 | Failure Analysis page `/agents/:id/failures` |
| 4.13 | Analytics AI Recommendations Apply/Dismiss state |

D.2 closes the brief's **bad-call-to-prompt-enhancement loop** end-to-end. The promotion banner on the drill-down already points at where it'll lead.

---

---

# Slice D.1.5 — Performance pivot + Campaign UX refactor (2026-04-29, later same day)

> Two persona-driven corrections after slice D.1 review:
>
> 1. **Live Monitoring was wrong for the persona.** The Growth Manager
>    doesn't watch calls ring in real time — they review yesterday's results,
>    drill into failures, and act on prompt-enhancement opportunities. The
>    cycling-calls live page was dashboard-as-toy.
>
> 2. **Campaign creation asked the same question twice.** The template
>    gallery offered "template / journey" and the wizard's SetupStep had a
>    second `simple_send / journey` toggle. Industry-standard pattern picks
>    once at entry; the wizard inherits.

## What changed

### Part 1 — `/monitoring` rebuilt as Performance Review (Growth-Manager-shaped)

[pages/Monitoring.tsx](../frontend/src/pages/Monitoring.tsx) is a full rewrite. Sections, top-down:

1. **Today's snapshot** — 4 KPI tiles (Calls / Successful / Failures / Avg p95) with delta vs yesterday. Failures-going-up reads red (delta inversion); latency-going-down reads green.
2. **Top failure modes** (last 7 days) — grouped by failure cause. Each card shows the mode label + one-line context, count of calls, and 3 example calls with deep-links to the drill-down.
3. **Tool call analysis** (last 7 days) — per-tool: invocations / failures / failure rate / 3 example failed calls. Sorted by failure count.
4. **Prompt enhancement opportunities** — 2–3 auto-generated teasers from the failure rollup, each with a severity tag, rationale referencing real calls, and a link to the (D.2) per-agent prompt-enhancement queue.
5. **Recently flagged** — operator-flagged calls, newest first.

The right way to think about this page: it's a **morning review** for the Growth Manager. Open it, see what hurt yesterday, click into the calls that hurt, decide what to fix. Every panel cell links to a real call drill-down.

[utils/performanceAggregations.ts](../frontend/src/utils/performanceAggregations.ts) — new pure-function module that computes everything from `mockCalls` + the scripts they reference. Re-usable from D.2 per-agent failure analysis pages.

[types/call.ts](../frontend/src/types/call.ts) — added `Call.failureMode?: string` and a `FailureModeMeta` catalog. The seeded failed call now carries `failureMode: 'aadhaar_otp_timeout'`; generated failed calls get assigned a mode based on script + dice roll.

[data/mock/calls.ts](../frontend/src/data/mock/calls.ts) — exposes `failureModeCatalog` and assigns `failureMode` on every failed call.

**Deleted:**
- [hooks/useLiveCalls.ts](../frontend/src/hooks/useLiveCalls.ts) — gone. Cycling-calls live state is no longer needed.
- [pages/Logs.tsx](../frontend/src/pages/Logs.tsx) — gone. Activity feed is "monitoring noise" for this persona.
- `/monitoring/activity` route — gone.

[components/layout/Sidebar.tsx](../frontend/src/components/layout/Sidebar.tsx) — sidebar entry **"Live Monitoring" → "Performance"**.

### Part 2 — Campaign UX refactor: industry-standard path-first pattern

Before: `/campaigns/new` → 2-card chooser ("Use template" / "Build a journey") → wizard. Inside wizard's SetupStep, *another* "Simple Send vs Automated Journey" toggle. Pick journey from the gallery, see "Build Flow" step, but *also* see the SetupStep prompt asking the same thing again. Pick "Simple Send" in the SetupStep and the wizard quietly switches step 3 from "Build Flow" back to "Content & Schedule." Confusing, demo-fatal.

After: **one decision, made up front.**

```
/campaigns/new

  ┌─ Pick a path ─────────────────────────────────────┐
  │  [Quick run]            [Automated journey]      │
  │  Single send.           Multi-step canvas.        │
  │  one-time / recurring   triggers / delays /       │
  │  / Smart AI             splits / agents           │
  └───────────────────────────────────────────────────┘

  Tabs: Quick run | Automated journey   [Search…]

  ┌──────────────────────────────────────────────────┐
  │  Templates filtered to the picked path:           │
  │                                                   │
  │  [Blank campaign / Blank canvas]                  │
  │  [Template] [Template] [Template]                 │
  │  [Template] [Template] [Template]                 │
  └──────────────────────────────────────────────────┘
```

Pick template / blank → wizard with `campaignType` locked. SetupStep no longer prompts for type. ContentScheduleStep's `event` mode is dropped from the picker (events belong on the journey canvas, not in a one-shot send).

Files:

- **NEW** [components/campaign/CampaignPathPicker.tsx](../frontend/src/components/campaign/CampaignPathPicker.tsx) — replaces `CampaignTemplateGallery`. Two big PathCards on top + tabs + search + a grid that always includes a **"Blank campaign / Blank canvas"** card as the first cell so blank-start is a peer of templates.
- **DELETED** `frontend/src/components/campaign/CampaignTemplateGallery.tsx`.
- [pages/CreateCampaign.tsx](../frontend/src/pages/CreateCampaign.tsx) — rewrite. Two stages: `pick` (PathPicker) and `wizard`. Back-to-picker button labeled with which path the user came from.
- [data/mock/campaignTemplates.ts](../frontend/src/data/mock/campaignTemplates.ts) — `CampaignTemplateKind = 'quick_run' | 'journey'` added; existing 8 templates tagged `quick_run`; **2 new journey templates**:
  - **Cart abandonment recovery** — event-triggered, WhatsApp / SMS / AI Voice ladder
  - **Onboarding nudge journey** — 7-day KYC drive with a branch
- [components/campaign/SetupStep.tsx](../frontend/src/components/campaign/SetupStep.tsx) — campaign-type toggle **deleted**. Setup now asks only for name + description + goal + budget.
- [components/campaign/ContentScheduleStep.tsx](../frontend/src/components/campaign/ContentScheduleStep.tsx) — schedule grid drops `event` (3 cards: One-time / Recurring / Smart + AI). Event mode body remains in the file but is unreachable from the picker — graceful for any legacy data.

## Build status

```
$ npm run build
✓ 2980 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-C6Rcyu0_.css    123.80 kB │ gzip:  20.75 kB
dist/assets/index-C_bBlCgV.js   1,932.51 kB │ gzip: 513.39 kB
✓ built in 1.89s
```

- TypeScript: 0 errors.
- All 4 invariants pass.
- Bundle: net flat — Performance page + path picker net-cancel against deleted `useLiveCalls`, `Logs.tsx`, and the old gallery.

## Senior PM / tech lead pre-flight

### Performance page (Sidebar → OBSERVE → Performance)
1. Land on the redesigned page. Confirm 4 KPI tiles for **today** with delta-vs-yesterday badges.
2. Scroll to **Top failure modes** — see "Aadhaar OTP gateway timeout" as a card with a count and 3 example calls. Click any example → drill-down loads with the right failure mode visible in the transcript.
3. **Tool call analysis** — `send_text` shows a non-zero failure count from the seeded KYC call; click the failed-call chip → drill-down.
4. **Prompt enhancement opportunities** — 2–3 cards generated from the failure rollup. Click "Open enhancement queue" — currently routes to `/agents/:id/prompt-enhancements` (D.2 will land that page).
5. **Recently flagged** — confirm `call-paytm-loan-flagged` shows up; click → drill-down.

The cycling-calls table is gone. The page is now a real morning-review surface.

### Campaign creation flow (Sidebar → BUILD → Campaigns → New campaign)
1. Land on the path picker. Two big cards at top: **Quick run** and **Automated journey**. Quick run is selected by default.
2. Below: pill tabs match the path picker. Below tabs: search input. Below that: grid of templates filtered to the picked path. **First grid cell is "Blank campaign"** (or "Blank canvas" when journey path is selected).
3. Switch to **Automated journey** — grid filters to 2 journey templates + "Blank canvas" cell. The Quick-run quick_run templates disappear from view.
4. Click any quick-run template — wizard opens at Setup. **Setup no longer asks "Simple Send vs Automated Journey".** Just name + description + goal + budget.
5. Walk Setup → Audience → Content & Schedule. Schedule shows **3 modes** (One-time / Recurring / Smart + AI). Event-based is gone.
6. Walk to Review → Launch. Campaign persists in store, redirects to detail. (Phase 3 launch handler still works.)
7. Hit **Back to Quick run** (or Automated journey) at the top to return to the picker. Pivot to a different template.
8. Pick **Automated journey → Cart abandonment recovery** template — wizard opens with `campaignType: 'journey'`, step 3 reads "Build Flow" (canvas).
9. Pick **Automated journey → Blank canvas** — wizard opens with empty journey state.

The double-decision pattern is gone. One decision, picked once.

## Files this slice touched

| File | Status |
|---|---|
| `frontend/src/pages/Monitoring.tsx` | full rewrite — Performance Review |
| `frontend/src/utils/performanceAggregations.ts` | new |
| `frontend/src/types/call.ts` | extended (failureMode + FailureModeMeta) |
| `frontend/src/data/mock/calls.ts` | extended (failureModeCatalog, modes wired) |
| `frontend/src/hooks/useLiveCalls.ts` | **deleted** |
| `frontend/src/pages/Logs.tsx` | **deleted** |
| `frontend/src/app/routes.tsx` | dropped `/monitoring/activity` route |
| `frontend/src/components/layout/Sidebar.tsx` | "Live Monitoring" → "Performance" |
| `frontend/src/data/mock/campaignTemplates.ts` | added `kind`, tagged 8, added 2 journey templates |
| `frontend/src/pages/CreateCampaign.tsx` | refactored 2-stage entry |
| `frontend/src/components/campaign/CampaignPathPicker.tsx` | new |
| `frontend/src/components/campaign/CampaignTemplateGallery.tsx` | **deleted** |
| `frontend/src/components/campaign/SetupStep.tsx` | dropped campaign-type toggle |
| `frontend/src/components/campaign/ContentScheduleStep.tsx` | dropped event mode card |

---

---

# Slice D.1.6 — Campaign entry simplification + Clone/Edit on list (2026-04-29, later same day)

> Reviewer feedback: D.1.5's `/campaigns/new` was still doing too much — the
> path picker plus a flat template grid plus a duplicate path-tabs strip
> meant the user picked the path **three times** before getting to a wizard
> step. The right separation is that **/campaigns/new** is just a path
> picker, **templates live inside the build flow** (because they already
> have to — the journey canvas has its own template modal), and
> **/campaigns** is where running campaigns surface for clone/edit.

## What changed

### Campaign entry — minimal path picker

[components/campaign/CampaignPathPicker.tsx](../frontend/src/components/campaign/CampaignPathPicker.tsx) — full rewrite. From ~280 LOC to ~80 LOC.

- Just **two big cards**: Quick run / Automated journey.
- Each shows: icon + title, one-line description, three example use-cases.
- Click → starts the build immediately. No grid, no tabs, no search, no inline templates.

[pages/CreateCampaign.tsx](../frontend/src/pages/CreateCampaign.tsx) — simplified to a 2-stage flow without template-handling at the entry. `templateToInitialData` (the seed-from-template helper) moved to [data/mock/campaignTemplates.ts](../frontend/src/data/mock/campaignTemplates.ts) so it's importable from anywhere.

### Templates live inside the build flow

[components/campaign/CampaignTemplatePickerModal.tsx](../frontend/src/components/campaign/CampaignTemplatePickerModal.tsx) — new component. Modal listing all `quick_run` templates (or `journey` templates if we ever need it from elsewhere), with search and the same card layout the gallery used. Mounts from inside the wizard.

[components/campaign/SetupStep.tsx](../frontend/src/components/campaign/SetupStep.tsx) — header gets a small **"Start from template"** button (top-right of the section header). Only shown when the campaign is `simple_send` (Quick run); journey templates remain accessible from inside the canvas via the existing `PrebuiltJourneyModal`.

Clicking the button opens `CampaignTemplatePickerModal`. Picking a template:
- Seeds name, segment, channels, goal, sender config (incl. agent), schedule type
- Merges into existing campaign data (doesn't blow away anything the user already typed)
- Closes the modal

Symmetry: the journey canvas has had `PrebuiltJourneyModal` since Phase 0. Both build paths now expose templates the same way — *inside* the build flow, not at the entry.

### /campaigns gets Clone + Edit row actions

[components/campaign/CampaignCard.tsx](../frontend/src/components/campaign/CampaignCard.tsx) — row actions added.

- **Edit** → existing `/campaigns/:id/edit` route.
- **Clone** → maps the campaign into a `Partial<CampaignData>` draft (name "(copy)", same segment, channels, budget, AI-voice agent if present) and navigates to `/campaigns/new` with the draft in `location.state`. The wizard skips the path picker and lands on the Setup step pre-filled. On launch, a fresh campaign is persisted via `campaignStore.createCampaign`.
- Buttons are visible on hover / focus-within. They `stopPropagation` so they don't trigger the row's link to detail.

### Files this slice touched

| File | Status |
|---|---|
| `frontend/src/pages/CreateCampaign.tsx` | rewrite (2-stage, no template grid) |
| `frontend/src/components/campaign/CampaignPathPicker.tsx` | rewrite (~280 → ~80 LOC) |
| `frontend/src/components/campaign/CampaignTemplatePickerModal.tsx` | new |
| `frontend/src/components/campaign/SetupStep.tsx` | adds "Start from template" button + modal mount |
| `frontend/src/data/mock/campaignTemplates.ts` | exports shared `templateToInitialData` |
| `frontend/src/components/campaign/CampaignCard.tsx` | adds Clone + Edit row actions |

## Build status

```
$ npm run build
✓ 2981 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-BOINaDoE.css    123.78 kB │ gzip:  20.73 kB
dist/assets/index-Dkip_VNu.js   1,933.13 kB │ gzip: 513.99 kB
✓ built in 1.09s
```

- TypeScript: 0 errors.
- All 4 invariants pass.
- Bundle: ~flat (smaller path picker + new modal cancel out).

## Senior PM / tech lead pre-flight

### Quick run path
1. **Sidebar → BUILD → Campaigns → New campaign** → just two big cards. No template grid below. No filter tabs.
2. Click **Quick run** → wizard opens at Setup. **Campaign-name field is empty**, no template applied.
3. Top-right of Setup section header has **"Start from template"**. Click → modal opens with quick-run templates only.
4. Pick *High-LTV Re-engagement* → fields populate (name, segment, channels, agent, budget). Modal closes. You're still on Setup, ready to walk forward.
5. Walk Setup → Audience (segment selected) → Content & Schedule (agent attached, schedule pre-set to "One time") → Review → Launch.

### Automated journey path
1. From `/campaigns/new`, click **Automated journey** → wizard opens at Setup with `campaignType: 'journey'`.
2. Setup *does not* show "Start from template" — Quick-run-only.
3. Walk to Step 3 → journey canvas. The canvas's existing **"Use prebuilt journey"** modal is the journey-template entry point. Pick a journey template → canvas populates.

### Campaigns list — Clone / Edit
1. **Sidebar → Campaigns**. Hover any row → two icon buttons appear next to the campaign name area: **Edit (pencil)** and **Clone (copy)**.
2. Click **Edit** → `/campaigns/:id/edit` (existing route).
3. Click **Clone** → toast "Drafted a new campaign from …" → lands on the wizard at Setup with campaign data pre-filled, name suffixed " (copy)". Edit anything → Launch creates a fresh campaign.

## What's still mocked / what's next

Same as D.1.5 — D.2 still pending. Performance page links into the (D.2) prompt-enhancement queue; the call drill-down's Promote-to-eval modal already writes to evalStore but the receiving eval-suite UI is the D.2 deliverable.

---

## Awaiting next direction

D.2 still on the table — aggregate eval dashboard, eval cases list, run-eval flow, Prompt Enhancement queue, Failure Analysis. Confirm D.2 next or pick another priority.
