import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, X, ExternalLink } from 'lucide-react';
import {
  Modal,
  Button,
  StatusPill,
  Select,
  Input,
  cn,
} from '@/components/ui';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import {
  DEFAULT_KB_ATTACHMENT,
  KB_RETRIEVAL_MODE_LABEL,
  KB_CITATION_STYLE_LABEL,
} from '@/types/knowledgeBase';
import type {
  AgentKBAttachment,
  KBRetrievalMode,
  KBCitationStyle,
  KnowledgeBase,
} from '@/types/knowledgeBase';

interface Props {
  attachments: AgentKBAttachment[];
  onChange: (next: AgentKBAttachment[]) => void;
}

/**
 * "Connect knowledge sources" — inline within the Instructions step.
 * Sibling to Global Tool Access. Per docs/KB_SPEC.md §6 and ADR-driven
 * 2026-04-29 user direction (KB is not a wizard step).
 */
export function ConnectKnowledgeSourcesPanel({ attachments, onChange }: Props) {
  const allKBs = useKnowledgeBaseStore((s) => s.knowledgeBases);
  const [pickerOpen, setPickerOpen] = useState(false);

  const attachedIds = useMemo(
    () => new Set(attachments.map((a) => a.knowledgeBaseId)),
    [attachments],
  );
  const kbById = useMemo(() => {
    const m: Record<string, KnowledgeBase> = {};
    for (const kb of allKBs) m[kb.id] = kb;
    return m;
  }, [allKBs]);

  function addAttachment(kbId: string) {
    if (attachedIds.has(kbId)) return;
    onChange([...attachments, { knowledgeBaseId: kbId, ...DEFAULT_KB_ATTACHMENT }]);
    setPickerOpen(false);
  }

  function detach(kbId: string) {
    onChange(attachments.filter((a) => a.knowledgeBaseId !== kbId));
  }

  function update(kbId: string, patch: Partial<AgentKBAttachment>) {
    onChange(
      attachments.map((a) => (a.knowledgeBaseId === kbId ? { ...a, ...patch } : a)),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">
            Connect knowledge sources
          </label>
          <p className="text-sm text-text-secondary">
            Knowledge bases this agent can search during conversations. Each attachment
            controls when retrieval fires and how chunks land in context.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          iconLeft={<Plus size={14} />}
          onClick={() => setPickerOpen(true)}
        >
          Connect
        </Button>
      </div>

      {attachments.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-default bg-surface-sunken p-5 text-center">
          <BookOpen size={18} className="mx-auto mb-2 text-text-tertiary" />
          <p className="text-[13px] text-text-secondary">
            No knowledge sources connected. The agent will rely on its prompt and tools alone.
          </p>
          <p className="mt-1 text-[12px] text-text-tertiary">
            <Link to="/knowledge-bases" className="hover:text-text-primary underline">
              Browse knowledge bases →
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {attachments.map((att) => {
            const kb = kbById[att.knowledgeBaseId];
            return (
              <AttachmentCard
                key={att.knowledgeBaseId}
                attachment={att}
                kb={kb}
                onChange={(patch) => update(att.knowledgeBaseId, patch)}
                onDetach={() => detach(att.knowledgeBaseId)}
              />
            );
          })}
        </div>
      )}

      <KBPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        knowledgeBases={allKBs}
        attachedIds={attachedIds}
        onPick={addAttachment}
      />
    </div>
  );
}

/* ─── Attachment row ────────────────────────────────────────────────────── */

interface AttachmentCardProps {
  attachment: AgentKBAttachment;
  kb: KnowledgeBase | undefined;
  onChange: (patch: Partial<AgentKBAttachment>) => void;
  onDetach: () => void;
}

