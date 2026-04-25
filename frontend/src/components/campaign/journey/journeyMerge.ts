import type {
  JourneyNodeData,
  VoiceAgentNodeData,
  ChatAgentNodeData,
  WhatsAppMessageNodeData,
  SmsNodeData,
  AbSplitNodeData,
  EmailNodeData,
  PushNodeData,
  RcsMessageNodeData,
  InAppMessageNodeData,
  EntryTriggerNodeData,
} from './journeyTypes';

function messagingVariantsConfigured(
  d: Pick<WhatsAppMessageNodeData, 'variants'>,
): boolean {
  const primary = d.variants.find((v) => v.isPrimary) ?? d.variants[0];
  if (!primary) return false;
  const c = primary.content as unknown as Record<string, unknown>;
  const body = typeof c.body === 'string' ? c.body.trim() : '';
  const title = typeof c.title === 'string' ? c.title.trim() : '';
  return !!(body || title);
}

export function mergeJourneyNodeData(current: JourneyNodeData, patch: Partial<JourneyNodeData>): JourneyNodeData {
  let next: JourneyNodeData = { ...current, ...patch } as JourneyNodeData;

  switch (next.kind) {
    case 'entry_trigger': {
      const d = next as EntryTriggerNodeData;
      const ok =
        (d.when === 'behavioral_event' && !!d.eventName.trim()) ||
        (d.when === 'campaign_start' && !!d.startDate.trim()) ||
        d.when === 'recurring';
      next = { ...d, configured: ok, needsConfig: !ok };
      break;
    }
    case 'voice_agent': {
      const d = next as VoiceAgentNodeData;
      if (d.agentId) {
        next = { ...d, configured: true, needsConfig: false };
      }
      break;
    }
    case 'chat_agent': {
      const d = next as ChatAgentNodeData;
      if (d.agentId) {
        next = { ...d, configured: true, needsConfig: false };
      }
      break;
    }
    case 'whatsapp_message': {
      const d = next as WhatsAppMessageNodeData;
      if (d.templateId) {
        next = { ...d, configured: true, needsConfig: false };
      }
      break;
    }
    case 'sms': {
      const d = next as SmsNodeData;
      const ok =
        d.dltTemplateId.trim().length > 0 &&
        (d.mode === 'template' ? !!d.templateId : d.customBody.trim().length > 0);
      next = { ...d, configured: ok, needsConfig: ok ? false : d.needsConfig };
      break;
    }
    case 'ab_split': {
      const d = next as AbSplitNodeData;
      const sum = d.variants.reduce((s, v) => s + v.percent, 0) + (d.holdoutEnabled ? d.holdoutPercent : 0);
      const ok = Math.abs(sum - 100) < 0.02;
      next = { ...d, configured: ok, needsConfig: ok ? false : d.needsConfig };
      break;
    }
    case 'email':
    case 'push':
    case 'rcs_message':
    case 'in_app': {
      const d = next as EmailNodeData | PushNodeData | RcsMessageNodeData | InAppMessageNodeData;
      const ok = messagingVariantsConfigured(d);
      next = { ...d, configured: ok, needsConfig: ok ? false : d.needsConfig };
      break;
    }
    default:
      break;
  }

  return next;
}

export function templateVariableSlots(body: string): string[] {
  const m = body.match(/\{\{\d+\}\}/g) ?? [];
  const uniq = [...new Set(m)];
  return uniq.sort(
    (a, b) => parseInt(/\d+/.exec(a)?.[0] ?? '0', 10) - parseInt(/\d+/.exec(b)?.[0] ?? '0', 10),
  );
}
