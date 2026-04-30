# ADR 0003 — Knowledge Bases as a top-level BUILD section

**Status:** Proposed (Phase 0)
**Date:** 2026-04-28

---

## Context

Brief §9: a buyer should "look at this and immediately understand how knowledge plugs into the agent and how it shows up at runtime — without us building any actual retrieval." The 30-second test is explicit.

KB does not exist anywhere in today's UI. The closest artifact is a stub "Add Knowledge Base" dead button on the Tools page and an unused `KnowledgeBase` type in [types/tool.ts](../../frontend/src/types/tool.ts).

The placement options are:
- inside the Agent builder only (KB attached, not standalone)
- under Tools (subordinated)
- as a dedicated top-level section

## Decision

**Top-level under BUILD, second item, right after Agents.**

Three surfaces:
1. KB list at `/knowledge-bases`
2. KB detail at `/knowledge-bases/:id` with a Test Retrieval tab
3. KB step inside agent builder (step 5 of 7), plus retrieved-chunks shown inline in transcript drill-down

Full spec: [KB_SPEC.md](../KB_SPEC.md).

## Alternatives considered

### A. KB inside agent builder only, no list page
- Pro: matches Vapi's pattern.
- Con: hides KB from the IA. The 30-second test fails — a buyer scanning the sidebar will not see KB. Reuse across agents is hard to model.

### B. KB as a Tools sub-category
- Pro: reuses the Tools 2-pane layout.
- Con: subordinates KB to a peer concept. Conflates "tools the agent can call" with "knowledge the agent can read." Different mental models.

### C. KB inside Audiences (data lives there)
- Pro: data sources / audiences / KB share lineage.
- Con: KB is what the *agent* reads; audiences are *who* the campaign targets. Mixing them confuses both.

### D. KB as a top-level section under a new GROUNDING / KNOWLEDGE category
- Pro: would scale to additional grounding concepts (rules, glossaries, examples).
- Con: premature taxonomy. Phase 1 doesn't need a new group for one item.

## Consequences

### Positive
- The 30-second test is satisfied — buyer sees KB in the sidebar immediately.
- Reverse linkage ("which agents use this KB?") gets a natural home on the KB detail page.
- KB ingestion / retrieval test is independent of any agent — useful for delivery-team workflows where KBs are prepared on behalf of clients before agents are built.
- The transcript-with-chunks moment (in observability) becomes the showpiece for the RAG story.

### Negative
- One more sidebar item. Mitigated by removing Templates redirect, surfacing Reports, and folding Content Ideas into Content Library — net sidebar width unchanged.
- KB attached to an agent introduces a per-attachment config object (retrieval mode, top-K, threshold, citation style) that lives in `AgentConfiguration`. Type complexity rises. Acceptable.
- Reverse-linkage requires a runtime cross-walk between KB → Agents. Phase 2 mock data invariant covers it.

### Neutral
- v1 has no real retrieval; the Test Retrieval tab is hand-curated query→chunks plus deterministic random fallback. Acceptable for v1; honest in copy.
