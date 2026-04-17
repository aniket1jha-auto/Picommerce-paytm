import type { Segment } from '@/types';
import type { ChannelType } from '@/types';
import { PhaseGate } from '@/components/ai/PhaseGate';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { formatCount } from '@/utils/format';

interface ReachabilityCardProps {
  segment: Segment;
}

const CHANNEL_COLORS: Record<ChannelType, string> = {
  sms: '#6366F1',
  whatsapp: '#25D366',
  rcs: '#00BAF2',
  ai_voice: '#F59E0B',
  field_executive: '#8B5CF6',
  push_notification: '#EF4444',
  in_app_banner: '#0EA5E9',
  facebook_ads: '#1877F2',
  instagram_ads: '#E4405F',
};

const CHANNEL_LABELS: Record<ChannelType, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  rcs: 'RCS',
  ai_voice: 'AI Voice',
  field_executive: 'Field Exec.',
  push_notification: 'Push Notification',
  in_app_banner: 'In-App Banner',
  facebook_ads: 'Facebook Ads',
  instagram_ads: 'Instagram Ads',
};

const CHANNEL_ORDER: ChannelType[] = ['sms', 'whatsapp', 'rcs', 'ai_voice', 'field_executive', 'push_notification', 'in_app_banner', 'facebook_ads', 'instagram_ads'];

function ReachabilityCardContent({ segment }: ReachabilityCardProps) {
  const reachability = segment.reachability;

  if (!reachability) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <p className="text-sm font-semibold text-text-primary">Channel Reachability</p>
        <p className="mt-1 text-sm text-text-secondary">No reachability data available.</p>
      </div>
    );
  }

  const totalSize = segment.size;

  const channelEntries = CHANNEL_ORDER.filter(
    (ch) => reachability[ch] !== undefined && (reachability[ch] ?? 0) > 0,
  ).map((ch) => ({
    channel: ch,
    count: reachability[ch] ?? 0,
    pct: Math.round(((reachability[ch] ?? 0) / totalSize) * 100),
  }));

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <p className="text-sm font-semibold text-text-primary">Channel Reachability</p>
      <p className="mt-0.5 text-xs text-text-secondary">
        Out of {formatCount(totalSize)} total users
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {channelEntries.map(({ channel, count, pct }) => (
          <div key={channel} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ChannelIcon channel={channel} size={13} />
                <span className="text-sm text-text-primary">{CHANNEL_LABELS[channel]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {formatCount(count)}
                </span>
                <span className="w-10 text-right text-xs text-text-secondary">{pct}%</span>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: CHANNEL_COLORS[channel],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReachabilityCard({ segment }: ReachabilityCardProps) {
  return (
    <PhaseGate minPhase="day1">
      <ReachabilityCardContent segment={segment} />
    </PhaseGate>
  );
}
