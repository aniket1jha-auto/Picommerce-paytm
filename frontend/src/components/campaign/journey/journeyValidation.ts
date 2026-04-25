import type { JourneyFlowNode, JourneyFlowEdge, JourneyNodeData } from './journeyTypes';
import { TRIGGER_KINDS } from './journeyTypes';

function nd(n: JourneyFlowNode): JourneyNodeData {
  return n.data as unknown as JourneyNodeData;
}

export interface JourneyValidationIssue {
  id: string;
  message: string;
  nodeId?: string;
}

export interface JourneyCheck {
  id: string;
  label: string;
  ok: boolean;
}

export function validateJourney(
  nodes: JourneyFlowNode[],
  edges: JourneyFlowEdge[],
): { checks: JourneyCheck[]; issues: JourneyValidationIssue[] } {
  const issues: JourneyValidationIssue[] = [];
  const checks: JourneyCheck[] = [];

  const triggers = nodes.filter((n) => (TRIGGER_KINDS as readonly string[]).includes(nd(n).kind as string));
  const triggerOk = triggers.length === 1;
  checks.push({
    id: 'trigger',
    label: 'Exactly one entry / trigger node',
    ok: triggerOk,
  });
  if (!triggerOk) {
    issues.push({
      id: 'trigger-count',
      message:
        triggers.length === 0
          ? 'Journey must have exactly one trigger node (entry point).'
          : `Found ${triggers.length} trigger nodes — keep only one entry trigger.`,
      nodeId: triggers[0]?.id,
    });
  }

  const exits = nodes.filter((n) => nd(n).kind === 'exit');
  const exitOk = exits.length >= 1;
  checks.push({ id: 'exit', label: 'At least one Exit node', ok: exitOk });
  if (!exitOk) {
    issues.push({
      id: 'exit-missing',
      message: 'Journey must have at least one Exit node.',
    });
  }

  const outgoing = new Map<string, number>();
  nodes.forEach((n) => outgoing.set(n.id, 0));
  edges.forEach((e) => {
    outgoing.set(e.source, (outgoing.get(e.source) ?? 0) + 1);
  });

  const connectivityIssues: JourneyValidationIssue[] = [];
  nodes.forEach((n) => {
    if (nd(n).kind === 'exit') return;
    if ((outgoing.get(n.id) ?? 0) < 1) {
      connectivityIssues.push({
        id: `out-${n.id}`,
        message: `"${nd(n).label}" has no outgoing connection.`,
        nodeId: n.id,
      });
    }
  });
  const connectivityOk = connectivityIssues.length === 0;
  checks.push({
    id: 'connectivity',
    label: 'Every non-exit step has an outgoing connection',
    ok: connectivityOk,
  });
  issues.push(...connectivityIssues);

  const configIssues: JourneyValidationIssue[] = [];
  nodes.forEach((n) => {
    if (nd(n).kind === 'voice_agent') {
      const d = nd(n) as import('./journeyTypes').VoiceAgentNodeData;
      if (!d.agentId) {
        configIssues.push({
          id: `va-${n.id}`,
          message: `Voice Agent "${d.label}": No agent selected.`,
          nodeId: n.id,
        });
      }
    }
    if (nd(n).kind === 'chat_agent') {
      const d = nd(n) as import('./journeyTypes').ChatAgentNodeData;
      if (!d.agentId) {
        configIssues.push({
          id: `ca-${n.id}`,
          message: `Chat Agent "${d.label}": No agent selected.`,
          nodeId: n.id,
        });
      }
    }
    if (nd(n).kind === 'whatsapp_message') {
      const d = nd(n) as import('./journeyTypes').WhatsAppMessageNodeData;
      if (!d.templateId) {
        configIssues.push({
          id: `wa-${n.id}`,
          message: `WhatsApp Message "${d.label}": No template selected.`,
          nodeId: n.id,
        });
      }
    }
    if (nd(n).kind === 'sms') {
      const d = nd(n) as import('./journeyTypes').SmsNodeData;
      if (d.mode === 'template' && !d.templateId) {
        configIssues.push({
          id: `sms-${n.id}`,
          message: `SMS "${d.label}": No template selected.`,
          nodeId: n.id,
        });
      }
      if (d.mode === 'custom' && !d.customBody.trim()) {
        configIssues.push({
          id: `sms2-${n.id}`,
          message: `SMS "${d.label}": Message body is empty.`,
          nodeId: n.id,
        });
      }
      if (!d.dltTemplateId.trim()) {
        configIssues.push({
          id: `sms3-${n.id}`,
          message: `SMS "${d.label}": DLT Template ID is required for India.`,
          nodeId: n.id,
        });
      }
    }
    if (nd(n).kind === 'ab_split') {
      const d = nd(n) as import('./journeyTypes').AbSplitNodeData;
      const sum = d.variants.reduce((s, v) => s + v.percent, 0) + (d.holdoutEnabled ? d.holdoutPercent : 0);
      if (Math.abs(sum - 100) > 0.01) {
        configIssues.push({
          id: `ab-${n.id}`,
          message: `A/B Split "${d.label}": Traffic allocation must total 100% (currently ${sum}%).`,
          nodeId: n.id,
        });
      }
    }
    if (nd(n).kind === 'entry_trigger') {
      const d = nd(n) as import('./journeyTypes').EntryTriggerNodeData;
      if (d.when === 'behavioral_event' && !d.eventName.trim()) {
        configIssues.push({
          id: `et-${n.id}`,
          message: `Entry Trigger "${d.label}": Enter an event name for behavioral entry.`,
          nodeId: n.id,
        });
      }
      if (d.when === 'campaign_start' && !d.startDate.trim()) {
        configIssues.push({
          id: `et2-${n.id}`,
          message: `Entry Trigger "${d.label}": Pick a campaign start date.`,
          nodeId: n.id,
        });
      }
    }
    if (nd(n).kind === 'email' || nd(n).kind === 'push' || nd(n).kind === 'rcs_message' || nd(n).kind === 'in_app') {
      const d = nd(n) as { label: string; variants: { isPrimary?: boolean; content: unknown }[] };
      const primary = d.variants.find((v) => v.isPrimary) ?? d.variants[0];
      const c = primary?.content as Record<string, unknown> | undefined;
      const body = typeof c?.body === 'string' ? c.body.trim() : '';
      const title = typeof c?.title === 'string' ? c.title.trim() : '';
      if (!body && !title) {
        configIssues.push({
          id: `msg-${n.id}`,
          message: `${nd(n).kind === 'email' ? 'Email' : nd(n).kind === 'push' ? 'Push' : nd(n).kind === 'rcs_message' ? 'RCS' : 'In-App'} "${d.label}": Add message copy in variants.`,
          nodeId: n.id,
        });
      }
    }
  });
  checks.push({
    id: 'config',
    label: 'Agents, templates, and A/B splits are valid',
    ok: configIssues.length === 0,
  });
  issues.push(...configIssues);

  return { checks, issues };
}
