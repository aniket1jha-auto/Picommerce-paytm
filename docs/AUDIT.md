# AUDIT — Pi-commerce / Outreach Manager

**Date:** 2026-04-28 (Phase 0 baseline; Phase 1 deltas annotated inline ✅)
**Author:** Phase 0 — incoming engineering owner
**Source of truth:** `frontend/src/` at branch `claude/vibrant-chatterjee-81a38d`
**Companion docs:** [IA.md](IA.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [DEMO_FLOW.md](DEMO_FLOW.md), [KB_SPEC.md](KB_SPEC.md), [EVAL_SPEC.md](EVAL_SPEC.md), [PHASING.md](PHASING.md), [MOCKS_PLAN.md](MOCKS_PLAN.md), [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md)

> Purpose: a defensible, file-backed inventory of what exists today, mapped against the 21-point scope (§3 of the brief) and the 9-step golden flow (§8). Findings are stated baldly. Recommendations are collected at the bottom; nothing is fixed in this phase.
>
> **Phase 1 (2026-04-28) update:** items that have since been resolved are marked ✅ inline. The full set of changes is in [PHASE_1_COMPLETE.md](PHASE_1_COMPLETE.md); only structural deltas appear here.

---

## 1. Route inventory

Source: [frontend/src/app/routes.tsx](../frontend/src/app/routes.tsx)

| Path | Page | In sidebar? | Scope point(s) | Notes |
|---|---|---|---|---|
| `/` | Dashboard | ✅ | 5,8 | Phase-aware landing |
| `/campaigns` | Campaigns | ✅ (BUILD) | 5,9 | List view |
| `/campaigns/new` | CreateCampaign → CampaignWizard | (CTA) | 5,9 | 4-step wizard |
| `/campaigns/:id` | CampaignDetail | (link) | 5,8 | 1,592 LOC, heavy hardcoded demo data |
| `/campaigns/:id/flow` | CampaignFlow | (link) | 5 | 820 LOC, journey display only |
| `/campaigns/:id/edit` | EditCampaign | (link) | 5 | Wraps CampaignWizard with seeded data |
| `/audiences` | Audiences | ✅ (ENGAGEMENT) | 1,2,3,13 | List + AI seeds |
| `/audiences/segments/new` | CreateSegmentSource | (CTA) | 2,3 | Two-card chooser; **no AI route** |
| `/audiences/segments/new/filters` | CreateSegmentFilters | (link) | 2 | 5-step rule wizard |
| `/audiences/segments/new/csv` | CreateSegmentCsv | (link) | 1,3 | 3-step CSV importer |
| `/channels` | ChannelConfig | ✅ (ENGAGEMENT) | 5,12,18 | 1,510 LOC; cost / reachability / API / templates |
| `/content-library` | ContentLibrary | ✅ (ENGAGEMENT) | 4 | Templates + media tabs |
| `/content-library/templates/new` | CreateContentTemplate | (CTA) | 4 | 1,006 LOC, AI-assisted body via Anthropic API |
| `/content-ideas` | ContentIdeas | ❌ **dark in nav** | 4 | Inspirational gallery; no sidebar entry |
| `/agents` | Agents | ✅ (BUILD) | 6,7 | List + stats |
| `/agents/new` | AgentBuilder | (CTA) | 6 | 6-step voice wizard |
| `/agents/new/chat` | ChatAgentBuilder | (CTA) | 7 | 3-step chat wizard, separate codebase |
| `/agents/:id` | AgentDetail | (link) | 6,7 | 4-tab eval surface |
| `/tools` | Tools | ✅ (BUILD) | 6,7 | Vapi-style 2-pane |
| `/reports` | Reports | ❌ **dark in nav** | 8 | Static charts, saved-report stubs |
| `/templates` | Templates | ❌ **redirect-only** | — | 5-line stub: `<Navigate to="/channels" replace />` |
| `/analytics` | Analytics | ✅ (PERFORMANCE) | 8 | Overview / Campaigns / Agents tabs |
| `/settings/integrations` | Integrations | ✅ (SETTINGS) | 1,11,16 | Catalog + drawer |
| `/settings` | Settings | ✅ (SETTINGS) | 10,11,18 | Data Sources / Channels / Billing / Team |
| **(unrouted)** | `pages/Logs.tsx` | — | (would serve 8,11) | ✅ **Phase 1.13:** wired into `/monitoring/activity`. No longer dark. |

### Sidebar IA — pre-Phase-1 (historical)
The pre-Phase-1 sidebar:

```
Dashboard
BUILD       Campaigns • Agents • Tools
PERFORMANCE Analytics
ENGAGEMENT  Audiences • Channels • Content Library
SETTINGS    Integrations • Settings
```

**Pre-Phase-1 gaps:** `/reports`, `/content-ideas`, `/templates` reachable only by URL; `/logs` reachable nowhere.

### Sidebar IA — post-Phase-1 ✅
[frontend/src/components/layout/Sidebar.tsx](../frontend/src/components/layout/Sidebar.tsx) — rewritten in Phase 1.1 per [IA.md §2](IA.md):

```
Dashboard
BUILD     Campaigns • Agents • Knowledge Bases • Tools • Audiences • Content Library
OBSERVE   Live Monitoring • Call Logs • Analytics • Reports
CONFIGURE Channels • Integrations • Team & Roles • Audit Log • Workspace
                                                  ─── footer dropdown: Phase + Theme ───
```

`/templates` route deleted; `/settings*` and `/channels` redirect to `/configure/*`. `/monitoring/activity` revives Logs.tsx.

### IA misclassifications — all resolved in Phase 1.1 ✅

- ~~Audiences and Content Library under ENGAGEMENT~~ — moved to BUILD ✅
- ~~Channels under ENGAGEMENT~~ — moved to CONFIGURE ✅
- ~~No Knowledge Base entry~~ — added to BUILD as the second item ✅
- Dashboard remains orphaned at the top — kept as-is (correct).

---

## 2. Page-by-page findings

### 2.1 Dashboard — [pages/Dashboard.tsx:1](../frontend/src/pages/Dashboard.tsx) (206 LOC)
- Phase-aware: empty state (Day 0) → segments stat (Day 1) → KPI bar + active campaign rows + Channel-Performance sneak (Day 30+).
- Hardcoded `CHANNEL_PERF` (line 31) duplicates per-channel mock data that also lives in `/data/mock`.
- **No "what should I do next" rail, no AI companion mounted from this screen, no recent activity, no per-agent panel.** This is the first impression — currently the weakest part.
- `Festival Cashback Promo` warning icon: per the brief, currently shown without explanation tooltip. **Confirmed; needs hover context or removal.**
- Sparkline component exists ([common/SparkLine.tsx](../frontend/src/components/common/SparkLine.tsx)) but Channel Perf uses static green squiggles, not data-driven.

### 2.2 Campaigns — [pages/Campaigns.tsx](../frontend/src/pages/Campaigns.tsx) (146 LOC)
- Filter pills (All / Active / Scheduled / Paused / Draft / Completed); CampaignCard list.
- Clean. No dark code. Sole entry to wizard via "Create Campaign" CTA.

### 2.3 CreateCampaign / CampaignWizard — [components/campaign/CampaignWizard.tsx](../frontend/src/components/campaign/CampaignWizard.tsx)
- 4 steps: **Setup → Audience → (Content&Schedule | JourneyBuilder) → Review**.
- Type toggle (`simple_send` vs `journey`) decides whether step 3 is single-channel content config or a full XYFlow journey canvas.
- **Critical loose end (line ~295):** `handleNext()` returns early on the last step with the comment *"placeholder for actual submission"*. **Launch button does nothing.** The wizard never persists a campaign. Demo-fatal.
- INITIAL_DATA shape is deeply nested with empty defaults; merge logic between the route-passed `initialData` and the defaults is shallow in places, deep in others.

### 2.4 CampaignDetail — [pages/CampaignDetail.tsx](../frontend/src/pages/CampaignDetail.tsx) (1,592 LOC)
- Shows live KPIs, journey table by sub-segment or by channel, A/B variant breakdown, AI Companion insights (Auto-Applied vs Pending).
- **Type-unsafe accesses:** `campaign.launchedAt`, `campaign.completedAt`, `campaign.roi` are not on the `Campaign` type; the file uses `as unknown` casts (line ~528) and falls back to hardcoded constants (`roi = 4.1`, line ~526).
- Hardcoded **SUB_SEGMENTS** (6 sub-segments × 3 steps), **CHANNEL_ROWS** (4), **CONTENT_VARIANTS** (3), **AUTO_APPLIED_INSIGHTS** (3), **INITIAL_PENDING_INSIGHTS** (3) all live inside the page file.
- The same SUB_SEGMENTS shape is **duplicated verbatim** in `CampaignFlow.tsx` (lines 114–342). Two sources of truth for the same demo data — they will drift.
- Approve/Dismiss insight buttons mutate local state only.

### 2.5 CampaignFlow — [pages/CampaignFlow.tsx](../frontend/src/pages/CampaignFlow.tsx) (820 LOC)
- Read-only sub-segment journey viewer. Per-channel content previews (SMS, WhatsApp, Push, Voice, Field, In-App, RCS) inline.
- `totalAudienceUsers` computed from local SUB_SEGMENTS (line ~690), **not** from `campaign.audience.size` — guaranteed to disagree if the campaign data ever changes.
- Inline preview components carry their own expand/collapse state — no persistence across navigation.

### 2.6 EditCampaign — [pages/EditCampaign.tsx](../frontend/src/pages/EditCampaign.tsx) (127 LOC)
- Loads the wizard with seeded data. Budget conversion (line ~46) divides by 100,000 (assumes lakhs); fragile if the campaign came from a different shape.

### 2.7 Audiences — [pages/Audiences.tsx](../frontend/src/pages/Audiences.tsx) (603 LOC)
- Stats (Total Synced / Max Reachable / Saved Segments / Reachable by Channel), AI-recommended carousel (3 hardcoded `RECOMMENDATION_SEEDS`), saved segments grid.
- **"Edit" on a segment opens a "Segment editor coming soon" toast (line ~585).** Dead button.
- The AI segment "approve" path doesn't run any model — it just promotes a hardcoded card into the saved-segments list with `segmentSource: 'ai'`.

### 2.8 Segment creation routes — [pages/CreateSegmentSource.tsx](../frontend/src/pages/CreateSegmentSource.tsx) / [Filters](../frontend/src/pages/CreateSegmentFilters.tsx) / [Csv](../frontend/src/pages/CreateSegmentCsv.tsx)
- Source page is a 2-card decision tree: rule-builder vs CSV upload.
- Filter wizard: 5 steps (Details, Conditions, Exclusions, Settings, Review). Solid.
- CSV wizard: 3 steps (Upload, Map Fields, Review). Solid.
- **No AI segment route exists.** Goal-based AI segmentation (scope point 13) is unimplemented; the only "AI" presence is the carousel of hardcoded cards on the Audiences page.
- **Propensity-scored upload (scope point 3) is not natively supported** — CSV mapping has phone, name, email, DPD bucket, outstanding amount, opt-in flags. To upload propensity scores, a user would have to map a column as "custom" and there is no way to filter/segment on it afterwards.

### 2.9 ChannelConfig — [pages/ChannelConfig.tsx](../frontend/src/pages/ChannelConfig.tsx) (1,510 LOC)
- Per-channel cards, four tabs each: **Cost & Pricing / Reachability / API / Templates**.
- **Templates tab is read-only** — 60+ hardcoded sample templates (`CHANNEL_TEMPLATES`) per channel with status pills (Approved / Pending / Rejected). No create / edit / delete UI; "Edit" is decorative.
- These channel-templates **do not synchronize** with the operational templates in `/content-library`. Two separate truths.
- Includes Platform Connections subsection for WhatsApp Business / Meta Business Suite OAuth (UI only, no flow).
- File is far too large for one screen-component; due for decomposition during Phase 1.

### 2.10 Content Library — [pages/ContentLibrary.tsx](../frontend/src/pages/ContentLibrary.tsx) (71 LOC) + 7 components
- Two-tab: Templates / Media Library. Real CRUD on templates via `localStorage` ([utils/contentTemplatesStore.ts](../frontend/src/utils/contentTemplatesStore.ts)).
- Receives `newTemplate` via `location.state` from CreateContentTemplate.
- Media library is a real upload/select/manage flow ([context/MediaLibraryContext.tsx](../frontend/src/context/MediaLibraryContext.tsx)).

### 2.11 ContentIdeas — [pages/ContentIdeas.tsx](../frontend/src/pages/ContentIdeas.tsx) (132 LOC)
- AI-prompt bar + recents + idea-card grid + drawer.
- Drawer's "Customize with AI" calls Anthropic API ([utils/anthropicChat.ts](../frontend/src/utils/anthropicChat.ts)) to generate a template body.
- **Dark in sidebar.** Reachable only via deep link or URL.
- Concept overlap with `/content-library`: Ideas are inspirational presets, Library is operational. They are intentionally distinct, but a buyer hitting `/content-ideas` from a marketing email and `/content-library` from the sidebar will find two separate worlds with no obvious bridge.

### 2.12 CreateContentTemplate — [pages/CreateContentTemplate.tsx](../frontend/src/pages/CreateContentTemplate.tsx) (1,006 LOC)
- Channel/language/category/body editor with real Anthropic-API AI assist. Media field, header type, footer, button rows for WhatsApp.
- Cleanly built; one of the better surfaces in the app.

### 2.13 Templates — [pages/Templates.tsx](../frontend/src/pages/Templates.tsx) (5 LOC)
- `<Navigate to="/channels" replace />`. Pure redirect. The route exists for legacy reasons; **delete the route or repurpose it for a future unified Templates section.**

### 2.14 Agents list — [pages/Agents.tsx](../frontend/src/pages/Agents.tsx) (223 LOC)
- 4 stat cards (Total Calls, Deployed, Success Rate, Avg Duration) + grid of `AgentCard`s + empty state CTA.
- No per-agent activity feed, no campaigns-using-this-agent column, no last-deployed-on stamp surfaced.

### 2.15 AgentBuilder (voice) — [pages/AgentBuilder.tsx](../frontend/src/pages/AgentBuilder.tsx) (210 LOC)
- **6 steps** (lines 14–21): Basic Info → Model & Voice → System Prompt → Instructions → Advanced → Review & Deploy.
- **PRD claims 7 steps including Conversation Flow.** False. `FlowStep` is imported (line 55) but never added to `STEPS`. **The XYFlow conversation-flow builder is orphaned.**
- `ToolsStep` is also imported but never rendered. Tool attachment lives entirely inside `InstructionsStep` instead.
- **No Knowledge Base step.** This is a hard gap against the brief's §9 — the KB section does not exist on this surface.
- DEFAULT_CONFIG (lines 23–103) carries chat-only fields (`chatChannel`, `chatLanguages`, `chatWhatsAppAccountId`, etc.) into the voice builder; they are silently ignored at deploy time but inflate the type and the wire payload.
- "Generate with AI" button on Instructions step ([InstructionsStep.tsx:177](../frontend/src/components/agents/builder/InstructionsStep.tsx)) ignores the user's prompt input and always returns a hardcoded loan-recovery 4-step template (`buildLoanRecoverySampleSteps()`).

### 2.16 ChatAgentBuilder — [pages/ChatAgentBuilder.tsx](../frontend/src/pages/ChatAgentBuilder.tsx) (180 LOC)
- 3-step wizard (Setup, Prompt & Instructions, Test & Deploy). Separate code path from the voice builder; **no shared step components.** Maintenance liability.
- Defaults to WhatsApp; channel field is hardcoded.

### 2.17 AgentDetail — [pages/AgentDetail.tsx](../frontend/src/pages/AgentDetail.tsx) (204 LOC)
- 4 tabs: Performance Metrics / Call Transcripts / Prompt Enhancement / Failure Analysis. Plus Live Test Console.
- **TestConsole is a stub** ([components/agents/evaluate/TestConsole.tsx](../frontend/src/components/agents/evaluate/TestConsole.tsx)): `setTimeout(3000)` simulation, hardcoded results (2m 15s duration, 385 ms latency, $0.23 cost). No real call.
- **No link to Tools** the agent uses; **no link to Campaigns** that reference the agent. `CallTranscript.metadata.campaignId` is in the type ([types/agent.ts:227](../frontend/src/types/agent.ts)) but never surfaced.
- **No "promote bad call to eval" affordance** anywhere — the single most important UX moment from Vapi (per brief §7) is absent.
- "Edit Configuration" button points to `/agents/:id/edit` — **route does not exist** in `routes.tsx`. Dead button.
- Mock evaluate components ignore the `agentId` prop entirely; same data renders for every agent.

### 2.18 Tools — [pages/Tools.tsx](../frontend/src/pages/Tools.tsx) (498 LOC)
- 2-pane: tool category list + ToolConfigPanel.
- "Create Tool", "Add Knowledge Base", "Add Message", "Code" buttons all dead.
- Save button always shows "Saved"; no validation.
- `KnowledgeBase` type exists in [types/tool.ts](../frontend/src/types/tool.ts) but never instantiated anywhere.
- No reverse linkage: cannot see which agents use a tool.

### 2.19 Analytics — [pages/Analytics.tsx](../frontend/src/pages/Analytics.tsx) (685 LOC)
- 3 tabs: Overview / Campaigns / Agents. Solid Recharts visuals.
- 4 hardcoded `AI_RECOMMENDATIONS` per tab (opportunity / warning / optimization / insight) with confidence bars. **No "Apply" / "Dismiss" wired to state.** No tracking of dismissal.
- Recommendations decorate but do not drive action.

### 2.20 Reports — [pages/Reports.tsx](../frontend/src/pages/Reports.tsx) (333 LOC)
- 4 stat cards, 4-week perf charts, channel donut, 4 hardcoded saved-report cards.
- Export buttons are visual only. No scheduling, no real generation.
- **Dark in sidebar.** Reachable by URL only.

### 2.21 Settings — [pages/Settings.tsx](../frontend/src/pages/Settings.tsx) (1,341 LOC)
- 4 tabs: Data Sources / Channels / Billing / Team.
- **Team tab has 4 hardcoded users with role badges (Admin / Editor / Viewer).** No invite flow, no permission matrix, no SSO config, no 2FA, no API key management.
- **No audit log.** Scope point 10 (users, roles, audit logs) is partially fulfilled at best — roles are visual, audit is absent.
- Channels sub-tab duplicates the ChannelConfig page's Cost & API surfaces in a smaller form.
- Billing is static usage breakdown; no invoice generation, no export.

### 2.22 Integrations — [pages/Integrations.tsx](../frontend/src/pages/Integrations.tsx) (284 LOC)
- 21 integrations across Data / CRM / Telephony / Messaging / Productivity / Developer.
- Drawer opens on Connect; OAuth / API-key forms are visual only ([components/integrations/IntegrationsDrawer.tsx](../frontend/src/components/integrations/IntegrationsDrawer.tsx)).
- Test Connection / Save are no-ops.
- Reasonable foundation; needs no major surgery, just decoration removal and copy tightening.

### 2.23 Logs (DARK CODE) — [pages/Logs.tsx](../frontend/src/pages/Logs.tsx) (330 LOC)
- Fully built activity feed: 10 mock log entries, level filters (success / info / warning / error), source filters (agents / campaigns / system), expandable rows with metadata key-value pairs, search.
- **Not registered in [routes.tsx](../frontend/src/app/routes.tsx).** Reachable from no link in the app.
- Recommendation: this is high-quality work and exactly the surface the brief wants for live monitoring (golden-flow step 8). **Revive it as `/monitoring/activity` or merge it into a new Observability section.**

---

## 3. Mock data shape & consistency

Source: [frontend/src/data/mock/](../frontend/src/data/mock/), [frontend/src/data/](../frontend/src/data/)

| Entity | File | Notes |
|---|---|---|
| Campaigns | `mock/base/campaigns.ts` | 5 campaigns; IDs `camp-001`…`camp-005`; reference segments by ID; rich metrics + 7-day trend |
| Segments | `mock/base/segments.ts` | 5 segments; IDs `seg-001`…`seg-005`; per-channel reachability; LTV / geography / age attributes |
| Insights | `mock/base/insights.ts` + `day0/`, `day1/` | Typed by `minPhase`; filtered at runtime |
| Analytics | `mock/base/analytics.ts` | Day 30 totals, channel breakdown, revenue/cost trend |
| Data sources | `mock/base/dataSources.ts` | 6 sources; status flipped to `disconnected` for Day 0 |
| Agents | `mock/agents.ts` | 3 agents + transcripts + AB tests; loaded by `agentStore` |
| Content templates | `mock/contentLibraryTemplates.ts` | Seed for localStorage |
| Day 30 overlays | `mock/day30/{campaigns,segments,insights,analytics,waterfalls}.ts` | Some overlap with `base/`; relationship is unclear (see below) |
| Day 0 / Day 1 overlays | `mock/day0/insights.ts`, `mock/day1/{insights,dataSources}.ts` | Filter / enrich, not full re-derivation |

**Cross-entity coherence:**
- Campaigns reference segments by ID — verified, no orphans (`camp-001.audience.segmentId === 'seg-001'`).
- Agents are siloed: no campaign references an agent, no transcript surfaces in the campaign drill-down, even though `CallTranscript.metadata.campaignId` exists.
- Hardcoded SUB_SEGMENTS in CampaignDetail/CampaignFlow are **divorced from the mock segment store** — they share no IDs with `seg-00x`. Two universes.

**Day-30 overlay vs base:** The `day30/` files appear to be parallel datasets, not modifications of `base/`. `getDay30Data()` in [mock/index.ts](../frontend/src/data/mock/index.ts:123) actually returns **`baseCampaigns` and `baseSegments`** — the `day30/*` files in `campaigns.ts`, `segments.ts`, `insights.ts`, `analytics.ts`, `waterfalls.ts` are **dead imports from this file's perspective**. They may be referenced from elsewhere; confirm during Phase 1 cleanup. **High suspicion of dead data files.**

**Domain skew:** Every mock — agent personas, campaign content, channel templates, segment names, insights, voice scripts — is **explicitly Paytm-themed** (KYC, wallet, gold, loan recovery, Aadhaar OTP). The codebase folder is even named `Picommerce-paytm`. **Per [ADR 0007](decisions/0007-stay-paytm-themed.md), this is a deliberate v1 choice** — the user has accepted the demo trade-off (showing Paytm-themed mocks to non-Paytm prospects) in exchange for not paying the rewrite cost. Demoers narrate accordingly. To re-evaluate at v2.

---

## 4. Currency / locale findings

The brief's claim of **AED appearing in spend values is not borne out by the code.** Grep across `frontend/src/**` returns zero occurrences of "AED" or "Dirham". Every monetary value in mocks, formatters ([utils/format.ts](../frontend/src/utils/format.ts)), KPI strings, and channel costs is INR (₹) — formatted as `₹X.YK / X.YL / X.YCr` via `formatINR()`.

What is true is the underlying problem the brief was reaching for: **there is no currency abstraction.** `formatINR` is hardcoded to ₹, and the lakh / crore convention is baked into the formatter. There's no workspace concept, no per-tenant locale. Per [ADR 0007](decisions/0007-stay-paytm-themed.md) this is acceptable for v1 — currency stays INR — but the three duplicate `formatINR` functions still get consolidated into one ([MOCKS_PLAN §3.1](MOCKS_PLAN.md)).

`formatINR` is **also duplicated locally** in three campaign components:
- [components/campaign/ChannelSelector.tsx:37](../frontend/src/components/campaign/ChannelSelector.tsx)
- [components/campaign/ContentScheduleStep.tsx:320](../frontend/src/components/campaign/ContentScheduleStep.tsx)
- [components/campaign/CampaignPlanStep.tsx](../frontend/src/components/campaign/CampaignPlanStep.tsx)

Two return `.toFixed(1)`, one returns `.toFixed(2)`. Numbers will disagree on the same screen.

---

## 5. Loose ends — consolidated

### 5.1 Dark code & dark routes
| Item | Location | Recommendation | Status |
|---|---|---|---|
| `pages/Logs.tsx` | unrouted | Revive as Monitoring | ✅ wired to `/monitoring/activity` (Phase 1.13) |
| `/reports` route | not in sidebar | Surface | ✅ in OBSERVE group (Phase 1.1) |
| `/content-ideas` route | not in sidebar | Surface or merge | open — Phase 3 will fold into Content Library |
| `/templates` redirect-only | trivial stub | Delete | ✅ `Templates.tsx` deleted, route now redirects to `/content-library` (Phase 1.12) |
| `FlowStep` + `ToolsStep` orphan components | unused | Wire or delete | ✅ deleted along with the entire `components/agents/flow/` folder (Phase 2.1) |
| `pages/AgentBuilder` `/edit` button → `/agents/:id/edit` | dead | Implement | ✅ route + edit-mode AgentBuilder live (Phase 2.10) |

### 5.2 Dead buttons / "coming soon" / no-ops
| Surface | Behavior | Status |
|---|---|---|
| Audiences "Edit segment" | toast | ✅ Phase 1.11 — copy now: "Segment editor lands in Phase 3" |
| ContentScheduleStep "Preview" button | `alert('Preview coming soon')` | ✅ Phase 1.11 — **button removed entirely** |
| Tools "Create Tool" | no handler | ✅ Phase 2.8 — replaced with disabled "Custom tool — coming Phase 5" affordance (honest copy) |
| Tools "Add Knowledge Base" section | wrong concept (KBs attach to agents, not tools) | ✅ Phase 2.8 — entire section removed |
| Tools "Add Message" | no handler | ✅ Phase 2.8 — message presets shown as read-only reference; dead button removed |
| Tools "Save" / "Code" buttons | fake / no handler | ✅ Phase 2.8 — both removed |
| AgentDetail "Edit Configuration" | dead route | ✅ Phase 2.10 — route + edit-mode wired |
| TestConsole "Start Test Call" | 3s setTimeout | open — Phase 2 (deliverable 2.11) |
| Instructions "Generate with AI" | hardcoded output | open — Phase 2 |
| Analytics "AI Recommendation" actions | no Apply/Dismiss state | open — Phase 4 (deliverable 4.13) |
| Reports "Export" | visual only | open — Phase 5 |
| Settings data source "Connect" | toast | ✅ Phase 1.11 — copy now points to Configure → Integrations |
| Settings "Upgrade" | toast | ✅ Phase 1.11 — copy now: "handled by your account manager" |
| Settings "Team invite" | toast | ✅ Phase 1.11 — copy now: "Team management lands in Phase 5" |
| ChannelConfig OAuth / Templates / Ad-account toasts (10 sites) | toasts | ✅ Phase 1.11 — copy rewritten |
| Integrations Drawer "Save" / "Test Connection" | no-op | open — Phase 5 |
| **Campaign Wizard "Launch Campaign"** — **placeholder return; does not create the campaign** | demo-fatal | open — **Phase 3 (deliverable 3.7)**. Highest-priority demo blocker. |

Final grep: zero `coming soon` strings across `frontend/src/**` after Phase 1.11.

### 5.3 Duplicate / divergent concepts
| Concept | Status |
|---|---|
| Templates: ChannelConfig (hardcoded) vs Content Library (CRUD) | open — Phase 3 unifies; Phase 1.11 rewrote ChannelConfig toasts to point at Content Library |
| Sub-segment journey data: CampaignDetail vs CampaignFlow inline | 🟡 partially deferred — different shapes; Phase 3 reconciles |
| `formatINR` three local copies | ✅ Phase 1.7 — single canonical version in `utils/format.ts`; `formatChannelCost` shared too |
| Dashboard `CHANNEL_PERF` inline | ✅ Phase 1.8 — extracted to `data/mock/dashboard.ts` (ready to derive from analytics in Phase 5) |
| Agent attachment to tools (Tools page orphan) | ✅ Phase 2.8 — Tools page now shows "Used by N agents" counts in the list and agent chips on the detail panel |
| Voice & chat agent builders are separate codebases | open — Phase 2 (deliverable 2.3) |
| Dead day0/day1/day30 mock files (7 files unreferenced) | ✅ Phase 1.8 — deleted |

### 5.4 Type-safety smells
- [CampaignDetail.tsx:~528](../frontend/src/pages/CampaignDetail.tsx) — `as unknown` casts to read fields not present on the `Campaign` type.
- `AgentConfiguration` ([types/agent.ts](../frontend/src/types/agent.ts)) is a union-of-everything-flat; voice configs carry chat fields and vice versa. Either narrow with discriminated unions or delete the unused fields.

### 5.5 PRD divergences
[memory/PRD.md](../memory/PRD.md) is stale. Specifically:
- Claims **7-step** voice agent builder including a Conversation Flow step. Code has **6 steps**; flow step is orphaned.
- Claims `/logs` is a registered route. It is not.
- Lists "BUILD: Campaigns, Agents, Tools / PERFORMANCE: Analytics, Reports / ENGAGEMENT: Audiences, Channels". Code has Reports dark and Content Library in ENGAGEMENT.
- Misses `/content-library`, `/content-ideas`, `/agents/new/chat`, segment creation sub-routes.

[docs/PRD.md](PRD.md) (the docs version) is more accurate but also pre-dates the agent repositioning. **Treat both as historical reference; this AUDIT is now the canonical map.**

---

## 6. Scope coverage matrix (21 points)

| # | Capability | Coverage | Where | Verdict |
|---|---|---|---|---|
| 1 | CRM / contact upload | Partial | Integrations catalog (UI), CSV segment import | UI-only on integrations; CSV works |
| 2 | DIY rule-based segmentation | ✅ | CreateSegmentFilters | Solid |
| 3 | Propensity-scored upload | ❌ | — | Need column type "score" + filtering UI |
| 4 | Compliant content gen | Partial | CreateContentTemplate (Anthropic-backed AI assist) | India languages exist as options; compliance-aware copy generation needs work |
| 5 | Single-step multichannel campaigns | Partial | CampaignWizard | Wizard exists; **launch is broken** |
| 6 | **Outbound voice agent** | Partial | AgentBuilder | 6 steps; no KB; no real test; no live monitoring |
| 7 | Inbound WhatsApp chat agent | Partial | ChatAgentBuilder | Separate codebase; works; no inbound-trigger surface |
| 8 | Pre-built dashboards (funnel, channel, ROI) | Partial | Analytics, Reports | Hardcoded data; recommendations decorative |
| 9 | A/B with auto-winner | Partial | ContentScheduleStep, JourneyNodeConfigPanel `ab_split` | Setup yes; results UI no; auto-winner no |
| 10 | Users / roles / audit logs | ❌ partial | Settings → Team (visual roles only) | No audit, no permission matrix |
| 11 | Delivery-team workflows | ❌ | — | No "internal tools" surface; no on-behalf mode |
| 12 | Smart channel/timing selection | Partial | ChannelSelector phase-aware historical conversion | Recommendations exist but no rule engine surface |
| 13 | Goal-based AI segmentation | ❌ | — | Recommendation cards are hardcoded; no goal input → segment generation |
| 14 | Client uploads scores / DS team scores | Partial | CSV import | No score column type; no DS-team scoring surface |
| 15 | Batch ingestion (honest) | ✅ | data sources show last-synced timestamps | Fine |
| 16 | Custom attribute creation gated | ❌ | — | No attribute governance UI |
| 17 | "Request a dashboard" affordance | ❌ | — | Reports page has no "request" CTA |
| 18 | Per-channel frequency caps | Partial | ContentScheduleStep `frequencyCap` (`once / once_per_day / cooldown`) | UI exists; no enforcement display |
| 19 | No CleverTap migration tool | ✅ | absent | Correct |
| 20 | No self-improving AI on client data | Partial | AI Recommendations are hardcoded; OK; but PromptEnhancement surface implies self-improvement | Need honesty pass on copy |
| 21 | High-touch engagement model | ❌ | — | No surface that says "delivery team is configuring this for you" |

**Coverage summary:** ✅ 4 / Partial 12 / ❌ 5 / out-of-scope confirmed 1. Most gaps are in *governance* (10, 11, 16, 17, 21) and *AI realism* (13).

---

## 7. Hero flow trace (the 9-step golden flow on today's build)

| # | Step | Where it lives today | What works | What breaks |
|---|---|---|---|---|
| 1 | **Create an Agent** | `/agents/new` → AgentBuilder | 6 steps wired; deploy creates agent in `agentStore` | No KB step; FlowStep orphaned; "Generate with AI" stubbed; no review-step warnings |
| 2 | **Test the Agent** | AgentDetail → Live Test Console | Console UI present | Hardcoded 3 s simulation; no transcript stream; no tool-call visual; no latency real-time |
| 3 | **Open Campaign Builder** | `/campaigns/new` | Setup step works | Type toggle (`simple_send` / `journey`) is buried; no template-gallery entry |
| 4 | **Select Audience** | AudienceStep | Segment picker works; CSV upload simulation works | High-intent filter only on segment mode; AI segment path is hardcoded; no goal-based generation |
| 5 | **Configure Campaign** | ContentScheduleStep | Sender configs, schedule modes, A/B traffic split, frequency caps all surface | "Preview" button is dead; sender accounts hardcoded to Paytm |
| 6 | **Plug Agent into Campaign** | (the marquee moment) | **Does not exist.** AI Voice channel content editor is a script form; no agent-picker. | P0 missing capability |
| 7 | **Launch** | Wizard → Review → Launch | Review step renders | **`handleNext` returns early on launch (CampaignWizard:~295). No campaign is persisted. No redirect, no toast.** Demo-fatal |
| 8 | **Observe** | (would be Live Monitoring) | Logs.tsx (dark code) is the closest surface | Not routed; no live counter; no calls-in-flight panel |
| 9 | **Evaluate** | AgentDetail tabs | Performance / Transcripts / Prompt Enhancement / Failure Analysis exist | All ignore `agentId`; same data for every agent; no promote-to-eval action; no aggregate eval dashboard; no eval test cases at all |

**Worst breaks (in demo-criticality order):**
1. **Launch button does nothing** — the hero flow ends in a no-op.
2. **Agent cannot be plugged into a campaign** — the marquee moment of the brief.
3. **Live Test Console doesn't actually test** — buyer asks "can it talk?" and the answer is "yes but only to a `setTimeout`".
4. **No promote-bad-call-to-eval loop** — the single best UX idea from Vapi (per brief §7), absent.
5. **No Knowledge Base** — first-class section missing.
6. **Eval data ignores agent ID** — same numbers for every agent; instantly noticed by a tech lead.
7. **PromptEnhancement / FailureAnalysis are mock** — fine for a demo, but cannot be drilled into.
8. **Analytics recommendations have no actions** — decorative.

---

## 8. Recommendations summary (action lives in PHASING.md)

**Delete:**
- `/templates` redirect route, `Templates.tsx`
- `pages/AgentBuilder.tsx` import of `FlowStep` and `ToolsStep` (or wire them in)
- Inline SUB_SEGMENTS in CampaignFlow / CampaignDetail (move to mocks)
- Three local `formatINR` functions (consolidate to one)
- "Coming soon" alerts and Edit Segment toast (replace with real implementations or remove)

**Reposition:**
- Audiences and Content Library out of ENGAGEMENT into BUILD
- Channels out of ENGAGEMENT into a CONFIGURE group (alongside Settings → Channels)
- Reports either folds into Analytics as a fourth tab or gets a sidebar entry
- ContentIdeas folds into Content Library as a "Browse Ideas" tab
- Logs revives as `/monitoring/activity` under a new OBSERVE group

**Add:**
- Knowledge Bases as a top-level BUILD section (see [KB_SPEC.md](KB_SPEC.md))
- Eval test cases as part of agent observability (see [EVAL_SPEC.md](EVAL_SPEC.md))
- Agent picker inside the campaign wizard's AI-Voice channel block
- Real Launch handler in CampaignWizard that persists to a (mock) store and navigates to detail
- Per-tenant currency / locale (see [MOCKS_PLAN.md](MOCKS_PLAN.md))

**Rename / harmonize:**
- "Outreach Manager" / "Pi-commerce" / "Commerce" / "outreach-manager-app" — pick one product name in code (out of scope to rename product, but stop using three)
- ~~All mock data shifts to fictional client~~ — **rejected** per [ADR 0007](decisions/0007-stay-paytm-themed.md); content stays Paytm-themed. Only structural cleanup per [MOCKS_PLAN.md §3](MOCKS_PLAN.md).

---

## 9. Source-of-truth list

When in doubt during Phase 1, trust:
- `frontend/src/app/routes.tsx` over either PRD
- This AUDIT.md over either PRD
- Code over comments
- `data/mock/base/*` over inline component constants
