'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

export interface StartNodeData {
  [key: string]: unknown;
  label: string;
}

export function StartNode({ selected }: NodeProps) {
  return (
    <>
      <div
        className={`rounded-full border-2 px-5 py-2.5 flex items-center gap-2 transition-all ${
          selected ? 'border-cyan ring-2 ring-cyan/20' : 'border-green-400'
        } bg-green-50`}
      >
        <Play size={14} className="text-green-600" />
        <span className="text-sm font-semibold text-green-800">Start</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
    </>
  );
}
