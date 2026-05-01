'use client';

import { BarChart2, Sparkles, TrendingUp, AlertTriangle, Trophy, Users, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { usePhaseData } from '@/hooks/usePhaseData';
import type { ChannelMetric, ChannelType } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCount, formatINR, formatPercent, formatROI } from '@/utils/format';

// Channel Analytics has its own widened key so we can include Email without
// dragging it through every Record<ChannelType, ...> in the codebase.
type AnalyticsChannelKey = ChannelType | 'email';

interface AnalyticsChannelMetric extends Omit<ChannelMetric, 'channel'> {
  channel: AnalyticsChannelKey;
}

const CHANNEL_NAMES: Record<AnalyticsChannelKey, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  rcs: 'RCS',
  ai_voice: 'AI Voice',
  email: 'Email',
  field_executive: 'Field Exec',
  push_notification: 'Push',
  in_app_banner: 'In-App',
  facebook_ads: 'FB Ads',
  instagram_ads: 'IG Ads',
};

const CHANNEL_COLORS: Record<AnalyticsChannelKey, string> = {
  sms: '#6366F1',
  whatsapp: '#25D366',
  rcs: '#00BAF2',
  ai_voice: '#F59E0B',
  email: '#0F766E',
  field_executive: '#8B5CF6',
  push_notification: '#EF4444',
  in_app_banner: '#0EA5E9',
  facebook_ads: '#1877F2',
  instagram_ads: '#E4405F',
};

// Synthesized email row to slot in place of field_executive on this page only.
const EMAIL_METRIC: AnalyticsChannelMetric = {
  channel: 'email',
  sent: 184500,
  delivered: 178500,
  opened: 76300,
  converted: 5320,
  cost: 92250,
  revenue: 1064000,
  deliveryRate: 96.7,
  conversionRate: 2.9,
  roi: 11.5,
};

function buildDisplayChannels(breakdown: ChannelMetric[]): AnalyticsChannelMetric[] {
  return [
    ...breakdown.filter((c) => c.channel !== 'field_executive'),
    EMAIL_METRIC,
  ];
}

export function Analytics() {
  const { analytics, isDay0, isDay1 } = usePhaseData();

  if (isDay0 || isDay1) {
    return (
      <>
        <PageHeader title="Channel Analytics" />
        <div className="mt-8 rounded-lg bg-white ring-1 ring-[#E5E7EB]">
          <EmptyState
            icon={BarChart2}
            title="Channel analytics will populate after your first campaign completes"
            description="Once campaigns run, you'll see per-channel reach, conversion, cost, and ROI here."
            ctaLabel="Create Campaign"
            ctaHref="/campaigns/new"
          />
        </div>
      </>
    );
  }

  const channels = buildDisplayChannels(analytics.channelBreakdown);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Channel Analytics"
        subtitle="How each channel is performing across reach, conversion, and ROI"
      />

      <ChannelKPIGrid channels={channels} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelChart
          title="Conversion rate by channel"
          subtitle="Higher is better"
          channels={channels}
          metric="conversionRate"
          formatter={(v) => `${v.toFixed(1)}%`}
        />
        <ChannelChart
          title="ROI by channel"
          subtitle="Revenue ÷ cost"
          channels={channels}
          metric="roi"
          formatter={(v) => `${v.toFixed(1)}x`}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text-primary">Detailed breakdown</h2>
        <ChannelComparisonTable rows={channels} />
      </section>

      <AISummarySection channels={channels} />
    </motion.div>
  );
}

/* ─── Glyph helper that renders Mail for Email, ChannelIcon otherwise ──── */

function ChannelGlyph({ channel, size = 14 }: { channel: AnalyticsChannelKey; size?: number }) {
  if (channel === 'email') {
    return (
      <div
        className="inline-flex items-center justify-center rounded-md"
        style={{ width: size + 12, height: size + 12, backgroundColor: '#0F766E1A' }}
      >
        <Mail size={size} style={{ color: '#0F766E' }} />
      </div>
    );
  }
  return <ChannelIcon channel={channel} size={size} />;
}

/* ─── Per-channel KPI grid ──────────────────────────────────────────────── */

