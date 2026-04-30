# DESIGN_SYSTEM — Tokens, components, motion

**Date:** 2026-04-28
**Companion docs:** [decisions/0001-color-palette.md](decisions/0001-color-palette.md), [decisions/0006-dark-mode-default.md](decisions/0006-dark-mode-default.md), [AUDIT.md](AUDIT.md)

> Aim: Linear's clarity, Attio's elegant data surfaces, Vapi's voice-AI-native technical feel. Stay clear of the Braze / CleverTap / MoEngage marketing-cloud aesthetic. Premium, intentional, unmistakably ours.

The system below is **proposed**, not implemented. Phase 1 builds the tokens and primitives. Until then, treat this as the contract.

---

## 1. Color palette

### Decision

**Sophisticated dark theme as primary, high-contrast light as a toggle.** Voice-AI buyers skew technical and live in dark UIs. ([ADR 0006](decisions/0006-dark-mode-default.md))

**Single confident accent: electric violet** (`#7C5CFF`). The previous theme used cyan (`#00BAF2`) — cyan is what every retail-marketing dashboard already uses. Violet reads as voice-AI / technical. The agent-evaluation flow uses violet for primary actions; warmth and saffron-orange (`#FF8A3D`) carry the "Indian / regional" identity in surgical accent moments — never as primary action color.

Brief ([§6](../README.md)) listed violet, refined teal, or saffron as candidates. Violet is primary; saffron is secondary accent for India-specific moments (currency, region badges); teal is reserved for "live" voice indicators (waveform, recording dot) so it never competes with the primary action color.

Rationale fully captured in [ADR 0001](decisions/0001-color-palette.md).

### Semantic tokens

**Surfaces** (dark mode primary; light mode mirror tokens listed in §1.4):

| Token | Hex (dark) | Use |
|---|---|---|
| `bg-canvas` | `#0B0D12` | Body / page background |
| `bg-surface` | `#13161D` | Card / panel background |
| `bg-surface-raised` | `#1A1E27` | Modal / drawer / hovered card |
| `bg-surface-sunken` | `#08090D` | Inset blocks (transcripts, code, mono content) |
| `border-subtle` | `#22262F` | Panel dividers, table grid |
| `border-default` | `#2E333E` | Inputs, buttons (resting) |
| `border-strong` | `#444B58` | Focus rings, selected states |

**Text:**
| Token | Hex | Use |
|---|---|---|
| `text-primary` | `#EAEBEE` | Main copy |
| `text-secondary` | `#9CA1AC` | Labels, metadata |
| `text-tertiary` | `#6B7080` | Disabled, very-secondary |
| `text-on-accent` | `#FFFFFF` | Text on violet/orange/teal accents |
| `text-mono` | `#C7CCD6` | JSON, prompts, transcripts |

**Accents:**
| Token | Hex | Use |
|---|---|---|
| `accent` | `#7C5CFF` | Primary CTA, voice motif (waveform crest), selected nav |
| `accent-hover` | `#8E72FF` | Hover state |
| `accent-pressed` | `#6A4DE6` | Active / pressed |
| `accent-soft` | `rgba(124, 92, 255, 0.12)` | Tinted backgrounds (active pill, AI rail) |
| `accent-warm` | `#FF8A3D` | Saffron — region badges, spend (₹) icon, festive moments only |
| `accent-live` | `#3DC9B0` | Refined teal — recording dot, waveform mid, live indicators |

**Status (semantic — same across modes):**
| Token | Hex | Use |
|---|---|---|
| `status-success` | `#34C77B` | Delivered, deployed, healthy |
| `status-warning` | `#F0B340` | Pending review, fallback fired, degraded |
| `status-error` | `#E5484D` | Failed, error, blocked |
| `status-info` | `#5B9DFF` | Scheduled, in-progress neutral |
| `status-neutral` | `#6B7080` | Draft, idle |

Each status token also has a `*-soft` rgba variant at 12 % opacity for badge backgrounds.

