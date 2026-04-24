/** Catalog for Settings → Integrations */

export type IntegrationConnectionStatus = 'connected' | 'disconnected' | 'error';

export type IntegrationFilterTab =
  | 'all'
  | 'data_sources'
  | 'crm'
  | 'telephony'
  | 'messaging'
  | 'payments'
  | 'productivity'
  | 'webhooks';

export type IntegrationSectionId =
  | 'DATA SOURCES'
  | 'TELEPHONY'
  | 'MESSAGING'
  | 'PAYMENTS & CONVERSIONS'
  | 'PRODUCTIVITY'
  | 'DEVELOPER';

/** Drives configuration fields in the drawer */
export type IntegrationConfigKind =
  | 'oauth'
  | 'api_twilio'
  | 'api_plivo'
  | 'api_whatsapp'
  | 'api_sendgrid'
  | 'api_razorpay'
  | 'api_zentrunk'
  | 'api_sms_gateway'
  | 'api_rcs'
  | 'api_slack'
  | 'sftp'
  | 'webhook_inbound'
  | 'webhook_outbound'
  | 'rest_api';

export interface IntegrationDefinition {
  id: string;
  name: string;
  initials: string;
  brandColor: string;
  shortDescription: string;
  categoryLabel: string;
  section: IntegrationSectionId;
  filterTab: Exclude<IntegrationFilterTab, 'all'>;
  configKind: IntegrationConfigKind;
  /** Longer copy for drawer About */
  about: string;
  whatGetsSynced: string[];
  usedBy: string[];
  /** Section 3 — CRM only */
  hasCrmSyncSettings: boolean;
}

export const INTEGRATION_FILTER_TABS: { id: IntegrationFilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'data_sources', label: 'Data Sources' },
  { id: 'crm', label: 'CRM' },
  { id: 'telephony', label: 'Telephony' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'payments', label: 'Payments' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'webhooks', label: 'Webhooks' },
];

