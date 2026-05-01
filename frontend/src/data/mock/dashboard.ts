import type { ChannelType } from '@/types';

/**
 * Dashboard "Channel Performance Sneak-Peek" rows.
 * Extracted from pages/Dashboard.tsx in Phase 1.8 (was inline; now sourced
 * from one place and consumed by the Dashboard).
 *
 * Phase 5 will replace this with values derived from baseAnalytics.channelBreakdown
 * once the Dashboard is rebuilt against the new design system.
 */
export type DashboardChannelKey = ChannelType | 'email';

export interface DashboardChannelPerf {
  channel: DashboardChannelKey;
  sent: number;
  delivered: number;
  converted: number;
}

export const dashboardChannelPerf: DashboardChannelPerf[] = [
  { channel: 'whatsapp', sent: 142000, delivered: 136320, converted: 9262 },
  { channel: 'sms', sent: 98400, delivered: 95448, converted: 2066 },
  { channel: 'ai_voice', sent: 34200, delivered: 29070, converted: 2462 },
  { channel: 'rcs', sent: 18600, delivered: 17670, converted: 781 },
  { channel: 'email', sent: 76500, delivered: 73950, converted: 2810 },
];
