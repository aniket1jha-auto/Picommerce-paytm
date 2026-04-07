import { Users, MapPin, Banknote } from 'lucide-react';
import type { Segment } from '@/types';
import { PhaseGate } from '@/components/ai/PhaseGate';
import { formatINR } from '@/utils/format';

interface AudienceProfileProps {
  segment: Segment;
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F3F4F6]">
        <Icon size={14} className="text-text-secondary" />
      </div>
      <span className="flex-1 text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

function AudienceProfileContent({ segment }: AudienceProfileProps) {
  const attrs = segment.attributes;

  if (!attrs) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <p className="text-sm font-semibold text-text-primary">Audience Profile</p>
        <p className="mt-1 text-sm text-text-secondary">No attribute data available for this segment.</p>
      </div>
    );
  }

  // Gender split
  const totalGender = Object.values(attrs.genderSplit).reduce((a, b) => a + b, 0);
  const malePercent = Math.round((attrs.genderSplit.male / totalGender) * 100);
  const femalePercent = 100 - malePercent;
  const genderLabel = `${malePercent}% Male / ${femalePercent}% Female`;

  // Geography: top 2 tiers
  const geoEntries = Object.entries(attrs.geographyBreakdown).sort((a, b) => b[1] - a[1]);
  const geoLabel = geoEntries
    .slice(0, 3)
    .map(([tier, pct]) => `${tier.charAt(0).toUpperCase()}${tier.slice(1)} ${pct}%`)
    .join(' · ');

  // Age range
  const ageLabel = `${attrs.ageRange[0]}–${attrs.ageRange[1]} years`;

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <p className="text-sm font-semibold text-text-primary">Audience Profile</p>

      <div className="mt-3 divide-y divide-[#F3F4F6]">
        <StatRow icon={Users} label="Gender split" value={genderLabel} />
        <StatRow icon={Users} label="Age range" value={ageLabel} />
        <StatRow icon={MapPin} label="Geography" value={geoLabel} />
        <StatRow icon={Banknote} label="Average LTV" value={formatINR(attrs.avgLtv)} />
      </div>

      {/* Gender bar */}
      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className="h-full rounded-full bg-cyan transition-all"
            style={{ width: `${malePercent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-text-secondary">
          <span>Male {malePercent}%</span>
          <span>Female {femalePercent}%</span>
        </div>
      </div>
    </div>
  );
}

export function AudienceProfile({ segment }: AudienceProfileProps) {
  return (
    <PhaseGate minPhase="day1">
      <AudienceProfileContent segment={segment} />
    </PhaseGate>
  );
}