### Light mode mirror tokens

| Token | Light hex |
|---|---|
| `bg-canvas` | `#F7F8FA` |
| `bg-surface` | `#FFFFFF` |
| `bg-surface-raised` | `#FFFFFF` (with shadow) |
| `bg-surface-sunken` | `#EFF1F5` |
| `border-subtle` | `#E7E9EE` |
| `border-default` | `#D4D7DD` |
| `border-strong` | `#9DA3AE` |
| `text-primary` | `#101218` |
| `text-secondary` | `#535862` |
| `text-tertiary` | `#878D97` |
| `accent` | `#6A4DE6` (slightly darker for AA contrast on white) |

Status tokens stay constant; their `*-soft` variants tweak alpha for legibility on white.

### What dies

- `cyan #00BAF2` → replaced by `accent #7C5CFF`. Cyan is reused only as `accent-live` neighbour (`#3DC9B0`, teal — different hue, same family).
- `navy #002970` sidebar → replaced by `bg-surface` (`#13161D` dark) / `bg-canvas` (`#F7F8FA` light).
- The π logo and "Commerce" wordmark are kept (out of scope to rename), but the sidebar brand block gets a typographic refresh — see §3.

---

## 2. Typography

| Role | Family | Weights | Size scale |
|---|---|---|---|
| UI sans | **Geist Sans** (with system fallbacks) | 400, 500, 600 | 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36 |
| Mono | **Geist Mono** | 400 | 12 / 13 / 14 |

Fallback stacks:
```
font-sans: 'Geist Sans', 'Inter var', 'Inter', system-ui, sans-serif;
font-mono: 'Geist Mono', 'JetBrains Mono', 'SFMono-Regular', monospace;
```

Geist is contemporary, neutral, voice-AI-native (Vercel uses it, Vapi uses Inter — we differentiate without straying far). Two weights of UI font, one of mono. No more.

**Type scale** (line-height in parens):
- 12 / 16 — micro (tags, badges)
- 13 / 18 — table cells, secondary copy
- 14 / 20 — body, default
- 16 / 22 — emphasized body, large input
- 18 / 26 — sub-headings
- 22 / 28 — page sub-titles
- 28 / 36 — page titles
- 36 / 44 — hero numbers (KPI value)

Mono is exclusively for: JSON / payloads, transcripts, IDs, URLs, prompts, eval test names.

**Numeric tabular**: KPI values use `font-feature-settings: "tnum" 1;` so digits align in stacked tables.

---

## 3. Spacing, radius, shadow

### Spacing (4 px base)
`0 / 2 / 4 / 6 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80`

Naming: `space-0` … `space-80`. No T-shirt sizes — numbers are clearer.

### Radius
| Token | Px | Use |
|---|---|---|
| `radius-xs` | 4 | Tags, chips |
| `radius-sm` | 6 | Inputs, buttons |
| `radius-md` | 10 | Cards, modal corners (small) |
| `radius-lg` | 14 | Modal, large surfaces |
| `radius-pill` | 999 | Status pills, segmented controls |

### Shadow
- `shadow-card` — surface lift (1 px + 4 px blur, 6 % alpha)
- `shadow-modal` — elevated overlay (24 px blur, 30 % alpha)
- `shadow-popover` — dropdown, tooltip (12 px blur, 18 % alpha)
- `shadow-glow-accent` — focus / active highlight (`accent` at 24 % alpha, 12 px spread)

In dark mode, shadows are quieter (lower alphas) and supplemented by a `border-default` 1 px outline. In light mode, shadow does the lifting and borders are subtler.

---

## 4. Component specs

### 4.1 Button

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| `primary` | `accent` | `text-on-accent` | none | Save, Deploy, Launch |
| `secondary` | `bg-surface-raised` | `text-primary` | `border-default` | Cancel, secondary action |
| `tertiary` | transparent | `text-primary` | none | Inline actions |
| `danger` | `status-error` | `text-on-accent` | none | Delete, force, hard cancel |
| `ghost` | transparent | `text-secondary` | none | Icon-only, table-row actions |

