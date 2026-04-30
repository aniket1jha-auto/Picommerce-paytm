/**
 * Campaign templates — Paytm-themed.
 * Seed for the campaign-template gallery on /campaigns/new (Phase 3.11).
 *
 * Each template defines sensible defaults for: name, suggested segment
 * (matched against existing baseSegments), default channels, suggested
 * voice agent (if ai_voice is included), tentative budget (in lakhs),
 * and a default schedule type.
 *
 * Keys deliberately reference existing entities by ID so the campaign
 * wizard can seed the right segment / agent without further lookups.
 */

import type { ChannelType } from '@/types';
import type { CampaignType } from '@/components/campaign/CampaignWizard';
import type { LucideIcon } from 'lucide-react';
import {
  RefreshCw,
  ShieldCheck,
  PiggyBank,
  Sparkles,
  CreditCard,
  Wallet,
  Coins,
  Award,
  ShoppingCart,
  Workflow,
} from 'lucide-react';

/**
 * `kind` divides templates into the two industry-standard execution modes:
 *  - quick_run:  single-send (campaign in marketing-cloud parlance)
 *  - journey:    multi-step canvas with branches, delays, triggers
 *
 * The CreateCampaign entry chooser asks "Quick run vs Journey" once, up
 * front. Templates are filtered by the picked path.
 */
export type CampaignTemplateKind = 'quick_run' | 'journey';

export interface CampaignTemplateDef {
  id: string;
  /** Short name shown on the gallery card. */
  name: string;
  /** One-line elevator pitch. */
  description: string;
  /** Card icon. */
  icon: LucideIcon;
  /** Brand-tinted accent (hex). */
  accent: string;
  /** Vertical / category tag for filtering (light grouping). */
  category: 'Engagement' | 'Acquisition' | 'Recovery' | 'Cross-sell' | 'Retention';
  /** Quick-run vs journey — drives the entry chooser path. */
  kind: CampaignTemplateKind;
  /** Suggested segment ID — must resolve in baseSegments. */
  suggestedSegmentId: string;
  /** Default channel mix. */
  channels: ChannelType[];
  /** If `ai_voice` is in channels, the recommended deployed voice agent ID. */
  suggestedAgentId?: string;
  /** Tentative budget in lakhs (matches the wizard's input convention). */
  tentativeBudgetLakh: string;
  /** Internal wizard-state campaign type. Derived from `kind`. */
  campaignType: CampaignType;
  /** Default schedule mode. */
  scheduleType: 'one-time' | 'recurring' | 'event' | 'smart_ai';
  /** Inline help text shown on hover/expand. */
  longDescription?: string;
}

