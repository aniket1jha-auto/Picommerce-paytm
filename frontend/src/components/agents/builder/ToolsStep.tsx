import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { AgentConfiguration } from '@/types/agent';
import { BUILT_IN_TOOLS } from '@/data/agentConstants';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ToolsStep({ config, onSave, onNext, onPrev }: Props) {
  const [builtInTools, setBuiltInTools] = useState<string[]>(config.builtInTools);

  const toggleTool = (toolId: string) => {
    setBuiltInTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  };

  const handleNext = () => {
    onSave({ builtInTools, customFunctions: [] });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Tools & Functions</h2>
        <p className="text-sm text-text-secondary">
          Equip your agent with tools to perform actions during conversations
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Built-in Tools
          </label>
          <div className="grid grid-cols-2 gap-3">
            {BUILT_IN_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => toggleTool(tool.id)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  builtInTools.includes(tool.id)
                    ? 'border-cyan bg-cyan/5'
                    : 'border-[#E5E7EB] hover:border-cyan/50'
                }`}
                data-testid={`tool-${tool.id}`}
              >
                <div className="text-2xl mb-2">{tool.icon}</div>
                <div className="font-semibold text-sm text-text-primary mb-1">{tool.name}</div>
                <div className="text-xs text-text-secondary">{tool.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Custom Functions
          </label>
          <div className="rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-text-secondary mb-3">
              Connect your own APIs and custom functions
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
            >
              <Plus size={16} />
              Add Custom Function
            </button>
            <p className="text-xs text-text-secondary mt-3">
              Configure API endpoints, authentication, and parameter schemas
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
          data-testid="tools-prev-btn"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
          data-testid="tools-next-btn"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
