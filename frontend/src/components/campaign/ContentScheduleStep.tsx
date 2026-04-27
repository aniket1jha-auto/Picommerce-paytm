'use client';

import { useEffect, useMemo, useState } from 'react';

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

interface ContentScheduleStepProps {
  campaignData: CampaignData;
  onUpdate: (updates: Partial<CampaignData>) => void;
}

// ─── Historical conversion rates (Day 30+) ───────────────────────────────────

const HISTORICAL_CONVERSION: Partial<Record<ChannelType, number>> = {
  sms: 2.1,
  whatsapp: 6.8,
  rcs: 4.2,
  ai_voice: 8.5,
};

const CONVERSION_LABEL: Partial<Record<ChannelType, string>> = {
  sms: 'avg conversion',
  whatsapp: 'avg conversion',
  rcs: 'avg conversion',
  ai_voice: 'avg conversion',
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

function getChannelCostLabel(channelId: ChannelType, unitCost: number): string {
  if (channelId === 'ai_voice') return `₹${unitCost.toFixed(2)}/call`;
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

  // Strong conversion history
  if (conversionRate !== null && conversionRate > 5) {
    return {
      status: 'recommended',
      reason: `Strong conversion history — ${conversionRate.toFixed(1)}% avg ${CONVERSION_LABEL[channelId] ?? 'avg conversion'} for this segment type`,
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

function channelKindTag(channelDef: (typeof channels)[number]): string {
  if (channelDef.id === 'ai_voice') return 'Voice';
  return channelDef.type === 'physical' ? 'Physical' : 'Digital';
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
  const [insightOpen, setInsightOpen] = useState(false);
  const costLabel = getChannelCostLabel(channelDef.id, channelDef.unitCost);

  const borderColor = recommendation
    ? { recommended: '#10B981', consider: '#F59E0B', not_recommended: '#EF4444' }[recommendation.status]
    : '#E5E7EB';

  const insightTextClass = recommendation
    ? {
        recommended: 'text-emerald-700',
        consider: 'text-amber-800',
        not_recommended: 'text-red-600',
      }[recommendation.status]
    : 'text-text-secondary';

  const statsLine = (
    <p className="text-[11px] leading-snug text-text-secondary">
      <span className="font-medium text-text-primary/90">{costLabel}</span>
      <span className="mx-1.5 text-[#D1D5DB]">·</span>
      {reachCount !== null && reachPercent !== null ? (
        <>
          <span>{reachCount.toLocaleString('en-IN')} reachable</span>
          <span className="mx-1.5 text-[#D1D5DB]">·</span>
          <span>{reachPercent.toFixed(0)}% reach</span>
        </>
      ) : (
        <>
          <span>Reach —</span>
        </>
      )}
      {conversionRate !== null && (
        <>
          <span className="mx-1.5 text-[#D1D5DB]">·</span>
          <span className="font-medium text-emerald-700">{conversionRate.toFixed(1)}% conv</span>
          <span> {conversionLabel}</span>
        </>
      )}
    </p>
  );

  return (
    <div
      className={[
        'rounded-xl border-2 transition-all overflow-hidden',
        isSelected ? 'bg-white shadow-sm' : 'bg-[#FAFBFC]',
      ].join(' ')}
      style={{
        borderColor: isSelected ? '#00BAF2' : borderColor,
        borderLeftWidth: '4px',
        borderLeftColor: isSelected ? '#00BAF2' : borderColor,
      }}
    >
      <div className="p-4">
        {/* Row 1 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
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
            <span className="shrink-0">
              <ChannelIcon channel={channelDef.id} size={20} />
            </span>
            <span className={['truncate text-sm font-bold', isSelected ? 'text-text-primary' : 'text-text-secondary'].join(' ')}>
              {channelDef.name}
            </span>
            <span className="shrink-0 rounded bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-text-secondary">
              {channelKindTag(channelDef)}
            </span>
          </div>
          {recommendation && <RecommendationBadge recommendation={recommendation} />}
        </div>

        {/* Row 2 */}
        <div className="mt-1.5">{statsLine}</div>

        {/* Row 3 */}
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {recommendation ? (
              <button
                type="button"
                onClick={() => setInsightOpen((v) => !v)}
                className="w-full text-left"
              >
                <span className={`text-[11px] leading-snug ${insightTextClass}`}>
                  <span className="font-semibold">AI: </span>
                  <span className={insightOpen ? '' : 'line-clamp-1'}>{recommendation.reason}</span>
                  <span className="ml-1 inline text-text-secondary">{insightOpen ? ' ▴' : ' ▾'}</span>
                </span>
              </button>
            ) : (
              <span className="text-[11px] text-text-secondary">&nbsp;</span>
            )}
          </div>
          <button
            type="button"
            onClick={onExpandToggle}
            className={[
              'shrink-0 whitespace-nowrap text-xs font-semibold transition-colors',
              isExpanded ? 'text-cyan' : 'text-cyan hover:underline',
            ].join(' ')}
          >
            {isExpanded ? 'Hide ↑' : 'Configure →'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-4">
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
            mode="template_only"
          />
        </div>
      )}
    </div>
  );
}

interface ScheduleCostPanelProps {
  campaignData: CampaignData;
  onUpdate: (updates: Partial<CampaignData>) => void;
  audienceSize: number;
}

function ScheduleCostPanel({ campaignData, onUpdate, audienceSize }: ScheduleCostPanelProps) {
  const estTotal = useMemo(() => {
    if (!audienceSize || audienceSize <= 0) return null;
    let sum = 0;
    for (const id of campaignData.channels) {
      const c = channels.find((x) => x.id === id);
      if (c) sum += c.unitCost * audienceSize;
    }
    return sum;
  }, [audienceSize, campaignData.channels]);

  const costBarPercent = useMemo(() => {
    if (!audienceSize || audienceSize <= 0 || !estTotal || estTotal <= 0) return 0;
    const allowed: ChannelType[] = ['sms', 'whatsapp', 'rcs', 'ai_voice'];
    const maxIfAll = allowed.reduce((s, id) => s + (channels.find((c) => c.id === id)?.unitCost ?? 0) * audienceSize, 0);
    if (maxIfAll <= 0) return 0;
    return Math.min(100, (estTotal / maxIfAll) * 100);
  }, [audienceSize, estTotal]);

  const costLine =
    campaignData.channels.length === 0
      ? 'Select channels to see estimate'
      : audienceSize <= 0
        ? 'Set your audience to see estimate'
        : estTotal !== null
          ? `₹${estTotal.toFixed(2)}`
          : '—';

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm ring-1 ring-black/[0.03]">
      <h3 className="text-sm font-semibold text-text-primary">Campaign schedule</h3>
      <p className="mt-0.5 text-xs text-text-secondary">When should this campaign run?</p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onUpdate({ schedule: { ...campaignData.schedule, type: 'one-time' } })}
          className={[
            'flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-all',
            campaignData.schedule.type === 'one-time'
              ? 'border-cyan bg-cyan/5'
              : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]',
          ].join(' ')}
        >
          <span
            className={[
              'text-sm font-semibold',
              campaignData.schedule.type === 'one-time' ? 'text-cyan' : 'text-text-primary',
            ].join(' ')}
          >
            One-time
          </span>
          <p className="mt-0.5 text-[11px] text-text-secondary">Run once at a specific date and time</p>
        </button>

        <button
          type="button"
          onClick={() => onUpdate({ schedule: { ...campaignData.schedule, type: 'recurring' } })}
          className={[
            'flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-all',
            campaignData.schedule.type === 'recurring'
              ? 'border-cyan bg-cyan/5'
              : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]',
          ].join(' ')}
        >
          <span
            className={[
              'text-sm font-semibold',
              campaignData.schedule.type === 'recurring' ? 'text-cyan' : 'text-text-primary',
            ].join(' ')}
          >
            Recurring
          </span>
          <p className="mt-0.5 text-[11px] text-text-secondary">Run on a regular schedule</p>
        </button>
      </div>

      {campaignData.schedule.type === 'one-time' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex min-w-[140px] flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Date</label>
            <input
              type="date"
              value={campaignData.schedule.date}
              onChange={(e) => onUpdate({ schedule: { ...campaignData.schedule, date: e.target.value } })}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            />
          </div>
          <div className="flex min-w-[120px] flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Time</label>
            <input
              type="time"
              value={campaignData.schedule.time}
              onChange={(e) => onUpdate({ schedule: { ...campaignData.schedule, time: e.target.value } })}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            />
          </div>
        </div>
      )}

      {campaignData.schedule.type === 'recurring' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Frequency</label>
            <select
              value={campaignData.schedule.recurringFrequency}
              onChange={(e) =>
                onUpdate({
                  schedule: {
                    ...campaignData.schedule,
                    recurringFrequency: e.target.value as CampaignData['schedule']['recurringFrequency'],
                  },
                })
              }
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every 2 weeks</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {campaignData.schedule.recurringFrequency !== 'daily' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">
                {campaignData.schedule.recurringFrequency === 'monthly' ? 'Day of month' : 'Day of week'}
              </label>
              <select
                value={campaignData.schedule.recurringDay}
                onChange={(e) => onUpdate({ schedule: { ...campaignData.schedule, recurringDay: e.target.value } })}
                className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
              >
                {campaignData.schedule.recurringFrequency === 'monthly' ? (
                  <>
                    <option value="1">1st</option>
                    <option value="5">5th</option>
                    <option value="10">10th</option>
                    <option value="15">15th</option>
                    <option value="20">20th</option>
                    <option value="25">25th</option>
                    <option value="last">Last day</option>
                  </>
                ) : (
                  <>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </>
                )}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Time</label>
            <input
              type="time"
              value={campaignData.schedule.recurringTime}
              onChange={(e) => onUpdate({ schedule: { ...campaignData.schedule, recurringTime: e.target.value } })}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            />
          </div>
        </div>
      )}

      <div className="my-4 border-t border-[#E5E7EB]" />

      <h3 className="text-sm font-semibold text-text-primary">Estimated cost</h3>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-cyan transition-all duration-300"
          style={{ width: `${costBarPercent}%` }}
        />
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-text-secondary">Channels selected</dt>
          <dd className="font-medium text-text-primary">{campaignData.channels.length}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-text-secondary">Audience size</dt>
          <dd className="font-medium text-text-primary">
            {audienceSize > 0 ? `${audienceSize.toLocaleString('en-IN')} users` : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-text-secondary">Est. total cost</dt>
          <dd className="font-semibold text-text-primary">{costLine}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[10px] leading-relaxed text-text-secondary">
        Cost is estimated based on per-message rates × audience size per channel.
      </p>
    </div>
  );
}

