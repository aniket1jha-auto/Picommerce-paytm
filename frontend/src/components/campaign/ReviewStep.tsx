'use client';

import { useState } from 'react';
import { Rocket } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CampaignData } from './CampaignWizard';
import { usePhaseData } from '@/hooks/usePhaseData';
import { ChannelIcon } from '@/components/common/ChannelIcon';
import { Toast } from '@/components/common/Toast';
import { formatINR, formatCount } from '@/utils/format';
import { channels } from '@/data/channels';
import type { ChannelType } from '@/types';
import type {
  CampaignJourneyState,
  JourneyFlowNode,
  JourneyFlowEdge,
  JourneyNodeData,
  EntryTriggerNodeData,
} from './journey/journeyTypes';
import { ENTRY_TRIGGER_KINDS } from './journey/journeyTypes';

interface ReviewStepProps {
  campaignData: CampaignData;
  onUpdate: (updates: Partial<CampaignData>) => void;
}

const CHANNEL_LABELS: Record<ChannelType, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  rcs: 'RCS',
  ai_voice: 'AI Voice Call',
  field_executive: 'Field Executive',
  push_notification: 'Push Notification',
  in_app_banner: 'In-App Banner',
  facebook_ads: 'Facebook Ads',
  instagram_ads: 'Instagram Ads',
};

function journeyKindToBillingChannel(kind: string): { id: ChannelType; lineLabel: string } | null {
  switch (kind) {
    case 'sms':
      return { id: 'sms', lineLabel: 'SMS' };
    case 'whatsapp_message':
      return { id: 'whatsapp', lineLabel: 'WhatsApp' };
    case 'rcs_message':
      return { id: 'rcs', lineLabel: 'RCS' };
    case 'push':
      return { id: 'push_notification', lineLabel: 'Push' };
    case 'in_app':
      return { id: 'in_app_banner', lineLabel: 'In-App' };
    case 'email':
      return { id: 'push_notification', lineLabel: 'Email (push-style estimate)' };
    case 'voice_agent':
      return { id: 'ai_voice', lineLabel: 'AI Voice' };
    case 'chat_agent':
      return { id: 'whatsapp', lineLabel: 'AI Chat (WhatsApp-rate estimate)' };
    default:
      return null;
  }
}

