# Journey Builder Revamp — Plan

**Scope:** Surgical revamp of Step 3 (Build Flow) inside the Campaign Wizard's Automated Journey path. Canvas surface and supporting UI only. No changes to other wizard steps, other pages, routing, or data shape beyond what the visual rebuild requires.

**Reference patterns:** n8n (maximalist canvas, slim palette), Vapi Workflows (premium AI-node treatment), Braze Canvas (content preview inside message nodes), Customer.io (directional edge flow), modern React Flow templates (dot-grid, animated active edges).

**Theme:** Locked Paytm navy + bright-blue token system from Phase 1.5. Canvas inherits — no new colors introduced.

---

## 1. Diagnosis (what's wrong today)

| Issue | Cost |
|---|---|
| Stepper occupies ~130px during canvas work | wasted vertical real estate |
| Palette permanently open at 240px | eats ~25% of canvas width |
| Canvas is double-padded (page + container + grid) | usable area ~50% of viewport |
| Nodes are ~280px wide, heavy borders, "Needs configuration" warning chips on every node | overwhelms |
| Edges are pale and thin | invisible at any zoom-out |
| All node types share the same visual treatment | no hierarchy — trigger, channel, AI agent, logic all look the same |
| Empty mini-map shown by default | noise |
| Palette unordered relative to actual journey-building flow | cognitive load |

The canvas should be the hero. Today it's the supporting actor.

---

## 2. Current implementation map (what exists)

**Wizard shell:** [CampaignWizard.tsx](frontend/src/components/campaign/CampaignWizard.tsx) — renders `StepNav` (lines 202–252) at top inside a white card, then step content, then a back / next footer (lines 434–449) in normal flow. Step 3 label is dynamic ("Build Flow" for journey, "Content & Schedule" for simple send).

**Journey step entry:** [JourneyBuilderStep.tsx](frontend/src/components/campaign/journey/JourneyBuilderStep.tsx) (642 lines) — wraps ReactFlow, owns nodes/edges/history/templates/validation UI.

**Journey folder (11 files, ~3.4k LOC):**
- `JourneyBuilderStep.tsx` — orchestrator
- `JourneyFlowNode.tsx` (318) — single custom node renderer (all kinds)
- `JourneyBezierEdge.tsx` (55) — bezier edge with delete overlay
- `JourneyNodeConfigPanel.tsx` (1338) — width-transition right-side panel for all 20+ node kinds
- `JourneyNodePalette.tsx` (78) — left sidebar 240px, drag-to-canvas, grouped by category
- `PrebuiltJourneyModal.tsx` (57) — 6 templates
- `journeyConstants.ts` (296) — kind defaults, palette groups, output handles
- `journeyTypes.ts` (195) — `JourneyNodeKind` union, node data shapes
- `journeyValidation.ts` (187) — `validateJourney(nodes, edges)` → checks + issues
- `journeyTemplates.ts` (170) — 6 prebuilt templates
- `journeyMerge.ts` (97) — config state merge + computed `configured` flag

**React Flow:** `@xyflow/react@^12.10.2`. Single custom node type `journeyNode`, single custom edge type `journeyBezier`.

**State:** Journey lives in `CampaignData.journey: { nodes, edges }` ([CampaignWizard.tsx:50](frontend/src/components/campaign/CampaignWizard.tsx)). Local to JourneyBuilderStep; synced upward on change. Campaign list itself sits in [campaignStore.ts](frontend/src/store/campaignStore.ts).

**Validation:** Already continuous (`validateJourney`). Today wired into a panel; we'll switch the surface but keep the engine.

**Config UX:** Today is a width-transition `<aside>` inside the page, NOT a modal. Closer to a drawer than a modal already. We'll formalize as a right-side drawer per spec §7.2 and keep all field-level forms intact.

**Existing prebuilt templates (6):** `blank`, `recovery_voice`, `kyc`, `loan_sales`, `welcome`, `payment_reminder`. The brief asks for 5 mock templates; the existing 6 already cover 4 of the 5 names. We'll keep the engine and rename/retitle metadata only — no re-engineering.

