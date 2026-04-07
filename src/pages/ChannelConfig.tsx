import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Info,
  Zap,
  AlertTriangle,
  Megaphone,
  MessageCircle,
  FileText,
  Pencil,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { Toast } from '@/components/common/Toast';
import { usePhaseData } from '@/hooks/usePhaseData';
import { channels } from '@/data/channels';
import { PLATFORM_REACHABILITY_RATES } from '@/data/channels';
import type { ChannelType, ChannelDefinition } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = 'cost' | 'reachability' | 'api' | 'templates';

type TemplateStatus = 'Approved' | 'Pending' | 'Rejected';

interface ChannelTemplate {
  id: string;
  name: string;
  preview: string;
  status: TemplateStatus;
  meta?: string;
}

interface VolumeTier {
  id: string;
  volume: string;
  discount: string;
}

interface CostState {
  unitCost: string;
  perMinuteRate: string;
  tiers: VolumeTier[];
  budgetCap: string;
}

interface ReachabilityToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface ActivityWindow {
  value: string;
}

interface ReachabilityState {
  toggles: ReachabilityToggle[];
  activityWindow?: ActivityWindow;
}

interface ApiState {
  senderId: string;
  endpoint: string;
  apiKey: string;
  rateLimit: string;
  webhookUrl: string;
  apiKeyVisible: boolean;
}

interface ChannelState {
  enabled: boolean;
  expandedTab: TabId | null;
  cost: CostState;
  reachability: ReachabilityState;
  api: ApiState;
}

// ─── Template data per channel ───────────────────────────────────────────────