export const INTEGRATIONS: IntegrationDefinition[] = [
  {
    id: 'salesforce',
    name: 'Salesforce Sales Cloud',
    initials: 'SF',
    brandColor: '#00A1E0',
    shortDescription: 'Sync contacts, leads, and push dispositions back',
    categoryLabel: 'CRM',
    section: 'DATA SOURCES',
    filterTab: 'crm',
    configKind: 'oauth',
    about:
      'Connect Salesforce to import leads and contacts into Commerce, sync campaign outcomes, and write call and message dispositions back to CRM records.',
    whatGetsSynced: [
      'Contacts and leads pulled in',
      'Campaign dispositions pushed back',
      'Conversion events ingested',
    ],
    usedBy: ['Audiences', 'Analytics', 'Agent Tools'],
    hasCrmSyncSettings: true,
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    initials: 'HS',
    brandColor: '#FF7A59',
    shortDescription: 'Import contacts and smart lists, sync campaign outcomes',
    categoryLabel: 'CRM',
    section: 'DATA SOURCES',
    filterTab: 'crm',
    configKind: 'oauth',
    about:
      'Sync HubSpot contacts and active lists with Commerce audiences. Outbound results and revenue events can update HubSpot properties and workflows.',
    whatGetsSynced: [
      'Contacts and lists imported',
      'Campaign engagement written back',
      'Lifecycle stage updates from conversions',
    ],
    usedBy: ['Audiences', 'Campaigns', 'Analytics'],
    hasCrmSyncSettings: true,
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    initials: 'Zo',
    brandColor: '#E42527',
    shortDescription: 'Two-way contact sync and campaign attribution',
    categoryLabel: 'CRM',
    section: 'DATA SOURCES',
    filterTab: 'crm',
    configKind: 'oauth',
    about:
      'Keep Zoho leads and contacts aligned with Commerce segments. Attribution tags link campaigns to deals and revenue.',
    whatGetsSynced: [
      'Leads and contacts synced',
      'Campaign tags on records',
      'Deal stage signals for audiences',
    ],
    usedBy: ['Audiences', 'Reports'],
    hasCrmSyncSettings: true,
  },
  {
    id: 'freshsales',
    name: 'Freshsales',
    initials: 'Fr',
    brandColor: '#20C05C',
    shortDescription: 'Contact import and outcome sync',
    categoryLabel: 'CRM',
    section: 'DATA SOURCES',
    filterTab: 'crm',
    configKind: 'oauth',
    about:
      'Import Freshsales contacts for outreach and write back call outcomes and email engagement to the right records.',
    whatGetsSynced: [
      'Contacts imported on schedule',
      'Outcomes synced to activities',
      'Owner and territory fields respected',
    ],
    usedBy: ['Audiences', 'Agents'],
    hasCrmSyncSettings: true,
  },
  {
    id: 'leadsquared',
    name: 'Leadsquared',
    initials: 'L2',
    brandColor: '#5C2D91',
    shortDescription: 'Loan management system integration for DPD and contact data',
    categoryLabel: 'CRM / LMS',
    section: 'DATA SOURCES',
    filterTab: 'crm',
    configKind: 'oauth',
    about:
      'Connect your LMS to bring loan stages, DPD buckets, and contact fields into Commerce for segmentation and voice campaigns.',
    whatGetsSynced: [
      'Loan and contact records',
      'DPD and EMI attributes',
      'Disposition and payment flags',
    ],
    usedBy: ['Audiences', 'Agent Tools', 'Analytics'],
    hasCrmSyncSettings: true,
  },
  {
    id: 'csv_sftp',
    name: 'CSV / SFTP Upload',
    initials: 'CS',
    brandColor: '#64748B',
    shortDescription: 'Scheduled batch contact ingestion via file upload or SFTP',
    categoryLabel: 'Data Source',
    section: 'DATA SOURCES',
    filterTab: 'data_sources',
    configKind: 'sftp',
    about:
      'Ingest large contact files on a schedule from SFTP or manual uploads. Maps columns to Commerce contact fields.',
    whatGetsSynced: [
      'Batch files from your SFTP folder',
      'Column-mapped contact attributes',
      'Incremental file detection',
    ],
    usedBy: ['Audiences', 'Data quality'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'rest_webhook_ingest',
    name: 'REST API / Webhook Ingest',
    initials: 'API',
    brandColor: '#6366F1',
    shortDescription: 'Push contact and event data in real-time via REST API',
    categoryLabel: 'Data Source',
    section: 'DATA SOURCES',
    filterTab: 'data_sources',
    configKind: 'webhook_inbound',
    about:
      'Receive HTTP payloads to create or update contacts and stream behavioral events into Commerce in real time.',
    whatGetsSynced: [
      'Contact upserts from your systems',
      'Custom events and traits',
      'Idempotent ingestion with keys',
    ],
    usedBy: ['Audiences', 'Real-time triggers'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'plivo',
    name: 'Plivo',
    initials: 'Pl',
    brandColor: '#2ECC71',
    shortDescription: 'Voice call routing, outbound dialing, WebSocket media streaming',
    categoryLabel: 'Telephony',
    section: 'TELEPHONY',
    filterTab: 'telephony',
    configKind: 'api_plivo',
    about:
      'Route AI and agent voice calls through Plivo with outbound dialing and streaming audio for real-time conversation.',
    whatGetsSynced: [
      'Call events and recordings metadata',
      'Carrier and hang-up reasons',
      'Billing usage snapshots',
    ],
    usedBy: ['Channels', 'Agents', 'Analytics'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'zentrunk',
    name: 'Zentrunk',
    initials: 'Zt',
    brandColor: '#0EA5E9',
    shortDescription: 'SIP trunking and inbound call handling',
    categoryLabel: 'Telephony',
    section: 'TELEPHONY',
    filterTab: 'telephony',
    configKind: 'api_zentrunk',
    about:
      'Connect SIP trunks for inbound DID routing and carrier-grade voice paths into Commerce voice agents.',
    whatGetsSynced: [
      'Trunk health and capacity',
      'Inbound leg metadata',
      'CDR summaries for reporting',
    ],
    usedBy: ['Channels', 'Agents'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'twilio',
    name: 'Twilio',
    initials: 'Tw',
    brandColor: '#F22F46',
    shortDescription: 'Voice and SMS delivery fallback',
    categoryLabel: 'Telephony',
    section: 'TELEPHONY',
    filterTab: 'telephony',
    configKind: 'api_twilio',
    about:
      'Use Twilio as a fallback carrier for SMS and voice when primary routes fail or for specific geographies.',
    whatGetsSynced: [
      'Delivery receipts',
      'Voice call status callbacks',
      'Usage by subaccount',
    ],
    usedBy: ['Channels', 'Campaigns'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API (Meta)',
    initials: 'WA',
    brandColor: '#25D366',
    shortDescription: 'Outbound HSM templates and inbound session message handling',
    categoryLabel: 'Messaging',
    section: 'MESSAGING',
    filterTab: 'messaging',
    configKind: 'api_whatsapp',
    about:
      'Send template messages, handle inbound sessions, and attach Commerce campaigns to WhatsApp conversations.',
    whatGetsSynced: [
      'Template approval status',
      'Inbound message webhooks',
      'Opt-in and quality rating signals',
    ],
    usedBy: ['Campaigns', 'Agents', 'Compliance'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'sms_gateway',
    name: 'SMS Gateway',
    initials: 'SM',
    brandColor: '#3B82F6',
    shortDescription: 'Bulk SMS delivery via configured provider',
    categoryLabel: 'Messaging',
    section: 'MESSAGING',
    filterTab: 'messaging',
    configKind: 'api_sms_gateway',
    about:
      'Configure your SMS aggregator or direct bind for high-volume transactional and campaign SMS.',
    whatGetsSynced: [
      'DLR and failure codes',
      'Sender ID registry',
      'Throughput limits',
    ],
    usedBy: ['Campaigns', 'Channels'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'rcs',
    name: 'RCS Business Messaging',
    initials: 'RC',
    brandColor: '#00BAF2',
    shortDescription: 'Rich communication services for supported carriers',
    categoryLabel: 'Messaging',
    section: 'MESSAGING',
    filterTab: 'messaging',
    configKind: 'api_rcs',
    about:
      'Send rich cards, suggested replies, and branded RCS where carriers support RBM.',
    whatGetsSynced: [
      'Rich message events',
      'Carrier capability matrix',
      'Read receipts where available',
    ],
    usedBy: ['Campaigns', 'Content & Ideas'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    initials: 'SG',
    brandColor: '#1A82E2',
    shortDescription: 'Transactional and campaign email delivery',
    categoryLabel: 'Email',
    section: 'MESSAGING',
    filterTab: 'messaging',
    configKind: 'api_sendgrid',
    about:
      'Deliver email from Commerce campaigns with shared IP pools, suppression lists, and bounce handling.',
    whatGetsSynced: [
      'Delivery and bounce events',
      'Spam report signals',
      'API key usage',
    ],
    usedBy: ['Campaigns', 'Templates'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    initials: 'Rz',
    brandColor: '#3395FF',
    shortDescription: 'Payment link generation and confirmation webhook ingestion',
    categoryLabel: 'Payments',
    section: 'PAYMENTS & CONVERSIONS',
    filterTab: 'payments',
    configKind: 'api_razorpay',
    about:
      'Generate payment links from journeys and ingest paid events to attribute conversions and update CRM.',
    whatGetsSynced: [
      'Payment captured events',
      'Refund and dispute signals',
      'Settlement references',
    ],
    usedBy: ['Campaigns', 'Analytics'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'custom_payment_webhook',
    name: 'Custom Payment Webhook',
    initials: 'CP',
    brandColor: '#10B981',
    shortDescription: 'Receive payment confirmation events from any payment provider',
    categoryLabel: 'Payments',
    section: 'PAYMENTS & CONVERSIONS',
    filterTab: 'payments',
    configKind: 'webhook_inbound',
    about:
      'Point any PSP webhook at Commerce to normalize payment success payloads into contact and campaign metrics.',
    whatGetsSynced: [
      'Signed webhook payloads',
      'Mapped amount and currency',
      'Order and customer references',
    ],
    usedBy: ['Analytics', 'Audiences'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    initials: 'Gc',
    brandColor: '#4285F4',
    shortDescription: 'Appointment booking and availability check for voice agents',
    categoryLabel: 'Productivity',
    section: 'PRODUCTIVITY',
    filterTab: 'productivity',
    configKind: 'oauth',
    about:
      'Let AI agents check free/busy, book callbacks, and create events on behalf of reps.',
    whatGetsSynced: [
      'Calendar availability windows',
      'Created events with conferencing links',
      'Cancellation updates',
    ],
    usedBy: ['Agents', 'Tools'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    initials: 'Sl',
    brandColor: '#4A154B',
    shortDescription: 'Campaign alerts, performance notifications to Slack channels',
    categoryLabel: 'Productivity',
    section: 'PRODUCTIVITY',
    filterTab: 'productivity',
    configKind: 'api_slack',
    about:
      'Post campaign milestones, anomaly alerts, and daily digests to the channels your team already uses.',
    whatGetsSynced: [
      'Channel posting permissions',
      'Workspace metadata',
      'Bot token scopes',
    ],
    usedBy: ['Analytics', 'Campaigns'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    initials: 'Sh',
    brandColor: '#0F9D58',
    shortDescription: 'Export campaign reports and contact lists to Sheets',
    categoryLabel: 'Productivity',
    section: 'PRODUCTIVITY',
    filterTab: 'productivity',
    configKind: 'oauth',
    about:
      'Schedule exports of segment snapshots and campaign metrics to shared spreadsheets.',
    whatGetsSynced: [
      'Sheet tabs and named ranges',
      'Append-only export rows',
      'Share permissions via OAuth',
    ],
    usedBy: ['Reports', 'Audiences'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'outbound_webhooks',
    name: 'Outbound Webhooks',
    initials: 'Wh',
    brandColor: '#8B5CF6',
    shortDescription: 'Send real-time campaign events to your own endpoints',
    categoryLabel: 'Developer',
    section: 'DEVELOPER',
    filterTab: 'webhooks',
    configKind: 'webhook_outbound',
    about:
      'Stream Commerce events to your data warehouse or orchestration layer with signed payloads.',
    whatGetsSynced: [
      'Campaign lifecycle events',
      'Message and call outcomes',
      'Contact attribute changes',
    ],
    usedBy: ['Engineering', 'Analytics'],
    hasCrmSyncSettings: false,
  },
  {
    id: 'rest_api_access',
    name: 'REST API Access',
    initials: 'REST',
    brandColor: '#374151',
    shortDescription: 'Programmatic access to contacts, campaigns, segments, analytics',
    categoryLabel: 'Developer',
    section: 'DEVELOPER',
    filterTab: 'webhooks',
    configKind: 'rest_api',
    about:
      'Issue API keys with scoped access to automate imports, trigger campaigns, and pull analytics.',
    whatGetsSynced: [
      'API audit log entries',
      'Key rotation history',
      'Rate limit usage',
    ],
    usedBy: ['Engineering', 'All modules'],
    hasCrmSyncSettings: false,
  },
];

export const INTEGRATION_SECTION_ORDER: IntegrationSectionId[] = [
  'DATA SOURCES',
  'TELEPHONY',
  'MESSAGING',
  'PAYMENTS & CONVERSIONS',
  'PRODUCTIVITY',
  'DEVELOPER',
];

export function integrationsInSection(
  section: IntegrationSectionId,
  items: IntegrationDefinition[],
): IntegrationDefinition[] {
  return items.filter((i) => i.section === section);
}