**Violet residue inside journey/ folder:** 2 hits, both in `JourneyFlowNode.tsx` (`voice_agent` kindTint at L102, port styling at L299). These get rewritten in §5.3 anyway.

---

## 3. Target layout (the spatial reclaim)

### 3.1 Slim stepper on Step 3 only
Wizard stepper compresses to a 40px breadcrumb strip when the active step is `journey`:
`[← Setup ✓] · [Audience ✓] · [Build Flow] · [Review]`

- Reclaims ~90px vertical for the canvas.
- Prior steps clickable; future steps disabled.
- Full stepper returns on every other step.
- Implementation: branch in `CampaignWizard.tsx` — when `step === 'journey'` and `mode === 'journey'`, render `<SlimStepper>` instead of `<StepNav>`.

### 3.2 Full-bleed canvas
- Remove outer card border.
- Remove inner React Flow padding.
- Edge-to-edge horizontally inside wizard content area.
- Vertical: from below slim stepper to just above docked footer.
- Background: dot-grid, `--bg-canvas` base, dots in `--border-subtle`, 16px spacing. (React Flow `<Background variant="dots" gap={16} size={1} />` with token-bound color.)

### 3.3 Collapsible palette drawer
- Default: 56px vertical rail on canvas left edge with 4 category icons (Messages, AI Agents, Logic, Templates).
- Expanded: 280px wide, slides over canvas with `--shadow-lg`.
- Triggers: click rail icon, press `/`, or click floating "+ Add Node" button.
- Collapse: click outside, click rail icon again, or `Esc`.
- Animation: 240ms `--ease-out` slide.

### 3.4 Floating canvas controls (bottom-left, vertical stack, 40px wide)
```
+   Add Node          (opens palette drawer)
─
⊕   Zoom in
⊖   Zoom out
⛶   Fit to view
🗺   Toggle minimap
?   Keyboard shortcuts
```
- `--bg-surface-raised`, `--shadow-md`, `--radius-md`, segmented buttons.
- 16px from canvas bottom-left.

**Top-right of canvas (two controls only):**
- `Use pre-built journey` — ghost button.
- `Validate journey` — secondary button + status dot (green/amber/red).

**Minimap:** hidden by default. Toggleable. When shown: bottom-right, 200×140px, `--shadow-md`, `--radius-md`.

### 3.5 Docked footer
- Fixed to bottom of wizard content area, 64px, `--bg-surface`, upward `--shadow-sm`.
- Left: `Back` (ghost).
- Right: `Save draft` (secondary) + `Next: Review` (primary, disabled while validation has errors).
- Does **not** scroll with canvas.

---

## 4. Node palette — reduced & reordered (4 categories, 10 types)

### Decision: cut from ~15 palette items + 5 trigger kinds → 10 palette items + 2 structural triggers

| Category | Items | Rationale |
|---|---|---|
| **Triggers** (structural, not draggable) | Entry, Exit | Auto-placed; user can add additional Exits |
| **Messages** | SMS, WhatsApp, Email, RCS, Push | Deterministic outbound — uniform compact treatment |
| **AI Agents** | Voice Agent, Chat Agent | The differentiator — premium treatment |
| **Logic** | Wait, Condition, Split | Connective tissue — minimal treatment |

### Migration of dropped node types

| Today | Disposition |
|---|---|
| `entry_trigger`, `campaign_start`, `event_trigger`, `schedule_trigger`, `re_entry` | Collapsed into single **Entry** trigger node. Trigger sub-type (manual / scheduled / event / re-entry) becomes a config field inside the Entry node's drawer. No UI loss; reduces 5 kinds → 1 in the renderer + palette. |
| `in_app` (message) | **Cut from v1 palette.** Rare in journey flows. Reintroduce later if requested. |
| `field_executive` (message) | **Cut from v1 palette.** Handled outside campaign context. |
| `ab_split` | Renamed to **Split**. Same data shape, same node kind under the hood, new visual. |
| `api_webhook` | **Cut from v1 palette.** Becomes inline config on Condition / message nodes if needed. Out of scope for demo. |
| `note` | **Cut from v1 palette.** Annotation can come back later as a separate "annotations" layer. |
| `goto` | **Cut from v1 palette.** Rare; replicate via Condition + edge to upstream node if needed. |
| `update_contact`, `crm_sync` (Data) | **Cut from v1 palette.** These are side-effects; collapse into "post-action" config on message / agent nodes in a future pass. v1 demo doesn't need them on canvas. |

