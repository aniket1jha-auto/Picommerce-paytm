import { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { ContentIdeasDrawer } from '@/components/content-ideas/ContentIdeasDrawer';
import { ContentIdeaCard } from '@/components/content-ideas/ContentIdeaCard';
import {
  CONTENT_IDEAS,
  RECENT_TEMPLATES,
  type ContentIdea,
  type RecentTemplateType,
} from '@/data/contentIdeas';

/**
 * Ideas tab — Phase 3.6
 * Folds the standalone /content-ideas page into Content Library.
 * Body lifted from pages/ContentIdeas.tsx (now redirected); only the
 * PageHeader chrome is dropped — ContentLibrary owns the page-level header.
 */

const QUICK_ACTIONS = [
  '✦ Write a voice script',
  '✦ Create a WhatsApp template',
  '✦ Build an outreach sequence',
] as const;

const RECENT_BADGE: Record<RecentTemplateType, string> = {
  Voice: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/80',
  WhatsApp: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80',
  SMS: 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80',
  Sequence: 'bg-violet-50 text-violet-800 ring-1 ring-violet-200/80',
};

export function IdeasTab() {
  const [prompt, setPrompt] = useState('');
  const [selected, setSelected] = useState<ContentIdea | null>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);

  const handleCustomizeWithAi = useCallback((idea: ContentIdea) => {
    setPrompt(`Customize the ${idea.title} template for my use case`);
    setSelected(null);
    queueMicrotask(() => {
      promptInputRef.current?.focus();
      promptInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* AI prompt bar */}
      <section className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-secondary"
          />
          <input
            ref={promptInputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What can I help you create?"
            className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/80 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((label) => (
            <button
              key={label}
              type="button"
              className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:bg-gray-200"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Recents */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Recents</h2>
          <a
            href="#ideas-for-programs"
            className="text-xs font-medium text-cyan hover:underline"
          >
            See all →
          </a>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pl-1 pr-1 pt-0.5 [scrollbar-width:thin]">
          {RECENT_TEMPLATES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="group flex min-w-[200px] max-w-[240px] shrink-0 flex-col gap-2 rounded-lg bg-white px-4 py-3 text-left ring-1 ring-[#E5E7EB] transition-shadow hover:shadow-md hover:ring-[#D1D5DB]"
            >
              <span className="truncate text-sm font-medium text-text-primary group-hover:text-cyan">
                {item.name}
              </span>
              <span
                className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${RECENT_BADGE[item.type]}`}
              >
                {item.type}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ideas grid */}
      <section id="ideas-for-programs">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">
          Ideas for Your Programs
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CONTENT_IDEAS.map((idea) => (
            <ContentIdeaCard key={idea.id} idea={idea} onOpen={setSelected} />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <ContentIdeasDrawer
            key={selected.id}
            idea={selected}
            onClose={() => setSelected(null)}
            onCustomizeWithAi={handleCustomizeWithAi}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
