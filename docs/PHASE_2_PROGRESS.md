# Phase 2 — Progress

**Date:** 2026-04-29 (slice 1 — KB section + inline panel; slice 2 — agent surface coherence; slice 3 — Test Console rebuild)
**Branch:** `claude/vibrant-chatterjee-81a38d`
**Build:** ✅ `npm run build` passes (tsc + vite, 0 errors). Invariant checker passes with new KB↔agent symmetry rule.
**Companion docs:** [PHASING.md](PHASING.md), [KB_SPEC.md](KB_SPEC.md), [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md)

> First slice of Phase 2 lands the **Knowledge Bases section + inline "Connect knowledge sources" panel** in the agent builder. Per user direction (2026-04-29), KB is *not* a wizard step — it's an inline panel inside the existing Instructions step, sibling to Global Tool Access. The voice agent builder stays at 6 steps.
>
> Remaining Phase 2 deliverables (voice/chat builder consolidation, Live Test Console rebuild, Tools refresh, agent-detail cross-references, "Generate with AI" hookup, type narrowing) are scoped for follow-up turns within Phase 2 — see *Carried over* below.

---

## What landed

### 2.0 — KB integration plan revised ✅
Per user direction:
- Knowledge Bases stays a **top-level section** in BUILD (already in place from Phase 1).
- Agent builder voice flow stays at **6 steps** — no new wizard step.
- KB attachment is an **inline panel inside the Instructions step**, sibling to Global Tool Access. Both express the same primitive: "things this agent can call on."

[KB_SPEC.md §6](KB_SPEC.md) and [PHASING.md Phase 2 deliverable 2.2](PHASING.md) updated accordingly.

### 2.A — Knowledge Bases section ✅

**Types** — [types/knowledgeBase.ts](../frontend/src/types/knowledgeBase.ts):
`KnowledgeBase`, `KBDocument`, `KBChunk`, `KBRetrievalResult`, `AgentKBAttachment`, plus enums and label maps. `AgentConfiguration.knowledgeBases?: AgentKBAttachment[]` added to [types/agent.ts](../frontend/src/types/agent.ts).

**Mock data** — [data/mock/knowledgeBases.ts](../frontend/src/data/mock/knowledgeBases.ts):
- 5 Paytm-themed KBs: `kb-001` Paytm Product Catalog v3, `kb-002` Paytm Wallet & UPI Policy, `kb-003` Paytm KYC FAQ, `kb-004` Paytm Loan Recovery Playbook, `kb-005` Paytm Help Center (URL crawl, empty).
- 20 sample documents across the four populated KBs, with realistic counts and types.
- 13 hand-curated chunks covering KYC OTP, wallet limits, postpaid eligibility, loan recovery DPD scripts.
- 8 query→chunks mappings for the retrieval test panel.

**Mock retrieval engine** — [utils/mockRetrieval.ts](../frontend/src/utils/mockRetrieval.ts):
- `retrieve({ knowledgeBaseId, query, topK, scoreThreshold })` — looks up curated mappings first, falls back to deterministic hash-ranked chunks. Same query → same results forever.
- `retrieveForAgent(attachments, query)` — runs retrieval across every KB an agent has attached. Used later in transcript drill-down (Phase 4).

**Store** — [store/knowledgeBaseStore.ts](../frontend/src/store/knowledgeBaseStore.ts): zustand-backed; `createKB` simulates indexing (status flips `indexing → ready` after 2.5s).

**KB list page** — [pages/KnowledgeBases.tsx](../frontend/src/pages/KnowledgeBases.tsx): replaces the Phase-1 stub. Searchable table with name + source + counts + status pill + used-by + updated. Click a row → detail. Empty state primary CTA opens the create dialog.

