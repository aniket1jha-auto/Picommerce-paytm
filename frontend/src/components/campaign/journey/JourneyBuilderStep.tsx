'use client';

import '@xyflow/react/dist/style.css';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent, MouseEvent as ReactMouseEvent } from 'react';

type FlowPointerEvent = ReactMouseEvent<Element> | globalThis.MouseEvent;
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
} from '@xyflow/react';
import type { Connection, EdgeChange, NodeChange, Node } from '@xyflow/react';
import { Maximize2, Minus, Plus, Map as MapIcon, Sparkles, PencilLine, ArrowRight } from 'lucide-react';
import type { CampaignData } from '@/components/campaign/CampaignWizard';
import type {
  CampaignJourneyState,
  JourneyFlowEdge,
  JourneyFlowNode,
  JourneyNodeData,
  JourneyNodeKind,
} from './journeyTypes';
import { TRIGGER_KINDS, ENTRY_TRIGGER_KINDS, newNodeId } from './journeyTypes';
import { createJourneyNode } from './journeyConstants';
import { JourneyFlowNode as JourneyFlowNodeComponent } from './JourneyFlowNode';
import { JourneyBezierEdge } from './JourneyBezierEdge';
import { JourneyNodePalette, JOURNEY_PALETTE_DRAG_TYPE } from './JourneyNodePalette';
import { JourneyNodeConfigPanel } from './JourneyNodeConfigPanel';
import { usePhaseData } from '@/hooks/usePhaseData';
import { PrebuiltJourneyModal } from './PrebuiltJourneyModal';
import { buildPrebuiltJourney } from './journeyTemplates';
import { validateJourney } from './journeyValidation';

const nodeTypes = { journeyNode: JourneyFlowNodeComponent };
const edgeTypes = { journeyBezier: JourneyBezierEdge };

interface JourneyBuilderStepProps {
  campaignData: CampaignData;
  onUpdate: (updates: Partial<CampaignData>) => void;
}

function hasTrigger(nodes: JourneyFlowNode[]) {
  return nodes.some((n) =>
    (TRIGGER_KINDS as readonly string[]).includes(String((n.data as { kind?: string }).kind)),
  );
}

function cloneJourney(j: CampaignJourneyState): CampaignJourneyState {
  return {
    nodes: j.nodes.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } })),
    edges: j.edges.map((e) => ({ ...e })),
  };
}

function isEntryNode(n: JourneyFlowNode) {
  return (ENTRY_TRIGGER_KINDS as readonly string[]).includes(String((n.data as { kind?: string }).kind));
}

function isBlankJourney(j: CampaignJourneyState) {
  return j.edges.length === 0 && j.nodes.length === 1 && isEntryNode(j.nodes[0] as JourneyFlowNode);
}