const CHANNEL_TEMPLATES: Partial<Record<ChannelType, ChannelTemplate[]>> = {
  sms: [
    {
      id: 'sms-kyc-reminder',
      name: 'KYC Reminder',
      preview: 'Dear {name}, your KYC is pending. Complete it in 2 mins to unlock higher limits. Tap: {link}',
      status: 'Approved',
      meta: '1 SMS unit · 142 chars',
    },
    {
      id: 'sms-payment-due',
      name: 'Payment Due',
      preview: 'Hi {name}, your EMI of ₹{amount} is due on {date}. Pay now to avoid late fees: {link}',
      status: 'Approved',
      meta: '1 SMS unit · 138 chars',
    },
    {
      id: 'sms-loan-offer',
      name: 'Loan Offer',
      preview: 'Pre-approved loan up to ₹5L at {rate}% p.a. No paperwork. Apply now: {link} T&C apply.',
      status: 'Pending',
      meta: '1 SMS unit · 118 chars',
    },
  ],
  whatsapp: [
    {
      id: 'wa-kyc-followup',
      name: 'KYC Follow-up',
      preview: 'Hello {name} 👋 Your KYC is pending. Complete it now to unlock higher limits.\n\n✅ Takes just 2 mins\n✅ 100% digital',
      status: 'Approved',
      meta: 'Rich text · CTA: "Complete KYC"',
    },
    {
      id: 'wa-festive-offer',
      name: 'Festive Offer',
      preview: '🎉 *Diwali Offer, {name}!* Get ₹{cashback} cashback on ₹{min_amount}+ transactions. Valid till {date}.',
      status: 'Approved',
      meta: 'Image + CTA: "Avail Offer"',
    },
    {
      id: 'wa-account-activation',
      name: 'Account Activation',
      preview: 'Hi {name}, your account is almost ready! 🚀 Verify your mobile and complete mini-KYC. Unlock ₹500 welcome bonus.',
      status: 'Approved',
      meta: 'Rich text · CTA: "Activate Now"',
    },
  ],
  push_notification: [
    {
      id: 'push-cashback-alert',
      name: 'Cashback Alert',
      preview: 'Title: You earned ₹{amount} cashback! · Body: Tap to see your reward and redeem it before it expires.',
      status: 'Approved',
      meta: 'Title + body · Deep link: /wallet',
    },
    {
      id: 'push-app-update',
      name: 'App Update',
      preview: 'Title: New update available · Body: Version {version} brings faster payments & improved security. Update now.',
      status: 'Approved',
      meta: 'Title + body · Deep link: /update',
    },
  ],
  ai_voice: [
    {
      id: 'voice-kyc-script',
      name: 'KYC Verification Script',
      preview: 'Hello, am I speaking with {name}? This is a call from Paytm regarding your pending KYC. I can help you complete it right now. Would you like to proceed?',
      status: 'Approved',
      meta: 'Hindi/English · Avg duration: 90 sec',
    },
    {
      id: 'voice-collection-script',
      name: 'Collection Reminder Script',
      preview: 'Hello {name}, this is an automated reminder from Paytm. Your EMI of ₹{amount} was due on {date}. Press 1 to pay now or 2 to speak with our executive.',
      status: 'Approved',
      meta: 'DTMF: 1=Pay, 2=Transfer · Avg: 45 sec',
    },
  ],
  rcs: [
    {
      id: 'rcs-loan-card',
      name: 'Loan Offer Rich Card',
      preview: '[Banner: Paytm Loan] Pre-approved ₹{amount} at {rate}% p.a. · Instant disbursal · 100% digital process',
      status: 'Approved',
      meta: 'Rich card · Buttons: "Apply Now", "Know More"',
    },
    {
      id: 'rcs-kyc-interactive',
      name: 'KYC Interactive List',
      preview: 'Complete your KYC in one step. Choose your method: → Aadhaar OTP → Video KYC → Branch visit',
      status: 'Pending',
      meta: 'Interactive list · 3 options',
    },
  ],
  in_app_banner: [
    {
      id: 'inapp-kyc-banner',
      name: 'KYC Nudge Banner',
      preview: 'Complete your KYC to unlock ₹1L+ limits. Takes just 2 minutes. [CTA: Start Now]',
      status: 'Approved',
      meta: 'Top banner · Dismissible',
    },
    {
      id: 'inapp-offer-banner',
      name: 'Cashback Offer Banner',
      preview: 'Get ₹{amount} cashback on your next UPI payment of ₹{min}+. Valid till {date}. [CTA: Activate]',
      status: 'Approved',
      meta: 'Full-width banner · Auto-dismiss 5s',
    },
  ],
  field_executive: [
    {
      id: 'fe-kyc-visit',
      name: 'KYC Home Visit',
      preview: 'Task: Conduct KYC verification for {name} at {address}. Required: Aadhaar, PAN. Capture photo + selfie.',
      status: 'Approved',
      meta: 'Priority: High · SLA: 48 hrs',
    },
    {
      id: 'fe-doc-collection',
      name: 'Document Collection',
      preview: 'Task: Collect loan documents from {name}. Needed: Income proof, address proof, 3-month bank statement.',
      status: 'Approved',
      meta: 'Priority: Medium · SLA: 72 hrs',
    },
  ],
  facebook_ads: [
    {
      id: 'fb-loan-carousel',
      name: 'Loan Carousel Ad',
      preview: 'Pre-approved personal loan up to ₹5L. Low interest, instant disbursal, zero paperwork. Apply online.',
      status: 'Approved',
      meta: 'Carousel · Objective: Lead Generation',
    },
    {
      id: 'fb-kyc-lead-form',
      name: 'KYC Lead Form Ad',
      preview: 'Complete your Paytm KYC from Facebook. Unlock higher payment limits and exclusive offers. Takes 2 mins.',
      status: 'Pending',
      meta: 'Lead form · Objective: Leads',
    },
  ],
  instagram_ads: [
    {
      id: 'ig-cashback-story',
      name: 'Cashback Story Ad',
      preview: '🎉 Earn ₹500 cashback on your first UPI payment. Scan & Pay with Paytm. Offer valid till {date}.',
      status: 'Approved',
      meta: 'Story format · Swipe-up CTA',
    },
    {
      id: 'ig-loan-reel',
      name: 'Loan Awareness Reel',
      preview: 'Personal loan up to ₹5L in 10 minutes. No documents, no branch visit. 100% online with Paytm.',
      status: 'Approved',
      meta: 'Reel · Objective: Reach',
    },
  ],
};

// ─── Default state builders ──────────────────────────────────────────────────

function buildDefaultCost(ch: ChannelDefinition): CostState {
  return {
    unitCost: ch.unitCost.toFixed(2),
    perMinuteRate: ch.id === 'ai_voice' ? '1.20' : '',
    tiers: [
      { id: 't1', volume: '1,00,000', discount: '10' },
      { id: 't2', volume: '5,00,000', discount: '18' },
    ],
    budgetCap: '',
  };
}

