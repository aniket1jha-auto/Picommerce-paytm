import { create } from 'zustand';
import type { KnowledgeBase, KBDocument, KBStatus } from '@/types/knowledgeBase';
import {
  mockKnowledgeBases,
  mockKnowledgeBaseDocuments,
} from '@/data/mock/knowledgeBases';

interface KBState {
  knowledgeBases: KnowledgeBase[];
  documents: KBDocument[];
  setStatus: (id: string, status: KBStatus) => void;
  createKB: (
    input: Pick<KnowledgeBase, 'name' | 'description' | 'source'> &
      Partial<
        Pick<
          KnowledgeBase,
          | 'embeddingModel'
          | 'chunkSize'
          | 'chunkOverlap'
          | 'splitter'
          | 'documentCount'
          | 'chunkCount'
        >
      >,
  ) => KnowledgeBase;
  getKB: (id: string) => KnowledgeBase | undefined;
  getDocuments: (kbId: string) => KBDocument[];
}

export const useKnowledgeBaseStore = create<KBState>((set, get) => ({
  knowledgeBases: mockKnowledgeBases,
  documents: mockKnowledgeBaseDocuments,

  setStatus: (id, status) =>
    set((s) => ({
      knowledgeBases: s.knowledgeBases.map((kb) =>
        kb.id === id ? { ...kb, status, updatedAt: new Date().toISOString() } : kb,
      ),
    })),

  createKB: (input) => {
    const id = `kb-${String(Date.now()).slice(-6)}`;
    const now = new Date().toISOString();
    const kb: KnowledgeBase = {
      id,
      name: input.name,
      description: input.description,
      source: input.source,
      status: input.source === 'files' ? 'indexing' : 'empty',
      documentCount: input.documentCount ?? 0,
      chunkCount: input.chunkCount ?? 0,
      tokenCount: 0,
      embeddingModel: input.embeddingModel ?? 'text-embedding-3-large',
      chunkSize: input.chunkSize ?? 512,
      chunkOverlap: input.chunkOverlap ?? 64,
      splitter: input.splitter ?? 'recursive',
      usedByAgentIds: [],
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ knowledgeBases: [kb, ...s.knowledgeBases] }));

    // Mock indexing — flip to ready after 2.5s
    if (kb.status === 'indexing') {
      setTimeout(() => {
        set((s) => ({
          knowledgeBases: s.knowledgeBases.map((k) =>
            k.id === id ? { ...k, status: 'ready', updatedAt: new Date().toISOString() } : k,
          ),
        }));
      }, 2500);
    }
    return kb;
  },

  getKB: (id) => get().knowledgeBases.find((kb) => kb.id === id),
  getDocuments: (kbId) => get().documents.filter((d) => d.knowledgeBaseId === kbId),
}));
