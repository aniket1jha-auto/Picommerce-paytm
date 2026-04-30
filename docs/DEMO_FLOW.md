# DEMO_FLOW — The 9-step golden flow, screen by screen

**Date:** 2026-04-28
**Audience:** anyone who will demo this product to Emaar / Croma / Shoppers Stop, plus the senior PM and tech lead reviewing the build.
**Companion docs:** [AUDIT.md](AUDIT.md) (current state), [IA.md](IA.md), [KB_SPEC.md](KB_SPEC.md), [EVAL_SPEC.md](EVAL_SPEC.md), [MOCKS_PLAN.md](MOCKS_PLAN.md)

> The brief (§8) calls this "the spine." Every navigation choice, every empty state, every CTA must reinforce flowing through this path. Two showpiece interactions: **plug agent into campaign** (step 6) and **promote bad call to eval** (step 9). Demo time budget: 12–15 minutes end-to-end.

---

## Pre-demo state

Mock content is Paytm-themed throughout ([ADR 0007](decisions/0007-stay-paytm-themed.md)). Currency ₹, languages en-IN + hi-IN, sender accounts on Paytm SMS / WhatsApp / Voice infrastructure. The demoer narrates accordingly when showing to non-Paytm prospects: *"this is one of our deployed configurations — your setup will look different but the surfaces are identical."*

Phase indicator (in the sidebar footer dropdown) is set to **Day 30+** so all features are visible. Test agent and one in-flight campaign already exist in mock state so step 8 has something to show.

The sidebar shows the new IA per [IA.md](IA.md): `Dashboard`, `BUILD` (**Campaigns**, Agents, Knowledge Bases, Tools, Audiences, Content Library), `OBSERVE` (Live Monitoring, Call Logs, Analytics, Reports), `CONFIGURE`.

---

## Step 1 — Create an Agent

**Page:** `/agents` → "+ New agent" (voice) → `/agents/new`

**What the user sees:** The voice agent builder — a 7-step wizard with progress at top, step content center, persistent Save Draft / Next at bottom. Steps:

1. **Basic Info** — name, description, type (voice), use case
2. **Model & Voice** — model card grid, voice card grid with audio preview button
3. **System Prompt** — prompt editor + template library + personality (traits / tone / role) + objectives + guidelines
4. **Instructions** — drag-reorderable steps, each with instruction text, optional transition condition, attached tools
5. **Knowledge Bases** *(new — see [KB_SPEC.md](KB_SPEC.md))* — multi-select KBs, retrieval mode, top-K, score threshold, citation style, preview block showing how chunks inject into context
6. **Advanced** — audio config (turn detection, interruptions), LLM config, conversation settings (silence timeout, end-call phrases, language, speech rate), compliance toggles
7. **Review & Deploy** — full config summary, environment toggle (test / production), Deploy / Save Draft

**Mock data needed:**
- Pre-built **Paytm KYC Outreach** template at the System Prompt step's library
- 3 KBs visible at step 5: `Paytm Product Catalog v3` (1,420 chunks), `Paytm KYC FAQ` (124 chunks), `Paytm Wallet & UPI Policy` (86 chunks)
- 4 voice options: 2 male, 2 female, en-IN and hi-IN options

**Success state:** Deploy succeeds → toast "Agent deployed" → redirect to `/agents/:id` with the agent visible at status `deployed`.

**Error state:** Validation errors are shown inline at each step; Deploy is disabled until all required fields pass. Network failure on Deploy shows a toast with "Retry" — no half-deployed states.

**What the demoer says:**
> "Building a voice agent here is the same shape as building any modern AI assistant — model, voice, prompt, instructions. Where we differ is two steps. First, *Knowledge Bases* — every agent can attach one or more knowledge bases, choose how aggressively to retrieve, and we show you exactly how the retrieved content will land in the agent's context. Second, the *Instructions* are explicitly transition-driven: each step says what to do, what triggers the next step, and what tools are available right there. This isn't a wall of system prompt — it's a structured spec the agent will follow."

