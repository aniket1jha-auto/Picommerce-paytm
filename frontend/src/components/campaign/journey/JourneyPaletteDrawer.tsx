'use client';

import { useEffect, useRef } from 'react';
import { MessageSquare, Bot, GitBranch, LayoutTemplate } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PALETTE_GROUPS } from './journeyConstants';
import type { JourneyNodeKind } from './journeyTypes';
import { TRIGGER_KINDS } from './journeyTypes';

export const JOURNEY_PALETTE_DRAG_TYPE = 'application/journey-palette';

export type PaletteCategoryId = 'messaging' | 'agents' | 'logic' | 'templates';

interface RailIcon {
  id: PaletteCategoryId;
  icon: LucideIcon;
  label: string;
}

const RAIL_ICONS: RailIcon[] = [
  { id: 'messaging', icon: MessageSquare, label: 'Messages' },
  { id: 'agents', icon: Bot, label: 'AI Agents' },
  { id: 'logic', icon: GitBranch, label: 'Logic' },
  { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
];

/** Map a category id to one of the existing PALETTE_GROUPS titles. */
const CATEGORY_TO_GROUP: Record<Exclude<PaletteCategoryId, 'templates'>, string> = {
  messaging: 'Messages',
  agents: 'AI Agents',
  logic: 'Logic',
};

interface JourneyPaletteDrawerProps {
  open: boolean;
  category: PaletteCategoryId | null;
  hasTrigger: boolean;
  onOpenCategory: (id: PaletteCategoryId) => void;
  onClose: () => void;
  onAddKind: (kind: JourneyNodeKind) => void;
  onOpenTemplates: () => void;
}

export function JourneyPaletteDrawer({
  open,
  category,
  hasTrigger,
  onOpenCategory,
  onClose,
  onAddKind,
  onOpenTemplates,
}: JourneyPaletteDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function onDoc(e: MouseEvent) {
      if (!drawerRef.current) return;
      const target = e.target as Node;
      if (drawerRef.current.contains(target)) return;
      // Ignore clicks on the rail itself (rail buttons handle their own toggles)
      const rail = document.querySelector('[data-journey-palette-rail]');
      if (rail && rail.contains(target)) return;
      onClose();
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Rail — always visible, 56px on right edge of canvas */}
      <div
        data-journey-palette-rail
        className="absolute right-0 top-0 bottom-0 z-30 flex w-14 flex-col items-center gap-1 border-l border-border-subtle bg-surface py-3"
      >
        {RAIL_ICONS.map(({ id, icon: Icon, label }) => {
          const active = open && category === id;
          return (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              onClick={() => {
                if (id === 'templates') {
                  onOpenTemplates();
                  onClose();
                  return;
                }
                if (active) {
                  onClose();
                } else {
                  onOpenCategory(id);
                }
              }}
              className={[
                'group relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
              ].join(' ')}
            >
              <Icon size={18} strokeWidth={1.75} />
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Drawer — slides in over the canvas from the right, never pushes the surface */}
      <div
        ref={drawerRef}
        className={[
          'absolute right-14 top-0 bottom-0 z-30 w-[280px] overflow-hidden border-l border-border-subtle bg-surface transition-transform duration-200 ease-out',
          open ? 'translate-x-0 shadow-[var(--shadow-lg)]' : 'translate-x-full',
        ].join(' ')}
        aria-hidden={!open}
      >
        {open && category && category !== 'templates' && (
          <DrawerContent
            category={category}
            hasTrigger={hasTrigger}
            onAddKind={(k) => {
              onAddKind(k);
              onClose();
            }}
          />
        )}
      </div>
    </>
  );
}

function DrawerContent({
  category,
  hasTrigger,
  onAddKind,
}: {
  category: Exclude<PaletteCategoryId, 'templates'>;
  hasTrigger: boolean;
  onAddKind: (kind: JourneyNodeKind) => void;
}) {
  const groupTitle = CATEGORY_TO_GROUP[category];
  const group = PALETTE_GROUPS.find((g) => g.title === groupTitle);

  const headingMap: Record<typeof category, { title: string; subtitle: string }> = {
    messaging: { title: 'Messages', subtitle: 'Deterministic outbound channels' },
    agents: { title: 'AI Agents', subtitle: 'Conversational voice & chat' },
    logic: { title: 'Logic', subtitle: 'Branch, wait, split' },
  };

  const heading = headingMap[category];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-subtle px-4 py-3">
        <h2 className="text-[14px] font-semibold text-text-primary">{heading.title}</h2>
        <p className="mt-0.5 text-[11px] text-text-tertiary">{heading.subtitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1.5">
          {group?.items.map((item) => {
            const isTrigger = (TRIGGER_KINDS as readonly string[]).includes(item.kind);
            const disabled = isTrigger && hasTrigger;
            return (
              <li key={item.kind}>
                <button
                  type="button"
                  draggable={!disabled}
                  title={disabled ? 'Only one trigger per journey' : item.description}
                  onDragStart={(ev) => {
                    if (disabled) {
                      ev.preventDefault();
                      return;
                    }
                    ev.dataTransfer.setData(JOURNEY_PALETTE_DRAG_TYPE, item.kind);
                    ev.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => {
                    if (disabled) return;
                    onAddKind(item.kind);
                  }}
                  disabled={disabled}
                  className={[
                    'flex w-full cursor-grab items-center gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2 text-left transition-colors active:cursor-grabbing',
                    disabled
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:border-border-default hover:bg-surface-raised',
                  ].join(' ')}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-base">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-text-primary">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-text-tertiary">
                      {item.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
