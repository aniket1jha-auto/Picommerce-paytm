import { create } from 'zustand';
import type { Campaign, CampaignAIVoiceConfig, CampaignStatus, ChannelType } from '@/types';
import { baseCampaigns } from '@/data/mock/base/campaigns';

/**
 * Campaign store — Phase 3.7
 *
 * The CampaignWizard's launch handler now persists campaigns here. The
 * Campaigns list, CampaignDetail, and Dashboard all read from this store.
 * Initial state seeds with `baseCampaigns` so existing routes still render
 * exactly as before; newly-created campaigns get appended.
 *
 * Persistence is in-memory only — refresh resets to the seed. That's
 * acceptable for v1 demos; documented in MOCKS_PLAN. Phase 5 might add
 * sessionStorage if low-cost.
 */

export interface CreateCampaignInput {
  name: string;
  segmentId: string;
  segmentName: string;
  segmentSize: number;
  segmentReachable: number;
  channels: ChannelType[];
  /** Total budget in INR (paise). Optional — falls back to a sensible default if 0. */
  budgetAllocated: number;
  /** Optional ISO scheduled-at timestamp (when set, status becomes 'scheduled'). */
  scheduledAt?: string;
  /** Optional AI-voice config — required if `channels` includes 'ai_voice'. */
  aiVoiceConfig?: CampaignAIVoiceConfig;
}

interface CampaignState {
  campaigns: Campaign[];
  getCampaignById: (id: string) => Campaign | undefined;
  createCampaign: (input: CreateCampaignInput) => Campaign;
  updateStatus: (id: string, status: CampaignStatus) => void;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: baseCampaigns,

  getCampaignById: (id) => get().campaigns.find((c) => c.id === id),

  createCampaign: (input) => {
    const id = `camp-${String(Date.now()).slice(-6)}`;
    const now = new Date().toISOString();
    const status: CampaignStatus = input.scheduledAt ? 'scheduled' : 'draft';

    const campaign: Campaign = {
      id,
      name: input.name,
      status,
      channels: input.channels,
      audience: {
        segmentId: input.segmentId,
        segmentName: input.segmentName,
        size: input.segmentSize,
        reachable: input.segmentReachable,
      },
      budget: {
        allocated: input.budgetAllocated > 0 ? input.budgetAllocated : 100_000,
        spent: 0,
        remaining: input.budgetAllocated > 0 ? input.budgetAllocated : 100_000,
      },
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        converted: 0,
        revenue: 0,
        cost: 0,
        roi: 0,
        deliveryRate: 0,
        conversionRate: 0,
      },
      channelMetrics: [],
      trend: [],
      revenueLabel: 'Revenue',
      createdAt: now,
      scheduledAt: input.scheduledAt,
      aiVoiceConfig: input.aiVoiceConfig,
    };

    set((s) => ({ campaigns: [campaign, ...s.campaigns] }));
    return campaign;
  },

  updateStatus: (id, status) =>
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              ...(status === 'active' && !c.startedAt
                ? { startedAt: new Date().toISOString() }
                : {}),
              ...(status === 'completed' && !c.completedAt
                ? { completedAt: new Date().toISOString() }
                : {}),
            }
          : c,
      ),
    })),
}));
