'use client';

interface JourneyCanvasFooterProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
  isLastStep: boolean;
  nextDisabled?: boolean;
  nextDisabledReason?: string;
}

export function JourneyCanvasFooter({
  onBack,
  onSaveDraft,
  onNext,
  isLastStep,
  nextDisabled,
  nextDisabledReason,
}: JourneyCanvasFooterProps) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-t border-border-subtle bg-surface px-6 shadow-[0_-1px_2px_0_rgba(15,23,42,0.04)]">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center rounded-md px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
      >
        Back
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSaveDraft}
          className="inline-flex items-center rounded-md border border-border-default bg-surface px-3 py-1.5 text-[13px] font-medium text-text-primary transition-colors hover:bg-surface-raised"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          title={nextDisabled ? nextDisabledReason : undefined}
          className="inline-flex items-center rounded-md bg-brand-500 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:bg-bg-muted disabled:text-text-tertiary"
        >
          {isLastStep ? 'Launch Campaign' : 'Next: Review'}
        </button>
      </div>
    </div>
  );
}