Sizes: `sm` (28 px), `md` (32 px), `lg` (40 px). Padding tokens: `space-12` / `space-16` / `space-20`.

Focus: `2 px` `accent` outline at `2 px` offset. Always visible on keyboard.

### 4.2 Status pill

`radius-pill`, `space-6 / space-10` padding, `12 / 16` type. Background `<status>-soft`, text `<status>`, no border. Always paired with a tiny semantic dot (4 px circle of the same status color).

Statuses (re-used everywhere identically):
- Active / Deployed / Delivered → `status-success`
- Pending / Scheduled / Indexing → `status-info`
- Warning / Degraded → `status-warning`
- Failed / Error → `status-error`
- Draft / Paused / Idle → `status-neutral`

### 4.3 Input / Select / Textarea

- Height 32 (md) or 40 (lg).
- Background `bg-surface-sunken` (subtle inset feel).
- Border `border-default`; focus border `accent` + `shadow-glow-accent`.
- Label above, helper text below at `12 / 16` `text-secondary`.
- Error: border `status-error`, helper text `status-error`.
- Numeric inputs use tabular figures.

### 4.4 Table

- Default for all dense list data (campaigns, calls, transcripts, audit logs, eval cases).
- Row height 40 (compact) or 48 (default).
- Header row: `bg-surface`, `text-secondary`, `12 / 16` uppercase letter-spacing 0.04em.
- Row dividers: `1 px` `border-subtle`.
- Hover: `bg-surface-raised`.
- Sortable columns: chevron icon next to header, arrow flips on click.
- Sticky header in scroll container.
- Empty state per table (see §4.10).

### 4.5 Card

Used only for object summaries with a primary action — agent cards, segment cards, KB cards, integration cards. Never for decoration.

- `bg-surface`, `border-subtle`, `radius-md`, `shadow-card`.
- Padding `space-20`.
- Hover: `border-default` + slight raise.
- Focus: `accent` outline.
- One primary action per card (button or anchor); never an action menu without an explicit trigger.

### 4.6 KPI tile

- `bg-surface`, `border-subtle`, `radius-md`.
- Label `12 / 16` `text-secondary` uppercase letter-spacing 0.04em.
- Value `36 / 44` `text-primary` tabular nums.
- Delta line: `12 / 16`, semantic color (success up / error down).
- Optional sparkline (data-driven, not decorative).

### 4.7 Tabs

- Underline style. `2 px` accent underline on active. `text-secondary` for inactive tabs.
- 32 px height, `space-12` horizontal padding, `space-16` between tabs.
- Used for in-page section switching (Agent detail, Analytics, Content Library).

### 4.8 Drawer / Modal

- Drawer slides from right, `480 px` default width (configurable: 360, 480, 720).
- `bg-surface-raised`, `border-subtle` left edge, `shadow-modal`.
- Modal centered, max width 640 (small) / 880 (large), `radius-lg`.
- Backdrop `rgba(0,0,0,0.6)` (dark) / `rgba(13,15,20,0.4)` (light).

### 4.9 Toast

- Bottom-right. `bg-surface-raised`, `border-subtle`, `radius-md`, `shadow-popover`.
- Status icon + title + (optional) one-line body + dismiss.
- Auto-dismiss 5 s; `error` toasts persist until dismissed.

### 4.10 Empty state

- Centered, max-width `420 px`.
- Icon (40 px, `text-tertiary`).
- Title `16 / 22` `text-primary`.
- Body `14 / 20` `text-secondary`.
- One primary CTA.
- Always says **what to do next**, never just "nothing here yet."

### 4.11 Loading skeleton

- `bg-surface-raised`, animated subtle shimmer (200 ms loop), `radius-sm`.
- Match the shape of the eventual content (table row, card, chart).
- Never a generic spinner on top-level pages.

