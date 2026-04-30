import { create } from 'zustand';
import type { EvalCase, EvalCaseSource } from '@/types/call';

/**
 * Eval store — Phase 4.D.1
 *
 * Holds eval cases per agent. Ships with no seed cases — Phase 4.D.2 will
 * add ~12 manual cases per deployed agent. Promote-from-call writes to this
 * store; the eval suite UI in D.2 reads from it.
 */

export interface CreateEvalCaseInput {
  agentId: string;
  name: string;
  description: string;
  source: EvalCaseSource;
  sourceCallId?: string;
  scriptId?: string;
  turnRoles?: Array<'input' | 'fixed'>;
  judgePlan: string;
  expectedOutcome:
    | { kind: 'pass_fail' }
    | { kind: 'score_threshold'; threshold: number };
  tags?: string[];
}

interface EvalState {
  cases: EvalCase[];
  createCase: (input: CreateEvalCaseInput) => EvalCase;
  getCasesForAgent: (agentId: string) => EvalCase[];
  getCaseById: (id: string) => EvalCase | undefined;
}

export const useEvalStore = create<EvalState>((set, get) => ({
  cases: [],

  createCase: (input) => {
    const id = `eval-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const evalCase: EvalCase = {
      id,
      agentId: input.agentId,
      name: input.name,
      description: input.description,
      source: input.source,
      sourceCallId: input.sourceCallId,
      scriptId: input.scriptId,
      turnRoles: input.turnRoles,
      judgePlan: input.judgePlan,
      expectedOutcome: input.expectedOutcome,
      tags: input.tags ?? [],
      status: 'pending',
      createdBy: 'aniket@example.com',
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ cases: [evalCase, ...s.cases] }));
    return evalCase;
  },

  getCasesForAgent: (agentId) => get().cases.filter((c) => c.agentId === agentId),
  getCaseById: (id) => get().cases.find((c) => c.id === id),
}));
