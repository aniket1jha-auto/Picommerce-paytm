# MOCKS_PLAN — Mock data architecture, conventions, value ranges

**Date:** 2026-04-28
**Companion docs:** [decisions/0007-stay-paytm-themed.md](decisions/0007-stay-paytm-themed.md), [decisions/0005-mock-client.md](decisions/0005-mock-client.md) (rejected), [DEMO_FLOW.md](DEMO_FLOW.md), [AUDIT.md](AUDIT.md)

> Per user direction (2026-04-28), v1 stays Paytm-themed. No fictional client pivot, no workspace switcher, no currency abstraction. This doc covers what changes (consolidation, naming, invariants) and what doesn't (vertical, currency, content).

---

## 1. The client context

**The product is themed as if deployed for Paytm** — Indian fintech / financial services. All mocks reflect that:

- Vertical: financial services (wallet, payments, KYC, loans, gold, credit, insurance)
- Geography: India
- Currency: INR (₹)
- Languages: en-IN (primary), hi-IN (secondary, plus regional)
- Phone format: `+91-9XXX-XXXXX`
- Compliance: TRAI / DND / Aadhaar OTP language
- Brand patterns: "Paytm Wallet", "Paytm SMS — Primary", "Paytm Voice — Plivo Primary", "Paytm Payments Bank"

This is a **deliberate v1 choice** ([ADR 0007](decisions/0007-stay-paytm-themed.md)). The audit's "positioning liability" framing in earlier drafts is reframed to: *"v1 ships against Paytm; non-Paytm buyer demos use the Paytm config and the demoer narrates accordingly."*

---

## 2. What stays (do not rewrite)

Effectively all existing content. Concretely:

- Campaign names: "High-LTV Re-engagement", "KYC Completion Drive", "Festival Cashback Promo", "Recovery Nov", "Loyalty Wave", etc.
- Segment names + sizes: `seg-001` "High LTV Dormant" (45,000 users), `seg-002` "Incomplete KYC" (120,000), etc.
- Agent personas: voice / chat agents around KYC outreach, loan recovery, customer support
- Content templates: SMS / WhatsApp / RCS / Voice scripts referencing wallet, KYC, loans, gold, cashback
- Sender accounts: `Paytm SMS — Primary`, `Paytm SMS — Transactional`, `Paytm Official` (WhatsApp), `Paytm Voice — Plivo Primary`, `Paytm Voice — Exotel Backup`
- Voice script tone: *"Namaste, this is [agent] calling from Paytm…"* / *"This is [agent] calling on behalf of Paytm…"*
- Aadhaar OTP / KYC compliance copy throughout
- Currency formatting in lakh / crore convention (`₹4.2L`, `₹1.2Cr`)
- Phone numbers in `+91 9XXX XXXXX` format

---

## 3. What changes (Phase 1 cleanup, no theming impact)

These are technical hygiene tasks that improve mock-data architecture without touching content:

### 3.1 Consolidate `formatINR` duplicates
Three local copies live in [ChannelSelector.tsx](../frontend/src/components/campaign/ChannelSelector.tsx), [ContentScheduleStep.tsx](../frontend/src/components/campaign/ContentScheduleStep.tsx), [CampaignPlanStep.tsx](../frontend/src/components/campaign/CampaignPlanStep.tsx); two `.toFixed(1)`, one `.toFixed(2)`. Replace all with the shared util in [utils/format.ts](../frontend/src/utils/format.ts). One precision rule (proposed: `.toFixed(1)` for compact `K/L/Cr`, `.toFixed(0)` for whole-rupee values under 1,000).

