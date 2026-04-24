'use client';

import { useState } from 'react';
import {
  BarChart2,
  Megaphone,
  Bot,
  Sparkles,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePhaseData } from '@/hooks/usePhaseData';
import { useInsights } from '@/hooks/useInsights';
import { useAgentStore } from '@/store/agentStore';
import type { Campaign, Insight } from '@/types';
import type { Agent } from '@/types/agent';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPIBar } from '@/components/analytics/KPIBar';
import { CostRevenueChart } from '@/components/analytics/CostRevenueChart';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineInsight } from '@/components/ai/InlineInsight';
import { formatINR, formatCount, formatPercent, formatROI } from '@/utils/format';
import { Link } from 'react-router-dom';

type ActiveTab = 'overview' | 'campaigns' | 'agents';

// AI Recommendation types
interface AIRecommendation {
  id: string;
  type: 'opportunity' | 'warning' | 'optimization' | 'insight';
  scope: 'campaign' | 'agent' | 'global';
  title: string;
  description: string;
  impact: string;
  action: string;
  actionLabel: string;
  confidence: number;
  relatedEntity?: string;
}

const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec_1',
    type: 'opportunity',
    scope: 'campaign',
    title: 'Switch High-LTV segment to AI Voice for 3x conversion lift',
    description: 'Your High-LTV Re-engagement campaign is using SMS as primary channel, but AI Voice shows 7.2% conversion vs SMS at 2.1% for similar segments across the platform.',
    impact: 'Estimated +2,400 additional conversions per month',
    action: '/campaigns/camp_001/edit',
    actionLabel: 'Edit Campaign Channels',
    confidence: 92,
    relatedEntity: 'High-LTV Re-engagement',
  },
  {
    id: 'rec_2',
    type: 'warning',
    scope: 'campaign',
    title: 'Festival Cashback Promo approaching budget ceiling',
    description: 'Current burn rate will exhaust budget in 2.3 days. Campaign is performing at 4.2x ROI — consider increasing budget to capture remaining opportunity.',
    impact: 'Risk of stopping a high-ROI campaign prematurely',
    action: '/campaigns/camp_002/edit',
    actionLabel: 'Adjust Budget',
    confidence: 98,
    relatedEntity: 'Festival Cashback Promo',
  },
  {
    id: 'rec_3',
    type: 'optimization',
    scope: 'agent',
    title: 'Sales Agent: Add budget objection handling to improve close rate',
    description: 'Failure analysis shows 55% of failed calls involve misunderstood intents around pricing. Adding explicit budget handling could reduce failures by 40%.',
    impact: 'Projected success rate increase from 87.3% to 92%',
    action: '/agents/agent_1',
    actionLabel: 'View Agent',
    confidence: 87,
    relatedEntity: 'Sales Outreach Agent',
  },
  {
    id: 'rec_4',
    type: 'insight',
    scope: 'global',
    title: 'WhatsApp messages between 10-11 AM show 2.4x higher open rates',
    description: 'Cross-campaign analysis reveals a strong time-of-day signal for WhatsApp delivery. Scheduling campaigns in this window could significantly boost engagement.',
    impact: '+18% average open rate improvement',
    action: '/campaigns/new',
    actionLabel: 'Apply to New Campaign',
    confidence: 94,
  },
  {
    id: 'rec_5',
    type: 'optimization',
    scope: 'agent',
    title: 'Switch Support Agent to gpt-realtime-mini for 35% cost reduction',
    description: 'Your Customer Support Agent uses gpt-realtime (1.5x cost) but the support use case shows negligible quality difference with gpt-realtime-mini. Switch to save without impacting performance.',
    impact: 'Save approx $980/month with same 92.5% success rate',
    action: '/agents/agent_2',
    actionLabel: 'View Agent',
    confidence: 91,
    relatedEntity: 'Customer Support Agent',
  },
  {
    id: 'rec_6',
    type: 'opportunity',
    scope: 'campaign',
    title: 'Untapped segment: Dormant users with high past LTV',
    description: 'We identified 45K users who were high-value 6+ months ago but haven\'t been targeted. Similar re-activation campaigns on the platform see 3.8% conversion rates.',
    impact: 'Potential 1,710 reactivated users, est. revenue impact 8.5L',
    action: '/campaigns/new',
    actionLabel: 'Create Campaign',
    confidence: 82,
  },
];

