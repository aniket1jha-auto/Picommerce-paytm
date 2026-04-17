'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Insight } from '@/types';
import { ConfidenceTag } from './ConfidenceTag';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { insightTagConfig, insightTagBorderColor } from './insightTagConfig';

interface CompanionCardProps {
  insight: Insight;
  onApply?: () => void;
  onDismiss?: () => void;
}

export function CompanionCard({ insight, onApply, onDismiss }: CompanionCardProps) {
  const tagConfig = insightTagConfig[insight.tag];
  const borderColor = insightTagBorderColor[insight.tag];

  const isGreenTag = tagConfig.color === 'green';

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="rounded-lg bg-white p-4 shadow-sm"
      style={{ borderLeft: `2px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles size={14} className="shrink-0 text-cyan" />
          <span className="text-sm font-medium text-text-primary leading-snug">
            {insight.title}
          </span>
        </div>
        <div className="shrink-0">
          <ConfidenceTag tag={tagConfig} />
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-3">
        {insight.description}
      </p>

      {/* Explainability */}
      {evidenceForPanel && (
        <ExplainabilityPanel evidence={evidenceForPanel} />
      )}

      {/* Footer */}
      {(onApply || onDismiss) && (
        <div className="mt-3 flex items-center gap-2">
          {onApply && (
            <button
              type="button"
              onClick={onApply}
              className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 ${
                isGreenTag
                  ? 'bg-cyan text-white'
                  : 'border border-cyan text-cyan bg-transparent hover:bg-cyan/5'
              }`}
            >
              {isGreenTag ? 'Apply' : 'Consider'}: {insight.cta.label}
            </button>
          )}
          {onDismiss && insight.dismissable && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-text-secondary transition-colors hover:text-text-primary"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
