# ADR 0005 — Mock clients: Aurus Retail (primary) and Marwa Real Estate (secondary)

**Status:** **Rejected** (2026-04-28). Superseded by [ADR 0007](0007-stay-paytm-themed.md).
**Date:** 2026-04-28

> Kept on file for historical context. The pivot to fictional Aurus + Marwa workspaces was rejected by the user in favor of staying on the existing Paytm-themed mocks for v1. The "do not handle PII / use synthetic data" discipline (§10) and the cross-entity invariant rules (§7 of MOCKS_PLAN.md) are still active. Currency abstraction and workspace switcher are deferred indefinitely.

---

## Context

Today's mocks are explicitly Paytm-themed (KYC, wallet, gold, loan recovery, Aadhaar OTP). The codebase folder is `Picommerce-paytm`. The brief targets demos to Emaar (UAE real estate), Croma (India retail), and Shoppers Stop (India retail). Showing Paytm-themed mocks to those buyers signals a copy-paste from an earlier client engagement.

Brief §10.8 asks for one fictional client and optionally a second. The choice has consequences for currency, locale, content, and the entire mock-data refactor.

## Decision

Two fictional client workspaces, switchable at demo time:

- **Aurus Retail** — primary. Indian omnichannel retailer (electronics + lifestyle), Bengaluru-headquartered. Currency ₹. Languages en-IN, hi-IN. Models Croma + Shoppers Stop.
- **Marwa Real Estate** — secondary. UAE conglomerate (residential, commercial, hospitality), Dubai-headquartered. Currency AED. Languages en-AE, ar-AE. Models Emaar.

Aurus carries the depth of mock data (more campaigns, more agents, richer call logs) and is the default workspace for in-product entry. Marwa is the one-click pivot for Emaar-flavored demos.

Full content patterns: [MOCKS_PLAN.md](../MOCKS_PLAN.md).

## Alternatives considered

### A. Stay Paytm
- Pro: zero rewrite cost; mocks are already coherent.
- Con: codebase folder is `Picommerce-paytm`; demoing Paytm-themed mocks to Croma is awkward at best, off-putting at worst. The brief asks us to fix this.

### B. Single fictional client only (Aurus)
- Pro: half the mock-rewrite work.
- Con: no AED demo, no RTL demo, no UAE positioning. Emaar visit lands flat.

### C. Generic / no-named client (everything labeled "Demo")
- Pro: maximally neutral.
- Con: mocks read as fake. A buyer wants a believable client to project onto. "Aurus" + "Marwa" carry just enough fictional specificity to feel real.

### D. Emaar / Croma / Shoppers-Stop as named workspaces
- Pro: maximum demo specificity.
- Con: implies the buyer's competitor is already a customer. Counter-productive in sales conversations.

### E. Pivot to financial services with a fictional Indian fintech (PaySetu, Axiom Wallet)
- Pro: re-uses existing mock content with minimal rewrite.
- Con: wrong vertical for the named buyers (retail + real estate). Squanders the rewrite opportunity.

## Consequences

### Positive
- Aurus reads naturally in front of Croma / Shoppers Stop without naming them.
- Marwa exercises the currency / locale / RTL story for Emaar.
- The product visibly multi-tenant from day one — workspace switcher is a feature, not an afterthought.
- Currency abstraction (`formatCurrency()` replacing three `formatINR` duplicates) is forced by the multi-workspace decision.

### Negative
- Mock-data refactor is large (Phase 1 deliverable 1.6). Acceptable; this is the right time.
- Two workspaces × every entity type = ~40 mock files. Mitigated by sharing schema-level types and limiting Marwa's depth (smaller seed counts per [MOCKS_PLAN.md §5](../MOCKS_PLAN.md)).
- Marwa Arabic content is a partial v1 — UI chrome stays English; only voice scripts and template bodies show Arabic. Honest about it; cleaner than half-implementing full RTL UI.

### Neutral
- The codebase folder name (`Picommerce-paytm`) is out of scope to rename in v1; no impact on the product UI.
- The π / "Commerce" wordmark stays. Workspace name (Aurus / Marwa) is shown next to it in the switcher; the product brand stays as is.
