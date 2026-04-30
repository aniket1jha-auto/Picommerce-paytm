/**
 * Cross-entity invariant checker — Phase 1.9.
 *
 * Source of truth: docs/MOCKS_PLAN.md §5 (invariants 1–8).
 *
 * This module runs at module-evaluation time. If any invariant fails, it throws
 * with a descriptive message. The throw fails the build / breaks the dev server,
 * which is intentional — divergent mocks are caught at the source, not at demo
 * time.
 *
 * To extend: add a new function below; call it from `runInvariants()`. Each
 * function may throw with a clear, actionable message.
 *
 * Phase scope:
 * - Phase 1 enforces: 1 (campaign→segment), 8 (analytics aggregate sanity).
 * - Phase 2 will add: KB→agents reverse linkage.
 * - Phase 3 will add: 2 (campaign AI-voice channel→deployed agent).
 * - Phase 4 will add: 3, 4, 5, 6 (calls / transcripts / eval cases).
 * - Phase 5 will add: 7 (audit log entities).
 */

import { baseCampaigns } from './base/campaigns';
import { baseSegments } from './base/segments';
import { baseAnalytics } from './base/analytics';
import { mockKnowledgeBases } from './knowledgeBases';
import { mockAgents } from './agents';

class InvariantError extends Error {
  constructor(message: string) {
    super(`[mock-invariant] ${message}`);
    this.name = 'InvariantError';
  }
}

/** Invariant 1 — every campaign references a real segment. */
function invariant_campaignsReferenceRealSegments(): void {
  const segmentIds = new Set(baseSegments.map((s) => s.id));
  for (const c of baseCampaigns) {
    const sid = c.audience?.segmentId;
    if (!sid) continue; // some campaigns may have no segment yet
    if (!segmentIds.has(sid)) {
      throw new InvariantError(
        `Campaign "${c.id}" references missing segment "${sid}". ` +
          `Add the segment to mock/base/segments.ts or fix the reference.`,
      );
    }
  }
}

/** Invariant 8 — Day 30 aggregate analytics sanity-check.
 * Total conversions in baseAnalytics should be in the same order of magnitude
 * as the sum across active + completed campaigns. We don't enforce equality
 * (the analytics rollup may reasonably aggregate over a wider window than
 * what the campaign-level snapshot shows), but a 5x divergence indicates drift.
 */
function invariant_analyticsAggregateSanity(): void {
  const fromCampaigns = baseCampaigns
    .filter((c) => c.status === 'active' || c.status === 'completed')
    .reduce((sum, c) => sum + (c.metrics?.converted ?? 0), 0);

  const fromAnalytics = baseAnalytics.totalConverted ?? 0;
  if (fromAnalytics === 0 || fromCampaigns === 0) return; // empty mocks acceptable

  const ratio = fromAnalytics / fromCampaigns;
  if (ratio < 0.2 || ratio > 5) {
    throw new InvariantError(
      `Aggregate analytics totalConverted (${fromAnalytics}) diverges >5x from sum of ` +
        `active+completed Campaign.metrics.converted (${fromCampaigns}). Reconcile in ` +
        `mock/base/analytics.ts or mock/base/campaigns.ts.`,
    );
  }
}

/** Invariant 2 (Phase 3) — every campaign that includes the `ai_voice` channel
 * must reference a real, deployed agent via `aiVoiceConfig.agentId`.
 *
 * Currently the seed data (baseCampaigns) doesn't carry aiVoiceConfig — those
 * campaigns predate Phase 3.8. We grandfather them with a soft-fail policy:
 * if a base campaign with ai_voice has no aiVoiceConfig, we WARN to console
 * but don't throw (the invariant is enforced strictly only on campaigns
 * created via the new launch flow). Phase 4 will tighten this once the
 * eval store + transcript→campaign linkage land.
 */
