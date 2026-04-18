'use client';

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export interface FlowEdgeData {
  [key: string]: unknown;
  label?: string;
}

function getEdgeColor(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes('interested') || lower.includes('resolved') || lower.includes('yes')) return '#22c55e';
  if (lower.includes('not interested') || lower.includes('escalate') || lower.includes('no')) return '#ef4444';
  return '#9ca3af';
}

export function FlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const edgeData = data as FlowEdgeData | undefined;
  const label = edgeData?.label ?? '';
  const color = label ? getEdgeColor(label) : '#9ca3af';

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: color, strokeWidth: 2 }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <span
              className="inline-flex items-center rounded-full border bg-white px-2 py-0.5 text-[10px] font-medium whitespace-nowrap shadow-sm"
              style={{ borderColor: color, color }}
            >
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