function buildDefaultReachability(channelId: ChannelType): ReachabilityState {
  switch (channelId) {
    case 'sms':
      return {
        toggles: [
          {
            id: 'dnd',
            label: 'Exclude DND registered numbers',
            description: 'Skip phone numbers registered on the Do Not Disturb list',
            enabled: true,
          },
          {
            id: 'otp_verified',
            label: 'Phone number verified via OTP',
            description: 'Only reach users whose number was verified via OTP',
            enabled: false,
          },
        ],
      };
    case 'whatsapp':
      return {
        toggles: [
          {
            id: 'opted_in',
            label: 'User has opted in to WhatsApp communications',
            description: 'Require explicit opt-in before sending WhatsApp messages',
            enabled: true,
          },
          {
            id: 'verified_90d',
            label: 'WhatsApp number verified in last 90 days',
            description: 'Require re-verification for numbers inactive over 90 days',
            enabled: false,
          },
        ],
      };
    case 'rcs':
      return {
        toggles: [
          {
            id: 'rcs_installed',
            label: 'Device has RCS app installed',
            description: 'Verify that the RCS messaging app is present on the device',
            enabled: true,
          },
        ],
      };
    case 'ai_voice':
      return {
        toggles: [
          {
            id: 'dnd',
            label: 'Exclude DND registered numbers',
            description: 'Skip phone numbers registered on the Do Not Disturb list',
            enabled: true,
          },
          {
            id: 'business_hours',
            label: 'Only call during business hours (9am–6pm)',
            description: 'Restrict outbound calls to standard business hours',
            enabled: true,
          },
          {
            id: 'language_pref',
            label: 'User language preference available',
            description: 'Only call users with a known language preference set',
            enabled: false,
          },
        ],
      };
    case 'push_notification':
      return {
        toggles: [
          {
            id: 'perm_not_revoked',
            label: 'Notification permission not revoked in last 30 days',
            description: 'Exclude users who recently revoked notification permissions',
            enabled: true,
          },
          {
            id: 'app_opened_30d',
            label: 'App opened in last 30 days (stricter)',
            description: 'Only reach users who have been active recently — reduces reach but improves relevance',
            enabled: false,
          },
        ],
      };
    case 'in_app_banner':
      return {
        toggles: [],
        activityWindow: { value: '30' },
      };
    case 'field_executive':
      return {
        toggles: [
          {
            id: 'addr_verified_6m',
            label: 'Address verified in last 6 months',
            description: 'Require a recent address verification to ensure accuracy',
            enabled: false,
          },
          {
            id: 'serviceable_pin',
            label: 'Within serviceable pincode',
            description: 'Only target pincodes covered by active field executive routes',
            enabled: true,
          },
        ],
      };
    case 'facebook_ads':
      return {
        toggles: [
          {
            id: 'custom_audience',
            label: 'Upload to Custom Audience',
            description: 'Match users by hashed phone/email on Meta to build a Custom Audience',
            enabled: true,
          },
        ],
      };
    case 'instagram_ads':
      return {
        toggles: [
          {
            id: 'custom_audience',
            label: 'Upload to Custom Audience',
            description: 'Match users by hashed phone/email on Meta to build a Custom Audience',
            enabled: true,
          },
        ],
      };
  }
}

function buildDefaultApi(ch: ChannelDefinition): ApiState {
  const endpointMap: Record<ChannelType, string> = {
    sms: 'https://api.smsprovider.in/v2/send',
    whatsapp: 'https://api.whatsapp.business/v1/messages',
    rcs: 'https://rcsbusiness.googleapis.com/v1/phones/messages',
    ai_voice: 'https://api.aivoice.in/v1/calls/outbound',
    field_executive: 'https://api.fieldops.in/v1/tasks',
    push_notification: 'https://fcm.googleapis.com/v1/projects/outreach/messages:send',
    in_app_banner: 'https://api.notifications.internal/v1/in-app',
    facebook_ads: 'https://graph.facebook.com/v19.0/act_{ad_account_id}/campaigns',
    instagram_ads: 'https://graph.facebook.com/v19.0/act_{ad_account_id}/campaigns',
  };
  return {
    senderId: '',
    endpoint: endpointMap[ch.id],
    apiKey: '',
    rateLimit: '100',
    webhookUrl: '',
    apiKeyVisible: false,
  };
}

function buildInitialState(ch: ChannelDefinition): ChannelState {
  return {
    enabled: true,
    expandedTab: null,
    cost: buildDefaultCost(ch),
    reachability: buildDefaultReachability(ch.id),
    api: buildDefaultApi(ch),
  };
}

// ─── Reachability rule definitions ──────────────────────────────────────────

interface RuleRow {
  attribute: string;
  operator: string;
  value: string;
  isBase: true;
}

