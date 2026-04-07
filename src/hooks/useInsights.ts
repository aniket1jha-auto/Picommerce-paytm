import { useMemo } from 'react';
import type { Phase, Insight } from '@/types';
import { usePhaseStore } from '@/store/phaseStore';
import { baseInsights } from '@/data/mock/base/insights';

const phaseOrder: Record<Phase, number> = {
  day0: 0,
  day1: 1,
  day30: 2,
};

/**
 * Returns insights filtered by current phase and an optional page/context string.
 * Only insights whose minPhase is at or below the current phase are returned.
 * If a context is provided, only insights matching that page context are returned.
 */
export function useInsights(context?: string) {
  const phase = usePhaseStore((s) => s.phase);

  const filtered = useMemo(() => {
    const currentOrder = phaseOrder[phase];

    return baseInsights.filter((insight: Insight) => {
      const insightOrder = phaseOrder[insight.minPhase];
      if (insightOrder > currentOrder) return false;
      if (context && insight.page && insight.page !== context) return false;
      return true;
    });
  }, [phase, context]);

  return filtered;
}
