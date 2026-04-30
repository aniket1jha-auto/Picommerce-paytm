import type { JourneyNodeKind, JourneyNodeData, JourneyNodeBase, JourneyFlowNode } from './journeyTypes';
import { newNodeId } from './journeyTypes';
import { makeInitialVariant } from '@/components/campaign/ChannelContentEditor';
import type { ChannelType } from '@/types';

const DEFAULT_TESTING = { enabled: false, randomnessFactor: 30 } as const;

function messagingDefaults(channel: ChannelType) {
  return {
    variants: [makeInitialVariant(channel)],
    testing: { ...DEFAULT_TESTING },
  };
}

export interface PaletteItem {
  kind: JourneyNodeKind;
  icon: string;
  label: string;
  description: string;
  group: string;
}

/** AI Voice — outcome branches per product spec */
export const VOICE_OUTPUT_HANDLES = [
  { id: 'answered', label: 'Answered', color: 'bg-emerald-500' },
  { id: 'not_answered', label: 'Not Answered', color: 'bg-gray-400' },
  { id: 'interested', label: 'Interested', color: 'bg-emerald-600' },
  { id: 'not_interested', label: 'Not Interested', color: 'bg-red-500' },
  { id: 'callback_requested', label: 'Callback Requested', color: 'bg-blue-500' },
] as const;

export const CHAT_OUTPUT_HANDLES = [
  { id: 'interested', label: 'Interested', color: 'bg-emerald-500' },
  { id: 'not_interested', label: 'Not Interested', color: 'bg-red-500' },
  { id: 'query_raised', label: 'Query Raised', color: 'bg-blue-500' },
  { id: 'no_response', label: 'No Response', color: 'bg-gray-400' },
] as const;

/** Journey canvas palette — Phase 4 reduced set (10 draggable types).
 * Triggers (Entry / Exit) are structural and not in the palette.
 * Cut from v1: in_app, api_webhook, note, goto, update_contact, crm_sync.
 * Existing journeys still load these kinds via the generic LogicNode renderer; they
 * just aren't surfaced for new placement. */
export const JOURNEY_PALETTE_GROUPS: { title: string; items: PaletteItem[] }[] = [
  {
    title: 'Messages',
    items: [
      { kind: 'sms', icon: '📱', label: 'SMS', description: 'One-way text message', group: 'Messaging' },
      { kind: 'whatsapp_message', icon: '💬', label: 'WhatsApp', description: 'Template message via WABA', group: 'Messaging' },
      { kind: 'email', icon: '📧', label: 'Email', description: 'Transactional or marketing email', group: 'Messaging' },
      { kind: 'rcs_message', icon: '🔵', label: 'RCS', description: 'Rich-card message on Android', group: 'Messaging' },
      { kind: 'push', icon: '🔔', label: 'Push', description: 'App or browser push', group: 'Messaging' },
    ],
  },
  {
    title: 'AI Agents',
    items: [
      {
        kind: 'voice_agent',
        icon: '📞',
        label: 'Voice Agent',
        description: 'Outbound conversational call',
        group: 'Agents',
      },
      {
        kind: 'chat_agent',
        icon: '🗨',
        label: 'Chat Agent',
        description: 'Inbound WhatsApp / in-app chat',
        group: 'Agents',
      },
    ],
  },
  {
    title: 'Logic',
    items: [
      { kind: 'wait', icon: '⏱', label: 'Wait', description: 'Pause for duration or event', group: 'Logic' },
      { kind: 'condition', icon: '⚙', label: 'Condition', description: 'Branch on attribute or event', group: 'Logic' },
      { kind: 'ab_split', icon: '🔀', label: 'Split', description: 'A/B/N traffic allocation', group: 'Logic' },
    ],
  },
];

export const PALETTE_GROUPS = JOURNEY_PALETTE_GROUPS;

const TYPE_LABELS: Partial<Record<JourneyNodeKind, string>> = {
  entry_trigger: 'Entry Trigger',
  campaign_start: 'Campaign Start',
  event_trigger: 'Event Trigger',
  schedule_trigger: 'Schedule',
  re_entry: 'Re-entry',
  whatsapp_message: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
  push: 'Push',
  rcs_message: 'RCS',
  in_app: 'In-App',
  voice_agent: 'AI Voice Agent',
  chat_agent: 'AI Chat Agent',
  condition: 'Condition',
  ab_split: 'A/B Split',
  wait: 'Wait',
  exit: 'Exit',
  goto: 'Go To',
  api_webhook: 'API / Webhook',
  update_contact: 'Update Contact',
  crm_sync: 'CRM Sync',
  note: 'Note',
};