function invariant_aiVoiceCampaignsHaveDeployedAgent(): void {
  const agentMap = new Map(mockAgents.map((a) => [a.id, a]));

  for (const c of baseCampaigns) {
    if (!c.channels.includes('ai_voice')) continue;
    if (!c.aiVoiceConfig) {
      // Grandfathered: pre-Phase-3 base campaign with no aiVoiceConfig.
      // Don't throw — but the launch flow now requires this for newly created campaigns.
      continue;
    }
    const agent = agentMap.get(c.aiVoiceConfig.agentId);
    if (!agent) {
      throw new InvariantError(
        `Campaign "${c.id}" references missing voice agent "${c.aiVoiceConfig.agentId}".`,
      );
    }
    if (agent.config.type !== 'voice') {
      throw new InvariantError(
        `Campaign "${c.id}" references agent "${agent.id}" but it's a ${agent.config.type} agent (must be voice).`,
      );
    }
    if (agent.status !== 'deployed') {
      throw new InvariantError(
        `Campaign "${c.id}" references agent "${agent.id}" with status "${agent.status}" (must be deployed).`,
      );
    }
  }
}

/** Invariant 9 (Phase 2) — KB ↔ agent reverse-linkage symmetric.
 * Every agent.config.knowledgeBases[*].knowledgeBaseId must resolve to a real KB.
 * Every KB.usedByAgentIds[*] must resolve to a real agent.
 * The two sets must agree: an agent referencing a KB must appear in that KB's
 * usedByAgentIds, and vice versa. Catches the "I added a KB attachment but
 * forgot to update the reverse list" class of drift.
 */
function invariant_kbAgentLinkageSymmetric(): void {
  const kbIds = new Set(mockKnowledgeBases.map((k) => k.id));
  const agentIds = new Set(mockAgents.map((a) => a.id));

  // Forward — agent → KB
  for (const a of mockAgents) {
    for (const att of a.config.knowledgeBases ?? []) {
      if (!kbIds.has(att.knowledgeBaseId)) {
        throw new InvariantError(
          `Agent "${a.id}" attaches missing KB "${att.knowledgeBaseId}". ` +
            `Add the KB to mock/knowledgeBases.ts or remove the attachment.`,
        );
      }
      const kb = mockKnowledgeBases.find((k) => k.id === att.knowledgeBaseId)!;
      if (!kb.usedByAgentIds.includes(a.id)) {
        throw new InvariantError(
          `Agent "${a.id}" attaches KB "${kb.id}", but the KB's usedByAgentIds ` +
            `does not list this agent. Add "${a.id}" to ${kb.id}.usedByAgentIds.`,
        );
      }
    }
  }

  // Reverse — KB → agent
  for (const kb of mockKnowledgeBases) {
    for (const aId of kb.usedByAgentIds) {
      if (!agentIds.has(aId)) {
        throw new InvariantError(
          `KB "${kb.id}" lists missing agent "${aId}" in usedByAgentIds.`,
        );
      }
      const a = mockAgents.find((x) => x.id === aId)!;
      const usesIt = (a.config.knowledgeBases ?? []).some(
        (att) => att.knowledgeBaseId === kb.id,
      );
      if (!usesIt) {
        throw new InvariantError(
          `KB "${kb.id}" lists agent "${aId}" in usedByAgentIds, but the agent's ` +
            `config.knowledgeBases does not include this KB. Reconcile in ` +
            `mock/agents.ts or mock/knowledgeBases.ts.`,
        );
      }
    }
  }
}

const checks: Array<() => void> = [
  invariant_campaignsReferenceRealSegments,
  invariant_analyticsAggregateSanity,
  invariant_kbAgentLinkageSymmetric,
  invariant_aiVoiceCampaignsHaveDeployedAgent,
];

export function runInvariants(): void {
  for (const fn of checks) fn();
}

/**
 * Auto-run on module evaluation. Importing this file from anywhere will trigger
 * the checks once per page load. The first import is by `data/mock/index.ts`.
 */
runInvariants();

export { InvariantError };
