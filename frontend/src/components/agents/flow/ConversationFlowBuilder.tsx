'use client';

import '@xyflow/react/dist/style.css';

import { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import {
  Plus,
  MessageSquare,
  HelpCircle,
  GitBranch,
  Zap,
  PhoneForwarded,
  Square,
  Play,
  Trash2,
} from 'lucide-react';
import { StartNode } from './StartNode';
import { MessageNode } from './MessageNode';
import { QuestionNode } from './QuestionNode';
import { ConditionNode } from './ConditionNode';
import { ActionNode } from './ActionNode';
import { TransferNode } from './TransferNode';
import { EndNode } from './EndNode';
import { FlowEdgeComponent } from './FlowEdge';

const nodeTypes = {
  startNode: StartNode,
  messageNode: MessageNode,
  questionNode: QuestionNode,
  conditionNode: ConditionNode,
  actionNode: ActionNode,
  transferNode: TransferNode,
  endNode: EndNode,
};

const edgeTypes = {
  flowEdge: FlowEdgeComponent,
};

const TOOLBAR_ITEMS = [
  { type: 'messageNode', label: 'Message', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Agent speaks' },
  { type: 'questionNode', label: 'Question', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Agent asks' },
  { type: 'conditionNode', label: 'Condition', icon: GitBranch, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Branch logic' },
  { type: 'actionNode', label: 'Action', icon: Zap, color: 'text-cyan', bg: 'bg-cyan/10', desc: 'Execute tool' },
  { type: 'transferNode', label: 'Transfer', icon: PhoneForwarded, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Hand off' },
  { type: 'endNode', label: 'End Call', icon: Square, color: 'text-red-600', bg: 'bg-red-50', desc: 'End call' },
];

// Default flow for a voice agent
function buildDefaultFlow(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: 'start',
      type: 'startNode',
      position: { x: 300, y: 20 },
      data: { label: 'Start' },
      deletable: false,
    },
    {
      id: 'greet',
      type: 'messageNode',
      position: { x: 260, y: 120 },
      data: { label: 'Greeting', content: 'Hello! Thank you for your time today...' },
    },
    {
      id: 'qualify',
      type: 'questionNode',
      position: { x: 245, y: 260 },
      data: { label: 'Qualify Interest', content: 'Are you currently looking for a solution?' },
    },
    {
      id: 'pitch',
      type: 'messageNode',
      position: { x: 400, y: 410 },
      data: { label: 'Value Proposition', content: 'Let me share how we can help...' },
    },
    {
      id: 'objection',
      type: 'conditionNode',
      position: { x: 380, y: 550 },
      data: { label: 'Handle Objection', condition: 'user expresses concern' },
    },
    {
      id: 'book',
      type: 'actionNode',
      position: { x: 550, y: 690 },
      data: { label: 'Book Demo', actionType: 'calendar_booking' },
    },
    {
      id: 'polite_end',
      type: 'messageNode',
      position: { x: 40, y: 410 },
      data: { label: 'Polite Decline', content: 'No worries! Have a great day.' },
    },
    {
      id: 'transfer',
      type: 'transferNode',
      position: { x: 150, y: 690 },
      data: { label: 'Transfer to Human', transferTo: 'Support Team' },
    },
    {
      id: 'end_success',
      type: 'endNode',
      position: { x: 550, y: 810 },
      data: { label: 'End - Demo Booked' },
    },
    {
      id: 'end_decline',
      type: 'endNode',
      position: { x: 40, y: 540 },
      data: { label: 'End - Not Interested' },
    },
  ];

  const edges: Edge[] = [
    { id: 'e-start-greet', source: 'start', target: 'greet', type: 'flowEdge', data: { label: '' } },
    { id: 'e-greet-qualify', source: 'greet', target: 'qualify', type: 'flowEdge', data: { label: '' } },
    { id: 'e-qualify-pitch', source: 'qualify', sourceHandle: 'yes', target: 'pitch', type: 'flowEdge', data: { label: 'Interested' } },
    { id: 'e-qualify-decline', source: 'qualify', sourceHandle: 'no', target: 'polite_end', type: 'flowEdge', data: { label: 'Not Interested' } },
    { id: 'e-pitch-objection', source: 'pitch', target: 'objection', type: 'flowEdge', data: { label: '' } },
    { id: 'e-objection-book', source: 'objection', sourceHandle: 'true', target: 'book', type: 'flowEdge', data: { label: 'Resolved' } },
    { id: 'e-objection-transfer', source: 'objection', sourceHandle: 'false', target: 'transfer', type: 'flowEdge', data: { label: 'Escalate' } },
    { id: 'e-book-end', source: 'book', target: 'end_success', type: 'flowEdge', data: { label: '' } },
    { id: 'e-decline-end', source: 'polite_end', target: 'end_decline', type: 'flowEdge', data: { label: '' } },
  ];

  return { nodes, edges };
}

interface ConversationFlowBuilderInnerProps {
  onChange?: (config: { nodes: Node[]; edges: Edge[] }) => void;
}

function ConversationFlowBuilderInner({ onChange }: ConversationFlowBuilderInnerProps) {
  const { nodes: initialNodes, edges: initialEdges } = buildDefaultFlow();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => { onChangeRef.current?.({ nodes, edges }); }, [nodes, edges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge({ ...connection, type: 'flowEdge', data: { label: '' } }, eds)
    );
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback((type: string) => {
    const id = `${type}-${Date.now()}`;
    const dataMap: Record<string, Record<string, unknown>> = {
      messageNode: { label: 'New Message', content: 'Enter message...' },
      questionNode: { label: 'New Question', content: 'Enter question...' },
      conditionNode: { label: 'New Condition', condition: 'condition here' },
      actionNode: { label: 'New Action', actionType: 'custom' },
      transferNode: { label: 'Transfer', transferTo: '' },
      endNode: { label: 'End Call' },
    };

    const maxY = nodes.reduce((m, n) => Math.max(m, n.position.y), 0);
    const newNode: Node = {
      id,
      type,
      position: { x: 300 + Math.random() * 80 - 40, y: maxY + 130 },
      data: dataMap[type] || { label: 'New Node' },
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  }, [nodes]);

  const deleteSelected = useCallback(() => {
    if (!selectedNode || selectedNode.id === 'start') return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode]);

  return (
    <div className="flex rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm" style={{ height: 580 }}>
      {/* Left: Node Palette */}
      <div className="w-[200px] shrink-0 border-r border-[#E5E7EB] bg-gray-50 flex flex-col">
        <div className="px-3 py-3 border-b border-[#E5E7EB]">
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
            Add Nodes
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.type}
              onClick={() => addNode(item.type)}
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-white hover:shadow-sm transition-all group"
              data-testid={`add-node-${item.type}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon size={14} className={item.color} />
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary">{item.label}</div>
                <div className="text-[10px] text-text-secondary">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Delete button */}
        {selectedNode && selectedNode.id !== 'start' && (
          <div className="p-2 border-t border-[#E5E7EB]">
            <button
              onClick={deleteSelected}
              className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              data-testid="delete-node-btn"
            >
              <Trash2 size={14} />
              Delete Node
            </button>
          </div>
        )}
      </div>

      {/* Right: Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          deleteKeyCode="Delete"
          defaultEdgeOptions={{ type: 'flowEdge' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
          <Controls showInteractive={false} position="bottom-right" />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'startNode') return '#22c55e';
              if (node.type === 'endNode') return '#ef4444';
              if (node.type === 'messageNode') return '#a855f7';
              if (node.type === 'questionNode') return '#3b82f6';
              if (node.type === 'conditionNode') return '#f59e0b';
              if (node.type === 'actionNode') return '#06b6d4';
              if (node.type === 'transferNode') return '#f97316';
              return '#9ca3af';
            }}
            maskColor="rgba(247,249,252,0.7)"
            position="bottom-left"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

interface ConversationFlowBuilderProps {
  onChange?: (config: { nodes: Node[]; edges: Edge[] }) => void;
}

export function ConversationFlowBuilder({ onChange }: ConversationFlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <ConversationFlowBuilderInner onChange={onChange} />
    </ReactFlowProvider>
  );
}
