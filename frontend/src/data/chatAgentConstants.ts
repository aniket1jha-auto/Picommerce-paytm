import type { ChatChannelId, InstructionStep } from '@/types/agent';

export const CHAT_CHANNELS: { id: ChatChannelId; label: string; icon: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp Business', icon: '💬' },
  { id: 'sms', label: 'SMS', icon: '📱' },
  { id: 'rcs', label: 'RCS', icon: '🔵' },
  { id: 'webhook', label: 'Custom Webhook', icon: '🌐' },
];

/** Step 2 channel cards (agent builder — identity step) */
export const CHAT_CHANNEL_IDENTITY_CARDS: {
  id: ChatChannelId;
  icon: string;
  label: string;
  description: string;
}[] = [
  {
    id: 'whatsapp',
    icon: '💬',
    label: 'WhatsApp Business',
    description: 'Handles replies to your WhatsApp outbound campaigns',
  },
  {
    id: 'sms',
    icon: '📱',
    label: 'SMS',
    description: 'Handles SMS replies',
  },
  {
    id: 'rcs',
    icon: '🔵',
    label: 'RCS',
    description: 'Rich Communication Services',
  },
  {
    id: 'webhook',
    icon: '🌐',
    label: 'Custom Webhook',
    description: 'Connect any messaging source via webhook',
  },
];

export const MOCK_WHATSAPP_WABA_ACCOUNTS = [{ id: 'wa-1', label: 'Paytm Business — Primary WABA' }];
export const MOCK_WHATSAPP_PHONE_NUMBERS = [{ id: 'ph-1', label: '+91 98765 43210 (verified)' }];

export const CHAT_USE_CASES: { id: string; label: string; icon: string }[] = [
  { id: 'inbound_support', label: 'Inbound Support', icon: '💬' },
  { id: 'recovery_followup', label: 'Recovery Follow-up', icon: '🔁' },
  { id: 'order_queries', label: 'Order Queries', icon: '🛒' },
  { id: 'kyc_assistance', label: 'KYC Assistance', icon: '📋' },
  { id: 'appointment_booking', label: 'Appointment Booking', icon: '📅' },
  { id: 'lead_qualification', label: 'Lead Qualification', icon: '🎯' },
  { id: 'payment_queries', label: 'Payment Queries', icon: '🧾' },
  { id: 'custom', label: 'Custom', icon: '✍️' },
];

export const CHAT_LANGUAGES: { id: string; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'hinglish', label: 'Hinglish' },
  { id: 'ta', label: 'Tamil' },
  { id: 'te', label: 'Telugu' },
  { id: 'kn', label: 'Kannada' },
  { id: 'ml', label: 'Malayalam' },
  { id: 'mr', label: 'Marathi' },
  { id: 'auto', label: 'Auto-detect' },
];

function newStepId(): string {
  return `step_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Spec default for Recovery Follow-up + WhatsApp */
export function defaultRecoveryWhatsAppInstructionSteps(): InstructionStep[] {
  return [
    {
      id: newStepId(),
      instruction:
        'Greet the customer and acknowledge their reply to our recent payment reminder message.',
      transitionCondition: '',
      attachedToolIds: [],
      quickReplies: [],
    },
    {
      id: newStepId(),
      instruction:
        'Confirm their identity — ask for the last 4 digits of their registered mobile number.',
      transitionCondition: 'e.g. Move to next step once identity is confirmed',
      attachedToolIds: [],
      quickReplies: [],
    },
    {
      id: newStepId(),
      instruction:
        'Based on their query: share the outstanding amount, send a payment link, or offer a callback.',
      transitionCondition: '',
      attachedToolIds: [],
      quickReplies: ['Pay Now', 'Need help', 'Callback'],
    },
    {
      id: newStepId(),
      instruction:
        'If they confirm payment, send the payment link and close the conversation warmly.',
      transitionCondition: '',
      attachedToolIds: [],
      quickReplies: [],
    },
  ];
}

export function genericChatInstructionSteps(): InstructionStep[] {
  return [
    {
      id: newStepId(),
      instruction: 'Greet the customer and state the purpose of the conversation clearly.',
      transitionCondition: '',
      attachedToolIds: [],
      quickReplies: [],
    },
    {
      id: newStepId(),
      instruction: 'Gather the information you need to help, one question at a time.',
      transitionCondition: '',
      attachedToolIds: [],
      quickReplies: [],
    },
    {
      id: newStepId(),
      instruction: 'Resolve the request or escalate, then confirm next steps and close politely.',
      transitionCondition: '',
      attachedToolIds: [],
      quickReplies: [],
    },
  ];
}

export function instructionStepsForUseCase(useCase: string, channel: string): InstructionStep[] {
  if (useCase === 'recovery_followup' && channel === 'whatsapp') {
    return defaultRecoveryWhatsAppInstructionSteps();
  }
  return genericChatInstructionSteps();
}

export function chatUseCaseLabel(id: string): string {
  return CHAT_USE_CASES.find((u) => u.id === id)?.label ?? id;
}

export function chatChannelLabel(id: string): string {
  return CHAT_CHANNELS.find((c) => c.id === id)?.label ?? id;
}

export function chatLanguageLabels(ids: string[]): string {
  return ids
    .map((id) => CHAT_LANGUAGES.find((l) => l.id === id)?.label ?? id)
    .join(' · ');
}