function journeyCostLines(journey: CampaignJourneyState, audienceSize: number): { label: string; amount: number }[] {
  const seen = new Set<string>();
  const lines: { label: string; amount: number }[] = [];
  for (const n of journey.nodes) {
    const kind = String((n.data as { kind?: string }).kind);
    const map = journeyKindToBillingChannel(kind);
    if (!map) continue;
    const key = `${map.id}-${map.lineLabel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const ch = channels.find((c) => c.id === map.id);
    if (!ch || audienceSize <= 0) continue;
    lines.push({ label: map.lineLabel, amount: ch.unitCost * audienceSize });
  }
  return lines;
}

function journeyNodeChainSummary(journey: CampaignJourneyState): string {
  const { nodes, edges } = journey;
  if (!nodes.length) return 'No journey steps yet.';
  const entry = nodes.find((n) =>
    (ENTRY_TRIGGER_KINDS as readonly string[]).includes(String((n.data as { kind?: string }).kind)),
  );
  const labels: string[] = [];
  let cur: JourneyFlowNode | undefined = entry ?? nodes[0];
  const visited = new Set<string>();
  while (cur) {
    if (visited.has(cur.id)) break;
    visited.add(cur.id);
    const jd = cur.data as unknown as JourneyNodeData;
    labels.push(jd.typeLabel || jd.label);
    const fromId: string = cur.id;
    const nextEdge: JourneyFlowEdge | undefined = edges.find((e) => e.source === fromId);
    const nextId: string | undefined = nextEdge?.target;
    cur = nextId ? nodes.find((nn) => nn.id === nextId) : undefined;
  }
  return `${nodes.length} nodes — ${labels.join(' → ')}`;
}

function entryTriggerScheduleSummary(journey: CampaignJourneyState): string {
  const n = journey.nodes.find((x) => (x.data as { kind?: string }).kind === 'entry_trigger');
  if (!n) return 'Add an Entry Trigger in Build Flow to set when users enter.';
  const d = n.data as unknown as EntryTriggerNodeData;
  if (d.when === 'campaign_start') {
    return d.startDate.trim()
      ? `Campaign start on ${d.startDate} at ${d.startTime}`
      : 'Campaign start date not set yet.';
  }
  if (d.when === 'behavioral_event') {
    return d.eventName.trim() ? `When event fires: ${d.eventName}` : 'Behavioral event name not set yet.';
  }
  return `Recurring ${d.recurringFrequency} on ${d.recurringDay}s at ${d.recurringTime}`;
}

interface SummaryRowProps {
  label: string;
  value: ReactNode;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="min-w-[130px] text-sm text-text-secondary">{label}</span>
      <div className="flex-1 text-right text-sm font-medium text-text-primary">{value}</div>
    </div>
  );
}

export function ReviewStep({ campaignData }: ReviewStepProps) {
  const { segments } = usePhaseData();
  const [showToast, setShowToast] = useState(false);

  const selectedSegment = segments.find((s) => s.id === campaignData.segmentId);
  const audienceSize = selectedSegment?.size ?? 0;

  const simpleSendCosts =
    campaignData.campaignType === 'simple_send'
      ? campaignData.channels.map((channelId) => {
          const ch = channels.find((c) => c.id === channelId);
          const line = CHANNEL_LABELS[channelId];
          const amount = ch && audienceSize > 0 ? ch.unitCost * audienceSize : 0;
          return { label: line, amount };
        })
      : [];

  const journeyLines =
    campaignData.campaignType === 'journey'
      ? journeyCostLines(campaignData.journey, audienceSize)
      : [];

  const costLines = campaignData.campaignType === 'simple_send' ? simpleSendCosts : journeyLines;
  const totalEstimatedCost = costLines.reduce((s, x) => s + x.amount, 0);
  const showCostPerReach = audienceSize > 0 && totalEstimatedCost > 0;

  function getContentPreview(channel: ChannelType): string {
    const raw = campaignData.content[channel];
    if (!raw) return '—';
    if (typeof raw === 'string') return raw.slice(0, 100) + (raw.length > 100 ? '…' : '');
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const body = obj.body ?? obj.script ?? obj.description;
      if (typeof body === 'string') {
        return body.slice(0, 100) + (body.length > 100 ? '…' : '');
      }
    }
    return '—';
  }

  function handleLaunch() {
    setShowToast(true);
  }

  const scheduleSummary =
    campaignData.campaignType === 'simple_send'
      ? campaignData.schedule.type === 'recurring'
        ? `Recurring ${campaignData.schedule.recurringFrequency} on ${campaignData.schedule.recurringDay}s at ${campaignData.schedule.recurringTime}`
        : campaignData.schedule.date
          ? `One-time on ${campaignData.schedule.date} at ${campaignData.schedule.time}`
          : 'Not scheduled yet — set in the Content & Schedule step.'
      : entryTriggerScheduleSummary(campaignData.journey);

  const typeBadge =
    campaignData.campaignType === 'simple_send' ? (
      <span className="ml-2 inline-flex shrink-0 items-center rounded-full bg-cyan/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan">
        Simple Send
      </span>
    ) : (
      <span className="ml-2 inline-flex shrink-0 items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-800">
        Automated Journey
      </span>
    );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Review &amp; Launch</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Review your campaign configuration and AI pre-launch checklist before going live.
        </p>
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Campaign Summary</h3>
        <div className="divide-y divide-[#E5E7EB]">
          <SummaryRow
            label="Campaign Name"
            value={
              <span className="inline-flex flex-wrap items-center justify-end gap-1">
                {campaignData.name.trim() ? (
                  <span>{campaignData.name}</span>
                ) : (
                  <span className="italic text-text-secondary">Not set</span>
                )}
                {typeBadge}
              </span>
            }
          />
          <SummaryRow
            label="Audience"
            value={
              selectedSegment ? (
                <span>
                  {selectedSegment.name}{' '}
                  <span className="text-text-secondary">({formatCount(selectedSegment.size)} users)</span>
                </span>
              ) : (
                <span className="italic text-text-secondary">Not selected</span>
              )
            }
          />

          {campaignData.campaignType === 'journey' && (
            <div className="py-3">
              <p className="text-sm text-text-secondary">Journey outline</p>
              <p className="mt-1 rounded-md border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-left text-xs font-medium leading-relaxed text-text-primary">
                {journeyNodeChainSummary(campaignData.journey)}
              </p>
            </div>
          )}

          {campaignData.campaignType === 'simple_send' && (
            <SummaryRow
              label="Channels"
              value={
                campaignData.channels.length > 0 ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {campaignData.channels.map((ch) => (
                      <div key={ch} className="flex items-center gap-1">
                        <ChannelIcon channel={ch} size={13} />
                        <span className="text-xs text-text-secondary">{CHANNEL_LABELS[ch]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="italic text-text-secondary">None selected</span>
                )
              }
            />
          )}

          {campaignData.campaignType === 'simple_send' &&
            campaignData.channels.map((ch) => {
              const preview = getContentPreview(ch);
              if (preview === '—') return null;
              return (
                <SummaryRow
                  key={ch}
                  label={`${CHANNEL_LABELS[ch]} Copy`}
                  value={<span className="font-normal italic text-text-secondary">{preview}</span>}
                />
              );
            })}

          {costLines.length > 0 && (
            <div className="py-3">
              <p className="text-sm text-text-secondary">Channel cost breakdown (est.)</p>
              <ul className="mt-2 space-y-1 text-right text-sm text-text-primary">
                {costLines.map((row) => (
                  <li key={row.label}>
                    {row.label}: {formatINR(row.amount)}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right text-sm font-semibold text-text-primary">
                Total estimated: {formatINR(totalEstimatedCost)}
              </p>
            </div>
          )}

          {showCostPerReach && (
            <SummaryRow
              label="Cost per reach"
              value={formatINR(totalEstimatedCost / audienceSize)}
            />
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Schedule</h3>
        <p className="text-sm text-text-primary">{scheduleSummary}</p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleLaunch}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-cyan py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cyan/90 active:scale-[0.99]"
        >
          <Rocket size={16} />
          Launch Campaign
        </button>
      </div>

      <Toast
        message="Campaign launched successfully! Your campaign is now active."
        type="success"
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
