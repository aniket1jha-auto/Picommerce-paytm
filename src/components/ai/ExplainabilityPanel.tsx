'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataPoint {
  label: string;
  value: string | number;
}

interface EvidenceProps {
  source: string;
  dataPoints: DataPoint[];
  keyFactors?: string[];
}

interface ExplainabilityPanelProps {
  evidence: EvidenceProps;
}

export function ExplainabilityPanel({ evidence }: ExplainabilityPanelProps) {
  const [open, setOpen] = useState(false);

  const isPlatformSource = evidence.source.toLowerCase().startsWith('platform');

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
        aria-expanded={open}
      >
        <span className="font-medium underline-offset-2 hover:underline">Why?</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex items-center"
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="explainability-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-md bg-gray-50 p-2.5 text-xs">
              {/* Source */}
              <p className="mb-2 font-medium text-text-secondary">
                Source:{' '}
                <span className="text-text-primary">{evidence.source}</span>
              </p>

              {/* Platform disclaimer */}
              {isPlatformSource && (
                <div className="mb-2 rounded bg-amber-500/10 px-2 py-1.5 text-amber-700">
                  Your results may differ. This will personalize after you run 5+
                  campaigns.
                </div>
              )}

              {/* Data points */}
              {evidence.dataPoints.length > 0 && (
                <dl className="mb-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  {evidence.dataPoints.map((dp) => (
                    <div key={dp.label} className="contents">
                      <dt className="text-text-secondary">{dp.label}</dt>
                      <dd className="font-medium text-text-primary">{dp.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* Key factors */}
              {evidence.keyFactors && evidence.keyFactors.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {evidence.keyFactors.map((factor) => (
                    <li key={factor} className="flex items-start gap-1.5 text-text-secondary">
                      <span className="mt-0.5 shrink-0 text-[10px]">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
