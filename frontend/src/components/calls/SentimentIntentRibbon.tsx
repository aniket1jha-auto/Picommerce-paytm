import { useMemo } from 'react';
import { cn } from '@/components/ui';
import type { TestCallTurn, TurnSentiment } from '@/types/testCall';

/**
 * Sentiment + intent ribbon — Phase 4.E
 *
 * A single horizontal strip that summarizes the call: each turn produces
 * a sentiment marker; an intent label sits beneath, walking the call's arc.
 * Used at the top of the call drill-down (above the transcript) and in
 * eval-case detail (D.2).
 */

interface Props {
  turns: TestCallTurn[];
  className?: string;
}

const SENTIMENT_DISPLAY: Record<TurnSentiment, { emoji: string; label: string; cls: string }> = {
  positive: { emoji: '😀', label: 'positive', cls: 'text-success' },
  neutral: { emoji: '😐', label: 'neutral', cls: 'text-text-secondary' },
  negative: { emoji: '😟', label: 'negative', cls: 'text-warning' },
  frustrated: { emoji: '😠', label: 'frustrated', cls: 'text-error' },
};

export function SentimentIntentRibbon({ turns, className }: Props) {
  const points = useMemo(() => {
    return turns.map((t, i) => {
      const sentiment: TurnSentiment = t.sentiment ?? 'neutral';
      const intent =
        t.kind === 'agent' ? t.intent : t.kind === 'user' ? labelForUserSentiment(sentiment) : undefined;
      return { index: i, kind: t.kind, sentiment, intent };
    });
  }, [turns]);

  if (points.length === 0) return null;

  return (
    <div className={cn('rounded-md border border-border-subtle bg-surface p-3', className)}>
      {/* Sentiment row */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {points.map((p, i) => {
          const display = SENTIMENT_DISPLAY[p.sentiment];
          return (
            <div key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className="text-text-tertiary text-[10px]">→</span>}
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px]',
                  p.kind === 'user' ? 'opacity-100' : 'opacity-90',
                )}
                title={`${p.kind === 'user' ? 'User' : 'Agent'} · ${display.label}`}
              >
                <span>{display.emoji}</span>
                <span className={cn('hidden sm:inline', display.cls)}>{display.label}</span>
              </span>
            </div>
          );
        })}
        <span className="ml-1 inline-flex items-center gap-1 text-[10px] text-text-tertiary shrink-0">
          → <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />ended
        </span>
      </div>

      {/* Intent row */}
      <div className="mt-2 pt-2 border-t border-border-subtle flex items-center gap-1.5 overflow-x-auto text-[11px] text-text-secondary">
        <span className="text-[10px] uppercase font-semibold tracking-[0.06em] text-text-tertiary shrink-0 mr-1">
          Intent
        </span>
        {points.map((p, i) => {
          if (!p.intent) return null;
          return (
            <div key={i} className="flex items-center gap-1.5 shrink-0">
              {i > 0 && <span className="text-text-tertiary">·</span>}
              <span className="capitalize">{p.intent.replace(/_/g, ' ')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function labelForUserSentiment(s: TurnSentiment): string {
  switch (s) {
    case 'positive': return 'agreement';
    case 'frustrated': return 'objection';
    case 'negative': return 'concern';
    default: return 'reply';
  }
}