export const campaignTemplates: CampaignTemplateDef[] = [
  {
    id: 'tpl-high-ltv-reengagement',
    name: 'High-LTV Re-engagement',
    description:
      'Win-back high-value dormant customers with WhatsApp + a voice agent that retrieves from the product catalog.',
    icon: RefreshCw,
    accent: '#7C5CFF',
    category: 'Retention',
    suggestedSegmentId: 'seg-001',
    channels: ['whatsapp', 'ai_voice'],
    suggestedAgentId: 'agent_1',
    tentativeBudgetLakh: '4.5',
    kind: 'quick_run',
    campaignType: 'simple_send',
    scheduleType: 'one-time',
    longDescription:
      "Targets the 'High LTV Dormant' segment. WhatsApp goes first; voice agent handles those who don't engage. Agent's KBs include product catalog and KYC FAQ.",
  },
  {
    id: 'tpl-kyc-completion',
    name: 'KYC Completion Drive',
    description:
      'Reach incomplete-KYC users across SMS, WhatsApp, and field exec to nudge Min KYC via Aadhaar OTP.',
    icon: ShieldCheck,
    accent: '#3DC9B0',
    category: 'Acquisition',
    suggestedSegmentId: 'seg-002',
    channels: ['sms', 'whatsapp', 'field_executive'],
    tentativeBudgetLakh: '8.0',
    kind: 'quick_run',
    campaignType: 'simple_send',
    scheduleType: 'one-time',
    longDescription:
      'For users who started but did not complete KYC. SMS-first reminder, WhatsApp follow-up. Field exec for high-LTV-likely cohorts within metros.',
  },
  {
    id: 'tpl-loan-recovery-dpd30',
    name: 'Loan Recovery — DPD 30',
    description:
      'Soft-reminder voice campaign to DPD 0–30 customers, with WhatsApp fallback and a settlement-aware agent.',
    icon: PiggyBank,
    accent: '#F0B340',
    category: 'Recovery',
    suggestedSegmentId: 'seg-004',
    channels: ['ai_voice', 'whatsapp'],
    suggestedAgentId: 'agent_2',
    tentativeBudgetLakh: '3.5',
    kind: 'quick_run',
    campaignType: 'simple_send',
    scheduleType: 'one-time',
    longDescription:
      'Voice agent runs the DPD 0–30 soft-reminder script (loan recovery playbook KB). Falls back to WhatsApp if no answer after 2 retries. Compliance-safe escalation to settlement only when customer asks.',
  },
  {
    id: 'tpl-festive-cashback',
    name: 'Festive Cashback Promo',
    description:
      'Broad SMS + WhatsApp blast for active transactors during a festival window. Frequency-capped.',
    icon: Sparkles,
    accent: '#FF8A3D',
    category: 'Engagement',
    suggestedSegmentId: 'seg-003',
    channels: ['sms', 'whatsapp'],
    tentativeBudgetLakh: '12.0',
    kind: 'quick_run',
    campaignType: 'simple_send',
    scheduleType: 'one-time',
    longDescription:
      'Targets active transactors. Frequency cap: once per 3 days. SMS for quick reach, WhatsApp template for richer creative. Approved templates only.',
  },
  {
    id: 'tpl-preapproved-loan',
    name: 'Pre-approved Loan Push',
    description:
      'WhatsApp + voice agent pitch to pre-approved customers, with the agent retrieving from postpaid eligibility KB.',
    icon: CreditCard,
    accent: '#5B9DFF',
    category: 'Cross-sell',
    suggestedSegmentId: 'seg-004',
    channels: ['whatsapp', 'ai_voice'],
    suggestedAgentId: 'agent_1',
    tentativeBudgetLakh: '6.0',
    kind: 'quick_run',
    campaignType: 'simple_send',
    scheduleType: 'one-time',
  },
  {
    id: 'tpl-wallet-winback',
    name: 'Wallet Inactive Win-Back',
    description:
      'SMS + push to dormant wallet users with a small reactivation cashback.',
    icon: Wallet,
    accent: '#1FAE6A',
    category: 'Retention',
    suggestedSegmentId: 'seg-001',
    channels: ['sms', 'push_notification'],
    tentativeBudgetLakh: '2.5',
    kind: 'quick_run',
    campaignType: 'simple_send',
    scheduleType: 'one-time',
  },
  {
    id: 'tpl-gold-sip',
    name: 'Gold SIP Pitch',
    description:
      'WhatsApp-led pitch for digital-gold SIP, voice agent for high-value prospects.',
    icon: Coins,
    accent: '#D49419',
    category: 'Cross-sell',
    suggestedSegmentId: 'seg-003',
    channels: ['whatsapp', 'ai_voice'],
    suggestedAgentId: 'agent_1',
    tentativeBudgetLakh: '3.0',
    kind: 'quick_run',
    campaignType: 'simple_send',
    scheduleType: 'one-time',
  },
  {
    id: 'tpl-loyalty-wave',
    name: 'Loyalty Wave',
    description:
      'Engaged users get a coordinated SMS + push + in-app banner sequence highlighting tier progress.',
    icon: Award,
    accent: '#7C5CFF',
    category: 'Engagement',
    suggestedSegmentId: 'seg-003',
    channels: ['sms', 'push_notification', 'in_app_banner'],
    tentativeBudgetLakh: '5.0',
    kind: 'quick_run',
    campaignType: 'simple_send',
    scheduleType: 'recurring',
  },
  /* ─── Automated journey templates ─────────────────────────────────── */
  {
    id: 'tpl-cart-abandonment-journey',
    name: 'Cart abandonment recovery',
    description:
      'Trigger on cart_abandoned. WhatsApp at +1h, SMS at +24h, AI voice nudge at +48h for high-value carts.',
    icon: ShoppingCart,
    accent: '#FF8A3D',
    category: 'Recovery',
    kind: 'journey',
    suggestedSegmentId: 'seg-003',
    channels: ['whatsapp', 'sms', 'ai_voice'],
    suggestedAgentId: 'agent_1',
    tentativeBudgetLakh: '4.0',
    campaignType: 'journey',
    scheduleType: 'event',
    longDescription:
      'Event-triggered journey with delays + audience splits on cart value. Voice agent kicks in for the high-value branch only.',
  },
  {
    id: 'tpl-onboarding-journey',
    name: 'Onboarding nudge journey',
    description:
      'New signups get a 7-day nudge ladder — welcome WhatsApp on day 1, KYC reminder on day 3, voice call on day 5 if KYC still pending.',
    icon: Workflow,
    accent: '#3DC9B0',
    category: 'Acquisition',
    kind: 'journey',
    suggestedSegmentId: 'seg-002',
    channels: ['whatsapp', 'ai_voice'],
    suggestedAgentId: 'agent_1',
    tentativeBudgetLakh: '6.0',
    campaignType: 'journey',
    scheduleType: 'event',
    longDescription:
      'Multi-step KYC drive. Branches on whether the user has completed KYC by day 3; only those who haven\'t see the day-5 voice call.',
  },
];

