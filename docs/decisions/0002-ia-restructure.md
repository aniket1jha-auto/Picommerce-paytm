# ADR 0002 — IA restructure: BUILD / OBSERVE / CONFIGURE

**Status:** Proposed (Phase 0)
**Date:** 2026-04-28

---

## Context

Today's sidebar has `BUILD / PERFORMANCE / ENGAGEMENT / SETTINGS` groups. Audiences and Content Library are under ENGAGEMENT (they are build artifacts), Channels is under ENGAGEMENT (it's configuration), Knowledge Bases doesn't exist anywhere, and observability lives only as a hidden Logs page. The IA reads as "campaign tool with agents added on." The brief (§2) requires the opposite: agent platform that runs campaigns.

Reorganizing the sidebar is the single highest-leverage decision a buyer reads in the first 30 seconds.

## Decision

New three-group sidebar:

- **BUILD**: Campaigns · Agents · Knowledge Bases · Tools · Audiences · Content Library
- **OBSERVE**: Live Monitoring · Call Logs · Analytics · Reports
- **CONFIGURE**: Channels · Integrations · Team & Roles · Audit Log · Workspace

Dashboard sits orphaned at the top, as it does today.

**BUILD order — Campaigns first.** The product is positioned as a Voice + Chat Agent platform *and* a Campaign manager (per user direction, 2026-04-28). Sidebar order leads with Campaigns to match buyer expectation; Agents and Knowledge Bases sit immediately below to surface the voice-first wedge prominently. The "agent-led" reading is reinforced *inside* the campaign flow — agent picker on AI-Voice channel, prompt-variant select, KB attachment — rather than by sidebar position alone.

Rationale and per-item placement: [IA.md §2 and §3](../IA.md).

## Alternatives considered

### A. Keep current grouping, just add "Knowledge Bases" under BUILD
- Pro: minimal disruption.
- Con: leaves Audiences + Content Library in ENGAGEMENT (wrong), Channels in ENGAGEMENT (wrong), no observability group, Reports still dark, /content-ideas still dark. The IA still reads as the old one.

### B. Move only the misclassified items, keep `PERFORMANCE / ENGAGEMENT / SETTINGS` labels
- Pro: smaller diff.
- Con: "PERFORMANCE" and "ENGAGEMENT" are jargon. Plain verbs (BUILD / OBSERVE / CONFIGURE) read better and signal product stance.

### C. Single flat sidebar (no groups)
- Pro: simpler.
- Con: with 14+ items, lack of grouping is overwhelming. Linear, Attio, Vapi all group.

### D. Voice / Chat / Other product split (verticals)
- Pro: surfaces voice-first messaging in IA itself.
- Con: collides with the truth that *the surfaces* (campaigns, audiences) span both. A vertical split forces duplication or arbitrary placement.

## Consequences

### Positive
- "Agents" is the first item in BUILD; the agent-platform positioning is signaled by sidebar order.
- "Knowledge Bases" sits at IA-top-level — the brief's 30-second test for KB visibility is satisfied.
- Observability gets a home. Logs.tsx revives. Buyers see "live monitoring" as a peer of "analytics" not as a tab.
- Channels moves to CONFIGURE where its per-channel cost / API / reachability config belongs.
- Verb-based group labels (BUILD / OBSERVE / CONFIGURE) form a coherent product narrative: build it, watch it, configure it.

### Negative
- Existing routes `/settings/*` move under `/configure/*`. Phase 1 ships redirects for one phase, then deletes them.
- `Reports` and `Content Ideas` becoming visible may surface unfinished UI; both need a polish pass in Phase 5 / Phase 3 respectively.
- Three top-level groups + Dashboard means the sidebar is taller; with 14 items, vertical density still fits typical 1080-tall viewports without scrolling.

### Neutral
- Some buyers will look for "Settings" by name. The Workspace item under CONFIGURE serves that mental model; we ship a redirect from `/settings`.