**KB create dialog** — [components/knowledge-bases/CreateKnowledgeBaseDialog.tsx](../frontend/src/components/knowledge-bases/CreateKnowledgeBaseDialog.tsx): source picker (Files functional; URL crawl + Data source surfaced as disabled with "Coming Q3"), name, description, mocked file upload zone, advanced section for embedding model / chunk size / overlap / splitter. Toast confirmation, then redirects to detail.

**KB detail page** — [pages/KnowledgeBaseDetail.tsx](../frontend/src/pages/KnowledgeBaseDetail.tsx) at `/knowledge-bases/:id`. Stats strip (docs / chunks / tokens / updated), used-by chips linking to attached agents, and three tabs:
- **Documents** — table of uploaded files with chunk counts, status, type badge.
- **Configuration** — read-only view of embedding model, chunking, splitter, source, dates.
- **Test retrieval** — [components/knowledge-bases/KBTestRetrievalPanel.tsx](../frontend/src/components/knowledge-bases/KBTestRetrievalPanel.tsx) — query input, top-K + threshold controls, suggestion chips per KB, results cards with scores. The marquee surface for buyer confidence.

### 2.B — "Connect knowledge sources" panel inline ✅

[components/agents/builder/ConnectKnowledgeSourcesPanel.tsx](../frontend/src/components/agents/builder/ConnectKnowledgeSourcesPanel.tsx) — new component, mounted inside [InstructionsStep](../frontend/src/components/agents/builder/InstructionsStep.tsx) above the Global Tool Access section.

Layout:
- Header label ("Connect knowledge sources") + helper copy + a **Connect** button.
- Empty state: dashed-border block with a "Browse knowledge bases →" deep link.
- Attached state: card per attachment showing KB name (linking to detail), status pill, document/chunk counts, and **inline-editable settings** — Retrieval mode (always / when_asked / when_uncertain), Top K (1–8), Threshold (0–1), Citation style (inline / footnote / off). Detach button per row.
- Picker modal: searchable list of available KBs with status + counts; already-attached items disabled.

Validation behavior:
- Detach is always allowed.
- KBs with `indexing` / `error` / `empty` status can be attached but show a warning ("retrieval will fall back gracefully").
- Defaults on attach: `when_asked`, top-K 4, threshold 0.65, inline citations (per [DEFAULT_KB_ATTACHMENT](../frontend/src/types/knowledgeBase.ts)).

Wiring: `InstructionsStep` initializes from `config.knowledgeBases ?? []`, persists into `onSave({ ...patch, knowledgeBases })`. `AgentBuilder.DEFAULT_CONFIG` updated with `knowledgeBases: []`.

### 2.C — Mock agents updated with KB attachments ✅

[data/mock/agents.ts](../frontend/src/data/mock/agents.ts) — three deployed/active agents now have realistic KB attachments:

| Agent | KB attachments |
|---|---|
| `agent_1` (Sales Outreach) | Product Catalog (when_asked) + KYC FAQ (when_uncertain, footnote) |
| `agent_2` (Loan Recovery) | Product Catalog (when_asked) + Loan Recovery Playbook (always, top-K 4) |
| `agent_3` (Customer Care) | Wallet & UPI Policy (when_asked, footnote) + KYC FAQ |

These reverse-linkage exactly to `kb.usedByAgentIds` in the KB mock data.

### 2.D — Invariant checker extended ✅

[data/mock/__invariants.ts](../frontend/src/data/mock/__invariants.ts) — new **invariant 9: KB ↔ agent linkage symmetric**.
- Every agent's KB attachment must point at a real KB.
- Every KB's `usedByAgentIds` must list real agents.
- The two sides must agree — adding a KB attachment to an agent without updating the KB's reverse list (or vice versa) fails the build.

Phase 1 invariants 1 and 8 still active. The build runs the full check at boot.

### 2.E — Routes updated ✅

[app/routes.tsx](../frontend/src/app/routes.tsx): added `/knowledge-bases/:id` → `KnowledgeBaseDetail`.

---

## Build status

