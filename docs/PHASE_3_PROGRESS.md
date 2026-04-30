# Phase 3 — Progress

**Date:** 2026-04-29 (slice 1 — Campaign launch + Agent-in-Campaign; slice 2 — Content Library reorg + Campaign template gallery)
**Branch:** `claude/vibrant-chatterjee-81a38d`
**Build:** ✅ `npm run build` passes (tsc + vite, 0 errors). All four invariants pass.
**Companion docs:** [PHASING.md](PHASING.md), [DEMO_FLOW.md](DEMO_FLOW.md), [PHASE_2_PROGRESS.md](PHASE_2_PROGRESS.md)

> Phase 3's demo-critical slice. The campaign launch handler that was a `// placeholder for actual submission` no-op since Phase 0 is now real, and the marquee "plug agent into campaign" moment from the brief lights up.
>
> Demo-flow steps 5, 6, 7 are now end-to-end: Configure → Plug agent → Launch.

---

## What landed

### 3.7 — Campaign launch handler ✅

**The campaign-launch black hole is closed.** Before this slice, the wizard's `handleNext` returned early on the last step with the comment `// Launch campaign — placeholder for actual submission`. Demo-fatal — buyer walked through 4 steps and landed nowhere.

[store/campaignStore.ts](../frontend/src/store/campaignStore.ts) — new zustand store. Seeded with `baseCampaigns` so existing routes continue to render. `createCampaign(input)` returns a fully-shaped Campaign with sensible defaults (zero metrics, draft/scheduled status) and is now wired into the wizard.

[components/campaign/CampaignWizard.tsx](../frontend/src/components/campaign/CampaignWizard.tsx) — `handleNext` on the last step now calls a real `handleLaunch()`:

1. Resolves the segment from `usePhaseData().segments` and computes per-channel-average `reachable`.
2. Builds an `aiVoiceConfig` if the campaign uses `ai_voice` and an agent is attached.
3. **Validation guard**: if `ai_voice` channel is selected but no agent is attached, surfaces a warning toast and does not create. (Phase 3.9 will extend this into a full pre-launch checklist.)
4. Parses `tentativeBudget` (entered in lakh per the existing convention) into rupees.
5. Creates the campaign, fires a success toast, navigates to `/campaigns/:id`.

[hooks/usePhaseData.ts](../frontend/src/hooks/usePhaseData.ts) — campaigns now flow through `useCampaignStore`. Day 0 / Day 1 still surface no campaigns (consistent with phase narrative); Day 30 surfaces base campaigns plus any newly-created ones, deduped by ID. Existing pages (`Campaigns`, `CampaignDetail`, `CampaignFlow`, `Dashboard`) read through `usePhaseData` so they pick this up transparently.

### 3.8 — Agent picker on AI-Voice channel — the marquee moment ✅

Pre-Phase-3, the voice block of the campaign wizard had a hardcoded dropdown of four made-up names (Megha / Neha / Noor / Ava) with no link to the actual agent system. Now it's a real picker against deployed voice agents.

[components/campaign/VoiceAgentPicker.tsx](../frontend/src/components/campaign/VoiceAgentPicker.tsx) — new component, ~330 LOC.

**Empty state**: dashed-border affordance reading *"Connect a voice agent — Pick a deployed voice agent. Its prompt, knowledge sources, and tools will run this campaign's voice channel."* Click → picker modal.

**Picker modal**: search-filtered list of voice agents in the workspace, sorted by status (deployed → testing → paused → draft). Each row shows the **waveform identity**, name, version chip, status pill, description, voice + use case, and KB count. Footer has a "Build a new agent" tertiary button that opens `/agents/new` in a new tab.

**Attached state**: a card showing the connected agent:
- Header — waveform + name (link to agent detail) + version chip + status pill, voice + use case underneath.
- **Connected resources** — read-only chips showing the agent's attached KBs and tools. Buyer immediately understands "this campaign uses this agent which uses these knowledge sources."
- **Prompt variant** — surfaced as "Default" with a Lock icon, copy: *"Variant A/B selection lands in Phase 4 alongside the eval suite."* Honest about what's coming.
- **Test in console** deep link → `/agents/:id` opens in a new tab so the demoer can validate before launch without losing wizard state.
- "Change" link in the section label flips back to the picker.

[components/campaign/ContentScheduleStep.tsx](../frontend/src/components/campaign/ContentScheduleStep.tsx) — the legacy `VOICE_AGENTS` hardcoded list is deleted. The voice-channel block now renders `<VoiceAgentPicker>`. Field renamed `voiceAgent: string` → `agentId: string` throughout the senderConfig.

[components/campaign/CampaignWizard.tsx](../frontend/src/components/campaign/CampaignWizard.tsx) — `CampaignData.senderConfig.ai_voice` shape updated: `voiceAgent: string` → `agentId: string` + new optional `fallback: { onNoAnswer, onAgentError }` field.

