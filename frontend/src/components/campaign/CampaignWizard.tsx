'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ChannelType } from '@/types';
import { GoalStep } from './GoalStep';
import { AudienceStep } from './AudienceStep';
import { ReviewStep } from './ReviewStep';
import { ChannelStep } from './ChannelStep';
import { CampaignPlanStep } from './CampaignPlanStep';

export interface HighIntentCriterion {
  id: string;
  label: string;
  attribute: string;
  operator: string;
  value: string;
  selected: boolean;
  source: 'ai_suggested' | 'custom';
}

export interface CampaignGoal {
  id: string;
  eventName: string;
  segmentType: 'realtime' | 'batch';
  description: string;
}

export interface CampaignData {
  goal: {
    description: string;       // overall campaign description
    goals: CampaignGoal[];     // multiple conversion goals
    goalsOperator: 'and' | 'or'; // logic between multiple goals
    tentativeBudget: string;
  };
  name: string;
  segmentId: string;
  channels: ChannelType[];
  waterfallConfig: Record<string, unknown>;
  content: Partial<Record<ChannelType, unknown>>;
  schedule: {
    type: 'one-time' | 'recurring';
    date: string;
    time: string;
    recurringFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    recurringDay: string;
    recurringTime: string;
    startDate: string;
    endDate: string;
  };
  budget: string;
  voiceConfig: Record<string, unknown>;
  highIntent: {
    enabled: boolean;
    criteria: HighIntentCriterion[];
    estimatedCount: number; // estimated users matching high-intent criteria
  };
}

const INITIAL_DATA: CampaignData = {
  goal: {
    description: '',
    goals: [],
    goalsOperator: 'or',
    tentativeBudget: '',
  },
  name: '',
  segmentId: '',
  channels: [],
  waterfallConfig: {},
  content: {},
  schedule: {
    type: 'one-time',
    date: '',
    time: '10:00',
    recurringFrequency: 'weekly',
    recurringDay: 'monday',
    recurringTime: '10:00',
    startDate: '',
    endDate: '',
  },
  budget: '',
  voiceConfig: {},
  highIntent: {
    enabled: false,
    criteria: [],
    estimatedCount: 0,
  },
};

interface Step {
  label: string;
  shortLabel: string;
}

const STEPS: Step[] = [
  { label: 'Goal', shortLabel: '1' },
  { label: 'Audience', shortLabel: '2' },
  { label: 'Channels', shortLabel: '3' },
  { label: 'Journey', shortLabel: '4' },
  { label: 'Review & Launch', shortLabel: '5' },
];

interface StepNavProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

function StepNav({ currentStep, totalSteps, steps }: StepNavProps) {
  return (
    <nav aria-label="Campaign wizard steps">
      <ol className="flex items-center gap-0">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <li key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isCompleted
                      ? 'bg-cyan text-white'
                      : isCurrent
                        ? 'bg-cyan text-white ring-2 ring-cyan ring-offset-2'
                        : 'bg-[#E5E7EB] text-text-secondary',
                  ].join(' ')}
                >
                  {isCompleted ? <Check size={14} strokeWidth={2.5} /> : stepNum}
                </div>
                <span
                  className={[
                    'text-xs font-medium transition-colors',
                    isCurrent
                      ? 'text-cyan'
                      : isCompleted
                        ? 'text-text-primary'
                        : 'text-text-secondary',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={[
                    'h-[2px] flex-1 transition-colors',
                    isCompleted ? 'bg-cyan' : 'bg-[#E5E7EB]',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
};

interface CampaignWizardProps {
  initialData?: Partial<CampaignData>;
}

export function CampaignWizard({ initialData }: CampaignWizardProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    ...INITIAL_DATA,
    ...initialData,
    goal: { ...INITIAL_DATA.goal, ...initialData?.goal },
    highIntent: { ...INITIAL_DATA.highIntent, ...initialData?.highIntent },
  });

  const totalSteps = STEPS.length;
  const isLastStep = currentStep === totalSteps;

  function handleUpdate(updates: Partial<CampaignData>) {
    setCampaignData((prev) => ({ ...prev, ...updates }));
  }

  function handleNext() {
    if (isLastStep) {
      // Launch campaign — placeholder for actual submission
      return;
    }
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
  }

  function handleBack() {
    if (currentStep === 1) return;
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  const stepProps = {
    campaignData,
    onUpdate: handleUpdate,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Step navigation */}
      <div className="rounded-xl bg-white p-6 ring-1 ring-[#E5E7EB]">
        <StepNav currentStep={currentStep} totalSteps={totalSteps} steps={STEPS} />
      </div>

      {/* Step content */}
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[#E5E7EB]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="p-6"
          >
            {currentStep === 1 && <GoalStep {...stepProps} />}
            {currentStep === 2 && <AudienceStep {...stepProps} />}
            {currentStep === 3 && <ChannelStep {...stepProps} />}
            {currentStep === 4 && <CampaignPlanStep {...stepProps} />}
            {currentStep === 5 && <ReviewStep {...stepProps} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center rounded-md bg-cyan px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {isLastStep ? 'Launch Campaign' : 'Next'}
        </button>
      </div>
    </div>
  );
}
