'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhaseData } from '@/hooks/usePhaseData';
import type { CampaignStatus } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { EmptyState } from '@/components/common/EmptyState';

// Status sort order: active → scheduled → paused → draft → completed
const STATUS_ORDER: Record<CampaignStatus, number> = {
  active: 0,
  scheduled: 1,
  paused: 2,
  draft: 3,
  completed: 4,
};

const ALL_STATUSES: CampaignStatus[] = [
  'active',
  'scheduled',
  'paused',
  'draft',
  'completed',
];

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  paused: 'Paused',
  draft: 'Draft',
  completed: 'Completed',
};

export function Campaigns() {
  const { campaigns, isDay0, isDay1 } = usePhaseData();
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');

  const filtered = campaigns
    .filter((c) => statusFilter === 'all' || c.status === statusFilter)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const showEmpty = isDay0 || isDay1;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campaigns"
        subtitle={
          !showEmpty ? `${campaigns.length} campaigns total` : undefined
        }
        actions={
          <Link
            to="/campaigns/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Campaign
          </Link>
        }
      />

      {showEmpty ? (
        <div className="rounded-lg bg-white ring-1 ring-[#E5E7EB]">
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Create your first campaign to start reaching your audience across all channels."
            ctaLabel="Create Campaign"
            ctaHref="/campaigns/new"
          />
        </div>
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-navy text-white'
                  : 'bg-white text-text-secondary ring-1 ring-[#E5E7EB] hover:ring-[#D1D5DB]'
              }`}
            >
              All
            </button>
            {ALL_STATUSES.filter((s) =>
              campaigns.some((c) => c.status === s),
            ).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  statusFilter === s
                    ? 'bg-navy text-white'
                    : 'bg-white text-text-secondary ring-1 ring-[#E5E7EB] hover:ring-[#D1D5DB]'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Campaign list */}
          <AnimatePresence mode="wait">
            <motion.div
              key={statusFilter}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex flex-col gap-2"
            >
              {filtered.length === 0 ? (
                <div className="rounded-lg bg-white ring-1 ring-[#E5E7EB]">
                  <EmptyState
                    icon={Megaphone}
                    title={
                      statusFilter === 'all'
                        ? 'No campaigns found'
                        : `No ${STATUS_LABELS[statusFilter].toLowerCase()} campaigns`
                    }
                    description="Try a different filter or create a new campaign."
                  />
                </div>
              ) : (
                filtered.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    to={`/campaigns/${campaign.id}/flow`}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
