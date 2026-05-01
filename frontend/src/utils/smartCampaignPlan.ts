import type { ChannelType } from '@/types';
import type { WaterfallStep } from '@/components/waterfall/WaterfallStepList';
import { channels as ALL_CHANNELS, PLATFORM_REACHABILITY_RATES } from '@/data/channels';

export interface SmartSubSegment {
  id: string;
  name: string;
  userCount: number;
  percentage: number;
  tags: string[];
  primaryChannel: ChannelType;
  journey: WaterfallStep[];
  estimatedCost: number;
  group: string;
  reason: string;
  /** Window when the sequence runs (e.g. "9-11 AM IST"). */
  timing?: string;
  /** Estimated conversion rate (0-100). */
  conversionPct?: number;
}

function getChannelName(channelId: ChannelType): string {
  const ch = ALL_CHANNELS.find((c) => c.id === channelId);
  return ch?.name ?? channelId;
}

function getChannelUnitCost(channelId: ChannelType): number {
  const ch = ALL_CHANNELS.find((c) => c.id === channelId);
  return ch?.unitCost ?? 0;
}

function computeJourneyCost(journey: WaterfallStep[], userCount: number): number {
  let remaining = userCount;
  let cost = 0;
  for (const step of journey) {
    const unit = getChannelUnitCost(step.channelId as ChannelType);
    cost += remaining * unit;
    // crude funneling per attempt
    const drop = step.channelId === 'ai_voice' ? 0.62 : 0.55;
    remaining = Math.max(0, Math.round(remaining * drop));
  }
  return cost;
}