### 4.12 Voice motif

A subtle waveform / audio-meter visual identity for voice surfaces. Defined as a reusable component:

- **Static rendering** (agent card, transcript row, call log row): a 5-bar mini-meter, 12 px tall, in `accent-live` (teal). Heights are derived from a deterministic hash of the agent / call ID — same agent always shows the same shape. Recognizable, not random.
- **Live rendering** (active call in monitoring, test console): the same 5-bar meter animated against incoming audio level (mock or real). Pulses softly even when muted.
- **Used on:** agent cards (corner), live monitoring rows, test-console hero, transcript player play button.
- **Not used on:** chat-only agents, campaign cards, analytics charts, anything outside voice.

One signature, two modes. Don't propagate it everywhere.

---

## 5. Motion

- Hover / focus state changes: 150 ms `cubic-bezier(0.16, 1, 0.3, 1)` (Linear-style ease-out).
- Drawer / modal in/out: 200 ms ease-out / 150 ms ease-in.
- Tab change: 120 ms cross-fade content; underline slides 180 ms.
- Toast: 220 ms in / 150 ms out.
- Page transition: none (instant route change). React Router default.
- Sidebar collapse: 200 ms (already in code at this duration — keep).
- **No marketing-page animation.** No parallax, no auto-playing video, no entrance choreography on dashboards.

---

## 6. Iconography

- **Lucide** stays (already in use). Stroke width 1.5 (default), 1.75 for prominent icons.
- Channel icons keep current per-channel color cues but desaturate them slightly so they don't out-shout the violet primary action.
- Voice motif icon (waveform component) is custom, not Lucide.

---

## 7. Reference screen mockup

Phase 0 ships a single reference application of these tokens at:

`docs/mockups/agent-detail-reference.tsx` *(to be created in Phase 1, week 1)*

Shows:
- Sidebar with new IA (per [IA.md](IA.md))
- AgentDetail in dark mode with the new palette
- One open call drill-down panel showing the transcript-with-retrieved-chunks pattern (per [KB_SPEC.md](KB_SPEC.md))
- The "Promote to eval" CTA (per [EVAL_SPEC.md](EVAL_SPEC.md))

This file is the single visual contract the senior PM and tech lead can point at.

---

## 8. What gets built when

| Phase | Design-system work |
|---|---|
| 1 | All tokens, all primitives, dark/light toggle, voice motif component, empty / loading / error scaffolds, reference screen |
| 2 | Apply system to Agents + KB + Tools surfaces |
| 3 | Apply to Audiences + Content + Campaigns |
| 4 | Apply to Monitoring + call drill-down + eval surfaces |
| 5 | Apply to Analytics + Reports + Configure pages |

---

## 9. Light vs dark mode UX

- **Default:** dark. ADR [0006](decisions/0006-dark-mode-default.md).
- Toggle lives in the sidebar footer dropdown (alongside the phase indicator) — see [IA.md §8](IA.md).
- Persisted to `localStorage`; respects `prefers-color-scheme` on first load.
- All charts use a per-mode palette (Recharts theme prop on each chart's mount).

---

## 10. Anti-patterns (do not do)

- **Cards as decoration.** Cards exist for an object you can act on. If there's no action, use a section header + table or a simple panel.
- **Color outside the palette.** Don't introduce a new green for a one-off success state — use `status-success`.
- **Outline + fill on the same control.** Buttons are filled or ghost, not both.
- **Different status colors per page.** "Active" is always the same green. "Pending" is always the same blue. Universal.
- **Sentence-case + Title-Case mixed.** Sentence case for buttons, labels, and copy. Title Case only for proper nouns.
- **Long paragraphs in helper text.** Helper text is one line. If you need more, link out.
- **Currency without symbol or unit.** Always ₹ prefix; "K" / "L" / "Cr" suffix. Never bare numbers.
- **Decorative sparklines.** A sparkline is a chart of real data, not a squiggle.
