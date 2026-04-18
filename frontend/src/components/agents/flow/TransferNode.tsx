'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { PhoneForwarded } from 'lucide-react';

export interface TransferNodeData {
  [key: string]: unknown;
  label: string;
  transferTo: string;
}

export function TransferNode({ data, selected }: NodeProps) {
  const d = data as TransferNodeData;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
      <div
        className={`rounded-lg border-2 bg-white shadow-sm transition-all ${
          selected ? 'border-cyan ring-2 ring-cyan/20' : 'border-orange-300'
        }`}
        style={{ minWidth: 180 }}
      >
        <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-100">
            <PhoneForwarded size={12} className="text-orange-600" />
          </div>
          <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">
            Transfer
          </span>
        </div>
        <div className="px-3 pb-3">
          <p className="text-sm font-medium text-text-primary leading-snug">{d.label}</p>
          {d.transferTo && (
            <p className="text-xs text-text-secondary mt-1">To: {d.transferTo}</p>
          )}
        </div>
      </div>
    </>
  );
}
