'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { HelpCircle } from 'lucide-react';

export interface QuestionNodeData {
  [key: string]: unknown;
  label: string;
  content: string;
}

export function QuestionNode({ data, selected }: NodeProps) {
  const d = data as QuestionNodeData;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
      <div
        className={`rounded-lg border-2 bg-white shadow-sm transition-all ${
          selected ? 'border-cyan ring-2 ring-cyan/20' : 'border-blue-300'
        }`}
        style={{ minWidth: 200, maxWidth: 260 }}
      >
        <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100">
            <HelpCircle size={12} className="text-blue-600" />
          </div>
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
            Question
          </span>
        </div>
        <div className="px-3 pb-1">
          <p className="text-sm font-medium text-text-primary leading-snug">{d.label}</p>
        </div>
        {d.content && (
          <div className="px-3 pb-3">
            <p className="text-xs text-text-secondary line-clamp-2">{d.content}</p>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        id="yes"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        id="no"
        position={Position.Left}
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
      />
    </>
  );
}
