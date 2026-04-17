'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

export interface WaitNodeData {
  [key: string]: unknown;
  duration: string;
  businessHoursOnly?: boolean;
}

export function WaitNode({ data, selected }: NodeProps) {
  const nodeData = data as WaitNodeData;
  const { duration, businessHoursOnly } = nodeData;

  const ringClass = selected ? 'ring-2 ring-cyan-300' : '';

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white"
      />

      <div
        className={`flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1.5 transition-all duration-150 ${ringClass}`}
        style={{ minWidth: 120 }}
      >
        <Clock size={13} className="text-gray-500 shrink-0" />
        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
          Wait {duration}
        </span>
        {businessHoursOnly && (
          <span className="text-[10px] text-gray-400 whitespace-nowrap">(biz hrs)</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white"
      />
    </>
  );
}
