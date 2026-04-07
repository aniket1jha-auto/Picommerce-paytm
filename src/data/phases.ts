import type { PhaseDefinition } from '@/types';

export const phases: PhaseDefinition[] = [
  {
    id: 'day0',
    label: 'Day 0',
    subtitle: 'Rules Engine',
    description:
      'Platform is freshly deployed. No campaign history or ML models available. Intelligence comes from rules: budget calculations, DND filtering, overlap detection, compliance checks, and character count warnings. Works immediately with zero data.',
  },
  {
    id: 'day1',
    label: 'Day 1',
    subtitle: 'Data Connected',
    description:
      'Enterprise data sources are integrated. Audience profiling, segment sizing, reachability analysis, and data quality insights are available. Platform-wide ML models (trained on Paytm internal data) provide directional channel and timing recommendations.',
  },
  {
    id: 'day30',
    label: 'Day 30+',
    subtitle: 'Full Intelligence',
    description:
      'Tenant has run 10+ campaigns. Full analytics, trend analysis, anomaly detection, and tenant-specific ML models are active. Recommendations are personalized with high confidence based on the tenant\'s own campaign data.',
  },
];
