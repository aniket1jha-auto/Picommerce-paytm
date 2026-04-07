import type { Segment } from '@/types';
import { formatCount, formatROI } from '@/utils/format';

interface SegmentBuilderProps {
  segments: Segment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SegmentBuilder({ segments, selectedId, onSelect }: SegmentBuilderProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {segments.map((segment) => {
        const isSelected = segment.id === selectedId;
        const hasPerformance = Boolean(segment.performance);

        return (
          <button
            key={segment.id}
            type="button"
            onClick={() => onSelect(segment.id)}
            className={[
              'flex flex-col gap-2 rounded-lg border p-4 text-left transition-all',
              isSelected
                ? 'border-cyan bg-[rgba(0,186,242,0.04)] ring-1 ring-cyan'
                : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm',
            ].join(' ')}
          >
            {/* Header: name + size badge */}
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-text-primary text-sm leading-snug">
                {segment.name}
              </span>
              <span
                className={[
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                  isSelected
                    ? 'bg-cyan/15 text-cyan'
                    : 'bg-[#F3F4F6] text-text-secondary',
                ].join(' ')}
              >
                {formatCount(segment.size)}
              </span>
            </div>

            {/* Description */}
            <p className="line-clamp-2 text-sm text-text-secondary leading-relaxed">
              {segment.description}
            </p>

            {/* Performance badges (Day 30+ only) */}
            {hasPerformance && segment.performance && (
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700">
                  Conv. {segment.performance.avgConversion}%
                </span>
                <span className="rounded-md bg-cyan/10 px-2 py-0.5 text-xs font-medium text-cyan">
                  ROI {formatROI(segment.performance.avgROI)}
                </span>
                <span className="text-xs text-text-secondary">
                  {segment.performance.campaignCount} campaigns
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
