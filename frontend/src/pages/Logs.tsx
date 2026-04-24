import { useState, useMemo } from 'react';
import {
  Search,
  Megaphone,
  Bot,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

type LogLevel = 'info' | 'warning' | 'error' | 'success';
type LogSource = 'agent' | 'campaign' | 'system';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  sourceName: string;
  message: string;
  details?: string;
  duration?: number;
  metadata?: Record<string, string>;
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'log_1',
    timestamp: '2025-01-28T14:32:15Z',
    level: 'success',
    source: 'agent',
    sourceName: 'Sales Outreach Agent',
    message: 'Call completed successfully',
    details: 'Demo scheduled for Feb 15. Lead qualified.',
    duration: 245,
    metadata: { callId: 'call_8a3f', phone: '+1***4567', intent: 'demo_request' },
  },
  {
    id: 'log_2',
    timestamp: '2025-01-28T14:28:42Z',
    level: 'warning',
    source: 'agent',
    sourceName: 'Sales Outreach Agent',
    message: 'High latency detected during call',
    details: 'Response time exceeded 2s threshold. Model: gpt-realtime.',
    duration: 312,
    metadata: { callId: 'call_7b2e', latency: '2340ms' },
  },
  {
    id: 'log_3',
    timestamp: '2025-01-28T14:25:10Z',
    level: 'info',
    source: 'campaign',
    sourceName: 'High-LTV Re-engagement',
    message: 'Batch of 500 WhatsApp messages sent',
    details: 'Segment: Premium users inactive 30d. Delivery rate: 97.2%.',
    metadata: { batchId: 'batch_4c1a', channel: 'whatsapp', sent: '500', delivered: '486' },
  },
  {
    id: 'log_4',
    timestamp: '2025-01-28T14:22:33Z',
    level: 'error',
    source: 'agent',
    sourceName: 'Customer Support Agent',
    message: 'Tool execution failed: CRM lookup timeout',
    details: 'CRM API did not respond within 10s. Fallback message played.',
    metadata: { callId: 'call_9d4f', tool: 'crm_integration', errorCode: 'TIMEOUT' },
  },
  {
    id: 'log_5',
    timestamp: '2025-01-28T14:18:55Z',
    level: 'success',
    source: 'agent',
    sourceName: 'Customer Support Agent',
    message: 'Issue resolved: Password reset',
    details: 'Customer confirmed account access restored. CSAT: Positive.',
    duration: 456,
    metadata: { callId: 'call_6e8a', intent: 'password_reset', sentiment: 'positive' },
  },
  {
    id: 'log_6',
    timestamp: '2025-01-28T14:15:20Z',
    level: 'info',
    source: 'campaign',
    sourceName: 'KYC Completion Drive',
    message: 'Campaign status changed to Active',
    details: 'Scheduled start time reached. Target audience: 1.2L users.',
    metadata: { campaignId: 'camp_2b3f', channels: 'sms, whatsapp, push' },
  },
  {
    id: 'log_7',
    timestamp: '2025-01-28T14:12:08Z',
    level: 'warning',
    source: 'campaign',
    sourceName: 'Festival Cashback Promo',
    message: 'Budget utilization at 85%',
    details: 'Current spend: 4.17L of 4.9L allocated. Consider increasing budget.',
    metadata: { campaignId: 'camp_5a7c', spend: '417000', budget: '490000' },
  },
  {
    id: 'log_8',
    timestamp: '2025-01-28T14:08:45Z',
    level: 'error',
    source: 'system',
    sourceName: 'System',
    message: 'Rate limit reached for AI Voice channel',
    details: 'Concurrent call limit (50) reached. 3 calls queued.',
    metadata: { channel: 'ai_voice', limit: '50', queued: '3' },
  },
  {
    id: 'log_9',
    timestamp: '2025-01-28T14:05:30Z',
    level: 'success',
    source: 'agent',
    sourceName: 'Appointment Scheduler',
    message: 'Appointment booked successfully',
    details: 'Feb 10, 3:00 PM. Calendar invite sent.',
    duration: 178,
    metadata: { callId: 'call_3c7b', tool: 'calendar_booking' },
  },
  {
    id: 'log_10',
    timestamp: '2025-01-28T14:02:12Z',
    level: 'info',
    source: 'agent',
    sourceName: 'Sales Outreach Agent',
    message: 'Call ended: Not interested',
    details: 'Prospect declined. Removed from active list per request.',
    duration: 89,
    metadata: { callId: 'call_1f9d', intent: 'rejection', action: 'unsubscribe' },
  },
];