const BASE_RULES: Record<ChannelType, RuleRow[]> = {
  sms: [
    { attribute: 'phone', operator: 'is not null', value: '', isBase: true },
    { attribute: 'phone', operator: 'matches', value: 'valid format', isBase: true },
  ],
  whatsapp: [
    { attribute: 'phone', operator: 'is not null', value: '', isBase: true },
    { attribute: 'whatsapp_status', operator: '=', value: "'active'", isBase: true },
  ],
  rcs: [
    { attribute: 'device_os', operator: '=', value: "'android'", isBase: true },
    { attribute: 'carrier_rcs_support', operator: '=', value: 'true', isBase: true },
  ],
  ai_voice: [
    { attribute: 'phone', operator: 'is not null', value: '', isBase: true },
  ],
  push_notification: [
    { attribute: 'app_installed', operator: '=', value: 'true', isBase: true },
    { attribute: 'push_token', operator: 'is not null', value: '', isBase: true },
  ],
  in_app_banner: [
    { attribute: 'app_installed', operator: '=', value: 'true', isBase: true },
    { attribute: 'last_app_open', operator: '<', value: '30 days ago', isBase: true },
  ],
  field_executive: [
    { attribute: 'address', operator: 'is not null', value: '', isBase: true },
    { attribute: 'pincode', operator: 'is', value: 'valid', isBase: true },
  ],
  facebook_ads: [
    { attribute: 'phone_or_email', operator: 'is not null', value: '', isBase: true },
    { attribute: 'meta_match_rate', operator: '>', value: '0', isBase: true },
  ],
  instagram_ads: [
    { attribute: 'phone_or_email', operator: 'is not null', value: '', isBase: true },
    { attribute: 'meta_match_rate', operator: '>', value: '0', isBase: true },
  ],
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  size = 'md',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: 'sm' | 'md';
}) {
  const track = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9';
  const thumb = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const translate = size === 'sm' ? 'translate-x-3' : 'translate-x-4';
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${track} ${
        checked ? 'bg-[#27AE60]' : 'bg-[#D1D5DB]'
      }`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform ${thumb} ${
          checked ? translate : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function RuleCard({ rule }: { rule: RuleRow }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs">
      <code className="rounded bg-[#EEF2FF] px-1.5 py-0.5 font-mono text-[#4F46E5] text-[11px]">
        {rule.attribute}
      </code>
      <span className="text-[#6B7280] font-medium">{rule.operator}</span>
      {rule.value && (
        <code className="rounded bg-[#F0FDF4] px-1.5 py-0.5 font-mono text-[#16A34A] text-[11px]">
          {rule.value}
        </code>
      )}
    </div>
  );
}

// ─── Tab: Cost & Pricing ─────────────────────────────────────────────────────

function CostTab({
  channelId,
  cost,
  onChange,
  onSave,
}: {
  channelId: ChannelType;
  cost: CostState;
  onChange: (next: CostState) => void;
  onSave: () => void;
}) {
  const isVoice = channelId === 'ai_voice';
  const isField = channelId === 'field_executive';
  const unitLabel = isVoice ? '/call' : isField ? '/task' : '/msg';

  function addTier() {
    onChange({
      ...cost,
      tiers: [
        ...cost.tiers,
        { id: `t${Date.now()}`, volume: '', discount: '' },
      ],
    });
  }

  function removeTier(id: string) {
    onChange({ ...cost, tiers: cost.tiers.filter((t) => t.id !== id) });
  }

  function updateTier(id: string, field: 'volume' | 'discount', value: string) {
    onChange({
      ...cost,
      tiers: cost.tiers.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    });
  }

  return (
    <div className="space-y-6 p-4">
      {/* Unit cost */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">
          Unit Cost{' '}
          <span className="font-normal text-[#9CA3AF]">
            ({unitLabel})
          </span>
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-[180px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cost.unitCost}
              onChange={(e) => onChange({ ...cost, unitCost: e.target.value })}
              className="w-full rounded-md border border-[#D1D5DB] py-2 pl-7 pr-3 text-sm text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
            />
          </div>
          {isVoice && (
            <div className="relative flex-1 max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cost.perMinuteRate}
                onChange={(e) =>
                  onChange({ ...cost, perMinuteRate: e.target.value })
                }
                placeholder="0.00"
                className="w-full rounded-md border border-[#D1D5DB] py-2 pl-7 pr-3 text-sm text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
                /min
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Volume discounts */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-[#374151]">
            Volume Discount Tiers
          </label>
          <button
            onClick={addTier}
            className="flex items-center gap-1 text-xs font-medium text-[#002970] hover:text-[#001f5c] transition-colors"
          >
            <Plus size={13} />
            Add tier
          </button>
        </div>
        <div className="space-y-2">
          {cost.tiers.map((tier, idx) => (
            <div key={tier.id} className="flex items-center gap-2">
              <span className="w-4 shrink-0 text-center text-xs text-[#9CA3AF]">
                {idx + 1}
              </span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tier.volume}
                  onChange={(e) => updateTier(tier.id, 'volume', e.target.value)}
                  placeholder="1,00,000"
                  className="w-full rounded-md border border-[#D1D5DB] py-2 px-3 text-sm text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
                  msgs
                </span>
              </div>
              <div className="relative w-24 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tier.discount}
                  onChange={(e) => updateTier(tier.id, 'discount', e.target.value)}
                  placeholder="10"
                  className="w-full rounded-md border border-[#D1D5DB] py-2 pl-3 pr-7 text-sm text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
                  %
                </span>
              </div>
              <button
                onClick={() => removeTier(tier.id)}
                className="shrink-0 rounded p-1 text-[#9CA3AF] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors"
                aria-label="Remove tier"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {cost.tiers.length === 0 && (
            <p className="text-xs text-[#9CA3AF]">No discount tiers configured.</p>
          )}
        </div>
      </div>

      {/* Monthly budget cap */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">
          Monthly Budget Cap{' '}
          <span className="font-normal text-[#9CA3AF]">(optional)</span>
        </label>
        <div className="relative max-w-[220px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
            ₹
          </span>
          <input
            type="number"
            min="0"
            value={cost.budgetCap}
            onChange={(e) => onChange({ ...cost, budgetCap: e.target.value })}
            placeholder="e.g. 50000"
            className="w-full rounded-md border border-[#D1D5DB] py-2 pl-7 pr-3 text-sm text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
          />
        </div>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Campaigns will pause automatically when this limit is reached.
        </p>
      </div>

      <div className="pt-1">
        <button
          onClick={onSave}
          className="rounded-md bg-[#002970] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#001f5c]"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Reachability Rules ─────────────────────────────────────────────────

function ReachabilityTab({
  channelId,
  reachability,
  onChange,
  onSave,
}: {
  channelId: ChannelType;
  reachability: ReachabilityState;
  onChange: (next: ReachabilityState) => void;
  onSave: () => void;
}) {
  const baseRules = BASE_RULES[channelId];

  function toggleRule(id: string) {
    onChange({
      ...reachability,
      toggles: reachability.toggles.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t,
      ),
    });
  }

  return (
    <div className="space-y-5 p-4">
      {/* Note banner */}
      <div className="flex items-start gap-2 rounded-md border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-2.5 text-xs text-[#1D4ED8]">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          These rules determine which users in your segments are counted as
          &ldquo;reachable&rdquo; on this channel. Changing rules will
          recalculate reachability counts across all segments.
        </span>
      </div>

      {/* Base rules */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Default Rules (always applied)
        </p>
        <div className="space-y-1.5">
          {baseRules.map((rule, i) => (
            <RuleCard key={i} rule={rule} />
          ))}
        </div>
      </div>

      {/* Additional conditions */}
      {(reachability.toggles.length > 0 || reachability.activityWindow) && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Additional Conditions
          </p>
          <div className="space-y-2">
            {reachability.toggles.map((toggle) => (
              <div
                key={toggle.id}
                className="flex items-start justify-between gap-3 rounded-md border border-[#E5E7EB] bg-white p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827]">
                    {toggle.label}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {toggle.description}
                  </p>
                </div>
                <Toggle
                  checked={toggle.enabled}
                  onChange={() => toggleRule(toggle.id)}
                />
              </div>
            ))}

            {/* In-app activity window */}
            {reachability.activityWindow && (
              <div className="flex items-center justify-between gap-3 rounded-md border border-[#E5E7EB] bg-white p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#111827]">
                    Customize activity window
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    User must have opened the app within this many days to be
                    considered reachable
                  </p>
                </div>
                <select
                  value={reachability.activityWindow.value}
                  onChange={(e) =>
                    onChange({
                      ...reachability,
                      activityWindow: { value: e.target.value },
                    })
                  }
                  className="rounded-md border border-[#D1D5DB] py-1.5 pl-2 pr-7 text-sm text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
                >
                  {['7', '14', '30', '60', '90'].map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-1">
        <button
          onClick={onSave}
          className="rounded-md bg-[#002970] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#001f5c]"
        >
          Save Rules
        </button>
      </div>
    </div>
  );
}

// ─── Tab: API Configuration ──────────────────────────────────────────────────

function ApiTab({
  api,
  onChange,
  onSave,
  onTestConnection,
}: {
  api: ApiState;
  onChange: (next: ApiState) => void;
  onSave: () => void;
  onTestConnection: () => void;
}) {
  return (
    <div className="space-y-4 p-4">
      {/* Sender ID */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">
          Sender ID / From
        </label>
        <input
          type="text"
          value={api.senderId}
          onChange={(e) => onChange({ ...api, senderId: e.target.value })}
          placeholder="e.g. PAYTM, +91XXXXXXXXXX"
          className="w-full rounded-md border border-[#D1D5DB] py-2 px-3 text-sm text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
        />
      </div>

      {/* API Endpoint */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">
          API Endpoint
        </label>
        <input
          type="url"
          value={api.endpoint}
          onChange={(e) => onChange({ ...api, endpoint: e.target.value })}
          className="w-full rounded-md border border-[#D1D5DB] py-2 px-3 text-sm font-mono text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
        />
      </div>

      {/* API Key */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">
          API Key
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={api.apiKeyVisible ? 'text' : 'password'}
              value={api.apiKey}
              onChange={(e) => onChange({ ...api, apiKey: e.target.value })}
              placeholder="Enter API key"
              className="w-full rounded-md border border-[#D1D5DB] py-2 pl-3 pr-9 text-sm font-mono text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
            />
            <button
              onClick={() =>
                onChange({ ...api, apiKeyVisible: !api.apiKeyVisible })
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#374151]"
              aria-label={api.apiKeyVisible ? 'Hide API key' : 'Show API key'}
            >
              {api.apiKeyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Rate limit */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">
          Rate Limit
        </label>
        <div className="relative max-w-[200px]">
          <input
            type="number"
            min="1"
            value={api.rateLimit}
            onChange={(e) => onChange({ ...api, rateLimit: e.target.value })}
            className="w-full rounded-md border border-[#D1D5DB] py-2 pl-3 pr-20 text-sm text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
            msgs/sec
          </span>
        </div>
      </div>

      {/* Webhook URL */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#374151]">
          Webhook URL{' '}
          <span className="font-normal text-[#9CA3AF]">
            (delivery status callbacks)
          </span>
        </label>
        <input
          type="url"
          value={api.webhookUrl}
          onChange={(e) => onChange({ ...api, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/delivery"
          className="w-full rounded-md border border-[#D1D5DB] py-2 px-3 text-sm font-mono text-[#111827] focus:border-[#002970] focus:outline-none focus:ring-1 focus:ring-[#002970]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onSave}
          className="rounded-md bg-[#002970] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#001f5c]"
        >
          Save Configuration
        </button>
        <button
          onClick={onTestConnection}
          className="flex items-center gap-1.5 rounded-md border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
        >
          <Zap size={14} />
          Test Connection
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Templates ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<TemplateStatus, string> = {
  Approved: 'bg-[#F0FDF4] text-[#16A34A]',
  Pending: 'bg-[#FFFBEB] text-[#D97706]',
  Rejected: 'bg-[#FEF2F2] text-[#DC2626]',
};

function TemplatesTab({
  channelId,
  onShowToast,
}: {
  channelId: ChannelType;
  onShowToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}) {
  const templates = CHANNEL_TEMPLATES[channelId] ?? [];

  return (
    <div className="space-y-4 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6B7280]">
          {templates.length} template{templates.length !== 1 ? 's' : ''} configured for this channel
        </p>
        <button
          onClick={() => onShowToast('Template builder coming soon', 'info')}
          className="flex items-center gap-1.5 rounded-md bg-[#002970] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#001f5c]"
        >
          <Plus size={13} />
          Create New Template
        </button>
      </div>

      {/* Template list */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[#D1D5DB] py-8 text-center">
          <FileText size={24} className="text-[#9CA3AF]" />
          <p className="text-sm text-[#6B7280]">No templates yet for this channel.</p>
          <button
            onClick={() => onShowToast('Template builder coming soon', 'info')}
            className="mt-1 text-xs font-medium text-[#002970] underline-offset-2 hover:underline"
          >
            Create your first template
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3"
            >
              {/* Name + preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#111827]">
                    {tpl.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[tpl.status]}`}
                  >
                    {tpl.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-[#6B7280]">
                  {tpl.preview}
                </p>
                {tpl.meta && (
                  <p className="mt-0.5 text-[11px] font-medium text-[#6366F1]">
                    {tpl.meta}
                  </p>
                )}
              </div>

              {/* Edit button */}
              <button
                onClick={() => onShowToast(`Editing "${tpl.name}" — template editor coming soon`, 'info')}
                className="flex shrink-0 items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Channel Card ────────────────────────────────────────────────────────

function ChannelCard({
  channel,
  state,
  isDay30,
  onStateChange,
  onShowToast,
}: {
  channel: ChannelDefinition;
  state: ChannelState;
  isDay30: boolean;
  onStateChange: (next: ChannelState) => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'warning') => void;
}) {
  const reachRate = PLATFORM_REACHABILITY_RATES[channel.id];

  function toggleExpand(tab: TabId) {
    onStateChange({
      ...state,
      expandedTab: state.expandedTab === tab ? null : tab,
    });
  }

  const isExpanded = state.expandedTab !== null;

  const TABS: { id: TabId; label: string }[] = [
    { id: 'cost', label: 'Cost & Pricing' },
    { id: 'reachability', label: 'Reachability Rules' },
    { id: 'api', label: 'API Configuration' },
    { id: 'templates', label: 'Templates' },
  ];

  return (
    <div
      className={`rounded-lg border bg-white transition-shadow ${
        isExpanded
          ? 'border-[#002970]/20 shadow-md'
          : 'border-[#E5E7EB] shadow-sm hover:shadow'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <ChannelIcon channel={channel.id} size={20} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#111827]">
              {channel.name}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                channel.type === 'digital'
                  ? 'bg-[#EEF2FF] text-[#4F46E5]'
                  : 'bg-[#FEF3C7] text-[#D97706]'
              }`}
            >
              {channel.type === 'digital' ? 'Digital' : 'Physical'}
            </span>
            {isDay30 && (
              <span
                className="flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-medium text-[#16A34A]"
                title="Platform reachability benchmark"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                {Math.round(reachRate * 100)}% reach
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            ₹{parseFloat(state.cost.unitCost).toFixed(2)}
            {channel.id === 'ai_voice'
              ? '/call'
              : channel.id === 'field_executive'
              ? '/task'
              : '/msg'}
          </p>
        </div>

        {/* Status toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`h-2 w-2 rounded-full ${
              state.enabled ? 'bg-[#27AE60]' : 'bg-[#9CA3AF]'
            }`}
          />
          <span className="text-xs text-[#6B7280]">
            {state.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <Toggle
            size="sm"
            checked={state.enabled}
            onChange={(v) => {
              onStateChange({ ...state, enabled: v });
              onShowToast(
                `${channel.name} ${v ? 'enabled' : 'disabled'}`,
                v ? 'success' : 'warning',
              );
            }}
          />
        </div>

        {/* Expand chevron */}
        <button
          onClick={() =>
            toggleExpand(state.expandedTab ?? 'cost')
          }
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded tabs */}
      {isExpanded && (
        <div className="border-t border-[#E5E7EB]">
          {/* Tab bar */}
          <div className="flex border-b border-[#E5E7EB] px-5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => toggleExpand(tab.id)}
                className={`relative -mb-px py-3 pr-6 text-sm font-medium transition-colors ${
                  state.expandedTab === tab.id
                    ? 'text-[#002970]'
                    : 'text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                {tab.label}
                {state.expandedTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-6 h-0.5 rounded-full bg-[#002970]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {state.expandedTab === 'cost' && (
            <CostTab
              channelId={channel.id}
              cost={state.cost}
              onChange={(next) => onStateChange({ ...state, cost: next })}
              onSave={() =>
                onShowToast(`${channel.name} cost settings saved`, 'success')
              }
            />
          )}
          {state.expandedTab === 'reachability' && (
            <ReachabilityTab
              channelId={channel.id}
              reachability={state.reachability}
              onChange={(next) =>
                onStateChange({ ...state, reachability: next })
              }
              onSave={() =>
                onShowToast(
                  `${channel.name} reachability rules saved`,
                  'success',
                )
              }
            />
          )}
          {state.expandedTab === 'api' && (
            <ApiTab
              api={state.api}
              onChange={(next) => onStateChange({ ...state, api: next })}
              onSave={() =>
                onShowToast(
                  `${channel.name} API configuration saved`,
                  'success',
                )
              }
              onTestConnection={() =>
                onShowToast('Connection successful', 'success')
              }
            />
          )}
          {state.expandedTab === 'templates' && (
            <TemplatesTab
              channelId={channel.id}
              onShowToast={onShowToast}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Platform Connections ─────────────────────────────────────────────────────

interface PlatformConnectionsProps {
  isConnected: boolean;
  onToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

function PlatformConnections({ isConnected, onToast }: PlatformConnectionsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
        Platform Connections
      </h2>

      {/* WhatsApp Business Account */}
      <div
        className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,41,112,0.06)]"
        style={{ borderLeft: '4px solid #25D366' }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#25D3661A' }}
              >
                <MessageCircle size={18} style={{ color: '#25D366' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">WhatsApp Business</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Connect your WhatsApp Business Account to send messages via WhatsApp Business API.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isConnected ? (
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
              )}
              <span
                className={`text-xs font-medium ${isConnected ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}
              >
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>

          {isConnected ? (
            <div className="mt-3 grid grid-cols-3 gap-3 rounded-md bg-[#F9FAFB] px-3 py-2.5 text-xs">
              <div>
                <p className="text-[#9CA3AF]">Business Name</p>
                <p className="mt-0.5 font-medium text-[#111827]">Paytm Financial Services</p>
              </div>
              <div>
                <p className="text-[#9CA3AF]">Phone Number</p>
                <p className="mt-0.5 font-medium text-[#111827]">+91-XXXXXXXXXX</p>
              </div>
              <div>
                <p className="text-[#9CA3AF]">WABA ID</p>
                <p className="mt-0.5 font-medium text-[#111827]">1234567890</p>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-2">
            {isConnected ? (
              <>
                <button
                  onClick={() => onToast('OAuth flow for WhatsApp Business coming soon', 'info')}
                  className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
                >
                  Reconnect
                </button>
                <button
                  onClick={() => onToast('Template management coming soon', 'info')}
                  className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
                >
                  Manage Templates
                </button>
              </>
            ) : (
              <button
                onClick={() => onToast('OAuth flow for WhatsApp Business coming soon', 'info')}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: '#25D366' }}
              >
                Connect WhatsApp Business
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meta Business Account */}
      <div
        className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,41,112,0.06)]"
        style={{ borderLeft: '4px solid #1877F2' }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#1877F21A' }}
              >
                <Megaphone size={18} style={{ color: '#1877F2' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Meta Business Suite</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Connect your Meta Business account to run Facebook and Instagram ads as part of your outreach campaigns.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isConnected ? (
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
              )}
              <span
                className={`text-xs font-medium ${isConnected ? 'text-[#16A34A]' : 'text-[#6B7280]'}`}
              >
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>

          {isConnected ? (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-[#F9FAFB] px-3 py-2.5 text-xs sm:grid-cols-4">
              <div>
                <p className="text-[#9CA3AF]">Business Manager</p>
                <p className="mt-0.5 font-medium text-[#111827]">Paytm Ads Account</p>
              </div>
              <div>
                <p className="text-[#9CA3AF]">Ad Account ID</p>
                <p className="mt-0.5 font-medium text-[#111827]">act_1234567890</p>
              </div>
              <div>
                <p className="text-[#9CA3AF]">Connected Pages</p>
                <p className="mt-0.5 font-medium text-[#111827]">Paytm (FB), @paytm (IG)</p>
              </div>
              <div>
                <p className="text-[#9CA3AF]">Available Budget</p>
                <p className="mt-0.5 font-medium text-[#111827]">₹2,50,000</p>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-2">
            {isConnected ? (
              <>
                <button
                  onClick={() => onToast('OAuth flow for Meta Business coming soon', 'info')}
                  className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
                >
                  Reconnect
                </button>
                <button
                  onClick={() => onToast('Ad account management coming soon', 'info')}
                  className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
                >
                  Manage Ad Accounts
                </button>
              </>
            ) : (
              <button
                onClick={() => onToast('OAuth flow for Meta Business coming soon', 'info')}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: '#1877F2' }}
              >
                Connect Meta Business
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type ChannelStates = Record<ChannelType, ChannelState>;

function buildInitialStates(): ChannelStates {
  return Object.fromEntries(
    channels.map((ch) => [ch.id, buildInitialState(ch)]),
  ) as ChannelStates;
}

export function ChannelConfig() {
  const { isAtLeast } = usePhaseData();
  const isDay30 = isAtLeast('day30');
  const isPlatformConnected = isAtLeast('day1');

  const [channelStates, setChannelStates] = useState<ChannelStates>(
    buildInitialStates,
  );

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'info' | 'warning';
  }>({ visible: false, message: '', type: 'success' });

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
      setToast({ visible: true, message, type });
    },
    [],
  );

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  function updateChannel(id: ChannelType, next: ChannelState) {
    setChannelStates((prev) => ({ ...prev, [id]: next }));
  }

  const enabledCount = channels.filter(
    (ch) => channelStates[ch.id].enabled,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Channel Configuration"
        subtitle="Configure channels, define costs, and set reachability rules for your outreach"
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#27AE60]" />
            <span className="font-medium text-[#111827]">{enabledCount}</span>
            <span className="text-[#6B7280]">of {channels.length} active</span>
          </div>
        }
      />

      {/* Platform Connections */}
      <PlatformConnections isConnected={isPlatformConnected} onToast={showToast} />

      {/* Warning banner for disabled channels */}
      {enabledCount < channels.length && (
        <div className="flex items-center gap-2 rounded-md border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
          <AlertTriangle size={15} className="shrink-0 text-[#D97706]" />
          <span>
            {channels.length - enabledCount} channel
            {channels.length - enabledCount > 1 ? 's' : ''} disabled — campaigns
            targeting disabled channels will not send.
          </span>
        </div>
      )}

      {/* Channel list */}
      <div className="space-y-3">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            state={channelStates[channel.id]}
            isDay30={isDay30}
            onStateChange={(next) => updateChannel(channel.id, next)}
            onShowToast={showToast}
          />
        ))}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={closeToast}
      />
    </div>
  );
}