**Net:** palette item count drops from ~13 to **10 draggable types** + 2 structural triggers. The cut kinds remain in `JourneyNodeKind` and `journeyConstants.ts` (so existing journeys load) but are filtered out of the palette and templates. They render via a generic fallback if encountered in old data.

### Palette item card (when drawer expanded)
56px tall, full drawer width − 24px:
```
[24px icon, tinted bg]   SMS
                         One-way text message
```
- Icon background: category-tinted `bg-{category}-50` or `bg-brand-50` for AI agents.
- Title: `text-sm`, 600, `--text-primary`.
- Subtitle: `text-xs`, `--text-tertiary`, single line.
- Hover: `bg-bg-subtle`, cursor grab, slight lift.
- Drag preview: ghost copy of the actual node card that will render on canvas.

---

## 5. Node visual hierarchy (3 distinct treatments)

The biggest readability win. Three tiers + an anchor.

### 5.1 Trigger nodes (Entry / Exit) — anchor
- **200px** wide, ~80px tall, `--radius-lg`, `--shadow-sm`.
- Border: `2px solid --brand-500` (Entry) / `2px solid --text-tertiary` (Exit).
- Background: `--bg-surface-raised`.
- Header: icon + uppercase tracked label `ENTRY TRIGGER` / `EXIT`.
- Body: title (`text-md`, 600) + sub (`text-xs`, `--text-secondary`).
- Status dot bottom-left (green=configured / amber=needs config).
- Ports: Entry has output only (right); Exit has input only (left). 8px circle, `--brand-500`, white 2px border, **always visible**.

### 5.2 Message nodes (SMS / WhatsApp / Email / RCS / Push) — uniform compact
- **240px** wide, min 96px tall.
- Border `1px solid --border-default`, `--bg-surface`, `--radius-lg`, `--shadow-xs`.
- **Header strip:** channel icon (24px in channel-tinted circle) + uppercase `WHATSAPP` + `⋯` menu.
- **Body:**
  - Template name (`text-sm`, 600).
  - **Content preview** — first 60 chars of template body, 2 lines max, ellipsis. (Pulled from `templateId → template.body` lookup.) **This is the Braze move.** It's what makes a 6-node journey scannable without clicking each node.
  - If no template: `Select template` link in `--brand-600`.
- **Footer strip:** estimated reach `~12K users` if available.
- Status dot bottom-left only — **no full-width "Needs configuration" chip**.
- Ports: left input + right output, 8px, `--brand-500`, always visible.

