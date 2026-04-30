# ADR 0004 — Eval architecture: agent-scoped, transcript-as-truth, promote-to-eval as the loop closer

**Status:** Proposed (Phase 0)
**Date:** 2026-04-28

---

## Context

Brief §7 calls out the killer pattern from Vapi: thumbs-down on a bad call → it becomes an Eval test case → guards against regression forever. Brief §15 makes it the most-polished area of the product.

Today's build has four eval-adjacent components ([components/agents/evaluate/*](../../frontend/src/components/agents/evaluate)) — Performance Metrics, Transcript Viewer, Prompt Enhancement, Failure Analysis — that all ignore their `agentId` prop and render hardcoded mock data. There is no eval test case concept. There is no promote-to-eval action.

Architecture options:
- Build evals as a separate top-level section ("Evals", peer of Agents)
- Build evals inside the agent (tabs on AgentDetail)
- Build evals as a cross-product surface (one screen surfaces evals for any agent)
- Mix: agent-scoped tabs *plus* a cross-product call-logs surface that's shared

## Decision

**Agent-scoped eval, tabs inside `/agents/:id`. Plus a cross-product Call Logs surface under OBSERVE that links into agent-scoped drill-downs.**

Routes:
- Agent-scoped: `/agents/:id/eval`, `/agents/:id/eval/cases`, `/agents/:id/eval/cases/:caseId`, `/agents/:id/prompt-enhancements`, `/agents/:id/failures`, `/agents/:id/transcripts`, `/agents/:id/transcripts/:callId`
- Cross-product: `/monitoring/calls`, `/monitoring/calls/:id` (drill-down route shared with the agent-scoped one)

Promote-to-eval action is in the call-drilldown header. Post-promotion the eval case lives in the agent's eval suite. Full surface map: [EVAL_SPEC.md §2](../EVAL_SPEC.md).

## Alternatives considered

### A. Top-level Evals section (peer of Agents)
- Pro: one place to manage all evals across agents.
- Con: agents are the primary mental model; an eval *belongs to* an agent. Decoupling them is conceptual overhead. Vapi tried both — their later versions kept evals close to the assistant.

### B. Cross-product call-logs *only*; no per-agent eval surface
- Pro: simpler IA.
- Con: agent owners need a daily-driver pass-rate dashboard for *their* agent. Cross-product call logs is incident-response, not regular operations.

### C. Eval cases as a separate library (shared across agents)
- Pro: enables eval reuse for similar agents.
- Con: massive scope creep. v1 doesn't need shared libraries. Each agent's evals live with that agent.

### D. Eval lives only inside Test Console (no separate surface)
- Pro: minimal surface.
- Con: eval is *aggregate*; a single-call console is *per-call*. Different mental models.

## Consequences

### Positive
- Agent owners get one URL to bookmark for their agent's quality.
- Promote-to-eval is one click from a bad call to a saved test — the hero interaction lives where it should.
- Cross-product Call Logs lets ops / support investigate without picking an agent first.
- The same call-drill-down view serves live monitoring, post-hoc review, and eval-case definition. One mental model.

### Negative
- Per-agent eval list duplicates "all eval cases across agents" if we ever need it. Acceptable trade for v1.
- Routes proliferate (8 new agent-scoped routes). Phase 4 deliverable accepts this.
- Mock data shape is large: calls, transcripts, retrievals, tool-call events, eval cases, eval runs, prompt variants, prompt enhancements, failure modes. [EVAL_SPEC.md §11](../EVAL_SPEC.md) types it; [MOCKS_PLAN.md §7](../MOCKS_PLAN.md) commits to invariants.

### Neutral
- "Judge" is mocked in v1 — judge rationales pre-baked per case. v2 wires a real LLM-as-judge with a constrained schema.
- "Eval run" in v1 is scripted — no real agent invocation. The animation makes it feel real; the data behind it is fixed-per-case.
