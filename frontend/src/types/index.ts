export type Phase = 'day0' | 'day1' | 'day30';

export type ChannelType = 'sms' | 'whatsapp' | 'rcs' | 'ai_voice' | 'field_executive' | 'push_notification' | 'in_app_banner' | 'facebook_ads' | 'instagram_ads';

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';

export type InsightType = 'rule' | 'analytics' | 'ml_platform' | 'ml_tenant' | 'llm';

export type InsightTag = 'platform_model' | 'your_model' | 'rule' | 'data_profile';

export interface ChannelMetric {
  channel: ChannelType;
  sent: number;
  delivered: number;
  opened: number;
  converted: number;
  cost: number;
  revenue: number;
  deliveryRate: number;
  conversionRate: number;
  roi: number;
}

export interface CampaignTrend {
  date: string;
  sent: number;
  delivered: number;
  converted: number;
  revenue: number;
  cost: number;
}

export interface CampaignAnomaly {
  metric: string;
  expected: number;
  actual: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

/**
 * Campaign-level config for AI Voice channel.
 * Set when the campaign uses `ai_voice` and an agent is attached.
 * Phase 3.8 — see docs/DEMO_FLOW.md Step 6.
 */
export interface CampaignAIVoiceConfig {
  /** Reference to agentStore agent. Must be a deployed voice agent. */
  agentId: string;
  /** Future: prompt-variant id. v1 always uses the agent's default. */
  promptVariantId?: string;
  /** What to do if the agent fails or no-answers. */
  fallback: {
    onNoAnswer: 'retry' | 'sms' | 'skip';
    onAgentError: 'sms' | 'skip';
  };
  /** Retry rules — mirrors the existing senderConfig.ai_voice.retry shape. */
  retry: {
    enabled: boolean;
    maxRetries: number;
    delayValue: number;
    delayUnit: 'minutes' | 'hours';
    retryOn: { noAnswer: boolean; busy: boolean; networkError: boolean };
  };
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channels: ChannelType[];
  audience: {
    segmentId: string;
    segmentName: string;
    size: number;
    reachable: number;
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    converted: number;
    revenue: number;
    cost: number;
    roi: number;
    deliveryRate: number;
    conversionRate: number;
  };
  channelMetrics: ChannelMetric[];
  trend: CampaignTrend[];
  anomaly?: CampaignAnomaly;
  revenueLabel: string;
  createdAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  /** Set on campaigns that include the `ai_voice` channel. */
  aiVoiceConfig?: CampaignAIVoiceConfig;
}

export interface InsightEvidence {
  label: string;
  value: string;
}

export interface InsightContext {
  dataSource: string;
  campaignCount?: number;
  userCount?: number;
  timeRange?: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  minPhase: Phase;
  tag: InsightTag;
  title: string;
  description: string;
  confidence: number | [number, number];
  evidence: InsightEvidence[];
  cta: {
    label: string;
    action: string;
  };
  context: InsightContext;
  page?: string;
  dismissable: boolean;
  impactValue?: number;
}

export type SegmentSource = 'rule-based' | 'ai';

export interface Segment {
  id: string;
  name: string;
  description: string;
  size: number;
  /** How the segment was created — shown as a badge on cards */
  segmentSource?: SegmentSource;
  /** filter = rule builder; csv = file import */
  creationSource?: 'filter' | 'csv';
  /** When creationSource is csv */
  csvImport?: {
    fileName: string;
    importedAt: string;
  };
  /** High-level segment goal from creation wizard */
  segmentGoal?: string;
  /** Campaign names this segment is used in (for Audiences cards) */
  usedInCampaigns?: string[];
  filters?: string;
  reachability?: {
    sms: number;
    whatsapp: number;
    email?: number;
    rcs?: number;
    ai_voice?: number;
    field_executive?: number;
    push_notification?: number;
    in_app_banner?: number;
    facebook_ads?: number;
    instagram_ads?: number;
  };
  attributes?: {
    avgLtv: number;
    geographyBreakdown: Record<string, number>;
    ageRange: [number, number];
    genderSplit: Record<string, number>;
  };
  performance?: {
    avgConversion: number;
    avgROI: number;
    campaignCount: number;
  };
  lastUpdated?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'csv' | 'crm' | 'warehouse' | 'feature_store';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSynced?: string;
  recordCount?: number;
  dataQuality?: {
    completeness: number;
    freshness: 'fresh' | 'stale' | 'outdated';
    issues: string[];
  };
}

export interface KPI {
  id: string;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'flat';
  icon: string;
}

export interface WaterfallNode {
  id: string;
  type: 'channel' | 'condition' | 'wait' | 'start' | 'end';
  channel?: ChannelType;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  metrics?: {
    sent?: number;
    responded?: number;
    dropOff?: number;
  };
}

export interface WaterfallEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  animated?: boolean;
}

export interface WaterfallConfig {
  id: string;
  name: string;
  campaignId: string;
  nodes: WaterfallNode[];
  edges: WaterfallEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalReach: number;
  totalSpend: number;
  totalConverted: number;
  avgConvRate: number;
  activeCampaigns: number;
  completedCampaigns: number;
  channelBreakdown: ChannelMetric[];
  revenueVsCostTrend: Array<{
    date: string;
    revenue: number;
    cost: number;
  }>;
}

export interface PhaseDefinition {
  id: Phase;
  label: string;
  subtitle: string;
  description: string;
}

export interface ChannelDefinition {
  id: ChannelType;
  name: string;
  type: 'digital' | 'physical';
  unitCost: number;
  icon: string;
  color: string;
}