---

## Step 2 — Test the Agent

**Page:** `/agents/:id/test` (Live Test Console — full screen, not a tab)

**What the user sees:**
- Big "Start Test Call" button center-screen with the voice waveform motif
- After pressing: the screen splits — left pane shows the **transcript streaming live** (user turns and agent turns, with timestamps and tool-call inline annotations); right pane shows **vital signs** — latency per turn, KB retrievals (collapsible chunks with scores), tool calls (with payloads, expandable)
- Bottom of screen: a "Talk" or "Type" toggle. In "Type" mode, the demoer types user turns and the agent voice-replies *and* shows the transcript. In "Talk" mode (browser mic), it does the same but with real audio.
- Floating action: "Promote to eval" appears once the call ends — disabled until call ends.

**Mock data needed:** A scripted but believable test conversation where the agent:
- Greets the user in Hindi-English mix, confirms identity
- Retrieves from `Paytm KYC FAQ` to explain Aadhaar OTP flow — chunks visible
- Calls a tool (`send_aadhaar_otp_link`) with a mock payload — visible
- Handles a brief objection ("can I do this later?")
- Closes by scheduling a callback

**Success state:** Call ends, summary shown (duration, latency p50/p95, tool calls succeeded, KB retrievals fired). Save / discard buttons.

**Error state:** Tool call fails mid-call — surfaced as a red marker in the transcript with the error payload; call continues; demoer says "and yes, when something fails we don't hide it."

**What the demoer says:**
> "I'm going to talk to the agent right here. Watch the right pane — every turn shows the latency, the knowledge chunks it pulled, and any tool it called. This is what makes voice debuggable. And — note the button bottom-right — once a call's done, I can promote it to a regression test for this agent. We'll come back to that."

---

## Step 3 — Open Campaign Builder

**Page:** `/campaigns/new`

**What the user sees:** Two large entry cards:
- **Use a template** — gallery of 6–8 prebuilt campaign templates (KYC Drive, Loan Recovery, Cashback Win-Back, Festive Promo, Loyalty Wave, Pre-approved Loan, Wallet Inactive, Gold SIP)
- **Build a journey** — opens the canvas for journey-style flows

Demoer picks "Use a template" → "High-Value Re-engagement" → wizard opens at step 1 with template seeded.

**Mock data needed:** Templates with realistic Paytm content per channel. Pre-seeded segment (`High LTV Dormant`), pre-seeded channels (WhatsApp + AI Voice), pre-seeded budget (`₹3,50,000`), schedule (next morning 10 a.m.).

**Success state:** Wizard opens at the Audience step with the template's defaults visibly inherited (a small "Pre-filled from High-LTV Re-engagement template" banner).

**Error state:** Template fails to load → fall back to blank wizard with a toast. Doesn't break the demo.

**What the demoer says:**
> "We don't make our customers start blank — these templates are the patterns we've seen work for fintech and FS. I'll pick High-LTV Re-engagement — but everything is editable. The wizard's already pre-filled my segment, my channels, and a sensible schedule."

---

## Step 4 — Select Audience

**Page:** Wizard step 2 (Audience)

**What the user sees:** Three tabs across the top of the audience panel:
- **Segments** (default) — picker showing saved segments with size + reachability sparkbar per channel; the template's pre-selected segment is highlighted
- **AI Goal** — a single text field "Describe the audience you want" + a Generate button (per scope point 13)
- **Upload List** — drag-drop CSV or propensity-scored file upload

Demoer stays on Segments → shows the **High LTV Dormant** segment is already selected → clicks "Refine" to add a high-intent rule (opened wallet app in last 7 days). Segment count updates live.

**Mock data needed:** 8 saved segments, including 2 AI-suggested ones. Reachability bars per channel, attribute summary in a hover card (avg LTV, geo split, top product categories).

