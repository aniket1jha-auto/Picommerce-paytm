import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileText, BookOpen } from 'lucide-react';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { useAgentStore } from '@/store/agentStore';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Tabs,
  StatusPill,
  EmptyState,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
} from '@/components/ui';
import type { KBStatus } from '@/types/knowledgeBase';
import { KBTestRetrievalPanel } from '@/components/knowledge-bases/KBTestRetrievalPanel';
import { KBConfigurationPanel } from '@/components/knowledge-bases/KBConfigurationPanel';
import { formatTimeAgoShort } from '@/utils/formatRelative';

const TABS = [
  { id: 'documents' as const, label: 'Documents' },
  { id: 'configuration' as const, label: 'Configuration' },
  { id: 'test' as const, label: 'Test retrieval' },
];

const STATUS_PILL: Record<KBStatus, { kind: 'success' | 'info' | 'error' | 'neutral'; label: string }> = {
  ready: { kind: 'success', label: 'Ready' },
  indexing: { kind: 'info', label: 'Indexing' },
  error: { kind: 'error', label: 'Error' },
  empty: { kind: 'neutral', label: 'Empty' },
};

export function KnowledgeBaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const kb = useKnowledgeBaseStore((s) => (id ? s.getKB(id) : undefined));
  const documents = useKnowledgeBaseStore((s) => (id ? s.getDocuments(id) : []));
  const agents = useAgentStore((s) => s.agents);
  const [tab, setTab] = useState<typeof TABS[number]['id']>('documents');

  const usingAgents = useMemo(() => {
    if (!kb) return [];
    return agents.filter((a) => kb.usedByAgentIds.includes(a.id));
  }, [agents, kb]);

  if (!kb) {
    return (
      <>
        <button
          type="button"
          onClick={() => navigate('/knowledge-bases')}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={14} />
          Knowledge Bases
        </button>
        <EmptyState
          icon={BookOpen}
          title="Knowledge base not found"
          body="It may have been deleted, or the URL is wrong."
        />
      </>
    );
  }

  const pill = STATUS_PILL[kb.status];

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/knowledge-bases')}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <ChevronLeft size={14} />
        Knowledge Bases
      </button>

      <PageHeader
        title={kb.name}
        subtitle={kb.description}
        actions={<StatusPill status={pill.kind}>{pill.label}</StatusPill>}
      />

      {/* Stats strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Documents" value={kb.documentCount.toLocaleString('en-IN')} />
        <Stat label="Chunks" value={kb.chunkCount.toLocaleString('en-IN')} />
        <Stat
          label="Tokens"
          value={kb.tokenCount === 0 ? '—' : formatTokens(kb.tokenCount)}
        />
        <Stat
          label="Updated"
          value={formatTimeAgoShort(kb.updatedAt)}
          hint={`v · ${kb.embeddingModel}`}
        />
      </div>

      {/* Used-by */}
      {usingAgents.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-text-tertiary">Used by</span>
          {usingAgents.map((a) => (
            <Link
              key={a.id}
              to={`/agents/${a.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-2 h-6 text-text-primary hover:border-accent"
            >
              {a.config.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Tabs items={TABS} active={tab} onChange={setTab} />
      </div>

      <div className="mt-5">
        {tab === 'documents' && (
          <>
            {documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents yet"
                body={
                  kb.status === 'indexing'
                    ? 'Indexing in progress — sample documents will appear shortly.'
                    : 'Upload PDFs, DOCX, or markdown to give this KB content.'
                }
              />
            ) : (
              <Table>
                <THead>
                  <Tr hover={false}>
                    <Th>Name</Th>
                    <Th>Type</Th>
                    <Th className="text-right">Size</Th>
                    <Th className="text-right">Chunks</Th>
                    <Th>Status</Th>
                    <Th>Uploaded</Th>
                  </Tr>
                </THead>
                <TBody>
                  {documents.map((d) => (
                    <Tr key={d.id} hover={false}>
                      <Td>
                        <span className="inline-flex items-center gap-2 font-medium text-text-primary">
                          <FileText size={14} className="text-text-tertiary" />
                          {d.name}
                        </span>
                      </Td>
                      <Td>
                        <span className="rounded-sm border border-border-subtle bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-text-secondary">
                          {d.type}
                        </span>
                      </Td>
                      <Td numeric>{formatBytes(d.sizeBytes)}</Td>
                      <Td numeric>{d.chunkCount.toLocaleString('en-IN')}</Td>
                      <Td>
                        <StatusPill
                          status={d.status === 'indexed' ? 'success' : d.status === 'failed' ? 'error' : 'info'}
                          size="sm"
                        >
                          {d.status === 'indexed' ? 'Indexed' : d.status === 'failed' ? 'Failed' : 'Indexing'}
                        </StatusPill>
                      </Td>
                      <Td className="text-text-secondary text-[12px]">
                        {formatTimeAgoShort(d.uploadedAt)}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            )}
          </>
        )}

        {tab === 'configuration' && <KBConfigurationPanel kb={kb} />}

        {tab === 'test' && <KBTestRetrievalPanel kb={kb} />}
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
        {label}
      </div>
      <div className="mt-1 text-[20px] font-semibold text-text-primary tabular-nums">
        {value}
      </div>
      {hint && <div className="text-[11px] text-text-tertiary">{hint}</div>}
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function formatBytes(n: number): string {
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(1)} MB`;
  if (n >= 1_024) return `${(n / 1_024).toFixed(0)} KB`;
  return `${n} B`;
}