// ─── ContentScheduleStep (simple send: channels + content + schedule) ───────

export function ContentScheduleStep({ campaignData, onUpdate }: ContentScheduleStepProps) {
  const { segments, isAtLeast } = usePhaseData();

  const selectedSegment = segments.find((s) => s.id === campaignData.segmentId);
  const segmentSize = selectedSegment?.size ?? 0;
  const tentativeBudget = parseFloat(campaignData.goal.tentativeBudget) || 0;

  const allowedChannels = useMemo(
    () => new Set<ChannelType>(['sms', 'whatsapp', 'rcs', 'ai_voice']),
    [],
  );
  const contentChannels = useMemo(
    () => channels.filter((c) => allowedChannels.has(c.id)),
    [allowedChannels],
  );

  // Expanded channel (content editor open)
  const [expandedChannel, setExpandedChannel] = useState<ChannelType | null>(null);

  // Per-channel variant state
  const [channelVariants, setChannelVariants] = useState<Record<string, ContentVariant[]>>(() => {
    const initial: Record<string, ContentVariant[]> = {};
    for (const ch of contentChannels) {
      initial[ch.id] = [makeInitialVariant(ch.id)];
    }
    return initial;
  });

  // Per-channel testing state
  const [channelTesting, setChannelTesting] = useState<Record<string, TestingConfig>>(() => {
    const initial: Record<string, TestingConfig> = {};
    for (const ch of contentChannels) {
      initial[ch.id] = { enabled: false, randomnessFactor: 30 };
    }
    return initial;
  });

  // If older state contains disallowed channels, strip them here.
  useEffect(() => {
    const filtered = campaignData.channels.filter((c) => allowedChannels.has(c));
    if (filtered.length !== campaignData.channels.length) onUpdate({ channels: filtered });
  }, [allowedChannels, campaignData.channels, onUpdate]);

  // Auto-select recommended channels on mount when none are selected yet
  useEffect(() => {
    if (campaignData.channels.length > 0 || !selectedSegment) return;

    const threshold = segmentSize * 0.2;

    const recommended = contentChannels
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
        <h2 className="text-base font-semibold text-text-primary">Content & Schedule</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Enable channels, configure message variants for each, then set when this campaign runs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,65%)_minmax(0,35%)] lg:items-start">
        <div className="min-w-0 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Channels</p>

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

          <div className="flex flex-col gap-3">
            {[...contentChannels]
              .sort((a, b) => {
                const aSelected = campaignData.channels.includes(a.id) ? 0 : 1;
                const bSelected = campaignData.channels.includes(b.id) ? 0 : 1;
                return aSelected - bSelected;
              })
              .map((ch) => {
                const isSelected = campaignData.channels.includes(ch.id);
                const { count: reachCount, percent: reachPercent } = getReachData(ch.id);

                const conversionRate = isAtLeast('day30') ? (HISTORICAL_CONVERSION[ch.id] ?? null) : null;
                const convLabel = CONVERSION_LABEL[ch.id] ?? 'avg conversion';

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
                    audienceSize={segmentSize > 0 ? segmentSize : 45000}
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

        <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <ScheduleCostPanel campaignData={campaignData} onUpdate={onUpdate} audienceSize={segmentSize} />
        </div>
      </div>
    </div>
  );
}
