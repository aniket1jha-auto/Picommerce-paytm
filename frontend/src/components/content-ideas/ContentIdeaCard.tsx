import type { ContentIdea } from '@/data/contentIdeas';
import { CATEGORY_ACCENT, CATEGORY_LABEL } from '@/data/contentIdeas';
import { IdeaCardPreview } from '@/components/content-ideas/IdeaCardPreview';

interface ContentIdeaCardProps {
  idea: ContentIdea;
  onOpen: (idea: ContentIdea) => void;
}

export function ContentIdeaCard({ idea, onOpen }: ContentIdeaCardProps) {
  const accent = CATEGORY_ACCENT[idea.category];

  return (
    <button
      type="button"
      onClick={() => onOpen(idea)}
      className={[
        'group w-full rounded-lg bg-white p-4 text-left ring-1 ring-[#E5E7EB] transition-all duration-200',
        'hover:ring-2',
        accent.ring,
        accent.glow,
        'hover:shadow-md',
      ].join(' ')}
    >
      <p className="mb-2 text-[11px] font-medium text-text-secondary">
        {CATEGORY_LABEL[idea.category]}
      </p>
      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-text-primary">
        {idea.title}
      </h3>
      <IdeaCardPreview category={idea.category} />
    </button>
  );
}
