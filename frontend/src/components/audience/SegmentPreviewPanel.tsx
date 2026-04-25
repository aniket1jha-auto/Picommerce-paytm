import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCount } from '@/utils/format';
import { SEGMENT_CHANNEL_META } from '@/data/segmentBuilderConstants';
import { buildReachabilityFromEstimate, SAMPLE_PREVIEW_CONTACTS } from '@/components/audience/segmentPreviewUtils';
import type { ChannelType } from '@/types';

type CsvChannelHint = { key: ChannelType | 'email'; label: string; color: string; count: number };

interface SegmentPreviewPanelProps {
  estimate: number;
  /** filter = default live preview with sample contacts; csv = import-focused preview */
  variant?: 'filter' | 'csv';
  /** For csv: opt-in derived channel counts; if empty, show hint */
  csvChannels?: CsvChannelHint[];
}

export function SegmentPreviewPanel({
  estimate,
  variant = 'filter',
  csvChannels,
}: SegmentPreviewPanelProps) {
  const reach = useMemo(() => buildReachabilityFromEstimate(estimate), [estimate]);
  const [contactsOpen, setContactsOpen] = useState(false);

  const isCsv = variant === 'csv';
  const hasCsvReach = csvChannels && csvChannels.length > 0;

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Live preview</p>

      {isCsv ? (
        <>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {formatCount(estimate)} contacts in this import
          </p>
          <p className="mt-1 text-xs text-text-secondary">Total rows from your uploaded file</p>
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-text-secondary">Reachability</p>
            {hasCsvReach ? (
              <div className="flex flex-wrap gap-2">
                {csvChannels!.map(({ key, label, color, count }) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-medium text-text-secondary">{label}</span>
                    <span className="text-xs font-semibold text-text-primary">{formatCount(count)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary">Map opt-in columns to see reachability</p>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-2xl font-semibold text-text-primary">~{formatCount(estimate)} contacts</p>
          <p className="mt-1 text-xs text-text-secondary">Estimated match count (updates as conditions change)</p>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-text-secondary">Reachability</p>
            <div className="flex flex-wrap gap-2">
              {SEGMENT_CHANNEL_META.map(({ key, label, color }) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium text-text-secondary">{label}</span>
                  <span className="text-xs font-semibold text-text-primary">
                    {formatCount((reach as Record<string, number>)[key] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setContactsOpen((o) => !o)}
            className="mt-4 flex w-full items-center justify-between text-left text-xs font-medium text-cyan hover:underline"
          >
            Preview sample contacts
            {contactsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {contactsOpen && (
            <div className="mt-2 overflow-hidden rounded-md border border-[#E5E7EB]">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#F9FAFB] text-text-secondary">
                  <tr>
                    <th className="px-2 py-1.5 font-medium">Name</th>
                    <th className="px-2 py-1.5 font-medium">Phone</th>
                    <th className="px-2 py-1.5 font-medium">Attributes</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_PREVIEW_CONTACTS.map((r) => (
                    <tr key={r.phone} className="border-t border-[#F3F4F6]">
                      <td className="px-2 py-1.5 text-text-primary">{r.name}</td>
                      <td className="px-2 py-1.5 text-text-secondary">{r.phone}</td>
                      <td className="px-2 py-1.5 text-text-secondary">{r.attrs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
