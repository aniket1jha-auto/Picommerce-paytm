'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ChannelType } from '@/types';
import { SetupStep } from './SetupStep';
import { AudienceStep } from './AudienceStep';
import { ReviewStep } from './ReviewStep';
import { ContentScheduleStep } from './ContentScheduleStep';
import { JourneyBuilderStep } from './journey/JourneyBuilderStep';
import type { CampaignJourneyState } from './journey/journeyTypes';
import { buildPrebuiltJourney } from './journey/journeyTemplates';

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

export type CampaignType = 'simple_send' | 'journey';

export interface CampaignData {
  campaignType: CampaignType;
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
  journey: CampaignJourneyState;
  content: Partial<Record<ChannelType, unknown>>;
  senderConfig: Partial<
    Record<
      ChannelType,
      {
        sms?: { account: string; senderId: string };
        whatsapp?: { waba: string; phoneNumber: string; messageType: 'template' | 'session' };
        rcs?: { agent: string; sender: string; fallback: 'sms' | 'none' };
        ai_voice?: {
          account: string;
          callerNumber: string;
          voiceAgent: string;
          retry: {
            enabled: boolean;
            maxRetries: number;
            delayValue: number;
            delayUnit: 'minutes' | 'hours';
            retryOn: { noAnswer: boolean; busy: boolean; networkError: boolean };
          };
        };
      }
    >
  >;
  schedule: {
    type: 'one-time' | 'recurring' | 'event' | 'smart_ai';
    date: string;
    time: string;
    recurringFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    recurringDay: string;
    recurringTime: string;
    event: {
      source: 'app' | 'web' | 'crm' | 'payments' | 'custom' | 'webhook';
      triggerMethod: 'event' | 'webhook';
      eventName: string;
      match: 'every' | 'first' | 'nth';
      nthOccurrence: number;
      delayMinutes: number;
      dedupeWindowValue: number;
      dedupeWindowUnit: 'seconds' | 'minutes';
      timezone: 'Asia/Kolkata' | 'UTC';
      daysOfWeek: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>;
      windowStart: string; // HH:mm
      windowEnd: string; // HH:mm
      frequencyCap: 'once' | 'once_per_day' | 'cooldown';
      cooldownHours: number;
      maxEntriesPerUser: number | null;
      allowReentry: boolean;
      endDate: string; // optional ISO date
      webhook: {
        authMethod: 'bearer' | 'hmac_sha256';
        bearerToken: string;
        hmacSecret: string;
      };
    };
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    smartGoalFocus: 'start_ai' | 'all_round' | 'custom';
  };
  voiceConfig: Record<string, unknown>;
  highIntent: {
    enabled: boolean;
    criteria: HighIntentCriterion[];
    estimatedCount: number; // estimated users matching high-intent criteria
  };
}

const INITIAL_DATA: CampaignData = {
  campaignType: 'simple_send',
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
  journey: buildPrebuiltJourney('blank'),
  content: {},
  senderConfig: {},
  schedule: {
    type: 'smart_ai',
    date: '',
    time: '10:00',
    recurringFrequency: 'weekly',
    recurringDay: 'monday',
    recurringTime: '10:00',
    event: {
      source: 'app',
      triggerMethod: 'event',
      eventName: '',
      match: 'every',
      nthOccurrence: 2,
      delayMinutes: 0,
      dedupeWindowValue: 30,
      dedupeWindowUnit: 'seconds',
      timezone: 'Asia/Kolkata',
      daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'],
      windowStart: '09:00',
      windowEnd: '20:00',
      frequencyCap: 'cooldown',
      cooldownHours: 24,
      maxEntriesPerUser: null,
      allowReentry: true,
      endDate: '',
      webhook: { authMethod: 'bearer', bearerToken: '', hmacSecret: '' },
    },
    startDate: '',
    startTime: '10:00',
    endDate: '',
    endTime: '19:00',
    smartGoalFocus: 'start_ai',
  },
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

function wizardSteps(campaignType: CampaignType): Step[] {
  const step3Label = campaignType === 'journey' ? 'Build Flow' : 'Content & Schedule';
  return [
    { label: 'Setup', shortLabel: '1' },
    { label: 'Audience', shortLabel: '2' },
    { label: step3Label, shortLabel: '3' },
    { label: 'Review', shortLabel: '4' },
  ];
}

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
  const [campaignData, setCampaignData] = useState<CampaignData>(() => ({
    ...INITIAL_DATA,
    ...initialData,
    campaignType: initialData?.campaignType ?? INITIAL_DATA.campaignType,
    goal: { ...INITIAL_DATA.goal, ...initialData?.goal },
    schedule: { ...INITIAL_DATA.schedule, ...initialData?.schedule },
    highIntent: { ...INITIAL_DATA.highIntent, ...initialData?.highIntent },
    content: { ...INITIAL_DATA.content, ...initialData?.content },
    voiceConfig: { ...INITIAL_DATA.voiceConfig, ...initialData?.voiceConfig },
    journey:
      initialData?.journey?.nodes != null
        ? {
            nodes: initialData.journey.nodes,
            edges: initialData.journey.edges ?? [],
          }
        : INITIAL_DATA.journey,
  }));

  const steps = wizardSteps(campaignData.campaignType);
  const totalSteps = steps.length;
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
        <StepNav currentStep={currentStep} totalSteps={totalSteps} steps={steps} />
      </div>

      {/* Step content */}
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[#E5E7EB]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentStep}-${campaignData.campaignType}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={
              currentStep === 3 && campaignData.campaignType === 'journey' ? 'min-h-[560px]' : 'p-6'
            }
          >
            {currentStep === 1 && <SetupStep {...stepProps} />}
            {currentStep === 2 && <AudienceStep {...stepProps} />}
            {currentStep === 3 && campaignData.campaignType === 'simple_send' && (
              <ContentScheduleStep {...stepProps} />
            )}
            {currentStep === 3 && campaignData.campaignType === 'journey' && <JourneyBuilderStep {...stepProps} />}
            {currentStep === 4 && <ReviewStep {...stepProps} />}
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
