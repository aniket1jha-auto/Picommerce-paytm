import { useMemo, useState } from 'react';
import { Users, TrendingUp, BarChart2, Plus, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Toast } from '@/components/common/Toast';
import { CreateSegmentModal } from '@/components/audience/CreateSegmentModal';
import { usePhaseData } from '@/hooks/usePhaseData';
import { formatCount, formatPercent } from '@/utils/format';
import type { Segment, DataSource } from '@/types';
import type { ChannelType } from '@/types';

const CHANNEL_LABELS: Record<ChannelType, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  rcs: 'RCS',
  ai_voice: 'AI Voice',
  field_executive: 'Field Exec',
  push_notification: 'Push Notification',
  in_app_banner: 'In-App Banner',
  facebook_ads: 'Facebook Ads',
  instagram_ads: 'Instagram Ads',
};

const REACHABILITY_CHANNELS: ChannelType[] = [
  'sms',
  'whatsapp',
  'rcs',
  'ai_voice',
  'field_executive',
  'push_notification',
  'in_app_banner',
  'facebook_ads',
  'instagram_ads',
];

const CHANNEL_COLORS: Record<ChannelType, string> = {
  sms: '#6366F1',
  whatsapp: '#25D366',
  rcs: '#00BAF2',
  ai_voice: '#F59E0B',
  field_executive: '#8B5CF6',
  push_notification: '#EF4444',
  in_app_banner: '#0EA5E9',
  facebook_ads: '#1877F2',
  instagram_ads: '#E4405F',
};

// ── Data Source Connectors ──────────────────────────────────────────────────

interface Connector {
  name: string;
  abbr: string;
  color: string;
  category: string;
}

interface ConnectorCategory {
  label: string;
  connectors: Connector[];
}