**Success state:** Audience finalized; estimated reachable count per selected channel shown clearly.

**Error state:** Filter rule conflicts (e.g., audience size = 0) → inline error + suggestion to relax.

**What the demoer says:**
> "I have the template's segment pre-selected — that's our High-Value Lapsed cohort. But I want to make it sharper — let me layer in a high-intent rule. (clicks Refine, adds rule.) Now I have 38,000 lapsed customers who *just* showed interest in the last week. The reach numbers update live per channel."

---

## Step 5 — Configure the Campaign

**Page:** Wizard step 3 (Content & Schedule, or Journey if the user picked the journey path)

**What the user sees:**
- Channel-by-channel content sections, each collapsed/expanded — WhatsApp first, AI Voice second
- **For WhatsApp:** template picker (only approved templates, per the brand's recent template-only enforcement); preview pane shows the rendered message; sender config dropdown; A/B variant toggle
- **For AI Voice:** *(this is the marquee surface)* — see Step 6
- **Schedule:** one-time / recurring / event-triggered tabs; pre-filled with template's schedule
- **Frequency caps:** per-channel cap dropdown (`Once / Once per day / Cooldown 3 days`)
- **Compliance:** TRAI / DND check, opt-out language preview, recording-consent acknowledgment

**Mock data needed:** Approved WhatsApp template (`paytm_kyc_reminder_v3`), one A/B variant.

**Success state:** All channels green-ticked; review enabled.

**Error state:** Template not approved → inline blocker; A/B traffic split doesn't sum to 100 → inline error.

**What the demoer says:**
> "Content is template-only — no free-typing into WhatsApp from this product, ever. The compliance team uploads approved templates once; the marketer picks from them here. Schedule is pre-filled. Frequency caps and DND are enforced — those aren't checkboxes you forget; they're the default."

---

## Step 6 — Plug the Agent into the Campaign  ⭐ SHOWPIECE

**Page:** Same wizard step 3, AI Voice channel section expanded

**What the user sees:**
- **Agent picker** — a search/select that lists deployed agents; the agent built in step 1 appears at the top with a "deployed today" tag
- After selecting:
  - **Prompt variant** dropdown (default `Default`; or the one auto-created by Prompt Enhancement, see step 9)
  - **Knowledge Bases** — read-only view of which KBs are attached to the agent, with an "Override for this campaign" link
  - **Retry rules** — max attempts, retry delay, no-answer behavior (voicemail / SMS fallback / next channel)
  - **Fallback** — what happens if the agent fails: hand off to SMS template, or skip
- A small **"Test this exact configuration"** button that opens the test console (step 2) seeded with this campaign's settings

**Mock data needed:** Two prompt variants (Default + a stronger objection-handler variant). Two retry rule presets.

**Success state:** Agent attached; the channel section shows "Paytm KYC Outreach Voice — v1.2 + objection-handler variant" with a small waveform motif.

**Error state:** Agent paused → blocker with "Resume agent" link; KB indexing in progress → warning with "Wait or proceed without KB."

**What the demoer says:**
> "This is the bit that doesn't exist anywhere else in this category. The voice agent I just built and tested is a *step in the campaign*. I pick which prompt variant to run — and yes, A/B-ing prompt variants is supported. I see what knowledge it's pulling from. I set retry rules. And if the agent ever degrades, the campaign falls back gracefully. The agent is not a separate product — it's a campaign primitive."

---

## Step 7 — Launch

**Page:** Wizard step 4 (Review)

**What the user sees:** A pre-launch checklist (inspired by Braze Canvas Entry Settings Wizard) — every line either green-ticked or flagged with an action:

- ☑ Audience: 38,200 reachable
- ☑ Content: 2 channels configured, 1 A/B variant
- ☑ Compliance: DND filter on, TRAI sender ID verified, opt-out language present
- ☑ Frequency cap: Once per 3 days
- ☑ Budget: ₹4,50,000 — projected spend within 12 % buffer
- ☑ Voice agent: Paytm KYC Outreach Voice deployed, KBs indexed
- ⚠ One row that requires attention — for the demo, e.g. *"Voice agent has not been tested in last 24 h. Test now or acknowledge."*
- A clearly visible **"Launch campaign"** primary button (disabled until warnings are acknowledged)

**Mock data needed:** All-green except the one warning that triggers the "Acknowledge" interaction.

**Success state:** Click Launch → confirmation modal "Launch *High-LTV Re-engagement* now?" → confirm → toast "Campaign launched, 38,200 contacts queued" → redirect to CampaignDetail at status `active` with metrics ticking.

**Error state:** Backend rejects launch → modal stays, error inline. Audit log records the attempt.

**What the demoer says:**
> "Pre-launch checklist — borrowed shape from Braze Canvas, refined. Notice that warning at the bottom — the agent hasn't been tested in 24 hours. We don't block — we make you acknowledge. Now I launch."

---

## Step 8 — Observe

**Page:** `/campaigns/:id` (CampaignDetail) — the demoer also opens `/monitoring` in a second tab to show the live view

**What the user sees:**
- **CampaignDetail:** real-time KPI tiles (Sent, Delivered, Opened, Conversions, Spend, ROI) with deltas updating every few seconds (mock); journey table showing per-sub-segment performance; A/B variant performance side-by-side; AI Companion rail surfacing 1–2 anomalies ("WhatsApp delivery rate -8 % vs. baseline — investigate")
- **Monitoring:** live calls list updating every second, each row showing agent name, contact, duration, current intent, current step, vitals (latency); click a row to drop into a real-time transcript view
- **Activity feed** (`/monitoring/activity`) — the revived Logs page — showing system + campaign + agent events with severity color coding

**Mock data needed:**
- 30–40 simulated active calls cycling through statuses (ringing / connected / in-progress / ended)
- 2 mid-flight anomalies (one delivery dip, one tool failure spike)
- Activity feed populating one row per 2–4 seconds

**Success state:** Live counters tick; one call ends successfully; one fails — the failure is a *seeded* failure that sets up step 9.

**Error state:** Connection to (mock) live stream drops → "Reconnecting…" badge top-right; on reconnect, missed events backfilled.

**What the demoer says:**
> "Campaign is live. Here's the campaign view — KPIs tick in real time. And here's the live monitoring tab — every call in flight, with vitals. Watch this row — that call just failed. Tool call timed out. Let me click in."

---

## Step 9 — Evaluate  ⭐ SHOWPIECE

**Page:** `/monitoring/calls/:id` (the failed call drilldown), then `/agents/:id/eval`

**What the user sees on the call drill-down:**
- **Full transcript** with turn-level timestamps, sentiment per turn, intent labels
- **Inline tool-call entries** — payload sent, response (or error) received, latency
- **Inline KB retrieval entries** — query, top-K chunks with scores, which chunk(s) the agent cited
- **Latency timeline** — a horizontal trace showing user-speech-end → ASR → LLM → KB retrieval → tool call → TTS → user hears reply
- **Sentiment & intent ribbon** above the transcript
- **Three primary actions in the header:**
  - 👎 **Flag this call** *(opens a small dialog: reason, severity)*
  - 🧪 **Promote to eval test case** *(the marquee action — see below)*
  - 📋 **Copy share-link**

**The promote-to-eval interaction:**
1. Click "Promote to eval test case"
2. Modal opens, pre-filled:
   - Test name: `[2026-04-28] KYC Outreach — Aadhaar OTP timeout failure` (auto)
   - Source call: `call-7f3a` (link)
   - Mock conversation: full transcript imported, turns toggleable as input vs. fixed
   - Judge plan: pre-suggested ("Agent must apologize for the tool failure and offer to send a follow-up SMS")
   - Expected outcome: pass / fail criteria
3. Save → toast: "Test case `kyc_aadhaar_otp_timeout` added to *Paytm KYC Outreach Voice* eval suite"
4. Inline link: "View case in eval suite" → `/agents/:id/eval/cases/kyc_aadhaar_otp_timeout`

**Then the demoer navigates to `/agents/:id/eval`** to show:
- Aggregate eval dashboard: pass-rate trend over time, failure modes (top 5 with counts and example links), prompt-variant comparison, latency p50/p95
- Eval cases list — including the one just promoted
- Run-eval button (mock) showing all cases re-run against the current agent config — the new case fails (because the agent hasn't been fixed) — this becomes the segue to **Prompt Enhancement**:
- Prompt-enhancement panel surfaces a suggestion: "Add a step instructing the agent to gracefully handle Aadhaar OTP service timeouts by offering an SMS link as fallback and scheduling a callback."
- Click "Apply suggestion" → modal opens with a diff between current prompt and proposed prompt; click Accept → new prompt variant created; eval re-runs; case passes; pass rate ticks up.
- Failure analysis tab summarizes: "Tool call `send_aadhaar_otp_link` failed in 1.4 % of calls last 30 days" with the underlying error breakdown (mostly OTP gateway timeouts).

**Mock data needed:**
- The single failed call from step 8 with full transcript, tool-call payloads (including the timeout error), KB retrievals, sentiment/intent labels, latency timeline data
- 12 existing eval cases for the Paytm KYC Outreach Voice agent (mix of passing and failing)
- 1 prompt-enhancement suggestion ready to be accepted
- 30-day pass-rate sparkline

**Success state:** Promotion succeeds; suggestion applies; eval re-runs; pass rate moves visibly; demoer ends here.

**Error state:** Promotion fails (validation: missing judge plan) → inline error in the modal; demoer fills in.

**What the demoer says:**
> "One call failed — tool timeout. I drill in, I see the full picture: transcript, where in the latency timeline the failure happened, what the tool returned, what the agent did next. The single most useful action this product offers is right here — *promote to eval*. (Clicks button.) That call just became a regression test that lives in this agent's eval suite forever. (Switches to eval suite.) Here's the suite — every promoted bad call, plus the cases we wrote up front. The new test fails — the agent hasn't been fixed yet. Right here, the system suggests a prompt change. (Clicks Accept.) Tests re-run. The new case passes. Pass-rate ticks up. *That* is the loop. Bad call → regression test → suggestion → fix → verified fix. Forever."

---

## What the demoer says at the end (60 seconds)

> "What you saw: build a voice agent that knows your knowledge, attach it to a campaign as a step, launch with guardrails, watch it run, and turn every bad moment into a permanent regression. The whole thing — agents, KB, tools, audiences, content, campaigns, monitoring, eval, prompt enhancement — is one system, not five products glued together. Pricing and rollout: that's me and our delivery team in your office for two weeks getting you to launch. Questions?"

---

## What we do *not* demo

- Reports tab (mention only). Reports is for audit and compliance leads, not the people in this room.
- Analytics tab (mention only). Show on a follow-up.
- Configure section (mention only — say "your IT team handles channel and team setup; we hand-hold them").
- Settings / Workspace, Integrations catalog (mention by name).
- Audit Log (mention; relevant to security review track).

The demo is the spine, not the encyclopedia.

---

## Demo phasing

| Phase to land | Demo step covered |
|---|---|
| 1 | New IA visible, dark mode, design tokens — sets the tone |
| 2 | Steps 1, 2 (agent build + test), and the agent half of step 6 |
| 3 | Steps 3, 4, 5, 6, 7 (segments, content, campaign, plug-agent, launch) |
| 4 | Steps 8, 9 (observe + the eval loop — the closer) |
| 5 | Polish, Configure surfaces, Reports, audit log |

Demo can be run *honestly* end-to-end at the close of Phase 4. Phase 5 is for the deeper-dive follow-ups.
