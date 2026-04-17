'use client';

import { useEffect, useState } from 'react';

import type { ChannelType } from '@/types';
import type { CampaignData } from './CampaignWizard';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { usePhaseData } from '@/hooks/usePhaseData';
import { channels, PLATFORM_REACHABILITY_RATES } from '@/data/channels';
import {
  ChannelContentEditor,
  makeInitialVariant,
} from './ChannelContentEditor';
import type { ContentVariant, TestingConfig, AnyChannelContent } from './ChannelContentEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChannelStepProps {
  campaignData: CampaignData;
  onUpdate: (updates: Partial<CampaignData>) => void;
}

// ─── Historical conversion rates (Day 30+) ───────────────────────────────────

const HISTORICAL_CONVERSION: Record<ChannelType, number> = {
  sms: 2.1,
  whatsapp: 6.8,
  rcs: 4.2,
  ai_voice: 8.5,
  field_executive: 22.3,
  push_notification: 3.5,
  in_app_banner: 5.2,
  facebook_ads: 1.8,
  instagram_ads: 2.4,
};

const CONVERSION_LABEL: Record<ChannelType, string> = {
  sms: 'avg conversion',
  whatsapp: 'avg conversion',
  rcs: 'avg conversion',
  ai_voice: 'avg conversion',
  field_executive: 'completion rate',
  push_notification: 'avg conversion',
  in_app_banner: 'avg conversion',
  facebook_ads: 'avg CTR',
  instagram_ads: 'avg CTR',
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

function getChannelCostLabel(channelId: ChannelType, unitCost: number): string {
  if (channelId === 'ai_voice') return `₹${unitCost.toFixed(2)}/call`;
  if (channelId === 'field_executive') return `₹${unitCost.toFixed(0)}/task`;
  if (channelId === 'push_notification') return `₹${unitCost.toFixed(2)}/notif`;
  if (channelId === 'in_app_banner') return `₹${unitCost.toFixed(2)}/banner`;
  if (channelId === 'facebook_ads' || channelId === 'instagram_ads') return `₹150/1K impr`;
  return `₹${unitCost.toFixed(2)}/msg`;
}

// ─── AI recommendation logic ──────────────────────────────────────────────────

type RecommendationStatus = 'recommended' | 'consider' | 'not_recommended';

interface ChannelRecommendation {
  status: RecommendationStatus;
  reason: string;
}

function getChannelRecommendation(
  channelId: ChannelType,
  segmentSize: number,
  reachCount: number,
  reachPercent: number,
  conversionRate: number | null,
  tentativeBudget: number,
): ChannelRecommendation {
  const channelCost = channels.find((c) => c.id === channelId)?.unitCost ?? 0;
  const totalChannelCost = channelCost * segmentSize;

  // Low reachability — strong negative signal
  if (reachPercent < 15) {
    return {
      status: 'not_recommended',
      reason: `Low reachability — only ${reachPercent.toFixed(0)}% of your segment can be reached via this channel`,
    };
  }

  // Budget check — single channel consuming >50% of tentative budget
  if (tentativeBudget > 0 && totalChannelCost > tentativeBudget * 0.5) {
    const pctOfBudget = Math.round((totalChannelCost / tentativeBudget) * 100);
    return {
      status: 'not_recommended',
      reason: `High cost — ${formatINR(totalChannelCost)} would consume ~${pctOfBudget}% of your ₹${(tentativeBudget / 100000).toFixed(1)}L budget`,
    };
  }

  // Field executive — always suggest using as last resort
  if (channelId === 'field_executive') {
    return {
      status: 'consider',
      reason: `Best deployed as the final step in your waterfall — highest completion rate (${HISTORICAL_CONVERSION.field_executive}%) but also highest cost per task`,
    };
  }

  // Strong conversion history
  if (conversionRate !== null && conversionRate > 5) {
    return {
      status: 'recommended',
      reason: `Strong conversion history — ${conversionRate.toFixed(1)}% avg ${CONVERSION_LABEL[channelId]} for this segment type`,
    };
  }

  // High reachability — good signal even without conversion data
  if (reachPercent > 60) {
    return {
      status: 'recommended',
      reason: `High reachability — ${reachPercent.toFixed(0)}% of your segment (${reachCount.toLocaleString('en-IN')} users) can be reached`,
    };
  }

  // Moderate reachability
  if (reachPercent >= 30) {
    return {
      status: 'consider',
      reason: `Moderate reachability — reaches ${reachPercent.toFixed(0)}% of your segment. Effective as part of a multi-channel sequence`,
    };
  }

  // Default
  return {
    status: 'consider',
    reason: `Reaches ${reachPercent.toFixed(0)}% of your segment (${reachCount.toLocaleString('en-IN')} users). Consider pairing with higher-reach channels`,
  };
}

function RecommendationBadge({ recommendation }: { recommendation: ChannelRecommendation }) {
  const { status, reason } = recommendation;

  const config = {
    recommended: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      label: 'Recommended',
    },
    consider: {
      dot: 'bg-amber-400',
      text: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      label: 'Consider',
    },
    not_recommended: {
      dot: 'bg-red-400',
      text: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
      label: 'Not recommended',
    },
  }[status];

  return (
    <span
      className={`group relative inline-flex cursor-default items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
      {config.label}
      {/* Tooltip */}
      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 hidden w-64 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-normal leading-relaxed text-text-secondary shadow-lg group-hover:block">
        {reason}
      </span>
    </span>
  );
}

// ─── ChannelRow ───────────────────────────────────────────────────────────────

interface ChannelRowProps {
  channelDef: (typeof channels)[number];
  isSelected: boolean;
  reachCount: number | null;
  reachPercent: number | null;
  conversionRate: number | null;
  conversionLabel: string;
  recommendation: ChannelRecommendation | null;
  isExpanded: boolean;
  onToggle: () => void;
  onExpandToggle: () => void;
  // Content config props
  audienceSize: number;
  variants: ContentVariant[];
  testing: TestingConfig;
  onVariantsChange: (v: ContentVariant[]) => void;
  onTestingChange: (t: TestingConfig) => void;
  onPrimaryContentChange: (c: AnyChannelContent) => void;
}

function ChannelRow({
  channelDef,
  isSelected,
  reachCount,
  reachPercent,
  conversionRate,
  conversionLabel,
  recommendation,
  isExpanded,
  onToggle,
  onExpandToggle,
  audienceSize,
  variants,
  testing,
  onVariantsChange,
  onTestingChange,
  onPrimaryContentChange,
}: ChannelRowProps) {
  const costLabel = getChannelCostLabel(channelDef.id, channelDef.unitCost);

  const borderColor = recommendation
    ? { recommended: '#10B981', consider: '#F59E0B', not_recommended: '#EF4444' }[recommendation.status]
    : '#E5E7EB';

  return (
    <div
      className={[
        'rounded-xl border-2 transition-all overflow-hidden',
        isSelected ? 'bg-white shadow-sm' : 'bg-[#FAFBFC]',
      ].join(' ')}
      style={{ borderColor: isSelected ? '#00BAF2' : borderColor, borderLeftWidth: '4px', borderLeftColor: isSelected ? '#00BAF2' : borderColor }}
    >
      {/* Card header — checkbox + name + AI badge */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label={isSelected ? `Deselect ${channelDef.name}` : `Select ${channelDef.name}`}
            className="shrink-0"
          >
            <span
              className={[
                'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
                isSelected ? 'border-cyan bg-cyan' : 'border-[#D1D5DB] bg-white hover:border-[#9CA3AF]',
              ].join(' ')}
            >
              {isSelected && (
                <svg viewBox="0 0 10 8" fill="none" className="h-3 w-3">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
          <ChannelIcon channel={channelDef.id} size={20} />
          <span className={['text-sm font-bold', isSelected ? 'text-text-primary' : 'text-text-secondary'].join(' ')}>
            {channelDef.name}
          </span>
          <span className="rounded bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-text-secondary">
            {channelDef.type === 'physical' ? 'Physical' : 'Digital'}
          </span>
        </div>

        {recommendation && <RecommendationBadge recommendation={recommendation} />}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 px-5 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-secondary">Cost:</span>
          <span className="text-sm font-semibold text-text-primary">{costLabel}</span>
        </div>

        {reachCount !== null && reachPercent !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary">Reachable:</span>
            <span className="text-sm font-semibold text-text-primary">{reachCount.toLocaleString('en-IN')}</span>
            <span className="text-xs text-text-secondary">({reachPercent.toFixed(0)}%)</span>
          </div>
        )}

        {conversionRate !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary">Conv:</span>
            <span className="text-sm font-semibold text-emerald-700">{conversionRate.toFixed(1)}%</span>
            <span className="text-xs text-text-secondary">{conversionLabel}</span>
          </div>
        )}
      </div>

      {/* AI recommendation reason — always visible */}
      {recommendation && (
        <div className={[
          'mx-5 mb-3 rounded-md px-3 py-2 text-xs leading-relaxed',
          recommendation.status === 'recommended' ? 'bg-emerald-50 text-emerald-700' :
          recommendation.status === 'consider' ? 'bg-amber-50 text-amber-700' :
          'bg-red-50 text-red-600',
        ].join(' ')}>
          <span className="font-semibold">AI: </span>
          {recommendation.reason}
        </div>
      )}

      {/* Configure Content button */}
      <div className="px-5 pb-4">
        <button
          type="button"
          onClick={onExpandToggle}
          className={[
            'w-full rounded-lg border py-2 text-xs font-medium transition-colors',
            isExpanded
              ? 'border-cyan bg-cyan/8 text-cyan'
              : isSelected
                ? 'border-[#E5E7EB] bg-white text-text-primary hover:border-cyan hover:text-cyan'
                : 'border-[#E5E7EB] bg-white text-text-secondary hover:border-[#D1D5DB]',
          ].join(' ')}
        >
          {isExpanded ? '▾ Hide Content Configuration' : '▸ Configure Content & Variants'}
        </button>
      </div>

      {/* Expanded content editor */}
      {isExpanded && (
        <div className="border-t border-[#E5E7EB] bg-white px-5 py-5">
          {!isSelected && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              This channel is not enabled yet. Select it above to include in your campaign.
            </div>
          )}
          <ChannelContentEditor
            channel={channelDef.id}
            audienceSize={audienceSize}
            variants={variants}
            testing={testing}
            onVariantsChange={onVariantsChange}
            onTestingChange={onTestingChange}
            onPrimaryContentChange={onPrimaryContentChange}
          />
        </div>
      )}
    </div>
  );
}

// ─── ChannelStep (main export) ────────────────────────────────────────────────

export function ChannelStep({ campaignData, onUpdate }: ChannelStepProps) {
  const { segments, isAtLeast } = usePhaseData();

  const selectedSegment = segments.find((s) => s.id === campaignData.segmentId);
  const segmentSize = selectedSegment?.size ?? 0;
  const tentativeBudget = parseFloat(campaignData.goal.tentativeBudget) || 0;

  // Expanded channel (content editor open)
  const [expandedChannel, setExpandedChannel] = useState<ChannelType | null>(null);

  // Per-channel variant state
  const [channelVariants, setChannelVariants] = useState<Record<string, ContentVariant[]>>(() => {
    const initial: Record<string, ContentVariant[]> = {};
    for (const ch of channels) {
      initial[ch.id] = [makeInitialVariant(ch.id)];
    }
    return initial;
  });

  // Per-channel testing state
  const [channelTesting, setChannelTesting] = useState<Record<string, TestingConfig>>(() => {
    const initial: Record<string, TestingConfig> = {};
    for (const ch of channels) {
      initial[ch.id] = { enabled: false, randomnessFactor: 30 };
    }
    return initial;
  });

  // Auto-select recommended channels on mount when none are selected yet
  useEffect(() => {
    if (campaignData.channels.length > 0 || !selectedSegment) return;

    const threshold = segmentSize * 0.2;

    const recommended = channels
      .map((ch) => {
        const segReach = selectedSegment.reachability?.[ch.id as keyof typeof selectedSegment.reachability];
        const reachCount =
          segReach !== undefined
            ? segReach
            : Math.round(segmentSize * PLATFORM_REACHABILITY_RATES[ch.id]);
        return { id: ch.id, reachCount };
      })
      .filter((ch) => ch.reachCount > threshold)
      .sort((a, b) => b.reachCount - a.reachCount)
      .map((ch) => ch.id as ChannelType);

    if (recommended.length > 0) {
      onUpdate({ channels: recommended });
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleChannel(channelId: ChannelType) {
    const isSelected = campaignData.channels.includes(channelId);
    const updated = isSelected
      ? campaignData.channels.filter((c) => c !== channelId)
      : [...campaignData.channels, channelId];
    onUpdate({ channels: updated });
  }

  function handleExpandToggle(channelId: ChannelType) {
    setExpandedChannel((prev) => (prev === channelId ? null : channelId));
  }

  function getVariants(channelId: ChannelType): ContentVariant[] {
    return channelVariants[channelId] ?? [makeInitialVariant(channelId)];
  }

  function getTesting(channelId: ChannelType): TestingConfig {
    return channelTesting[channelId] ?? { enabled: false, randomnessFactor: 30 };
  }

  function handleVariantsChange(channelId: ChannelType, variants: ContentVariant[]) {
    setChannelVariants((prev) => ({ ...prev, [channelId]: variants }));
  }

  function handleTestingChange(channelId: ChannelType, testing: TestingConfig) {
    setChannelTesting((prev) => ({ ...prev, [channelId]: testing }));
  }

  function handlePrimaryContentChange(channelId: ChannelType, content: AnyChannelContent) {
    onUpdate({
      content: {
        ...campaignData.content,
        [channelId]: content,
      },
    });
  }

  // Compute reachability values for a channel
  function getReachData(channelId: ChannelType): { count: number | null; percent: number | null } {
    if (!isAtLeast('day1')) return { count: null, percent: null };
    const segReach = selectedSegment?.reachability?.[channelId as keyof typeof selectedSegment.reachability];
    const count =
      segReach !== undefined
        ? segReach
        : Math.round(segmentSize * PLATFORM_REACHABILITY_RATES[channelId]);
    const percent = segmentSize > 0 ? (count / segmentSize) * 100 : PLATFORM_REACHABILITY_RATES[channelId] * 100;
    return { count, percent };
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-text-primary">Channels</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Enable the channels you want to use, then configure content for each one. AI recommendations are shown inline.
        </p>
      </div>

      {/* Channel selection summary */}
      {campaignData.channels.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{campaignData.channels.length}</span>
          {campaignData.channels.length === 1 ? 'channel' : 'channels'} selected
          <span className="text-text-secondary">·</span>
          <div className="flex items-center gap-1">
            {campaignData.channels.map((chId) => (
              <ChannelIcon key={chId} channel={chId} size={14} />
            ))}
          </div>
        </div>
      )}

      {/* Channel cards — selected channels float to top */}
      <div className="flex flex-col gap-3">
        {[...channels]
          .sort((a, b) => {
            const aSelected = campaignData.channels.includes(a.id) ? 0 : 1;
            const bSelected = campaignData.channels.includes(b.id) ? 0 : 1;
            return aSelected - bSelected;
          })
          .map((ch) => {
            const isSelected = campaignData.channels.includes(ch.id);
            const { count: reachCount, percent: reachPercent } = getReachData(ch.id);

            const conversionRate = isAtLeast('day30') ? HISTORICAL_CONVERSION[ch.id] : null;
            const convLabel = CONVERSION_LABEL[ch.id];

            const recommendation =
              reachCount !== null && reachPercent !== null
                ? getChannelRecommendation(
                    ch.id,
                    segmentSize,
                    reachCount,
                    reachPercent,
                    conversionRate,
                    tentativeBudget,
                  )
                : null;

            return (
              <ChannelRow
                key={ch.id}
                channelDef={ch}
                isSelected={isSelected}
                reachCount={reachCount}
                reachPercent={reachPercent}
                conversionRate={conversionRate}
                conversionLabel={convLabel}
                recommendation={recommendation}
                isExpanded={expandedChannel === ch.id}
                onToggle={() => toggleChannel(ch.id)}
                onExpandToggle={() => handleExpandToggle(ch.id)}
                audienceSize={segmentSize || 45000}
                variants={getVariants(ch.id)}
                testing={getTesting(ch.id)}
                onVariantsChange={(v) => handleVariantsChange(ch.id, v)}
                onTestingChange={(t) => handleTestingChange(ch.id, t)}
                onPrimaryContentChange={(c) => handlePrimaryContentChange(ch.id, c)}
              />
            );
          })}
      </div>

    </div>
  );
}
