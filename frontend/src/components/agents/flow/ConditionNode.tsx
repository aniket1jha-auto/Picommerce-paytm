'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export interface ConditionNodeData {
  [key: string]: unknown;
  label: string;
  condition: string;
}

export function ConditionNode({ data, selected }: NodeProps) {
  const d = data as ConditionNodeData;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
      <div
        className={`rounded-lg border-2 bg-white shadow-sm transition-all ${
          selected ? 'border-cyan ring-2 ring-cyan/20' : 'border-amber-300'
        }`}
        style={{ minWidth: 180, maxWidth: 240 }}
      >
        <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-100">
            <GitBranch size={12} className="text-amber-600" />
          </div>
          <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
            Condition
          </span>
        </div>
        <div className="px-3 pb-1">
          <p className="text-sm font-medium text-text-primary leading-snug">{d.label}</p>
        </div>
        {d.condition && (
          <div className="px-3 pb-3">
            <p className="text-xs text-text-secondary italic">if {d.condition}</p>
          </div>
        )}
      </div>
      <Handle
        type="source"
        id="true"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        id="false"
        position={Position.Left}
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
      />
    </>
  );
}
