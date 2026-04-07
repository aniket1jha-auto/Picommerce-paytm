'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { CheckCircle, XCircle, AlertTriangle, ThumbsDown } from 'lucide-react';

export interface ExitNodeData {
  [key: string]: unknown;
  reason: 'converted' | 'opted_out' | 'max_attempts' | 'declined';
  label: string;
}

const exitConfig = {
  converted: {
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500',
    Icon: CheckCircle,
  },
  opted_out: {
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
    Icon: XCircle,
  },
  max_attempts: {
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    Icon: AlertTriangle,
  },
  declined: {
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
    Icon: ThumbsDown,
  },
} as const;

export function ExitNode({ data, selected }: NodeProps) {
  const nodeData = data as ExitNodeData;
  const { reason, label } = nodeData;
  const config = exitConfig[reason];
  const { Icon, borderColor, iconColor } = config;

  const ringClass = selected ? 'ring-2 ring-cyan-200' : '';

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white"
      />

      <div
        className={`flex items-center gap-2 bg-white border border-gray-200 border-l-4 ${borderColor} rounded-md px-3 py-2 shadow-sm transition-all duration-150 ${ringClass}`}
        style={{ minWidth: 160 }}
      >
        <Icon size={15} className={`shrink-0 ${iconColor}`} />
        <span className="text-sm font-medium text-gray-800 leading-snug">{label}</span>
      </div>
    </>
  );
}
