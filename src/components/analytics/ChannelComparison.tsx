import type { ChannelMetric, ChannelType } from '@/types';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { formatCount, formatINR, formatPercent } from '@/utils/format';

const CHANNEL_NAMES: Record<ChannelType, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  rcs: 'RCS',
  ai_voice: 'AI Voice',
  field_executive: 'Field Executive',
  push_notification: 'Push Notification',
  in_app_banner: 'In-App Banner',
  facebook_ads: 'Facebook Ads',
  instagram_ads: 'Instagram Ads',
};

interface ChannelComparisonProps {
  channelMetrics: ChannelMetric[];
  channels: ChannelType[];
}

export function ChannelComparison({ channelMetrics, channels }: ChannelComparisonProps) {
  // Only include channels that appear in the passed list and have data
  const rows = channels
    .map((ch) => channelMetrics.find((m) => m.channel === ch))
    .filter((m): m is ChannelMetric => m !== null && m !== undefined);

  if (rows.length === 0) return null;

  // Find best conversion rate for row highlight
  const bestConvRate = Math.max(...rows.map((r) => r.conversionRate));

  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-[#E5E7EB]">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Channel
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Sent
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Delivered
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Opened
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Converted
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Cost
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Conv. Rate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#F3F4F6]">
          {rows.map((metric) => {
            const isBest = metric.conversionRate === bestConvRate && bestConvRate > 0;
            return (
              <tr
                key={metric.channel}
                className={isBest ? 'bg-[#F0FDF4]' : 'hover:bg-[#FAFAFA]'}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <ChannelIcon channel={metric.channel} size={14} />
                    <span className="font-medium text-text-primary">
                      {CHANNEL_NAMES[metric.channel]}
                    </span>
                    {isBest && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                        Best
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                  {formatCount(metric.sent)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                  {formatCount(metric.delivered)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                  {formatCount(metric.opened)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                  {formatCount(metric.converted)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                  {formatINR(metric.cost)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-text-primary">
                  {formatPercent(metric.conversionRate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
