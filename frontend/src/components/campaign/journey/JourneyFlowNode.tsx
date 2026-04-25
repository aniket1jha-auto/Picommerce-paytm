import { memo, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { useAgentStore } from '@/store/agentStore';
import type {
  JourneyFlowNode as JourneyRFNode,
  JourneyNodeData,
  ConditionNodeData,
  WaitNodeData,
  AbSplitNodeData,
  VoiceAgentNodeData,
  ChatAgentNodeData,
  EntryTriggerNodeData,
} from './journeyTypes';
import { ENTRY_TRIGGER_KINDS } from './journeyTypes';
import { VOICE_OUTPUT_HANDLES, CHAT_OUTPUT_HANDLES } from './journeyConstants';

function StatusDot({ data }: { data: JourneyNodeData }) {
  if (data.needsConfig) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
        Needs configuration
      </span>
    );
  }
  if (!data.configured) {
    return (
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-gray-300 ring-2 ring-gray-100"
        title="Not configured"
      />
    );
  }
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-100"
      title="Valid"
    />
  );
}

const MULTI_OUT = new Set([
  'voice_agent',
  'chat_agent',
  'condition',
  'wait',
  'ab_split',
]);

function conditionPreview(c: ConditionNodeData) {
  if (!c.conditions.length) return 'Set condition';
  const parts = c.conditions.map((row) => `${row.attribute} ${row.operator} ${row.value}`.trim());
  return c.logic === 'or' ? parts.join(' OR ') : parts.join(' AND ');
}

const MESSAGING_KINDS = new Set([
  'whatsapp_message',
  'sms',
  'email',
  'push',
  'rcs_message',
  'in_app',
]);

function isEntryKind(kind: string) {
  return (ENTRY_TRIGGER_KINDS as readonly string[]).includes(kind);
}

