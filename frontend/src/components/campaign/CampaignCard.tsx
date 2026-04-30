import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AlertTriangle, Pencil, Copy } from 'lucide-react';
import type { Campaign } from '@/types';
import type { CampaignData } from './CampaignWizard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { useToast, cn } from '@/components/ui';
import { formatINR, formatCount, formatPercent } from '@/utils/format';

interface CampaignCardProps {
  campaign: Campaign;
  to?: string;
}

/**
 * Campaign list row.
 * Phase 4 D.1.6 — adds Clone + Edit row actions (visible on hover).
 *  - Edit  → /campaigns/:id/edit (existing route)
 *  - Clone → /campaigns/new with the campaign mapped into a wizard draft.
 *    The campaign-launch handler creates a fresh campaign on save.
 */
export function CampaignCard({ campaign, to }: CampaignCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    id,
    name,
    status,
    channels,
    audience,
    metrics,
    anomaly,
    budget,
    aiVoiceConfig,
  } = campaign;

  const hasMetrics = metrics.sent > 0;
  const convRate = hasMetrics ? (metrics.converted / metrics.sent) * 100 : 0;

  const anomalySeverityColor =
    anomaly?.severity === 'high' ? 'text-error' : 'text-warning';

  function handleEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/campaigns/${id}/edit`);
  }

  function handleClone(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const draft: Partial<CampaignData> = {
      campaignType: 'simple_send',
      name: `${name} (copy)`,
      segmentId: audience.segmentId,
      channels: [...channels],
      goal: {
        description: '',
        goals: [],
        goalsOperator: 'or',
        tentativeBudget: budget.allocated > 0
          ? (budget.allocated / 100_000).toFixed(1)
          : '',
      },
      ...(aiVoiceConfig
        ? {
            senderConfig: {
              ai_voice: {
                ai_voice: {
                  account: '',
                  callerNumber: '',
                  agentId: aiVoiceConfig.agentId,
                  retry: aiVoiceConfig.retry,
                },
              },
            },
          }
        : {}),
    };
    toast({
      kind: 'info',
      title: 'Cloned',
      body: `Drafted a new campaign from "${name}". Review and launch.`,
    });
    navigate('/campaigns/new', { state: { campaignDraft: draft } });
  }

  return (
    <Link
      to={to ?? `/campaigns/${id}`}
      className="group relative block rounded-lg bg-white ring-1 ring-[#E5E7EB] transition-shadow duration-150 hover:shadow-md hover:ring-[#D1D5DB]"
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

        {/* Row actions — visible on hover */}
        <div
          className={cn(
            'flex shrink-0 items-center gap-1',
            'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity',
          )}
        >
          <button
            type="button"
            onClick={handleEdit}
            title="Edit campaign"
            aria-label={`Edit ${name}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-surface-raised hover:text-text-primary"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={handleClone}
            title="Clone campaign"
            aria-label={`Clone ${name}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-surface-raised hover:text-text-primary"
          >
            <Copy size={13} />
          </button>
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
