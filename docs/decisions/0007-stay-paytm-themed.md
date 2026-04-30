# ADR 0007 — Stay Paytm-themed for v1; defer fictional client / multi-workspace

**Status:** Accepted (2026-04-28)
**Supersedes:** [ADR 0005](0005-mock-client.md)
**Date:** 2026-04-28

---

## Context

[ADR 0005](0005-mock-client.md) proposed pivoting all mock data into two fictional workspaces — Aurus Retail (India) and Marwa Real Estate (UAE) — to avoid demoing Paytm-themed mocks to non-Paytm buyers (Croma, Shoppers Stop, Emaar). The user reviewed the proposal and chose option 5A from the [Phase 0 summary](../../README.md): **stay Paytm-themed for now.**

Reasons given:
- Existing mocks are coherent and rich; rewriting them is a large-cost, low-clarity-gain effort right now.
- Voice + chat agents inside campaigns is the heavy story regardless of vertical theme; the financial-services context already exercises the demo well.
- Buyer-specific theming, if needed, can be done as a focused later effort, not as a Phase-1 foundation cost.

## Decision

1. **Keep all existing Paytm-themed mock content.** No rename of segments, campaigns, agents, KBs, content templates, voice scripts, or sender accounts. KYC, wallet, gold, loan recovery, Aadhaar OTP, "+91" phone formats — all stay.
2. **No workspace switcher in v1.** The sidebar shows the Paytm-themed product directly. Multi-tenancy is a future concept; it is *not* surfaced as a feature in v1.
3. **No currency abstraction.** Currency is INR (₹) everywhere. The duplicate `formatINR()` functions (three of them, per [AUDIT.md §4](../AUDIT.md)) still get consolidated into a single utility — but it stays `formatINR`, not `formatCurrency`.
4. **No locale layer.** Language options remain en-IN + hi-IN for content (already supported in agent voice + content template builders). RTL / Arabic is out.
5. **The Paytm-skew finding in [AUDIT.md §3](../AUDIT.md) is reframed** from "positioning liability" to "deliberate v1 choice — re-evaluate at v2."

## Alternatives reconsidered

| Option | Decision | Why |
|---|---|---|
| A. Stay Paytm | **Accepted** | User direction; lowest cost; mocks already coherent |
| B. Fictional retail / real estate (Aurus + Marwa) | Rejected | High mock-rewrite cost; user explicitly declined |
| C. Real-named buyer workspaces (Croma / Emaar) | Rejected | Implies they're already customers; sales-counterproductive |
| D. Single fictional fintech rename (PaySetu) | Rejected | Trades one branded specificity for another at meaningful cost; no upside |

## Consequences

### Positive
- **No mock-rewrite cost in Phase 1.** The largest single deliverable from the previous plan (1.6 — restructure mocks into workspaces) is removed. Phase 1 simplifies materially.
- **Demo continuity.** Existing campaign content, voice scripts, segments, and agent personas are field-tested in earlier reviews. No regression risk from rewriting them.
- **Decision is reversible.** If a future buyer relationship demands a vertical pivot, we can ship a workspace switcher and a new client at that time — the architecture (mock data files, formatters) doesn't preclude it.

### Negative
- **Demoing Paytm mocks to non-Paytm buyers (Croma, Shoppers Stop, Emaar).** This is the live tradeoff. Mitigation: the demoer narrates "this is one of our real clients' configurations — your setup will look different but the surfaces are the same." Brief acknowledges this as buyer-acceptable for now.
- **No AED demo for Emaar.** Mitigation: same narrative — "we support per-tenant currency in the architecture; for this demo we're showing INR."
- **Codebase folder name `Picommerce-paytm`** stays — minor; out of v1 scope to rename.
- **Future cost** of pulling out Paytm-specific copy is unchanged or slightly higher (more content accumulates as we build).

### Neutral
- The "do not handle PII / use synthetic data" discipline ([MOCKS_PLAN §10](../MOCKS_PLAN.md)) still applies — phone numbers, names, addresses are synthetic. We don't *strengthen* this just because we're staying Paytm-themed.
- The cross-entity invariant rules ([MOCKS_PLAN §7](../MOCKS_PLAN.md)) still apply — mocks must hold together end-to-end. Same checker, same rules.
- The phase indicator (Day 0 / 1 / 30) needed a new home (originally the workspace switcher); it relocates to a small dropdown in the sidebar footer next to the collapse toggle.

## Phase 1 implications

- Drop deliverable 1.6 (mock workspace restructure).
- Drop deliverable 1.8 (workspace switcher UI + `workspaceStore`).
- Keep deliverable 1.7 (consolidate three `formatINR` duplicates into one shared util).
- Update deliverable 1.9 (phase indicator now lands in sidebar footer, not workspace switcher dropdown).

[PHASING.md](../PHASING.md) is updated accordingly.
