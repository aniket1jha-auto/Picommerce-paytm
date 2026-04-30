# ADR 0006 — Dark mode is the default theme; light is a toggle

**Status:** Proposed (Phase 0)
**Date:** 2026-04-28

---

## Context

Brief §6 lists three palette directions and explicitly proposes "a sophisticated dark mode as the primary theme with a high-contrast light mode as a toggle (voice-AI buyers skew technical and live in dark UIs)." The current build is light-only.

The choice of *default* matters more than the existence of both. First-page-load impression is what every buyer reads.

## Decision

Dark mode is the default. Light mode is a one-click toggle in the sidebar footer dropdown (alongside the phase indicator). The selection is persisted to `localStorage`. On first load (no preference stored), `prefers-color-scheme` is honored.

Both modes use the same accent palette (violet, saffron, teal); surface tokens (`bg-canvas`, `bg-surface`, etc.) are mode-mirrored per [DESIGN_SYSTEM.md §1](../DESIGN_SYSTEM.md).

## Alternatives considered

### A. Light default with dark toggle
- Pro: more conservative; matches the current build.
- Con: voice-AI-buyer audience skews dark; demoers will toggle to dark anyway. We waste the first-impression bullet.

### B. Dark only, no light toggle
- Pro: half the design / token work.
- Con: enterprise buyers — especially conservative IT — sometimes require light. A toggle is cheap insurance.

### C. Auto-follow system preference, no explicit toggle
- Pro: zero UI for theme.
- Con: demoers can't pin the appearance for a presentation. Toggle wins.

### D. Dark only for "technical" surfaces (eval, monitoring), light for "marketing" surfaces (campaigns, content)
- Pro: matches mental shifts.
- Con: jarring per-page transitions; breaks the unified look. Reject.

## Consequences

### Positive
- The first 30 seconds reads as voice-AI / technical / premium.
- The voice motif (teal waveform on dark background) gets its highest-contrast presentation by default.
- Dark surfaces hide chart-rendering imperfections better than light; useful while we're polishing.
- Switching to light is a one-click escape valve for buyers who genuinely prefer it.

### Negative
- Engineering cost: every chart and visualization needs per-mode palettes. Phase 1 commits to a `useChartPalette()` hook to centralize.
- Light-mode shadow story is harder to balance; expect a half-day per-component pass to tune.
- Documentation, marketing screenshots, and any external assets default to dark — a small comms detail to track.

### Neutral
- The π / "Commerce" wordmark works in both modes (the cyan/violet pi mark contrasts adequately on both `#0B0D12` and `#F7F8FA`).
- We don't ship `auto` (system) mode in v1 — only `dark` / `light` user-pinned. Keeps the UI simple. Could add `auto` later.
