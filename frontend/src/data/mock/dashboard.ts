import type { ChannelType } from '@/types';

/**
 * Dashboard "Channel Performance Sneak-Peek" rows.
 * Extracted from pages/Dashboard.tsx in Phase 1.8 (was inline; now sourced
 * from one place and consumed by the Dashboard).
 *
 * Phase 5 will replace this with values derived from baseAnalytics.channelBreakdown
 * once the Dashboard is rebuilt against the new design system.
 */
export interface DashboardChannelPerf {
  channel: ChannelType;
  sent: number;
  delivered: number;
  converted: number;
}

export const dashboardChannelPerf: DashboardChannelPerf[] = [
  { channel: 'whatsapp', sent: 142000, delivered: 136320, converted: 9262 },
  { channel: 'sms', sent: 98400, delivered: 95448, converted: 2066 },
  { channel: 'ai_voice', sent: 34200, delivered: 29070, converted: 2462 },
  { channel: 'push_notification', sent: 52800, delivered: 50160, converted: 1848 },
  { channel: 'rcs', sent: 18600, delivered: 17670, converted: 781 },
  { channel: 'in_app_banner', sent: 31400, delivered: 31400, converted: 1634 },
  { channel: 'field_executive', sent: 8200, delivered: 8200, converted: 1828 },
];
