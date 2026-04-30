import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from './cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const SIZE = {
  sm: 'max-w-[480px]',
  md: 'max-w-[640px]',
  lg: 'max-w-[880px]',
};

export function Modal({ open, onClose, title, size = 'md', children, footer, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[var(--color-backdrop)] animate-[pi-fade-in_120ms_ease-out]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        className={cn(
          'relative w-full bg-surface-raised border border-border-subtle rounded-[14px] shadow-[var(--shadow-modal)]',
          'animate-[pi-modal-in_180ms_cubic-bezier(0.16,1,0.3,1)]',
          SIZE[size],
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
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
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

const styleId = 'pi-modal-style';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const el = document.createElement('style');
  el.id = styleId;
  el.textContent = `
@keyframes pi-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes pi-modal-in {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
  `.trim();
  document.head.appendChild(el);
}