### 5.3 AI Agent nodes (Voice / Chat) — premium
- **260px** wide, min 140px tall.
- Border `1px solid --brand-200`.
- Background: `linear-gradient(135deg, --bg-surface 0%, --brand-50 100%)`.
- `--shadow-sm` + soft `--shadow-focus` blue glow on hover.
- **Header strip:** phone or chat icon (24px in `--brand-500` circle, white icon) + uppercase `VOICE AGENT` / `CHAT AGENT` in `--brand-700` + `⋯`.
- **Body:**
  - Selected agent name (`text-sm`, 600).
  - Sub-info chips row: `[GPT-4o] [Aria]` (model + voice).
  - Mini-meta row: `📞 1.2K calls · 87% success` (pulled from agent's deployment stats — already in mocks).
  - If no agent: `Select agent` link in `--brand-600`.
- **Voice agent outcome ports** (right side, labeled inline):
  - Answered (top)
  - Not Answered (middle)
  - Callback Requested (bottom)
  - Each port label visible to its right in `text-xs`, `--text-tertiary`.
- Status dot bottom-left.
- Replaces the violet treatment in `JourneyFlowNode.tsx:102` and `:299` (the only journey/ violet residue).

### 5.4 Logic nodes (Wait / Condition / Split) — minimal
- **180px** wide, min 72px.
- Border `1px dashed --border-default` (the dash signals "control, not content").
- Background `--bg-subtle`, `--radius-md`, no shadow.
- Compact single-line header: 16px icon + uppercase `WAIT` / `CONDITION` / `SPLIT`.
- Body: concise readout — `24 hours`, `dpd_bucket equals 30-60`, `50/50 across 2 paths`.
- Status dot bottom-left.
- Ports:
  - Wait: 1 in, 1 out.
  - Condition: 1 in, multiple typed outs (True / False or labeled branches).
  - Split: 1 in, multiple equal outs (Path A / B / …).

---

## 6. Edges

| State | Stroke | Width | Type |
|---|---|---|---|
| Default | `--border-strong` (#94A3B8) | 1.5px | smoothstep + arrow marker |
| Hover | `--brand-500` | 2px | smoothstep |
| Active path (selected node's in/out) | `--brand-500` | 2px | smoothstep + animated dash, 1.5s loop |

- Replace `JourneyBezierEdge` with `JourneySmoothEdge` (or extend the existing component to take a `variant` prop).
- Edge labels (True / False / Answered / Not Answered): `--bg-surface-raised` chip, `padding 2px 8px`, `--radius-sm`, `text-xs`, `--text-secondary`, 500 weight, mid-edge with subtle shadow.
- Animated active-path is the most satisfying interaction in the whole revamp — when you click a node, its rails light up and flow.

---

## 7. Interactions

- **Add:** drag from palette → drop, OR click palette item → place at canvas center / after selected, OR click `+` on a node's right port → opens palette filtered to sensible next-step types.
- **Configure:** click node → right-side **drawer** (formalized from existing `<aside>` width-transition), 420px, slides over canvas (does not push). Header (icon + title + close), body (existing form fields per kind), footer (Save primary + Cancel ghost). 240ms `--ease-out`.
- **Select:** 2px brand-500 border, `translateY(-1px)`, soft glow. Connected edges enter active-path mode. `Delete` / `Backspace` removes (confirm if connected). `Cmd/Ctrl+D` duplicates.
- **Connect:** drag output → input. Live preview = dashed `--brand-500` line. Compatible target ports highlight; incompatible dim.
- **Multi-select:** Shift-click + drag-rectangle. Bulk delete / duplicate.
- **Validation:** continuous (already today). Top-right `Validate journey` button shows current state via dot. Click → popover lists each issue with click-to-locate (pans + selects offending node). `Next` is disabled until errors clear; warnings allow proceed.

---

## 8. Pre-built journeys

Modal — `--bg-surface-raised`, `--shadow-xl`, `--radius-xl`, max-width 720px.

Title: **Start with a proven journey**

Grid: 3 cols desktop / 2 tablet / 1 mobile. Each card:
- Tinted icon header.
- Template name.
- 1-line description.
- Channel chip row (small icons).
- Node count: `5 steps`.
- `Use this template` button.

**Templates (5 — leverages existing 6 minus `blank`):**
1. **Cart Recovery — Multi-channel:** WhatsApp → Wait 24h → Voice Agent → Exit
2. **KYC Re-engagement:** SMS → Wait 48h → Condition (KYC complete?) → Voice Agent → Exit
3. **High-LTV Win-back:** Voice Agent → Wait 7d → WhatsApp → Exit
4. **Welcome Onboarding:** WhatsApp → Wait 1d → Email → Wait 3d → Push → Exit
5. **Loan Cross-sell:** Voice Agent (with outcome branches) → SMS (Not Answered) / Email (Callback) → Exit

Map onto existing template ids where possible (`recovery_voice`, `kyc`, `loan_sales`, `welcome`, `payment_reminder`); rebuild graphs to match descriptions exactly. `blank` stays as the default empty canvas (no modal entry).

Click → modal closes, canvas populates, focus lands on first non-trigger node.

---

## 9. Keyboard shortcuts

Floating cluster `?` opens a popover. v1 implements at minimum:
- `/` open palette
- `Esc` close palette / drawer / deselect
- `Delete` / `Backspace` remove selected
- `Cmd/Ctrl+D` duplicate
- `Cmd/Ctrl+Z` / `Cmd/Ctrl+Shift+Z` undo / redo (existing history wiring)
- `Cmd/Ctrl+S` save draft

Stretch (full set on shortcut popover, implement if cheap):
- `Cmd/Ctrl+Enter` validate
- `F` fit to view
- `+` / `-` zoom
- `Space+drag` pan

---

## 10. Out of scope (explicit "do not do")

- No new palette categories beyond the 4.
- No "Needs configuration" chips on nodes — bottom-left dot only.
- No card border around the canvas.
- No tooltip on every element — only on icon-only buttons.
- No auto-arrange. Offer opt-in `Tidy layout` action on floating cluster.
- No empty minimap by default.
- No change to wizard step count, names, or order.
- No change to underlying node data structure or React Flow setup beyond what the visuals require. `JourneyNodeKind` union stays compatible (cut kinds remain typed; just filtered from palette).

---

## 11. Work sequence

1. **Plan doc** (this file). ← *we are here. Stop after.*
2. **Layout reclaim** — §3 only. Slim stepper, full-bleed canvas, palette drawer scaffold (rail + slide-over), floating control cluster, docked footer. Ship + screenshot. **Gate.**
3. **Node visual rebuild** — §5. Trigger / message / AI agent / logic renderers. Reuse existing node data; renderer-only change. Add Braze-style content preview lookup. Screenshot diff.
4. **Edges + interactions** — §6 + §7. Smoothstep edges, animated active path, drawer-based config (formalize existing aside), select / delete / duplicate / connect-preview.
5. **Pre-built journeys** — §8. 5-card modal mapped onto existing template ids; rebuild graphs to match new descriptions exactly.
6. **Keyboard shortcuts** — §9. v1 set + popover.
7. **Polish pass** — walk a fresh journey end-to-end (entry → step 3 → blank → drag 5 nodes → connect → configure → validate → save). Before/after screenshots per canvas state. Stop and summarize.

Each phase ends with a screenshot gate. No moving forward until the prior phase is signed off.

---

## 12. Success criteria (from brief, restated for verification)

- [ ] Canvas occupies **80%+ of viewport** in default (palette collapsed) state.
- [ ] A user with no prior context can place 4 connected nodes in **under 30 seconds**.
- [ ] **AI Agent nodes are immediately distinguishable** from message nodes at a glance (gradient + glow + brand-tinted icon background).
- [ ] A 6-node journey is fully readable without zooming — titles, channel preview, branch labels all legible.
- [ ] Selecting a node visibly **lights up incoming + outgoing edges** with animated dash flow.
- [ ] Pre-built journey selection populates canvas in **under 1 second**.
- [ ] No redundant control / hidden-but-needed action / "needs configuration" without specificity / unjustified layout choice.
- [ ] Canvas reads as **n8n / Vapi quality**, not a generic React Flow demo.

---

## 13. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Existing config panel is 1338 lines of per-kind forms — risky to "convert to drawer" | Don't rewrite. The current `<aside>` is already a width-transition drawer; we only restyle the chrome (header, footer, slide-over instead of inline) and keep every form section as-is. |
| Cutting trigger kinds (5 → 1 with sub-type) could break old saved campaigns | The cut kinds remain in `JourneyNodeKind`. Renderer falls back to generic node display for any unknown kind. Only the palette & templates exclude them. No data migration. |
| Animated edges may chug on weak laptops | Animation only on active path (selected node's in/out edges), not all edges. Disable when `prefers-reduced-motion`. |
| 4 categories may feel limiting after demo feedback | Cuts are explicit and reversible. `journeyConstants.ts` palette groups are the only switch; we add a category back in <30 min if the demo audience asks. |
| Voice Agent outcome ports (Answered / Not Answered / Callback) require multi-handle React Flow setup | `journeyConstants.ts` already declares output handles per agent kind. Existing `JourneyFlowNode` already renders multi-handle for `voice_agent`. We're restyling, not re-wiring. |

---

**Status:** plan only. Awaiting go before starting Phase 2 (layout reclaim).
