import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { mockKnowledgeBaseChunks } from '@/data/mock/knowledgeBases';
import { cn } from '@/components/ui';
import type { TestCallRetrievalEvent } from '@/types/testCall';

/**
 * Inline KB retrieval chip — appears beneath an agent turn that fired retrieval.
 * Collapsed by default; expand to see the ranked chunks with snippets and scores.
 *
 * Cited chunks (the agent actually used them in its turn) get an accent border;
 * non-cited but retrieved chunks render dimmed. Mirrors EVAL_SPEC.md §7 visual.
 */

interface Props {
  event: TestCallRetrievalEvent;
}

const SCORE_BANDS = [
  { min: 0.92, score: 0.92 },
  { min: 0.85, score: 0.85 },
  { min: 0.78, score: 0.78 },
  { min: 0.70, score: 0.70 },
  { min: 0.62, score: 0.62 },
  { min: 0.55, score: 0.55 },
];

export function InlineKBRetrieval({ event }: Props) {
  const [open, setOpen] = useState(false);
  const kb = useKnowledgeBaseStore((s) => s.getKB(event.knowledgeBaseId));

  const resolved = useMemo(() => {
    return event.topKChunkIds
      .map((id, idx) => {
        const chunk = mockKnowledgeBaseChunks.find((c) => c.id === id);
        if (!chunk) return null;
        return {
          ...chunk,
          score: SCORE_BANDS[Math.min(idx, SCORE_BANDS.length - 1)].score,
          cited: event.citedChunkIds?.includes(id) ?? false,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [event]);

  const cited = resolved.filter((c) => c.cited).length;

  return (
    <div className="ml-3 mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface',
          'px-2 h-6 text-[11px] text-text-secondary hover:text-text-primary hover:border-border-default transition-colors',
        )}
      >
        <BookOpen size={11} className="text-accent-live" />
        Retrieved {resolved.length} chunk{resolved.length === 1 ? '' : 's'}
        {cited > 0 && <span className="text-text-tertiary">· {cited} cited</span>}
        <span className="text-text-tertiary tabular-nums">· {event.latencyMs}ms</span>
        <ChevronRight
          size={11}
          className={cn('transition-transform', open && 'rotate-90')}
        />
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-1.5">
          {kb && (
            <div className="text-[11px] text-text-tertiary">
              <span>Source:</span>{' '}
              <Link
                to={`/knowledge-bases/${kb.id}`}
                className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary"
              >
                {kb.name}
                <ExternalLink size={10} />
              </Link>
              <span className="ml-2">·</span>
              <span className="ml-2 font-mono">{event.query}</span>
            </div>
          )}
          {resolved.map((c) => (
            <div
              key={c.id}
              className={cn(
                'rounded-md border bg-surface px-3 py-2',
                c.cited ? 'border-accent-live/50' : 'border-border-subtle opacity-75',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-text-secondary truncate">
                  {c.documentName}
                  {c.pageOrSection && (
                    <span className="ml-1 text-text-tertiary">· {c.pageOrSection}</span>
                  )}
                  {c.cited && (
                    <span className="ml-2 text-[10px] text-accent-live font-medium">
                      cited
                    </span>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-surface-sunken px-1.5 h-4 inline-flex items-center text-[10px] tabular-nums text-text-secondary">
                  {c.score.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-text-primary">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
