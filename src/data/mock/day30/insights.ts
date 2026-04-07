// Day 30 insights — tenant-specific ML models + rules. Green "Your model" tags.

import type { Insight } from '../day0/insights';

export const day30Insights: Insight[] = [
  {
    id: 'ins-d30-ml-wa-vs-sms',
    type: 'ml_tenant',
    category: 'channel',
    minPhase: 'day30',
    title: 'WhatsApp outperforms SMS by 3.2x for your high-LTV segment',
    description:
      'Based on your campaign data from the last 90 days, WhatsApp consistently delivers 3.2x higher conversion than SMS for the Metro High-LTV segment. Your WhatsApp conversion averages 6.8% vs SMS at 2.1%. This insight is specific to your audience — not platform-wide.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'high', value: 0.91 },
    evidence: {
      source: 'Your campaign history (14 campaigns, 1.2L users, last 90 days)',
      dataPoints: [
        { label: 'WhatsApp avg conversion', value: '6.8%' },
        { label: 'SMS avg conversion', value: '2.1%' },
        { label: 'Campaigns analyzed', value: 14 },
        { label: 'Users in sample', value: 120000 },
      ],
      keyFactors: [
        'KYC Re-engagement (WhatsApp): 7.1% conversion',
        'Loan Offer (WhatsApp step): 6.2% conversion',
        'Insurance Renewal (WhatsApp): 7.0% conversion',
        'High-LTV users open WhatsApp 2.4x more frequently than SMS',
      ],
    },
    cta: { label: 'Apply: Switch to WhatsApp', action: 'select_channel:whatsapp' },
    context: 'channel_step',
  },
  {
    id: 'ins-d30-ml-wait-time',
    type: 'ml_tenant',
    category: 'timing',
    minPhase: 'day30',
    title: 'Optimal wait time: 72h between WhatsApp and AI Voice Call',
    description:
      'Your waterfall data shows that a 72-hour wait between WhatsApp and AI Voice Call steps maximizes the combined conversion rate. Shorter waits (24-48h) showed 18% lower engagement on the voice step. Longer waits (96h+) saw 12% higher drop-off.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'high', value: 0.87 },
    evidence: {
      source: 'Your waterfall performance (6 waterfalls, last 90 days)',
      dataPoints: [
        { label: '72h wait conversion', value: '12.4%' },
        { label: '48h wait conversion', value: '10.5%' },
        { label: '24h wait conversion', value: '8.8%' },
        { label: '96h+ wait conversion', value: '10.9%' },
      ],
      keyFactors: [
        'Users need time to process WhatsApp message before voice call',
        '72h aligns with typical financial decision-making cycle',
        'Voice call pickup rate peaks 3 days after initial WhatsApp',
      ],
    },
    cta: { label: 'Set 72h Wait', action: 'set_waterfall_wait:72' },
    context: 'channel_step',
  },
  {
    id: 'ins-d30-ml-tuesday',
    type: 'ml_tenant',
    category: 'timing',
    minPhase: 'day30',
    title: 'Tuesday sends outperform Friday by 24% for your audience',
    description:
      'Across your 10 campaigns, messages sent on Tuesdays achieved 24% higher engagement than Friday sends. Tuesday 10 AM is your highest-performing time slot with an 8.9% engagement rate. Friday afternoons are the weakest at 6.4%.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'high', value: 0.84 },
    evidence: {
      source: 'Your send-time analysis (10 campaigns, 4.8L messages)',
      dataPoints: [
        { label: 'Tuesday avg engagement', value: '8.9%' },
        { label: 'Wednesday avg engagement', value: '8.1%' },
        { label: 'Thursday avg engagement', value: '7.6%' },
        { label: 'Friday avg engagement', value: '6.4%' },
      ],
      keyFactors: [
        'Salaried professionals most responsive early in the work week',
        'Financial product engagement peaks Tuesday-Wednesday',
        'Friday sees highest message competition from other brands',
      ],
    },
    cta: { label: 'Schedule for Tuesday 10 AM', action: 'set_schedule:tuesday:10:00' },
    context: 'timing_step',
  },
  {
    id: 'ins-d30-ml-budget-shift',
    type: 'ml_tenant',
    category: 'budget',
    minPhase: 'day30',
    title: 'Budget optimization: shift ₹2L from SMS to WhatsApp for 31% better ROI',
    description:
      'Your data shows SMS ROI at 1.6x (₹5L spend, ₹8.2L revenue) while WhatsApp ROI is 3.4x (₹2L spend, ₹6.8L revenue). Reallocating ₹2,00,000 from SMS to WhatsApp — based on your historical channel performance — is projected to improve overall ROI by 31%.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'high', value: 0.88 },
    evidence: {
      source: 'Your budget analysis (last 60 days)',
      dataPoints: [
        { label: 'SMS ROI', value: '1.6x' },
        { label: 'SMS spend', value: 500000 },
        { label: 'SMS revenue', value: 820000 },
        { label: 'WhatsApp ROI', value: '3.4x' },
        { label: 'WhatsApp spend', value: 200000 },
        { label: 'WhatsApp revenue', value: 680000 },
        { label: 'Projected ROI improvement', value: '31%' },
      ],
      keyFactors: [
        'WhatsApp cost per conversion is 42% lower than SMS for your audience',
        'WhatsApp rich media drives higher engagement on financial products',
        'SMS DND exclusions reduce effective reach by 18%',
      ],
    },
    cta: { label: 'Apply Budget Shift', action: 'adjust_budget:sms:-200000:whatsapp:+200000' },
    context: 'budget_step',
  },
  {
    id: 'ins-d30-anomaly-delivery',
    type: 'rule',
    category: 'anomaly',
    minPhase: 'day30',
    title: 'Loan Repayment Nudge delivery rate dropped to 34% — WhatsApp template may be flagged',
    description:
      'The "Loan Repayment Nudge" campaign is experiencing a critical delivery failure. WhatsApp delivery rate has dropped from 92% (your average) to 34%. This typically indicates the WhatsApp Business template has been flagged by Meta for policy violations or the account quality rating has dropped. Immediate review and template resubmission recommended.',
    tag: { label: 'Anomaly', color: 'gray' },
    confidence: { level: 'high', value: 0.96 },
    evidence: {
      source: 'Real-time delivery monitoring — Campaign cmp-loan-repayment-nudge',
      dataPoints: [
        { label: 'Current delivery rate', value: '34%' },
        { label: 'Your average delivery rate', value: '92%' },
        { label: 'Messages affected', value: 49421 },
        { label: 'Estimated revenue impact', value: '₹8.4L lost' },
      ],
      keyFactors: [
        'Delivery rate dropped sharply 2 days ago (Mar 30)',
        'WhatsApp Business quality rating may have decreased',
        'Template content includes "loan" keyword — may trigger policy review',
        'Similar drop pattern seen when templates are flagged by Meta',
      ],
    },
    cta: { label: 'Review Campaign', action: 'navigate:/campaigns/cmp-loan-repayment-nudge' },
    context: 'dashboard',
  },
  {
    id: 'ins-d30-ml-dormant-reengagement',
    type: 'ml_tenant',
    category: 'audience',
    minPhase: 'day30',
    title: '15K dormant high-LTV users not contacted in 45 days — re-engagement opportunity',
    description:
      'Your "Dormant 60+ Days" segment contains 15,000 users with LTV above ₹15K who have not been contacted via any channel in the last 45 days. Based on your previous re-engagement campaigns, this cohort has a 5.8% predicted conversion rate and ₹4.5 projected ROI if reached via WhatsApp → AI Voice waterfall.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'medium', value: 0.78 },
    evidence: {
      source: 'Audience analysis + your campaign history',
      dataPoints: [
        { label: 'Dormant high-LTV users', value: 15000 },
        { label: 'Avg LTV', value: '₹18,500' },
        { label: 'Days since last contact', value: '45+' },
        { label: 'Predicted conversion', value: '5.8%' },
        { label: 'Projected ROI', value: '4.5x' },
      ],
      keyFactors: [
        'KYC Re-engagement campaign achieved 4.4x ROI with similar profile',
        'WhatsApp → AI Voice waterfall is optimal for high-LTV dormant users',
        'Longer dormancy window (45d+) correlates with higher receptivity to outreach',
      ],
    },
    cta: { label: 'Create Re-engagement Campaign', action: 'navigate:/campaigns/new?segment=seg-dormant-60d' },
    context: 'dashboard',
  },
  {
    id: 'ins-d30-ml-field-exec-roi',
    type: 'ml_tenant',
    category: 'channel',
    minPhase: 'day30',
    title: 'Field executive converts at 60% but costs ₹45/contact — reserve for high-value only',
    description:
      'Your field executive channel has the highest conversion rate (60%) but also the highest cost (₹45/contact). Data shows it is only ROI-positive when targeting users with LTV above ₹12K. For lower-LTV segments, AI Voice Call achieves 80% of the conversion at 18% of the cost.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'high', value: 0.90 },
    evidence: {
      source: 'Your channel cost analysis (4 campaigns with field executive)',
      dataPoints: [
        { label: 'Field exec conversion', value: '60%' },
        { label: 'Field exec cost/contact', value: '₹45' },
        { label: 'AI Voice conversion', value: '21.5%' },
        { label: 'AI Voice cost/contact', value: '₹2.50' },
        { label: 'Break-even LTV', value: '₹12,000' },
      ],
      keyFactors: [
        'EMI Collection campaign: field exec converted 63% at ₹45/contact',
        'Credit Card Activation: field exec converted 60% at ₹45/contact',
        'Cost-effective only when expected revenue per conversion exceeds ₹4,500',
      ],
    },
    context: 'channel_step',
  },
  {
    id: 'ins-d30-rule-overlap',
    type: 'rule',
    category: 'audience',
    minPhase: 'day30',
    title: '12,400 users in "Loan Offer" also targeted by "Loan Repayment Nudge" — overlap risk',
    description:
      'The active "Loan Offer — Tier 2 Salaried" campaign shares 12,400 users with the "Loan Repayment Nudge" campaign. These users may receive conflicting messages (one offering a new loan while the other nudges repayment). Consider excluding the overlap from one campaign to avoid confusion.',
    tag: { label: 'Rule', color: 'gray' },
    evidence: {
      source: 'Audience overlap detection',
      dataPoints: [
        { label: 'Overlapping users', value: 12400 },
        { label: 'Loan Offer audience', value: 120000 },
        { label: 'Loan Repayment audience', value: 78000 },
        { label: 'Overlap %', value: '10.3% / 15.9%' },
      ],
    },
    cta: { label: 'View Overlap', action: 'navigate:/analytics/overlap?campaigns=cmp-loan-offer-tier2,cmp-loan-repayment-nudge' },
    context: 'dashboard',
  },
  {
    id: 'ins-d30-ml-rcs-festive',
    type: 'ml_tenant',
    category: 'channel',
    minPhase: 'day30',
    title: 'RCS drove 2.3x more engagement than SMS in your festive campaign',
    description:
      'Your Festive Cashback Campaign showed RCS with 2.3x higher engagement than the SMS fallback. RCS rich cards with cashback visuals achieved 58% open rate vs 25% for plain SMS. For future promotional campaigns targeting all active users, lead with RCS and fall back to SMS.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'high', value: 0.85 },
    evidence: {
      source: 'Festive Cashback Campaign analysis',
      dataPoints: [
        { label: 'RCS open rate', value: '85%' },
        { label: 'SMS open rate', value: '60%' },
        { label: 'RCS engagement', value: '55%' },
        { label: 'SMS engagement', value: '17%' },
        { label: 'RCS conversions', value: 16800 },
        { label: 'SMS conversions', value: 7200 },
      ],
      keyFactors: [
        'Rich media (images, carousels) drove 3x more clicks than text-only',
        'Festive/promotional content benefits most from visual formats',
        'RCS reachability is limited to 72K users — SMS needed as fallback',
      ],
    },
    context: 'analytics',
  },
  {
    id: 'ins-d30-ml-inapp-banner-roi',
    type: 'ml_tenant',
    category: 'channel',
    minPhase: 'day30',
    title: 'In-app banners converted at 5.2% for active users — highest ROI channel at ₹0.02/impression',
    description:
      'Your data from the Festive Cashback Campaign shows in-app banners achieving a 5.2% conversion rate among active app users — the highest ROI channel at just ₹0.02 per impression. For promotions targeting your app-active base, pairing in-app banners with push notifications delivers a cost-effective 1-2 punch before escalating to SMS or WhatsApp.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'high', value: 0.86 },
    evidence: {
      source: 'Festive Cashback Campaign — in-app banner analysis',
      dataPoints: [
        { label: 'In-app banner conversion', value: '5.2%' },
        { label: 'Cost per impression', value: '₹0.02' },
        { label: 'Cost per conversion', value: '₹0.39' },
        { label: 'Active users reached', value: 46080 },
        { label: 'Conversions generated', value: 2395 },
      ],
      keyFactors: [
        'Active users in-session are highest intent — banner shown at the right moment',
        'Zero marginal infrastructure cost vs SMS/WhatsApp gateway fees',
        'Modal position drove 6.1% conversion vs 4.8% for bottom banner',
      ],
    },
    cta: { label: 'Add In-App Banner', action: 'select_channel:in_app_banner' },
    context: 'channel_step',
  },
  {
    id: 'ins-d30-ml-collection-roi',
    type: 'ml_tenant',
    category: 'budget',
    minPhase: 'day30',
    title: 'EMI Collection campaigns deliver 8.0x ROI — your highest-performing category',
    description:
      'Your EMI Collection Reminder campaign achieved 8.0x ROI (₹3.6L spent, ₹28.9L collected). Collection campaigns consistently outperform acquisition campaigns because the revenue per conversion is significantly higher (recovered EMI vs new product sale). Consider increasing collection campaign frequency.',
    tag: { label: 'Your model', color: 'green' },
    confidence: { level: 'high', value: 0.93 },
    evidence: {
      source: 'Campaign category analysis (10 campaigns)',
      dataPoints: [
        { label: 'Collection campaign ROI', value: '8.0x' },
        { label: 'Acquisition campaign avg ROI', value: '3.5x' },
        { label: 'Re-engagement campaign avg ROI', value: '4.1x' },
        { label: 'Promotional campaign avg ROI', value: '2.8x' },
      ],
      keyFactors: [
        'Collection targets users with existing obligations — higher intent',
        'AI Voice + Field Executive waterfall maximizes collection success',
        'Average collected amount per conversion: ₹19,580',
      ],
    },
    context: 'analytics',
  },
];
