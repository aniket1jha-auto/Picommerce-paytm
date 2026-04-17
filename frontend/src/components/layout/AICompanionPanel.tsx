'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { usePhaseStore } from '@/store/phaseStore';
import { useInsights } from '@/hooks/useInsights';
import { CompanionCard } from '@/components/ai/CompanionCard';

export function AICompanionPanel() {
  const collapsed = usePhaseStore((s) => s.companionCollapsed);
  const toggleCompanion = usePhaseStore((s) => s.toggleCompanion);

  const allInsights = useInsights('dashboard');
  const visibleInsights = allInsights.slice(0, 3);

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  }, []);

  const displayedInsights = visibleInsights.filter(
    (insight) => !dismissedIds.has(insight.id),
  );

  const insightCount = displayedInsights.length;

  return (
    <motion.aside
      className="fixed right-0 top-0 bottom-0 z-40 flex flex-col border-l border-[#E5E7EB] bg-white"
      animate={{ width: collapsed ? 48 : 320 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between bg-navy px-3">
        {collapsed ? (
          <button
            onClick={toggleCompanion}
            className="relative flex h-full w-full items-center justify-center text-white/80 transition-colors hover:text-white"
            aria-label="Expand AI Companion"
          >
            <Sparkles size={18} />
            {insightCount > 0 && (
              <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan text-[10px] font-bold text-white">
                {insightCount}
              </span>
            )}
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan" />
              <span className="text-sm font-semibold text-white">AI Companion</span>
              {insightCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan px-1 text-[11px] font-bold text-white">
                  {insightCount}
                </span>
              )}
            </div>
            <button
              onClick={toggleCompanion}
              className="flex h-7 w-7 items-center justify-center rounded text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Collapse AI Companion"
            >
              <PanelRightClose size={16} />
            </button>
          </>
        )}
      </div>

      {/* Body */}
      {collapsed ? (
        <button
          onClick={toggleCompanion}
          className="flex flex-1 flex-col items-center pt-4 text-text-secondary transition-colors hover:text-cyan"
          aria-label="Expand AI Companion"
        >
          <PanelRightOpen size={18} />
        </button>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {displayedInsights.length > 0 ? (
            <div className="flex flex-col gap-3">
              {displayedInsights.map((insight) => (
                <CompanionCard
                  key={insight.id}
                  insight={insight}
                  onDismiss={
                    insight.dismissable
                      ? () => handleDismiss(insight.id)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles size={24} className="mb-3 text-cyan/40" />
              <p className="text-sm text-text-secondary">
                No recommendations right now.
              </p>
              <p className="mt-1 text-xs text-text-secondary/70">
                Check back as your campaigns progress.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.aside>
  );
}
