import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search, FileText, Globe, Database } from 'lucide-react';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { useAgentStore } from '@/store/agentStore';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Button,
  EmptyState,
  Input,
  StatusPill,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  cn,
} from '@/components/ui';
import { CreateKnowledgeBaseDialog } from '@/components/knowledge-bases/CreateKnowledgeBaseDialog';
import type { KBSource, KBStatus } from '@/types/knowledgeBase';
import { formatTimeAgoShort } from '@/utils/formatRelative';

const SOURCE_LABEL: Record<KBSource, string> = {
  files: 'Uploaded files',
  url: 'URL crawl',
  data_source: 'Data source',
};

const SOURCE_ICON: Record<KBSource, typeof FileText> = {
  files: FileText,
  url: Globe,
  data_source: Database,
};

const STATUS_PILL: Record<KBStatus, { kind: 'success' | 'info' | 'error' | 'neutral'; label: string }> = {
  ready: { kind: 'success', label: 'Ready' },
  indexing: { kind: 'info', label: 'Indexing' },
  error: { kind: 'error', label: 'Error' },
  empty: { kind: 'neutral', label: 'Empty' },
};

export function KnowledgeBases() {
  const knowledgeBases = useKnowledgeBaseStore((s) => s.knowledgeBases);
  const agents = useAgentStore((s) => s.agents);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return knowledgeBases;
    return knowledgeBases.filter(
      (kb) =>
        kb.name.toLowerCase().includes(q) ||
        kb.description?.toLowerCase().includes(q) ||
        kb.id.toLowerCase().includes(q),
    );
  }, [knowledgeBases, query]);

  const agentNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const a of agents) m[a.id] = a.config.name;
    return m;
  }, [agents]);

  return (
    <>
      <PageHeader
        title="Knowledge Bases"
        subtitle="Searchable knowledge that voice and chat agents can pull from during conversations."
        actions={
          <Button
            variant="primary"
            iconLeft={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            Create knowledge base
          </Button>
        }
      />

      {knowledgeBases.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No knowledge bases yet"
          body="Create one to give your agents searchable knowledge — product catalogs, policies, FAQs, anything text-based."
          primaryCta={
            <Button
              variant="primary"
              iconLeft={<Plus size={14} />}
              onClick={() => setCreateOpen(true)}
            >
              Create knowledge base
            </Button>
          }
        />
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <div className="relative max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <Input
              placeholder="Search knowledge bases…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <THead>
              <Tr hover={false}>
                <Th>Name</Th>
                <Th>Source</Th>
                <Th className="text-right">Documents</Th>
                <Th className="text-right">Chunks</Th>
                <Th className="text-right">Tokens</Th>
                <Th>Status</Th>
                <Th>Used by</Th>
                <Th>Updated</Th>
              </Tr>
            </THead>
            <TBody>
              {filtered.map((kb) => {
                const Icon = SOURCE_ICON[kb.source];
                const pill = STATUS_PILL[kb.status];
                return (
                  <Tr
                    key={kb.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/knowledge-bases/${kb.id}`)}
                  >
                    <Td>
                      <Link
                        to={`/knowledge-bases/${kb.id}`}
                        className="flex items-center gap-2 font-medium text-text-primary hover:text-accent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon size={14} className="text-text-tertiary" />
                        {kb.name}
                      </Link>
                      {kb.description && (
                        <div className="mt-0.5 text-[12px] text-text-secondary line-clamp-1">
                          {kb.description}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <span className="text-text-secondary text-[13px]">
                        {SOURCE_LABEL[kb.source]}
                      </span>
                    </Td>
                    <Td numeric className={cn(kb.documentCount === 0 && 'text-text-tertiary')}>
                      {kb.documentCount.toLocaleString('en-IN')}
                    </Td>
                    <Td numeric className={cn(kb.chunkCount === 0 && 'text-text-tertiary')}>
                      {kb.chunkCount.toLocaleString('en-IN')}
                    </Td>
                    <Td numeric className={cn(kb.tokenCount === 0 && 'text-text-tertiary')}>
                      {formatTokens(kb.tokenCount)}
                    </Td>
                    <Td>
                      <StatusPill status={pill.kind}>{pill.label}</StatusPill>
                    </Td>
                    <Td>
                      <UsedByCell agentIds={kb.usedByAgentIds} agentNameById={agentNameById} />
                    </Td>
                    <Td className="text-text-secondary text-[12px]">
                      {formatTimeAgoShort(kb.updatedAt)}
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-text-secondary">
              No knowledge bases match "{query}".
            </div>
          )}
        </div>
      )}

      <CreateKnowledgeBaseDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

function UsedByCell({
  agentIds,
  agentNameById,
}: {
  agentIds: string[];
  agentNameById: Record<string, string>;
}) {
  if (agentIds.length === 0) return <span className="text-text-tertiary">—</span>;
  const names = agentIds.map((id) => agentNameById[id] ?? id);
  const label = `${agentIds.length} agent${agentIds.length === 1 ? '' : 's'}`;
  return (
    <span className="text-[13px] text-text-secondary" title={names.join(', ')}>
      {label}
    </span>
  );
}

function formatTokens(n: number): string {
  if (n === 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}