export function generateSmartSubSegments(params: {
  selectedChannels: ChannelType[];
  segmentSize: number;
  highIntentEnabled: boolean;
  highIntentCount: number;
  tentativeBudget: number;
}): SmartSubSegment[] {
  const { selectedChannels, segmentSize, highIntentEnabled, highIntentCount, tentativeBudget } = params;

  // Demo-like generation (deterministic + similar to the screenshot)
  if (selectedChannels.length === 0 || segmentSize <= 0) return [];

  const scale = Math.max(0.2, Math.min(2.0, segmentSize / 39200));

  const demoSegments: SmartSubSegment[] = [
    {
      id: 'ss-1',
      name: 'High Value + WhatsApp',
      userCount: Math.round(8100 * scale),
      percentage: 18,
      tags: ['high-ltv', 'whatsapp-first', 'accelerated'],
      primaryChannel: 'whatsapp',
      journey: [
        { channelId: 'whatsapp', waitDuration: '24h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
        { channelId: 'ai_voice', waitDuration: '24h', triggerCondition: 'no_response', maxRetries: 2, retryGap: '24h' },
      ],
      estimatedCost: 0,
      group: 'high-value',
      reason:
        'High LTV, WhatsApp reachable, accelerated sequence to maximise reach',
      timing: 'Send immediately',
      conversionPct: 12.4,
    },
    {
      id: 'ss-2',
      name: 'WhatsApp — Morning Responders',
      userCount: Math.round(7400 * scale),
      percentage: 16,
      tags: ['whatsapp-first', 'morning'],
      primaryChannel: 'whatsapp',
      journey: [
        { channelId: 'whatsapp', waitDuration: '24h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
        { channelId: 'sms', waitDuration: '48h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
      ],
      estimatedCost: 0,
      group: 'whatsapp-first',
      reason: 'WhatsApp reachable, peak engagement 9–11 AM, 6.8% conversion',
      timing: '9–11 AM IST',
      conversionPct: 6.8,
    },
    {
      id: 'ss-3',
      name: 'SMS Only — No App',
      userCount: Math.round(6200 * scale),
      percentage: 14,
      tags: ['sms-first', 'no-app'],
      primaryChannel: 'sms',
      journey: [
        { channelId: 'sms', waitDuration: '48h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
        { channelId: 'ai_voice', waitDuration: '72h', triggerCondition: 'no_response', maxRetries: 2, retryGap: '24h' },
      ],
      estimatedCost: 0,
      group: 'sms-first',
      reason: 'No WhatsApp or app, SMS-only reachable, AI Voice fallback',
      timing: '10 AM–7 PM IST',
      conversionPct: 3.8,
    },
    {
      id: 'ss-4',
      name: 'WhatsApp — Evening Responders',
      userCount: Math.round(5200 * scale),
      percentage: 12,
      tags: ['whatsapp-first', 'evening'],
      primaryChannel: 'whatsapp',
      journey: [
        { channelId: 'whatsapp', waitDuration: '24h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
        { channelId: 'ai_voice', waitDuration: '48h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '24h' },
      ],
      estimatedCost: 0,
      group: 'whatsapp-first',
      reason: 'WhatsApp reachable, peak engagement 5–9 PM, evening delivery',
      timing: '5–9 PM IST',
      conversionPct: 5.9,
    },
    {
      id: 'ss-5',
      name: 'WhatsApp — Weekend Active',
      userCount: Math.round(4800 * scale),
      percentage: 11,
      tags: ['whatsapp-first', 'weekend'],
      primaryChannel: 'whatsapp',
      journey: [
        { channelId: 'whatsapp', waitDuration: '48h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
        { channelId: 'sms', waitDuration: '72h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
      ],
      estimatedCost: 0,
      group: 'whatsapp-first',
      reason: 'Weekend active, has app, push as cheaper fallback before SMS',
      timing: 'Sat–Sun, 11 AM–6 PM',
      conversionPct: 5.2,
    },
    {
      id: 'ss-6',
      name: 'SMS — Tier 3 Cities',
      userCount: Math.round(4200 * scale),
      percentage: 9,
      tags: ['sms-first', 'tier3'],
      primaryChannel: 'sms',
      journey: [
        { channelId: 'sms', waitDuration: '72h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
        { channelId: 'ai_voice', waitDuration: '72h', triggerCondition: 'no_response', maxRetries: 2, retryGap: '24h' },
      ],
      estimatedCost: 0,
      group: 'sms-first',
      reason: 'Tier 3 cities, slower response patterns, cost-efficient 2-step sequence',
      timing: '11 AM–6 PM IST',
      conversionPct: 3.1,
    },
    {
      id: 'ss-7',
      name: 'AI Voice Only',
      userCount: Math.round(3300 * scale),
      percentage: 7,
      tags: ['voice-first'],
      primaryChannel: 'ai_voice',
      journey: [
        { channelId: 'ai_voice', waitDuration: '72h', triggerCondition: 'no_response', maxRetries: 2, retryGap: '24h' },
        { channelId: 'sms', waitDuration: '72h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
      ],
      estimatedCost: 0,
      group: 'voice-first',
      reason: 'Phone-only reachable, AI Voice primary, SMS follow-up',
      timing: '11 AM–7 PM IST',
      conversionPct: 8.5,
    },
  ];

  const filtered = demoSegments.filter((ss) => {
    if (ss.group === 'high-value') return highIntentEnabled || selectedChannels.includes('whatsapp');
    return selectedChannels.includes(ss.primaryChannel);
  });

  const withFilteredJourneys = filtered.map((ss) => {
    const filteredJourney =
      selectedChannels.length > 0 ? ss.journey.filter((step) => selectedChannels.includes(step.channelId as ChannelType)) : ss.journey;
    const journey = filteredJourney.length > 0 ? filteredJourney : ss.journey.slice(0, 1);
    return { ...ss, journey, estimatedCost: computeJourneyCost(journey, ss.userCount) };
  });

  const totalCost = withFilteredJourneys.reduce((acc, ss) => acc + ss.estimatedCost, 0);
  if (tentativeBudget > 0 && totalCost > tentativeBudget) {
    return withFilteredJourneys.map((ss) => {
      if (ss.group === 'high-value') return ss;
      const trimmed = ss.journey.filter((step) => step.channelId !== 'field_executive');
      const journey = trimmed.length > 0 ? trimmed : ss.journey.slice(0, 1);
      return { ...ss, journey, estimatedCost: computeJourneyCost(journey, ss.userCount), tags: [...ss.tags, 'budget-optimized'] };
    });
  }

  // fallback generic generation for non-demo-like channel sets (keeps deterministic behaviour)
  if (withFilteredJourneys.length > 0) return withFilteredJourneys;

  const sortedChannels = [...selectedChannels].sort((a, b) => {
    const ra = Math.round(segmentSize * (PLATFORM_REACHABILITY_RATES[a] ?? 0));
    const rb = Math.round(segmentSize * (PLATFORM_REACHABILITY_RATES[b] ?? 0));
    return rb - ra;
  });

  const segments: SmartSubSegment[] = [];
  let remainingUsers = segmentSize;
  if (highIntentEnabled && highIntentCount > 0) {
    const count = Math.min(highIntentCount, segmentSize);
    remainingUsers -= count;
    const journey: WaterfallStep[] = sortedChannels.map((ch) => ({
      channelId: ch,
      waitDuration: '24h',
      triggerCondition: 'no_response',
      maxRetries: 1,
      retryGap: '6h',
    }));
    segments.push({
      id: 'ss-hi',
      name: 'High Value',
      userCount: count,
      percentage: Math.round((count / segmentSize) * 100),
      tags: ['high-value'],
      primaryChannel: sortedChannels[0],
      journey,
      estimatedCost: computeJourneyCost(journey, count),
      group: 'high-value',
      reason: 'High-value users identified from your criteria. Multi-channel accelerated sequence.',
      timing: 'Send immediately',
      conversionPct: 11.0,
    });
  }

  sortedChannels.forEach((primaryChannel, idx) => {
    const reach = Math.round(remainingUsers * (PLATFORM_REACHABILITY_RATES[primaryChannel] ?? 0));
    const morning = Math.round(reach * 0.6);
    const evening = reach - morning;
    const fallbacks = sortedChannels.filter((ch) => ch !== primaryChannel);
    const mkJourney = (): WaterfallStep[] => [
      { channelId: primaryChannel, waitDuration: '48h', triggerCondition: 'no_response', maxRetries: 1, retryGap: '6h' },
      ...fallbacks.slice(0, 2).map((ch) => ({
        channelId: ch,
        waitDuration: '72h' as const,
        triggerCondition: 'no_response',
        maxRetries: 1 as const,
        retryGap: '6h',
      })),
    ];
    const groupKey = `${primaryChannel.replace('_', '')}-first`;
    const chName = getChannelName(primaryChannel);
    if (morning > 0) {
      const journey = mkJourney();
      segments.push({
        id: `ss-${idx}-morning`,
        name: `${chName} — Morning Responders`,
        userCount: morning,
        percentage: Math.round((morning / segmentSize) * 100),
        tags: [`${primaryChannel}-first`, 'morning-responder'],
        primaryChannel,
        journey,
        estimatedCost: computeJourneyCost(journey, morning),
        group: groupKey,
        reason: `Users reachable on ${chName} with higher morning engagement. ${chName} primary; fallbacks: ${fallbacks.slice(0, 2).map(getChannelName).join(', ')}.`,
        timing: '9–11 AM IST',
        conversionPct: 6.0,
      });
    }
    if (evening > 0) {
      const journey = mkJourney();
      segments.push({
        id: `ss-${idx}-evening`,
        name: `${chName} — Evening Responders`,
        userCount: evening,
        percentage: Math.round((evening / segmentSize) * 100),
        tags: [`${primaryChannel}-first`, 'evening-responder'],
        primaryChannel,
        journey,
        estimatedCost: computeJourneyCost(journey, evening),
        group: groupKey,
        reason: `Users reachable on ${chName} with higher evening engagement. ${chName} primary; fallbacks: ${fallbacks.slice(0, 2).map(getChannelName).join(', ')}.`,
        timing: '5–9 PM IST',
        conversionPct: 5.5,
      });
    }
  });

  return segments;
}

