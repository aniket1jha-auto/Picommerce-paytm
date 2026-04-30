import { useMemo } from 'react';
import type { Campaign, Phase } from '@/types';
import { usePhaseStore } from '@/store/phaseStore';
import { useCampaignStore } from '@/store/campaignStore';
import { baseCampaigns } from '@/data/mock/base/campaigns';
import { getDay0Data, getDay1Data, getDay30Data } from '@/data/mock';

const phaseOrder: Record<Phase, number> = {
  day0: 0,
  day1: 1,
  day30: 2,
};

export function usePhaseData() {
  const phase = usePhaseStore((s) => s.phase);
  const storeCampaigns = useCampaignStore((s) => s.campaigns);

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

  // Phase 3.7 — campaigns come from the store, with phase gating layered on.
  // Day 0 / Day 1 still surface no campaigns (consistent with the phase narrative).
  // Day 30+ surfaces base mocks plus any newly-created campaigns. We dedupe by ID
  // so re-importing baseCampaigns into the store doesn't double-count.
  const campaigns: Campaign[] = useMemo(() => {
    if (phase === 'day0' || phase === 'day1') return data.campaigns;
    const seen = new Set<string>();
    const merged: Campaign[] = [];
    for (const c of storeCampaigns) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        merged.push(c);
      }
    }
    // Surface base campaigns we may have lost if the store was somehow reset.
    for (const c of baseCampaigns) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        merged.push(c);
      }
    }
    return merged;
  }, [phase, storeCampaigns, data.campaigns]);

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
    campaigns,
    segments: data.segments,
    insights: data.insights,
    analytics: data.analytics,
    kpis: data.kpis,
    dataSources: data.dataSources,
  };
}