### 3.2 Extract sub-segment journey data
[CampaignDetail.tsx](../frontend/src/pages/CampaignDetail.tsx) (1,592 LOC) and [CampaignFlow.tsx](../frontend/src/pages/CampaignFlow.tsx) (820 LOC) each carry an inline `SUB_SEGMENTS` constant. Move both to a single `frontend/src/data/mock/journeys.ts`. They already differ slightly — pick one canonical version (CampaignDetail's is richer), update both pages to import from it.

### 3.3 Extract `CHANNEL_PERF` from Dashboard
[Dashboard.tsx:31](../frontend/src/pages/Dashboard.tsx) hardcodes per-channel performance numbers that should derive from `data/mock/base/analytics.ts`'s channel breakdown. Sparklines should be data-driven from there too.

### 3.4 Audit and resolve `data/mock/day30/*`
[mock/index.ts:123](../frontend/src/data/mock/index.ts) `getDay30Data()` returns `baseCampaigns` and `baseSegments` — the parallel files in `day30/campaigns.ts`, `day30/segments.ts`, `day30/insights.ts`, `day30/analytics.ts`, `day30/waterfalls.ts` are unreferenced from this loader. Either:
   - **(a)** Wire them in — Day 30 should layer enriched analytics / insights / waterfalls onto base data; or
   - **(b)** Delete them as dead files.

Decide during Phase 1 by tracing every importer. Likely **(a)** for `waterfalls.ts` and `insights.ts` (probably referenced from CampaignFlow / Audiences), **(b)** for `campaigns.ts` / `segments.ts` / `analytics.ts` if they duplicate base.

### 3.5 Add new mock entities for Phase 2 / 4 deliverables
New files lined up but **all in Paytm theme**:

- `data/mock/knowledgeBases.ts` — KBs (e.g., *Paytm Product Catalog v3*, *Paytm Wallet & UPI Policy*, *Paytm Loan Recovery Playbook*, *Paytm KYC FAQ*)
- `data/mock/knowledgeBaseDocuments.ts` and `knowledgeBaseChunks.ts`
- `data/mock/calls.ts` (single-call records, ~600 calls across 30 days, distributed across deployed agents)
- `data/mock/callTranscripts.ts` (one per call, with retrieval events + tool-call events + sentiment / intent ribbons)
- `data/mock/evalCases.ts` and `evalRuns.ts`
- `data/mock/promptVariants.ts` and `promptEnhancements.ts`
- `data/mock/failureModes.ts`
- `data/mock/auditLog.ts` (Phase 5)

### 3.6 Type narrowing
`AgentConfiguration` ([types/agent.ts](../frontend/src/types/agent.ts)) becomes a discriminated union on `type: 'voice' | 'chat'` ([Phase 2 deliverable 2.12](PHASING.md)). Mocks update to use the narrowed types — voice agents lose unused chat fields and vice versa.

---

## 4. Naming conventions (consolidated)

| Entity | Pattern | Example |
|---|---|---|
| Campaign id | `camp-NNN` | `camp-001` |
| Segment id | `seg-NNN` | `seg-001` |
| Agent id | `agent-NNN` | `agent-001` |
| Tool id | `tool-NNN` | `tool-001` |
| KB id | `kb-NNN` | `kb-001` |
| KB doc id | `kbdoc-NNNNN` | `kbdoc-00012` |
| Call id | `call-XXXXX` (5-char hash for realism) | `call-7f3a9` |
| Transcript id | mirrors call id (`tr-…`) | `tr-7f3a9` |
| Eval case id | slug | `eval-kyc_aadhaar_otp_timeout` |
| Prompt variant id | `pv-NNN` | `pv-003` |

No client prefixes (no Paytm or other workspace prefix). Single-tenant mock state.

---

## 5. Cross-entity coherence rules

A small unit test runs at build time and fails the build if any invariant breaks. Cheap, hard to skip.

**Invariant 1 — Campaigns reference real segments and channels.**
Every `Campaign.audience.segmentId` must resolve to a `Segment`.

**Invariant 2 — Campaigns referencing AI-voice channels reference real, deployed agents.**
Every campaign with `channels` including `ai_voice` must have `aiVoiceConfig.agentId` (new field, Phase 3) referencing a deployed `Agent`.

**Invariant 3 — Calls reference real agents and (if non-test) real campaigns.**
`Call.agentId` resolves. `Call.campaignId` (if present) resolves.

**Invariant 4 — Transcripts reference real calls, tools, and KBs.**
`CallTranscript.callId` resolves. `toolCallEvents[*].toolId` resolves. `retrievalEvents[*].knowledgeBaseId` resolves.

**Invariant 5 — Eval cases promoted from calls reference real calls.**
`EvalCase.sourceCallId` (if `source === 'promoted_from_call'`) resolves.

**Invariant 6 — Prompt variants reference real agents.**
`PromptVariant.agentId` resolves. Each agent has exactly one variant with `status === 'default'`.

**Invariant 7 — Audit log entries reference real entities.**
Every audit entry mentioning an entity ID resolves.

**Invariant 8 — Aggregate analytics derive from underlying entities.**
The Day 30 dashboard's "Total Conversions" equals `sum(Campaign.metrics.converted)` for active + completed campaigns. Senior PMs check this.

**Invariant 9 — SUB_SEGMENTS in journey views match a saved segment.**
Once §3.2 lands, every sub-segment row in `mocks/journeys.ts` references a real `Segment` id (today they're inline in components and reference no segments — drift target).

---

## 6. Catalog of mock entities (target counts at Day 30+)

| Entity | Count | Notes |
|---|---|---|
| Campaigns | 8 | Mix of active (3), completed (3), scheduled (1), draft (1) |
| Segments | 12 | 7 rule-based, 3 AI-suggested, 2 CSV-imported |
| Agents | 5 | 2 voice deployed, 1 voice testing, 1 chat deployed, 1 voice draft |
| Tools | 12 | Across categories; 8 in active use |
| Knowledge Bases | 5 | 3 ready, 1 empty (URL crawl, "coming Q3"), 1 error |
| Calls | ~600 | Across all agents over last 30 days |
| Transcripts | ~600 | One per call |
| Eval cases | 12 / agent (~36 total for deployed agents) | Mix manual + promoted-from-call |
| Eval runs | ~400 | Mix pass / fail, last 30 days |
| Prompt variants | 8 | 2-3 per deployed agent |
| Prompt enhancements | 5 pending | Across all agents |
| Failure modes | 5 | Cross-agent catalog |
| Content templates | 24 | Per channel: WA 8, SMS 6, RCS 4, Voice scripts 4, Push 2 |
| Media assets | 30 | Images for WhatsApp template headers (Paytm offer creatives) |
| Data sources | 6 | (existing) — Salesforce, BigQuery, S3, Segment, internal feature store, plus one |
| Integrations connected | 8 / 21 | (existing baseline) |
| Team members | 8 | Admin 2, Editor 4, Viewer 2 |
| Audit log entries | ~120 | Last 30 days (Phase 5) |

### Day 0 / Day 1 derivations

The phase logic stays as-is ([data/mock/index.ts](../frontend/src/data/mock/index.ts)):

- **Day 0**: campaigns = []; segments = []; KBs = []; agents = []; tools = []; data sources marked disconnected; analytics empty; insights filtered to `minPhase === 'day0'`.
- **Day 1**: data sources connected; segments visible; campaigns = []; agents = []; KBs = []; analytics empty; insights filtered to `minPhase ∈ {day0, day1}`.

The phase indicator moves from the (deleted) workspace switcher to a small dropdown in the sidebar footer.

---

## 7. Content patterns (Paytm-themed)

### Campaign use cases (existing + minor expansions)
- High-LTV Re-engagement (existing)
- KYC Completion Drive (existing)
- Loan Recovery / DPD bucket outreach
- Festival Cashback Promo (existing)
- Loyalty Wave (existing)
- Pre-approved Personal Loan Push
- Wallet Inactive Win-Back
- Gold Investment SIP Pitch

### Agent use cases
- **Paytm KYC Outreach Voice** (deployed) — outbound to incomplete-KYC users; KBs: KYC FAQ, Aadhaar OTP Playbook; tools: send_aadhaar_otp_link, schedule_callback, transfer_to_kyc_team
- **Paytm Loan Recovery Voice** (deployed) — outbound to DPD-30+ buckets; KBs: Loan Recovery Playbook, Settlement Policy; tools: lookup_loan_account, create_payment_link, schedule_callback, transfer_to_collections
- **Paytm Cashback Win-Back Voice** (testing) — outbound to dormant wallet users
- **Paytm Customer Care WhatsApp** (deployed chat) — inbound; KBs: Wallet & UPI Policy, KYC FAQ, Loan FAQ; tools: lookup_account, file_complaint, send_kyc_link, transfer_to_human
- **Paytm Internal Demo** (draft) — sandbox for testing prompt variants

### Knowledge Bases (new in Phase 2)

| ID | Name | Source | Notes |
|---|---|---|---|
| `kb-001` | Paytm Product Catalog v3 | files | Wallet, UPI, Bank, Postpaid, Insurance, Investments — top-level descriptions and FAQs |
| `kb-002` | Paytm Wallet & UPI Policy | files | T&Cs, transaction limits, refund rules |
| `kb-003` | Paytm Loan Recovery Playbook | files | DPD bucket scripts, settlement guidelines, escalation paths |
| `kb-004` | Paytm KYC FAQ | files | KYC types, Aadhaar OTP flow, common rejection reasons |
| `kb-005` | Paytm Help Center | url | empty (URL crawl placeholder, "coming Q3") |

### Compliance copy
- TRAI sender ID, DND list check, opt-out language ("STOP to opt out")
- Aadhaar OTP consent language where applicable
- RBI regulatory mentions in loan recovery agent prompts (already present)
- Recording consent disclosure for AI Voice

---

## 8. PII / synthetic-data discipline

- All names from a curated synthetic list (common Indian first/last names; nothing matching real public figures or known Paytm employees).
- All phone numbers masked or synthetic (`+91 9XXX 12345`).
- All addresses fictional or generic (city + pincode, no street).
- All email addresses end in `@example.com` or `@example.in`.
- Voice agent test conversations use synthetic transcripts only — never real customer data.

The brief is explicit ([§14](../README.md)): **do not handle PII, real credentials, or real customer data, even in mocks**. This rule is checked in code review for every new mock file.

---

## 9. Asset rights

Today: campaign content uses `https://placehold.co/...` for images. Continue this pattern. No real product photography, no Paytm-owned creative assets.

For media-library mocks, use placeholder URLs encoding the campaign theme (e.g., `placehold.co/600x400/00BAF2/FFFFFF?text=KYC+Reminder`). Cheap, instantly recognizable as placeholder.

The π / "Commerce" wordmark remains as the product brand. We do *not* render the actual Paytm logo or brand assets anywhere in the UI — the *content* is themed around Paytm's product surfaces, but the *brand chrome* of the application is "Commerce".

---

## 10. What stays mocked, forever (v1)

Per the brief (§14):
- No real OAuth flows.
- No real telephony.
- No real LLM calls (except the existing Anthropic-powered template-body generator in CreateContentTemplate, which is opt-in and clearly labeled; the same approach extends to the agent "Generate with AI" instruction-builder in Phase 2).
- No real data warehouse queries.

Mocks must look real, behave consistently, and never be confused for real production behavior.

---

## 11. Future revisit (v2 / later)

When a buyer relationship demands a vertical pivot:
- Architecture allows it — mock data is centralized, theme is content not chrome.
- Workspace switcher + currency abstraction can be retrofitted with one phase of work (revival of [ADR 0005](decisions/0005-mock-client.md)).
- For now, deferred. Not on the roadmap.
