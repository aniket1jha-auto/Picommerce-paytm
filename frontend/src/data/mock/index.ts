import type { Campaign, Segment, Insight, AnalyticsSummary, DataSource, KPI } from '@/types';
import { baseCampaigns } from './base/campaigns';
import { baseSegments } from './base/segments';
import { baseInsights } from './base/insights';
import { baseAnalytics } from './base/analytics';
import { baseDataSources } from './base/dataSources';
import { formatINR, formatCount, formatPercent } from '@/utils/format';

export interface PhaseData {
  campaigns: Campaign[];
  segments: Segment[];
  insights: Insight[];
  analytics: AnalyticsSummary;
  kpis: KPI[];
  dataSources: DataSource[];
}

function makeDay0KPIs(): KPI[] {
  return [
    { id: 'kpi-reach', label: 'Total Reach', value: '—', icon: 'Users' },
    { id: 'kpi-spend', label: 'Total Spend', value: '—', icon: 'IndianRupee' },
    { id: 'kpi-converted', label: 'Total Converted', value: '—', icon: 'TrendingUp' },
    { id: 'kpi-conv-rate', label: 'Avg Conv Rate', value: '—', icon: 'Target' },
  ];
}

function makeDay1KPIs(segments: Segment[]): KPI[] {
  const totalAudience = segments.reduce((sum, s) => sum + s.size, 0);
  const smsReach = segments.reduce((sum, s) => sum + (s.reachability?.sms ?? 0), 0);
  const waReach = segments.reduce((sum, s) => sum + (s.reachability?.whatsapp ?? 0), 0);
  return [
    { id: 'kpi-audience', label: 'Total Audience', value: formatCount(totalAudience), icon: 'Users' },
    { id: 'kpi-sms-reach', label: 'SMS Reachable', value: formatCount(smsReach), icon: 'MessageSquare' },
    { id: 'kpi-wa-reach', label: 'WhatsApp Reachable', value: formatCount(waReach), icon: 'MessageCircle' },
    { id: 'kpi-segments', label: 'Segments', value: `${segments.length}`, icon: 'LayoutGrid' },
  ];
}

function makeDay30KPIs(analytics: AnalyticsSummary): KPI[] {
  return [
    {
      id: 'kpi-reach',
      label: 'Total Reach',
      value: formatCount(analytics.totalReach),
      change: 12.4,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: 'Users',
    },
    {
      id: 'kpi-spend',
      label: 'Total Spend',
      value: formatINR(analytics.totalSpend),
      change: 8.2,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: 'IndianRupee',
    },
    {
      id: 'kpi-converted',
      label: 'Total Converted',
      value: formatCount(analytics.totalConverted),
      change: 14.3,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: 'TrendingUp',
    },
    {
      id: 'kpi-conv-rate',
      label: 'Avg Conv Rate',
      value: formatPercent(analytics.avgConvRate),
      change: 0.8,
      changeLabel: 'vs last month',
      trend: 'up',
      icon: 'Target',
    },
  ];
}

const emptyAnalytics: AnalyticsSummary = {
  totalReach: 0,
  totalSpend: 0,
  totalConverted: 0,
  avgConvRate: 0,
  activeCampaigns: 0,
  completedCampaigns: 0,
  channelBreakdown: [],
  revenueVsCostTrend: [],
};

const disconnectedDataSources: DataSource[] = baseDataSources.map((ds) => ({
  ...ds,
  status: 'disconnected' as const,
  lastSynced: undefined,
  recordCount: undefined,
  dataQuality: undefined,
}));

export function getDay0Data(): PhaseData {
  const insights = baseInsights.filter((i) => i.minPhase === 'day0');
  return {
    campaigns: [],
    segments: [],
    insights,
    analytics: emptyAnalytics,
    kpis: makeDay0KPIs(),
    dataSources: disconnectedDataSources,
  };
}

export function getDay1Data(): PhaseData {
  const insights = baseInsights.filter((i) => i.minPhase === 'day0' || i.minPhase === 'day1');
  return {
    campaigns: [],
    segments: baseSegments,
    insights,
    analytics: emptyAnalytics,
    kpis: makeDay1KPIs(baseSegments),
    dataSources: baseDataSources,
  };
}

export function getDay30Data(): PhaseData {
  return {
    campaigns: baseCampaigns,
    segments: baseSegments,
    insights: baseInsights,
    analytics: baseAnalytics,
    kpis: makeDay30KPIs(baseAnalytics),
    dataSources: baseDataSources,
  };
}
