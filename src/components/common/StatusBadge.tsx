import type { CampaignStatus } from '@/types';

interface StatusBadgeProps {
  status: CampaignStatus;
}

const statusStyles: Record<CampaignStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
  scheduled: { bg: 'bg-[#E0F4FD]', text: 'text-[#00BAF2]' },
  active: { bg: 'bg-[#D4EDDA]', text: 'text-[#27AE60]' },
  paused: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  completed: { bg: 'bg-[#E0E7F1]', text: 'text-[#002970]' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style.bg} ${style.text}`}
    >
      {status}
    </span>
  );
}
