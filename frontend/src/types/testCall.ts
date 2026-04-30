/**
 * Test-call playback types — Phase 2.11.
 *
 * A "test call" is a scripted conversation that plays back in the Live Test
 * Console with realistic timing and inline annotations (tool calls + KB
 * retrievals + per-turn latency breakdown).
 *
 * v1 is mock-only — no real LLM, no real telephony. Demo-believable, not real.
 *
 * The shapes here intentionally overlap with the post-hoc transcript types
 * envisioned in [docs/EVAL_SPEC.md §11](../../docs/EVAL_SPEC.md). Phase 4 will
 * unify them when the Promote-to-eval flow lands; for now we keep them
 * Phase-2-scoped.
 */

import type { KBChunk } from './knowledgeBase';

/** Per-phase latency breakdown for a single agent turn. */
export interface TurnLatency {
  asrMs: number;                            // user audio → text
  llmMs: number;                            // model think
  kbMs?: number;                            // retrieval (if it fired)
  toolMs?: number;                          // tool call (if any)
  ttsMs: number;                            // text → audio
}

export function totalLatencyMs(l: TurnLatency): number {
  return l.asrMs + l.llmMs + (l.kbMs ?? 0) + (l.toolMs ?? 0) + l.ttsMs;
}

/** Tool-call event annotation on an agent turn. */
export interface TestCallToolEvent {
  id: string;                               // 'tc-1'
  toolId: string;                           // matches ALL_TOOLS
  toolName: string;                         // denormalized for display
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'success' | 'failure';
  errorMessage?: string;
  latencyMs: number;
}

/** KB retrieval event annotation on an agent turn. */
export interface TestCallRetrievalEvent {
  id: string;                               // 'r-1'
  knowledgeBaseId: string;                  // matches mockKnowledgeBases ids
  query: string;
  topKChunkIds: string[];                   // matches mockKnowledgeBaseChunks ids; ranked
  citedChunkIds?: string[];                 // subset that the agent cited in its turn
  latencyMs: number;
}

export type TurnSentiment = 'positive' | 'neutral' | 'negative' | 'frustrated';

/** A user turn in the script. */
export interface TestCallUserTurn {
  kind: 'user';
  text: string;
  /** Wall time the turn takes to play out (typing dots → reveal → settle). */
  durationMs: number;
  sentiment?: TurnSentiment;
}

/** An agent turn in the script. */
export interface TestCallAgentTurn {
  kind: 'agent';
  text: string;
  latency: TurnLatency;
  /** Wall time the agent appears to "speak" the text after thinking. */
  speakingMs: number;
  retrievals?: TestCallRetrievalEvent[];
  toolCalls?: TestCallToolEvent[];
  sentiment?: TurnSentiment;                // sentiment the agent expressed (rare; usually neutral)
  /** Brief intent label shown in the vital-signs panel during this turn. */
  intent?: string;
}

export type TestCallTurn = TestCallUserTurn | TestCallAgentTurn;

/** A scripted demo conversation. */
export interface TestCallScript {
  id: string;
  /** Human-readable label shown if a script picker ever lands. */
  label: string;
  /** Use cases this script applies to (matches AgentConfiguration.useCase). */
  useCases: string[];
  /** Greeting line the agent will say if it starts the call. Optional. */
  openingLine?: string;
  turns: TestCallTurn[];
}

/** Resolved chunk for display — joined by the player from `mockKnowledgeBaseChunks`. */
export interface ResolvedRetrievalChunk extends KBChunk {
  score: number;
  cited: boolean;
}