```
$ npm run build
✓ 2963 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-CRnLri0l.css    123.26 kB │ gzip:  20.63 kB
dist/assets/index-CWf5lwK1.js   1,855.41 kB │ gzip: 491.63 kB
✓ built in 1.02s
```

- TypeScript: 0 errors.
- Invariant checker: passes with new symmetry rule.
- Bundle size: +43 KB raw / +12 KB gzip vs Phase 1 — expected for a new section + components.

---

## What's still mocked

- **Retrieval** is mock — curated query→chunks plus deterministic random fallback. No vector store.
- **File upload** in the create-KB dialog is visual only. Created KBs flip `indexing → ready` after 2.5s but accumulate no documents.
- **Configuration tab** is read-only. Re-indexing copy is honest ("contact your delivery team").
- **URL crawl** and **data-source** sources are surfaced as disabled cards, labeled "Coming Q3".

---

## Carried over (still in Phase 2)

These deliverables in [PHASING.md Phase 2](PHASING.md) did **not** land in this slice. They will land in subsequent Phase 2 turns.

| # | Deliverable | Why deferred |
|---|---|---|
| 2.1 | Voice agent builder cleanup — delete FlowStep + ToolsStep imports; hook "Generate with AI" to Anthropic for real generation | Touches the wizard. Wanted to land KB integration cleanly first; cleanup is a separate, focused turn. |
| 2.3 | Chat agent builder consolidation — share Basic Info, Prompt, Instructions, KB, Advanced steps with voice; chat-specific only where genuinely different | Large refactor, affects two pages and a partly-shared codebase. Belongs in its own turn. |
| 2.8 | Tools page refresh: dead-button removal, "Used by" reverse linkage | Standalone page, can land independently. |
| 2.9 | Agent Detail header: tools-used chips, KBs-attached chips, campaigns-using-this-agent count | Depends on 2.10 (the page header rebuild). Best done as a single AgentDetail polish pass. |
| 2.10 | "Edit Configuration" → real `/agents/:id/edit` route loading the builder with seeded config | Standalone, low-risk. |
| 2.11 | Live Test Console rebuild — streaming transcript, inline tool-call entries, inline KB-retrieval entries, latency timeline | Largest single deliverable in Phase 2; deserves its own turn. |
| 2.12 | Agent type narrowing: `AgentConfiguration` → discriminated union on `type: 'voice' \| 'chat'` | Touches every agent surface. Best landed alongside 2.3 (chat consolidation). |
| 2.13 | Agent versioning visible (chip on agent card; v-history in detail) | Small; bundles with 2.9. |
| Reference screen at `docs/mockups/agent-detail-reference.tsx` | The reference is the AgentDetail surface itself; lands as the *output* of 2.9 + 2.10 + 2.11. |

---

## Exit-criteria check (per [PHASING.md Phase 2](PHASING.md))

| Criterion | Status |
|---|---|
| Demo-flow steps 1 and 2 work end-to-end | 🟡 partial — KB step works (now inline). Test Console rebuild deferred (2.11). |
| KB list, detail, retrieval test pass [KB_SPEC §10](KB_SPEC.md) acceptance criteria | ✅ for 1, 2, 3 (all KB surfaces). Criteria 4–5 (transcript drill-down) are Phase 4. |
| Agent type is a discriminated union; no `as unknown` casts in pages that use it | 🔴 deferred (2.12) |
| Tools page has zero dead buttons | 🔴 deferred (2.8) |
| Reference screen still applies; new pages match its bar | ✅ KB pages built using the Phase-1 design system; sidebar + KB pages are now the visible reference |

---

## Senior PM / tech lead pre-flight

The dev server is already running at **http://localhost:3002** (started in Phase-1 verification turn).

Walk-through:

