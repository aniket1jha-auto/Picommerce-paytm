import type { VoiceOption, ModelOption } from '@/types/agent';

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'alloy',
    name: 'Alloy',
    description: 'Neutral, balanced voice suitable for professional settings',
    characteristics: ['Professional', 'Clear', 'Versatile'],
  },
  {
    id: 'ash',
    name: 'Ash',
    description: 'Clear and articulate voice with excellent pronunciation',
    characteristics: ['Articulate', 'Precise', 'Professional'],
  },
  {
    id: 'ballad',
    name: 'Ballad',
    description: 'Warm and expressive voice with emotional depth',
    characteristics: ['Warm', 'Expressive', 'Engaging'],
  },
  {
    id: 'coral',
    name: 'Coral',
    description: 'Bright and energetic voice perfect for sales and support',
    characteristics: ['Energetic', 'Friendly', 'Enthusiastic'],
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Deep and resonant voice that commands attention',
    characteristics: ['Authoritative', 'Confident', 'Deep'],
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Professional and calm voice ideal for customer service',
    characteristics: ['Calm', 'Reassuring', 'Professional'],
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Friendly and upbeat voice that creates positive experiences',
    characteristics: ['Upbeat', 'Cheerful', 'Approachable'],
  },
  {
    id: 'verse',
    name: 'Verse',
    description: 'Conversational and natural voice for authentic interactions',
    characteristics: ['Natural', 'Conversational', 'Relatable'],
  },
  {
    id: 'cedar',
    name: 'Cedar',
    description: 'Mature and trustworthy voice for building confidence',
    characteristics: ['Trustworthy', 'Mature', 'Reliable'],
  },
  {
    id: 'marin',
    name: 'Marin',
    description: 'Smooth and confident voice for leadership scenarios',
    characteristics: ['Confident', 'Smooth', 'Persuasive'],
  },
];

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gpt-realtime',
    name: 'GPT Realtime',
    description: 'Latest model with best quality and natural speech generation',
    features: ['Highest quality', 'Best instruction adherence', 'Advanced tool calling'],
    costMultiplier: 1.5,
  },
  {
    id: 'gpt-realtime-mini',
    name: 'GPT Realtime Mini',
    description: 'Faster and more cost-effective while maintaining good quality',
    features: ['Fast response', 'Cost-effective', 'Good quality'],
    costMultiplier: 1.0,
  },
  {
    id: 'gpt-realtime-mini-2025-12-15',
    name: 'GPT Realtime Mini (Dec 2025)',
    description: 'December 2025 version with stability improvements',
    features: ['Stable', 'Reliable', 'Production-ready'],
    costMultiplier: 1.0,
  },
  {
    id: 'gpt-realtime-1.5-2026-02-23',
    name: 'GPT Realtime 1.5',
    description: 'Latest 1.5 version with enhanced capabilities',
    features: ['Enhanced reasoning', 'Better context handling', 'Improved accuracy'],
    costMultiplier: 1.3,
  },
];

export const USE_CASE_OPTIONS = [
  { id: 'sales', label: 'Sales Outreach', icon: '💰' },
  { id: 'support', label: 'Customer Support', icon: '🎧' },
  { id: 'receptionist', label: 'Receptionist', icon: '📞' },
  { id: 'survey', label: 'Survey & Feedback', icon: '📊' },
  { id: 'appointment', label: 'Appointment Booking', icon: '📅' },
  { id: 'lead_qualification', label: 'Lead Qualification', icon: '🎯' },
  { id: 'collections', label: 'Collections', icon: '💳' },
  { id: 'notification', label: 'Notifications', icon: '🔔' },
  { id: 'custom', label: 'Custom', icon: '⚙️' },
];

export const PERSONALITY_TRAITS = [
  'Professional',
  'Friendly',
  'Empathetic',
  'Enthusiastic',
  'Patient',
  'Concise',
  'Detailed',
  'Humorous',
  'Serious',
  'Calm',
  'Energetic',
  'Formal',
];

export const TONE_OPTIONS = [
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'enthusiastic', label: 'Enthusiastic' },
  { id: 'empathetic', label: 'Empathetic' },
];

export const BUILT_IN_TOOLS = [
  {
    id: 'calendar_booking',
    name: 'Calendar Booking',
    description: 'Schedule appointments and check availability',
    icon: '📅',
  },
  {
    id: 'data_lookup',
    name: 'Data Lookup',
    description: 'Query customer data and records',
    icon: '🔍',
  },
  {
    id: 'crm_integration',
    name: 'CRM Integration',
    description: 'Create and update CRM records',
    icon: '📊',
  },
  {
    id: 'sms_email',
    name: 'SMS/Email Sending',
    description: 'Send follow-up messages',
    icon: '📧',
  },
  {
    id: 'payment_processing',
    name: 'Payment Processing',
    description: 'Process payments and refunds',
    icon: '💳',
  },
];

export const LANGUAGE_OPTIONS = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'zh-CN', label: 'Chinese (Mandarin)' },
  { code: 'ja-JP', label: 'Japanese' },
];

export const PROMPT_TEMPLATES = [
  {
    id: 'sales_outreach',
    name: 'Sales Outreach',
    useCase: 'sales',
    systemPrompt: `You are a professional sales representative calling on behalf of [COMPANY_NAME]. Your goal is to introduce [PRODUCT/SERVICE] and schedule a demo with qualified prospects.

Key Responsibilities:
- Introduce yourself and the company professionally
- Quickly identify if the prospect is the decision-maker
- Highlight key benefits relevant to their industry
- Handle objections with empathy and facts
- Schedule a demo or follow-up call

Personality: Professional, enthusiastic, and consultative. Listen actively and adapt your pitch based on prospect responses.

Guidelines:
- Keep calls under 5 minutes
- Don't be pushy; focus on value
- If not interested, thank them and end politely
- Capture reason for rejection for follow-up`,
  },
  {
    id: 'customer_support',
    name: 'Customer Support',
    useCase: 'support',
    systemPrompt: `You are a helpful customer support agent for [COMPANY_NAME]. Your goal is to resolve customer issues efficiently while maintaining a positive experience.

Key Responsibilities:
- Greet customers warmly and gather their issue details
- Look up account information when needed
- Provide clear troubleshooting steps
- Escalate to human agents when necessary
- Follow up to ensure resolution

Personality: Patient, empathetic, and solution-oriented. Make customers feel heard and valued.

Guidelines:
- Use positive language even for negative situations
- Apologize sincerely for inconveniences
- Provide specific timelines, not vague promises
- Always confirm resolution before ending call`,
  },
  {
    id: 'appointment_booking',
    name: 'Appointment Booking',
    useCase: 'appointment',
    systemPrompt: `You are an appointment scheduling assistant for [COMPANY_NAME]. Your goal is to efficiently book appointments while providing excellent service.

Key Responsibilities:
- Verify caller identity and reason for appointment
- Check availability and offer suitable time slots
- Collect necessary information (name, contact, preferences)
- Send confirmation with appointment details
- Handle rescheduling and cancellations

Personality: Organized, friendly, and efficient. Make booking process smooth and hassle-free.

Guidelines:
- Offer 2-3 time slot options
- Confirm all details before finalizing
- Provide clear instructions for appointment day
- Ask about special requirements or accessibility needs`,
  },
];
