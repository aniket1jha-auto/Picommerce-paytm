/**
 * Mock retrieval — Phase 2.
 * Spec: docs/KB_SPEC.md §5 / §10
 *
 * Strategy:
 * 1. Look up the query against `mockRetrievalQueryMap` (curated mappings).
 *    If any match's substrings appear in the query, return its ranked
 *    chunks with deterministically-derived scores.
 * 2. Otherwise, deterministically pick top-K chunks from the KB based on a
 *    hash of (query + chunk text). Same query → same chunks. Predictable
 *    for demos.
 *
 * Real retrieval lands in v2 with a vector store.
 */

import type {
  KBChunk,
  KBRetrievalResult,
  AgentKBAttachment,
} from '@/types/knowledgeBase';
import {
  mockKnowledgeBaseChunks,
  mockRetrievalQueryMap,
} from '@/data/mock/knowledgeBases';

export interface RetrieveOptions {
  knowledgeBaseId: string;
  query: string;
  topK?: number;
  scoreThreshold?: number;
}

export function retrieve({
  knowledgeBaseId,
  query,
  topK = 4,
  scoreThreshold = 0,
}: RetrieveOptions): KBRetrievalResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const kbChunks = mockKnowledgeBaseChunks.filter(
    (c) => c.knowledgeBaseId === knowledgeBaseId,
  );
  if (kbChunks.length === 0) return [];

  // 1. Curated match
  for (const map of mockRetrievalQueryMap) {
    if (map.kbId !== knowledgeBaseId) continue;
    if (map.matches.some((m) => q.includes(m))) {
      const ordered = map.chunkIds
        .map((id) => kbChunks.find((c) => c.id === id))
        .filter((c): c is KBChunk => Boolean(c));
      return ordered
        .slice(0, topK)
        .map((c, i) => ({
          ...c,
          score: clamp(0.92 - i * 0.07 - jitter(c.id, q) * 0.02, 0, 1),
        }))
        .filter((r) => r.score >= scoreThreshold);
    }
  }

  // 2. Deterministic fallback
  const ranked = kbChunks
    .map((c) => ({
      chunk: c,
      score: clamp(0.55 + jitter(c.id, q) * 0.4, 0, 1),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score >= scoreThreshold);

  return ranked.map((r) => ({ ...r.chunk, score: r.score }));
}

/** Run retrieval for every attachment on an agent — returns flat ranked results across KBs. */
export function retrieveForAgent(
  attachments: AgentKBAttachment[],
  query: string,
): Array<KBRetrievalResult & { attachment: AgentKBAttachment }> {
  const out: Array<KBRetrievalResult & { attachment: AgentKBAttachment }> = [];
  for (const att of attachments) {
    const results = retrieve({
      knowledgeBaseId: att.knowledgeBaseId,
      query,
      topK: att.topK,
      scoreThreshold: att.scoreThreshold,
    });
    for (const r of results) out.push({ ...r, attachment: att });
  }
  return out.sort((a, b) => b.score - a.score);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Cheap deterministic [0,1] hash of (id, query). Same inputs → same value. */
function jitter(id: string, query: string): number {
  let h = 2166136261;
  const seed = id + '|' + query;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return (h & 0xffff) / 0xffff;
}
