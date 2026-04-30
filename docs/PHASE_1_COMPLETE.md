# Phase 1 — Complete

**Date:** 2026-04-28
**Branch:** `claude/vibrant-chatterjee-81a38d`
**Build:** ✅ `npm run build` passes (tsc + vite, 0 errors)
**Companion docs:** [PHASING.md](PHASING.md), [AUDIT.md](AUDIT.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [IA.md](IA.md)

> Phase 1 was foundation-only — no feature work. Tokens, primitives, sidebar IA, routes, mock hygiene, dead-button removal. The product reads differently after Phase 1, but no specific surface (Agents, Campaigns, etc.) has been migrated to the new design system yet — that's Phase 2+.

---

## What landed

### 1.1 — Sidebar IA restructure ✅
[frontend/src/components/layout/Sidebar.tsx](../frontend/src/components/layout/Sidebar.tsx) — full rewrite.

- New three-group structure: `BUILD / OBSERVE / CONFIGURE`.
- BUILD order: **Campaigns → Agents → Knowledge Bases → Tools → Audiences → Content Library** (Campaigns first per [ADR 0002](decisions/0002-ia-restructure.md), user direction).
- OBSERVE: Live Monitoring · Call Logs · Analytics · Reports.
- CONFIGURE: Channels · Integrations · Team & Roles · Audit Log · Workspace.
- Sidebar footer now hosts the **phase + theme dropdown** (replaces the workspace-switcher concept rejected in [ADR 0007](decisions/0007-stay-paytm-themed.md)).
- Brand mark switched from cyan-on-navy to violet-accent-on-surface; chrome uses semantic tokens throughout.

### 1.2 — Routes restructure ✅
[frontend/src/app/routes.tsx](../frontend/src/app/routes.tsx) — full rewrite.

- 5 new routes wired: `/knowledge-bases`, `/monitoring`, `/monitoring/activity`, `/monitoring/calls`, `/configure/team`, `/configure/audit-log` (some are Phase-1 stubs; full builds in later phases).
- All settings paths redirect to `/configure/*`. Old `/settings`, `/settings/integrations`, `/channels`, `/templates` all 301 to their new homes.
- Catch-all (`*`) redirects to Dashboard.
- Removed dead route `/templates` (was a redirect-only stub).

New stub pages created (each ~30 LOC, real EmptyState with phase-explicit copy — no "coming soon"):
- [pages/KnowledgeBases.tsx](../frontend/src/pages/KnowledgeBases.tsx)
- [pages/Monitoring.tsx](../frontend/src/pages/Monitoring.tsx)
- [pages/CallLogs.tsx](../frontend/src/pages/CallLogs.tsx)
- [pages/TeamRoles.tsx](../frontend/src/pages/TeamRoles.tsx)
- [pages/AuditLog.tsx](../frontend/src/pages/AuditLog.tsx)

### 1.3 — Design system tokens + primitive library ✅
[frontend/src/styles/globals.css](../frontend/src/styles/globals.css) — full rewrite. Dual-mode CSS variables for surfaces, text, borders, accents, status, channel hues, shadows, backdrop. Tailwind v4 `@theme` block bridges them to utility classes (`bg-canvas`, `text-primary`, `border-subtle`, etc.). Legacy `cyan` / `navy` / `bg-primary` aliases retained so existing pages compile during Phase 2+ migration.

[frontend/src/components/ui/](../frontend/src/components/ui) — 14 new files, 13 primitives:

| Primitive | File |
|---|---|
| Button | [Button.tsx](../frontend/src/components/ui/Button.tsx) — 5 variants × 3 sizes |
| Card + Header / Title / Subtitle | [Card.tsx](../frontend/src/components/ui/Card.tsx) |
| StatusPill | [StatusPill.tsx](../frontend/src/components/ui/StatusPill.tsx) — 6 statuses, sm/md, optional dot |
| EmptyState | [EmptyState.tsx](../frontend/src/components/ui/EmptyState.tsx) |
| KPI tile | [KPI.tsx](../frontend/src/components/ui/KPI.tsx) — tabular nums, delta, trend |
| Tabs (underline + pill variants) | [Tabs.tsx](../frontend/src/components/ui/Tabs.tsx) |
| Skeleton | [Skeleton.tsx](../frontend/src/components/ui/Skeleton.tsx) |
| Toast + ToastProvider + useToast | [Toast.tsx](../frontend/src/components/ui/Toast.tsx) |
| Modal | [Modal.tsx](../frontend/src/components/ui/Modal.tsx) — 3 sizes |
| Drawer | [Drawer.tsx](../frontend/src/components/ui/Drawer.tsx) |
| Input + Textarea | [Input.tsx](../frontend/src/components/ui/Input.tsx) |
| Select | [Select.tsx](../frontend/src/components/ui/Select.tsx) |
| Table family (Table, THead, TBody, Tr, Th, Td) | [Table.tsx](../frontend/src/components/ui/Table.tsx) |
| Waveform (voice motif) | [Waveform.tsx](../frontend/src/components/ui/Waveform.tsx) — static + live modes |
| Barrel export + cn() | [index.ts](../frontend/src/components/ui/index.ts), [cn.ts](../frontend/src/components/ui/cn.ts) |

Every primitive uses semantic tokens (no hex values inline) and has consistent focus-ring styling via the `globals.css` `:focus-visible` rule. Animations use the Linear-style ease `cubic-bezier(0.16, 1, 0.3, 1)`.

`ToastProvider` is mounted at the App root ([app/App.tsx](../frontend/src/app/App.tsx)). Pages can `useToast()` to show consistent toasts; the legacy custom Toast in `components/common/Toast.tsx` is preserved for now (existing pages still use it).

### 1.4 — Voice motif Waveform ✅
Static mode: deterministic 5-bar shape from a seed string (same agent, same shape — recognizable, not random). Live mode: 220ms tick that gently jitters around the deterministic shape. Will be applied to agent cards, call rows, and the Test Console in Phase 2+.

### 1.5 / 1.6 — Theme + phase footer dropdown ✅
[frontend/src/store/phaseStore.ts](../frontend/src/store/phaseStore.ts) — extended:

- New `theme: 'dark' | 'light'` slice with `setTheme`, `toggleTheme`.
- Initial value reads `localStorage` first (`pi-commerce.theme`), falls back to `prefers-color-scheme`, defaults to dark.
- Theme is applied as a class on `<html>` (`document.documentElement.classList.toggle('dark', …)`); CSS variables in `:root` (light) and `html.dark` (dark) flip on change.
- Phase indicator (Day 0 / 1 / 30) and theme toggle live in **one dropdown** in the sidebar footer, per [IA.md §8](IA.md). Closes on click-outside and Escape.

### 1.7 — formatINR consolidated ✅
Three duplicates removed:
- [components/campaign/ChannelSelector.tsx](../frontend/src/components/campaign/ChannelSelector.tsx) — local `formatINR` + `getChannelCostLabel` deleted.
- [components/campaign/ContentScheduleStep.tsx](../frontend/src/components/campaign/ContentScheduleStep.tsx) — local `formatINR` + `getChannelCostLabel` deleted.
- [components/campaign/CampaignPlanStep.tsx](../frontend/src/components/campaign/CampaignPlanStep.tsx) — local `formatINR` + `formatINRCompact` deleted (latter aliased to the canonical version).

`getChannelCostLabel` was duplicated twice — both removed; new shared `formatChannelCost(channelId, unitCost)` lives in [utils/format.ts](../frontend/src/utils/format.ts) and handles voice (`/call`), field exec (`/task`), default (`/msg`).

Precision is now uniform: `formatINR()` uses `.toFixed(1)` with `stripTrailingZero`. The wizard no longer shows two different lakh-precision values on the same screen.

### 1.8 — Mock-data hygiene ✅
- **Dashboard CHANNEL_PERF extracted** to [data/mock/dashboard.ts](../frontend/src/data/mock/dashboard.ts). Dashboard now imports from one place.
- **`data/mock/day0/insights.ts`, `day1/dataSources.ts`, `day1/insights.ts`, `day30/campaigns.ts`, `day30/segments.ts`, `day30/insights.ts`, `day30/analytics.ts`** — all 7 confirmed unreferenced anywhere in the codebase. **Deleted.** `day0/` and `day1/` subfolders removed entirely. Only `day30/waterfalls.ts` remains under `day30/` (in active use by the WaterfallViewer component).
- **Sub-segment journey extraction (CampaignDetail / CampaignFlow)** — **deferred** to Phase 1 follow-up. The two inline `SUB_SEGMENTS` constants have *different shapes* (CampaignDetail tracks per-step engagement metrics; CampaignFlow tracks content previews). Reconciling them is a real refactor, not a hygiene move. Documented as the only carried-over Phase 1 item.

### 1.9 — Cross-entity invariant checker ✅
[frontend/src/data/mock/__invariants.ts](../frontend/src/data/mock/__invariants.ts) — runs at module load, throws on failure. Imported once from [mock/index.ts](../frontend/src/data/mock/index.ts) so the dev server / build fails if mocks drift.

Phase 1 enforces invariants 1 (campaigns→real segments) and 8 (analytics aggregate sanity). The file is structured for incremental addition — Phase 2 adds KB/agent invariants, Phase 3+ add the rest per [MOCKS_PLAN.md §5](MOCKS_PLAN.md).

### 1.10 — Reference screen 🟡 deferred
The Agent-Detail-in-dark-mode reference mockup at `docs/mockups/agent-detail-reference.tsx` was deferred to early Phase 2. Reasoning: AgentDetail is the first surface Phase 2 migrates; the reference screen is best built as the *output* of that migration rather than a parallel artifact. Until then, the reference for the new system is the **sidebar itself** — fully built, fully tokenized, dark/light toggleable, and the most-visible signal of the design direction.

### 1.11 — "Coming soon" copy removed ✅
14 instances scrubbed across the codebase. Replacements are honest:

| Site | Old | New |
|---|---|---|
| ContentScheduleStep voice agent block | `alert('Preview coming soon')` button | **button removed entirely** |
| Settings · disconnected data source | "Connecting X — integration coming soon" | "Connect X via Configure → Integrations" |
| Settings · upgrade button | "Upgrade flow coming soon" | "Upgrades are handled by your account manager — billing self-serve lands in Phase 5" |
| Settings · team invite | "Team invite coming soon" | "Team management lands in Phase 5 — see Configure → Team & Roles" |
| Audiences · segment edit | "Segment editor coming soon" | "Segment editor lands in Phase 3" |
| ChannelConfig · template builder (3 sites) | "Template builder coming soon" / "Template editor coming soon" | "Template management lives in Content Library — open it from the sidebar" / "Edit \"X\" in Content Library" |
| ChannelConfig · WhatsApp Business OAuth (3 sites) | "OAuth flow … coming soon" | "Real OAuth is out of v1 scope — connection state is mocked" |
| ChannelConfig · Meta Business OAuth (3 sites) | same | same |
| ChannelConfig · Meta ad accounts | "Ad account management coming soon" | "Ad-account management lands in Phase 5" |
| ChannelConfig · template management | "Template management coming soon" | "Template management lives in Content Library" |

Final grep: zero `coming soon` strings across `frontend/src/**`.

### 1.12 — Templates redirect deleted ✅
[pages/Templates.tsx](../frontend/src/pages/Templates.tsx) — deleted. The `/templates` route now redirects to `/content-library` directly in `routes.tsx`. One less file, one less import.

### 1.13 — Logs revived as `/monitoring/activity` ✅
[pages/Logs.tsx](../frontend/src/pages/Logs.tsx) is now wired into the route table at `/monitoring/activity`. Sidebar's "Live Monitoring" entry routes to `/monitoring` (Phase-1 stub); the activity feed is one click into Phase 4 or directly accessible by URL. The Logs.tsx component itself is unmodified — it remains a fully functional dark-coded page, just no longer dark.

### 1.14 — Docs updated ✅
- This file ([PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md)).
- AUDIT.md updated to reflect post-Phase-1 reality (separate commit-style update — see §below).

---

## Build status

```
$ npm run build
> tsc -b && vite build
✓ 2954 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-B16tF4ce.css    122.70 kB │ gzip:  20.52 kB
dist/assets/index-DdlY_YJA.js   1,812.65 kB │ gzip: 480.08 kB
✓ built in 3.45s
```

- TypeScript: 0 errors.
- Lint: not run as part of Phase 1 (existing repo has long-standing lint warnings; Phase 5 owns the cleanup pass).
- Bundle size: 1.8 MB raw / 480 KB gzip — pre-existing; Phase 5 introduces code-splitting per the brief's polish pass.

---

## What's still mocked

Per [PHASING.md](PHASING.md) Phase 1 "What stays mocked": **everything**. No backend was wired in this phase. Specifically:
- All campaign / segment / agent / tool / KB / call data is mock.
- The Anthropic API call in `CreateContentTemplate` is the only live external API and was untouched.
- The phase indicator (Day 0 / 1 / 30) is still the only data-driving toggle.

---

## What's open / deferred

| Item | Phase 1 deliverable | Status | Where it picks up |
|---|---|---|---|
| Reference screen at `docs/mockups/agent-detail-reference.tsx` | 1.10 | 🟡 deferred | Built as **output** of Phase 2 (AgentDetail migration). Sidebar is the visible reference until then. |
| Sub-segment journey extraction | 1.8 (partial) | 🟡 deferred | Phase 3 (Campaigns work). Different shapes in CampaignDetail vs CampaignFlow make this a real refactor, not hygiene. |
| Lint sweep | implicit | open | Phase 5 (polish pass per brief §15). |
| Pages migrated to new primitives | n/a | n/a | Phase 2+ migrates one surface at a time per [PHASING.md](PHASING.md). Phase 1 keeps existing pages working with legacy `text-cyan` etc. via Tailwind aliases. |

---

## Side effects to know about

### CSS-token aliases preserved
The old token names (`cyan`, `navy`, `bg-primary`, `bg-secondary`, `text-primary`, `text-secondary`) still resolve in Tailwind, so existing pages render. As surfaces migrate in Phase 2+, callers should switch to the semantic tokens (`accent`, `text-primary`, `bg-canvas`, etc.) and the legacy aliases get dropped at the end of Phase 5.

### Legacy Toast still in use
Several pages use `frontend/src/components/common/Toast.tsx` which is unrelated to the new `ui/Toast.tsx`. Both work side-by-side. Migration to `useToast()` happens per-surface in Phases 2–5.

### Routes that didn't move
- All campaign, agent, audience, content-library, content-ideas routes preserved verbatim — they sit under their groups but their paths are unchanged.
- `/agents/:id/edit` is still a dead button per [AUDIT.md §5.1](AUDIT.md). Phase 2 wires it.

### Existing page chrome
Sidebar is rebuilt; AppShell ([app/App.tsx](../frontend/src/app/App.tsx)) wraps with ToastProvider + canvas background. **Individual pages still render their pre-Phase-1 UI inside the new shell.** This is intentional — Phase 2 begins migrating page bodies to the new primitives, surface by surface.

### `formatChannelCost` shared utility
New helper in [utils/format.ts](../frontend/src/utils/format.ts) — three local copies were removed. If a future feature needs per-channel cost formatting, it imports this; no new local copies.

### Mock-invariant runtime check
Booting the app or running the build now executes `runInvariants()` once. If any campaign references a missing segment or analytics drift past 5x, it throws and the build / dev server fails fast with an actionable message. This is by design.

---

## Exit-criteria check (per [PHASING.md Phase 1](PHASING.md))

| Criterion | Status |
|---|---|
| Sidebar IA matches IA.md §2 exactly (Campaigns first, BUILD/OBSERVE/CONFIGURE) | ✅ |
| Reference screen reviewable; senior PM can scan without explanation | 🟡 deferred — sidebar is the visible reference |
| Phase indicator + theme toggle live in sidebar footer dropdown | ✅ |
| No `alert()`, no "coming soon" copy in the codebase | ✅ |
| Empty / loading / error states render at every existing route | 🟡 partial — new routes have EmptyStates; existing pages keep their pre-Phase-1 patterns until migrated |
| One `formatINR`. One precision. No drift across campaign wizard | ✅ |
| Mock-invariant build test passes | ✅ |
| Lint / build pass with no warnings new since Phase 0 | ✅ build; 🟡 lint deferred |

---

## Senior PM / tech lead pre-flight

Before walking through:
1. **Run `npm install && npm run dev`** in `frontend/`. Open `http://localhost:5173`.
2. **Confirm the sidebar.** New IA, Campaigns first, three groups, footer dropdown.
3. **Toggle the theme** from the footer dropdown. Confirm the entire shell flips dark ↔ light. Existing pages will look mismatched in their bodies — that's expected; Phase 2+ migrates them.
4. **Click into the new stub routes** — Knowledge Bases, Live Monitoring, Call Logs, Team & Roles, Audit Log. Each shows an honest EmptyState pointing to the phase that delivers it.
5. **Click `/monitoring/activity`** to verify the revived Logs page works. (Old route was dark code.)
6. **Try `/templates`, `/settings`, `/settings/integrations`, `/channels`** — confirm they redirect to their new homes under `/configure/*` and `/content-library`.
7. **Open the Campaign wizard at `/campaigns/new`.** Walk to the Content step and confirm: no "Preview agent" button (was a dead alert); cost numbers show one consistent precision in the lakh format.

---

## Awaiting sign-off to begin Phase 2

Phase 2 — Agent Build (the wedge) — covers the voice-agent builder rebuild (7 steps incl. KB), KB section v1, chat-builder consolidation, Tools refresh, Live Test Console rebuild, and agent-detail cross-references. Full scope in [PHASING.md Phase 2](PHASING.md).

Reply with **go** to start, or flag any Phase-1 detail that needs revisiting.
