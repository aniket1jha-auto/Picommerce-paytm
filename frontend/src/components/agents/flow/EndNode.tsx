'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';

export interface EndNodeData {
  [key: string]: unknown;
  label: string;
}

export function EndNode({ selected }: NodeProps) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
      <div
        className={`rounded-full border-2 px-5 py-2.5 flex items-center gap-2 transition-all ${
          selected ? 'border-cyan ring-2 ring-cyan/20' : 'border-red-300'
        } bg-red-50`}
      >
        <Square size={14} className="text-red-500" />
        <span className="text-sm font-semibold text-red-700">End Call</span>
      </div>
    </>
  );
}
