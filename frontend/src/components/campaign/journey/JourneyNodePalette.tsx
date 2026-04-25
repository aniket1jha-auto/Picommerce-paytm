'use client';

import { PALETTE_GROUPS } from './journeyConstants';
import type { JourneyNodeKind } from './journeyTypes';
import { TRIGGER_KINDS } from './journeyTypes';

const DRAG_TYPE = 'application/journey-palette';

interface JourneyNodePaletteProps {
  hasTrigger: boolean;
  onAddKind: (kind: JourneyNodeKind) => void;
  onDragStartKind?: (kind: JourneyNodeKind) => void;
}

export function JourneyNodePalette({ hasTrigger, onAddKind, onDragStartKind }: JourneyNodePaletteProps) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-[#E5E7EB] bg-[#F9FAFB]">
      <div className="border-b border-[#E5E7EB] px-3 py-3">
        <h2 className="text-sm font-semibold text-text-primary">Add Nodes</h2>
        <p className="mt-0.5 text-[11px] text-text-secondary">Drag onto the canvas or click to place at center.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {PALETTE_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
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
                        ev.dataTransfer.setData(DRAG_TYPE, item.kind);
                        ev.dataTransfer.effectAllowed = 'move';
                        onDragStartKind?.(item.kind);
                      }}
                      onClick={() => {
                        if (disabled) return;
                        onAddKind(item.kind);
                      }}
                      disabled={disabled}
                      className={[
                        'flex w-full cursor-grab items-start gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition-colors active:cursor-grabbing',
                        disabled
                          ? 'cursor-not-allowed opacity-40'
                          : 'hover:border-[#E5E7EB] hover:bg-white hover:shadow-sm',
                      ].join(' ')}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-text-primary">{item.label}</span>
                        <span className="mt-0.5 line-clamp-2 block text-[10px] leading-snug text-text-secondary">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

export const JOURNEY_PALETTE_DRAG_TYPE = DRAG_TYPE;