function ChannelKPIGrid({ channels }: { channels: AnalyticsChannelMetric[] }) {
  if (channels.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {channels.map((ch) => (
        <ChannelKPICard key={ch.channel} metric={ch} />
      ))}
    </div>
  );
}

function ChannelKPICard({ metric }: { metric: AnalyticsChannelMetric }) {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
      <div className="flex items-center gap-2">
        <ChannelGlyph channel={metric.channel} size={14} />
        <span className="text-sm font-semibold text-text-primary">
          {CHANNEL_NAMES[metric.channel]}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
            Conv. rate
          </div>
          <div className="text-2xl font-bold text-text-primary tabular-nums">
            {formatPercent(metric.conversionRate)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-text-tertiary">ROI</div>
          <div className="text-sm font-semibold text-text-primary tabular-nums">
            {formatROI(metric.roi)}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 border-t border-[#F3F4F6] pt-3 text-[11px]">
        <div>
          <div className="text-text-tertiary">Sent</div>
          <div className="font-medium text-text-primary tabular-nums">
            {formatCount(metric.sent)}
          </div>
        </div>
        <div>
          <div className="text-text-tertiary">Converted</div>
          <div className="font-medium text-text-primary tabular-nums">
            {formatCount(metric.converted)}
          </div>
        </div>
        <div>
          <div className="text-text-tertiary">Cost</div>
          <div className="font-medium text-text-primary tabular-nums">
            {formatINR(metric.cost)}
          </div>
        </div>
        <div>
          <div className="text-text-tertiary">Revenue</div>
          <div className="font-medium text-text-primary tabular-nums">
            {formatINR(metric.revenue)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Bar chart by channel ──────────────────────────────────────────────── */

interface ChannelChartProps {
  title: string;
  subtitle: string;
  channels: AnalyticsChannelMetric[];
  metric: keyof Pick<AnalyticsChannelMetric, 'conversionRate' | 'roi' | 'deliveryRate'>;
  formatter: (v: number) => string;
}

function ChannelChart({ title, subtitle, channels, metric, formatter }: ChannelChartProps) {
  const data = channels.map((c) => ({
    name: CHANNEL_NAMES[c.channel],
    channel: c.channel,
    value: c[metric],
  }));

  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary">{subtitle}</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatter(v)}
              width={45}
            />
            <Tooltip
              cursor={{ fill: '#F3F4F6' }}
              formatter={(v) => formatter(Number(v ?? 0))}
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #E5E7EB',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.channel} fill={CHANNEL_COLORS[d.channel]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Detailed breakdown table (handles email key) ──────────────────────── */

function ChannelComparisonTable({ rows }: { rows: AnalyticsChannelMetric[] }) {
  if (rows.length === 0) return null;
  const bestConvRate = Math.max(...rows.map((r) => r.conversionRate));

  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-[#E5E7EB]">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Channel
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Sent
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Delivered
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Opened
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Converted
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Cost
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Conv. Rate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#F3F4F6]">
          {rows.map((m) => {
            const isBest = m.conversionRate === bestConvRate && bestConvRate > 0;
            return (
              <tr key={m.channel} className={isBest ? 'bg-[#F0FDF4]' : 'hover:bg-[#FAFAFA]'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <ChannelGlyph channel={m.channel} size={14} />
                    <span className="font-medium text-text-primary">
                      {CHANNEL_NAMES[m.channel]}
                    </span>
                    {isBest && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                        Best
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCount(m.sent)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCount(m.delivered)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCount(m.opened)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCount(m.converted)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatINR(m.cost)}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {formatPercent(m.conversionRate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── AI Summary ────────────────────────────────────────────────────────── */

interface SummaryInsight {
  id: string;
  tone: 'positive' | 'neutral' | 'attention' | 'highlight';
  icon: typeof Sparkles;
  title: string;
  body: string;
}

function buildSummaryInsights(channels: AnalyticsChannelMetric[]): SummaryInsight[] {
  if (channels.length === 0) return [];

  const byConv = [...channels].sort((a, b) => b.conversionRate - a.conversionRate);
  const byROI = [...channels].sort((a, b) => b.roi - a.roi);
  const byReach = [...channels].sort((a, b) => b.sent - a.sent);

  const bestConv = byConv[0];
  const worstConv = byConv[byConv.length - 1];
  const bestROI = byROI[0];
  const widestReach = byReach[0];
  const totalSent = channels.reduce((sum, c) => sum + c.sent, 0);
  const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);

  const conversionLift = bestConv.conversionRate / Math.max(worstConv.conversionRate, 0.1);

  const insights: SummaryInsight[] = [
    {
      id: 'best-conv',
      tone: 'positive',
      icon: Trophy,
      title: `${CHANNEL_NAMES[bestConv.channel]} leads on conversion`,
      body: `Highest conversion rate at ${formatPercent(bestConv.conversionRate)} — ${conversionLift.toFixed(1)}× the lowest channel (${CHANNEL_NAMES[worstConv.channel]} at ${formatPercent(worstConv.conversionRate)}). Worth doubling down where ${CHANNEL_NAMES[bestConv.channel]} is reachable.`,
    },
    {
      id: 'best-roi',
      tone: 'highlight',
      icon: TrendingUp,
      title: `${CHANNEL_NAMES[bestROI.channel]} returns the most per rupee`,
      body: `Top ROI at ${formatROI(bestROI.roi)} on ${formatINR(bestROI.cost)} of spend, generating ${formatINR(bestROI.revenue)} in revenue. Strong candidate for incremental budget.`,
    },
    {
      id: 'widest-reach',
      tone: 'neutral',
      icon: Users,
      title: `${CHANNEL_NAMES[widestReach.channel]} is reaching the most users`,
      body: `${formatCount(widestReach.sent)} sends so far this period — about ${Math.round((widestReach.sent / totalSent) * 100)}% of total reach across all channels.`,
    },
    {
      id: 'attention',
      tone: 'attention',
      icon: AlertTriangle,
      title: `${CHANNEL_NAMES[worstConv.channel]} engagement is trailing`,
      body: `${formatPercent(worstConv.conversionRate)} conversion is the lowest of the active mix. Consider A/B testing copy, send-time, or whether ${CHANNEL_NAMES[worstConv.channel]} is the right primary channel for this audience.`,
    },
    {
      id: 'totals',
      tone: 'neutral',
      icon: Sparkles,
      title: 'Overall channel performance',
      body: `${formatCount(totalSent)} messages sent across ${channels.length} channels generated ${formatINR(totalRevenue)} in revenue. The Detailed Breakdown above ranks every channel side-by-side.`,
    },
  ];

  return insights;
}

const TONE_STYLES: Record<SummaryInsight['tone'], { bg: string; ring: string; iconBg: string; iconColor: string }> = {
  positive: { bg: 'bg-green-50', ring: 'ring-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-700' },
  highlight: { bg: 'bg-amber-50', ring: 'ring-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
  attention: { bg: 'bg-rose-50', ring: 'ring-rose-200', iconBg: 'bg-rose-100', iconColor: 'text-rose-700' },
  neutral: { bg: 'bg-white', ring: 'ring-[#E5E7EB]', iconBg: 'bg-cyan/10', iconColor: 'text-cyan' },
};

function AISummarySection({ channels }: { channels: AnalyticsChannelMetric[] }) {
  const insights = buildSummaryInsights(channels);
  if (insights.length === 0) return null;

  return (
    <section className="rounded-lg ring-1 ring-[#E5E7EB] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-cyan/10 via-purple-50 to-pink-50 border-b border-[#E5E7EB]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-cyan/20">
          <Sparkles size={18} className="text-cyan" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">AI Summary</h3>
          <p className="text-xs text-text-secondary">
            Auto-generated read of your channel mix — what's working, what to watch
          </p>
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((ins) => {
          const tone = TONE_STYLES[ins.tone];
          const Icon = ins.icon;
          return (
            <div
              key={ins.id}
              className={`flex gap-3 rounded-lg p-3.5 ring-1 ${tone.bg} ${tone.ring}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${tone.iconBg}`}
              >
                <Icon size={16} className={tone.iconColor} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-text-primary">{ins.title}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{ins.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
