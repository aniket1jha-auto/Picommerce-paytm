import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockPerformanceMetrics, mockIntentAnalysis } from '@/data/mock/agents';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface Props {
  agentId: string;
}

export function PerformanceMetrics({ agentId }: Props) {
  const metrics = mockPerformanceMetrics;
  const intents = mockIntentAnalysis;

  const totalCalls = metrics.reduce((sum, m) => sum + m.calls, 0);
  const totalSuccessful = metrics.reduce((sum, m) => sum + m.successful, 0);
  const avgSuccessRate = totalCalls > 0 ? (totalSuccessful / totalCalls) * 100 : 0;
  const totalCost = metrics.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Total Calls (7d)</span>
            <TrendingUp size={16} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{totalCalls}</div>
          <div className="text-xs text-green-600 mt-1">+12% from last week</div>
        </div>
        <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Success Rate</span>
            <Activity size={16} className="text-cyan" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{avgSuccessRate.toFixed(1)}%</div>
          <div className="text-xs text-text-secondary mt-1">Completion rate</div>
        </div>
        <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Avg Latency</span>
            <Activity size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-text-primary">420ms</div>
          <div className="text-xs text-text-secondary mt-1">Response time</div>
        </div>
        <div className="rounded-lg bg-white p-4 ring-1 ring-[#E5E7EB]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-secondary">Total Cost (7d)</span>
            <TrendingDown size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-text-primary">${totalCost.toFixed(0)}</div>
          <div className="text-xs text-text-secondary mt-1">${(totalCost / totalCalls).toFixed(2)} per call</div>
        </div>
      </div>

      {/* Call Volume Chart */}
      <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Call Volume Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={metrics}>
            <defs>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
            <Tooltip />
            <Area type="monotone" dataKey="calls" stroke="#06B6D4" fillOpacity={1} fill="url(#colorCalls)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Intent Analysis */}
      <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Intent Recognition Performance</h3>
        <div className="space-y-3">
          {intents.map((intent) => (
            <div key={intent.intent} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{intent.intent}</span>
                  <span className="text-xs text-text-secondary">{intent.count} calls</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan rounded-full transition-all"
                      style={{ width: `${intent.successRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text-primary w-12 text-right">
                    {intent.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-secondary">Avg Duration</div>
                <div className="text-sm font-medium text-text-primary">{intent.avgDuration}s</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
