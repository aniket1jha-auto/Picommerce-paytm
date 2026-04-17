import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { usePhaseStore } from '@/store/phaseStore';
import { phases } from '@/data/phases';
import type { Phase } from '@/types';

const phaseOrder: Phase[] = ['day0', 'day1', 'day30'];

export function PhaseTimeline() {
  const currentPhase = usePhaseStore((s) => s.phase);
  const setPhase = usePhaseStore((s) => s.setPhase);
  const [tooltipPhase, setTooltipPhase] = useState<Phase | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentIndex = phaseOrder.indexOf(currentPhase);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
      setTooltipPhase(null);
    }
  }, []);

  useEffect(() => {
    if (tooltipPhase) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [tooltipPhase, handleClickOutside]);

  return (
    <div className="flex h-12 items-center gap-1 border-b border-[#E5E7EB] bg-white px-6">
      <span className="mr-3 text-xs font-medium text-text-secondary">Phase:</span>
      <div className="flex items-center gap-0">
        {phases.map((phase, index) => {
          const phaseIdx = phaseOrder.indexOf(phase.id);
          const isActive = phase.id === currentPhase;
          const isPast = phaseIdx < currentIndex;
          const showLine = index < phases.length - 1;

          return (
            <div key={phase.id} className="flex items-center">
              {/* Point + Label */}
              <button
                onClick={() => setPhase(phase.id)}
                className="group flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-[#F7F9FC]"
              >
                <motion.div
                  className="relative flex h-4 w-4 items-center justify-center rounded-full border-2"
                  animate={{
                    borderColor: isActive ? '#00BAF2' : isPast ? '#002970' : '#D1D5DB',
                    backgroundColor: isActive ? '#00BAF2' : isPast ? '#002970' : 'transparent',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {(isActive || isPast) && (
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </motion.div>
                <span
                  className={[
                    'text-xs font-medium whitespace-nowrap',
                    isActive ? 'text-cyan' : isPast ? 'text-navy' : 'text-text-secondary',
                  ].join(' ')}
                >
                  {phase.label}: {phase.subtitle}
                </span>
              </button>

              {/* Info icon */}
              <div className="relative" ref={tooltipPhase === phase.id ? tooltipRef : undefined}>
                <button
                  onClick={() => setTooltipPhase(tooltipPhase === phase.id ? null : phase.id)}
                  className="ml-0.5 flex h-5 w-5 items-center justify-center rounded text-text-secondary transition-colors hover:text-text-primary"
                  aria-label={`Info about ${phase.label}`}
                >
                  <Info size={12} />
                </button>
                {tooltipPhase === phase.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-1/2 top-full z-50 mt-1.5 w-64 -translate-x-1/2 rounded-lg bg-navy p-3 text-xs leading-relaxed text-white shadow-lg"
                  >
                    <p className="font-semibold">{phase.label} — {phase.subtitle}</p>
                    <p className="mt-1 text-white/80">{phase.description}</p>
                  </motion.div>
                )}
              </div>

              {/* Connector line */}
              {showLine && (
                <div className="mx-1 h-0.5 w-8 rounded-full bg-[#E5E7EB]">
                  <motion.div
                    className="h-full rounded-full bg-navy"
                    animate={{ width: isPast ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
