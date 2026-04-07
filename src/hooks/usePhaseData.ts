import { useMemo } from 'react';
import type { Phase } from '@/types';
import { usePhaseStore } from '@/store/phaseStore';
import { getDay0Data, getDay1Data, getDay30Data } from '@/data/mock';

const phaseOrder: Record<Phase, number> = {
  day0: 0,
  day1: 1,
  day30: 2,
};

export function usePhaseData() {
  const phase = usePhaseStore((s) => s.phase);

  const data = useMemo(() => {
    switch (phase) {
      case 'day0':
        return getDay0Data();
      case 'day1':
        return getDay1Data();
      case 'day30':
        return getDay30Data();
    }
  }, [phase]);

  const isDay0 = phase === 'day0';
  const isDay1 = phase === 'day1';
  const isDay30 = phase === 'day30';

  const isAtLeast = (minPhase: Phase) => phaseOrder[phase] >= phaseOrder[minPhase];

  return {
    phase,
    isDay0,
    isDay1,
    isDay30,
    isAtLeast,
    campaigns: data.campaigns,
    segments: data.segments,
    insights: data.insights,
    analytics: data.analytics,
    kpis: data.kpis,
    dataSources: data.dataSources,
  };
}
