import { Send, Workflow, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/components/ui';
import type { CampaignTemplateKind } from '@/data/mock/campaignTemplates';

/**
 * Campaign path picker — Phase 4 D.1.6 simplification.
 *
 * Just two cards. Click → start the build immediately. No template grid here
 * (templates live inside the build flow: the wizard's SetupStep has a
 * "Start from template" button; the journey canvas has PrebuiltJourneyModal).
 *
 * The previous version showed a template grid below the cards, which the
 * user correctly identified as duplication (templates are inside the wizard
 * already) and reviewer-confusing (path picker + filter tabs + grid =
 * three places to make the same decision).
 */

interface Props {
  onPick: (kind: CampaignTemplateKind) => void;
}

export function CampaignPathPicker({ onPick }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <PathCard
        onClick={() => onPick('quick_run')}
        icon={Send}
        accent="#7C5CFF"
        title="Quick run"
        description="Single send. Pick channels, audience, content, and a schedule — one-time, recurring, or Smart AI. No multi-step logic."
        examples={[
          'One-off broadcast',
          'Recurring weekly nudge',
          'Smart-AI optimized send',
        ]}
      />
      <PathCard
        onClick={() => onPick('journey')}
        icon={Workflow}
        accent="#3DC9B0"
        title="Automated journey"
        description="Multi-step canvas. Branch on event triggers, time delays, audience splits, and tool outcomes. AI agents become canvas nodes."
        examples={[
          'Cart abandonment ladder',
          'Onboarding nudge sequence',
          'Loan recovery decision tree',
        ]}
      />
    </div>
  );
}

interface PathCardProps {
  onClick: () => void;
  icon: LucideIcon;
  accent: string;
  title: string;
  description: string;
  examples: string[];
}

function PathCard({ onClick, icon: Icon, accent, title, description, examples }: PathCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col gap-4 rounded-md border border-border-subtle bg-surface p-6 text-left',
        'transition-all hover:border-accent hover:shadow-[var(--shadow-card)]',
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accent}1F`, color: accent }}
        >
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[16px] font-semibold text-text-primary">{title}</span>
            <ChevronRight
              size={16}
              className="text-text-tertiary transition-colors group-hover:text-accent"
            />
          </div>
          <p className="mt-1.5 text-[13px] leading-5 text-text-secondary">{description}</p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-1.5 pt-3 border-t border-border-subtle">
        <li className="text-[10px] uppercase font-semibold tracking-[0.06em] text-text-tertiary mt-0.5 mr-1">
          Examples
        </li>
        {examples.map((ex) => (
          <li
            key={ex}
            className="rounded-full bg-surface-sunken px-2 h-5 inline-flex items-center text-[11px] text-text-secondary"
          >
            {ex}
          </li>
        ))}
      </ul>
    </button>
  );
}
