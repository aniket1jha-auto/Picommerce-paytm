'use client';

import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePhaseData } from '@/hooks/usePhaseData';
import { useInsights } from '@/hooks/useInsights';
import type { Campaign, ChannelMetric, Insight } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPIBar } from '@/components/analytics/KPIBar';
import { CostRevenueChart } from '@/components/analytics/CostRevenueChart';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineInsight } from '@/components/ai/InlineInsight';
import { formatINR, formatCount, formatPercent, formatROI } from '@/utils/format';
import { Link } from 'react-router-dom';

type SortKey = 'roi' | 'revenue' | 'conversionRate';

function CampaignComparisonRow({
  campaign,
  rank,
}: {
  campaign: Campaign;
  rank: number;
}) {
  const hasMetrics = campaign.metrics.sent > 0;
  const isCollected = campaign.revenueLabel.toLowerCase() === 'collected';
  const roiColor =
    campaign.metrics.roi >= 4
      ? 'text-[#27AE60] font-semibold'
      : campaign.metrics.roi >= 2
        ? 'text-[#F2994A] font-semibold'
        : 'text-[#EB5757] font-semibold';

  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-secondary">
            #{rank}
          </span>
          <Link
            to={`/campaigns/${campaign.id}`}
            className="text-sm font-medium text-text-primary hover:text-cyan hover:underline"
          >
            {campaign.name}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={campaign.status} />
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {campaign.audience.segmentName}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-sm text-text-primary">
        {hasMetrics ? formatINR(campaign.metrics.cost) : '—'}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-sm text-text-primary">
        {hasMetrics ? (
          <span className="text-[#27AE60] font-medium">
            {formatINR(campaign.metrics.revenue)}
          </span>
        ) : (
          '—'
        )}
      </td>
      <td
        className={`px-4 py-3 text-right tabular-nums text-sm ${
          hasMetrics ? roiColor : 'text-text-primary'
        }`}
      >
        {hasMetrics ? formatROI(campaign.metrics.roi) : '—'}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-sm text-text-primary">
        {hasMetrics
          ? formatPercent(campaign.metrics.conversionRate)
          : '—'}
      </td>
      <td className="px-4 py-3 text-right text-xs text-text-secondary">
        {isCollected ? 'Collected' : 'Revenue'}
      </td>
    </tr>
  );
}

export function Analytics() {
  const { campaigns, analytics, isDay0, isDay1 } = usePhaseData();
  const allInsights = useInsights('analytics');
  const [sortKey, setSortKey] = useState<SortKey>('roi');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  function handleDismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  if (isDay0 || isDay1) {
    return (
      <>
        <PageHeader title="Analytics" />
        <div className="mt-8 rounded-lg bg-white ring-1 ring-[#E5E7EB]">
          <EmptyState
            icon={BarChart2}
            title="Analytics will populate after your first campaign completes"
            description="Once you run campaigns, you'll see cross-campaign analytics, ROI trends, and channel benchmarks here."
            ctaLabel="Create Campaign"
            ctaHref="/campaigns/new"
          />
        </div>
      </>
    );
  }

  // Sort campaigns for comparison table
  const sortedCampaigns = [...campaigns]
    .filter((c) => c.metrics.sent > 0)
    .sort((a, b) => {
      if (sortKey === 'roi') return b.metrics.roi - a.metrics.roi;
      if (sortKey === 'revenue') return b.metrics.revenue - a.metrics.revenue;
      return b.metrics.conversionRate - a.metrics.conversionRate;
    });

  const channelBreakdown: ChannelMetric[] = analytics?.channelBreakdown ?? [];

  const CHANNEL_NAMES: Record<string, string> = {
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    rcs: 'RCS',
    ai_voice: 'AI Voice',
    field_executive: 'Field Executive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Analytics"
        subtitle="Cross-campaign performance overview"
      />

      {/* KPI bar */}
      <KPIBar />

      {/* Cost vs Revenue trend */}
      <CostRevenueChart />

      {/* Channel Performance Benchmarks */}
      {channelBreakdown.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-primary">
            Channel Performance Benchmarks
          </h2>
          <div className="overflow-x-auto rounded-lg ring-1 ring-[#E5E7EB]">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Channel
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Total Sent
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Avg Delivery Rate
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Avg Conv. Rate
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Total Spend
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Avg ROI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#F3F4F6]">
                {channelBreakdown.map((ch) => (
                  <tr key={ch.channel} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <ChannelIcon channel={ch.channel} size={14} />
                        <span className="font-medium text-text-primary">
                          {CHANNEL_NAMES[ch.channel] ?? ch.channel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                      {formatCount(ch.sent)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                      {formatPercent(ch.deliveryRate)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                      {formatPercent(ch.conversionRate)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                      {formatINR(ch.cost)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-text-primary">
                      {formatROI(ch.roi)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Campaign Comparison */}
      {sortedCampaigns.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Campaign Comparison
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Sort by:</span>
              {(['roi', 'revenue', 'conversionRate'] as SortKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSortKey(k)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    sortKey === k
                      ? 'bg-navy text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {k === 'roi' ? 'ROI' : k === 'revenue' ? 'Revenue' : 'Conv. Rate'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg ring-1 ring-[#E5E7EB]">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Campaign
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Audience
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Spend
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Revenue
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    ROI
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Conv. Rate
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedCampaigns.map((campaign, i) => (
                  <CampaignComparisonRow
                    key={campaign.id}
                    campaign={campaign}
                    rank={i + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* AI Insights */}
      {allInsights.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text-primary">
            AI Insights
          </h2>
          <div className="flex flex-col gap-2">
            {allInsights
              .filter((ins: Insight) => !dismissed.has(ins.id))
              .map((ins: Insight) => (
                <InlineInsight
                  key={ins.id}
                  insight={ins}
                  onDismiss={
                    ins.dismissable ? () => handleDismiss(ins.id) : undefined
                  }
                />
              ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
