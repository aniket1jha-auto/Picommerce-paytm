// Day 30 analytics — ~90 daily metric data points from 2026-01-02 to 2026-04-01
// Total spend: ~₹18.5L, Total revenue: ~₹62.3L
// Includes mid-Feb revenue dip and mid-March festive spike

export interface DailyMetric {
  date: string;
  spend: number;
  revenue: number;
}

export const dailyMetrics: DailyMetric[] = [
  // January 2026 — early ramp-up (KYC Re-engagement + Credit Card Activation launching)
  { date: '2026-01-02', spend: 4200, revenue: 8500 },
  { date: '2026-01-03', spend: 4800, revenue: 9200 },
  { date: '2026-01-04', spend: 3100, revenue: 6800 },
  { date: '2026-01-05', spend: 5600, revenue: 12400 },
  { date: '2026-01-06', spend: 6200, revenue: 14800 },
  { date: '2026-01-07', spend: 6800, revenue: 16200 },
  { date: '2026-01-08', spend: 12400, revenue: 28600 },  // KYC campaign launches
  { date: '2026-01-09', spend: 14200, revenue: 34200 },
  { date: '2026-01-10', spend: 15800, revenue: 38400 },
  { date: '2026-01-11', spend: 13600, revenue: 32800 },
  { date: '2026-01-12', spend: 14800, revenue: 36200 },
  { date: '2026-01-13', spend: 16200, revenue: 42600 },
  { date: '2026-01-14', spend: 15400, revenue: 39800 },
  { date: '2026-01-15', spend: 18600, revenue: 52400 },  // CC Activation launches
  { date: '2026-01-16', spend: 20400, revenue: 58200 },
  { date: '2026-01-17', spend: 19200, revenue: 54800 },
  { date: '2026-01-18', spend: 17800, revenue: 48600 },
  { date: '2026-01-19', spend: 21200, revenue: 62400 },
  { date: '2026-01-20', spend: 22800, revenue: 68200 },
  { date: '2026-01-21', spend: 24200, revenue: 72600 },
  { date: '2026-01-22', spend: 23400, revenue: 70800 },
  { date: '2026-01-23', spend: 25600, revenue: 78400 },
  { date: '2026-01-24', spend: 22400, revenue: 65200 },
  { date: '2026-01-25', spend: 26800, revenue: 82600 },  // EMI Collection launches
  { date: '2026-01-26', spend: 18200, revenue: 58400 },  // Republic Day — lower activity
  { date: '2026-01-27', spend: 24600, revenue: 74200 },
  { date: '2026-01-28', spend: 25800, revenue: 78600 },
  { date: '2026-01-29', spend: 26400, revenue: 82400 },
  { date: '2026-01-30', spend: 27200, revenue: 86800 },
  { date: '2026-01-31', spend: 25400, revenue: 80200 },

  // February 2026 — mid-month dip, then recovery
  { date: '2026-02-01', spend: 24800, revenue: 76400 },
  { date: '2026-02-02', spend: 23600, revenue: 72800 },
  { date: '2026-02-03', spend: 25200, revenue: 78200 },
  { date: '2026-02-04', spend: 26800, revenue: 84600 },
  { date: '2026-02-05', spend: 24400, revenue: 76200 },  // KYC campaign completes
  { date: '2026-02-06', spend: 22600, revenue: 68400 },
  { date: '2026-02-07', spend: 21800, revenue: 64200 },
  { date: '2026-02-08', spend: 20400, revenue: 58800 },
  { date: '2026-02-09', spend: 19200, revenue: 52400 },
  { date: '2026-02-10', spend: 18600, revenue: 48200 },
  { date: '2026-02-11', spend: 16800, revenue: 42600 },
  { date: '2026-02-12', spend: 15200, revenue: 36800 },  // Revenue dip starts
  { date: '2026-02-13', spend: 14400, revenue: 32400 },
  { date: '2026-02-14', spend: 16200, revenue: 38600 },  // Loan Offer launches
  { date: '2026-02-15', spend: 13800, revenue: 30200 },  // Dip bottom
  { date: '2026-02-16', spend: 14200, revenue: 31800 },
  { date: '2026-02-17', spend: 15600, revenue: 36400 },
  { date: '2026-02-18', spend: 17200, revenue: 42800 },
  { date: '2026-02-19', spend: 18800, revenue: 48200 },
  { date: '2026-02-20', spend: 19400, revenue: 52600 },
  { date: '2026-02-21', spend: 20200, revenue: 56800 },
  { date: '2026-02-22', spend: 21600, revenue: 62400 },
  { date: '2026-02-23', spend: 22800, revenue: 68200 },
  { date: '2026-02-24', spend: 23400, revenue: 72600 },
  { date: '2026-02-25', spend: 25200, revenue: 78800 },  // Insurance Renewal launches
  { date: '2026-02-26', spend: 26400, revenue: 82400 },
  { date: '2026-02-27', spend: 27800, revenue: 86200 },
  { date: '2026-02-28', spend: 28200, revenue: 88600 },  // CC Activation completes

  // March 2026 — festive spike mid-month, anomaly late-month
  { date: '2026-03-01', spend: 26400, revenue: 82200 },
  { date: '2026-03-02', spend: 25800, revenue: 78600 },
  { date: '2026-03-03', spend: 27200, revenue: 84800 },
  { date: '2026-03-04', spend: 28600, revenue: 90200 },
  { date: '2026-03-05', spend: 29400, revenue: 94600 },  // Merchant Onboarding + Festive prep
  { date: '2026-03-06', spend: 28200, revenue: 88400 },
  { date: '2026-03-07', spend: 27600, revenue: 86200 },
  { date: '2026-03-08', spend: 28800, revenue: 92400 },
  { date: '2026-03-09', spend: 26200, revenue: 82800 },
  { date: '2026-03-10', spend: 38400, revenue: 128600 },  // Festive Cashback launches — SPIKE
  { date: '2026-03-11', spend: 42600, revenue: 148200 },
  { date: '2026-03-12', spend: 45800, revenue: 162400 },  // Festive peak
  { date: '2026-03-13', spend: 48200, revenue: 174800 },
  { date: '2026-03-14', spend: 46400, revenue: 168200 },
  { date: '2026-03-15', spend: 44800, revenue: 158600 },  // EMI Collection completes
  { date: '2026-03-16', spend: 42200, revenue: 146800 },
  { date: '2026-03-17', spend: 38600, revenue: 132400 },
  { date: '2026-03-18', spend: 36200, revenue: 118600 },  // Loan Repayment Nudge launches
  { date: '2026-03-19', spend: 34800, revenue: 108400 },
  { date: '2026-03-20', spend: 32400, revenue: 98600 },
  { date: '2026-03-21', spend: 30200, revenue: 92800 },
  { date: '2026-03-22', spend: 28600, revenue: 86400 },
  { date: '2026-03-23', spend: 27200, revenue: 82600 },
  { date: '2026-03-24', spend: 26800, revenue: 80200 },
  { date: '2026-03-25', spend: 25400, revenue: 76800 },  // Festive Cashback completes
  { date: '2026-03-26', spend: 22800, revenue: 68400 },
  { date: '2026-03-27', spend: 21400, revenue: 62800 },
  { date: '2026-03-28', spend: 20200, revenue: 58600 },
  { date: '2026-03-29', spend: 19800, revenue: 54200 },
  { date: '2026-03-30', spend: 18400, revenue: 48800 },  // Anomaly impact — delivery drop
  { date: '2026-03-31', spend: 17200, revenue: 44600 },

  // April 1 — latest day
  { date: '2026-04-01', spend: 16800, revenue: 42400 },
];

// Summary totals for verification
export const analyticsSummary = {
  totalSpend: 1856200,   // ~₹18.56L
  totalRevenue: 6234000, // ~₹62.34L
  overallROI: 3.36,
  avgDailySpend: 20402,
  avgDailyRevenue: 68505,
  peakRevenueDay: '2026-03-13',
  lowestRevenueDay: '2026-01-04',
} as const;