### 3.12 — Cross-section linkage on CampaignDetail ✅

[pages/CampaignDetail.tsx](../frontend/src/pages/CampaignDetail.tsx) — when a campaign carries `aiVoiceConfig`, the page header now shows an **AttachedAgentChip** below the campaign meta. The chip has the waveform motif, agent name, version chip, and an external-link icon — clicking opens the agent detail. The same pattern AgentDetail uses (slice 2) for KBs and tools.

### Type updates ✅

[types/index.ts](../frontend/src/types/index.ts):
- New `CampaignAIVoiceConfig` interface with `agentId`, `promptVariantId?`, `fallback`, `retry`.
- `Campaign.aiVoiceConfig?: CampaignAIVoiceConfig` field.

[components/campaign/CampaignWizard.tsx](../frontend/src/components/campaign/CampaignWizard.tsx) — `CampaignData.senderConfig.ai_voice` shape updated as above.

### Mock invariant 2 active ✅

[data/mock/__invariants.ts](../frontend/src/data/mock/__invariants.ts) — new `invariant_aiVoiceCampaignsHaveDeployedAgent`:

- Every campaign with `ai_voice` in channels must reference (a) a real agent, (b) of `type: 'voice'`, (c) with `status: 'deployed'`.
- **Grandfathering**: pre-Phase-3 base campaigns that have `ai_voice` but no `aiVoiceConfig` are skipped (not failed). Phase 4 will tighten when the eval+transcript→campaign linkage lands.
- Newly-created campaigns via the launch flow are validated at runtime by the launch handler itself.

---

## Build status

```
$ npm run build
✓ 2973 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-D-bHjis7.css    123.11 kB │ gzip:  20.64 kB
dist/assets/index-6JOoLDcB.js   1,890.34 kB │ gzip: 501.82 kB
✓ built in 1.15s
```

- TypeScript: 0 errors.
- All 4 invariants pass (1, 2, 8, 9).
- Bundle: +12 KB raw / +2 KB gzip vs Phase 2 final — VoiceAgentPicker + campaignStore.

---

## Senior PM / tech lead pre-flight

The dev server is still running at `http://localhost:3002`.

### The marquee demo flow (steps 3 → 7 of [DEMO_FLOW.md](DEMO_FLOW.md))

1. **Sidebar → Campaigns → New campaign**.
2. **Step 1 — Setup**: name your campaign, set type, set a tentative budget (e.g. `4.5` for ₹4.5L), pick a goal.
3. **Step 2 — Audience**: pick *High LTV Dormant* segment.
4. **Step 3 — Content & Schedule**: select **AI Voice** channel. Notice the voice block now shows a **"Connect a voice agent"** affordance instead of the old dropdown.
5. Click **Connect a voice agent** → picker opens. See deployed agents with their waveforms, version chips, statuses. Pick *Sales Outreach Agent*.
6. **The card lights up.** It shows: waveform + agent name + v1 chip + Deployed pill, voice + use case, attached **Knowledge** chips (Paytm Product Catalog v3, Paytm KYC FAQ), attached **Tools** chips (Google Calendar, CRM, Query). Prompt variant: Default (locked, Phase 4 marker). "Test in console" link.
7. Click **Test in console** → opens `/agents/agent_1` in a new tab — confirm by clicking Start test call.
8. Back to the wizard. Configure schedule (e.g. one-time, tomorrow 10:00).
9. **Step 4 — Review** → click **Launch Campaign**. *No black hole.*
10. Toast: *"Campaign 'X' created. Scheduled. N contacts queued."*
11. Redirected to `/campaigns/:id`. The campaign detail page shows the new campaign with status `scheduled`. Below the campaign name + status, you see the **attached agent chip** with the waveform — click it → AgentDetail.

### Other things to verify

- **No-agent guard**: try selecting AI Voice but skipping the picker → click Launch → toast warns *"No voice agent attached"* and the wizard does not create the campaign.
- **Campaign list**: `/campaigns` now shows the new campaign at the top alongside the seeded ones. Refresh resets (in-memory store).
- **Phase toggle**: switch to Day 0 in the sidebar footer — campaigns disappear (consistent with the phase narrative). Switch back to Day 30 — newly-created campaigns return.
- **Cross-section round-trip**: AgentDetail (slice 2 chips) → tool deep link → Tools page reverse linkage → click any agent chip → AgentDetail. The whole agent ↔ KB ↔ tool ↔ campaign graph is now navigable in both directions.

---

## What's still mocked / out of scope this slice