const REC_ICONS = {
  opportunity: { icon: Target, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  optimization: { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  insight: { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
};

// Campaign deep-dive mock data
const CAMPAIGN_TREND_DATA = [
  { day: 'Jan 22', sent: 8500, delivered: 8160, converted: 357 },
  { day: 'Jan 23', sent: 12400, delivered: 11904, converted: 536 },
  { day: 'Jan 24', sent: 15600, delivered: 14976, converted: 689 },
  { day: 'Jan 25', sent: 9800, delivered: 9408, converted: 412 },
  { day: 'Jan 26', sent: 14500, delivered: 13920, converted: 627 },
  { day: 'Jan 27', sent: 18700, delivered: 17952, converted: 843 },
  { day: 'Jan 28', sent: 20300, delivered: 19488, converted: 914 },
];

// Agent deep-dive mock data
const AGENT_TREND_DATA = [
  { day: 'Jan 22', calls: 89, success: 78, cost: 311 },
  { day: 'Jan 23', calls: 124, success: 109, cost: 434 },
  { day: 'Jan 24', calls: 156, success: 138, cost: 546 },
  { day: 'Jan 25', calls: 98, success: 85, cost: 343 },
  { day: 'Jan 26', calls: 145, success: 127, cost: 507 },
  { day: 'Jan 27', calls: 187, success: 164, cost: 654 },
  { day: 'Jan 28', calls: 203, success: 179, cost: 710 },
];

function RecommendationCard({ rec }: { rec: AIRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = REC_ICONS[rec.type];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-lg border-2 ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
        data-testid={`rec-${rec.id}`}
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white`}>
          <Icon size={18} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-text-primary">{rec.title}</h4>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-text-secondary capitalize">{rec.scope}</span>
            <span className="text-text-secondary">{rec.confidence}% confidence</span>
            {rec.relatedEntity && (
              <span className="text-text-secondary">{rec.relatedEntity}</span>
            )}
          </div>
        </div>
        <div className="shrink-0 mt-1">
          {expanded ? (
            <ChevronUp size={16} className="text-text-secondary" />
          ) : (
            <ChevronDown size={16} className="text-text-secondary" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="rounded-lg bg-white p-4 space-y-3">
                <p className="text-sm text-text-secondary">{rec.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp size={14} className="text-green-600" />
                  <span className="font-medium text-text-primary">{rec.impact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan"
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text-primary">{rec.confidence}%</span>
                </div>
                <Link
                  to={rec.action}
                  className="inline-flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
                >
                  {rec.actionLabel}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AIRecommendationsPanel({ scope }: { scope: 'all' | 'campaign' | 'agent' }) {
  const filtered = scope === 'all'
    ? AI_RECOMMENDATIONS
    : AI_RECOMMENDATIONS.filter((r) => r.scope === scope || r.scope === 'global');

  return (
    <div className="rounded-lg ring-1 ring-[#E5E7EB] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-cyan/5 to-purple-50 border-b border-[#E5E7EB]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-cyan/20">
          <Sparkles size={18} className="text-cyan" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">AI Recommendations</h3>
          <p className="text-xs text-text-secondary">
            {filtered.length} actionable insights based on cross-platform analysis
          </p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {filtered.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}

function CampaignDeepDive({ campaigns }: { campaigns: Campaign[] }) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    campaigns.filter((c) => c.metrics.sent > 0)[0] || null
  );

  const activeCampaigns = campaigns.filter((c) => c.metrics.sent > 0);

  return (
    <div className="space-y-6">
      {/* Campaign Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-text-secondary">Deep Dive Into:</span>
        <div className="flex flex-wrap gap-2">
          {activeCampaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCampaign(c)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCampaign?.id === c.id
                  ? 'bg-cyan text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
              data-testid={`campaign-pill-${c.id}`}
            >
              <Megaphone size={14} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {selectedCampaign && (
        <motion.div
          key={selectedCampaign.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Campaign KPIs */}
          <div className="grid grid-cols-5 gap-4">
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Total Sent</div>
              <div className="text-xl font-bold text-text-primary">{formatCount(selectedCampaign.metrics.sent)}</div>
              <div className="text-xs text-green-600 mt-1">Delivery: {formatPercent(selectedCampaign.metrics.deliveryRate)}</div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Conversions</div>
              <div className="text-xl font-bold text-text-primary">{formatCount(selectedCampaign.metrics.converted)}</div>
              <div className="text-xs text-cyan mt-1">Rate: {formatPercent(selectedCampaign.metrics.conversionRate)}</div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Revenue</div>
              <div className="text-xl font-bold text-green-600">{formatINR(selectedCampaign.metrics.revenue)}</div>
              <div className="text-xs text-text-secondary mt-1">{selectedCampaign.revenueLabel}</div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Spend</div>
              <div className="text-xl font-bold text-text-primary">{formatINR(selectedCampaign.metrics.cost)}</div>
              <div className="text-xs text-text-secondary mt-1">of {formatINR(selectedCampaign.budget.allocated)}</div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">ROI</div>
              <div className={`text-xl font-bold ${selectedCampaign.metrics.roi >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                {formatROI(selectedCampaign.metrics.roi)}
              </div>
              <div className="text-xs text-text-secondary mt-1">Return on investment</div>
            </div>
          </div>

          {/* Campaign Trend Chart */}
          <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Daily Performance Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CAMPAIGN_TREND_DATA}>
                <defs>
                  <linearGradient id="campConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip />
                <Area type="monotone" dataKey="converted" name="Conversions" stroke="#06B6D4" fillOpacity={1} fill="url(#campConverted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Channel breakdown for this campaign */}
          {selectedCampaign.channelMetrics.length > 0 && (
            <div className="rounded-lg bg-white ring-1 ring-[#E5E7EB] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-semibold text-text-primary">Channel Breakdown</h3>
              </div>
              <div className="grid grid-cols-3 gap-px bg-[#E5E7EB]">
                {selectedCampaign.channelMetrics.map((ch) => (
                  <div key={ch.channel} className="bg-white p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ChannelIcon channel={ch.channel} size={16} />
                      <span className="text-sm font-medium text-text-primary capitalize">
                        {ch.channel.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-text-secondary">Sent</div>
                        <div className="font-semibold text-text-primary">{formatCount(ch.sent)}</div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Conv.</div>
                        <div className="font-semibold text-cyan">{formatPercent(ch.conversionRate)}</div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Spend</div>
                        <div className="font-semibold text-text-primary">{formatINR(ch.cost)}</div>
                      </div>
                      <div>
                        <div className="text-text-secondary">ROI</div>
                        <div className={`font-semibold ${ch.roi >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                          {formatROI(ch.roi)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign-specific AI recommendations */}
          <AIRecommendationsPanel scope="campaign" />
        </motion.div>
      )}
    </div>
  );
}

function AgentDeepDive() {
  const agents = useAgentStore((s) => s.agents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0] || null);

  return (
    <div className="space-y-6">
      {/* Agent Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-text-secondary">Deep Dive Into:</span>
        <div className="flex flex-wrap gap-2">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAgent(a)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedAgent?.id === a.id
                  ? 'bg-cyan text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
              data-testid={`agent-pill-${a.id}`}
            >
              <Bot size={14} />
              {a.config.name}
            </button>
          ))}
        </div>
      </div>

      {selectedAgent && (
        <motion.div
          key={selectedAgent.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Agent KPIs */}
          <div className="grid grid-cols-5 gap-4">
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Total Calls</div>
              <div className="text-xl font-bold text-text-primary">{selectedAgent.metrics.totalCalls.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">{selectedAgent.metrics.successfulCalls.toLocaleString()} successful</div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Success Rate</div>
              <div className={`text-xl font-bold ${selectedAgent.metrics.completionRate >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                {selectedAgent.metrics.completionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-text-secondary mt-1">Completion rate</div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Failed Calls</div>
              <div className="text-xl font-bold text-red-600">{selectedAgent.metrics.failedCalls}</div>
              <div className="text-xs text-text-secondary mt-1">{(100 - selectedAgent.metrics.completionRate).toFixed(1)}% failure</div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Avg Duration</div>
              <div className="text-xl font-bold text-text-primary">
                {Math.floor(selectedAgent.metrics.avgDuration / 60)}m {selectedAgent.metrics.avgDuration % 60}s
              </div>
              <div className="text-xs text-text-secondary mt-1">Per call</div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
              <div className="text-xs text-text-secondary mb-1">Avg Latency</div>
              <div className={`text-xl font-bold ${selectedAgent.metrics.avgLatency < 500 ? 'text-green-600' : 'text-amber-600'}`}>
                {selectedAgent.metrics.avgLatency}ms
              </div>
              <div className="text-xs text-text-secondary mt-1">Response time</div>
            </div>
          </div>

          {/* Agent Config Summary */}
          <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Agent Configuration</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="text-xs text-text-secondary">Model:</div>
                <div className="text-sm font-medium text-text-primary">{selectedAgent.config.model}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-text-secondary">Voice:</div>
                <div className="text-sm font-medium text-text-primary capitalize">{selectedAgent.config.voice}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-text-secondary">Use Case:</div>
                <div className="text-sm font-medium text-text-primary capitalize">{selectedAgent.config.useCase}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-text-secondary">Version:</div>
                <div className="text-sm font-medium text-text-primary">v{selectedAgent.version}</div>
              </div>
            </div>
          </div>

          {/* Agent Trend Chart */}
          <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Daily Call Volume & Success</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={AGENT_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="calls" name="Total Calls" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="success" name="Successful" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-4">
            <Link
              to={`/agents/${selectedAgent.id}`}
              className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB] hover:ring-2 hover:ring-cyan transition-all flex items-center gap-3"
              data-testid="link-agent-detail"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Bot size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">View Full Evaluation</div>
                <div className="text-xs text-text-secondary">Transcripts, failures, prompt analysis</div>
              </div>
              <ArrowRight size={16} className="text-text-secondary ml-auto" />
            </Link>
            <Link
              to={`/agents/${selectedAgent.id}`}
              className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB] hover:ring-2 hover:ring-cyan transition-all flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">Failure Analysis</div>
                <div className="text-xs text-text-secondary">{selectedAgent.metrics.failedCalls} failures to investigate</div>
              </div>
              <ArrowRight size={16} className="text-text-secondary ml-auto" />
            </Link>
            <Link
              to={`/agents/${selectedAgent.id}`}
              className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB] hover:ring-2 hover:ring-cyan transition-all flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10">
                <Sparkles size={20} className="text-cyan" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary">Prompt Enhancement</div>
                <div className="text-xs text-text-secondary">AI-suggested improvements</div>
              </div>
              <ArrowRight size={16} className="text-text-secondary ml-auto" />
            </Link>
          </div>

          {/* Agent-specific AI recommendations */}
          <AIRecommendationsPanel scope="agent" />
        </motion.div>
      )}
    </div>
  );
}

export function Analytics() {
  const { campaigns, isDay0, isDay1 } = usePhaseData();
  const allInsights = useInsights('analytics');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Analytics"
        subtitle="Deep-dive performance intelligence across campaigns and agents"
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {([
          { id: 'overview' as const, label: 'Overview', icon: BarChart2 },
          { id: 'campaigns' as const, label: 'Campaigns', icon: Megaphone },
          { id: 'agents' as const, label: 'Agents', icon: Bot },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            data-testid={`analytics-tab-${id}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <KPIBar />
            <CostRevenueChart />

            {/* AI Recommendations - All */}
            <AIRecommendationsPanel scope="all" />

            {/* AI Insights from existing system */}
            {allInsights.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-text-primary">Platform Insights</h2>
                <div className="flex flex-col gap-2">
                  {allInsights
                    .filter((ins: Insight) => !dismissed.has(ins.id))
                    .map((ins: Insight) => (
                      <InlineInsight
                        key={ins.id}
                        insight={ins}
                        onDismiss={ins.dismissable ? () => handleDismiss(ins.id) : undefined}
                      />
                    ))}
                </div>
              </section>
            )}
          </motion.div>
        )}

        {activeTab === 'campaigns' && (
          <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CampaignDeepDive campaigns={campaigns} />
          </motion.div>
        )}

        {activeTab === 'agents' && (
          <motion.div
            key="agents"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AgentDeepDive />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
