import { useEffect, useState } from 'react';
import { cn } from './cn';

interface WaveformProps {
  /** Static: derive bar heights deterministically from this seed; Live: animate. */
  seed?: string;
  mode?: 'static' | 'live';
  bars?: number;
  height?: number;
  className?: string;
}

/**
 * Voice motif. Static mode hashes the seed to a stable shape per identity.
 * Live mode animates a soft pulse — used during active calls / test console.
 */
export function Waveform({
  seed = 'pi',
  mode = 'static',
  bars = 5,
  height = 14,
  className,
}: WaveformProps) {
  const heights = useDeterministicHeights(seed, bars);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (mode !== 'live') return;
    const id = window.setInterval(() => setTick((t) => t + 1), 220);
    return () => window.clearInterval(id);
  }, [mode]);

  return (
    <div
      className={cn('inline-flex items-end gap-[2px]', className)}
      style={{ height }}
      aria-hidden
    >
      {heights.map((h, i) => {
        const baseH = mode === 'live' ? jitter(h, tick + i) : h;
        return (
          <span
            key={i}
            className="block w-[2px] rounded-full bg-blue-500"
            style={{
              height: `${Math.max(2, baseH * height)}px`,
              transition: 'height 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        );
      })}
    </div>
  );
}

function jitter(base: number, salt: number): number {
  /* small deterministic oscillation around base height */
  const wave = Math.sin((salt * 31) % 360) * 0.18;
  return clamp(base + wave, 0.25, 1);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function useDeterministicHeights(seed: string, count: number): number[] {
  /* Cheap stable hash → sequence of values in [0.25, 1] */
  const out: number[] = [];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  for (let i = 0; i < count; i++) {
    h = (h * 16777619 + i * 2654435761) >>> 0;
    const v = (h & 0xff) / 255;
    out.push(0.3 + v * 0.7);
  }
  return out;
}
