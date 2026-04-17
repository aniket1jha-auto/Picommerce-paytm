'use client';

import type { ChannelType } from '@/types';
import { channels as ALL_CHANNELS, PLATFORM_REACHABILITY_RATES } from '@/data/channels';
import { ChannelIcon } from '@/components/common/ChannelIcon';

// ─── Exported Types ────────────────────────────────────────────────────────────

export interface WaterfallStep {
  channelId: ChannelType;
  waitDuration: string;
  triggerCondition: string;
  maxRetries: number;
  retryGap: string;
}

export interface AudienceGroup {
  id: string;
  name: string;
  userCount: number;
  percentage: number;
  sequence: WaterfallStep[];
  estimatedCost: number;
}

// ─── Default Groups ────────────────────────────────────────────────────────────

export const DEFAULT_AUDIENCE_GROUPS: AudienceGroup[] = [
  {
    id: 'high-value',
    name: 'High Value Users',
    userCount: 0,
    percentage: 0,
    sequence: [],
    estimatedCost: 0,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

interface WaterfallStepListProps {
  steps: WaterfallStep[];
}

export function WaterfallStepList({ steps }: WaterfallStepListProps) {
  if (steps.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic px-2 py-3">
        No steps configured.
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => {
        const channelDef = ALL_CHANNELS.find((c) => c.id === step.channelId);
        const reachability = PLATFORM_REACHABILITY_RATES[step.channelId];

        return (
          <li key={index} className="flex items-start gap-3">
            {/* Step number */}
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center mt-0.5">
              {index + 1}
            </span>

            {/* Channel icon */}
            <div className="flex-shrink-0 mt-0.5">
              <ChannelIcon channel={step.channelId} size={16} />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-gray-800 truncate">
                {channelDef?.name ?? step.channelId}
              </span>
              <span className="text-xs text-gray-500">
                Wait&nbsp;{step.waitDuration}
                {' \u2022 '}
                {step.triggerCondition.replace(/_/g, ' ')}
              </span>
              {step.maxRetries > 0 && (
                <span className="text-xs text-gray-400">
                  {step.maxRetries === 1
                    ? `1 retry after ${step.retryGap}`
                    : `${step.maxRetries} retries, ${step.retryGap} apart`}
                </span>
              )}
              <span className="text-xs text-gray-400">
                Platform reach:&nbsp;{Math.round(reachability * 100)}%
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