const LEVEL_CONFIG: Record<LogLevel, { icon: typeof CheckCircle; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  info: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

const SOURCE_ICONS: Record<LogSource, typeof Bot> = {
  agent: Bot,
  campaign: Megaphone,
  system: AlertTriangle,
};

function LogRow({ log, expanded, onToggle }: { log: LogEntry; expanded: boolean; onToggle: () => void }) {
  const levelCfg = LEVEL_CONFIG[log.level];
  const LevelIcon = levelCfg.icon;
  const SourceIcon = SOURCE_ICONS[log.source];

  return (
    <div
      className={`rounded-lg border transition-all ${expanded ? 'border-cyan/30 ring-1 ring-cyan/10' : 'border-[#E5E7EB]'}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left"
        data-testid={`log-row-${log.id}`}
      >
        {/* Level icon */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${levelCfg.bg}`}>
          <LevelIcon size={16} className={levelCfg.color} />
        </div>

        {/* Timestamp */}
        <div className="w-[140px] shrink-0">
          <div className="text-xs font-medium text-text-primary">
            {new Date(log.timestamp).toLocaleTimeString()}
          </div>
          <div className="text-[10px] text-text-secondary">
            {new Date(log.timestamp).toLocaleDateString()}
          </div>
        </div>

        {/* Source */}
        <div className="flex items-center gap-2 w-[200px] shrink-0">
          <SourceIcon size={14} className="text-text-secondary" />
          <span className="text-xs font-medium text-text-primary truncate">{log.sourceName}</span>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-primary truncate">{log.message}</div>
        </div>

        {/* Duration */}
        {log.duration && (
          <div className="text-xs text-text-secondary w-[60px] shrink-0 text-right">
            {Math.floor(log.duration / 60)}m {log.duration % 60}s
          </div>
        )}

        <ChevronDown
          size={16}
          className={`text-text-secondary shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[#E5E7EB]">
          <div className="pt-3 space-y-3">
            {log.details && (
              <p className="text-sm text-text-secondary">{log.details}</p>
            )}
            {log.metadata && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(log.metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="inline-flex items-center rounded bg-gray-100 px-2.5 py-1 text-xs"
                  >
                    <span className="text-text-secondary">{key}:</span>
                    <span className="ml-1 font-medium text-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Logs() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LogSource | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;
      if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          log.message.toLowerCase().includes(q) ||
          log.sourceName.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, levelFilter, sourceFilter]);

  const counts = {
    all: MOCK_LOGS.length,
    success: MOCK_LOGS.filter((l) => l.level === 'success').length,
    info: MOCK_LOGS.filter((l) => l.level === 'info').length,
    warning: MOCK_LOGS.filter((l) => l.level === 'warning').length,
    error: MOCK_LOGS.filter((l) => l.level === 'error').length,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Logs"
        subtitle="Real-time activity feed across all agents and campaigns"
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full rounded-lg border border-[#E5E7EB] pl-9 pr-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            data-testid="logs-search"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'success', 'info', 'warning', 'error'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                levelFilter === level
                  ? 'bg-cyan text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
              data-testid={`filter-${level}`}
            >
              {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              <span className="opacity-70">({counts[level]})</span>
            </button>
          ))}
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as LogSource | 'all')}
          className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          data-testid="source-filter"
        >
          <option value="all">All Sources</option>
          <option value="agent">Agents</option>
          <option value="campaign">Campaigns</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {filtered.map((log) => (
          <LogRow
            key={log.id}
            log={log}
            expanded={expandedId === log.id}
            onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg bg-white p-12 ring-1 ring-[#E5E7EB] text-center">
            <p className="text-sm text-text-secondary">No logs match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
