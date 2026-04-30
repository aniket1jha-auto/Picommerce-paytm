# IA — Information Architecture

**Date:** 2026-04-28
**Companion docs:** [AUDIT.md](AUDIT.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [decisions/0002-ia-restructure.md](decisions/0002-ia-restructure.md)

> The IA decides what the buyer thinks the product *is*. Today the IA reads "campaign tool with agents bolted on." We need it to read "agent platform that runs campaigns." Sidebar order, group labels, and what gets featured all change.

---

## 1. Current sidebar (verified against code)

Source: [frontend/src/components/layout/Sidebar.tsx](../frontend/src/components/layout/Sidebar.tsx)

```
Dashboard
BUILD       Campaigns • Agents • Tools
PERFORMANCE Analytics
ENGAGEMENT  Audiences • Channels • Content Library
SETTINGS    Integrations • Settings
```

### Critique

| Issue | Why it hurts |
|---|---|
| ~~**Campaigns listed before Agents**~~ — *kept; user direction* | Campaigns-first matches buyer expectation; the agent-led story is reinforced inside the campaign flow (agent picker on AI-Voice channel, prompt-variant choice, KB attached) rather than by sidebar order. |
| **Audiences in ENGAGEMENT** | A segment is a build artifact, not an engagement surface. Engagement is what you *do with* artifacts. |
| **Content Library in ENGAGEMENT** | Same reason. A template is a build artifact. |
| **Channels in ENGAGEMENT** | Channels is configuration — costs, API keys, reachability rules. This is a settings concept. |
| **No Knowledge Bases entry** | The single biggest gap given the agent-platform repositioning. |
| **No observability surface** | Live monitoring, call logs, audit logs all need a home. Logs.tsx exists but is dark code. |
| **Reports dark in sidebar** | Route exists, no nav. |
| **Content Ideas dark in sidebar** | Route exists, no nav. |
| **PERFORMANCE has one item** | A group label for a single child is dead weight. |
| **Tools sits in BUILD** | This is correct — keep — but Tools belongs *adjacent to* Agents, not in the same flat list as Campaigns. |
| **Settings + Integrations both top-level** | Integrations is part of Settings. The duplication adds noise. |
| **"BUILD / PERFORMANCE / ENGAGEMENT"** | "Engagement" is jargon. Buyers and operators use plain words. |

---

## 2. Proposed sidebar

```
Dashboard

BUILD
  Campaigns           ← first. The surface buyers come looking for.
  Agents              ← second. Voice + chat agents — the differentiator inside the build flow.
  Knowledge Bases     ← new. Sits adjacent to Agents because that's where it plugs in.
  Tools
  Audiences           ← moved from ENGAGEMENT
  Content Library     ← moved from ENGAGEMENT

OBSERVE                ← new group
  Live Monitoring     ← new (replaces dark Logs.tsx)
  Call Logs           ← new (drill-down inventory of all agent calls)
  Analytics
  Reports             ← surface; was dark

CONFIGURE              ← renamed from SETTINGS for plain-language clarity
  Channels            ← moved from ENGAGEMENT
  Integrations
  Team & Roles        ← split out of Settings
  Audit Log           ← new (scope point 10)
  Workspace           ← renamed from "Settings"; covers data sources, billing, preferences
```

### Why this order

**BUILD** is what buyers look at first when they're trying to understand "what does this thing do?" Campaigns is the first item — buyers from a marketing-cloud background scan for it on landing, and we don't make them hunt. Immediately below, Agents and Knowledge Bases sit prominently — that's the **voice + chat agent story** the product leads on. By the time the buyer has read the first three items, they've understood: this runs campaigns, *and* the campaigns are powered by voice and chat agents that read your knowledge. Tools next, because tools attach to agents. Audiences and Content Library sit lower in BUILD because they are inputs that feed the campaigns above.

**OBSERVE** is the post-build story: the buyer asks "okay it built — now what?" and gets a coherent answer (monitoring → calls → aggregate analytics → reports). This group makes the eval / observability story visible in the IA itself, not buried inside a single agent's detail page.

**CONFIGURE** owns the plumbing: channel costs, third-party integrations, team management, audit logs, workspace-level settings. Nothing here changes the product story — it's the boring-but-necessary stuff. Renaming "Settings" to "Workspace" lets the group label be "Configure" without that becoming "Configure → Settings".

### What's renamed / merged / new

| Old | New | Reason |
|---|---|---|
| `BUILD` | `BUILD` | Kept; reordered |
| `PERFORMANCE` | `OBSERVE` | Plainer; covers more than aggregate metrics |
| `ENGAGEMENT` | (removed) | Concept dissolved into BUILD + CONFIGURE |
| `SETTINGS` | `CONFIGURE` | Verb; matches BUILD + OBSERVE pattern |
| Audiences (ENGAGEMENT → BUILD) | unchanged | Repositioned |
| Channels (ENGAGEMENT → CONFIGURE) | unchanged | Repositioned |
| Content Library (ENGAGEMENT → BUILD) | unchanged | Repositioned |
| Settings (top-level) | `Workspace` (CONFIGURE child) | Demoted |
| Integrations (top-level) | (CONFIGURE child) | Demoted |
| (nothing) | Knowledge Bases | New, BUILD |
| (nothing) | Live Monitoring | New, OBSERVE |
| (nothing) | Call Logs | New, OBSERVE |
| (nothing) | Team & Roles | Split out for emphasis (scope 10) |
| (nothing) | Audit Log | New (scope 10) |
| Reports (dark) | (OBSERVE child) | Surfaced |
| Content Ideas (dark) | (folded into Content Library as a tab) | De-duped |
| `/templates` redirect | (deleted) | Was redirect-only |

---

## 3. Routing tree (proposed)

| Path | Page / surface | Scope point | Phase to land |
|---|---|---|---|
| `/` | Dashboard (re-imagined: cross-section landing with "next action" rail) | 8 | 1 |
| `/agents` | Agents list (cards with status, last-deployed, used-by-campaigns count) | 6,7 | 2 |
| `/agents/new` | Voice agent builder (7 steps incl. KB) | 6 | 2 |
| `/agents/new/chat` | Chat agent builder (3 steps; share components) | 7 | 2 |
| `/agents/:id` | Agent detail — overview tab default | 6,7 | 2 |
| `/agents/:id/edit` | Agent editor (re-uses builder; pre-filled) | 6,7 | 2 |
| `/agents/:id/test` | Live test console (real or convincing) | 6 | 2 |
| `/agents/:id/transcripts` | Per-agent transcripts list | 6 | 4 |
| `/agents/:id/transcripts/:callId` | Single call drill-down (transcript + tool calls + KB retrievals + sentiment) | 6 | 4 |
| `/agents/:id/eval` | Aggregate eval dashboard (pass rates, failure modes, scorecard) | 6 | 4 |
| `/agents/:id/eval/cases` | Eval test cases list (incl. promoted-from-call ones) | 6 | 4 |
| `/agents/:id/eval/cases/new` | Create eval case | 6 | 4 |
| `/agents/:id/prompt-enhancements` | Prompt enhancement queue | 6 | 4 |
| `/agents/:id/failures` | Failure analysis | 6 | 4 |
| `/knowledge-bases` | KB list | 6 | 2 |
| `/knowledge-bases/new` | KB create (file upload primary) | 6 | 2 |
| `/knowledge-bases/:id` | KB detail (documents, chunking, retrieval test) | 6 | 2 |
| `/tools` | Tools list + config | 6,7 | 2 |
| `/tools/:id` | Tool detail (incl. agents-using-this-tool) | 6,7 | 2 |
| `/audiences` | Segments hub | 1,2,3,13 | 3 |
| `/audiences/segments/new` | Source chooser (3 cards: Rule, AI Goal, Upload) | 2,3,13 | 3 |
| `/audiences/segments/new/rule` | Rule wizard | 2 | 3 |
| `/audiences/segments/new/ai` | Goal-based AI segmentation | 13 | 3 |
| `/audiences/segments/new/upload` | CSV / propensity upload | 1,3,14 | 3 |
| `/audiences/segments/:id` | Segment detail (read-only) | 2 | 3 |
| `/audiences/segments/:id/edit` | Segment edit (real, not "coming soon") | 2 | 3 |
| `/content-library` | Templates + Media + Ideas (3 tabs) | 4 | 3 |
| `/content-library/templates/new` | Create template (AI-assisted) | 4 | 3 |
| `/content-library/templates/:id/edit` | Edit template | 4 | 3 |
| `/campaigns` | List | 5 | 3 |
| `/campaigns/new` | Wizard (template path or journey path) | 5,9 | 3 |
| `/campaigns/:id` | Detail | 5,8 | 3 |
| `/campaigns/:id/flow` | Journey view | 5 | 3 |
| `/campaigns/:id/edit` | Edit | 5 | 3 |
| `/monitoring` | Live monitoring dashboard | 8 | 4 |
| `/monitoring/activity` | Activity feed (revived Logs.tsx) | 8,11 | 4 |
| `/monitoring/calls` | Call logs (filterable, the eval-promotion entry point) | 6,8 | 4 |
| `/monitoring/calls/:id` | Single call drill-down | 6 | 4 |
| `/analytics` | Analytics tabs (Overview / Campaigns / Agents) | 8 | 5 |
| `/reports` | Reports + "Request a dashboard" CTA (scope 17) | 8,17 | 5 |
| `/configure/channels` | Channel config | 5,12,18 | 5 |
| `/configure/integrations` | Integrations | 1,11,16 | 5 |
| `/configure/team` | Team & roles | 10 | 5 |
| `/configure/audit-log` | Audit log | 10 | 5 |
| `/configure/workspace` | Workspace settings (data sources, billing, preferences, currency / locale) | 11,15 | 5 |

**Routes deleted:**
- `/templates` (redirect-only stub)

**Routes preserved but re-grouped:** all surviving routes from the current build map cleanly. No breaking renames except `/settings/*` → `/configure/*` (handled by redirects during the migration).

---

## 4. Cross-section navigation

The IA must support the golden flow as a *visible thread*, not a series of dead-end pages. Specific cross-links:

### Agent ↔ Campaign
- **AgentDetail** shows a "Used by N campaigns" chip linking to a filtered Campaigns list.
- **CampaignDetail** for a campaign with an AI-voice channel shows the agent name as a clickable chip back to `/agents/:id`.
- **Campaign wizard, AI-voice channel block:** an "Attach agent" picker (the marquee moment). Clicking "Edit agent" deep-links to `/agents/:id/edit`.

### Agent ↔ Tool
- **AgentDetail** shows tools the agent uses; clicking opens the Tool detail.
- **Tool detail** shows agents using the tool; clicking opens the agent.

### Agent ↔ KB
- **AgentDetail** shows attached KBs with chunk counts and last-updated; clicking opens KB detail.
- **KB detail** shows agents that use this KB.

### Agent ↔ Eval
- **Single call drill-down** has a "Promote to eval" button that creates a test case in this agent's eval suite.
- **Eval cases list** links back to source calls.

### Campaign ↔ Segment, Channel, Template
- CampaignDetail surfaces segment, channels, templates as chips → each links to its own detail page.
- Segment detail shows campaigns using this segment.
- Template detail shows campaigns using this template.

### Monitoring ↔ everything
- Live monitoring rows for an active call link to the call drill-down.
- Activity feed entries for "Campaign launched" / "Agent deployed" link to the entity.

### Dashboard
- Pinned "Next action" rail surfaces ≤3 recommendations: e.g., "Test agent X before launching campaign Y" (action: open test console). Each links into the relevant section.

---

## 5. Where Knowledge Bases lands and why

**Top-level under BUILD, second item, right after Agents.**

Reasoning:
1. The brief explicitly says (§9) "a buyer should look at this and immediately understand how knowledge plugs into the agent." Sidebar visibility from the first 30 seconds is the strongest possible signal.
2. KB is a build artifact, like a tool or a template — it gets created once, attached to many agents.
3. Putting KB under "Tools" or inside "Agents" hides it from the IA. The 30-second test fails.
4. Buyers compare us to Vapi (assistants) + a RAG product (Pinecone / vector DBs) + a campaign tool (Braze). Having KB at the same hierarchical level as Agents and Tools matches that mental model.

Surface details are in [KB_SPEC.md](KB_SPEC.md).

---

## 6. Empty / loading / error patterns (IA implications)

Each section gets a designed empty state that **moves the user toward the next golden-flow step**:

| Section | Empty-state primary CTA |
|---|---|
| Agents | "Create your first agent" → `/agents/new` |
| Knowledge Bases | "Create a knowledge base" → `/knowledge-bases/new`, with a secondary "or upload sample data" |
| Tools | "Create your first tool" |
| Audiences | "Build a segment" → source chooser |
| Content Library | "Create a template" |
| Campaigns | "Create your first campaign — uses your existing agents and segments" |
| Monitoring | "No active campaigns yet — when one launches, you'll see live activity here" |
| Reports | "No reports yet" + "Request a custom dashboard" (scope 17) |
| Audit Log | "No events yet" |

These empty states *enforce* the IA narrative. A user who lands cold gets pulled along the spine.

---

## 7. Migration plan (route-level)

Phase 1 work — purely structural:
1. Add new sidebar layout + group labels per §2.
2. Add stub pages for `/knowledge-bases`, `/monitoring/*`, `/configure/*` (empty states only; full work in later phases).
3. Implement redirects: `/settings` → `/configure/workspace`, `/settings/integrations` → `/configure/integrations`, `/templates` → 404 (or to `/content-library` for the old redirect chain).
4. Add new routes per §3 with placeholders.
5. Delete `pages/Templates.tsx`.
6. Move ContentIdeas content into Content Library as a tab; keep `/content-ideas` as a redirect for one phase, then delete.
7. Wire Logs.tsx into `/monitoring/activity`.
8. Add cross-section links per §4 (one phase at a time as those sections come online).

No code persistence changes; no breaking type changes. Pure IA + nav.

---

## 8. What does *not* change in the IA

- Per-agent tabs inside `/agents/:id` (keep tabbed structure; just add Eval / Cases / KB tabs over time).
- Wizard step shells (campaign + agent builders keep the multi-step pattern; specific steps will change).
- Per-page layout patterns (header + content + optional companion rail).
- Phase indicator (Day 0 / 1 / 30) — relocated to a small dropdown in the sidebar footer (next to the collapse toggle), kept accessible but unobtrusive. It's a demo control, not a navigation surface.