1. **Sidebar** → click **Knowledge Bases**. Expect a table with 5 Paytm-themed KBs, statuses, used-by counts.
2. Click **Paytm KYC FAQ** (`kb-003`) → see the detail. Two agents in the used-by chips.
3. Switch to the **Test retrieval** tab. Click any suggestion chip. Expect 3–4 results with scores ≥ 0.66, ranked, with snippets containing "Aadhaar OTP" / "Min KYC" / etc.
4. Try a query the curated map doesn't cover (e.g. "weather in Mumbai") → expect deterministic random results below 0.7. Same query twice → same shape.
5. Hit **Create knowledge base** from the list. Pick "Uploaded files", give a name, click Create. Expect a toast + redirect to detail with status "Indexing". After ~2.5s the status flips to "Ready" (Documents tab still empty — file ingest is mock).
6. **Sidebar → Agents → click any deployed agent**. (AgentDetail is unchanged in this slice.) Open `/agents/new` to see the new builder behavior.
7. **Walk to step 4 (Instructions).** Above Global Tool Access, scroll to the new **"Connect knowledge sources"** panel. Hit **Connect** → modal with KB picker. Add `Paytm KYC FAQ`. The attachment card appears with editable retrieval mode / top-K / threshold / citation style.
8. Open an existing agent's edit (route doesn't exist yet, deferred to 2.10) — manually navigate `/agents/new` to see it from a fresh state. Step 4 always loads with whatever `config.knowledgeBases` is set; for new agents this defaults to `[]`.

---

---

# Slice 2 — Agent surface coherence (2026-04-29, later same day)

> Cross-section coherence pass on the agent surface — the KBs we just integrated now show up on the agent detail; tools have reverse linkage; the Edit button is no longer dead; orphan flow code is gone.

## What landed

### 2.1 — Orphan flow code deleted ✅
On audit, `AgentBuilder` had no current imports of `FlowStep` / `ToolsStep`, but the components themselves and the entire `components/agents/flow/` directory were still on disk and referenced by nothing. Deleted:
- `components/agents/builder/FlowStep.tsx`
- `components/agents/builder/ToolsStep.tsx`
- `components/agents/flow/` (10 files: ConversationFlowBuilder, ActionNode, ConditionNode, EndNode, FlowEdge, MessageNode, QuestionNode, StartNode, TransferNode + supporting code)

