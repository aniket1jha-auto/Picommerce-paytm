// Day 30 segments — engagement-based, only available after running campaigns

import type { Segment } from '@/types';

export const day30Segments: Segment[] = [
  {
    id: 'seg-dormant-60d',
    name: 'Dormant 60+ Days',
    size: 89000,
    filters: 'last_active > 60d AND lifetime_transactions > 0',
    description:
      'Users who were previously active but have not engaged with the platform in 60+ days. High re-engagement potential — 42% have LTV above ₹10K. Field executive or AI Voice recommended for high-value sub-segments.',
    reachability: {
      sms: 85440,
      whatsapp: 58140,
      email: 40050,
    },
    performance: {
      avgConversion: 3.1,
      avgROI: 2.4,
      campaignCount: 4,
    },
  },
  {
    id: 'seg-high-churn-high-ltv',
    name: 'High Churn Risk + High LTV',
    size: 23000,
    filters: 'churn_score > 0.75 AND ltv_tier = high',
    description:
      'Users with high predicted churn probability but significant lifetime value (avg ₹18,500). These are your highest-priority retention targets. WhatsApp + AI Voice waterfall has shown 6.2x ROI for similar profiles.',
    reachability: {
      sms: 22080,
      whatsapp: 18400,
      email: 14950,
    },
    performance: {
      avgConversion: 5.8,
      avgROI: 6.2,
      campaignCount: 3,
    },
  },
  {
    id: 'seg-wa-nonresponders-30d',
    name: 'WhatsApp Non-Responders — Last 30 Days',
    size: 18000,
    filters: 'whatsapp_sent_30d > 0 AND whatsapp_opened_30d = 0',
    description:
      'Users who received WhatsApp messages in the last 30 days but never opened them. Consider channel switch — SMS or AI Voice may be more effective for this group. 67% are in Tier-2/Tier-3 cities.',
    reachability: {
      sms: 17280,
      whatsapp: 18000,
      email: 9000,
    },
    performance: {
      avgConversion: 1.2,
      avgROI: 1.1,
      campaignCount: 6,
    },
  },
  {
    id: 'seg-insurance-renewal-15d',
    name: 'Insurance Renewal Due < 15 Days',
    size: 14000,
    filters: 'insurance_renewal_date BETWEEN NOW() AND NOW() + 15d',
    description:
      'Users with insurance policies expiring within 15 days. High urgency segment with strong conversion rates (avg 15%). Time-sensitive — WhatsApp for immediacy, followed by AI Voice for personal touch.',
    reachability: {
      sms: 13440,
      whatsapp: 11200,
      email: 8400,
    },
    performance: {
      avgConversion: 15.0,
      avgROI: 3.8,
      campaignCount: 5,
    },
  },
  {
    id: 'seg-ai-call-positive',
    name: 'AI Call Responders — Positive',
    size: 12000,
    filters: 'ai_voice_calls_30d > 0 AND ai_voice_sentiment = positive AND conversion = false',
    description:
      'Users who received AI Voice calls in the past 30 days, responded positively (interested/considering), but have not yet converted. These are warm leads — a follow-up WhatsApp or field visit within 48 hours has shown 28% conversion.',
    reachability: {
      sms: 11520,
      whatsapp: 9600,
      email: 6000,
    },
    performance: {
      avgConversion: 28.0,
      avgROI: 4.5,
      campaignCount: 3,
    },
  },
];
