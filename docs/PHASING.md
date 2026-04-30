# PHASING — Phases 1 to 5

**Date:** 2026-04-28
**Companion docs:** [AUDIT.md](AUDIT.md), [IA.md](IA.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [DEMO_FLOW.md](DEMO_FLOW.md), [KB_SPEC.md](KB_SPEC.md), [EVAL_SPEC.md](EVAL_SPEC.md), [MOCKS_PLAN.md](MOCKS_PLAN.md)

> Phase gates are non-negotiable. Each phase ends with a `PHASE_N_COMPLETE.md` summary, an updated `AUDIT.md` delta, and an explicit "go" from the user. No phase begins without sign-off on the previous one.

---

## Phase 1 — Foundation (the bar)

**Theme:** *the product visibly belongs to people who care about craft, before any feature work lands.*

### Goals
- New IA wired into the sidebar (Campaigns first in BUILD per [ADR 0002](decisions/0002-ia-restructure.md)); old IA gone.
- Design system tokens defined; primitives built; dark mode default; reference screen lives in code.
- Single canonical `formatINR` utility; three duplicates removed.
- Empty / loading / error patterns standardized across every existing page.
- All dead routes / "coming soon" copy deleted or implemented.
- Mock content stays Paytm-themed ([ADR 0007](decisions/0007-stay-paytm-themed.md)) — only structural cleanup, no rewrite.
- Documentation: every Phase 0 doc lives at `docs/` and the canonical AUDIT updated to reflect post-Phase-1 reality.

### Deliverables

| # | Deliverable | T-shirt |
|---|---|---|
| 1.1 | New sidebar component with `BUILD / OBSERVE / CONFIGURE` groups; **Campaigns first** in BUILD; old groups deleted | S |
| 1.2 | New routing tree (per [IA.md §3](IA.md)); stub pages for new routes; redirects from old paths | M |
| 1.3 | Design tokens + Tailwind theme config; full primitive library (Button, Input, Select, Table, Card, KPI tile, Tabs, Drawer, Modal, Toast, EmptyState, Skeleton, StatusPill) | L |
| 1.4 | Voice motif component (`<Waveform />`) — static + live modes | S |
| 1.5 | Dark / light mode toggle (lives in sidebar footer dropdown alongside phase indicator); persisted to localStorage | S |
| 1.6 | Phase indicator relocated into sidebar footer dropdown (out of any header chrome) | XS |
| 1.7 | Single canonical `formatINR()` utility; three local duplicates removed; precision rule unified ([MOCKS_PLAN §3.1](MOCKS_PLAN.md)) | S |
| 1.8 | Mock data hygiene per [MOCKS_PLAN §3](MOCKS_PLAN.md): extract sub-segment journeys, extract dashboard CHANNEL_PERF, audit and resolve `data/mock/day30/*` (wire-or-delete) | M |
| 1.9 | Cross-entity invariant checker (build-time test enforcing [MOCKS_PLAN §5](MOCKS_PLAN.md) invariants 1–8) | S |
| 1.10 | Reference screen (Agent Detail in dark mode) committed at `docs/mockups/agent-detail-reference.tsx` | S |
| 1.11 | All "coming soon" toasts and dead alert() calls removed (12 sites per [AUDIT.md §5.2](AUDIT.md)) | S |
| 1.12 | `pages/Templates.tsx` deleted; `/templates` route deleted | XS |
| 1.13 | Logs.tsx wired into `/monitoring/activity` with shell only (full implementation in Phase 4) | XS |
| 1.14 | Updated `AUDIT.md` reflecting post-Phase-1 state | S |

### What stays mocked
Everything. No backend yet. **No workspace switcher, no currency abstraction, no fictional client pivot** — content stays Paytm-themed per [ADR 0007](decisions/0007-stay-paytm-themed.md).

### Exit criteria
- Sidebar IA matches [IA.md §2](IA.md) exactly (Campaigns first, BUILD/OBSERVE/CONFIGURE groups).
- Reference screen is reviewable; senior PM can scan it without explanation.
- Phase indicator + theme toggle live in sidebar footer dropdown; no scattered controls.
- No `alert()`, no `// TODO`, no "coming soon" copy in the codebase.
- Empty / loading / error states render at every existing route (using Phase-1 primitives).
- One `formatINR`. One precision. No drift across the campaign wizard.
- Mock-invariant build test passes.
- Lint passes; build passes; `npm run build` succeeds with no warnings new since Phase 0.

### Risks
- **Tailwind v4 + custom tokens**: the current `@theme` block is light-only. Migrating to a dual-mode system requires CSS-variable plumbing. Plan: 2-day spike at the start of Phase 1, escalate if blocked.
- **Mock data invariant checker scope**: tempting to over-engineer. Ship as a single TypeScript test file run from `npm run lint:mocks`; one assertion per invariant. Phase 1 only enforces what current data already satisfies; Phase 2+ extend as new entities land.
- **Type kitchen-sink discipline**: `AgentConfiguration` mixing voice + chat is *not* fixed in Phase 1. Phase 2 owns it.
- **Reference screen vs primitives chicken-and-egg**: build the primitives first, even thinly; then the reference screen is a wiring exercise, not new design work.

---

## Phase 2 — Agent Build (the wedge)

**Theme:** *make agents the obvious headline of the product.*

### Goals
- Voice agent builder rebuilt to the new bar — 7 steps including KB.
- Chat agent builder shares step components with voice (no more double codebase).
- Knowledge Bases section v1 lives — list, detail, retrieval test, agent attachment, transcript-with-chunks (in shell).
- Tools section refined — Vapi-style 2-pane stays; "Used by" reverse-linkage added; dead buttons removed; `KnowledgeBase` field deleted from tool config (KBs are agent-attached, not tool-attached).
- Live test console actually appears to test — scripted but believable, with streaming transcript, tool-call inline, KB retrieval inline, latency timeline.
- Agent detail surfaces tool / campaign / KB cross-references.

### Deliverables

| # | Deliverable | T-shirt |
|---|---|---|
| 2.1 | Voice agent builder cleanup — 6 steps (no new KB step); FlowStep + ToolsStep imports deleted; "Generate with AI" hooked to Anthropic for real generation | M |
| 2.2 | **"Connect knowledge sources" panel inside Instructions step** per [KB_SPEC.md §6](KB_SPEC.md) — sibling to Global Tool Access; KB picker modal; per-attachment settings (mode/top-K/threshold/citation) | M |
| 2.3 | Chat agent builder — refactor to share Basic Info, Prompt, Instructions, KB, Advanced steps with voice; chat-specific only where genuinely different | M |
| 2.4 | KB list page (`/knowledge-bases`) per [KB_SPEC.md §3](KB_SPEC.md) | S |
| 2.5 | KB create flow per [KB_SPEC.md §4](KB_SPEC.md); mock indexing with progress | M |
| 2.6 | KB detail page with Documents / Configuration / Test retrieval tabs per [KB_SPEC.md §5](KB_SPEC.md) | M |
| 2.7 | Mock retrieval engine (canned query → chunks; fallback to random top-K) | S |
| 2.8 | Tools section refresh: dead buttons removed; "Used by" reverse-linkage; remove orphan KnowledgeBase config from tool form (KB is agent-attached) | S |
| 2.9 | Agent Detail header gains: tools used (chips), KBs attached (chips), campaigns using this agent (count → filtered link) | S |
| 2.10 | Agent Detail "Edit Configuration" button → real `/agents/:id/edit` route that loads builder with seeded config | M |
| 2.11 | Live Test Console rebuild — streaming transcript, inline tool-call entries, inline KB-retrieval entries, latency timeline; mocked audio with `<Waveform />` | L |
| 2.12 | Agent type narrowing: discriminated union on `AgentConfiguration` (`{ type: 'voice'; …voiceFields } \| { type: 'chat'; …chatFields }`); chat-only fields deleted from voice config and vice versa | M |
| 2.13 | Agent versioning visible (chip on agent card; v-history in detail) | S |

### What stays mocked
Real LLM calls only for Anthropic-backed template/instruction generation (already in place). Telephony, audio, retrieval — mocked.

### Exit criteria
- Demo-flow steps 1 and 2 work end-to-end on the Paytm-themed mock data.
- KB list, detail, and retrieval test pass [KB_SPEC §10](KB_SPEC.md) acceptance criteria.
- Agent type is a discriminated union; no `as unknown` casts in pages that use it.
- Tools page has zero dead buttons.
- Reference screen still applies; new pages match its bar.

### Risks
- **Mocked retrieval realism**: too synthetic = not credible; too rich = engineering trap. Plan: 6 hand-curated query→chunks mappings per KB plus a deterministic random fallback.
- **Anthropic API for AI generation**: the existing usage in `CreateContentTemplate` is opt-in. Repeat that pattern for agent instruction generation; gate behind a toggle so demo can run offline.
- **Test Console scope creep**: don't build a real telephony bridge. Streaming text + audio synthesis (browser TTS for the demoer's mic, mock incoming) is enough.

