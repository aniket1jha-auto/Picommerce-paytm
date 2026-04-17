import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Campaign } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { formatINR, formatCount, formatPercent } from '@/utils/format';

interface CampaignCardProps {
  campaign: Campaign;
  to?: string;
}

export function CampaignCard({ campaign, to }: CampaignCardProps) {
  const {
    id,
    name,
    status,
    channels,
    audience,
    metrics,
    anomaly,
  } = campaign;

  const hasMetrics = metrics.sent > 0;
  const convRate = hasMetrics ? (metrics.converted / metrics.sent) * 100 : 0;

  const anomalySeverityColor =
    anomaly?.severity === 'high'
      ? 'text-error'
      : 'text-warning';

  return (
    <Link
      to={to ?? `/campaigns/${id}`}
      className="group block rounded-lg bg-white ring-1 ring-[#E5E7EB] transition-shadow duration-150 hover:shadow-md hover:ring-[#D1D5DB]"
    >
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Campaign name + anomaly indicator */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-text-primary group-hover:text-cyan">
              {name}
            </span>
            {anomaly && (
              <span
                title={anomaly.message}
                className={`flex-shrink-0 ${anomalySeverityColor}`}
              >
                <AlertTriangle size={14} strokeWidth={2} />
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-text-secondary">
            {formatCount(audience.size)} users
          </div>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          <StatusBadge status={status} />
        </div>

        {/* Channel icons */}
        <div className="flex flex-shrink-0 items-center gap-1">
          {channels.map((channel) => (
            <ChannelIcon key={channel} channel={channel} size={14} />
          ))}
        </div>

        {/* Spend */}
        <div className="w-20 flex-shrink-0 text-right">
          <div className="text-xs text-text-secondary">Spend</div>
          <div className="text-sm font-medium text-text-primary">
            {hasMetrics ? formatINR(metrics.cost) : '—'}
          </div>
        </div>

        {/* Converted */}
        <div className="w-20 flex-shrink-0 text-right">
          <div className="text-xs text-text-secondary">Converted</div>
          <div className="text-sm font-medium text-text-primary">
            {hasMetrics ? formatCount(metrics.converted) : '—'}
          </div>
        </div>

        {/* Conv Rate */}
        <div className="w-20 flex-shrink-0 text-right">
          <div className="text-xs text-text-secondary">Conv Rate</div>
          <div className="text-sm font-medium text-text-primary">
            {hasMetrics ? formatPercent(convRate) : '—'}
          </div>
        </div>
      </div>
    </Link>
  );
}
