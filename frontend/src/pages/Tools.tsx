import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Wrench,
  PhoneOff,
  Voicemail,
  PhoneForwarded,
  UserCheck,
  MessageSquare,
  Globe,
  Building2,
  Calendar,
  Hash,
  Webhook,
  Sheet,
  Settings,
  MessageCircle,
  Info,
  Lock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TOOL_CATEGORIES, ALL_TOOLS } from '@/data/toolConstants';
import type { ToolDefinition } from '@/types/tool';
import { useAgentStore } from '@/store/agentStore';
import {
  Input,
  Textarea,
  Select,
  EmptyState,
  cn,
} from '@/components/ui';

const ICON_MAP: Record<string, LucideIcon> = {
  Wrench,
  Search,
  PhoneOff,
  Voicemail,
  PhoneForwarded,
  UserCheck,
  MessageSquare,
  Globe,
  Building2,
  Calendar,
  Hash,
  Webhook,
  Sheet,
};

function ToolIcon({ icon, color, size = 20 }: { icon: string; color: string; size?: number }) {
  const Icon = ICON_MAP[icon] || Wrench;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: `${color}1F`, width: size + 14, height: size + 14 }}
    >
      <Icon size={size} style={{ color }} />
    </div>
  );
}

/* ─── Reverse linkage: which agents reference each tool ────────────────── */

function useAgentsByToolId(): Record<string, { id: string; name: string }[]> {
  const agents = useAgentStore((s) => s.agents);
  return useMemo(() => {
    const out: Record<string, { id: string; name: string }[]> = {};
    for (const a of agents) {
      const stepIds = a.config.instructionSteps?.flatMap((s) => s.attachedToolIds ?? []) ?? [];
      const ids = new Set<string>([
        ...stepIds,
        ...(a.config.globalToolIds ?? []),
        ...(a.config.builtInTools ?? []),
      ]);
      for (const tid of ids) {
        (out[tid] ??= []).push({ id: a.id, name: a.config.name });
      }
    }
    // Dedupe by agent id (an agent attaching the same tool twice should count once).
    for (const tid of Object.keys(out)) {
      const seen = new Set<string>();
      out[tid] = out[tid].filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
    }
    return out;
  }, [agents]);
}

/* ─── Left panel: tool list with reverse-linkage counts ────────────────── */

