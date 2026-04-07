'use client';

import { X, Sparkles } from 'lucide-react';
import type { Insight } from '@/types';
import { ConfidenceTag } from './ConfidenceTag';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { insightTagConfig } from './insightTagConfig';

interface InlineInsightProps {
  insight: Insight;
  onDismiss?: () => void;
  onApply?: () => void;
}

export function InlineInsight({ insight, onDismiss, onApply }: InlineInsightProps) {
  const tagConfig = insightTagConfig[insight.tag];

  const evidenceForPanel =
    insight.evidence.length > 0
      ? {
          source: insight.context.dataSource,
          dataPoints: insight.evidence.map((e) => ({
            label: e.label,
            value: e.value,
          })),
        }
      : null;

  return (
    <div
      className="rounded-lg border border-[rgba(0,186,242,0.25)] p-3"
      style={{ backgroundColor: 'var(--color-ai-bg)' }}
    >
      {/* Top row: icon + title + tag + dismiss */}
      <div className="flex items-start gap-2">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-cyan" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-text-primary leading-snug">
              {insight.title}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              <ConfidenceTag tag={tagConfig} />
              {insight.dismissable && onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="flex h-5 w-5 items-center justify-center rounded text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
                  aria-label="Dismiss insight"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <p className="mt-0.5 text-sm text-text-secondary leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>

      {/* Footer: CTA + explainability */}
      {(onApply || evidenceForPanel) && (
        <div className="mt-2 pl-[22px]">
          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className="mb-1 inline-flex items-center rounded-md bg-cyan px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              {insight.cta.label}
            </button>
          )}
          {evidenceForPanel && (
            <ExplainabilityPanel evidence={evidenceForPanel} />
          )}
        </div>
      )}
    </div>
  );
}
