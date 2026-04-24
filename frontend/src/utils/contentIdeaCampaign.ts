import type { ChannelType } from '@/types';
import type { CampaignData } from '@/components/campaign/CampaignWizard';
import type { ContentIdea } from '@/data/contentIdeas';
import type { VoiceConfig } from '@/components/campaign/VoiceCallConfig';

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Parse "10am–1pm" style → HH:mm for schedule (fallback 10:00) */
function parseScheduleTime(recommended: string): string {
  const m = recommended.match(/(\d{1,2})\s*(am|pm)/i);
  if (!m) return '10:00';
  let h = parseInt(m[1], 10);
  const ap = m[2].toLowerCase();
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:00`;
}

const VOICE_BASE: VoiceConfig = {
  script: '',
  language: 'hinglish',
  voiceGender: 'female',
  voiceTone: 'friendly',
  callWindowStart: '10:00',
  callWindowEnd: '19:00',
  maxRetries: 3,
  durationCap: 5,
  successCriteria: ['agreed', 'callback', 'completed'],
  failureCriteria: ['declined', 'dnd', 'hostile'],
};

/**
 * Builds wizard state from a Content & Ideas template.
 * Insights templates are handled separately (navigate to Analytics).
 */
export function isInsightsIdea(idea: ContentIdea): boolean {
  return idea.category === 'insights' || idea.sample.variant === 'insights';
}

export function buildCampaignDraftFromIdea(idea: ContentIdea): Partial<CampaignData> {
  const { sample, campaign: c, title } = idea;
  const time = parseScheduleTime(c.recommendedTime);
  const goalDescription = `Template: ${title}. Target: ${c.audience}. Primary channel: ${c.channel}.`;

  const schedule: CampaignData['schedule'] = {
    type: 'one-time',
    date: addDaysIso(1),
    time,
    recurringFrequency: 'weekly',
    recurringDay: 'monday',
    recurringTime: time,
    startDate: addDaysIso(1),
    endDate: '',
  };

  const base: Partial<CampaignData> = {
    name: title.slice(0, 120),
    goal: {
      description: goalDescription,
      goals: [],
      goalsOperator: 'or',
      tentativeBudget: '',
    },
    segmentId: c.segmentId,
    channels: c.channels.length > 0 ? c.channels : (['whatsapp'] as ChannelType[]),
    schedule,
    budget: '',
    waterfallConfig: {},
    highIntent: {
      enabled: false,
      criteria: [],
      estimatedCount: 0,
    },
  };

  const content: Partial<Record<ChannelType, unknown>> = {};

  if (sample.variant === 'messaging') {
    if (sample.channel === 'whatsapp') {
      content.whatsapp = { body: sample.text, imageUrl: '', ctaText: 'Continue' };
    } else {
      content.sms = { body: sample.text };
    }
  }

  if (sample.variant === 'voice') {
    const script = `${sample.openingLine}\n\n[If customer engages]: ${sample.firstResponseLine}`;
    content.ai_voice = {
      ...VOICE_BASE,
      script,
      callWindowStart: '10:00',
      callWindowEnd: '13:00',
    };
  }

  if (sample.variant === 'sequence') {
    const script = [
      'Multi-step outreach sequence',
      '',
      ...sample.steps,
      '',
      'Configure each step timing in Journey after channels are selected.',
    ].join('\n');
    content.ai_voice = { ...VOICE_BASE, script };
    if (c.channels.includes('whatsapp')) {
      content.whatsapp = {
        body: 'Follow-up WhatsApp after voice attempt — payment link and FAQ.',
        imageUrl: '',
        ctaText: 'Pay now',
      };
    }
    if (c.channels.includes('sms')) {
      content.sms = {
        body: 'Reminder: complete your payment or reply HELP for support. Opt out: STOP',
      };
    }
  }

  return {
    ...base,
    content,
  };
}
