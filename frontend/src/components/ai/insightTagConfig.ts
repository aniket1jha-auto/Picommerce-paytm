import type { InsightTag } from '@/types';

interface TagConfig {
  label: string;
  color: 'gray' | 'amber' | 'green';
}

export const insightTagConfig: Record<InsightTag, TagConfig> = {
  rule: { label: 'Rules', color: 'gray' },
  data_profile: { label: 'Rules', color: 'gray' },
  platform_model: { label: 'Platform model', color: 'amber' },
  your_model: { label: 'Your model', color: 'green' },
};

/** Map an InsightTag to the border/accent color used in cards */
export const insightTagBorderColor: Record<InsightTag, string> = {
  rule: '#9CA3AF',
  data_profile: '#9CA3AF',
  platform_model: '#D97706',
  your_model: '#16A34A',
};