function JourneyBuilderCanvas({
  campaignData,
  onUpdate,
}: JourneyBuilderStepProps) {
  const journey = campaignData.journey;
  const { fitView, screenToFlowPosition, zoomIn, zoomOut } = useReactFlow();
  const { segments } = usePhaseData();
  const audienceSize = Math.max(1, segments.find((s) => s.id === campaignData.segmentId)?.size ?? 10_000);

  const [templateOpen, setTemplateOpen] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [validationOpen, setValidationOpen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [starterOpen, setStarterOpen] = useState(() => isBlankJourney(campaignData.journey));
  const [pendingFitView, setPendingFitView] = useState(false);

  const historyRef = useRef<CampaignJourneyState[]>([]);
  const isUndoing = useRef(false);

  const setJourney = useCallback(
    (next: CampaignJourneyState) => {
      onUpdate({ journey: next });
    },
    [onUpdate],
  );

  const recordHistory = useCallback(() => {
    if (isUndoing.current) return;
    historyRef.current.push(cloneJourney(journey));
    if (historyRef.current.length > 50) historyRef.current.shift();
  }, [journey]);

  const selectedNode = useMemo(() => {
    const n = journey.nodes.find((x) => x.selected);
    return n ?? null;
  }, [journey.nodes]);

  const triggerPresent = hasTrigger(journey.nodes);
  const validation = useMemo(() => validateJourney(journey.nodes, journey.edges), [journey.nodes, journey.edges]);

  const addNodeAt = useCallback(
    (kind: JourneyNodeKind, position: { x: number; y: number }) => {
      if ((TRIGGER_KINDS as readonly string[]).includes(kind) && triggerPresent) {
        return;
      }
      recordHistory();
      const node = createJourneyNode(kind, position);
      setJourney({
        nodes: [...journey.nodes.map((n) => ({ ...n, selected: false })), { ...node, selected: true }],
        edges: journey.edges,
      });
    },
    [journey.nodes, journey.edges, recordHistory, setJourney, triggerPresent],
  );

  const addAtCenter = useCallback(
    (kind: JourneyNodeKind) => {
      const bounds = document.querySelector('.journey-flow-surface')?.getBoundingClientRect();
      if (!bounds) {
        addNodeAt(kind, { x: 400, y: 260 });
        return;
      }
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;
      const p = screenToFlowPosition({ x: cx, y: cy });
      addNodeAt(kind, { x: p.x - 100, y: p.y - 40 });
    },
    [addNodeAt, screenToFlowPosition],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const skipHistory =
        changes.length > 0 &&
        changes.every((c) =>
          ['position', 'select', 'dimensions'].includes(c.type as string),
        );
      if (!skipHistory && !isUndoing.current) recordHistory();
      const nextNodes = applyNodeChanges(changes, journey.nodes as Node[]) as JourneyFlowNode[];
      setJourney({ nodes: nextNodes, edges: journey.edges });
    },
    [journey.nodes, journey.edges, recordHistory, setJourney],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const skipHistory =
        changes.length > 0 && changes.every((c) => (c as { type: string }).type === 'select');
      if (!skipHistory && !isUndoing.current) recordHistory();
      setJourney({
        nodes: journey.nodes,
        edges: applyEdgeChanges(changes, journey.edges) as JourneyFlowEdge[],
      });
    },
    [journey.nodes, journey.edges, recordHistory, setJourney],
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      recordHistory();
      setJourney({
        nodes: journey.nodes,
        edges: addEdge(
          {
            ...conn,
            id: `je_${conn.source}_${conn.target}_${conn.sourceHandle ?? 'd'}`,
            type: 'journeyBezier',
            animated: true,
            style: { stroke: '#94A3B8', strokeWidth: 1.5 },
          },
          journey.edges,
        ),
      });
    },
    [journey.nodes, journey.edges, recordHistory, setJourney],
  );

  const onPatchNode = useCallback(
    (nodeId: string, nextData: JourneyNodeData) => {
      recordHistory();
      setJourney({
        nodes: journey.nodes.map((n) =>
          n.id === nodeId ? { ...n, data: nextData as unknown as Record<string, unknown> } : n,
        ),
        edges: journey.edges,
      });
    },
    [journey.nodes, journey.edges, recordHistory, setJourney],
  );

  const closePanel = useCallback(() => {
    setJourney({
      nodes: journey.nodes.map((n) => ({ ...n, selected: false })),
      edges: journey.edges,
    });
  }, [journey.nodes, journey.edges, setJourney]);

  const applyTemplate = useCallback(
    (templateId: string) => {
      recordHistory();
      const built = buildPrebuiltJourney(templateId);
      setJourney({ nodes: built.nodes, edges: built.edges });
      setTemplateOpen(false);
      setStarterOpen(false);
      setPendingFitView(true);
    },
    [recordHistory, setJourney],
  );

  const startFromScratch = useCallback(() => {
    applyTemplate('blank');
  }, [applyTemplate]);

  useEffect(() => {
    // If user already has a non-blank flow (e.g. returning to this step), don't show the starter screen.
    if (!isBlankJourney(journey)) setStarterOpen(false);
  }, [journey]);

  useEffect(() => {
    if (!pendingFitView || starterOpen) return;
    // Wait a tick to ensure ReactFlow has mounted and nodes are in the store.
    requestAnimationFrame(() => {
      try {
        fitView({ padding: 0.2, duration: 300 });
      } finally {
        setPendingFitView(false);
      }
    });
  }, [fitView, pendingFitView, starterOpen]);

  const focusNode = useCallback(
    (nodeId: string) => {
      setJourney({
        nodes: journey.nodes.map((n) => ({ ...n, selected: n.id === nodeId })),
        edges: journey.edges,
      });
      requestAnimationFrame(() => {
        fitView({ nodes: [{ id: nodeId }], duration: 400, padding: 0.35 });
      });
    },
    [fitView, journey.nodes, journey.edges, setJourney],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const t = e.target as HTMLElement;
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
        const prev = historyRef.current.pop();
        if (!prev) return;
        e.preventDefault();
        isUndoing.current = true;
        setJourney(prev);
        requestAnimationFrame(() => {
          isUndoing.current = false;
        });
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const t = e.target as HTMLElement;
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
        const selNodes = journey.nodes.filter((n) => n.selected);
        const selEdges = journey.edges.filter((ed) => ed.selected);
        if (!selNodes.length && !selEdges.length) return;
        const deletable = selNodes.filter((n) => !isEntryNode(n));
        if (!deletable.length && !selEdges.length) return;
        e.preventDefault();
        recordHistory();
        const removeIds = new Set(deletable.map((n) => n.id));
        setJourney({
          nodes: journey.nodes.filter((n) => !removeIds.has(n.id)),
          edges: journey.edges.filter((ed) => !selEdges.includes(ed) && !removeIds.has(ed.source) && !removeIds.has(ed.target)),
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [journey.nodes, journey.edges, recordHistory, setJourney]);

  const onPaneContextMenu = useCallback((e: FlowPointerEvent) => {
    e.preventDefault();
    setCtxMenu(null);
  }, []);

  const onNodeContextMenu = useCallback((e: FlowPointerEvent, node: JourneyFlowNode) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
  }, []);

  const runCtx = useCallback(
    (action: 'rename' | 'duplicate' | 'delete' | 'note') => {
      if (!ctxMenu) return;
      const node = journey.nodes.find((n) => n.id === ctxMenu.nodeId);
      if (!node) {
        setCtxMenu(null);
        return;
      }
      setCtxMenu(null);
      if (action === 'rename') {
        const cur = node.data as unknown as JourneyNodeData;
        const name = window.prompt('Node name', cur.label);
        if (name && name.trim()) {
          recordHistory();
          setJourney({
            nodes: journey.nodes.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, label: name.trim() } } : n,
            ),
            edges: journey.edges,
          });
        }
        return;
      }
      if (action === 'duplicate') {
        if (isEntryNode(node)) return;
        recordHistory();
        const cur = node.data as unknown as JourneyNodeData;
        const copy: JourneyFlowNode = {
          ...node,
          id: newNodeId(),
          position: { x: node.position.x + 48, y: node.position.y + 48 },
          data: { ...node.data, label: `${cur.label} copy` },
          selected: true,
        };
        setJourney({
          nodes: [...journey.nodes.map((n) => ({ ...n, selected: false })), copy],
          edges: journey.edges,
        });
        return;
      }
      if (action === 'delete') {
        if (isEntryNode(node)) return;
        recordHistory();
        setJourney({
          nodes: journey.nodes.filter((n) => n.id !== node.id),
          edges: journey.edges.filter((ed) => ed.source !== node.id && ed.target !== node.id),
        });
        return;
      }
      if (action === 'note') {
        recordHistory();
        const note = createJourneyNode('note', { x: node.position.x + 200, y: node.position.y });
        setJourney({
          nodes: [...journey.nodes, note],
          edges: journey.edges,
        });
      }
    },
    [ctxMenu, journey.nodes, journey.edges, recordHistory, setJourney],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData(JOURNEY_PALETTE_DRAG_TYPE) as JourneyNodeKind;
      if (!kind) return;
      const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNodeAt(kind, p);
    },
    [addNodeAt, screenToFlowPosition],
  );

  const passedCount = validation.checks.filter((c) => c.ok).length;

  return (
    <div className="relative flex h-[min(72vh,720px)] min-h-[520px] flex-col border-t border-[#E5E7EB]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">Journey Builder</span>
          <span className="rounded-full bg-[#E5E7EB] px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            {journey.nodes.length} nodes
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplateOpen(true)}
            className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-[#F9FAFB]"
          >
            Use pre-built journey
          </button>
          <div className="mx-1 hidden h-5 w-px bg-[#E5E7EB] sm:block" />
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomOut({ duration: 200 })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-text-secondary hover:bg-[#F9FAFB]"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => zoomIn({ duration: 200 })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-text-secondary hover:bg-[#F9FAFB]"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            aria-label="Fit to screen"
            onClick={() => fitView({ padding: 0.2, duration: 280 })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-text-secondary hover:bg-[#F9FAFB]"
          >
            <Maximize2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => setValidationOpen((v) => !v)}
            className="rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-[#F9FAFB]"
          >
            Validate journey
          </button>
          <button
            type="button"
            aria-label="Toggle minimap"
            onClick={() => setShowMiniMap((m) => !m)}
            className={[
              'inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white',
              showMiniMap ? 'border-cyan text-cyan' : 'border-[#E5E7EB] text-text-secondary hover:bg-[#F9FAFB]',
            ].join(' ')}
          >
            <MapIcon size={16} />
          </button>
        </div>
      </div>

      {validationOpen && (
        <div className="border-b border-[#E5E7EB] bg-white px-3 py-2">
          <p className="text-xs font-medium text-text-primary">
            {validation.issues.length === 0 ? (
              <span className="text-emerald-700">
                ✅ All checks passed ({passedCount}/{validation.checks.length})
              </span>
            ) : (
              <span>
                {passedCount}/{validation.checks.length} checks passed —{' '}
                <span className="text-red-600">{validation.issues.length} issues</span>
              </span>
            )}
          </p>
          {validation.checks.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-[11px] text-text-secondary">
              {validation.checks.map((c) => (
                <li key={c.id}>
                  {c.ok ? '✅' : '❌'} {c.label}
                </li>
              ))}
            </ul>
          )}
          {validation.issues.length > 0 && (
            <ul className="mt-2 space-y-1">
              {validation.issues.map((iss) => (
                <li key={iss.id}>
                  <button
                    type="button"
                    className="text-left text-xs text-red-700 underline decoration-red-200 hover:decoration-red-600"
                    onClick={() => {
                      if (iss.nodeId) focusNode(iss.nodeId);
                    }}
                  >
                    {iss.message}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <JourneyNodePalette hasTrigger={triggerPresent} onAddKind={addAtCenter} />
        <div className="relative min-w-0 flex-1 journey-flow-surface">
          <ReactFlow
            nodes={journey.nodes}
            edges={journey.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={() => {
              setCtxMenu(null);
              closePanel();
            }}
            onPaneContextMenu={onPaneContextMenu}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: 'journeyBezier',
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#94A3B8' },
              style: { stroke: '#94A3B8', strokeWidth: 1.5 },
            }}
            className="bg-[#F4F4F5]"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#D4D4D8" />
            {showMiniMap && (
              <MiniMap
                className="!bottom-3 !right-3 !rounded-lg !border !border-[#E5E7EB] !bg-white"
                zoomable
                pannable
                nodeStrokeWidth={2}
                maskColor="rgb(0 0 0 / 0.08)"
              />
            )}
          </ReactFlow>

          {/* starter screen is rendered as full-page state above */}
        </div>
        <JourneyNodeConfigPanel
          node={selectedNode}
          onClose={closePanel}
          onPatch={onPatchNode}
          audienceSize={audienceSize}
        />
      </div>

      <PrebuiltJourneyModal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onSelect={applyTemplate}
      />

      {starterOpen && !templateOpen && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-[#F4F4F5] p-6">
          <div className="w-full max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl ring-1 ring-black/[0.04]">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Get started</p>
              <h3 className="text-lg font-semibold text-text-primary">Choose how you want to build this journey</h3>
              <p className="text-sm text-text-secondary">
                Start with a proven template or build a custom flow from scratch.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setTemplateOpen(true)}
                className="group flex h-full flex-col rounded-xl border border-cyan/30 bg-gradient-to-br from-cyan/5 to-cyan/10 p-5 text-left transition-all hover:shadow-md hover:ring-2 hover:ring-cyan/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan text-white shadow-sm">
                      <Sparkles size={18} />
                    </span>
                    <span className="text-sm font-semibold text-text-primary">Start with a pre-built journey</span>
                  </div>
                  <ArrowRight size={16} className="text-cyan transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  Pick from proven flows like Recovery, KYC re-engagement, Welcome onboarding, and more.
                </p>
                <p className="mt-3 text-xs font-semibold text-cyan">Browse templates</p>
              </button>

              <button
                type="button"
                onClick={startFromScratch}
                className="group flex h-full flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 text-left transition-all hover:border-[#D1D5DB] hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827] text-white shadow-sm">
                      <PencilLine size={18} />
                    </span>
                    <span className="text-sm font-semibold text-text-primary">Start from scratch</span>
                  </div>
                  <ArrowRight size={16} className="text-text-secondary transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  Open the playground with only the entry node. Add steps by dragging nodes from the left palette.
                </p>
                <p className="mt-3 text-xs font-semibold text-text-primary">Open playground</p>
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
              <p className="text-xs text-text-secondary">You can always start from a template later.</p>
              <button
                type="button"
                onClick={() => setStarterOpen(false)}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {ctxMenu && (
        <div
          className="fixed z-[60] min-w-[160px] rounded-lg border border-[#E5E7EB] bg-white py-1 text-sm shadow-lg ring-1 ring-black/5"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
        >
          <button type="button" className="block w-full px-3 py-2 text-left hover:bg-[#F9FAFB]" onClick={() => runCtx('rename')}>
            Rename
          </button>
          <button type="button" className="block w-full px-3 py-2 text-left hover:bg-[#F9FAFB]" onClick={() => runCtx('duplicate')}>
            Duplicate
          </button>
          <button type="button" className="block w-full px-3 py-2 text-left hover:bg-[#F9FAFB]" onClick={() => runCtx('note')}>
            Add note
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
            onClick={() => runCtx('delete')}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function JourneyBuilderStep(props: JourneyBuilderStepProps) {
  return (
    <ReactFlowProvider>
      <JourneyBuilderCanvas {...props} />
    </ReactFlowProvider>
  );
}