export function defaultDataForKind(kind: JourneyNodeKind, label?: string): JourneyNodeData {
  const base = (l: string, configured: boolean): JourneyNodeBase => ({
    kind,
    label: l,
    typeLabel: TYPE_LABELS[kind] ?? kind,
    icon: JOURNEY_PALETTE_GROUPS.flatMap((g) => g.items).find((i) => i.kind === kind)?.icon ?? '●',
    configured,
    needsConfig: !configured,
  });

  switch (kind) {
    case 'entry_trigger':
      return {
        ...base(label ?? 'Entry', true),
        kind: 'entry_trigger',
        icon: '🎯',
        when: 'campaign_start',
        startDate: '',
        startTime: '10:00',
        eventName: '',
        recurringFrequency: 'weekly',
        recurringDay: 'monday',
        recurringTime: '10:00',
      };
    case 'voice_agent':
      return {
        ...base(label ?? 'AI Voice Agent', false),
        kind: 'voice_agent',
        agentId: null,
        callScriptRef: '',
        callingWindowStart: '10:00',
        callingWindowEnd: '18:00',
        maxAttempts: 2,
        retryInterval: '4h',
        timezone: 'Asia/Kolkata',
        dispositionLabels: Object.fromEntries(VOICE_OUTPUT_HANDLES.map((h) => [h.id, h.label])),
        recordCalls: true,
        storeTranscript: true,
      };
    case 'chat_agent':
      return {
        ...base(label ?? 'AI Chat Agent', false),
        kind: 'chat_agent',
        agentId: null,
        deployChannel: 'whatsapp_chat',
        triggerMode: 'immediate',
        afterDeliveryMinutes: 5,
        sessionTimeoutHours: 24,
        outputLabels: Object.fromEntries(CHAT_OUTPUT_HANDLES.map((h) => [h.id, h.label])),
      };
    case 'whatsapp_message':
      return {
        ...base(label ?? 'WhatsApp', false),
        kind: 'whatsapp_message',
        ...messagingDefaults('whatsapp'),
        templateId: null,
        variableMap: {},
        sendTiming: 'immediate',
        scheduledTime: '10:00',
        scheduledTz: 'Asia/Kolkata',
      };
    case 'sms':
      return {
        ...base(label ?? 'SMS', false),
        kind: 'sms',
        ...messagingDefaults('sms'),
        mode: 'template',
        templateId: null,
        customBody: '',
        variableMap: {},
        dltTemplateId: '',
      };
    case 'email':
      return {
        ...base(label ?? 'Email', false),
        kind: 'email',
        ...messagingDefaults('push_notification'),
      };
    case 'push':
      return {
        ...base(label ?? 'Push', false),
        kind: 'push',
        ...messagingDefaults('push_notification'),
      };
    case 'rcs_message':
      return {
        ...base(label ?? 'RCS', false),
        kind: 'rcs_message',
        ...messagingDefaults('rcs'),
      };
    case 'in_app':
      return {
        ...base(label ?? 'In-App', false),
        kind: 'in_app',
        ...messagingDefaults('in_app_banner'),
      };
    case 'wait':
      return {
        ...base(label ?? 'Wait', false),
        kind: 'wait',
        waitType: 'duration',
        durationValue: 24,
        durationUnit: 'hours',
        untilDate: '',
        untilTime: '10:00',
        eventKey: 'payment_made',
        eventTimeoutDays: 7,
        optimalMaxValue: 72,
        optimalMaxUnit: 'hours',
      };
    case 'condition':
      return {
        ...base(label ?? 'Condition', false),
        kind: 'condition',
        conditions: [{ attribute: 'dpd_bucket', operator: 'equals', value: '30-60' }],
        logic: 'and',
        pathLabels: ['True', 'False'],
      };
    case 'ab_split':
      return {
        ...base(label ?? 'A/B Split', false),
        kind: 'ab_split',
        variantCount: 2,
        customCount: 3,
        variants: [
          { label: 'Variant A', percent: 50 },
          { label: 'Variant B', percent: 50 },
        ],
        holdoutEnabled: false,
        holdoutPercent: 0,
        winnerMode: 'manual',
        autoConfidence: 95,
        winnerMetric: 'conversion',
      };
    case 'api_webhook':
      return {
        ...base(label ?? 'API Call', false),
        kind: 'api_webhook',
        method: 'POST',
        url: '',
        headers: [],
        bodyJson: '{}',
        responseMap: [],
        onFailure: 'continue',
      };
    case 'update_contact':
      return {
        ...base(label ?? 'Update Contact', false),
        kind: 'update_contact',
        updates: [{ attribute: 'tags', value: 'journey_active', mode: 'append' }],
      };
    case 'campaign_start':
      return { ...base(label ?? 'Campaign Start', true), kind: 'campaign_start' };
    case 'event_trigger':
      return { ...base(label ?? 'Event Trigger', true), kind: 'event_trigger' };
    case 'schedule_trigger':
      return { ...base(label ?? 'Schedule', true), kind: 'schedule_trigger' };
    case 're_entry':
      return { ...base(label ?? 'Re-entry', true), kind: 're_entry' };
    case 'exit':
      return { ...base(label ?? 'Exit', true), kind: 'exit' };
    case 'goto':
      return { ...base(label ?? 'Go To', false), kind: 'goto' };
    case 'note':
      return { ...base(label ?? 'Note', true), kind: 'note' };
    case 'crm_sync':
      return { ...base(label ?? 'CRM Sync', false), kind: 'crm_sync' };
  }
}

export function createJourneyNode(kind: JourneyNodeKind, position: { x: number; y: number }): JourneyFlowNode {
  return {
    id: newNodeId(),
    type: 'journeyNode',
    position,
    deletable: kind !== 'entry_trigger',
    data: defaultDataForKind(kind) as unknown as Record<string, unknown>,
  };
}
