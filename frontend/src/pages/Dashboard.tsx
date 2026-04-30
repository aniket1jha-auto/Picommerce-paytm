import { Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePhaseData } from '@/hooks/usePhaseData';
import type { Campaign, CampaignStatus } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPIBar } from '@/components/analytics/KPIBar';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { formatCount, formatPercent } from '@/utils/format';
import type { ChannelType } from '@/types';
import { dashboardChannelPerf } from '@/data/mock/dashboard';

// Status sort order: active → scheduled → paused → draft → completed
const STATUS_ORDER: Record<CampaignStatus, number> = {
  active: 0,
  scheduled: 1,
  paused: 2,
  draft: 3,
  completed: 4,
};

function sortCampaigns(campaigns: Campaign[]): Campaign[] {
  return [...campaigns].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );
}

// Channel performance sneak-peek data lives in mocks/dashboard.ts (Phase 1.8).
const CHANNEL_PERF = dashboardChannelPerf;

const CHANNEL_NAMES: Record<ChannelType, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  rcs: 'RCS',
  ai_voice: 'AI Voice',
  field_executive: 'Field Exec',
  push_notification: 'Push',
  in_app_banner: 'In-App',
  facebook_ads: 'FB Ads',
  instagram_ads: 'IG Ads',
};

function ChannelPerfSneak() {
  const maxConvRate = Math.max(...CHANNEL_PERF.map((c) => (c.converted / c.sent) * 100));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Channel Performance</h2>
        <Link to="/analytics" className="text-xs font-medium text-cyan hover:underline">
          View details
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {CHANNEL_PERF.map((ch) => {
          const convRate = ch.sent > 0 ? (ch.converted / ch.sent) * 100 : 0;
          const barWidth = maxConvRate > 0 ? (convRate / maxConvRate) * 100 : 0;
          return (
            <div
              key={ch.channel}
              className="rounded-lg bg-white px-3.5 py-3 ring-1 ring-[#E5E7EB]"
            >
              <div className="flex items-center gap-2 mb-2">
                <ChannelIcon channel={ch.channel} size={14} />
                <span className="text-xs font-semibold text-text-primary">{CHANNEL_NAMES[ch.channel]}</span>
              </div>
              <div className="flex items-end justify-between mb-1.5">
                <span className="text-lg font-bold text-text-primary">{formatPercent(convRate)}</span>
                <span className="text-[10px] text-text-secondary">conv rate</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full bg-cyan transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-text-secondary">
                <span>{formatCount(ch.sent)} sent</span>
                <span>{formatCount(ch.converted)} conv</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const sorted = sortCampaigns(campaigns);
  return (
    <div className="flex flex-col gap-2">
      {sorted.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

export function Dashboard() {
  const { phase, isDay0, isDay1, isDay30, campaigns } = usePhaseData();

  const hasCampaigns = campaigns.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header — campaign creation lives in BUILD → Campaigns; not duplicated here. */}
      <PageHeader title="Dashboard" />

      {/* KPI bar */}
      <KPIBar />

      {/* Main content — phase-transition animated */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex flex-col gap-6"
        >
          {/* Campaign list or empty state */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                Active Campaigns
              </h2>
              {hasCampaigns && (
                <Link
                  to="/campaigns"
                  className="text-xs font-medium text-cyan hover:underline"
                >
                  View all
                </Link>
              )}
            </div>

            {isDay0 && (
              <div className="rounded-lg bg-white ring-1 ring-[#E5E7EB]">
                <EmptyState
                  icon={Megaphone}
                  title="No campaigns yet"
                  description="Head to Campaigns to set up your first one and start reaching your audience."
                  ctaLabel="Go to Campaigns"
                  ctaHref="/campaigns"
                />
              </div>
            )}

            {isDay1 && (
              <div className="rounded-lg bg-white ring-1 ring-[#E5E7EB]">
                <EmptyState
                  icon={Megaphone}
                  title="Your audience is ready"
                  description="2.4L users synced. Head to Campaigns to set up your first one."
                  ctaLabel="Go to Campaigns"
                  ctaHref="/campaigns"
                />
              </div>
            )}

            {isDay30 && hasCampaigns && (
              <CampaignList campaigns={campaigns} />
            )}

            {isDay30 && !hasCampaigns && (
              <div className="rounded-lg bg-white ring-1 ring-[#E5E7EB]">
                <EmptyState
                  icon={Megaphone}
                  title="No campaigns yet"
                  description="Head to Campaigns to set up your first one."
                  ctaLabel="Go to Campaigns"
                  ctaHref="/campaigns"
                />
              </div>
            )}
          </div>

          {/* Channel Performance sneak-peek — Day 30+ only */}
          {isDay30 && <ChannelPerfSneak />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
