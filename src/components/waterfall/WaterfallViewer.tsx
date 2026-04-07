'use client';

import '@xyflow/react/dist/style.css';

import { useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { day30Waterfalls } from '@/data/mock/day30/waterfalls';
import type { WaterfallNode as MockWaterfallNode, WaterfallEdge as MockWaterfallEdge } from '@/data/mock/day30/waterfalls';
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

function mapMockNodeToFlowNode(mockNode: MockWaterfallNode): FlowNode | null {
  switch (mockNode.type) {
    case 'channel': {
      if (!mockNode.data.channelType) return null;
      const perf = mockNode.data.performance;
      return {
        id: mockNode.id,
        type: 'channelNode',
        position: mockNode.position,
        data: {
          channelType: mockNode.data.channelType,
          label: mockNode.data.label,
          performance:
            perf?.sent != null &&
            perf.converted != null &&
            perf.conversionRate != null &&
            perf.cost != null
              ? {
                  sent: perf.sent,
                  converted: perf.converted,
                  conversionRate: perf.conversionRate,
                  cost: perf.cost,
                }
              : undefined,
        } satisfies ChannelNodeData,
      };
    }
    case 'wait': {
      const hours = mockNode.data.waitHours;
      return {
        id: mockNode.id,
        type: 'waitNode',
        position: mockNode.position,
        data: {
          duration: hours != null ? `${hours}h` : '48h',
        } satisfies WaitNodeData,
      };
    }
    case 'exit': {
      const label = mockNode.data.label.toLowerCase();
      let reason: ExitNodeData['reason'] = 'max_attempts';
      if (
        label.includes('converted') ||
        label.includes('activated') ||
        label.includes('renewed') ||
        label.includes('collected') ||
        label.includes('paid')
      ) {
        reason = 'converted';
      } else if (label.includes('opted') || label.includes('opt-out')) {
        reason = 'opted_out';
      } else if (label.includes('declined')) {
        reason = 'declined';
      }
      return {
        id: mockNode.id,
        type: 'exitNode',
        position: mockNode.position,
        data: {
          reason,
          label: mockNode.data.label,
        } satisfies ExitNodeData,
      };
    }
    case 'entry': {
      // Render entry as a simple channel-like node but without channel icon — use a generic node
      // We'll skip it in the viewer for cleanliness, or just render as a minimal channel node
      // Actually render it as a special node that has no channel. We skip it.
      return null;
    }
    default:
      return null;
  }
}

function mapMockEdgeToFlowEdge(mockEdge: MockWaterfallEdge): FlowEdge {
  const condition = mockEdge.label ?? mockEdge.data?.condition ?? '';
  return {
    id: mockEdge.id,
    source: mockEdge.source,
    target: mockEdge.target,
    type: 'triggerEdge',
    data: { condition } satisfies TriggerEdgeData,
  };
}

interface WaterfallViewerInnerProps {
  waterfallId: string;
}

function WaterfallViewerInner({ waterfallId }: WaterfallViewerInnerProps) {
  const config = useMemo(
    () => day30Waterfalls.find((w) => w.id === waterfallId),
    [waterfallId]
  );

  const { nodes, edges } = useMemo<{ nodes: FlowNode[]; edges: FlowEdge[] }>(() => {
    if (!config) return { nodes: [], edges: [] };

    const mappedNodes: FlowNode[] = config.nodes
      .map(mapMockNodeToFlowNode)
      .filter((n): n is FlowNode => n !== null);

    const validNodeIds = new Set(mappedNodes.map((n) => n.id));
    const mappedEdges: FlowEdge[] = config.edges
      .filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
      .map(mapMockEdgeToFlowEdge);

    return { nodes: mappedNodes, edges: mappedEdges };
  }, [config]);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl border border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">Waterfall not found: {waterfallId}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Waterfall
          </span>
          <span className="ml-2 text-sm font-medium text-gray-800">{config.name}</span>
        </div>
        <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700">
          Live Performance
        </span>
      </div>

      {/* Flow canvas */}
      <div style={{ height: 620 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
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

interface WaterfallViewerProps {
  waterfallId: string;
}

export function WaterfallViewer({ waterfallId }: WaterfallViewerProps) {
  return (
    <ReactFlowProvider>
      <WaterfallViewerInner waterfallId={waterfallId} />
    </ReactFlowProvider>
  );
}
