// Day 30 waterfalls — 4 waterfall configs in React Flow node/edge format
// Each has channel steps, wait nodes, exit nodes with performance overlay

export interface WaterfallNode {
  id: string;
  type: 'channel' | 'wait' | 'exit' | 'entry';
  position: { x: number; y: number };
  data: {
    label: string;
    channelType?: 'sms' | 'whatsapp' | 'rcs' | 'ai_voice' | 'field_executive';
    waitHours?: number;
    performance?: {
      sent?: number;
      converted?: number;
      conversionRate?: number;
      dropOffRate?: number;
      cost?: number;
    };
  };
}

export interface WaterfallEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: {
    condition?: string;
    userCount?: number;
  };
}

export interface WaterfallConfig {
  id: string;
  name: string;
  campaignId: string;
  nodes: WaterfallNode[];
  edges: WaterfallEdge[];
}

export const day30Waterfalls: WaterfallConfig[] = [
  // 1. KYC Re-engagement: WhatsApp → (72h) → AI Voice → (48h) → Field Executive
  {
    id: 'wf-kyc-reengagement',
    name: 'KYC Re-engagement Waterfall',
    campaignId: 'cmp-kyc-reengagement',
    nodes: [
      {
        id: 'wf1-entry',
        type: 'entry',
        position: { x: 250, y: 0 },
        data: {
          label: 'Audience Entry',
          performance: { sent: 43200, conversionRate: 100, dropOffRate: 0 },
        },
      },
      {
        id: 'wf1-wa',
        type: 'channel',
        position: { x: 250, y: 120 },
        data: {
          label: 'WhatsApp — KYC Reminder',
          channelType: 'whatsapp',
          performance: {
            sent: 43200,
            converted: 5400,
            conversionRate: 12.5,
            dropOffRate: 0,
            cost: 28080,
          },
        },
      },
      {
        id: 'wf1-wait1',
        type: 'wait',
        position: { x: 250, y: 240 },
        data: {
          label: 'Wait 72 hours',
          waitHours: 72,
        },
      },
      {
        id: 'wf1-voice',
        type: 'channel',
        position: { x: 250, y: 360 },
        data: {
          label: 'AI Voice Call — KYC Assistance',
          channelType: 'ai_voice',
          performance: {
            sent: 14200,
            converted: 2160,
            conversionRate: 15.2,
            dropOffRate: 62.4,
            cost: 35500,
          },
        },
      },
      {
        id: 'wf1-wait2',
        type: 'wait',
        position: { x: 250, y: 480 },
        data: {
          label: 'Wait 48 hours',
          waitHours: 48,
        },
      },
      {
        id: 'wf1-field',
        type: 'channel',
        position: { x: 250, y: 600 },
        data: {
          label: 'Field Executive — In-Person KYC',
          channelType: 'field_executive',
          performance: {
            sent: 3800,
            converted: 1080,
            conversionRate: 28.4,
            dropOffRate: 73.2,
            cost: 171000,
          },
        },
      },
      {
        id: 'wf1-exit-converted',
        type: 'exit',
        position: { x: 100, y: 360 },
        data: {
          label: 'Converted — KYC Complete',
          performance: { converted: 8640, conversionRate: 20.0 },
        },
      },
      {
        id: 'wf1-exit-exhausted',
        type: 'exit',
        position: { x: 400, y: 720 },
        data: {
          label: 'Exhausted — No Response',
          performance: { sent: 2720, dropOffRate: 6.3 },
        },
      },
    ],
    edges: [
      { id: 'wf1-e1', source: 'wf1-entry', target: 'wf1-wa', label: 'All users', data: { userCount: 43200 } },
      { id: 'wf1-e2', source: 'wf1-wa', target: 'wf1-exit-converted', label: 'Converted', data: { condition: 'kyc_completed = true', userCount: 5400 } },
      { id: 'wf1-e3', source: 'wf1-wa', target: 'wf1-wait1', label: 'No response', data: { condition: 'no_open OR no_click after 72h', userCount: 37800 } },
      { id: 'wf1-e4', source: 'wf1-wait1', target: 'wf1-voice', data: { userCount: 14200 } },
      { id: 'wf1-e5', source: 'wf1-voice', target: 'wf1-exit-converted', label: 'Converted', data: { condition: 'kyc_completed = true', userCount: 2160 } },
      { id: 'wf1-e6', source: 'wf1-voice', target: 'wf1-wait2', label: 'No response', data: { condition: 'call_outcome != positive after 48h', userCount: 12040 } },
      { id: 'wf1-e7', source: 'wf1-wait2', target: 'wf1-field', data: { userCount: 3800 } },
      { id: 'wf1-e8', source: 'wf1-field', target: 'wf1-exit-converted', label: 'Converted', data: { condition: 'kyc_completed = true', userCount: 1080 } },
      { id: 'wf1-e9', source: 'wf1-field', target: 'wf1-exit-exhausted', label: 'No conversion', data: { userCount: 2720 } },
    ],
  },

  // 2. Credit Card Activation: SMS → (48h) → WhatsApp → (72h) → AI Voice → (48h) → Field Executive
  {
    id: 'wf-cc-activation',
    name: 'Credit Card Activation Waterfall',
    campaignId: 'cmp-cc-activation',
    nodes: [
      {
        id: 'wf2-entry',
        type: 'entry',
        position: { x: 300, y: 0 },
        data: {
          label: 'Audience Entry',
          performance: { sent: 27200, conversionRate: 100, dropOffRate: 0 },
        },
      },
      {
        id: 'wf2-sms',
        type: 'channel',
        position: { x: 300, y: 120 },
        data: {
          label: 'SMS — Activation Link',
          channelType: 'sms',
          performance: {
            sent: 27200,
            converted: 2240,
            conversionRate: 8.2,
            dropOffRate: 0,
            cost: 6800,
          },
        },
      },
      {
        id: 'wf2-wait1',
        type: 'wait',
        position: { x: 300, y: 240 },
        data: {
          label: 'Wait 48 hours',
          waitHours: 48,
        },
      },
      {
        id: 'wf2-wa',
        type: 'channel',
        position: { x: 300, y: 360 },
        data: {
          label: 'WhatsApp — Activation Guide',
          channelType: 'whatsapp',
          performance: {
            sent: 15200,
            converted: 2800,
            conversionRate: 18.4,
            dropOffRate: 39.0,
            cost: 9880,
          },
        },
      },
      {
        id: 'wf2-wait2',
        type: 'wait',
        position: { x: 300, y: 480 },
        data: {
          label: 'Wait 72 hours',
          waitHours: 72,
        },
      },
      {
        id: 'wf2-voice',
        type: 'channel',
        position: { x: 300, y: 600 },
        data: {
          label: 'AI Voice Call — Activation Support',
          channelType: 'ai_voice',
          performance: {
            sent: 7600,
            converted: 2240,
            conversionRate: 29.5,
            dropOffRate: 50.0,
            cost: 19000,
          },
        },
      },
      {
        id: 'wf2-wait3',
        type: 'wait',
        position: { x: 300, y: 720 },
        data: {
          label: 'Wait 48 hours',
          waitHours: 48,
        },
      },
      {
        id: 'wf2-field',
        type: 'channel',
        position: { x: 300, y: 840 },
        data: {
          label: 'Field Executive — In-Person Activation',
          channelType: 'field_executive',
          performance: {
            sent: 2800,
            converted: 1680,
            conversionRate: 60.0,
            dropOffRate: 63.2,
            cost: 126000,
          },
        },
      },
      {
        id: 'wf2-exit-converted',
        type: 'exit',
        position: { x: 100, y: 480 },
        data: {
          label: 'Converted — Card Activated',
          performance: { converted: 8960, conversionRate: 32.9 },
        },
      },
      {
        id: 'wf2-exit-exhausted',
        type: 'exit',
        position: { x: 500, y: 960 },
        data: {
          label: 'Exhausted — Not Activated',
          performance: { sent: 1120, dropOffRate: 4.1 },
        },
      },
    ],
    edges: [
      { id: 'wf2-e1', source: 'wf2-entry', target: 'wf2-sms', label: 'All users', data: { userCount: 27200 } },
      { id: 'wf2-e2', source: 'wf2-sms', target: 'wf2-exit-converted', label: 'Activated', data: { condition: 'card_activated = true', userCount: 2240 } },
      { id: 'wf2-e3', source: 'wf2-sms', target: 'wf2-wait1', label: 'Not activated', data: { condition: 'card_activated = false after 48h', userCount: 24960 } },
      { id: 'wf2-e4', source: 'wf2-wait1', target: 'wf2-wa', data: { userCount: 15200 } },
      { id: 'wf2-e5', source: 'wf2-wa', target: 'wf2-exit-converted', label: 'Activated', data: { condition: 'card_activated = true', userCount: 2800 } },
      { id: 'wf2-e6', source: 'wf2-wa', target: 'wf2-wait2', label: 'Not activated', data: { condition: 'card_activated = false after 72h', userCount: 12400 } },
      { id: 'wf2-e7', source: 'wf2-wait2', target: 'wf2-voice', data: { userCount: 7600 } },
      { id: 'wf2-e8', source: 'wf2-voice', target: 'wf2-exit-converted', label: 'Activated', data: { condition: 'card_activated = true', userCount: 2240 } },
      { id: 'wf2-e9', source: 'wf2-voice', target: 'wf2-wait3', label: 'Not activated', data: { condition: 'call_outcome != activated after 48h', userCount: 5360 } },
      { id: 'wf2-e10', source: 'wf2-wait3', target: 'wf2-field', data: { userCount: 2800 } },
      { id: 'wf2-e11', source: 'wf2-field', target: 'wf2-exit-converted', label: 'Activated', data: { condition: 'card_activated = true', userCount: 1680 } },
      { id: 'wf2-e12', source: 'wf2-field', target: 'wf2-exit-exhausted', label: 'Not converted', data: { userCount: 1120 } },
    ],
  },

  // 3. Insurance Renewal: WhatsApp → (72h) → AI Voice
  {
    id: 'wf-insurance-renewal',
    name: 'Insurance Renewal Waterfall',
    campaignId: 'cmp-insurance-renewal',
    nodes: [
      {
        id: 'wf3-entry',
        type: 'entry',
        position: { x: 250, y: 0 },
        data: {
          label: 'Audience Entry',
          performance: { sent: 30400, conversionRate: 100, dropOffRate: 0 },
        },
      },
      {
        id: 'wf3-wa',
        type: 'channel',
        position: { x: 250, y: 120 },
        data: {
          label: 'WhatsApp — Renewal Reminder',
          channelType: 'whatsapp',
          performance: {
            sent: 30400,
            converted: 3200,
            conversionRate: 10.5,
            dropOffRate: 0,
            cost: 19760,
          },
        },
      },
      {
        id: 'wf3-wait1',
        type: 'wait',
        position: { x: 250, y: 240 },
        data: {
          label: 'Wait 72 hours',
          waitHours: 72,
        },
      },
      {
        id: 'wf3-voice',
        type: 'channel',
        position: { x: 250, y: 360 },
        data: {
          label: 'AI Voice Call — Renewal Assistance',
          channelType: 'ai_voice',
          performance: {
            sent: 9600,
            converted: 1600,
            conversionRate: 16.7,
            dropOffRate: 64.7,
            cost: 24000,
          },
        },
      },
      {
        id: 'wf3-exit-converted',
        type: 'exit',
        position: { x: 80, y: 240 },
        data: {
          label: 'Converted — Policy Renewed',
          performance: { converted: 4800, conversionRate: 15.8 },
        },
      },
      {
        id: 'wf3-exit-expired',
        type: 'exit',
        position: { x: 420, y: 480 },
        data: {
          label: 'Not Renewed — Follow-up Required',
          performance: { sent: 8000, dropOffRate: 26.3 },
        },
      },
    ],
    edges: [
      { id: 'wf3-e1', source: 'wf3-entry', target: 'wf3-wa', label: 'All users', data: { userCount: 30400 } },
      { id: 'wf3-e2', source: 'wf3-wa', target: 'wf3-exit-converted', label: 'Renewed', data: { condition: 'policy_renewed = true', userCount: 3200 } },
      { id: 'wf3-e3', source: 'wf3-wa', target: 'wf3-wait1', label: 'Not renewed', data: { condition: 'policy_renewed = false after 72h', userCount: 27200 } },
      { id: 'wf3-e4', source: 'wf3-wait1', target: 'wf3-voice', data: { userCount: 9600 } },
      { id: 'wf3-e5', source: 'wf3-voice', target: 'wf3-exit-converted', label: 'Renewed', data: { condition: 'policy_renewed = true', userCount: 1600 } },
      { id: 'wf3-e6', source: 'wf3-voice', target: 'wf3-exit-expired', label: 'Not renewed', data: { userCount: 8000 } },
    ],
  },

  // 4. EMI Collection: AI Voice → (48h) → SMS → (72h) → Field Executive
  {
    id: 'wf-emi-collection',
    name: 'EMI Collection Waterfall',
    campaignId: 'cmp-emi-collection',
    nodes: [
      {
        id: 'wf4-entry',
        type: 'entry',
        position: { x: 250, y: 0 },
        data: {
          label: 'Audience Entry',
          performance: { sent: 39360, conversionRate: 100, dropOffRate: 0 },
        },
      },
      {
        id: 'wf4-voice',
        type: 'channel',
        position: { x: 250, y: 120 },
        data: {
          label: 'AI Voice Call — EMI Reminder',
          channelType: 'ai_voice',
          performance: {
            sent: 39360,
            converted: 8200,
            conversionRate: 20.8,
            dropOffRate: 0,
            cost: 98400,
          },
        },
      },
      {
        id: 'wf4-wait1',
        type: 'wait',
        position: { x: 250, y: 240 },
        data: {
          label: 'Wait 48 hours',
          waitHours: 48,
        },
      },
      {
        id: 'wf4-sms',
        type: 'channel',
        position: { x: 250, y: 360 },
        data: {
          label: 'SMS — Payment Link',
          channelType: 'sms',
          performance: {
            sent: 18400,
            converted: 3280,
            conversionRate: 17.8,
            dropOffRate: 40.9,
            cost: 4600,
          },
        },
      },
      {
        id: 'wf4-wait2',
        type: 'wait',
        position: { x: 250, y: 480 },
        data: {
          label: 'Wait 72 hours',
          waitHours: 72,
        },
      },
      {
        id: 'wf4-field',
        type: 'channel',
        position: { x: 250, y: 600 },
        data: {
          label: 'Field Executive — Collection Visit',
          channelType: 'field_executive',
          performance: {
            sent: 5200,
            converted: 3280,
            conversionRate: 63.1,
            dropOffRate: 65.6,
            cost: 234000,
          },
        },
      },
      {
        id: 'wf4-exit-collected',
        type: 'exit',
        position: { x: 80, y: 360 },
        data: {
          label: 'Collected — EMI Paid',
          performance: { converted: 14760, conversionRate: 37.5 },
        },
      },
      {
        id: 'wf4-exit-defaulted',
        type: 'exit',
        position: { x: 420, y: 720 },
        data: {
          label: 'Not Collected — Escalate to Legal',
          performance: { sent: 1920, dropOffRate: 4.9 },
        },
      },
    ],
    edges: [
      { id: 'wf4-e1', source: 'wf4-entry', target: 'wf4-voice', label: 'All users', data: { userCount: 39360 } },
      { id: 'wf4-e2', source: 'wf4-voice', target: 'wf4-exit-collected', label: 'Paid', data: { condition: 'emi_paid = true', userCount: 8200 } },
      { id: 'wf4-e3', source: 'wf4-voice', target: 'wf4-wait1', label: 'Not paid', data: { condition: 'emi_paid = false after 48h', userCount: 31160 } },
      { id: 'wf4-e4', source: 'wf4-wait1', target: 'wf4-sms', data: { userCount: 18400 } },
      { id: 'wf4-e5', source: 'wf4-sms', target: 'wf4-exit-collected', label: 'Paid', data: { condition: 'emi_paid = true', userCount: 3280 } },
      { id: 'wf4-e6', source: 'wf4-sms', target: 'wf4-wait2', label: 'Not paid', data: { condition: 'emi_paid = false after 72h', userCount: 15120 } },
      { id: 'wf4-e7', source: 'wf4-wait2', target: 'wf4-field', data: { userCount: 5200 } },
      { id: 'wf4-e8', source: 'wf4-field', target: 'wf4-exit-collected', label: 'Paid', data: { condition: 'emi_paid = true', userCount: 3280 } },
      { id: 'wf4-e9', source: 'wf4-field', target: 'wf4-exit-defaulted', label: 'Defaulted', data: { userCount: 1920 } },
    ],
  },
];
