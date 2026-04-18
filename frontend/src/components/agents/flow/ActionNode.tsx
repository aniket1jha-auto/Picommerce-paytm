'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';

export interface ActionNodeData {
  [key: string]: unknown;
  label: string;
  actionType: string;
}

export function ActionNode({ data, selected }: NodeProps) {
  const d = data as ActionNodeData;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
      <div
        className={`rounded-lg border-2 bg-white shadow-sm transition-all ${
          selected ? 'border-cyan ring-2 ring-cyan/20' : 'border-cyan'
        }`}
        style={{ minWidth: 180, maxWidth: 240 }}
      >
        <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan/10">
            <Zap size={12} className="text-cyan" />
          </div>
          <span className="text-[10px] font-semibold text-cyan uppercase tracking-wide">
            Action
          </span>
        </div>
        <div className="px-3 pb-1">
          <p className="text-sm font-medium text-text-primary leading-snug">{d.label}</p>
        </div>
        <div className="px-3 pb-3">
          <span className="text-xs bg-cyan/10 text-cyan px-2 py-0.5 rounded">{d.actionType}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
    </>
  );
}