- **Persistence is in-memory.** Refresh resets the campaignStore to seed. Phase 5 may add sessionStorage if low-cost.
- **Pre-launch checklist (3.9)** is minimal — only the no-agent-on-ai-voice guard fires. Phase 3.9 will land the full checklist (audience reachable, compliance flags, frequency caps, agent tested in last N hours).
- **Prompt variant A/B** is locked to Default. Phase 4 lands variant management with the eval suite.
- **Real launch** — campaigns land in `draft` (no schedule) or `scheduled` (one-time scheduled). Nothing actually sends; metrics stay at 0.

---

## What's still in Phase 3 (carried)

| # | Deliverable |
|---|---|
| 3.1 | `/audiences/segments/new` becomes 3-card chooser (Rule / AI Goal / Upload) |
| 3.2 | Goal-based AI segmentation (Anthropic) — descoped per user direction; revisit in Phase 5 |
| 3.3 | Propensity column type in CSV mapping |
| 3.4 | Real Edit Segment route |
| 3.5 | Segment detail page with cross-references |
| 3.6 | Content Library reorganized (Templates / Media / Ideas tabs) |
| 3.9 | Full pre-launch checklist on Review step |
| 3.10 | Sub-segment journey data extraction (CampaignDetail / CampaignFlow) — was Phase-1 carry-over |
| 3.11 | Campaign template gallery on `/campaigns/new` |
| 3.13 | A/B variant config tightening |

---

---

# Slice 2 — Content Library reorg + Campaign Template Gallery (2026-04-29, later same day)

> Tightens two seams the brief audit flagged. Folds the duplicate `/content-ideas`
> route into Content Library as a third tab. And replaces the abrupt blank-canvas
> /campaigns/new with the **template gallery** the golden-flow Step 3 explicitly calls for.

## What landed

### 3.6 — Content Library reorganized ✅

Three tabs: **Templates / Media Library / Ideas**. The Ideas tab folds in the
content from the deleted standalone `/content-ideas` page.

- [pages/ContentLibrary.tsx](../frontend/src/pages/ContentLibrary.tsx) —
  rewritten using the Phase 1 `Tabs` primitive (pill variant). Active tab is
  reflected in `?tab=` so deep links and the redirect from `/content-ideas`
  land on the right one. Back/forward navigation honored.
- [components/content-library/IdeasTab.tsx](../frontend/src/components/content-library/IdeasTab.tsx) —
  new component, body lifted from the old ContentIdeas page (AI prompt bar,
  Recents carousel, ideas grid, drawer for "Customize with AI"). Page chrome
  dropped — ContentLibrary owns the page-level header now.
- [pages/ContentIdeas.tsx](../frontend/src/pages/ContentIdeas.tsx) — **deleted**.
- [app/routes.tsx](../frontend/src/app/routes.tsx) — `/content-ideas` now
  redirects via `<Navigate to="/content-library?tab=ideas" replace />`.

### 3.11 — Campaign template gallery ✅

`/campaigns/new` no longer dumps the user into an empty wizard — it now lands
on a chooser-and-gallery surface, then the wizard with seeded data.

- [data/mock/campaignTemplates.ts](../frontend/src/data/mock/campaignTemplates.ts) — 8 Paytm-themed templates, grouped by category:

| Template | Category | Channels | Suggested agent | Budget |
|---|---|---|---|---|
| High-LTV Re-engagement | Retention | WhatsApp + AI Voice | Sales Outreach | ₹4.5L |
| KYC Completion Drive | Acquisition | SMS + WhatsApp + Field Exec | — | ₹8L |
| Loan Recovery — DPD 30 | Recovery | AI Voice + WhatsApp | Loan Recovery | ₹3.5L |
| Festive Cashback Promo | Engagement | SMS + WhatsApp | — | ₹12L |
| Pre-approved Loan Push | Cross-sell | WhatsApp + AI Voice | Sales Outreach | ₹6L |
| Wallet Inactive Win-Back | Retention | SMS + Push | — | ₹2.5L |
| Gold SIP Pitch | Cross-sell | WhatsApp + AI Voice | Sales Outreach | ₹3L |
| Loyalty Wave | Engagement | SMS + Push + In-app | — | ₹5L |

Each template references real entities — `suggestedSegmentId` resolves in
`baseSegments`, `suggestedAgentId` resolves in `mockAgents`. So picking the
template seeds the wizard with consistent state that the Phase-1 invariant
checker is happy with.

- [components/campaign/CampaignTemplateGallery.tsx](../frontend/src/components/campaign/CampaignTemplateGallery.tsx) — new component, ~190 LOC:
  - **Two-card start chooser** at the top: "Use a template" (highlighted as primary path) / "Build a journey".
  - Below, an 8-template grid grouped by category. Search-filterable. Each
    card shows: icon + brand-tinted accent, title, one-line description,
    channels (icon row), suggested segment, voice agent chip (if any),
    tentative budget.
