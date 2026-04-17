// Day 30 campaigns — 10 campaigns with full metrics, channel breakdowns, and sparkline trends

export type ChannelType = 'sms' | 'whatsapp' | 'rcs' | 'ai_voice' | 'field_executive' | 'push_notification' | 'in_app_banner';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';

export interface ChannelMetric {
  sent: number;
  delivered: number;
  opened: number;
  engaged: number;
  converted: number;
  cost: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  launchedAt?: string;
  completedAt?: string;
  audience: {
    segmentId: string;
    segmentName: string;
    totalUsers: number;
    reachableUsers: number;
  };
  channels: ChannelType[];
  waterfallId?: string;
  budget: { allocated: number; spent: number; projectedTotal: number };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    engaged: number;
    converted: number;
    revenue: number;
  };
  channelMetrics: Partial<Record<ChannelType, ChannelMetric>>;
  costPerConversion: number;
  roi: number;
  revenueLabel: 'revenue' | 'collected';
  trend: number[];
  anomaly?: { type: string; description: string; severity: 'warning' | 'critical' };
}

export const day30Campaigns: Campaign[] = [
  // 1. KYC Re-engagement — Metro High-LTV
  {
    id: 'cmp-kyc-reengagement',
    name: 'KYC Re-engagement — Metro High-LTV',
    status: 'completed',
    createdAt: '2026-01-05T10:00:00+05:30',
    launchedAt: '2026-01-08T10:00:00+05:30',
    completedAt: '2026-02-05T18:00:00+05:30',
    audience: {
      segmentId: 'seg-metro-high-ltv',
      segmentName: 'Metro High-LTV Active',
      totalUsers: 45000,
      reachableUsers: 43200,
    },
    channels: ['whatsapp', 'ai_voice', 'field_executive'],
    waterfallId: 'wf-kyc-reengagement',
    budget: { allocated: 500000, spent: 420000, projectedTotal: 420000 },
    metrics: {
      sent: 43200,
      delivered: 41040,
      opened: 32832,
      engaged: 22320,
      converted: 8640,
      revenue: 1860000,
    },
    channelMetrics: {
      whatsapp: {
        sent: 43200,
        delivered: 41040,
        opened: 32832,
        engaged: 18450,
        converted: 5400,
        cost: 28080,
      },
      ai_voice: {
        sent: 14200,
        delivered: 13490,
        opened: 13490,
        engaged: 6100,
        converted: 2160,
        cost: 35500,
      },
      field_executive: {
        sent: 3800,
        delivered: 3800,
        opened: 3800,
        engaged: 2520,
        converted: 1080,
        cost: 171000,
      },
    },
    costPerConversion: 48.61,
    roi: 4.4,
    revenueLabel: 'revenue',
    trend: [120, 280, 450, 620, 780, 940, 1050, 1180, 1320, 1440, 1550, 1620, 1710, 1780, 1830, 1860],
  },

  // 2. Loan Offer — Tier 2 Salaried
  {
    id: 'cmp-loan-offer-tier2',
    name: 'Loan Offer — Tier 2 Salaried',
    status: 'active',
    createdAt: '2026-02-10T09:00:00+05:30',
    launchedAt: '2026-02-14T10:00:00+05:30',
    audience: {
      segmentId: 'seg-tier2-salaried',
      segmentName: 'Tier-2 Salaried 25-35',
      totalUsers: 120000,
      reachableUsers: 115200,
    },
    channels: ['sms', 'whatsapp'],
    budget: { allocated: 450000, spent: 380000, projectedTotal: 420000 },
    metrics: {
      sent: 115200,
      delivered: 108864,
      opened: 76205,
      engaged: 41280,
      converted: 7200,
      revenue: 1210000,
    },
    channelMetrics: {
      sms: {
        sent: 115200,
        delivered: 103680,
        opened: 62208,
        engaged: 24000,
        converted: 3600,
        cost: 28800,
      },
      whatsapp: {
        sent: 52000,
        delivered: 49400,
        opened: 39520,
        engaged: 17280,
        converted: 3600,
        cost: 33800,
      },
    },
    costPerConversion: 52.78,
    roi: 3.2,
    revenueLabel: 'revenue',
    trend: [80, 160, 310, 440, 580, 690, 760, 830, 890, 940, 980, 1020, 1080, 1120, 1150, 1180, 1210],
  },

  // 3. Insurance Renewal Reminder
  {
    id: 'cmp-insurance-renewal',
    name: 'Insurance Renewal Reminder',
    status: 'active',
    createdAt: '2026-02-20T11:00:00+05:30',
    launchedAt: '2026-02-25T09:30:00+05:30',
    audience: {
      segmentId: 'seg-insurance-renewal',
      segmentName: 'Insurance Renewal Due < 15 Days',
      totalUsers: 32000,
      reachableUsers: 30400,
    },
    channels: ['whatsapp', 'ai_voice'],
    waterfallId: 'wf-insurance-renewal',
    budget: { allocated: 220000, spent: 190000, projectedTotal: 210000 },
    metrics: {
      sent: 30400,
      delivered: 28880,
      opened: 23104,
      engaged: 15200,
      converted: 4800,
      revenue: 720000,
    },
    channelMetrics: {
      whatsapp: {
        sent: 30400,
        delivered: 28880,
        opened: 23104,
        engaged: 12160,
        converted: 3200,
        cost: 19760,
      },
      ai_voice: {
        sent: 9600,
        delivered: 9120,
        opened: 9120,
        engaged: 4800,
        converted: 1600,
        cost: 24000,
      },
    },
    costPerConversion: 39.58,
    roi: 3.8,
    revenueLabel: 'revenue',
    trend: [40, 95, 170, 260, 350, 420, 490, 540, 590, 620, 650, 680, 700, 720],
  },

  // 4. Credit Card Activation
  {
    id: 'cmp-cc-activation',
    name: 'Credit Card Activation',
    status: 'completed',
    createdAt: '2026-01-12T14:00:00+05:30',
    launchedAt: '2026-01-15T10:00:00+05:30',
    completedAt: '2026-02-28T18:00:00+05:30',
    audience: {
      segmentId: 'seg-cc-inactive',
      segmentName: 'Credit Card Issued — Not Activated',
      totalUsers: 28000,
      reachableUsers: 27200,
    },
    channels: ['sms', 'whatsapp', 'ai_voice', 'field_executive'],
    waterfallId: 'wf-cc-activation',
    budget: { allocated: 600000, spent: 510000, projectedTotal: 510000 },
    metrics: {
      sent: 27200,
      delivered: 26112,
      opened: 21516,
      engaged: 16320,
      converted: 8960,
      revenue: 2650000,
    },
    channelMetrics: {
      sms: {
        sent: 27200,
        delivered: 24480,
        opened: 14688,
        engaged: 6800,
        converted: 2240,
        cost: 6800,
      },
      whatsapp: {
        sent: 15200,
        delivered: 14440,
        opened: 11552,
        engaged: 6080,
        converted: 2800,
        cost: 9880,
      },
      ai_voice: {
        sent: 7600,
        delivered: 7220,
        opened: 7220,
        engaged: 3800,
        converted: 2240,
        cost: 19000,
      },
      field_executive: {
        sent: 2800,
        delivered: 2800,
        opened: 2800,
        engaged: 1960,
        converted: 1680,
        cost: 126000,
      },
    },
    costPerConversion: 56.92,
    roi: 5.2,
    revenueLabel: 'revenue',
    trend: [150, 340, 560, 780, 1020, 1260, 1450, 1620, 1780, 1920, 2060, 2180, 2290, 2380, 2460, 2530, 2590, 2620, 2650],
  },

  // 5. Merchant Onboarding — New City Launch
  {
    id: 'cmp-merchant-onboarding',
    name: 'Merchant Onboarding — New City Launch',
    status: 'active',
    createdAt: '2026-03-01T10:00:00+05:30',
    launchedAt: '2026-03-05T09:00:00+05:30',
    audience: {
      segmentId: 'seg-new-city-jaipur',
      segmentName: 'New City Launch — Jaipur',
      totalUsers: 8000,
      reachableUsers: 7680,
    },
    channels: ['ai_voice', 'field_executive'],
    budget: { allocated: 280000, spent: 240000, projectedTotal: 270000 },
    metrics: {
      sent: 7680,
      delivered: 7296,
      opened: 7296,
      engaged: 4608,
      converted: 1920,
      revenue: 680000,
    },
    channelMetrics: {
      ai_voice: {
        sent: 7680,
        delivered: 7296,
        opened: 7296,
        engaged: 3840,
        converted: 1200,
        cost: 19200,
      },
      field_executive: {
        sent: 2400,
        delivered: 2400,
        opened: 2400,
        engaged: 1680,
        converted: 720,
        cost: 108000,
      },
    },
    costPerConversion: 125.0,
    roi: 2.8,
    revenueLabel: 'revenue',
    trend: [30, 75, 140, 220, 310, 380, 430, 480, 520, 560, 600, 630, 655, 680],
  },

  // 6. Festive Cashback Campaign
  {
    id: 'cmp-festive-cashback',
    name: 'Festive Cashback Campaign',
    status: 'completed',
    createdAt: '2026-03-05T10:00:00+05:30',
    launchedAt: '2026-03-10T08:00:00+05:30',
    completedAt: '2026-03-25T23:59:00+05:30',
    audience: {
      segmentId: 'seg-all-active',
      segmentName: 'All Active Users',
      totalUsers: 120000,
      reachableUsers: 115200,
    },
    channels: ['rcs', 'sms', 'push_notification', 'in_app_banner'],
    budget: { allocated: 1400000, spent: 1240000, projectedTotal: 1240000 },
    metrics: {
      sent: 115200,
      delivered: 109440,
      opened: 87552,
      engaged: 57600,
      converted: 24000,
      revenue: 3410000,
    },
    channelMetrics: {
      rcs: {
        sent: 72000,
        delivered: 68400,
        opened: 58140,
        engaged: 39600,
        converted: 16800,
        cost: 28800,
      },
      sms: {
        sent: 115200,
        delivered: 103680,
        opened: 62208,
        engaged: 18000,
        converted: 7200,
        cost: 28800,
      },
      push_notification: {
        sent: 63360,
        delivered: 61200,
        opened: 33660,
        engaged: 19008,
        converted: 2217,
        cost: 3168,
      },
      in_app_banner: {
        sent: 46080,
        delivered: 46080,
        opened: 41472,
        engaged: 27648,
        converted: 2395,
        cost: 922,
      },
    },
    costPerConversion: 51.67,
    roi: 2.8,
    revenueLabel: 'revenue',
    trend: [200, 520, 890, 1280, 1640, 1980, 2240, 2480, 2680, 2840, 2960, 3080, 3180, 3280, 3350, 3410],
  },

  // 7. UPI Autopay Setup
  {
    id: 'cmp-upi-autopay',
    name: 'UPI Autopay Setup',
    status: 'paused',
    createdAt: '2026-03-08T11:00:00+05:30',
    launchedAt: '2026-03-12T10:00:00+05:30',
    audience: {
      segmentId: 'seg-upi-no-autopay',
      segmentName: 'Active UPI — No Autopay',
      totalUsers: 67000,
      reachableUsers: 64320,
    },
    channels: ['whatsapp', 'sms'],
    budget: { allocated: 150000, spent: 110000, projectedTotal: 160000 },
    metrics: {
      sent: 64320,
      delivered: 61107,
      opened: 42774,
      engaged: 19296,
      converted: 3840,
      revenue: 320000,
    },
    channelMetrics: {
      whatsapp: {
        sent: 64320,
        delivered: 61107,
        opened: 42774,
        engaged: 15456,
        converted: 2560,
        cost: 41808,
      },
      sms: {
        sent: 28800,
        delivered: 25920,
        opened: 15552,
        engaged: 3840,
        converted: 1280,
        cost: 7200,
      },
    },
    costPerConversion: 28.65,
    roi: 2.9,
    revenueLabel: 'revenue',
    trend: [20, 50, 90, 130, 170, 200, 225, 248, 265, 280, 295, 308, 315, 320],
  },

  // 8. Gold Savings — First Purchase (Draft — no metrics)
  {
    id: 'cmp-gold-savings',
    name: 'Gold Savings — First Purchase',
    status: 'draft',
    createdAt: '2026-03-28T15:00:00+05:30',
    audience: {
      segmentId: 'seg-gold-prospects',
      segmentName: 'Gold Savings Prospects',
      totalUsers: 52000,
      reachableUsers: 49920,
    },
    channels: ['whatsapp', 'ai_voice', 'push_notification'],
    budget: { allocated: 350000, spent: 0, projectedTotal: 340000 },
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      engaged: 0,
      converted: 0,
      revenue: 0,
    },
    channelMetrics: {},
    costPerConversion: 0,
    roi: 0,
    revenueLabel: 'revenue',
    trend: [],
  },

  // 9. EMI Collection Reminder
  {
    id: 'cmp-emi-collection',
    name: 'EMI Collection Reminder',
    status: 'completed',
    createdAt: '2026-01-20T10:00:00+05:30',
    launchedAt: '2026-01-25T09:00:00+05:30',
    completedAt: '2026-03-15T18:00:00+05:30',
    audience: {
      segmentId: 'seg-emi-overdue',
      segmentName: 'EMI Overdue 7+ Days',
      totalUsers: 41000,
      reachableUsers: 39360,
    },
    channels: ['ai_voice', 'sms', 'field_executive'],
    waterfallId: 'wf-emi-collection',
    budget: { allocated: 400000, spent: 360000, projectedTotal: 360000 },
    metrics: {
      sent: 39360,
      delivered: 37392,
      opened: 31884,
      engaged: 23616,
      converted: 14760,
      revenue: 2890000,
    },
    channelMetrics: {
      ai_voice: {
        sent: 39360,
        delivered: 37392,
        opened: 37392,
        engaged: 18000,
        converted: 8200,
        cost: 98400,
      },
      sms: {
        sent: 18400,
        delivered: 16560,
        opened: 9936,
        engaged: 4416,
        converted: 3280,
        cost: 4600,
      },
      field_executive: {
        sent: 5200,
        delivered: 5200,
        opened: 5200,
        engaged: 3640,
        converted: 3280,
        cost: 234000,
      },
    },
    costPerConversion: 24.39,
    roi: 8.0,
    revenueLabel: 'collected',
    trend: [80, 220, 420, 640, 860, 1080, 1280, 1460, 1640, 1810, 1960, 2100, 2240, 2380, 2500, 2610, 2710, 2790, 2850, 2890],
  },

  // 10. Loan Repayment Nudge (ANOMALY)
  {
    id: 'cmp-loan-repayment-nudge',
    name: 'Loan Repayment Nudge',
    status: 'active',
    createdAt: '2026-03-15T10:00:00+05:30',
    launchedAt: '2026-03-18T10:00:00+05:30',
    audience: {
      segmentId: 'seg-loan-repayment-due',
      segmentName: 'Loan Repayment Due 7-15 Days',
      totalUsers: 78000,
      reachableUsers: 74880,
    },
    channels: ['whatsapp', 'sms'],
    budget: { allocated: 250000, spent: 210000, projectedTotal: 280000 },
    metrics: {
      sent: 74880,
      delivered: 25459,
      opened: 17821,
      engaged: 10486,
      converted: 4494,
      revenue: 480000,
    },
    channelMetrics: {
      whatsapp: {
        sent: 74880,
        delivered: 25459,
        opened: 17821,
        engaged: 8240,
        converted: 3000,
        cost: 48672,
      },
      sms: {
        sent: 42000,
        delivered: 37800,
        opened: 22680,
        engaged: 6720,
        converted: 1494,
        cost: 10500,
      },
    },
    costPerConversion: 46.73,
    roi: 2.3,
    revenueLabel: 'revenue',
    trend: [30, 70, 120, 180, 240, 290, 320, 340, 355, 370, 390, 410, 430, 450, 465, 480],
    anomaly: {
      type: 'delivery_drop',
      description:
        'WhatsApp delivery rate dropped to 34% (expected: 92%). The WhatsApp Business template for this campaign may have been flagged or rate-limited by Meta. Immediate review recommended.',
      severity: 'critical',
    },
  },
];