export const JourneyFlowNode = memo(function JourneyFlowNode(props: NodeProps<JourneyRFNode>) {
  const { id, selected } = props;
  const data = props.data as unknown as JourneyNodeData;
  const { setNodes } = useReactFlow();
  const getAgentById = useAgentStore((s) => s.getAgentById);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label);

  const commitLabel = () => {
    const next = draft.trim() || data.label;
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next } } : n)),
    );
    setEditing(false);
  };

  const voiceData = data.kind === 'voice_agent' ? (data as VoiceAgentNodeData) : null;
  const chatData = data.kind === 'chat_agent' ? (data as ChatAgentNodeData) : null;
  const voiceAgent = voiceData?.agentId ? getAgentById(voiceData.agentId) : undefined;
  const chatAgent = chatData?.agentId ? getAgentById(chatData.agentId) : undefined;
  const dispositionLabel = (idKey: string, fallback: string) => {
    if (data.kind === 'voice_agent') {
      return voiceData?.dispositionLabels[idKey] ?? fallback;
    }
    if (data.kind === 'chat_agent') {
      return chatData?.outputLabels[idKey] ?? fallback;
    }
    return fallback;
  };

  const entryData = data.kind === 'entry_trigger' ? (data as EntryTriggerNodeData) : null;
  const kindTint = isEntryKind(data.kind)
    ? 'border-amber-400 bg-gradient-to-br from-amber-50/90 to-white'
    : data.kind === 'voice_agent'
      ? 'border-violet-500 bg-violet-50/35'
      : data.kind === 'chat_agent'
        ? 'border-teal-500 bg-teal-50/30'
        : MESSAGING_KINDS.has(data.kind)
          ? 'border-slate-300 bg-white'
          : 'border-[#E5E7EB] bg-white';

  return (
    <div
      className={[
        'relative w-[min(100%,260px)] rounded-lg border px-3 py-2.5 shadow-sm',
        kindTint,
        selected ? 'border-cyan ring-2 ring-cyan/30' : '',
      ].join(' ')}
    >
      {!isEntryKind(data.kind) && (
        <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-cyan" />
      )}

      <div className="flex items-start gap-2 pr-1">
        <span className="text-lg leading-none">{data.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-secondary">
            {data.typeLabel}
          </p>
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitLabel();
              }}
              className="mt-0.5 w-full border-b border-cyan bg-transparent text-sm font-semibold text-text-primary outline-none"
            />
          ) : (
            <button
              type="button"
              onDoubleClick={() => {
                setDraft(data.label);
                setEditing(true);
              }}
              className="mt-0.5 block w-full truncate text-left text-sm font-semibold text-text-primary"
            >
              {data.label}
            </button>
          )}
          {data.kind === 'entry_trigger' && entryData && (
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-text-secondary">
              {entryData.when === 'campaign_start' &&
                (entryData.startDate
                  ? `Start ${entryData.startDate} ${entryData.startTime}`
                  : 'Set campaign start date')}
              {entryData.when === 'behavioral_event' &&
                (entryData.eventName.trim() ? `On “${entryData.eventName}”` : 'Set behavioral event')}
              {entryData.when === 'recurring' &&
                `${entryData.recurringFrequency} · ${entryData.recurringDay}s @ ${entryData.recurringTime}`}
            </p>
          )}
          {data.kind === 'voice_agent' && voiceAgent && (
            <p className="mt-0.5 truncate text-[11px] text-text-secondary">
              {voiceAgent.config.name}
              {voiceAgent.status === 'deployed' && (
                <span className="ml-1.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">
                  Deployed
                </span>
              )}
            </p>
          )}
          {data.kind === 'chat_agent' && chatData && (
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-text-secondary">
              {chatAgent ? (
                <>
                  <span className="truncate">{chatAgent.config.name}</span>
                  <span className="shrink-0 rounded border border-[#E5E7EB] bg-[#F9FAFB] px-1 py-0 text-[9px] font-medium text-text-secondary">
                    {chatData.deployChannel === 'whatsapp_chat' ? 'WA Chat' : 'In-App'}
                  </span>
                </>
              ) : (
                <span>Select chat agent</span>
              )}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <StatusDot data={data} />
          </div>
        </div>
      </div>

      {data.kind === 'voice_agent' && (
        <div className="relative mt-2 border-t border-[#F3F4F6] pt-2 pl-1">
          <p className="mb-2 text-[9px] font-medium text-text-secondary">Call outcomes</p>
          <div className="relative pr-3">
            {VOICE_OUTPUT_HANDLES.map((h) => (
              <div
                key={h.id}
                className="relative flex h-7 items-center justify-between gap-2 border-b border-dashed border-[#F3F4F6] last:border-0"
              >
                <span className="truncate text-[10px] text-text-secondary">
                  {dispositionLabel(h.id, h.label)}
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={h.id}
                  className={`!h-2.5 !w-2.5 !border-2 !border-white ${h.color}`}
                  style={{ top: '50%', right: -8 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {data.kind === 'chat_agent' && (
        <div className="relative mt-2 border-t border-[#F3F4F6] pt-2 pl-1">
          <p className="mb-2 text-[9px] font-medium text-text-secondary">Outcomes</p>
          {CHAT_OUTPUT_HANDLES.map((h) => (
            <div
              key={h.id}
              className="relative flex h-7 items-center justify-between gap-2 border-b border-dashed border-[#F3F4F6] last:border-0"
            >
              <span className="truncate text-[10px] text-text-secondary">
                {dispositionLabel(h.id, h.label)}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={h.id}
                className={`!h-2.5 !w-2.5 !border-2 !border-white ${h.color}`}
                style={{ top: '50%', right: -8 }}
              />
            </div>
          ))}
        </div>
      )}

      {data.kind === 'condition' && (
        <div className="relative mt-2 border-t border-[#F3F4F6] pt-2 pl-1">
          <p className="mb-2 line-clamp-2 text-[10px] leading-snug text-text-secondary">
            {conditionPreview(data as ConditionNodeData)}
          </p>
          {(data as ConditionNodeData).pathLabels.map((pl, i) => (
            <div
              key={i}
              className="relative flex h-7 items-center justify-between gap-2 border-b border-dashed border-[#F3F4F6] last:border-0"
            >
              <span className="truncate text-[10px] font-medium text-text-secondary">{pl}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`path_${i}`}
                className="!h-2.5 !w-2.5 !border-2 !border-white !bg-cyan"
                style={{ top: '50%', right: -8 }}
              />
            </div>
          ))}
        </div>
      )}

      {data.kind === 'wait' && (
        <div className="relative mt-2 border-t border-[#F3F4F6] pt-2">
          <p className="text-[10px] text-text-secondary">
            {(data as WaitNodeData).waitType === 'duration'
              ? `${(data as WaitNodeData).durationValue} ${(data as WaitNodeData).durationUnit}`
              : (data as WaitNodeData).waitType === 'datetime'
                ? `Until ${(data as WaitNodeData).untilDate} ${(data as WaitNodeData).untilTime}`
                : (data as WaitNodeData).waitType === 'event'
                  ? `Until ${(data as WaitNodeData).eventKey}`
                  : `Up to ${(data as WaitNodeData).optimalMaxValue} ${(data as WaitNodeData).optimalMaxUnit} (optimal)`}
          </p>
          <Handle
            type="source"
            position={Position.Right}
            id="out"
            className="!h-2.5 !w-2.5 !border-2 !border-white !bg-cyan"
            style={{ top: '50%', right: -8 }}
          />
        </div>
      )}

      {data.kind === 'ab_split' && (
        <div className="relative mt-2 border-t border-[#F3F4F6] pt-2 pl-1">
          <p className="mb-2 text-[10px] text-text-secondary">
            {(data as AbSplitNodeData).variants.map((v) => `${v.percent}%`).join(' · ')}
          </p>
          {(data as AbSplitNodeData).variants.map((v, i) => (
            <div
              key={i}
              className="relative flex h-7 items-center justify-between gap-2 border-b border-dashed border-[#F3F4F6] last:border-0"
            >
              <span className="text-[10px] text-text-secondary">{v.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`var_${i}`}
                className="!h-2.5 !w-2.5 !border-2 !border-white !bg-violet-500"
                style={{ top: '50%', right: -8 }}
              />
            </div>
          ))}
        </div>
      )}

      {!MULTI_OUT.has(data.kind) && (
        <Handle
          type="source"
          position={Position.Right}
          id="out"
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-cyan"
          style={{ top: '50%', right: -8 }}
        />
      )}
    </div>
  );
});
