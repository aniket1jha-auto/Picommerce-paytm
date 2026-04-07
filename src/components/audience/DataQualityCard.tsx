import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { PhaseGate } from '@/components/ai/PhaseGate';

interface QualityItem {
  label: string;
  type: 'warning' | 'ok';
  icon: 'warning' | 'check' | 'clock';
}

const DATA_QUALITY_ITEMS: QualityItem[] = [
  {
    label: '3,200 users missing phone number',
    type: 'warning',
    icon: 'warning',
  },
  {
    label: '1,800 users with invalid phone format',
    type: 'warning',
    icon: 'warning',
  },
  {
    label: '98.2% records have LTV score',
    type: 'ok',
    icon: 'check',
  },
  {
    label: 'Last sync: 2 hours ago',
    type: 'ok',
    icon: 'clock',
  },
];

function QualityRow({ item }: { item: QualityItem }) {
  return (
    <div className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
      <div
        className={[
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          item.type === 'warning' ? 'bg-amber-500/10' : 'bg-green-500/10',
        ].join(' ')}
      >
        {item.icon === 'warning' && (
          <AlertTriangle size={14} className="text-amber-600" />
        )}
        {item.icon === 'check' && (
          <CheckCircle2 size={14} className="text-green-600" />
        )}
        {item.icon === 'clock' && (
          <Clock size={14} className="text-green-600" />
        )}
      </div>
      <span
        className={[
          'text-sm',
          item.type === 'warning' ? 'text-amber-700' : 'text-text-primary',
        ].join(' ')}
      >
        {item.label}
      </span>
    </div>
  );
}

function DataQualityCardContent() {
  const warnings = DATA_QUALITY_ITEMS.filter((i) => i.type === 'warning');
  const hasWarnings = warnings.length > 0;

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Data Quality</p>
        {hasWarnings && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
            {warnings.length} issue{warnings.length !== 1 ? 's' : ''}
          </span>
        )}
        {!hasWarnings && (
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700">
            All clear
          </span>
        )}
      </div>

      <div className="mt-3 divide-y divide-[#F3F4F6]">
        {DATA_QUALITY_ITEMS.map((item) => (
          <QualityRow key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

export function DataQualityCard() {
  return (
    <PhaseGate minPhase="day1">
      <DataQualityCardContent />
    </PhaseGate>
  );
}