const CONNECTOR_CATEGORIES: ConnectorCategory[] = [
  {
    label: 'Data Warehouses',
    connectors: [
      { name: 'Snowflake', abbr: 'Sf', color: '#29B5E8' },
      { name: 'Google BigQuery', abbr: 'BQ', color: '#4285F4' },
      { name: 'Amazon Redshift', abbr: 'RS', color: '#FF9900' },
      { name: 'Databricks', abbr: 'DB', color: '#FF3621' },
    ].map((c) => ({ ...c, category: 'Data Warehouse' })),
  },
  {
    label: 'Streaming / Real-time',
    connectors: [
      { name: 'Apache Kafka', abbr: 'Kf', color: '#231F20' },
      { name: 'Amazon Kinesis', abbr: 'Kn', color: '#FF9900' },
      { name: 'Google Pub/Sub', abbr: 'PS', color: '#4285F4' },
    ].map((c) => ({ ...c, category: 'Streaming' })),
  },
  {
    label: 'Databases',
    connectors: [
      { name: 'Cassandra', abbr: 'Ca', color: '#1287B1' },
      { name: 'MongoDB', abbr: 'Mo', color: '#47A248' },
      { name: 'PostgreSQL', abbr: 'PG', color: '#336791' },
      { name: 'MySQL', abbr: 'My', color: '#4479A1' },
    ].map((c) => ({ ...c, category: 'Database' })),
  },
  {
    label: 'Feature Stores',
    connectors: [
      { name: 'Feast', abbr: 'Fe', color: '#0F4C81' },
      { name: 'Tecton', abbr: 'Te', color: '#5C2D91' },
      { name: 'Internal Feature Store', abbr: 'IF', color: '#374151' },
    ].map((c) => ({ ...c, category: 'Feature Store' })),
  },
  {
    label: 'Segmentation Engines',
    connectors: [
      { name: 'CleverTap', abbr: 'CT', color: '#F26522' },
      { name: 'MoEngage', abbr: 'ME', color: '#00A4BD' },
      { name: 'Segment (Twilio)', abbr: 'Sg', color: '#52BD94' },
      { name: 'WebEngage', abbr: 'WE', color: '#004CC4' },
      { name: 'Braze', abbr: 'Br', color: '#2563EB' },
    ].map((c) => ({ ...c, category: 'Segmentation Engine' })),
  },
  {
    label: 'CRM / CDP',
    connectors: [
      { name: 'Salesforce', abbr: 'SF', color: '#00A1E0' },
      { name: 'HubSpot', abbr: 'HS', color: '#FF7A59' },
      { name: 'Zoho CRM', abbr: 'Zh', color: '#E42527' },
    ].map((c) => ({ ...c, category: 'CRM / CDP' })),
  },
  {
    label: 'File Upload',
    connectors: [
      { name: 'CSV Upload', abbr: 'CS', color: '#6B7280' },
      { name: 'Google Sheets', abbr: 'GS', color: '#34A853' },
      { name: 'SFTP', abbr: 'FT', color: '#374151' },
    ].map((c) => ({ ...c, category: 'File Upload' })),
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function getReachabilityEntries(
  reachability: Segment['reachability'],
): { channel: ChannelType; count: number }[] {
  if (!reachability) return [];
  return REACHABILITY_CHANNELS.filter(
    (ch) => reachability[ch] !== undefined,
  ).map((ch) => ({ channel: ch, count: reachability[ch] as number }));
}

function SegmentCard({
  segment,
  isDay30,
}: {
  segment: Segment;
  isDay30: boolean;
}) {
  const reachEntries = getReachabilityEntries(segment.reachability);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,41,112,0.08)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,41,112,0.12)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {segment.name}
            </h3>
            {segment.segmentSource === 'rule-based' && (
              <span className="shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                Rule-based
              </span>
            )}
            {segment.segmentSource === 'ai' && (
              <span className="shrink-0 rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-cyan">
                AI
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">
            {segment.description}
          </p>
        </div>
        <div className="shrink-0 rounded-md bg-[#F3F4F6] px-2.5 py-1 text-xs font-semibold text-text-primary">
          {formatCount(segment.size)} users
        </div>
      </div>

      {/* Reachability breakdown */}
      {reachEntries.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-text-secondary">
            Reachability
          </p>
          <div className="flex flex-wrap gap-2">
            {reachEntries.map(({ channel, count }) => (
              <div
                key={channel}
                className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: CHANNEL_COLORS[channel] }}
                />
                <span className="text-xs font-medium text-text-secondary">
                  {CHANNEL_LABELS[channel]}
                </span>
                <span className="text-xs font-semibold text-text-primary">
                  {formatCount(count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day 30+ performance badges */}
      {isDay30 && segment.performance && (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-[#F0FDF4] px-3 py-2.5">
          <div className="text-center">
            <p className="text-[11px] text-text-secondary">Avg Conv.</p>
            <p className="mt-0.5 text-sm font-semibold text-[#27AE60]">
              {formatPercent(segment.performance.avgConversion)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-text-secondary">Campaigns</p>
            <p className="mt-0.5 text-sm font-semibold text-text-primary">
              {segment.performance.campaignCount}
            </p>
          </div>
        </div>
      )}

      {/* Filters pill */}
      {segment.filters && (
        <div className="mt-3">
          <code className="inline-block max-w-full truncate rounded bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-text-secondary">
            {segment.filters}
          </code>
        </div>
      )}
    </div>
  );
}

const DATA_SOURCE_TYPE_LABELS: Record<DataSource['type'], string> = {
  database: 'Database',
  api: 'API',
  csv: 'CSV',
  crm: 'CRM',
  warehouse: 'Warehouse',
  feature_store: 'Feature Store',
};

function ConnectedSourceCard({
  source,
  onDisconnect,
}: {
  source: DataSource;
  onDisconnect: (name: string) => void;
}) {
  const initial = source.name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_3px_rgba(0,41,112,0.06)]">
      <div className="flex items-center gap-2">
        {/* Logo placeholder */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#3B82F6]">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-text-primary">
            {source.name}
          </p>
          <span className="inline-block rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
            {DATA_SOURCE_TYPE_LABELS[source.type]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
          <span className="text-[10px] text-[#22C55E] font-medium">Live</span>
        </div>
      </div>

      {source.recordCount !== undefined && (
        <p className="text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">
            {formatCount(source.recordCount)}
          </span>{' '}
          records
        </p>
      )}

      {source.lastSynced && (
        <p className="text-[10px] text-text-secondary">
          Synced {source.lastSynced}
        </p>
      )}

      <button
        onClick={() => onDisconnect(source.name)}
        className="mt-0.5 text-left text-[11px] font-medium text-[#EF4444] hover:underline"
      >
        Disconnect
      </button>
    </div>
  );
}

function ConnectorPill({
  connector,
  onConnect,
}: {
  connector: Connector;
  onConnect: (name: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-2">
      {/* Logo circle */}
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: connector.color }}
      >
        {connector.abbr.charAt(0)}
      </div>
      <span className="flex-1 text-xs font-medium text-text-primary truncate">
        {connector.name}
      </span>
      <button
        onClick={() => onConnect(connector.name)}
        className="shrink-0 rounded px-2 py-0.5 text-[11px] font-medium text-[#3B82F6] hover:bg-[#EFF6FF] transition-colors"
      >
        Connect
      </button>
    </div>
  );
}

function DataSourcesSection({
  dataSources,
  isDay0,
  onToast,
}: {
  dataSources: DataSource[];
  isDay0: boolean;
  onToast: (msg: string) => void;
}) {
  const [expanded, setExpanded] = useState(isDay0);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-[#6366F1]" />
          <h2 className="text-base font-semibold text-text-primary">
            Data Sources
          </h2>
          {dataSources.length > 0 && (
            <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs font-medium text-[#6366F1]">
              {dataSources.length} connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToast('Connection setup coming soon')}
            className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-[#F9FAFB]"
          >
            <Plus size={12} />
            Connect New Source
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-center rounded-md p-1.5 text-text-secondary transition-colors hover:bg-[#F3F4F6]"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#E5E7EB] px-5 pb-5 pt-4 flex flex-col gap-6">
          {/* Connected sources */}
          {dataSources.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Connected ({dataSources.length})
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {dataSources.map((ds) => (
                  <ConnectedSourceCard
                    key={ds.id}
                    source={ds}
                    onDisconnect={(name) =>
                      onToast(`Disconnect for ${name} coming soon`)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available connectors by category */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Available Connectors
            </p>
            <div className="flex flex-col divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] overflow-hidden">
              {CONNECTOR_CATEGORIES.map((cat) => (
                <div key={cat.label} className="bg-[#FAFAFA] px-4 py-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {cat.connectors.map((connector) => (
                      <ConnectorPill
                        key={connector.name}
                        connector={connector}
                        onConnect={(name) =>
                          onToast(`Connection setup for ${name} coming soon`)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export function Audiences() {
  const { segments, dataSources, campaigns, isDay0, isDay30 } = usePhaseData();
  const [toast, setToast] = useState<string | null>(null);
  const [createSegmentOpen, setCreateSegmentOpen] = useState(false);
  const [customSegments, setCustomSegments] = useState<Segment[]>([]);

  const allSegments = useMemo(
    () => [...customSegments, ...segments],
    [customSegments, segments],
  );

  // Compute total users from data sources (sum of recordCounts or segment sizes)
  const totalUsers = dataSources.reduce(
    (sum, ds) => sum + (ds.recordCount ?? 0),
    0,
  );

  // Compute reachable breakdown by channel using segments
  const reachableTotals = allSegments.reduce(
    (acc, seg) => {
      if (!seg.reachability) return acc;
      for (const ch of REACHABILITY_CHANNELS) {
        const count = seg.reachability[ch] ?? 0;
        acc[ch] = (acc[ch] ?? 0) + count;
      }
      return acc;
    },
    {} as Record<ChannelType, number>,
  );

  const totalReachable = Math.max(...Object.values(reachableTotals), 0);

  const headerSubtitle = isDay0
    ? 'No data sources connected'
    : `${formatCount(totalUsers)} users synced across ${dataSources.length} source${dataSources.length !== 1 ? 's' : ''}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audiences"
        subtitle={headerSubtitle}
        actions={
          !isDay0 ? (
            <button
              type="button"
              onClick={() => setCreateSegmentOpen(true)}
              className="flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
            >
              <Plus size={16} />
              Create Segment
            </button>
          ) : undefined
        }
      />

      {isDay0 ? (
        <div className="mt-8 flex flex-col gap-6">
          <EmptyState
            icon={Users}
            title="Connect data sources to view your audience"
            description="Integrate your data warehouse, CRM, or feature store to start building segments and reach the right users."
            ctaLabel="Go to Settings"
            ctaHref="/settings"
          />

          {/* Data Sources section — shown even on Day 0 so users can explore connectors */}
          <DataSourcesSection
            dataSources={dataSources}
            isDay0={isDay0}
            onToast={setToast}
          />
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EFF6FF]">
                  <Users size={16} className="text-[#3B82F6]" />
                </div>
                <p className="text-xs font-medium text-text-secondary">
                  Total Users Synced
                </p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-text-primary">
                {formatCount(totalUsers)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                across {dataSources.length} data source
                {dataSources.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F0FDF4]">
                  <TrendingUp size={16} className="text-[#27AE60]" />
                </div>
                <p className="text-xs font-medium text-text-secondary">
                  Max Reachable
                </p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-text-primary">
                {formatCount(totalReachable)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                across all channels
              </p>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF7ED]">
                  <BarChart2 size={16} className="text-[#F59E0B]" />
                </div>
                <p className="text-xs font-medium text-text-secondary">
                  Saved Segments
                </p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-text-primary">
                {allSegments.length}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                ready for campaigns
              </p>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-text-secondary">
                  Reachable by Channel
                </p>
                <div className="flex flex-col gap-1">
                  {REACHABILITY_CHANNELS.filter(
                    (ch) => reachableTotals[ch] > 0,
                  )
                    .slice(0, 3)
                    .map((ch) => (
                      <div key={ch} className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: CHANNEL_COLORS[ch] }}
                        />
                        <span className="text-xs text-text-secondary">
                          {CHANNEL_LABELS[ch]}
                        </span>
                        <span className="ml-auto text-xs font-semibold text-text-primary">
                          {formatCount(reachableTotals[ch])}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources section */}
          <DataSourcesSection
            dataSources={dataSources}
            isDay0={isDay0}
            onToast={setToast}
          />

          {/* Segments grid */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">
                Saved Segments
              </h2>
              <span className="text-sm text-text-secondary">
                {allSegments.length} segment{allSegments.length !== 1 ? 's' : ''}
              </span>
            </div>

            {allSegments.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={Users}
                  title="No segments yet"
                  description="Create your first segment to start targeting the right users in your campaigns."
                />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {allSegments.map((segment) => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    isDay30={isDay30}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <CreateSegmentModal
        open={createSegmentOpen}
        onClose={() => setCreateSegmentOpen(false)}
        campaigns={campaigns}
        onSave={(segment) => {
          setCustomSegments((prev) => [segment, ...prev]);
          setCreateSegmentOpen(false);
          setToast('Segment saved');
        }}
      />

      <Toast
        message={toast ?? ''}
        type="info"
        visible={toast !== null}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
