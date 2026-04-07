'use client';

import '@xyflow/react/dist/style.css';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react';
import { Plus, Clock } from 'lucide-react';
import type { ChannelType } from '@/types';
import { channels } from '@/data/channels';
import { ChannelNode } from './ChannelNode';
import type { ChannelNodeData } from './ChannelNode';
import { WaitNode } from './WaitNode';
import type { WaitNodeData } from './WaitNode';
import { ExitNode } from './ExitNode';
import type { ExitNodeData } from './ExitNode';
import { TriggerEdge } from './TriggerEdge';
import type { TriggerEdgeData } from './TriggerEdge';

type FlowNode = Node<ChannelNodeData | WaitNodeData | ExitNodeData>;
type FlowEdge = Edge<TriggerEdgeData>;

const nodeTypes = {
  channelNode: ChannelNode,
  waitNode: WaitNode,
  exitNode: ExitNode,
};

const edgeTypes = {
  triggerEdge: TriggerEdge,
};

// Layout constants
const COL_MAIN = 300;
const COL_EXIT = 80;
const ROW_GAP = 130;
const NODE_START_Y = 40;

function buildDefaultWaterfall(selectedChannels: ChannelType[]): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  if (selectedChannels.length === 0) {
    return { nodes, edges };
  }

  let currentY = NODE_START_Y;
  let prevId = '';
  let exitYOffset = NODE_START_Y;

  for (let i = 0; i < selectedChannels.length; i++) {
    const ch = selectedChannels[i];
    const channelName = channels.find((c) => c.id === ch)?.name ?? ch;

    // Channel node
    const channelId = `channel-${i}`;
    nodes.push({
      id: channelId,
      type: 'channelNode',
      position: { x: COL_MAIN, y: currentY },
      data: {
        channelType: ch,
        label: `${channelName} Outreach`,
      } satisfies ChannelNodeData,
    });

    if (prevId) {
      edges.push({
        id: `e-${prevId}-${channelId}`,
        source: prevId,
        target: channelId,
        type: 'triggerEdge',
        data: { condition: 'No Response' } satisfies TriggerEdgeData,
      });
    }

    // Positive response → exit converted
    const exitConvertedId = `exit-converted-${i}`;
    nodes.push({
      id: exitConvertedId,
      type: 'exitNode',
      position: { x: COL_EXIT, y: exitYOffset + ROW_GAP / 2 },
      data: {
        reason: 'converted',
        label: 'Converted',
      } satisfies ExitNodeData,
    });

    edges.push({
      id: `e-${channelId}-converted-${i}`,
      source: channelId,
      target: exitConvertedId,
      type: 'triggerEdge',
      data: { condition: 'Positive Response' } satisfies TriggerEdgeData,
    });

    // Opted out → exit opted_out
    const exitOptedOutId = `exit-optedout-${i}`;
    nodes.push({
      id: exitOptedOutId,
      type: 'exitNode',
      position: { x: COL_EXIT + 200, y: exitYOffset + ROW_GAP / 2 },
      data: {
        reason: 'opted_out',
        label: 'Opted Out',
      } satisfies ExitNodeData,
    });

    edges.push({
      id: `e-${channelId}-optedout-${i}`,
      source: channelId,
      target: exitOptedOutId,
      type: 'triggerEdge',
      data: { condition: 'Opted Out' } satisfies TriggerEdgeData,
    });

    exitYOffset = currentY;
    currentY += ROW_GAP;

    // Add wait node between channels (not after the last one)
    if (i < selectedChannels.length - 1) {
      const waitId = `wait-${i}`;
      nodes.push({
        id: waitId,
        type: 'waitNode',
        position: { x: COL_MAIN + 40, y: currentY },
        data: { duration: '48h' } satisfies WaitNodeData,
      });

      edges.push({
        id: `e-${channelId}-${waitId}`,
        source: channelId,
        target: waitId,
        type: 'triggerEdge',
        data: { condition: 'No Response' } satisfies TriggerEdgeData,
      });

      prevId = waitId;
      currentY += ROW_GAP;
    } else {
      // After last channel, add max_attempts exit
      const exitMaxId = `exit-max-${i}`;
      nodes.push({
        id: exitMaxId,
        type: 'exitNode',
        position: { x: COL_MAIN + 260, y: currentY },
        data: {
          reason: 'max_attempts',
          label: 'Max Attempts Reached',
        } satisfies ExitNodeData,
      });

      edges.push({
        id: `e-${channelId}-max-${i}`,
        source: channelId,
        target: exitMaxId,
        type: 'triggerEdge',
        data: { condition: 'No Response' } satisfies TriggerEdgeData,
      });
    }
  }

  return { nodes, edges };
}

