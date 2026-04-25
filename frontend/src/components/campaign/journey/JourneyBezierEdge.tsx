'use client';

import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { X } from 'lucide-react';

export const JourneyBezierEdge = memo(function JourneyBezierEdge({
  id,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: '#94A3B8', strokeWidth: 1.5 }} />
      {selected && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <button
              type="button"
              aria-label="Delete connection"
              onClick={() => setEdges((eds) => eds.filter((e) => e.id !== id))}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-text-secondary shadow-sm hover:bg-[#FEF2F2] hover:text-red-600"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
