import { cn } from './cn';

interface SkeletonProps {
  className?: string;
  /** Optional fixed dimensions (px). */
  width?: number | string;
  height?: number | string;
  rounded?: 'sm' | 'md' | 'full';
}

export function Skeleton({ className, width, height, rounded = 'sm' }: SkeletonProps) {
  const r = rounded === 'full' ? 'rounded-full' : rounded === 'md' ? 'rounded-md' : 'rounded';
  return (
    <div
      className={cn('skeleton-shimmer bg-surface-raised', r, className)}
      style={{ width, height }}
    />
  );
}

/* Append shimmer keyframes once globally — keeps tokens out of CSS */
const styleId = 'pi-skeleton-style';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const el = document.createElement('style');
  el.id = styleId;
  el.textContent = `
@keyframes pi-skeleton-shimmer {
  0%   { opacity: 0.55; }
  50%  { opacity: 0.85; }
  100% { opacity: 0.55; }
}
.skeleton-shimmer {
  animation: pi-skeleton-shimmer 1.4s ease-in-out infinite;
}
  `.trim();
  document.head.appendChild(el);
}
