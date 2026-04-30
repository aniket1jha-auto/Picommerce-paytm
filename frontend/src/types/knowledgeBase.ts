/**
 * Knowledge Base types — Phase 2.
 * Spec: docs/KB_SPEC.md §8
 *
 * v1 ships file-based KBs with mock indexing; URL crawl + data-source
 * surfaces are visible but disabled.
 */

export type KBStatus = 'ready' | 'indexing' | 'error' | 'empty';
export type KBSource = 'files' | 'url' | 'data_source';
export type KBSplitter = 'recursive' | 'markdown' | 'semantic';

export interface KnowledgeBase {
  id: string;                              // 'kb-001'
  name: string;
  description?: string;
  source: KBSource;
  status: KBStatus;
  documentCount: number;
  chunkCount: number;
  tokenCount: number;
  embeddingModel: string;
  chunkSize: number;                       // tokens
  chunkOverlap: number;                    // tokens
  splitter: KBSplitter;
  usedByAgentIds: string[];                // reverse linkage
  createdAt: string;
  updatedAt: string;
}

export type KBDocumentStatus = 'indexed' | 'indexing' | 'failed';

export interface KBDocument {
  id: string;
  knowledgeBaseId: string;
  name: string;                            // filename
  type: string;                            // 'pdf' | 'docx' | 'csv' | 'txt' | 'md'
  sizeBytes: number;
  chunkCount: number;
  status: KBDocumentStatus;
  uploadedAt: string;
}

export interface KBChunk {
  id: string;
  knowledgeBaseId: string;
  documentId: string;
  documentName: string;                    // denormalized for display
  pageOrSection?: string;                  // 'p. 4' | '§3' | 'row 1822'
  text: string;
  tokenCount: number;
}

export interface KBRetrievalResult extends KBChunk {
  score: number;                           // 0-1
}

/** Per-agent KB attachment config — lives on AgentConfiguration. */
export type KBRetrievalMode = 'always' | 'when_asked' | 'when_uncertain';
export type KBCitationStyle = 'inline' | 'footnote' | 'off';

export interface AgentKBAttachment {
  knowledgeBaseId: string;
  retrievalMode: KBRetrievalMode;
  topK: number;                            // 1-8
  scoreThreshold: number;                  // 0-1
  citationStyle: KBCitationStyle;
}

/** Defaults applied when an agent first attaches a KB. */
export const DEFAULT_KB_ATTACHMENT: Omit<AgentKBAttachment, 'knowledgeBaseId'> = {
  retrievalMode: 'when_asked',
  topK: 4,
  scoreThreshold: 0.65,
  citationStyle: 'inline',
};

export const KB_RETRIEVAL_MODE_LABEL: Record<KBRetrievalMode, string> = {
  always: 'Always retrieve',
  when_asked: 'Retrieve when asked',
  when_uncertain: 'Retrieve when uncertain',
};

export const KB_CITATION_STYLE_LABEL: Record<KBCitationStyle, string> = {
  inline: 'Inline',
  footnote: 'Footnote',
  off: 'Off',
};
