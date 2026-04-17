import { formatINR, formatROI } from '@/utils/format';

interface ROICardProps {
  spend: number;
  revenue: number;
  roi: number;
  costPerConversion: number;
  revenueLabel?: string;
}

function roiColor(roi: number): string {
  if (roi >= 4) return 'text-[#27AE60]';
  if (roi >= 2) return 'text-[#F2994A]';
  return 'text-[#EB5757]';
}

export function ROICard({
  spend,
  revenue,
  roi,
  costPerConversion,
  revenueLabel,
}: ROICardProps) {
  const revLabel =
    revenueLabel?.toLowerCase() === 'collected' ? 'Collected' : 'Revenue';

  const total = spend + revenue;
  const spendPct = total > 0 ? (spend / total) * 100 : 50;
  const revPct = total > 0 ? (revenue / total) * 100 : 50;

  return (
    <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
      {/* Title row */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">
          Return on Investment
        </span>
        <span className={`text-3xl font-bold tracking-tight ${roiColor(roi)}`}>
          {formatROI(roi)}
        </span>
      </div>

      {/* Spend vs Revenue bar */}
      <div className="mb-3">
        <div className="mb-1.5 flex justify-between text-xs text-text-secondary">
          <span>Spend</span>
          <span>{revLabel}</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className="h-full rounded-l-full bg-[#F2994A] transition-all duration-500"
            style={{ width: `${spendPct}%` }}
          />
          <div
            className="h-full rounded-r-full bg-[#27AE60] transition-all duration-500"
            style={{ width: `${revPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-semibold">
          <span className="text-[#F2994A]">{formatINR(spend)}</span>
          <span className="text-[#27AE60]">{formatINR(revenue)}</span>
        </div>
      </div>

      {/* Cost per conversion */}
      <div className="mt-4 flex items-center justify-between rounded-md bg-[#F7F9FC] px-3 py-2">
        <span className="text-xs text-text-secondary">Cost per conversion</span>
        <span className="text-sm font-semibold text-text-primary">
          {formatINR(costPerConversion)}
        </span>
      </div>
    </div>
  );
}
