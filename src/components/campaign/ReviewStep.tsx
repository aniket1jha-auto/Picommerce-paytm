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



// ─── Summary Row ─────────────────────────────────────────────────────────────

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

// ─── ReviewStep ───────────────────────────────────────────────────────────────

export function ReviewStep({ campaignData }: ReviewStepProps) {
  const { segments } = usePhaseData();
  const [showToast, setShowToast] = useState(false);

  const selectedSegment = segments.find((s) => s.id === campaignData.segmentId);
  const audienceSize = selectedSegment?.size ?? 0;

  const estimatedCost = campaignData.channels.reduce((total, channelId) => {
    const ch = channels.find((c) => c.id === channelId);
    return total + (ch ? ch.unitCost * audienceSize : 0);
  }, 0);

  const budgetStr = campaignData.budget;
  const parsedBudget = budgetStr ? parseFloat(budgetStr.replace(/[₹,L]/g, '')) * (budgetStr.toLowerCase().includes('l') ? 100000 : 1) : 0;

  const hasBudget = parsedBudget > 0;

  // Content preview helper
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Review &amp; Launch</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Review your campaign configuration and AI pre-launch checklist before going live.
        </p>
      </div>

      {/* ─── Campaign Summary ─────────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Campaign Summary
        </h3>
        <div className="divide-y divide-[#E5E7EB]">
          <SummaryRow
            label="Campaign Name"
            value={
              campaignData.name.trim() ? (
                campaignData.name
              ) : (
                <span className="italic text-text-secondary">Not set</span>
              )
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
          <SummaryRow
            label="Channels"
            value={
              campaignData.channels.length > 0 ? (
                <div className="flex items-center justify-end gap-2 flex-wrap">
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
          {/* Content preview per channel */}
          {campaignData.channels.map((ch) => {
            const preview = getContentPreview(ch);
            if (preview === '—') return null;
            return (
              <SummaryRow
                key={ch}
                label={`${CHANNEL_LABELS[ch]} Copy`}
                value={
                  <span className="text-text-secondary font-normal italic">
                    {preview}
                  </span>
                }
              />
            );
          })}
          <SummaryRow
            label="Estimated Cost"
            value={
              <span>
                {formatINR(estimatedCost)}
                {hasBudget && (
                  <span className="text-text-secondary font-normal ml-1">
                    (budget: {campaignData.budget})
                  </span>
                )}
              </span>
            }
          />
        </div>
      </div>

      {/* ─── Schedule Summary ──────────────────────────────────────────── */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Schedule
        </h3>
        <p className="text-sm text-text-primary">
          {campaignData.schedule.type === 'recurring'
            ? `Recurring ${campaignData.schedule.recurringFrequency} on ${campaignData.schedule.recurringDay}s at ${campaignData.schedule.recurringTime}`
            : campaignData.schedule.date
              ? `One-time on ${campaignData.schedule.date} at ${campaignData.schedule.time}`
              : 'Not scheduled yet — set in the Audience step'}
        </p>
      </div>

      {/* ─── Launch Button ────────────────────────────────────────────────── */}
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

      {/* Toast notification */}
      <Toast
        message="Campaign launched successfully! Your campaign is now active."
        type="success"
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
