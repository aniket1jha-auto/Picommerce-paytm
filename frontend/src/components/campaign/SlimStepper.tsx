import { Check } from 'lucide-react';

interface SlimStepperStep {
  label: string;
}

interface SlimStepperProps {
  currentStep: number;
  steps: SlimStepperStep[];
  onStepClick?: (stepNum: number) => void;
}

export function SlimStepper({ currentStep, steps, onStepClick }: SlimStepperProps) {
  return (
    <nav aria-label="Campaign wizard steps" className="flex h-10 items-center gap-1 px-4">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isFuture = stepNum > currentStep;
        const clickable = !isFuture && !isCurrent && Boolean(onStepClick);

        return (
          <div key={step.label} className="flex items-center">
            <button
              type="button"
              disabled={isFuture || isCurrent || !onStepClick}
              onClick={() => clickable && onStepClick?.(stepNum)}
              className={[
                'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium transition-colors',
                isCurrent
                  ? 'bg-brand-50 text-brand-700'
                  : isCompleted
                    ? 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                    : 'text-text-tertiary',
                clickable ? 'cursor-pointer' : 'cursor-default',
              ].join(' ')}
            >
              {isCompleted ? (
                <Check size={12} strokeWidth={2.5} className="text-success" />
              ) : (
                <span
                  className={[
                    'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums',
                    isCurrent ? 'bg-brand-500 text-white' : 'bg-bg-muted text-text-tertiary',
                  ].join(' ')}
                >
                  {stepNum}
                </span>
              )}
              <span>{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <span className="mx-1 text-text-tertiary" aria-hidden>
                ·
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
