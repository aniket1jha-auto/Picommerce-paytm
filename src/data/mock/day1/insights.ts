// Day 1 insights — profiling + platform-wide ML. Data sources connected, no campaigns yet.

import type { Insight } from '../day0/insights';

export const day1Insights: Insight[] = [
  {
    id: 'ins-d1-profile-sync',
    type: 'profiling',
    category: 'audience',
    minPhase: 'day1',
    title: '2.4L users synced — 1.65L WhatsApp reachable',
    description:
      'Your data sources are connected and 2,40,000 user records have been imported. Channel reachability: 2.28L via SMS, 1.65L via WhatsApp, 1.12L via email. WhatsApp offers the best combination of reach and engagement for your audience profile.',
    tag: { label: 'Data profile', color: 'gray' },
    evidence: {
      source: 'Your connected data sources',
      dataPoints: [
        { label: 'Total users synced', value: 240000 },
        { label: 'SMS reachable', value: 228000 },
        { label: 'WhatsApp reachable', value: 165000 },
        { label: 'Email reachable', value: 112000 },
        { label: 'RCS reachable', value: 72000 },
      ],
    },
    context: 'dashboard',
  },
  {
    id: 'ins-d1-profile-dataquality',
    type: 'profiling',
    category: 'audience',
    minPhase: 'day1',
    title: 'Data quality: 3,200 users missing phone numbers',
    description:
      'During data profiling, 3,200 user records were found without valid phone numbers — these users are unreachable via SMS, WhatsApp, and AI Voice. Additionally, 1,800 records have phone numbers in an invalid format. Consider enriching these records via your CRM or feature store.',
    tag: { label: 'Data quality', color: 'gray' },
    evidence: {
      source: 'Data profiling — Snowflake + Salesforce sync',
      dataPoints: [
        { label: 'Missing phone number', value: 3200 },
        { label: 'Invalid phone format', value: 1800 },
        { label: 'Missing email', value: 12400 },
        { label: 'Missing LTV score', value: '5% of records' },
      ],
    },
    cta: { label: 'View Data Quality Report', action: 'navigate:/settings/data-quality' },
    context: 'dashboard',
  },
  {
    id: 'ins-d1-profile-segment-preview',
    type: 'profiling',
    category: 'audience',
    minPhase: 'day1',
    title: 'Metro High-LTV segment: 72% male, avg age 32, 68% metro tier',
    description:
      'Your "Metro High-LTV Active" segment (45K users) profiles as: 72% male, average age 32, 68% concentrated in Mumbai and Delhi NCR, average LTV ₹14,200. Strong digital adoption — 80% WhatsApp reachable.',
    tag: { label: 'Data profile', color: 'gray' },
    evidence: {
      source: 'Segment profiling — Metro High-LTV Active',
      dataPoints: [
        { label: 'Segment size', value: 45000 },
        { label: 'Male %', value: '72%' },
        { label: 'Avg age', value: 32 },
        { label: 'Top cities', value: 'Mumbai, Delhi NCR, Bangalore' },
        { label: 'Avg LTV', value: '₹14,200' },
        { label: 'WhatsApp reachable', value: '80%' },
      ],
    },
    context: 'audience_step',
  },
  {
    id: 'ins-d1-ml-channel-propensity',
    type: 'ml_platform',
    category: 'channel',
    minPhase: 'day1',
    title: 'Users with this profile engage 2.8x more on WhatsApp vs SMS',
    description:
      'Platform model analysis indicates that users matching your Metro High-LTV profile (metro, 25-35, high LTV) have 2.8x higher engagement on WhatsApp compared to SMS. This is based on aggregated data across the platform — not personalized to your campaigns yet.',
    tag: { label: 'Platform model', color: 'amber' },
    confidence: { level: 'medium', value: 0.72 },
    evidence: {
      source: 'Platform-wide benchmarks (320 campaigns across tenants)',
      dataPoints: [
        { label: 'WhatsApp avg engagement', value: '5.9%' },
        { label: 'SMS avg engagement', value: '2.1%' },
        { label: 'Profile match', value: 'Metro, 25-35, High LTV' },
        { label: 'Campaigns analyzed', value: 320 },
      ],
      keyFactors: [
        'Metro users have higher WhatsApp adoption (92% vs 78% overall)',
        'High-LTV users prefer rich media interactions',
        'Age 25-35 is the highest WhatsApp DAU cohort',
      ],
    },
    cta: { label: 'Consider WhatsApp', action: 'select_channel:whatsapp' },
    context: 'channel_step',
  },
  {
    id: 'ins-d1-ml-sendtime',
    type: 'ml_platform',
    category: 'timing',
    minPhase: 'day1',
    title: '10AM-12PM sends show 23% higher engagement (platform-wide)',
    description:
      'Across the platform, campaigns sent between 10 AM and 12 PM consistently show 23% higher open and engagement rates compared to afternoon sends. This pattern is strongest for financial services messaging and salaried professional segments.',
    tag: { label: 'Platform model', color: 'amber' },
    confidence: { level: 'medium', value: 0.68 },
    evidence: {
      source: 'Platform-wide time-series analysis (480 campaigns)',
      dataPoints: [
        { label: '10AM-12PM avg engagement', value: '8.4%' },
        { label: '1PM-3PM avg engagement', value: '6.8%' },
        { label: '4PM-6PM avg engagement', value: '7.1%' },
        { label: 'Campaigns analyzed', value: 480 },
      ],
      keyFactors: [
        'Salaried professionals check phones during morning commute and tea break',
        'Financial decision-making peaks in late morning hours',
        'Weekend performance varies — Saturday mornings perform well for non-finance',
      ],
    },
    cta: { label: 'Schedule for 10 AM', action: 'set_schedule:10:00' },
    context: 'timing_step',
  },
  {
    id: 'ins-d1-ml-waterfall-cost',
    type: 'ml_platform',
    category: 'channel',
    minPhase: 'day1',
    title: 'Adding WhatsApp before AI Voice reduces cost-per-conversion by ~22%',
    description:
      'Platform model shows that waterfalls starting with WhatsApp before escalating to AI Voice Call achieve 22% lower cost-per-conversion than going directly to AI Voice. WhatsApp filters out responders cheaply (₹1.05/msg) before the expensive AI Voice step (₹3.50/call).',
    tag: { label: 'Platform model', color: 'amber' },
    confidence: { level: 'medium', value: 0.70 },
    evidence: {
      source: 'Platform waterfall analysis (145 waterfalls)',
      dataPoints: [
        { label: 'WhatsApp → AI Voice CPC', value: '₹38' },
        { label: 'Direct AI Voice CPC', value: '₹49' },
        { label: 'Cost reduction', value: '22%' },
        { label: 'Waterfalls analyzed', value: 145 },
      ],
      keyFactors: [
        'WhatsApp resolves 35-40% of users before AI Voice step',
        'AI Voice is 3.3x more expensive per contact than WhatsApp',
        'Users who respond to WhatsApp first have 15% higher voice call pickup rate',
      ],
    },
    cta: { label: 'Add WhatsApp Step', action: 'add_waterfall_step:whatsapp' },
    context: 'channel_step',
  },
  {
    id: 'ins-d1-ml-conversion-range',
    type: 'ml_platform',
    category: 'audience',
    minPhase: 'day1',
    title: 'Estimated conversion rate: 3.5–5.2% for this audience-channel combination',
    description:
      'Based on platform-wide models, your selected audience (Tier-2 Salaried 25-35) combined with SMS + WhatsApp channels is projected to achieve a 3.5–5.2% conversion rate. This is a directional range — your actual results may differ. The estimate will narrow after you run 5+ campaigns.',
    tag: { label: 'Platform model', color: 'amber' },
    confidence: { level: 'low', value: 0.55 },
    evidence: {
      source: 'Platform conversion model (Tier-2, Salaried, 25-35 cohort)',
      dataPoints: [
        { label: 'Predicted conversion range', value: '3.5–5.2%' },
        { label: 'Similar audience campaigns', value: 87 },
        { label: 'Median conversion in cohort', value: '4.1%' },
        { label: 'Revenue per conversion (est)', value: '₹850–₹1,200' },
      ],
    },
    context: 'audience_step',
  },
  {
    id: 'ins-d1-ml-push-vs-sms',
    type: 'ml_platform',
    category: 'channel',
    minPhase: 'day1',
    title: 'Push notifications show 3.5x higher engagement than SMS for app-installed users at 1/5th the cost',
    description:
      'Platform model analysis shows that for users with your app installed and notifications enabled, push notifications achieve 3.5x higher engagement than SMS — at only ₹0.10/notification vs ₹0.15/SMS. For app-active segments, leading with push before falling back to SMS can significantly reduce cost-per-engagement.',
    tag: { label: 'Platform model', color: 'amber' },
    confidence: { level: 'medium', value: 0.71 },
    evidence: {
      source: 'Platform-wide benchmarks (320 campaigns across tenants)',
      dataPoints: [
        { label: 'Push notification avg engagement', value: '7.3%' },
        { label: 'SMS avg engagement', value: '2.1%' },
        { label: 'Push cost per message', value: '₹0.10' },
        { label: 'SMS cost per message', value: '₹0.15' },
        { label: 'Users with push enabled (est)', value: '55%' },
      ],
      keyFactors: [
        'App-installed users have higher product engagement baseline',
        'Push notifications appear on lock screen without unlocking — high visibility',
        'Cost savings allow broader A/B testing across audience subsets',
      ],
    },
    cta: { label: 'Add Push Notification', action: 'select_channel:push_notification' },
    context: 'channel_step',
  },
  {
    id: 'ins-d1-profile-freshness',
    type: 'profiling',
    category: 'audience',
    minPhase: 'day1',
    title: 'Data freshness: Salesforce CRM last synced 2 hours ago',
    description:
      'Your three data sources are synced and up to date. Snowflake: synced 45 minutes ago (2,40,000 records). Salesforce: synced 2 hours ago (1,86,000 records). Feature Store: synced 30 minutes ago (2,40,000 feature vectors). All sources are healthy.',
    tag: { label: 'Data profile', color: 'gray' },
    evidence: {
      source: 'Data source monitoring',
      dataPoints: [
        { label: 'Snowflake records', value: 240000 },
        { label: 'Salesforce records', value: 186000 },
        { label: 'Feature Store vectors', value: 240000 },
        { label: 'Oldest sync', value: '2 hours ago' },
      ],
    },
    context: 'dashboard',
  },
];