function ToolListPanel({
  selectedTool,
  onSelect,
  usageById,
}: {
  selectedTool: ToolDefinition | null;
  onSelect: (tool: ToolDefinition) => void;
  usageById: Record<string, { id: string; name: string }[]>;
}) {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return TOOL_CATEGORIES;
    const q = search.toLowerCase();
    return TOOL_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <div className="flex flex-col h-full border-r border-border-subtle bg-surface">
      {/* Create tool — disabled in v1, honest copy */}
      <div className="p-3 border-b border-border-subtle">
        <button
          type="button"
          disabled
          title="Custom tool creation lands in Phase 5"
          className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-border-default px-3 py-2 text-[12px] font-medium text-text-tertiary cursor-not-allowed"
        >
          <Lock size={12} />
          Custom tool — coming Phase 5
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Search tools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-3">
            <div className="px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.10em] text-text-tertiary">
              {category.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {category.items.map((tool) => {
                const usedBy = usageById[tool.id]?.length ?? 0;
                const isActive = selectedTool?.id === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onSelect(tool)}
                    className={cn(
                      'group flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 text-left transition-colors',
                      isActive
                        ? 'bg-accent-soft text-text-primary'
                        : 'hover:bg-surface-raised',
                    )}
                  >
                    <ToolIcon icon={tool.icon} color={tool.color} size={14} />
                    <span
                      className={cn(
                        'flex-1 text-[13px] truncate',
                        isActive ? 'font-medium' : 'text-text-primary',
                      )}
                    >
                      {tool.name}
                    </span>
                    {usedBy > 0 && (
                      <span
                        className={cn(
                          'text-[10px] tabular-nums px-1.5 h-4 rounded-full inline-flex items-center',
                          isActive
                            ? 'bg-surface text-text-secondary'
                            : 'bg-surface-raised text-text-tertiary',
                        )}
                        title={`Used by ${usedBy} agent${usedBy === 1 ? '' : 's'}`}
                      >
                        {usedBy}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Right panel: tool details + agents-using-this-tool ───────────────── */

function ToolConfigPanel({
  tool,
  usingAgents,
}: {
  tool: ToolDefinition;
  usingAgents: { id: string; name: string }[];
}) {
  const [name, setName] = useState(`${tool.name.toLowerCase().replace(/\s+/g, '_')}_tool`);
  const [description, setDescription] = useState('');

  // Reset local state when tool selection changes
  useEffect(() => {
    setName(`${tool.name.toLowerCase().replace(/\s+/g, '_')}_tool`);
    setDescription('');
  }, [tool.id]);

  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      {/* Tool Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle bg-surface px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <ToolIcon icon={tool.icon} color={tool.color} size={20} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-text-primary truncate">{tool.name}</h2>
              <span
                className="rounded-full px-2 h-5 text-[10px] font-medium inline-flex items-center"
                style={{ backgroundColor: `${tool.color}1F`, color: tool.color }}
              >
                {tool.id}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary mt-0.5">{tool.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Used by — reverse linkage */}
        <Section
          icon={UserCheck}
          title="Used by agents"
          subtitle="Agents that have this tool attached at a step or globally."
        >
          {usingAgents.length === 0 ? (
            <p className="text-[13px] text-text-secondary px-1">
              No agents currently use this tool.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {usingAgents.map((a) => (
                <Link
                  key={a.id}
                  to={`/agents/${a.id}`}
                  className="rounded-full border border-border-subtle bg-surface px-2.5 h-6 inline-flex items-center text-[12px] text-text-primary hover:border-accent"
                >
                  {a.name}
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* Tool Settings */}
        <Section icon={Settings} title="Tool Settings" subtitle="Configure how agents invoke this tool.">
          <div className="space-y-3">
            <Input label="Tool Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-text-secondary">Description</span>
                <span className="text-[11px] text-text-tertiary">{description.length}/1000</span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Describe what this tool does, in language an LLM can use to choose when to call it."
                rows={3}
              />
            </div>

            {/* Tool-specific fields */}
            {tool.id === 'api_request' && (
              <div className="space-y-3 pt-1">
                <Input label="Endpoint URL" placeholder="https://api.example.com/endpoint" />
                <Select label="HTTP Method" defaultValue="GET">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </Select>
                <div className="space-y-1">
                  <span className="text-[12px] font-medium text-text-secondary">Headers (JSON)</span>
                  <Textarea
                    placeholder='{"Authorization": "Bearer ...", "Content-Type": "application/json"}'
                    rows={3}
                    className="font-mono text-[12px]"
                  />
                </div>
              </div>
            )}

            {tool.id === 'transfer_call' && (
              <div className="space-y-3 pt-1">
                <Input label="Transfer To (phone)" placeholder="+91 80XXXXXXXX" />
                <Select label="Transfer Mode" defaultValue="warm">
                  <option value="warm">Warm Transfer</option>
                  <option value="cold">Cold Transfer</option>
                  <option value="blind">Blind Transfer</option>
                </Select>
              </div>
            )}

            {tool.id === 'end_call' && (
              <label className="inline-flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-border-default text-accent focus:ring-accent"
                />
                <span className="text-[13px] text-text-primary">Play farewell message before ending</span>
              </label>
            )}

            {tool.id === 'send_text' && (
              <div className="space-y-1 pt-1">
                <span className="text-[12px] font-medium text-text-secondary">Message Template</span>
                <Textarea
                  placeholder="Hi {{name}}, thanks for speaking with us! Here's the summary: {{summary}}"
                  rows={3}
                />
                <p className="text-[11px] text-text-tertiary">
                  Use {'{{variable}}'} for dynamic content.
                </p>
              </div>
            )}

            {tool.id === 'custom_tool' && (
              <div className="space-y-3 pt-1">
                <Input label="Server URL" placeholder="https://your-server.com/tool-handler" />
                <div className="space-y-1">
                  <span className="text-[12px] font-medium text-text-secondary">
                    Parameters Schema (JSON)
                  </span>
                  <Textarea
                    placeholder='{"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}'
                    rows={4}
                    className="font-mono text-[12px]"
                  />
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Spoken messages — read-only reference for v1 */}
        <Section
          icon={MessageCircle}
          title="Spoken messages"
          subtitle="What the voice agent says before, after, and on error. Editable in Phase 5."
        >
          <div className="grid gap-2">
            {SPOKEN_MESSAGE_PRESETS.map((m) => (
              <div
                key={m.stage}
                className="rounded-md border border-border-subtle bg-surface px-3 py-2.5"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                  {m.stage} · {m.hint}
                </div>
                <p className="mt-1 text-[13px] text-text-primary">{m.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Info */}
        <div className="flex items-start gap-3 rounded-md border border-info-soft bg-info-soft p-3">
          <Info size={16} className="text-info mt-0.5 shrink-0" />
          <p className="text-[12px] text-text-primary leading-5">
            Tools are functions an agent can call during a conversation. The agent decides when to
            invoke them based on context. Knowledge bases attach to <em>agents</em>, not tools — see{' '}
            <Link to="/knowledge-bases" className="text-info hover:underline">
              Knowledge Bases
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

const SPOKEN_MESSAGE_PRESETS: Array<{ stage: 'Before' | 'After' | 'Error'; hint: string; text: string }> = [
  { stage: 'Before', hint: 'Spoken while the tool is running', text: 'Let me look that up for you, one moment please.' },
  { stage: 'After', hint: 'Spoken on success', text: "I've found the information you need." },
  { stage: 'Error', hint: 'Spoken on failure', text: "I'm having trouble pulling that up right now. Let me try another way." },
];

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle bg-surface-sunken">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface ring-1 ring-border-subtle">
          <Icon size={14} className="text-text-secondary" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-text-primary">{title}</div>
          {subtitle && <div className="text-[11px] text-text-tertiary">{subtitle}</div>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ─── Empty selection state ────────────────────────────────────────────── */

function EmptyToolState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-canvas">
      <EmptyState
        icon={Wrench}
        title="Select a tool"
        body="Choose a tool from the list to see its config and which agents use it."
      />
    </div>
  );
}

/* ─── Page shell ───────────────────────────────────────────────────────── */

export function Tools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get('selected');
  const initialTool = useMemo(
    () => ALL_TOOLS.find((t) => t.id === requestedId) ?? ALL_TOOLS[0] ?? null,
    [requestedId],
  );
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(initialTool);

  // Sync URL when selection changes (so the deep link from AgentDetail stays accurate)
  useEffect(() => {
    if (!selectedTool) return;
    if (searchParams.get('selected') !== selectedTool.id) {
      const next = new URLSearchParams(searchParams);
      next.set('selected', selectedTool.id);
      setSearchParams(next, { replace: true });
    }
  }, [selectedTool, searchParams, setSearchParams]);

  const usageById = useAgentsByToolId();
  const usingAgents = selectedTool ? usageById[selectedTool.id] ?? [] : [];

  return (
    <div className="flex h-[calc(100vh-40px)] -mx-8 -my-5 bg-canvas">
      <div className="w-[280px] shrink-0">
        <ToolListPanel selectedTool={selectedTool} onSelect={setSelectedTool} usageById={usageById} />
      </div>
      {selectedTool ? (
        <ToolConfigPanel key={selectedTool.id} tool={selectedTool} usingAgents={usingAgents} />
      ) : (
        <EmptyToolState />
      )}
    </div>
  );
}