---

## Phase 3 — Segments & Campaigns

**Theme:** *segments and campaigns get the same craft as agents; the marquee plug-agent-into-campaign moment lands.*

### Goals
- Segment creation: unified entry, three sources (rule, AI Goal, Upload), real workflow each.
- Real Edit Segment (delete the "coming soon" toast).
- Goal-based AI segmentation (scope point 13) — Anthropic-backed, with safety: returns rules + sample contacts; never claims it ran on real data.
- Propensity-scored upload supported as a column type with downstream filtering (scope point 3).
- Content Library re-organized: Templates / Media / Ideas as 3 tabs (folds /content-ideas in).
- Campaign wizard: real launch handler that persists to mock store and redirects to detail; Agent picker inside AI-Voice channel block (the marquee moment).
- Pre-launch checklist (Braze Canvas-inspired) on Review step.
- Sub-segment journey data sourced from a single mocks file across CampaignDetail + CampaignFlow.

### Deliverables

| # | Deliverable | T-shirt |
|---|---|---|
| 3.1 | `/audiences/segments/new` becomes 3-card chooser (Rule / AI Goal / Upload) | S |
| 3.2 | Goal-based AI segmentation route + flow (Anthropic-backed) | L |
| 3.3 | Propensity column type in CSV mapping; "Score range" filter in rule builder | M |
| 3.4 | Real Edit Segment route (`/audiences/segments/:id/edit`); replaces "coming soon" toast | M |
| 3.5 | Segment detail page with cross-references (campaigns using it) | S |
| 3.6 | Content Library reorganized: Templates / Media / Ideas tabs; `/content-ideas` becomes redirect | S |
| 3.7 | Campaign wizard real launch handler — persists campaign in `campaignStore`; toast + redirect to detail | M |
| 3.8 | **Agent picker in AI-Voice channel block** in the campaign wizard; prompt-variant select; KB summary; retry/fallback rules | L |
| 3.9 | Pre-launch checklist (Review step) — green ticks, warnings, acknowledgments | M |
| 3.10 | Sub-segment journey data extracted to `mocks/journeys.ts`; CampaignDetail + CampaignFlow read from one source | M |
| 3.11 | Campaign template gallery on `/campaigns/new` (8 templates) | M |
| 3.12 | Cross-section links: Campaign → Agent, Segment → Campaigns, Template → Campaigns | S |
| 3.13 | A/B variant config per channel (already exists; tighten + ensure traffic sums to 100%) | S |

