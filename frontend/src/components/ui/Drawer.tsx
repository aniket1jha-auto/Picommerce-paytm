import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Drawer({ open, onClose, title, width = 480, children, footer, className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-[var(--color-backdrop)] animate-[pi-fade-in_120ms_ease-out]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal
        className={cn(
          'relative h-full bg-surface-raised border-l border-border-subtle shadow-[var(--shadow-modal)] flex flex-col',
          'animate-[pi-drawer-in_200ms_cubic-bezier(0.16,1,0.3,1)]',
          className,
        )}
        style={{ width }}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4 shrink-0">
            <div className="text-[15px] font-semibold text-text-primary">{title}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3 shrink-0">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}

const styleId = 'pi-drawer-style';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const el = document.createElement('style');
  el.id = styleId;
  el.textContent = `
@keyframes pi-drawer-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
  `.trim();
  document.head.appendChild(el);
}
