import type { JourneyFlowEdge, JourneyFlowNode } from './journeyTypes';
import { TRIGGER_KINDS } from './journeyTypes';
import { createJourneyNode } from './journeyConstants';

function e(
  source: string,
  target: string,
  sourceHandle?: string | null,
): JourneyFlowEdge {
  return {
    id: `je_${source}_${target}_${sourceHandle ?? 'd'}`,
    source,
    target,
    sourceHandle: sourceHandle ?? undefined,
    type: 'journeyBezier',
    animated: true,
    style: { stroke: '#94A3B8', strokeWidth: 1.5 },
  };
}

function markNeeds(n: JourneyFlowNode): JourneyFlowNode {
  const kind = n.data.kind as string;
  if ((TRIGGER_KINDS as readonly string[]).includes(kind)) {
    return n;
  }
  if (kind === 'exit' || kind === 'note') {
    return n;
  }
  return {
    ...n,
    data: { ...n.data, needsConfig: true, configured: false },
  };
}

export const PREBUILT_TEMPLATE_META = [
  {
    id: 'recovery_voice',
    title: 'Recovery — Voice First',
    description: 'Voice call → WhatsApp follow-up → SMS nudge',
  },
  {
    id: 'kyc',
    title: 'KYC Re-engagement',
    description: 'WhatsApp reminder → Wait → Voice escalation',
  },
  {
    id: 'loan_sales',
    title: 'Loan Sales Outreach',
    description: 'Voice → Interested path → WhatsApp + payment',
  },
  {
    id: 'welcome',
    title: 'Welcome Onboarding',
    description: 'WhatsApp → Wait → Push → Condition → Voice',
  },
  {
    id: 'payment_reminder',
    title: 'Payment Reminder Sequence',
    description: 'SMS Day 1 → WhatsApp Day 3 → Voice Day 7',
  },
  { id: 'blank', title: 'Custom — Start Blank', description: 'Start with an entry trigger node' },
] as const;

export function buildPrebuiltJourney(templateId: string): {
  nodes: JourneyFlowNode[];
  edges: JourneyFlowEdge[];
} {
  if (templateId === 'blank') {
    const start = createJourneyNode('entry_trigger', { x: 420, y: 220 });
    return { nodes: [start], edges: [] };
  }

  const x = (i: number) => 120 + i * 220;
  const y = 200;

  const start = createJourneyNode('entry_trigger', { x: x(0), y });
  const n1 = markNeeds(createJourneyNode('voice_agent', { x: x(1), y }));
  n1.data = { ...n1.data, label: 'Recovery Voice' };
  const n2 = markNeeds(createJourneyNode('whatsapp_message', { x: x(2), y: y - 80 }));
  const n3 = markNeeds(createJourneyNode('wait', { x: x(2), y: y + 90 }));
  const n4 = markNeeds(createJourneyNode('sms', { x: x(3), y }));
  const ex = createJourneyNode('exit', { x: x(4), y });

  if (templateId === 'recovery_voice') {
    return {
      nodes: [start, n1, n2, n3, n4, ex],
      edges: [
        e(start.id, n1.id),
        e(n1.id, n2.id, 'interested'),
        e(n1.id, n3.id, 'not_answered'),
        e(n2.id, n4.id),
        e(n3.id, n4.id),
        e(n4.id, ex.id),
      ],
    };
  }

  if (templateId === 'kyc') {
    const wa = markNeeds(createJourneyNode('whatsapp_message', { x: x(1), y }));
    const w = markNeeds(createJourneyNode('wait', { x: x(2), y }));
    const cond = markNeeds(createJourneyNode('condition', { x: x(3), y }));
    const voice = markNeeds(createJourneyNode('voice_agent', { x: x(4), y: y - 70 }));
    const ex2 = createJourneyNode('exit', { x: x(4), y: y + 80 });
    return {
      nodes: [start, wa, w, cond, voice, ex2],
      edges: [
        e(start.id, wa.id),
        e(wa.id, w.id),
        e(w.id, cond.id),
        e(cond.id, voice.id, 'path_0'),
        e(cond.id, ex2.id, 'path_1'),
        e(voice.id, ex2.id),
      ],
    };
  }

  if (templateId === 'loan_sales') {
    const v = markNeeds(createJourneyNode('voice_agent', { x: x(1), y }));
    const wa = markNeeds(createJourneyNode('whatsapp_message', { x: x(2), y }));
    const w = markNeeds(createJourneyNode('wait', { x: x(3), y }));
    const api = markNeeds(createJourneyNode('api_webhook', { x: x(4), y }));
    const ex2 = createJourneyNode('exit', { x: x(5), y });
    return {
      nodes: [start, v, wa, w, api, ex2],
      edges: [
        e(start.id, v.id),
        e(v.id, wa.id, 'interested'),
        e(wa.id, w.id),
        e(w.id, api.id),
        e(api.id, ex2.id),
      ],
    };
  }

  if (templateId === 'welcome') {
    const wa = markNeeds(createJourneyNode('whatsapp_message', { x: x(1), y }));
    const w = markNeeds(createJourneyNode('wait', { x: x(2), y }));
    const push = markNeeds(createJourneyNode('push', { x: x(3), y }));
    const cond = markNeeds(createJourneyNode('condition', { x: x(4), y }));
    const voice = markNeeds(createJourneyNode('voice_agent', { x: x(5), y }));
    const ex2 = createJourneyNode('exit', { x: x(5), y: y + 100 });
    return {
      nodes: [start, wa, w, push, cond, voice, ex2],
      edges: [
        e(start.id, wa.id),
        e(wa.id, w.id),
        e(w.id, push.id),
        e(push.id, cond.id),
        e(cond.id, voice.id, 'path_0'),
        e(cond.id, ex2.id, 'path_1'),
        e(voice.id, ex2.id),
      ],
    };
  }

  if (templateId === 'payment_reminder') {
    const sms1 = markNeeds(createJourneyNode('sms', { x: x(1), y }));
    const wa = markNeeds(createJourneyNode('whatsapp_message', { x: x(2), y }));
    const w1 = markNeeds(createJourneyNode('wait', { x: x(2), y: y + 100 }));
    const voice = markNeeds(createJourneyNode('voice_agent', { x: x(3), y }));
    const ex2 = createJourneyNode('exit', { x: x(4), y });
    return {
      nodes: [start, sms1, wa, w1, voice, ex2],
      edges: [e(start.id, sms1.id), e(sms1.id, wa.id), e(wa.id, w1.id), e(w1.id, voice.id), e(voice.id, ex2.id)],
    };
  }

  const startOnly = createJourneyNode('entry_trigger', { x: 420, y: 220 });
  return { nodes: [startOnly], edges: [] };
}