### What stays mocked
Real LLM only on AI segment generation (Anthropic, opt-in). Otherwise mocked.

### Exit criteria
- Demo-flow steps 3, 4, 5, 6, 7 work end-to-end on the Paytm-themed mock data.
- Campaign wizard launches a campaign that persists, shows up in `/campaigns`, and CampaignDetail loads.
- Agent picker is in the AI-Voice section, not buried elsewhere.
- Segment Edit works.
- All three segment-creation paths land at a saved segment.

### Risks
- **AI segmentation hallucination risk**: the LLM might produce nonsensical rules. Plan: schema-constrained output (function-call style), with a post-process validator; failed validation falls back to "Try a clearer goal" message.
- **Campaign persistence**: `campaignStore` is in-memory; refresh loses the new campaign. Acceptable for demo; flag clearly.
- **Pre-launch checklist scope**: tempting to model 50 conditions. Ship with 8 conditions max; expandable.

---

## Phase 4 — Run & Observe (the closer)

**Theme:** *the eval / observability story is the most polished part of the app.*

### Goals
- Live Monitoring fully functional (mock).
- Activity feed (revived Logs.tsx) wired to events from the workspace.
- Call Logs filterable, searchable, with bulk promote-to-eval.
- Call drill-down per [EVAL_SPEC §3](EVAL_SPEC.md): transcript, tool-call inline, KB retrieval inline, sentiment / intent ribbon, latency timeline, three header actions (Flag, Promote, Share).
- **Promote-to-eval modal** working end-to-end.
- Aggregate eval dashboard per [EVAL_SPEC §6](EVAL_SPEC.md).
- Eval cases CRUD per [EVAL_SPEC §7](EVAL_SPEC.md).
- Prompt Enhancement queue with Accept flow that creates a new prompt variant and re-runs eval.
- Failure Analysis section.
- **AI Recommendations on Analytics get Apply / Dismiss actions** and a tracked-state.

