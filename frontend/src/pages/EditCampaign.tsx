'use client';

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePhaseData } from '@/hooks/usePhaseData';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { CampaignWizard } from '@/components/campaign/CampaignWizard';
import { buildPrebuiltJourney } from '@/components/campaign/journey/journeyTemplates';
import { Megaphone } from 'lucide-react';

export function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const { campaigns, isDay0, isDay1 } = usePhaseData();

  const campaign = campaigns.find((c) => c.id === id);

  if (isDay0 || isDay1 || !campaign) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          icon={Megaphone}
          title="Campaign not found"
          description="This campaign does not exist or is not available in the current phase."
          ctaLabel="Back to Campaigns"
          ctaHref="/campaigns"
        />
      </div>
    );
  }

  // Pre-fill wizard data from campaign
  const initialData = {
    campaignType: 'simple_send' as const,
    goal: {
      description: `Edit: ${campaign.name}`,
      goals: [
        {
          id: 'goal-edit-1',
          eventName: 'transaction_completed',
          segmentType: 'batch' as const,
          description: '',
        },
      ],
      goalsOperator: 'or' as const,
      tentativeBudget: campaign.budget.allocated > 0
        ? `${(campaign.budget.allocated / 100000).toFixed(0)}L`
        : '',
    },
    name: campaign.name,
    segmentId: campaign.audience.segmentId,
    channels: campaign.channels,
    waterfallConfig: {},
    journey: buildPrebuiltJourney('blank'),
    content: {},
    schedule: {
      type: 'one-time' as const,
      date: '',
      time: '10:00',
      recurringFrequency: 'weekly' as const,
      recurringDay: 'monday',
      recurringTime: '10:00',
      startDate: '',
      endDate: '',
    },
    voiceConfig: {},
    highIntent: {
      enabled: false,
      criteria: [],
      estimatedCount: 0,
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/campaigns/${id}/flow`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] text-text-secondary transition-colors hover:bg-[#F9FAFB] hover:text-text-primary"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-semibold text-text-primary truncate">
              Edit: {campaign.name}
            </h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="mt-0.5 text-xs text-text-secondary">
            Editing a live campaign — changes will apply to future outreach only
          </p>
        </div>
      </div>

      {/* Reuse campaign wizard with initial data */}
      <CampaignWizard initialData={initialData} />
    </div>
  );
}
