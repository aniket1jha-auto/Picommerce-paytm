import { useState, useMemo } from 'react';
import {
  Plus,
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
  Database,
  MessageCircle,
  Settings,
  Trash2,
  Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TOOL_CATEGORIES, ALL_TOOLS } from '@/data/toolConstants';
import type { ToolDefinition } from '@/types/tool';

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
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}15`, width: size + 16, height: size + 16 }}
    >
      <Icon size={size} style={{ color }} />
    </div>
  );
}

function ToolListPanel({
  selectedTool,
  onSelect,
}: {
  selectedTool: ToolDefinition | null;
  onSelect: (tool: ToolDefinition) => void;
}) {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return TOOL_CATEGORIES;
    const q = search.toLowerCase();
    return TOOL_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <div className="flex flex-col h-full border-r border-[#E5E7EB]">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <button
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-cyan hover:text-cyan"
          data-testid="create-tool-btn"
        >
          <Plus size={16} />
          Create Tool
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-lg border border-[#E5E7EB] pl-9 pr-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            data-testid="tools-search-input"
          />
        </div>
      </div>

      {/* Tool List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-4">
            <div className="px-2 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              {category.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {category.items.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onSelect(tool)}
                  className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-all ${
                    selectedTool?.id === tool.id
                      ? 'bg-cyan/10 ring-1 ring-cyan/30'
                      : 'hover:bg-gray-50'
                  }`}
                  data-testid={`tool-item-${tool.id}`}
                >
                  <ToolIcon icon={tool.icon} color={tool.color} size={18} />
                  <span
                    className={`text-sm font-medium ${
                      selectedTool?.id === tool.id ? 'text-cyan' : 'text-text-primary'
                    }`}
                  >
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolConfigPanel({ tool }: { tool: ToolDefinition }) {
  const [name, setName] = useState(`${tool.name.toLowerCase().replace(/\s+/g, '_')}_tool`);
  const [description, setDescription] = useState('');

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Tool Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex items-center gap-3">
          <ToolIcon icon={tool.icon} color={tool.color} size={22} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary">{name}</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
              >
                {tool.name.toLowerCase()}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {tool.id}_f7a2b3c1-8e4d-4a5b-9c6e...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
            data-testid="tool-code-btn"
          >
            {'</>'}
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
            data-testid="tool-save-btn"
          >
            Saved
          </button>
        </div>
      </div>

      {/* Config Sections */}
      <div className="p-6 space-y-6">
        {/* Tool Settings */}
        <div className="rounded-lg ring-1 ring-[#E5E7EB] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-[#E5E7EB]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-[#E5E7EB]">
              <Settings size={16} className="text-text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Tool Settings</h3>
              <p className="text-xs text-text-secondary">Configure the basic settings for this tool</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Tool Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                data-testid="tool-name-input"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-text-primary">Description</label>
                <span className="text-xs text-text-secondary">{description.length}/1000</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                placeholder="Describe the tool in a few sentences"
                rows={3}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                data-testid="tool-description-input"
              />
            </div>

            {/* Tool-specific settings */}
            {tool.id === 'api_request' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://api.example.com/endpoint"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    HTTP Method
                  </label>
                  <select className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20">
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Headers (JSON)
                  </label>
                  <textarea
                    placeholder='{"Authorization": "Bearer ...", "Content-Type": "application/json"}'
                    rows={3}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-mono focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                  />
                </div>
              </div>
            )}

            {tool.id === 'transfer_call' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Transfer To (Phone Number)
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 123-4567"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Transfer Mode
                  </label>
                  <select className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20">
                    <option>Warm Transfer</option>
                    <option>Cold Transfer</option>
                    <option>Blind Transfer</option>
                  </select>
                </div>
              </div>
            )}

            {tool.id === 'end_call' && (
              <div className="pt-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-cyan focus:ring-cyan"
                  />
                  <span className="text-sm text-text-primary">
                    Play farewell message before ending
                  </span>
                </label>
              </div>
            )}

            {tool.id === 'send_text' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Message Template
                  </label>
                  <textarea
                    placeholder="Hi {{name}}, thanks for speaking with us! Here's the summary: {{summary}}"
                    rows={3}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Use {'{{variable}}'} for dynamic content
                  </p>
                </div>
              </div>
            )}

            {tool.id === 'custom_tool' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Server URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-server.com/tool-handler"
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Parameters Schema (JSON)
                  </label>
                  <textarea
                    placeholder='{"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}'
                    rows={4}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-mono focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Bases */}
        <div className="rounded-lg ring-1 ring-[#E5E7EB] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-[#E5E7EB]">
                <Database size={16} className="text-text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Knowledge Bases</h3>
                <p className="text-xs text-text-secondary">Configure knowledge bases for this tool</p>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan hover:text-cyan/80"
              data-testid="add-kb-btn"
            >
              <Plus size={14} />
              Add Knowledge Base
            </button>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Database size={24} className="text-text-secondary" />
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-1">No knowledge bases configured</p>
            <p className="text-xs text-text-secondary">
              Click "Add Knowledge Base" to add one
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="rounded-lg ring-1 ring-[#E5E7EB] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-[#E5E7EB]">
                <MessageCircle size={16} className="text-text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Messages</h3>
                <p className="text-xs text-text-secondary">Configure messages spoken during tool execution</p>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan hover:text-cyan/80"
              data-testid="add-message-btn"
            >
              <Plus size={14} />
              Add Message
            </button>
          </div>
          <div className="p-5 space-y-3">
            <div className="rounded-lg bg-cyan/5 border border-cyan/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-cyan/10 text-cyan px-2 py-0.5 rounded">Before</span>
                  <span className="text-xs text-text-secondary">Spoken before execution</span>
                </div>
                <button className="text-text-secondary hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-text-primary">
                "Let me look that up for you, one moment please."
              </p>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded">After</span>
                  <span className="text-xs text-text-secondary">Spoken after success</span>
                </div>
                <button className="text-text-secondary hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-text-primary">
                "I've found the information you need."
              </p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded">Error</span>
                  <span className="text-xs text-text-secondary">Spoken on failure</span>
                </div>
                <button className="text-text-secondary hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-text-primary">
                "I'm having trouble finding that right now. Let me try another way."
              </p>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">How tools work</p>
            <p className="text-xs text-blue-800">
              Tools are functions your agent can call during a conversation. When the agent recognizes
              it needs to perform an action (like looking up data or transferring a call), it invokes
              the appropriate tool. Messages are spoken to keep the user informed during execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyToolState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Wrench size={32} className="text-text-secondary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Select a tool</h3>
        <p className="text-sm text-text-secondary">
          Choose a tool from the list to configure it, or create a new custom tool.
        </p>
      </div>
    </div>
  );
}

export function Tools() {
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(ALL_TOOLS[0]);

  return (
    <div className="flex h-[calc(100vh-40px)] -mx-8 -my-5 bg-white">
      {/* Left Panel: Tool List */}
      <div className="w-[280px] shrink-0">
        <ToolListPanel selectedTool={selectedTool} onSelect={setSelectedTool} />
      </div>

      {/* Right Panel: Tool Configuration */}
      {selectedTool ? (
        <ToolConfigPanel key={selectedTool.id} tool={selectedTool} />
      ) : (
        <EmptyToolState />
      )}
    </div>
  );
}