The `flow: { nodes, edges }` field on `AgentConfiguration` is kept (it's referenced in DEFAULT_CONFIG and the agent mocks); deleting it would be a wide type change for negligible win. It's now a quiet, unread field — Phase 5 cleanup target.

### 2.10 — `/agents/:id/edit` route wired ✅
[pages/AgentBuilder.tsx](../frontend/src/pages/AgentBuilder.tsx) gained an `mode: 'create' | 'edit'` prop. In edit mode it reads the agent ID from URL params, seeds `config` from `getAgentById(id).config`, shows a bespoke header (`Edit Agent — <name>` with current version), and routes the deploy action through `updateAgent` (which increments `version`) instead of `createAgent`. Toast-based success feedback; falls back to a "not found" page if the ID is invalid.

[app/routes.tsx](../frontend/src/app/routes.tsx): new route `<Route path="/agents/:id/edit" element={<AgentBuilder mode="edit" />} />` ahead of the catch-all detail route.

### 2.9 + 2.13 — AgentDetail header polish ✅
[pages/AgentDetail.tsx](../frontend/src/pages/AgentDetail.tsx):

- Title row now renders a small **voice waveform** (the Phase 1 `<Waveform />` component) for voice agents, the agent name, and a `v{version}` chip — the agent's identity and config-version signal in one row.
- Below the header, a new **chip row** surfacing connected resources:
  - **Knowledge sources** — chips for each attached KB, linking to `/knowledge-bases/:id` (so the KB integration we just built is now visible from the agent surface, in 30 seconds, no scrolling).
  - **Tools** — chips for each tool the agent uses (from per-step attachments + global access), linking to `/tools?selected=<toolId>` for a deep-linked view.
- Edit Configuration / Pause / Deploy buttons now use semantic tokens (`border-default`, `bg-error`, `bg-success`) instead of hardcoded `border-[#E5E7EB]` / `bg-red-600` / `bg-green-600`. Theme toggle now flips them properly.
- **Campaigns-using-this-agent** chip deliberately deferred to Phase 3 — the data model (`Campaign.aiVoiceConfig.agentId`) lands with the agent picker in the campaign wizard. Showing 0 today would be misleading.

[components/layout/PageHeader.tsx](../frontend/src/components/layout/PageHeader.tsx) loosened to accept `ReactNode` for `title` and `subtitle` so the header can compose chips/icons inline.

### 2.13 — Agent version chip on AgentCard list ✅
[pages/Agents.tsx](../frontend/src/pages/Agents.tsx) — agent cards in the list now show a small `v{version}` chip immediately to the left of the status pill. Tabular nums; subtle border; doesn't fight the status pill for attention.

### 2.8 — Tools page refresh ✅
[pages/Tools.tsx](../frontend/src/pages/Tools.tsx) — substantial cleanup:

**Removed:**
- The orphan **Knowledge Bases section** on the tool config panel (KBs attach to agents, not tools — see [KB_SPEC.md §6](KB_SPEC.md)).
- The dead **Add Message** button (messages remain shown as read-only presets — Before / After / Error — for reference; editable in Phase 5).
- The dead **`</>` Code** button.
- The fake "Saved" CTA (the page is a tool catalog, not an instance editor — there's nothing to save in v1).
- "Create Tool" replaced with a disabled chip reading **"Custom tool — coming Phase 5"**, with a tooltip. No fake CTA.

**Added:**
- **"Used by N agents"** count badge next to each tool in the left list. Computed from agents' per-step `attachedToolIds` + `globalToolIds` + `builtInTools`, deduped.
- **"Used by agents" section** at the top of the tool config panel — chips per agent, linking to `/agents/:id`. Honest empty state when zero agents use it.
- **`?selected=<toolId>` query param** support — when AgentDetail's tool chips link here, the right tool is pre-selected; the URL stays in sync as the user clicks around.
- An **info card** at the bottom of the config panel pointing readers at `/knowledge-bases` for KBs, since the orphan KB section is gone.

**Migrated:**
- All tool inputs now use the Phase 1 `Input` / `Textarea` / `Select` primitives. Hardcoded `border-[#E5E7EB]` / `bg-cyan` / `text-cyan` styles replaced with semantic tokens; the page now respects the dark/light toggle.
- Section headers refactored into a small `<Section>` helper for layout consistency.

## Build status (slice 2)

```
$ npm run build
✓ 2963 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-DNvTgbcI.css    122.51 kB │ gzip:  20.51 kB
dist/assets/index-DJyQCDb0.js   1,855.24 kB │ gzip: 493.17 kB
✓ built in 2.42s
```

- TypeScript: 0 errors.
- Invariant checker: passes (no rule changes since slice 1).
- Bundle size: net-zero change (the orphan flow folder removal cancels out the new ConnectKnowledgeSourcesPanel and Tools refactor surface area).

## Senior PM / tech lead pre-flight (post slice 2)

- Open `/agents` — confirm `v{version}` chip on each agent card, next to the status pill.
- Click into any deployed agent (e.g. *Sales Outreach Agent*) — header shows waveform + name + `v1` chip; below it, **Knowledge sources** chips (Paytm Product Catalog v3, Paytm KYC FAQ) and **Tools** chips (Google Calendar, CRM, Query). Click any KB chip → KB detail. Click any tool chip → Tools page with the right tool pre-selected.
- Click **Edit Configuration** → loads the wizard with the agent's existing config seeded. Walk to step 4 and confirm the Connect knowledge sources panel reflects the existing attachments. Edit something and Deploy — the agent's `version` increments, you land back on the detail page, the version chip updates.
- Open `/tools` — confirm tool list shows usage counts (e.g. Query: 2, CRM: 2). Pick a tool — the right panel shows agents using it as chips. Click an agent chip → AgentDetail.
- Confirm the Tools page has no Knowledge Bases section, no Add Message dead button, no `</>` button, no "Saved" lie.

## Remaining Phase 2 deliverables (carried, refined)

| # | Deliverable | Status |
|---|---|---|
| 2.1 (remainder) | "Generate with AI" Anthropic hookup in InstructionsStep | open — small/medium turn |
| 2.3 | Chat builder consolidation (share steps with voice) | open — large refactor |
| 2.11 | Live Test Console rebuild — streaming transcript, inline tool/KB/latency annotations | open — largest single deliverable |
| 2.12 | `AgentConfiguration` discriminated union narrowing | open — couple with 2.3 |
| Reference screen at `docs/mockups/agent-detail-reference.tsx` | ✅ effectively the AgentDetail page itself, post-2.9 |

The reference-screen artifact: AgentDetail in dark mode now demonstrates the full system — header chips with KB / tool / version chips, semantic tokens throughout, voice motif on the title, footer dropdown for theme/phase. Unless you want a separate file, AgentDetail *is* the reference.

---

# Slice 3 — Test Console rebuild (2.11)

> The largest single deliverable of Phase 2 — the "can it talk?" surface.
> Rebuilds the agent test console from a 112-line setTimeout stub into a
> realistic streaming-playback experience with inline tool calls, KB retrievals,
> per-turn latency timelines, and a live vital-signs panel.

## Design

The console plays back a **hand-curated Paytm-themed script** for the agent's
use case. Why scripted instead of real LLM:

- The brief explicitly excludes real LLM/telephony from v1.
- Buyer-grade demos need predictable timing, retrieval results, and tool-call
  payloads — exactly what a script delivers and what a real LLM doesn't.
- Honest copy throughout: idle state says "v1: scripted playback. Real
  microphone & LLM in a later phase."

Three states: **idle / running / ended**. Idle = big "Start test call" CTA
with a one-line script preview. Running = split layout (transcript left,
vital-signs right). Ended = transcript replay + summary card with stats and
a *disabled* "Promote to eval" placeholder pointing at Phase 4.

## What landed

### 2.11.A — Test-call types ✅
[types/testCall.ts](../frontend/src/types/testCall.ts) — `TestCallScript`,
`TestCallTurn` (user / agent discriminated), `TurnLatency`, `TestCallToolEvent`,
`TestCallRetrievalEvent`. Includes `totalLatencyMs(latency)` helper used in
both the player and the timeline component. Shapes overlap with the Phase-4
post-hoc transcript types in [EVAL_SPEC.md §11](EVAL_SPEC.md) — they'll be
unified when Promote-to-eval lands.

### 2.11.B — Paytm-themed scripts ✅
[data/mock/testCallScripts.ts](../frontend/src/data/mock/testCallScripts.ts) — three scripts:

| ID | Use cases | Highlights |
|---|---|---|
| `kyc-aadhaar` | kyc, support, sales | 8 turns. Hindi-English mixed agent voice. KB retrievals from Paytm KYC FAQ + a `send_text` tool call (Aadhaar OTP link). Marquee demo script. |
| `loan-recovery` | loan_recovery, collections | 8 turns. DPD-30 soft reminder. KB retrievals from Loan Recovery Playbook + a `transfer_call` tool call to a human collections officer. |
| `generic` | * (wildcard fallback) | 7 turns. Wallet-limit Q&A. One KB retrieval. Catch-all for any agent without a more specific script. |

Each chunk ID in retrievals references real chunks in
[data/mock/knowledgeBases.ts](../frontend/src/data/mock/knowledgeBases.ts) —
when a retrieval expands, the agent sees the exact text we curated.

`pickScriptForUseCase(useCase)` does the per-agent matching with `generic`
fallback.

### 2.11.C — TestCallPlayer hook ✅
[hooks/useTestCallPlayer.ts](../frontend/src/hooks/useTestCallPlayer.ts) — the
state machine + timing engine.

- States: `idle` / `running` / `ended`.
- Phases (within running): `user-typing` / `agent-thinking` / `agent-speaking` / `settled`.
- Schedule strategy: cumulative-offset `setTimeout` (rather than chained), so
  timing is predictable and `stop()` can clear all in one pass.
- `elapsedMs` ticks at 10Hz for smooth call-duration UI.
- Cancellation: `stop()` clears all pending timers; component unmount also clears.
- Returns `{ status, phase, revealedTurns, currentAgentTurn, elapsedMs, start, stop }`.

### 2.11.E — Transcript + annotation primitives ✅
Five sub-components under `components/agents/evaluate/test-console/`:

- **[LatencyTimeline.tsx](../frontend/src/components/agents/evaluate/test-console/LatencyTimeline.tsx)** —
  horizontal bars per phase (ASR / LLM / KB / TOOL / TTS) sized proportional
  to actual ms. Has a `compact` mode for inline use under transcript turns
  and a full mode for the right-pane vital signs. Optional `activePhase` prop
  highlights one segment during live playback.

- **[InlineKBRetrieval.tsx](../frontend/src/components/agents/evaluate/test-console/InlineKBRetrieval.tsx)** —
  collapsible chip beneath an agent turn: "Retrieved N chunks · M cited · Xms".
  Expand to see the ranked chunks with snippets and scores. Cited chunks get
  an accent-live border; non-cited chunks render dimmed. Source line links to
  the KB detail page.

- **[InlineToolCall.tsx](../frontend/src/components/agents/evaluate/test-console/InlineToolCall.tsx)** —
  collapsible chip beneath an agent turn: tool name + status + latency. Expand
  to see input/output payload as syntax-monospaced JSON. Failures get an error
  border + dedicated error block instead of an Output block.

- **[TranscriptTurn.tsx](../frontend/src/components/agents/evaluate/test-console/TranscriptTurn.tsx)** —
  one transcript row. User turns get a sunken-style block; agent turns get a
  surface block with the waveform motif at the role label, intent label, the
  text, and a footer with the compact LatencyTimeline. Annotations
  (retrievals + tool calls) render below as inline chips. The waveform pulses
  (`mode="live"`) when this is the currently-active agent turn.

### 2.11.F — VitalSignsPanel ✅
[components/agents/evaluate/test-console/VitalSignsPanel.tsx](../frontend/src/components/agents/evaluate/test-console/VitalSignsPanel.tsx) — right-pane during streaming. Sections:

- **Now** — current call duration + a status pill ("User speaking" / "Agent thinking" / "Agent speaking" / "Listening") with a pulsing dot.
- **Latency · current turn** — full LatencyTimeline of the agent turn the player is processing, with the active phase highlighted.
- **Knowledge sources hit** — chips per active KB (only shown when the current turn has retrievals).
- **Tools called** — chips per active tool (only shown when current turn has tool calls).
- **Running stats** — agent-turn count, retrievals fired, tool calls, p50/p95 latency over revealed turns.

### 2.11.D — TestConsole.tsx rebuilt ✅
[components/agents/evaluate/TestConsole.tsx](../frontend/src/components/agents/evaluate/TestConsole.tsx) — full rewrite (112 → ~290 LOC) replacing the setTimeout stub with the real surface.

**Idle state:** centered icon, one-line description of the script that will play,
"Start test call" primary button, an honest disclaimer line ("v1: scripted playback.
Real microphone & LLM in a later phase").

**Running state:** split layout (transcript left, VitalSignsPanel right). Auto-scrolls
as turns reveal. Renders thinking-dots indicators between turns when the player is in
`user-typing` or `agent-thinking` phase.

**Ended state:** transcript replay (left) + summary card (right) with **Duration**,
**Agent turns**, **Avg latency**, **p50 / p95**, **Retrievals**, **Tool calls** (with
red "·N failed" annotation when applicable). "Promote to eval" surface is present
but disabled — explicit Phase 4 marker, link copy points at EVAL_SPEC §3.
**Run again** button is live; replays the same script.

## Build status

```
$ npm run build
✓ 2971 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-BcMpyQO6.css    122.96 kB │ gzip:  20.63 kB
dist/assets/index-CWtnwPGb.js   1,878.74 kB │ gzip: 499.48 kB
✓ built in 1.67s
```

- TypeScript: 0 errors.
- Invariant checker: passes (no rule changes).
- Bundle: +23 KB raw / +6 KB gzip vs slice 2 — expected for a substantial new surface + script data.

## Senior PM / tech lead pre-flight (post slice 3)

The dev server is still running at `http://localhost:3002`.

1. Open any deployed agent (e.g. *Sales Outreach Agent* / `agent_1`).
2. Scroll past the header — the **Live Test Console** card has a new look. Click **Start test call**.
3. Watch the right pane:
   - Phase pill toggles between "User speaking" / "Agent thinking" / "Agent speaking".
   - Latency timeline shows the current turn's ASR / LLM / KB / TTS bars; the active phase highlights during thinking.
   - "Knowledge sources hit" appears when a retrieval fires (e.g. on the "explain KYC" turn → *Paytm KYC FAQ* chip).
   - "Tools called" appears when a tool fires (e.g. *Send Text* on the OTP-link turn).
   - Running stats keep updating: agent turns, retrievals, tool calls, p50/p95.
4. Watch the left pane:
   - Each agent turn renders with a waveform on the role label that **pulses live** while it's the active turn.
   - Below the agent text, a compact ASR/LLM/KB/TOOL/TTS bar.
   - Below that, **Retrieved N chunks** chips. Click → expand to see the actual KB chunks with scores. Cited chunks have an accent-live border.
   - **Tool name** chips. Click → expand to see input + output JSON payloads.
5. Wait for the call to end (~25–30s for the KYC script). Confirm the **Summary** card shows real stats from the playback. Confirm **Promote to eval** is visibly present but disabled (Phase 4 marker).
6. Hit **Run again** → entire flow replays.
7. Try **End call** mid-flight → ends immediately; summary card renders against whatever turns had revealed.
8. Switch to a chat agent (`agent_chat_1`) — TestConsole still renders (script falls back to `generic`) but, importantly, the waveform stays static since `config.type === 'chat'` (we keep the test motif voice-coded in slice 2).

## What's still mocked / out of v1

- The conversation is scripted. No real LLM, no real telephony, no microphone input.
- "Promote to eval" is disabled — Phase 4 lands the modal + eval store.
- Sentiment ribbon shown in [EVAL_SPEC.md §3](EVAL_SPEC.md) is not in the live test view yet — that's a post-hoc annotation that fits the call-drilldown view better.
- Failure-mode injection (a tool that fails mid-call) isn't part of these three scripts. The KYC script is happy-path; if you want a failure script for the demo, it's straightforward to add.

## Carried over (still in Phase 2)

- 2.3 — chat builder consolidation (share steps with voice). Large refactor.
- 2.12 — `AgentConfiguration` discriminated union narrowing. Bundles with 2.3.

Both are maintenance-flavored, not demo-blocking. Phase 3 (Segments & Campaigns,
including the campaign-launch fix) may be a higher-leverage next move.

## Awaiting next direction

Two reasonable next moves for the rest of Phase 2:

**A. Continue Phase 2 — agent builder polish:** deliverables 2.1, 2.10, 2.11 (cleanup imports, wire Edit route, rebuild Test Console). This is the single most demo-relevant follow-up. Test Console alone is the largest piece.

**B. Continue Phase 2 — Tools refresh + AgentDetail cross-references:** deliverables 2.8, 2.9, 2.13. Smaller scope, more visible cross-section coherence.

Or pick a specific gap that matters more to you and I'll run that.