### Deliverables

| # | Deliverable | T-shirt |
|---|---|---|
| 4.1 | `/monitoring` Live page — active calls table, anomaly cards, in-flight KPIs | M |
| 4.2 | `/monitoring/activity` — Logs.tsx revived, source-filtered by workspace | S |
| 4.3 | `/monitoring/calls` filterable list + bulk promote | M |
| 4.4 | Call drill-down `/monitoring/calls/:id` per [EVAL_SPEC §3](EVAL_SPEC.md) | XL |
| 4.5 | Per-agent transcripts list `/agents/:id/transcripts` | S |
| 4.6 | Promote-to-eval modal + persistence to `evalStore` | L |
| 4.7 | Aggregate eval dashboard `/agents/:id/eval` | L |
| 4.8 | Eval cases list `/agents/:id/eval/cases` + single case `/agents/:id/eval/cases/:id` | L |
| 4.9 | Run-eval flow (mocked) with progress + results animation | M |
| 4.10 | Prompt Enhancement queue `/agents/:id/prompt-enhancements` + Accept flow | L |
| 4.11 | Failure Analysis page `/agents/:id/failures` | M |
| 4.12 | Voice motif live mode (animated waveform) on monitoring rows + test console | S |
| 4.13 | Analytics AI Recommendations: Apply / Dismiss handlers + tracked state | S |
| 4.14 | Mock streaming infrastructure (`useMockEventStream` hook) for live monitoring + activity feed | M |

### What stays mocked
Telephony (no real audio), real LLM judge (judge rationales are pre-baked per case), real eval execution (eval runs are scripted).

### Exit criteria
- Demo-flow steps 8 and 9 work end-to-end on the Paytm-themed mock data.
- Senior PM can complete the [EVAL_SPEC §12 acceptance flow](EVAL_SPEC.md) without narration.
- The "promote bad call to eval" loop closes visually within one screen.
- Live monitoring updates feel real (not sluggish, not jittery).

### Risks
- **Mock streaming complexity**: easy to over-engineer. Ship one `useMockEventStream(workspaceId)` that emits scripted events on a loop; no per-component subscriptions.
- **Eval-run animation fidelity**: a janky progress bar undermines credibility. Plan: per-case animated state machine (queued → running → judging → result) with sensible timing.
- **Call drill-down view perf**: large transcripts + retrievals + tool calls + latency timeline = many DOM nodes. Virtualize the transcript list.

---

## Phase 5 — Cross-cutting polish

**Theme:** *every screen worthy of senior-PM scrutiny.*

### Goals
- Analytics + Reports applied to the design system; "Request a dashboard" CTA on Reports (scope 17).
- Configure section: Channels, Integrations, Team & Roles, Audit Log, Workspace settings.
- Audit Log surface real (mock) entries from cross-cutting actions taken throughout the app.
- Dashboard re-imagined: cross-section landing with "next action" rail.
- Phase-mode (Day 0 / 1 / 30) audit end-to-end — every page has phase-correct empty / muted / full states.
- Final accessibility pass.
- Final copy pass.

### Deliverables

| # | Deliverable | T-shirt |
|---|---|---|
| 5.1 | Analytics + Reports rebuilt to the design system; recommendations live with state | M |
| 5.2 | "Request a dashboard" CTA on Reports (scope 17) — opens a request form (mock) | XS |
| 5.3 | Dashboard re-imagined: KPI bar + Active Campaigns + Active Agents + Next Actions rail (per [DEMO_FLOW.md Step pre-demo](DEMO_FLOW.md)) + AI Companion mounted | L |
| 5.4 | Configure → Channels (folds in current Settings → Channels and ChannelConfig content) | M |
| 5.5 | Configure → Integrations (refreshed catalog) | S |
| 5.6 | Configure → Team & Roles — real invite flow (mock), permission matrix per role | M |
| 5.7 | Configure → Audit Log — `/configure/audit-log` with filterable entries (scope 10) | M |
| 5.8 | Configure → Workspace — data sources, billing, preferences, currency / locale toggle | M |
| 5.9 | Phase-mode audit: every page tested in Day 0 / Day 1 / Day 30 | S |
| 5.10 | Accessibility pass: keyboard nav, focus rings, color contrast (WCAG AA), aria-labels | M |
| 5.11 | Copy pass: all microcopy reviewed; jargon removed; CTAs pass the "verb + object" test | S |
| 5.12 | `PHASE_5_COMPLETE.md` summary + final updated `AUDIT.md` | S |

