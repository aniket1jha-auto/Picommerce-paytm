'use client';

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export interface TriggerEdgeData {
  [key: string]: unknown;
  condition: string;
}

function getEdgeColor(condition: string): string {
  const lower = condition.toLowerCase();
  if (
    lower.includes('positive') ||
    lower.includes('converted') ||
    lower.includes('activated') ||
    lower.includes('renewed') ||
    lower.includes('paid') ||
    lower.includes('collected') ||
    lower.includes('complete')
  ) {
    return '#22c55e'; // green-500
  }
  if (
    lower.includes('no response') ||
    lower.includes('no action') ||
    lower.includes('not activated') ||
    lower.includes('not paid') ||
    lower.includes('not renewed') ||
    lower.includes('not converted') ||
    lower.includes('exhausted') ||
    lower.includes('no conversion')
  ) {
    return '#9ca3af'; // gray-400
  }
  if (
    lower.includes('negative') ||
    lower.includes('opted out') ||
    lower.includes('declined') ||
    lower.includes('defaulted')
  ) {
    return '#ef4444'; // red-500
  }
  return '#9ca3af'; // default gray
}

export function TriggerEdge({
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
  const edgeData = data as TriggerEdgeData | undefined;
  const condition = edgeData?.condition ?? '';
  const color = getEdgeColor(condition);

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
      {condition && (
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
              className="inline-flex items-center rounded-full border bg-white px-2 py-0.5 text-xs font-medium whitespace-nowrap shadow-sm"
              style={{ borderColor: color, color }}
            >
              {condition}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