interface WaterfallBuilderInnerProps {
  channels: ChannelType[];
  onChange?: (config: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
}

function WaterfallBuilderInner({ channels: selectedChannels, onChange }: WaterfallBuilderInnerProps) {
  const channelKey = selectedChannels.join(',');

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildDefaultWaterfall(selectedChannels),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channelKey]
  );

  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [edges, setEdges] = useState<FlowEdge[]>(initialEdges);

  // Keep a stable ref to onChange so effects don't re-fire on every render
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  // Reset when channel selection changes
  useEffect(() => {
    const { nodes: n, edges: e } = buildDefaultWaterfall(selectedChannels);
    setNodes(n);
    setEdges(e);
    onChangeRef.current?.({ nodes: n, edges: e });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelKey]);

  // Propagate config changes upward — uses ref so onChange identity doesn't re-trigger
  useEffect(() => {
    onChangeRef.current?.({ nodes, edges });
  }, [nodes, edges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds) as FlowNode[]);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds) as FlowEdge[]);
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge(
        { ...connection, type: 'triggerEdge', data: { condition: 'No Response' } },
        eds
      ) as FlowEdge[]
    );
  }, []);

  const handleAddChannelStep = useCallback(() => {
    const id = `channel-custom-${Date.now()}`;
    setNodes((nds) => {
      const maxY = nds.reduce((m, n) => Math.max(m, n.position.y), 0);
      const newNode: FlowNode = {
        id,
        type: 'channelNode',
        position: { x: COL_MAIN, y: maxY + ROW_GAP },
        data: {
          channelType: 'sms',
          label: 'New Channel Step',
        } satisfies ChannelNodeData,
      };
      return [...nds, newNode];
    });
  }, []);

  const handleAddWaitStep = useCallback(() => {
    const id = `wait-custom-${Date.now()}`;
    setNodes((nds) => {
      const maxY = nds.reduce((m, n) => Math.max(m, n.position.y), 0);
      const newNode: FlowNode = {
        id,
        type: 'waitNode',
        position: { x: COL_MAIN + 40, y: maxY + ROW_GAP },
        data: { duration: '24h' } satisfies WaitNodeData,
      };
      return [...nds, newNode];
    });
  }, []);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">
          Waterfall Builder
        </span>
        <button
          type="button"
          onClick={handleAddChannelStep}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:border-gray-300"
        >
          <Plus size={12} />
          Add Channel Step
        </button>
        <button
          type="button"
          onClick={handleAddWaitStep}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:border-gray-300"
        >
          <Clock size={12} />
          Add Wait Step
        </button>
      </div>

      {/* Flow canvas */}
      <div style={{ height: 620 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode="Delete"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'exitNode') return '#e5e7eb';
              if (node.type === 'waitNode') return '#f3f4f6';
              return '#00BAF2';
            }}
            maskColor="rgba(247,249,252,0.7)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

interface WaterfallBuilderProps {
  channels: ChannelType[];
  onChange?: (config: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
}

export function WaterfallBuilder({ channels: selectedChannels, onChange }: WaterfallBuilderProps) {
  return (
    <ReactFlowProvider>
      <WaterfallBuilderInner channels={selectedChannels} onChange={onChange} />
    </ReactFlowProvider>
  );
}
