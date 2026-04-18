import { Info } from 'lucide-react';
import type { AgentConfiguration } from '@/types/agent';
import { ConversationFlowBuilder } from '@/components/agents/flow/ConversationFlowBuilder';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FlowStep({ config, onSave, onNext, onPrev }: Props) {
  const handleFlowChange = (flowConfig: { nodes: any[]; edges: any[] }) => {
    onSave({
      flow: {
        nodes: flowConfig.nodes.map((n) => ({
          id: n.id,
          type: n.type?.replace('Node', '') || 'message',
          position: n.position,
          data: {
            label: (n.data as any)?.label || '',
            content: (n.data as any)?.content,
            condition: (n.data as any)?.condition,
            actionType: (n.data as any)?.actionType,
            transferTo: (n.data as any)?.transferTo,
          },
        })),
        edges: flowConfig.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: (e.data as any)?.label,
        })),
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Conversation Flow Designer</h2>
        <p className="text-sm text-text-secondary">
          Design the conversation path your agent will follow. Drag to move nodes, connect handles to create paths.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3">
        <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Click a node to select it, then use the handles (circles) to connect nodes.
          Use the palette on the left to add new nodes. A default sales flow is provided as a starting point.
        </p>
      </div>

      <ConversationFlowBuilder onChange={handleFlowChange} />

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
