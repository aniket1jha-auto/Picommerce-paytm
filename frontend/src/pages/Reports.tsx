import { useState } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Phone,
  Megaphone,
  DollarSign,
  Users,
  FileText,
  Bot,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';

const CAMPAIGN_PERF = [
  { name: 'Week 1', sent: 45000, delivered: 43200, converted: 1890, cost: 156000 },
  { name: 'Week 2', sent: 62000, delivered: 59520, converted: 2790, cost: 218000 },
  { name: 'Week 3', sent: 78000, delivered: 74880, converted: 3510, cost: 274000 },
  { name: 'Week 4', sent: 91000, delivered: 87360, converted: 4280, cost: 319000 },
];

const AGENT_PERF = [
  { name: 'Week 1', calls: 312, successful: 273, avgDuration: 285, cost: 10920 },
  { name: 'Week 2', calls: 487, successful: 428, avgDuration: 292, cost: 17045 },
  { name: 'Week 3', calls: 623, successful: 551, avgDuration: 278, cost: 21805 },
  { name: 'Week 4', calls: 825, successful: 726, avgDuration: 287, cost: 28875 },
];

const CHANNEL_BREAKDOWN = [
  { name: 'WhatsApp', value: 35, color: '#25D366' },
  { name: 'SMS', value: 25, color: '#00BAF2' },
  { name: 'AI Voice', value: 18, color: '#7C3AED' },
  { name: 'Push', value: 12, color: '#EF4444' },
  { name: 'RCS', value: 6, color: '#4285F4' },
  { name: 'In-App', value: 4, color: '#0EA5E9' },
];

interface ReportCard {
  id: string;
  title: string;
  description: string;
  type: 'campaign' | 'agent' | 'combined';
  frequency: string;
  lastGenerated: string;
}

const SAVED_REPORTS: ReportCard[] = [
  {
    id: 'rpt_1',
    title: 'Weekly Campaign Summary',
    description: 'Key metrics across all active campaigns including reach, spend, and conversions',
    type: 'campaign',
    frequency: 'Weekly',
    lastGenerated: '2025-01-27',
  },
  {
    id: 'rpt_2',
    title: 'Agent Performance Report',
    description: 'Success rates, call durations, and failure analysis for all deployed agents',
    type: 'agent',
    frequency: 'Weekly',
    lastGenerated: '2025-01-27',
  },
  {
    id: 'rpt_3',
    title: 'Monthly ROI Analysis',
    description: 'Revenue vs cost breakdown by channel with ROI calculations',
    type: 'combined',
    frequency: 'Monthly',
    lastGenerated: '2025-01-01',
  },
  {
    id: 'rpt_4',
    title: 'Channel Effectiveness',
    description: 'Comparative analysis of all channels with conversion funnels',
    type: 'campaign',
    frequency: 'Bi-weekly',
    lastGenerated: '2025-01-20',
  },
];

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-secondary">{label}</span>
        <Icon size={16} className="text-text-secondary" />
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {positive ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
        {change}
      </div>
    </div>
  );
}

export function Reports() {
  const [activeView, setActiveView] = useState<'overview' | 'saved'>('overview');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        subtitle="Performance reports and analytics across campaigns and agents"
        actions={
          <button
            className="inline-flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
            data-testid="export-report-btn"
          >
            <Download size={16} />
            Export Report
          </button>
        }
      />

      {/* View Toggle */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setActiveView('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'overview' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary'
          }`}
          data-testid="view-overview"
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView('saved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'saved' ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary'
          }`}
          data-testid="view-saved"
        >
          Saved Reports
        </button>
      </div>

      {activeView === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard icon={Megaphone} label="Campaign Reach (30d)" value="2.76L" change="+18.4% vs last month" positive />
            <StatCard icon={Phone} label="Agent Calls (30d)" value="2,247" change="+32.1% vs last month" positive />
            <StatCard icon={DollarSign} label="Total Spend (30d)" value="9.67L" change="+12.8% vs last month" positive={false} />
            <StatCard icon={Users} label="Conversions (30d)" value="12,470" change="+24.6% vs last month" positive />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Campaign Performance */}
            <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Campaign Performance (4 Weeks)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={CAMPAIGN_PERF}>
                  <defs>
                    <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip />
                  <Area type="monotone" dataKey="converted" stroke="#06B6D4" fillOpacity={1} fill="url(#colorConverted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Agent Performance */}
            <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Agent Performance (4 Weeks)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={AGENT_PERF}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="successful" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="calls" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Channel Breakdown */}
            <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Channel Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={CHANNEL_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={45}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {CHANNEL_BREAKDOWN.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {CHANNEL_BREAKDOWN.map((ch) => (
                  <div key={ch.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span className="text-text-secondary">{ch.name}</span>
                    <span className="font-medium text-text-primary">{ch.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing */}
            <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB] col-span-2">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Top Performing Assets</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                    <Megaphone size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">High-LTV Re-engagement</div>
                    <div className="text-xs text-text-secondary">Campaign</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">4.2% conv</div>
                    <div className="text-xs text-text-secondary">1.8K conversions</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                    <Bot size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">Customer Support Agent</div>
                    <div className="text-xs text-text-secondary">Agent</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-600">92.5% success</div>
                    <div className="text-xs text-text-secondary">2,621 resolved</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10">
                    <Phone size={16} className="text-cyan" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">AI Voice Channel</div>
                    <div className="text-xs text-text-secondary">Channel</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan">7.2% conv</div>
                    <div className="text-xs text-text-secondary">Highest ROI channel</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeView === 'saved' && (
        <div className="grid grid-cols-2 gap-4">
          {SAVED_REPORTS.map((report) => (
            <div
              key={report.id}
              className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB] hover:ring-2 hover:ring-cyan transition-all"
              data-testid={`report-${report.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-[#E5E7EB]">
                    <FileText size={20} className="text-text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">{report.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded capitalize ${
                          report.type === 'agent'
                            ? 'bg-purple-50 text-purple-700'
                            : report.type === 'campaign'
                            ? 'bg-cyan/10 text-cyan'
                            : 'bg-gray-100 text-text-secondary'
                        }`}
                      >
                        {report.type}
                      </span>
                      <span className="text-xs text-text-secondary">{report.frequency}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-gray-50"
                >
                  <Download size={12} />
                  Export
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-3">{report.description}</p>
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Calendar size={12} />
                <span>Last generated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