- [pages/CreateCampaign.tsx](../frontend/src/pages/CreateCampaign.tsx) —
  rewritten as a 2-stage flow: Gallery → Wizard. The wizard receives
  `initialData` derived from the picked template (or empty for blank
  paths). A **"Back to templates"** link sits above the wizard so users
  can pivot without losing the URL.

## Build status

```
$ npm run build
✓ 2975 modules transformed.
dist/index.html                     0.74 kB │ gzip:   0.41 kB
dist/assets/index-zec9dciM.css    123.35 kB │ gzip:  20.66 kB
dist/assets/index-D2qUL6h7.js   1,901.10 kB │ gzip: 504.97 kB
✓ built in 1.23s
```

- TypeScript: 0 errors. (Caught one unused import on first run; fixed.)
- All 4 invariants pass.
- Bundle: +11 KB raw / +3 KB gzip vs slice 1 — gallery + 8 templates + IdeasTab.

## Senior PM / tech lead pre-flight

The dev server is still running at `http://localhost:3002`.

### 3.6 — Content Library
1. **Sidebar → Content Library** → confirm three pill-tabs at the top: Templates / Media Library / Ideas.
2. Click **Ideas** → the old /content-ideas content is here (AI prompt bar, Recents carousel, ideas grid). URL becomes `/content-library?tab=ideas`.
3. Visit `/content-ideas` directly → instant redirect to `/content-library?tab=ideas`. The dark route is gone.
4. Browser back/forward keeps the active tab in sync.

### 3.11 — Campaign templates
1. **Sidebar → Campaigns → New campaign**.
2. Land on the new gallery: **2-card start chooser** at the top + 8 template cards grouped by category.
3. Hover a template card — see channels (icons), segment, agent chip if present, budget on the right.
4. Click **High-LTV Re-engagement** — wizard opens at Step 1 with name pre-filled, segment + channels + budget seeded, voice agent picker on Step 3 already attached to the *Sales Outreach Agent*.
5. Walk Step 2 → Step 3 → confirm the AI-Voice block already shows the connected agent card.
6. Hit **Back to templates** at the top to pivot to a different template — wizard state resets cleanly.
7. Or pick **Build a journey** — wizard opens with `campaignType: 'journey'` and lands at the journey canvas on step 3.
8. Click **Launch Campaign** — the launch handler fires; the new campaign carries the right segment + agent.

### Cross-section
- The redirect chain `/content-ideas` → `/content-library?tab=ideas` and the legacy `/templates` → `/content-library` (Phase 1) both still work.
- The campaign-template gallery picks valid agents/segments — invariant 2 is satisfied for any template-launched campaign with `ai_voice`.

## What's still mocked / out of scope this slice

- Templates are static — no editing the gallery itself. Phase 5 might add an admin surface.
- "Customize with AI" inside the Ideas tab still calls Anthropic via the existing util — that's pre-Phase-3 behavior, untouched.
- Templates that use `ai_voice` come with a recommended agent but the Step-3 voice block still needs the user to pick an account/caller-number (those vary per workspace and shouldn't be templated).

## Files this slice touched

| File | Status |
|---|---|
| `frontend/src/pages/ContentLibrary.tsx` | rewrite (71 → ~95 LOC, three tabs + URL sync) |
| `frontend/src/components/content-library/IdeasTab.tsx` | new |
| `frontend/src/pages/ContentIdeas.tsx` | **deleted** |
| `frontend/src/data/mock/campaignTemplates.ts` | new |
| `frontend/src/components/campaign/CampaignTemplateGallery.tsx` | new |
| `frontend/src/pages/CreateCampaign.tsx` | rewrite (23 → ~110 LOC, gallery + wizard stages) |
| `frontend/src/app/routes.tsx` | `/content-ideas` route → redirect |

---

## Awaiting next direction

Reasonable next moves:

- **A. Pre-launch checklist (3.9)** — small, demo-coherent. Surfaces audience reachable, compliance flags, frequency caps, agent-tested-recently, etc. as a checklist on the Review step. Demo-quality lift on the launch moment.
- **B. Segment surface polish** — 3.1 + 3.4 + 3.5. Three-card source chooser, real Edit Segment, segment detail with campaigns-using-it. Brings the segment surface to the same coherence bar as agents.
- **C. Content Library reorganization** — 3.6 + 3.11. Folds /content-ideas into the library, builds the campaign template gallery on /campaigns/new.
- **D. Phase 2 maintenance** (chat builder consolidation 2.3 + type narrowing 2.12) — refactor risk, no demo lift.
- **E. Move to Phase 4** — Live Monitoring + Call Logs + the **promote-bad-call-to-eval loop** (the closing showpiece per [DEMO_FLOW.md Step 9](DEMO_FLOW.md)). Largest demo lift.

Recommend **A** next (small, complements what we just shipped), then **E**.
