import { Info } from 'lucide-react';
import type { AgentConfiguration } from '@/types/agent';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FlowStep({ config, onNext, onPrev }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Conversation Flow Designer</h2>
        <p className="text-sm text-text-secondary">
          Design the conversation path your agent will follow
        </p>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-12 text-center border-2 border-dashed border-gray-300">
        <div className="max-w-md mx-auto">
          <div className="text-4xl mb-4">🔄</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Visual Flow Builder
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            The visual conversation flow designer with drag-and-drop nodes will be available in this space.
            For now, your agent will follow a natural conversation flow based on the system prompt.
          </p>
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-left">
            <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              <strong>Coming Soon:</strong> Advanced flow builder with conditional logic, branching paths,
              and custom actions. Your agent will use intelligent conversation handling in the meantime.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
          data-testid="flow-prev-btn"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
          data-testid="flow-next-btn"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