### What stays mocked
Real OAuth, real telephony, real backend persistence. None of these land in v1.

### Exit criteria
- Senior PM walkthrough finds zero loose ends, zero unjustified screens, zero generic SaaS aesthetics.
- Tech lead walkthrough finds zero broken cross-section flows.
- Product reads as voice-AI platform that runs campaigns from the first 30 seconds.
- Every scope point in §3 of the brief is either delivered or honestly absent (no fake completeness).

### Risks
- **Audit Log scope**: easy to over-engineer. Ship as filterable list of pre-seeded events from Phases 1–4 actions; no advanced search.
- **Dashboard rebuild competing with Phase 5 timeline**: front-load the design once; reuse primitives.

---

## Dependencies map

```
Phase 1 (Foundation)
  └→ Phase 2 (Agent Build)
       └→ Phase 3 (Segments & Campaigns)
            └→ Phase 4 (Run & Observe)
                 └→ Phase 5 (Polish)
```

Strict linear order. Phase 4 needs Phase 3's campaign + agent persistence to demo end-to-end. Phase 5 needs everything below to know what's there to polish.

**Cross-phase commitments:**
- Reference screen lives from Phase 1 onward; updated each phase as primitives extend.
- Mock data stays internally consistent every phase (invariant checker from Phase 1 enforces).
- ADRs land alongside the decisions, not retroactively.

---

## Risk register

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Tailwind v4 dark-mode plumbing | High | Medium | 2-day Phase 1 spike; escalate if blocked |
| Mock retrieval looking fake | High | Medium | Hand-curate 6 query→chunks mappings per KB; deterministic random fallback |
| Promote-to-eval modal complexity | High | Medium | Build the modal first in Phase 4 in isolation; test the flow end-to-end before integrating |
| AI segmentation hallucinations | Medium | High | Function-call schema constraint + post-process validator |
| Campaign persistence loss on refresh | Medium | High | Document clearly in mock-data hint; sessionStorage fallback if low-cost |
| Performance of large transcript drill-down | Medium | Medium | Virtualize transcript list from day one |
| ~~RTL (Arabic) rendering for Marwa~~ — N/A per [ADR 0007](decisions/0007-stay-paytm-themed.md) | — | — | Removed; no UAE workspace in v1 |
| Type discriminated-union refactor breaks downstream code | Medium | Medium | Phase 2 deliverable 2.12 has its own slice with thorough callsite update |
| Senior PM finds a defect after sign-off | High | High | Mitigate by *over*-investing in the AUDIT and the per-phase exit criteria; keep `PHASE_N_COMPLETE.md` honest |

---

## Sign-off status (as of 2026-04-28)

| Decision | Status |
|---|---|
| Color palette + dark-default ([ADR 0001](decisions/0001-color-palette.md), [ADR 0006](decisions/0006-dark-mode-default.md)) | ✅ approved |
| IA restructure: BUILD / OBSERVE / CONFIGURE ([ADR 0002](decisions/0002-ia-restructure.md)) — **Campaigns first in BUILD** | ✅ approved with order adjustment |
| KB top-level under BUILD ([ADR 0003](decisions/0003-kb-placement.md)) | ✅ approved |
| Agent-scoped eval + cross-product call logs ([ADR 0004](decisions/0004-eval-architecture.md)) | ✅ approved |
| Mock client pivot to Aurus + Marwa ([ADR 0005](decisions/0005-mock-client.md)) | ❌ rejected |
| Stay Paytm-themed ([ADR 0007](decisions/0007-stay-paytm-themed.md)) | ✅ accepted |
| Backend stays out of scope (no real OAuth, telephony, real LLM beyond Anthropic template generator) | implicit per brief §14 — confirmed |
| Campaign launch fix lands in Phase 3 (not earlier; IA + design system come first) | confirmed |

After Phase 0 sign-off, I will not ask for taste calls. I will ask only for scope ambiguity.
