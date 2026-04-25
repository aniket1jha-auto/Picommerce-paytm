'use client';

import { PREBUILT_TEMPLATE_META } from './journeyTemplates';

interface PrebuiltJourneyModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
}

export function PrebuiltJourneyModal({ open, onClose, onSelect }: PrebuiltJourneyModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-[#E5E7EB]">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Use pre-built journey</h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              Pick a template to load onto the canvas. You can edit every step afterwards.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-[#F3F4F6]"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {PREBUILT_TEMPLATE_META.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className="flex flex-col rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-4 text-left transition-colors hover:border-cyan/40 hover:bg-white hover:shadow-sm"
              >
                <span className="text-sm font-semibold text-text-primary">{t.title}</span>
                <span className="mt-1 text-xs leading-snug text-text-secondary">{t.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
