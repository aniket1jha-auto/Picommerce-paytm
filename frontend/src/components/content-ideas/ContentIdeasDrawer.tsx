import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import type { ContentIdea } from '@/data/contentIdeas';
import { CATEGORY_LABEL } from '@/data/contentIdeas';
import {
  buildCampaignDraftFromIdea,
  isInsightsIdea,
} from '@/utils/contentIdeaCampaign';

interface ContentIdeasDrawerProps {
  idea: ContentIdea;
  onClose: () => void;
  onCustomizeWithAi: (idea: ContentIdea) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
      {children}
    </p>
  );
}

function SampleMessageBlock({ idea }: { idea: ContentIdea }) {
  const { sample } = idea;

  if (sample.variant === 'messaging' && sample.channel === 'whatsapp') {
    return (
      <div className="flex justify-end pt-1">
        <div className="max-w-[95%] rounded-2xl rounded-br-sm bg-[#25D366] px-3 py-2 text-left text-[13px] leading-snug text-white shadow-sm">
          {sample.text}
        </div>
      </div>
    );
  }

  if (sample.variant === 'messaging' && sample.channel === 'sms') {
    return (
      <div className="pt-1">
        <div className="inline-block max-w-[95%] rounded-lg bg-[#E5E7EB] px-3 py-2 text-left text-[13px] leading-snug text-text-primary ring-1 ring-[#D1D5DB]">
          {sample.text}
        </div>
      </div>
    );
  }

  if (sample.variant === 'voice') {
    return (
      <div className="space-y-4 pt-1">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-text-secondary">Opening line</p>
          <blockquote className="border-l-[3px] border-amber-400 bg-amber-50/80 py-2.5 pl-3 pr-2 text-[13px] leading-relaxed text-text-primary">
            {sample.openingLine}
          </blockquote>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-text-secondary">First response</p>
          <blockquote className="border-l-[3px] border-[#E5E7EB] bg-[#F7F9FC] py-2.5 pl-3 pr-2 text-[13px] leading-relaxed text-text-primary">
            {sample.firstResponseLine}
          </blockquote>
        </div>
      </div>
    );
  }

  if (sample.variant === 'sequence') {
    return (
      <ul className="space-y-2.5 pt-1">
        {sample.steps.map((line) => (
          <li
            key={line}
            className="flex gap-2 text-[13px] leading-snug text-text-primary"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (sample.variant === 'insights') {
    return (
      <div className="space-y-4 pt-1">
        <div className="flex items-end justify-between gap-3 rounded-lg bg-[#F7F9FC] px-3 py-3 ring-1 ring-[#E5E7EB]">
          <div>
            <p className="text-[11px] font-medium text-text-secondary">{sample.statLabel}</p>
            <p className="mt-0.5 text-lg font-semibold text-text-primary">{sample.statValue}</p>
          </div>
          <div className="flex h-12 items-end gap-1">
            {sample.bars.map((h, i) => (
              <div
                key={i}
                className="w-2 rounded-sm bg-cyan/85"
                style={{ height: `${Math.max(18, (h / 100) * 48)}px` }}
              />
            ))}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{sample.summary}</p>
      </div>
    );
  }

  return null;
}

export function ContentIdeasDrawer({
  idea,
  onClose,
  onCustomizeWithAi,
}: ContentIdeasDrawerProps) {
  const navigate = useNavigate();
  const [campaignOpen, setCampaignOpen] = useState(true);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function handleStartCampaign() {
    if (isInsightsIdea(idea)) {
      navigate('/analytics', {
        state: { contentIdeaId: idea.id, contentIdeaTitle: idea.title },
      });
    } else {
      navigate('/campaigns/new', {
        state: { campaignDraft: buildCampaignDraftFromIdea(idea) },
      });
    }
    onClose();
  }

  function handleCustomize() {
    onCustomizeWithAi(idea);
    onClose();
  }

  const insights = isInsightsIdea(idea);

  return (
    <motion.div
      className="fixed inset-0 z-[60]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="content-idea-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white ring-1 ring-[#E5E7EB]"
        style={{ boxShadow: '0 4px 12px rgba(0,41,112,0.12)' }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              {CATEGORY_LABEL[idea.category]}
            </p>
            <h2
              id="content-idea-drawer-title"
              className="mt-1 text-lg font-semibold leading-snug text-text-primary"
            >
              {idea.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-[#F3F4F6] hover:text-text-primary"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <section className="mb-6">
            <SectionLabel>Sample Message</SectionLabel>
            <div className="mt-2">
              <SampleMessageBlock idea={idea} />
            </div>
          </section>

          <section>
            <button
              type="button"
              onClick={() => setCampaignOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F7F9FC] px-4 py-3 text-left transition-colors hover:bg-[#F3F4F6]"
            >
              <SectionLabel>Campaign Setup</SectionLabel>
              {campaignOpen ? (
                <ChevronUp size={18} className="shrink-0 text-text-secondary" />
              ) : (
                <ChevronDown size={18} className="shrink-0 text-text-secondary" />
              )}
            </button>
            {campaignOpen && (
              <dl className="mt-2 space-y-2.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <dt className="w-[8.5rem] shrink-0 text-text-secondary">Target audience</dt>
                  <dd className="font-medium text-text-primary">{idea.campaign.audience}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[8.5rem] shrink-0 text-text-secondary">Channel</dt>
                  <dd className="font-medium text-text-primary">{idea.campaign.channel}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[8.5rem] shrink-0 text-text-secondary">Recommended time</dt>
                  <dd className="font-medium text-text-primary">{idea.campaign.recommendedTime}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[8.5rem] shrink-0 text-text-secondary">Estimated reach</dt>
                  <dd className="font-medium text-text-primary">{idea.campaign.estimatedReach}</dd>
                </div>
              </dl>
            )}
          </section>
        </div>

        <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-5 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2">
            <button
              type="button"
              onClick={handleCustomize}
              className="inline-flex items-center justify-center rounded-md border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
            >
              Customize with AI
            </button>
            <button
              type="button"
              onClick={handleStartCampaign}
              className="inline-flex items-center justify-center rounded-md bg-cyan px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
            >
              {insights ? 'Open in Analytics →' : 'Start Campaign →'}
            </button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}
