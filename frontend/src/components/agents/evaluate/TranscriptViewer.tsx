import { useMemo, useState } from 'react';
import { Play, Wrench, ChevronDown } from 'lucide-react';
import { useAgentStore } from '@/store/agentStore';
import type { CallTranscript, SentimentType } from '@/types/agent';

interface Props {
  agentId: string;
}

const SENTIMENT_COLORS: Record<SentimentType, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-700',
};

export function TranscriptViewer({ agentId }: Props) {
  const allTranscripts = useAgentStore((s) => s.transcripts);
  const transcripts = allTranscripts.filter((t) => t.agentId === agentId);
  const agent = useAgentStore((s) => s.getAgentById(agentId));
  const [selectedTranscript, setSelectedTranscript] = useState<CallTranscript | null>(null);
  const [intentFilter, setIntentFilter] = useState<Set<string>>(() => new Set());
  const [sentimentFilter, setSentimentFilter] = useState<Set<SentimentType>>(() => new Set());
  const [durationFilter, setDurationFilter] = useState<
    Set<'0_10' | '10_30' | '30_60' | '60_120' | '120_plus'>
  >(() => new Set());
  const [toolFilter, setToolFilter] = useState<Set<string>>(() => new Set());
  const [openMenu, setOpenMenu] = useState<'intent' | 'sentiment' | 'duration' | 'tool' | null>(null);

  const active = selectedTranscript ?? transcripts[0] ?? null;

  const intents = useMemo(() => {
    const set = new Set<string>();
    for (const t of transcripts) {
      if (t.intent?.trim()) set.add(t.intent.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [transcripts]);

  function durationBucket(seconds: number) {
    if (seconds <= 10) return '0_10';
    if (seconds <= 30) return '10_30';
    if (seconds <= 60) return '30_60';
    if (seconds <= 120) return '60_120';
    return '120_plus';
  }

  function hasToolCalls(t: CallTranscript) {
    return t.messages.some((m) => m.role === 'tool');
  }

  const toolOptions = useMemo(() => {
    // POC: show sample tool names, plus any tool names observed in transcripts.
    const sample = ['get_customer_orders', 'cancel_order', 'get_payment_status'];
    const set = new Set<string>(sample);
    for (const t of transcripts) {
      for (const m of t.messages) {
        if (m.role === 'tool') set.add(m.toolName);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [transcripts]);

  const agentHasTools =
    (agent?.config?.builtInTools?.length ?? 0) > 0 || (agent?.config?.customFunctions?.length ?? 0) > 0;

  const filteredTranscripts = useMemo(() => {
    return transcripts.filter((t) => {
      if (intentFilter.size > 0 && !intentFilter.has((t.intent ?? '').trim())) return false;
      if (sentimentFilter.size > 0 && (!t.sentiment || !sentimentFilter.has(t.sentiment))) return false;
      if (durationFilter.size > 0 && !durationFilter.has(durationBucket(t.duration))) return false;
      if (agentHasTools && toolFilter.size > 0) {
        const used = new Set<string>();
        for (const m of t.messages) {
          if (m.role === 'tool') used.add(m.toolName);
        }
        let any = false;
        for (const name of toolFilter) {
          if (used.has(name)) {
            any = true;
            break;
          }
        }
        if (!any) return false;
      }
      return true;
    });
  }, [agentHasTools, durationFilter, intentFilter, sentimentFilter, toolFilter, transcripts]);

  const activeHasTools = active ? hasToolCalls(active) : false;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Transcript List */}
      <div className="col-span-1 space-y-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-3">
          <div className="grid grid-cols-2 gap-2">
            {/* Intent */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((v) => (v === 'intent' ? null : 'intent'))}
                className="flex w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-2.5 py-2 text-left text-sm text-text-primary hover:bg-[#F9FAFB]"
              >
                <span className="text-sm">
                  Intent{intentFilter.size > 0 ? ` (${intentFilter.size})` : ''}
                </span>
                <ChevronDown size={14} className="text-text-secondary" />
              </button>
              {openMenu === 'intent' && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setIntentFilter(new Set())}
                    className="w-full rounded-md px-2 py-1 text-left text-xs font-semibold text-text-secondary hover:bg-[#F9FAFB]"
                  >
                    Clear
                  </button>
                  <div className="max-h-56 overflow-y-auto">
                    {intents.map((it) => {
                      const checked = intentFilter.has(it);
                      return (
                        <label key={it} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#F9FAFB]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setIntentFilter((prev) => {
                                const next = new Set(prev);
                                if (next.has(it)) next.delete(it);
                                else next.add(it);
                                return next;
                              });
                            }}
                            className="accent-cyan"
                          />
                          <span className="text-text-primary">{it.replaceAll('_', ' ')}</span>
                        </label>
                      );
                    })}
                    {intents.length === 0 && (
                      <div className="px-2 py-2 text-xs text-text-secondary">No intents found.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sentiment */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((v) => (v === 'sentiment' ? null : 'sentiment'))}
                className="flex w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-2.5 py-2 text-left text-sm text-text-primary hover:bg-[#F9FAFB]"
              >
                <span className="text-sm">
                  Sentiment{sentimentFilter.size > 0 ? ` (${sentimentFilter.size})` : ''}
                </span>
                <ChevronDown size={14} className="text-text-secondary" />
              </button>
              {openMenu === 'sentiment' && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setSentimentFilter(new Set())}
                    className="w-full rounded-md px-2 py-1 text-left text-xs font-semibold text-text-secondary hover:bg-[#F9FAFB]"
                  >
                    Clear
                  </button>
                  {(['positive', 'neutral', 'negative'] as const).map((s) => {
                    const checked = sentimentFilter.has(s);
                    return (
                      <label key={s} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#F9FAFB]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSentimentFilter((prev) => {
                              const next = new Set(prev);
                              if (next.has(s)) next.delete(s);
                              else next.add(s);
                              return next;
                            });
                          }}
                          className="accent-cyan"
                        />
                        <span className="text-text-primary">{s}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((v) => (v === 'duration' ? null : 'duration'))}
                className="flex w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-2.5 py-2 text-left text-sm text-text-primary hover:bg-[#F9FAFB]"
              >
                <span className="text-sm">
                  Duration{durationFilter.size > 0 ? ` (${durationFilter.size})` : ''}
                </span>
                <ChevronDown size={14} className="text-text-secondary" />
              </button>
              {openMenu === 'duration' && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setDurationFilter(new Set())}
                    className="w-full rounded-md px-2 py-1 text-left text-xs font-semibold text-text-secondary hover:bg-[#F9FAFB]"
                  >
                    Clear
                  </button>
                  {([
                    { id: '0_10', label: '0–10s' },
                    { id: '10_30', label: '10–30s' },
                    { id: '30_60', label: '30–60s' },
                    { id: '60_120', label: '1–2m' },
                    { id: '120_plus', label: '> 2m' },
                  ] as const).map((opt) => {
                    const checked = durationFilter.has(opt.id);
                    return (
                      <label key={opt.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#F9FAFB]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setDurationFilter((prev) => {
                              const next = new Set(prev);
                              if (next.has(opt.id)) next.delete(opt.id);
                              else next.add(opt.id);
                              return next;
                            });
                          }}
                          className="accent-cyan"
                        />
                        <span className="text-text-primary">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tool names */}
            <div className="relative">
              <button
                type="button"
                disabled={!agentHasTools}
                onClick={() => setOpenMenu((v) => (v === 'tool' ? null : 'tool'))}
                className={[
                  'flex w-full items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-2.5 py-2 text-left text-sm text-text-primary',
                  agentHasTools ? 'hover:bg-[#F9FAFB]' : 'cursor-not-allowed opacity-60',
                ].join(' ')}
              >
                <span className="text-sm">
                  Tool calls{toolFilter.size > 0 ? ` (${toolFilter.size})` : ''}
                </span>
                <ChevronDown size={14} className="text-text-secondary" />
              </button>
              {openMenu === 'tool' && agentHasTools && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setToolFilter(new Set())}
                    className="w-full rounded-md px-2 py-1 text-left text-xs font-semibold text-text-secondary hover:bg-[#F9FAFB]"
                  >
                    Clear
                  </button>
                  <div className="max-h-56 overflow-y-auto">
                    {toolOptions.map((name) => {
                      const checked = toolFilter.has(name);
                      return (
                        <label key={name} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#F9FAFB]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setToolFilter((prev) => {
                                const next = new Set(prev);
                                if (next.has(name)) next.delete(name);
                                else next.add(name);
                                return next;
                              });
                            }}
                            className="accent-cyan"
                          />
                          <span className="text-text-primary">{name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredTranscripts.map((transcript) => (
            <button
              key={transcript.id}
              onClick={() => setSelectedTranscript(transcript)}
              className={`w-full rounded-lg border p-3 text-left transition-all ${
                active?.id === transcript.id
                  ? 'border-cyan bg-cyan/5'
                  : 'border-[#E5E7EB] hover:border-cyan/50'
              }`}
              data-testid={`transcript-${transcript.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">
                  {new Date(transcript.timestamp).toLocaleDateString()}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    transcript.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {transcript.status}
                </span>
              </div>
              <div className="text-sm text-text-primary line-clamp-2">
                {transcript.messages.find((m) => m.role !== 'tool' && 'content' in m)?.content}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                <span>{Math.floor(transcript.duration / 60)}m {transcript.duration % 60}s</span>
                <span>•</span>
                <span>{transcript.messages.filter((m) => m.role !== 'tool').length} messages</span>
                {hasToolCalls(transcript) && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 rounded bg-[#111827]/5 px-1.5 py-0.5 text-[11px] font-medium text-[#111827]/80">
                      <Wrench size={12} />
                      Tools
                    </span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transcript Detail */}
      <div className="col-span-2">
        {active ? (
          <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#E5E7EB]">
              <div>
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  Call Transcript
                </h3>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span>{new Date(active.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>Duration: {Math.floor(active.duration / 60)}m {active.duration % 60}s</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {active.intent && (
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan/10 text-cyan font-medium">
                      Intent: {active.intent.replaceAll('_', ' ')}
                    </span>
                  )}
                  {active.sentiment && (
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${SENTIMENT_COLORS[active.sentiment]}`}>
                      Sentiment: {active.sentiment}
                    </span>
                  )}
                  {activeHasTools && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[#111827]/5 text-[#111827]/80 font-medium inline-flex items-center gap-1">
                      <Wrench size={12} />
                      Tool calls present
                    </span>
                  )}
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-gray-50"
                data-testid="play-audio-btn"
              >
                <Play size={14} />
                Play Audio
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {active.messages.map((message, idx) => (
                message.role === 'tool' ? (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111827]/10 text-[#111827]">
                      <Wrench size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-text-primary">Tool call</span>
                        <span className="text-xs text-text-secondary">{new Date(message.timestamp).toLocaleTimeString()}</span>
                        <span
                          className={[
                            'text-[11px] px-2 py-0.5 rounded font-medium',
                            message.status === 'success'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700',
                          ].join(' ')}
                        >
                          {message.status}
                        </span>
                      </div>
                      <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm">
                        <div className="font-semibold text-text-primary">{message.toolName}</div>
                        {message.input && <div className="mt-1 text-xs text-text-secondary">Input: {message.input}</div>}
                        {message.output && <div className="mt-1 text-xs text-text-secondary">Output: {message.output}</div>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className={`flex gap-3 ${message.role === 'agent' ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === 'agent'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {message.role === 'agent' ? 'A' : 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-text-primary capitalize">{message.role}</span>
                        <span className="text-xs text-text-secondary">{new Date(message.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div
                        className={`rounded-lg p-3 text-sm ${
                          message.role === 'agent'
                            ? 'bg-purple-50 text-text-primary'
                            : 'bg-blue-50 text-text-primary'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Tags */}
            {active.tags.length > 0 && (
              <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
                <div className="text-xs font-medium text-text-secondary mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {active.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-12 ring-1 ring-[#E5E7EB] text-center">
            <p className="text-sm text-text-secondary">Select a transcript to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
