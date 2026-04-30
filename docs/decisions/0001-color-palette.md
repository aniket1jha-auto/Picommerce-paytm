# ADR 0001 — Color palette: violet primary, saffron + teal accents, dark-default

**Status:** Proposed (Phase 0)
**Date:** 2026-04-28
**Decision owner:** Engineering / design lead
**Sign-off needed from:** Brief author

---

## Context

The current build uses a **navy sidebar (`#002970`) + corporate cyan primary action (`#00BAF2`) + light-only theme**. Brief §5 calls this "2020 SaaS-template aesthetic" — doesn't read as premium, doesn't read as voice-AI, doesn't read as ours. Brief §6 lists three accent candidates: electric violet, refined teal, warm Indian saffron. The brief explicitly grants design authority and asks for a defensible palette with light + dark mode tokens.

The competing palettes in our category (Braze, CleverTap, MoEngage) are all blue-led. Vapi (the closest analog product) uses a clean dark theme with restrained accents. Linear / Attio / Vercel — the inspirations the brief calls out — are dark-first with a single confident accent.

## Decision

1. **Primary accent: electric violet `#7C5CFF`.**
2. **Secondary accent (regional / festive moments): saffron `#FF8A3D`.** Used surgically — currency icons, region badges, Diwali / festive copy. Never as primary action color.
3. **Tertiary accent (live voice indicators): refined teal `#3DC9B0`.** Used for the waveform motif, recording dot, "live" indicators only. Functions as a sibling of the primary, not a competitor.
4. **Dark theme is default; light theme is a toggle.** Persisted to `localStorage`; respects `prefers-color-scheme` on first load.
5. Status colors are unified across modes: success `#34C77B`, warning `#F0B340`, error `#E5484D`, info `#5B9DFF`, neutral `#6B7080`.

Full token list in [DESIGN_SYSTEM.md §1](../DESIGN_SYSTEM.md).

## Alternatives considered

### A. Keep cyan as primary (status quo)
- Pro: zero migration cost.
- Con: indistinguishable from every retail-marketing dashboard. Fails the brief's "premium / voice-AI" bar.

### B. Refined teal primary, violet accent
- Pro: teal is also "voice-AI-coded" (used by Pinecone, by some agent products).
- Con: teal as primary action is harder to read on dark backgrounds at button scale. Violet has stronger semantic distinction from "blue marketing tool".

### C. Saffron primary
- Pro: most distinctive, regional flavor.
- Con: too loud for primary-action use across the product. Reads as marketing/retail. Better as accent.

### D. Light-default with dark toggle
- Pro: more conservative; matches current state.
- Con: voice-AI-buyer audience strongly prefers dark; demoers will switch to dark first thing anyway. Default-to-the-likely-target.

### E. Skip dark mode entirely
- Pro: half the work.
- Con: gives up a free signal of "we know what voice-AI buyers expect."

## Consequences

### Positive
- Distinct from competitor palette; visually signals "different category."
- Voice motif (teal) is *anchored* in the palette, not parachuted in.
- Saffron carries regional identity for Indian/UAE clients without making the whole product "ethnic-themed."
- Dark default plays to the voice-AI buyer; light toggle preserves choice.

### Negative
- Migration cost: every page needs a token sweep. Mitigated by the system being introduced in Phase 1 before feature work.
- Charts (Recharts) need per-mode palettes. Mitigated by a small `useChartPalette()` hook in Phase 1.
- Some buyers (especially conservative IT) will still prefer light. Toggle is one click.

### Neutral
- The π logo and "Commerce" wordmark stay. The palette change shifts the brand mark's read from "fintech-cyan" to "voice-AI-violet" without renaming anything.