export function getTemplateById(id: string): CampaignTemplateDef | undefined {
  return campaignTemplates.find((t) => t.id === id);
}

/**
 * Map a template definition into the campaign-wizard's initialData shape.
 * Shared between:
 *   - CreateCampaign (no longer applies templates at the entry — kept for
 *     legacy draft hand-offs)
 *   - SetupStep "Start from template" button
 *   - Future: Campaigns list "Clone" action
 *
 * Returns the wizard's `Partial<CampaignData>` — the wizard's init code
 * shallow- and deep-merges it into INITIAL_DATA. Defensive against missing
 * optional fields on the template.
 *
 * Defined here (rather than in the wizard or page) so any consumer that
 * has a `CampaignTemplateDef` can apply it without circular imports.
 */
export interface CampaignTemplateInitialData {
  campaignType: CampaignType;
  name: string;
  segmentId: string;
  channels: ChannelType[];
  goal: {
    description: string;
    goals: never[];
    goalsOperator: 'or';
    tentativeBudget: string;
  };
  senderConfig?: {
    ai_voice?: {
      ai_voice: {
        account: string;
        callerNumber: string;
        agentId: string;
        retry: {
          enabled: boolean;
          maxRetries: number;
          delayValue: number;
          delayUnit: 'minutes' | 'hours';
          retryOn: { noAnswer: boolean; busy: boolean; networkError: boolean };
        };
      };
    };
  };
  schedule?: { type: 'one-time' | 'recurring' | 'event' | 'smart_ai' };
}

export function templateToInitialData(t: CampaignTemplateDef): CampaignTemplateInitialData {
  const initial: CampaignTemplateInitialData = {
    campaignType: t.campaignType,
    name: t.name,
    segmentId: t.suggestedSegmentId,
    channels: [...t.channels],
    goal: {
      description: t.longDescription ?? t.description,
      goals: [],
      goalsOperator: 'or',
      tentativeBudget: t.tentativeBudgetLakh,
    },
  };

  if (t.channels.includes('ai_voice') && t.suggestedAgentId) {
    initial.senderConfig = {
      ai_voice: {
        ai_voice: {
          account: '',
          callerNumber: '',
          agentId: t.suggestedAgentId,
          retry: {
            enabled: false,
            maxRetries: 2,
            delayValue: 30,
            delayUnit: 'minutes',
            retryOn: { noAnswer: true, busy: true, networkError: true },
          },
        },
      },
    };
  }

  if (t.scheduleType) {
    initial.schedule = { type: t.scheduleType };
  }

  return initial;
}