function AttachmentCard({ attachment, kb, onChange, onDetach }: AttachmentCardProps) {
  if (!kb) {
    return (
      <div className="rounded-md border border-error-soft bg-error-soft p-3 text-[12px] text-error">
        Missing knowledge base "{attachment.knowledgeBaseId}".
        <button
          type="button"
          onClick={onDetach}
          className="ml-2 underline hover:no-underline"
        >
          Detach
        </button>
      </div>
    );
  }

  const ready = kb.status === 'ready';

  return (
    <div
      className={cn(
        'rounded-md border bg-surface p-3',
        ready ? 'border-border-subtle' : 'border-warning-soft',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="shrink-0 text-text-tertiary" />
            <Link
              to={`/knowledge-bases/${kb.id}`}
              className="text-sm font-medium text-text-primary hover:text-accent inline-flex items-center gap-1 min-w-0"
              title={kb.name}
            >
              <span className="truncate">{kb.name}</span>
              <ExternalLink size={11} className="shrink-0 text-text-tertiary" />
            </Link>
            <StatusPill
              status={
                kb.status === 'ready'
                  ? 'success'
                  : kb.status === 'indexing'
                  ? 'info'
                  : kb.status === 'error'
                  ? 'error'
                  : 'neutral'
              }
              size="sm"
            >
              {kb.status === 'ready'
                ? 'Ready'
                : kb.status === 'indexing'
                ? 'Indexing'
                : kb.status === 'error'
                ? 'Error'
                : 'Empty'}
            </StatusPill>
          </div>
          <div className="mt-0.5 text-[12px] text-text-tertiary">
            {kb.documentCount.toLocaleString('en-IN')} docs ·{' '}
            {kb.chunkCount.toLocaleString('en-IN')} chunks
          </div>
        </div>
        <button
          type="button"
          onClick={onDetach}
          aria-label="Detach"
          className="text-text-tertiary hover:text-error transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Settings row */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select
          label="Retrieval"
          value={attachment.retrievalMode}
          onChange={(e) =>
            onChange({ retrievalMode: e.target.value as KBRetrievalMode })
          }
        >
          {(Object.keys(KB_RETRIEVAL_MODE_LABEL) as KBRetrievalMode[]).map((m) => (
            <option key={m} value={m}>
              {KB_RETRIEVAL_MODE_LABEL[m]}
            </option>
          ))}
        </Select>
        <Select
          label="Top K"
          value={String(attachment.topK)}
          onChange={(e) => onChange({ topK: Number(e.target.value) })}
        >
          {[1, 2, 3, 4, 5, 6, 8].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
        <Input
          label="Threshold"
          type="number"
          step={0.05}
          min={0}
          max={1}
          value={attachment.scoreThreshold}
          onChange={(e) =>
            onChange({ scoreThreshold: Number(e.target.value) })
          }
        />
        <Select
          label="Citations"
          value={attachment.citationStyle}
          onChange={(e) =>
            onChange({ citationStyle: e.target.value as KBCitationStyle })
          }
        >
          {(Object.keys(KB_CITATION_STYLE_LABEL) as KBCitationStyle[]).map((s) => (
            <option key={s} value={s}>
              {KB_CITATION_STYLE_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      {!ready && kb.status !== 'empty' && (
        <p className="mt-2 text-[11px] text-warning">
          KB is not ready yet — retrieval will fall back gracefully until indexing completes.
        </p>
      )}
    </div>
  );
}

/* ─── Picker modal ─────────────────────────────────────────────────────── */

interface PickerProps {
  open: boolean;
  onClose: () => void;
  knowledgeBases: KnowledgeBase[];
  attachedIds: Set<string>;
  onPick: (kbId: string) => void;
}

function KBPickerModal({ open, onClose, knowledgeBases, attachedIds, onPick }: PickerProps) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return knowledgeBases;
    return knowledgeBases.filter(
      (kb) =>
        kb.name.toLowerCase().includes(q) ||
        kb.description?.toLowerCase().includes(q),
    );
  }, [knowledgeBases, query]);

  return (
    <Modal open={open} onClose={onClose} title="Connect a knowledge base" size="md">
      <Input
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className="mt-4 flex flex-col gap-1.5">
        {filtered.length === 0 && (
          <div className="py-6 text-center text-sm text-text-secondary">
            No knowledge bases match "{query}".
          </div>
        )}
        {filtered.map((kb) => {
          const already = attachedIds.has(kb.id);
          const ready = kb.status === 'ready';
          return (
            <button
              key={kb.id}
              type="button"
              disabled={already || !ready}
              onClick={() => onPick(kb.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors',
                already || !ready
                  ? 'border-border-subtle bg-surface-sunken opacity-60 cursor-not-allowed'
                  : 'border-border-subtle bg-surface hover:border-accent',
              )}
            >
              <BookOpen size={16} className="mt-0.5 shrink-0 text-text-tertiary" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {kb.name}
                  </span>
                  <StatusPill
                    status={
                      kb.status === 'ready'
                        ? 'success'
                        : kb.status === 'indexing'
                        ? 'info'
                        : kb.status === 'error'
                        ? 'error'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {kb.status === 'ready' ? 'Ready' : kb.status === 'indexing' ? 'Indexing' : kb.status === 'error' ? 'Error' : 'Empty'}
                  </StatusPill>
                  {already && (
                    <span className="text-[11px] text-text-tertiary">already attached</span>
                  )}
                </div>
                {kb.description && (
                  <div className="mt-0.5 text-[12px] text-text-secondary line-clamp-1">
                    {kb.description}
                  </div>
                )}
                <div className="mt-1 text-[11px] text-text-tertiary">
                  {kb.documentCount.toLocaleString('en-IN')} docs ·{' '}
                  {kb.chunkCount.toLocaleString('en-IN')} chunks
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
