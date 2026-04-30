'use client';

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { X } from 'lucide-react';

interface JourneyEdgeData {
  /** Set by JourneyBuilderStep when this edge connects to/from the selected node. */
  active?: boolean;
  /** Optional inline label (e.g. "True", "Answered") rendered as a chip mid-edge. */
  label?: string;
}

/**
 * Edge renderer used for every connection in the journey canvas.
 *
 * - Smoothstep path (right-angle, rounded corners) — matches modern flow tools.
 * - Default: --border-strong, 1.5px, plain.
 * - Hover: --brand-500, 2px (CSS via group-hover on the edge group).
 * - Active (source or target node selected): --brand-500, 2px, animated dashed flow.
 * - Optional `data.label` renders as a chip at the midpoint.
 * - Selected edge: shows a delete affordance.
 */
export const JourneyBezierEdge = memo(function JourneyEdge({
  id,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const edgeData = (data ?? {}) as JourneyEdgeData;
  const active = !!edgeData.active;

  const stroke = active ? 'var(--brand-500)' : 'var(--border-strong)';
  const strokeWidth = active ? 2 : 1.5;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke,
          strokeWidth,
          // Animated dashed flow on the active path.
          strokeDasharray: active ? '6 4' : undefined,
          animation: active ? 'journey-edge-flow 1.4s linear infinite' : undefined,
        }}
      />

      {edgeData.label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <span
              className={[
                'inline-flex h-5 items-center rounded-sm px-2 text-[11px] font-medium tabular-nums',
                'border border-border-subtle bg-surface-raised shadow-[var(--shadow-xs)]',
                active ? 'text-brand-700' : 'text-text-secondary',
              ].join(' ')}
            >
              {edgeData.label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}

      {selected && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + (edgeData.label ? 18 : 0)}px)`,
              pointerEvents: 'all',
            }}
          >
            <button
              type="button"
              aria-label="Delete connection"
              onClick={() => setEdges((eds) => eds.filter((e) => e.id !== id))}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-subtle bg-surface text-text-secondary shadow-[var(--shadow-sm)] hover:bg-error-soft hover:text-error"
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
