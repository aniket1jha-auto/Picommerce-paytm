import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import type { AgentConfiguration } from '@/types/agent';
import { collateChatAgentSystemPrompt } from '@/utils/collateChatAgentPrompt';
import { sendAnthropicChatMessage } from '@/utils/anthropicChat';
import { CHAT_CHANNELS } from '@/data/chatAgentConstants';

type ChatEntry =
  | { kind: 'user'; text: string; ts: string }
  | { kind: 'agent'; text: string; ts: string; quickReplies?: string[] }
  | { kind: 'tool'; name: string; ts: string };

function nowTs(): string {
  return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function splitToolLines(text: string): { clean: string; tools: string[] } {
  const tools: string[] = [];
  const lines = text.split('\n');
  const rest: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\[TOOL:([^\]]+)\]\s*$/);
    if (m) tools.push(m[1].trim());
    else rest.push(line);
  }
  return { clean: rest.join('\n').trim(), tools };
}

function openingMessage(config: AgentConfiguration): string {
  const step1 = config.instructionSteps?.[0]?.instruction?.trim() ?? '';
  const name =
    config.chatDisplayName?.trim() ||
    config.name.trim() ||
    CHAT_CHANNELS.find((c) => c.id === config.chatChannel)?.label ||
    'Assistant';
  return step1
    ? `Hi! I'm ${name}. ${step1}`
    : `Hi! I'm ${name}. How can I help you today?`;
}

export function ChatTestPanel({
  config,
  layout = 'default',
}: {
  config: AgentConfiguration;
  /** `review`: compact reset + copy for Review & Deploy step */
  layout?: 'default' | 'review';
}) {
  const system = useMemo(() => collateChatAgentSystemPrompt(config), [config]);
  const steps = config.instructionSteps ?? [];

  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const seedOpening = useCallback(() => {
    const agentCount = 0;
    const qr = (steps[Math.min(agentCount, Math.max(0, steps.length - 1))]?.quickReplies ?? []).filter(
      (q) => q.trim(),
    );
    setEntries([
      {
        kind: 'agent',
        text: openingMessage(config),
        ts: nowTs(),
        quickReplies: qr.length ? qr.slice(0, 3) : undefined,
      },
    ]);
    setError(null);
  }, [config, steps]);

  useEffect(() => {
    seedOpening();
  }, [seedOpening]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries, typing]);

  const buildApiMessages = useCallback(
    (history: ChatEntry[]) => {
      const msgs: { role: 'user' | 'assistant'; content: string }[] = [];
      for (const e of history) {
        if (e.kind === 'user') msgs.push({ role: 'user', content: e.text });
        if (e.kind === 'agent') msgs.push({ role: 'assistant', content: e.text });
      }
      return msgs;
    },
    [],
  );

  const sendUser = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userEntry: ChatEntry = { kind: 'user', text: trimmed, ts: nowTs() };
    const priorAgentCount = entries.filter((e) => e.kind === 'agent').length;
    const nextHistory = [...entries, userEntry];
    setEntries(nextHistory);
    setInput('');
    setTyping(true);
    setError(null);

    try {
      const apiMessages = buildApiMessages(nextHistory);
      const { text: raw, toolCalls } = await sendAnthropicChatMessage({
        system,
        messages: apiMessages,
      });

      const { clean, tools } = splitToolLines(raw);
      const fromModel = toolCalls.map((t) => t.name);
      const toolNames = [...new Set([...tools, ...fromModel])];

      const stepIdx = Math.min(priorAgentCount, Math.max(0, steps.length - 1));
      const qr = (steps[stepIdx]?.quickReplies ?? []).filter((q) => q.trim()).slice(0, 3);

      const ts = nowTs();
      let appended: ChatEntry[] = [...nextHistory];
      for (const name of toolNames) {
        appended = [...appended, { kind: 'tool', name, ts }];
      }
      appended = [
        ...appended,
        {
          kind: 'agent',
          text: clean || '…',
          ts,
          quickReplies: qr.length ? qr : undefined,
        },
      ];
      setEntries(appended);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not reach the agent. Check your configuration and try again.',
      );
    } finally {
      setTyping(false);
    }
  };

  const channelIcon = CHAT_CHANNELS.find((c) => c.id === config.chatChannel)?.icon ?? '💬';
  const displayTitle =
    config.chatDisplayName?.trim() || config.name.trim() || 'Chat agent';

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-[#0F172A] shadow-inner">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-lg">{channelIcon}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{displayTitle}</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400/90">Live preview</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            seedOpening();
            setInput('');
          }}
          className={
            layout === 'review'
              ? 'inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-transparent px-2 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white'
              : 'inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white'
          }
        >
          <RotateCcw size={layout === 'review' ? 11 : 12} />
          {layout === 'review' ? 'Reset' : 'Reset conversation'}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {entries.map((e, i) => {
          if (e.kind === 'user') {
            return (
              <div key={`${i}-u`} className="flex flex-col items-end gap-0.5">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-cyan px-3 py-2 text-sm text-white shadow-md">
                  {e.text}
                </div>
                <span className="text-[10px] text-white/40">{e.ts}</span>
              </div>
            );
          }
          if (e.kind === 'tool') {
            return (
              <div key={`${i}-t`} className="flex justify-center">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-emerald-200/90">
                  ⚙ Called: {e.name}
                </span>
              </div>
            );
          }
          return (
            <div key={`${i}-a`} className="flex flex-col items-start gap-0.5">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 px-3 py-2 text-sm text-white/90 shadow-md">
                {e.text}
              </div>
              <span className="text-[10px] text-white/40">{e.ts}</span>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl bg-white/10 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="border-t border-red-500/30 bg-red-950/40 px-3 py-2 text-center text-xs text-red-200">
          <p>Could not reach the agent. Check your configuration and try again.</p>
          <p className="mt-1 line-clamp-2 text-[10px] text-red-300/90">{error}</p>
        </div>
      )}

      {(() => {
        const lastAgent = [...entries].reverse().find((e) => e.kind === 'agent') as
          | Extract<ChatEntry, { kind: 'agent' }>
          | undefined;
        const qr = lastAgent?.quickReplies?.filter(Boolean) ?? [];
        if (!qr.length || typing) return null;
        return (
          <div className="flex flex-wrap gap-2 border-t border-white/10 px-3 py-2">
            {qr.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => sendUser(label)}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                {label}
              </button>
            ))}
          </div>
        );
      })()}

      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendUser(input);
              }
            }}
            placeholder="Type a message..."
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
          />
          <button
            type="button"
            onClick={() => void sendUser(input)}
            disabled={typing || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan text-white transition-colors hover:bg-cyan/90 disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/40">
          {layout === 'review'
            ? 'Simulation only — tool calls and channel-specific features behave differently in production.'
            : 'This is a simulation. Actual tool calls and channel-specific features will behave differently in production.'}
        </p>
      </div>
    </div>
  );
}
