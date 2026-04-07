import {
  Users,
  IndianRupee,
  TrendingUp,
  Target,
  MessageSquare,
  MessageCircle,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePhaseData } from '@/hooks/usePhaseData';
import { SparkLine } from '@/components/common/SparkLine';

const iconMap: Record<string, ComponentType<LucideProps>> = {
  Users,
  IndianRupee,
  TrendingUp,
  Target,
  MessageSquare,
  MessageCircle,
  LayoutGrid,
};

// Fake trend data arrays for sparklines when kpi.trend is 'up' or 'down'
const upTrendPoints = [40, 45, 42, 50, 55, 53, 60, 62, 58, 65, 70, 68, 75];
const downTrendPoints = [75, 70, 72, 65, 60, 62, 55, 52, 56, 48, 44, 46, 40];
const flatTrendPoints = [50, 52, 49, 51, 50, 53, 50, 52, 49, 51, 50, 52, 50];

function getTrendPoints(trend: 'up' | 'down' | 'flat'): number[] {
  if (trend === 'up') return upTrendPoints;
  if (trend === 'down') return downTrendPoints;
  return flatTrendPoints;
}

export function KPIBar() {
  const { kpis, phase } = usePhaseData();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon] ?? Target;
        const isPositiveChange = (kpi.change ?? 0) >= 0;
        const trendPoints = kpi.trend ? getTrendPoints(kpi.trend) : null;
        const sparkColor =
          kpi.trend === 'up'
            ? '#27AE60'
            : kpi.trend === 'down'
              ? '#EB5757'
              : '#6B7280';

        return (
          <div
            key={kpi.id}
            className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-[#E5E7EB]"
          >
            <div className="flex items-start justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {/* Icon + label row */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[rgba(0,186,242,0.08)]">
                    <Icon size={16} className="text-cyan" />
                  </div>
                  <span className="truncate text-xs font-medium uppercase tracking-wide text-text-secondary">
                    {kpi.label}
                  </span>
                </div>

                {/* Value — animated on phase change */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${kpi.id}-${phase}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <span className="text-2xl font-bold tracking-tight text-text-primary">
                      {kpi.value}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Change indicator */}
                {kpi.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      isPositiveChange ? 'text-success' : 'text-error'
                    }`}
                  >
                    {isPositiveChange ? (
                      <ArrowUpRight size={13} strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight size={13} strokeWidth={2.5} />
                    )}
                    <span>
                      {isPositiveChange ? '+' : ''}
                      {kpi.change.toFixed(1)}%
                    </span>
                    {kpi.changeLabel && (
                      <span className="font-normal text-text-secondary">
                        {kpi.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sparkline on the right */}
              {trendPoints && (
                <div className="ml-2 flex-shrink-0 self-end">
                  <SparkLine
                    data={trendPoints}
                    width={72}
                    height={36}
                    color={sparkColor}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
