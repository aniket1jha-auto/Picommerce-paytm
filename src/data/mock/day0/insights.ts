// Day 0 insights — rules-based and onboarding. No campaign data needed.

export interface Insight {
  id: string;
  type: 'rule' | 'profiling' | 'ml_platform' | 'ml_tenant' | 'llm';
  category: 'channel' | 'timing' | 'budget' | 'audience' | 'anomaly' | 'onboarding';
  minPhase: 'day0' | 'day1' | 'day30';
  title: string;
  description: string;
  tag: { label: string; color: 'gray' | 'amber' | 'green' };
  confidence?: { level: 'high' | 'medium' | 'low'; value?: number };
  evidence?: {
    source: string;
    dataPoints: Array<{ label: string; value: string | number }>;
    keyFactors?: string[];
  };
  cta?: { label: string; action: string };
  context: string;
}

export const day0Insights: Insight[] = [
  {
    id: 'ins-d0-onboard-datasource',
    type: 'rule',
    category: 'onboarding',
    minPhase: 'day0',
    title: 'Connect data sources to unlock audience insights',
    description:
      'Link your Snowflake warehouse, Salesforce CRM, or internal feature store to import user data. Once connected, the platform will profile your audience, surface reachability stats, and enable smart segmentation for campaign targeting.',
    tag: { label: 'Getting started', color: 'gray' },
    cta: { label: 'Connect Data Source', action: 'navigate:/settings/data-sources' },
    context: 'onboarding',
  },
  {
    id: 'ins-d0-onboard-campaign',
    type: 'rule',
    category: 'onboarding',
    minPhase: 'day0',
    title: 'Set up your first campaign',
    description:
      'Create a campaign to start reaching your users across SMS, WhatsApp, RCS, AI Voice, and Field Executive channels. The campaign builder will guide you through audience selection, channel configuration, and message setup with real-time cost projections.',
    tag: { label: 'Getting started', color: 'gray' },
    cta: { label: 'Create Campaign', action: 'navigate:/campaigns/new' },
    context: 'onboarding',
  },
  {
    id: 'ins-d0-rule-sms-charlimit',
    type: 'rule',
    category: 'channel',
    minPhase: 'day0',
    title: 'SMS messages over 160 characters are billed as 2 units',
    description:
      'Each SMS unit supports up to 160 characters. Messages exceeding this limit are automatically split into multiple units, effectively doubling (or more) your per-user cost. For example, a 187-character message costs ₹0.30/user instead of ₹0.15/user. Keep copy concise or consider WhatsApp for longer messages.',
    tag: { label: 'Rule', color: 'gray' },
    evidence: {
      source: 'Platform configuration',
      dataPoints: [
        { label: 'SMS unit limit', value: '160 characters' },
        { label: 'Cost per SMS unit', value: '₹0.15' },
        { label: '2-unit message cost', value: '₹0.30' },
      ],
    },
    context: 'channel_step',
  },
  {
    id: 'ins-d0-rule-dnd',
    type: 'rule',
    category: 'audience',
    minPhase: 'day0',
    title: 'DND compliance: promotional SMS excluded for registered numbers',
    description:
      'Users registered on the National Do Not Disturb (NDNC) registry will be automatically excluded from promotional SMS campaigns. Transactional and service messages are exempt. Typical DND exclusion rates range from 15-25% of your SMS audience. WhatsApp and AI Voice are not affected by DND filtering.',
    tag: { label: 'Rule', color: 'gray' },
    evidence: {
      source: 'TRAI DND Registry',
      dataPoints: [
        { label: 'Typical DND exclusion rate', value: '15-25%' },
        { label: 'Affected channels', value: 'SMS only' },
        { label: 'Exempt message types', value: 'Transactional, Service' },
      ],
    },
    context: 'audience_step',
  },
  {
    id: 'ins-d0-rule-budget-calc',
    type: 'rule',
    category: 'budget',
    minPhase: 'day0',
    title: 'Budget calculator: estimate spend before you launch',
    description:
      'Use the built-in budget calculator to project campaign costs based on audience size and channel mix. Unit costs — SMS: ₹0.15, WhatsApp: ₹1.05, RCS: ₹0.20, AI Voice Call: ₹3.50, Field Executive: ₹45. Projections update in real-time as you configure your campaign.',
    tag: { label: 'Rule', color: 'gray' },
    evidence: {
      source: 'Platform configuration',
      dataPoints: [
        { label: 'SMS unit cost', value: '₹0.15' },
        { label: 'WhatsApp unit cost', value: '₹1.05' },
        { label: 'RCS unit cost', value: '₹0.20' },
        { label: 'AI Voice Call unit cost', value: '₹3.50' },
        { label: 'Field Executive unit cost', value: '₹45.00' },
      ],
    },
    cta: { label: 'Open Budget Calculator', action: 'navigate:/tools/budget-calculator' },
    context: 'budget_step',
  },
  {
    id: 'ins-d0-rule-compliance',
    type: 'rule',
    category: 'channel',
    minPhase: 'day0',
    title: 'RBI compliance: loan and financial product messages require approved templates',
    description:
      'Messages containing terms like "loan", "EMI", "credit", or "interest rate" must use RBI-approved templates. The platform will flag non-compliant copy during campaign setup and suggest approved alternatives. This applies across all channels — SMS, WhatsApp, RCS, and AI Voice scripts.',
    tag: { label: 'Rule', color: 'gray' },
    context: 'channel_step',
  },
];
