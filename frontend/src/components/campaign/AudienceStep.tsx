'use client';

import { useState, useRef } from 'react';
import { Users, Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import type { CampaignData } from './CampaignWizard';
import { usePhaseData } from '@/hooks/usePhaseData';
import { useInsights } from '@/hooks/useInsights';
import { EmptyState } from '@/components/common/EmptyState';
import { InlineInsight } from '@/components/ai/InlineInsight';
import { SegmentBuilder } from '@/components/audience/SegmentBuilder';


import { Toast } from '@/components/common/Toast';
import { formatCount } from '@/utils/format';
import type { Segment } from '@/types';

interface AudienceStepProps {
  campaignData: CampaignData;
  onUpdate: (updates: Partial<CampaignData>) => void;
}

type AudienceMode = 'segment' | 'upload';

interface UploadState {
  fileName: string;
  rowCount: number;
  status: 'idle' | 'parsing' | 'enriching' | 'ready' | 'error';
  errors: string[];
  warnings: string[];
  preview: { phone: string; name?: string }[];
  enrichment?: {
    matched: number;
    unmatched: number;
    enrichedSegment: Segment;
  };
}


// ─── Main component ───────────────────────────────────────────────────────────

export function AudienceStep({ campaignData, onUpdate }: AudienceStepProps) {
  const { isDay0, segments } = usePhaseData();
  const insights = useInsights('audience_step');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<AudienceMode>('segment');
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function handleSegmentSelect(id: string) {
    onUpdate({ segmentId: id });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      setUploadState({
        fileName: file.name,
        rowCount: 0,
        status: 'error',
        errors: ['Unsupported file format. Please upload a CSV or Excel file.'],
        warnings: [],
        preview: [],
      });
      return;
    }

    // Phase 1: Parse the file
    setUploadState({
      fileName: file.name,
      rowCount: 0,
      status: 'parsing',
      errors: [],
      warnings: [],
      preview: [],
    });

    setTimeout(() => {
      // Simulate parsed result
      const mockRowCount = Math.floor(Math.random() * 40000) + 5000;
      const mockPreview = [
        { phone: '+91-98765XXXXX', name: 'Rahul S.' },
        { phone: '+91-87654XXXXX', name: 'Priya M.' },
        { phone: '+91-76543XXXXX', name: 'Amit K.' },
        { phone: '+91-65432XXXXX' },
        { phone: '+91-54321XXXXX', name: 'Sneha R.' },
      ];
      const parseWarnings: string[] = [];
      parseWarnings.push('142 rows missing phone number — will be skipped');
      parseWarnings.push('38 duplicate phone numbers found — will be deduplicated');

      // Phase 2: Enrich against connected data sources
      setUploadState({
        fileName: file.name,
        rowCount: mockRowCount,
        status: 'enriching',
        errors: [],
        warnings: parseWarnings,
        preview: mockPreview,
      });

      setTimeout(() => {
        // Simulate enrichment results — matching uploaded phones against connected data sources
        const matched = Math.round(mockRowCount * 0.78); // 78% found in our data sources
        const unmatched = mockRowCount - matched;

        const enrichedSegment: Segment = {
          id: `upload-${Date.now()}`,
          name: `Custom Upload — ${file.name}`,
          description: `${formatCount(mockRowCount)} uploaded users (${formatCount(matched)} matched in connected data sources)`,
          size: mockRowCount,
          // Real reachability from matching against connected data sources
          reachability: {
            sms: Math.round(mockRowCount * 0.96),           // almost all have phone (uploaded with phone)
            whatsapp: Math.round(matched * 0.72),            // WhatsApp lookup on matched users
            rcs: Math.round(matched * 0.34),                 // RCS capability from device data
            ai_voice: Math.round(mockRowCount * 0.96),       // same as SMS
            field_executive: Math.round(matched * 0.41),     // address data from matched records
            push_notification: Math.round(matched * 0.58),   // app install data from matched records
            in_app_banner: Math.round(matched * 0.45),       // app activity from matched records
          },
          // Profile data enriched from matched records
          attributes: {
            avgLtv: 9800,
            geographyBreakdown: { metro: 45, tier2: 35, tier3: 20 },
            ageRange: [24, 48],
            genderSplit: { male: 66, female: 34 },
          },
        };

        setUploadState({
          fileName: file.name,
          rowCount: mockRowCount,
          status: 'ready',
          errors: [],
          warnings: parseWarnings,
          preview: mockPreview,
          enrichment: {
            matched,
            unmatched,
            enrichedSegment,
          },
        });

        onUpdate({ segmentId: enrichedSegment.id });
        setToast(`${formatCount(mockRowCount)} users uploaded — ${formatCount(matched)} enriched from connected sources`);
      }, 2000);
    }, 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Select Audience</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose an audience segment or upload a custom list.
        </p>
      </div>

      {/* Mode toggle: Segment vs Upload */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text-primary">Audience Source</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode('segment')}
            className={[
              'flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all',
              mode === 'segment'
                ? 'border-cyan bg-[rgba(0,186,242,0.06)] text-cyan'
                : 'border-[#E5E7EB] bg-white text-text-primary hover:border-[#D1D5DB]',
            ].join(' ')}
          >
            <Users size={18} />
            Select from Segments
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={[
              'flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all',
              mode === 'upload'
                ? 'border-cyan bg-[rgba(0,186,242,0.06)] text-cyan'
                : 'border-[#E5E7EB] bg-white text-text-primary hover:border-[#D1D5DB]',
            ].join(' ')}
          >
            <Upload size={18} />
            Upload Custom List
          </button>
        </div>
      </div>

      {/* Segment selector mode */}
      {mode === 'segment' && (
        <div className="flex flex-col gap-2">
          {isDay0 ? (
            <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-[#F9FAFB]">
              <EmptyState
                icon={Users}
                title="No segments available"
                description="Connect data sources to see audience segments"
              />
            </div>
          ) : (
            <SegmentBuilder
              segments={segments}
              selectedId={campaignData.segmentId || null}
              onSelect={handleSegmentSelect}
            />
          )}
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div className="flex flex-col gap-4">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-10 transition-colors hover:border-cyan hover:bg-[rgba(0,186,242,0.03)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,186,242,0.08)]">
              <FileSpreadsheet size={24} className="text-cyan" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">
                Click to upload a CSV or Excel file
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Required column: <code className="rounded bg-[#F3F4F6] px-1 py-0.5 text-xs">phone</code> &nbsp;|&nbsp;
                Optional: <code className="rounded bg-[#F3F4F6] px-1 py-0.5 text-xs">name</code>,{' '}
                <code className="rounded bg-[#F3F4F6] px-1 py-0.5 text-xs">email</code>,{' '}
                <code className="rounded bg-[#F3F4F6] px-1 py-0.5 text-xs">city</code>,{' '}
                <code className="rounded bg-[#F3F4F6] px-1 py-0.5 text-xs">ltv</code>
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Upload status */}
          {uploadState?.status === 'parsing' && (
            <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
              <span className="text-sm text-text-primary">Parsing {uploadState.fileName}...</span>
            </div>
          )}

          {/* Enriching state */}
          {uploadState?.status === 'enriching' && (
            <div className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#27AE60]" />
                <span className="text-sm text-text-primary">
                  {formatCount(uploadState.rowCount)} users parsed from {uploadState.fileName}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-md bg-[rgba(0,186,242,0.06)] p-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary">Enriching from connected data sources...</span>
                  <span className="text-xs text-text-secondary">Matching phone numbers against your Snowflake, CRM, and Feature Store to enrich user profiles and determine channel reachability</span>
                </div>
              </div>
            </div>
          )}

          {uploadState?.status === 'ready' && (
            <div className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#27AE60]" />
                <span className="text-sm font-medium text-text-primary">
                  {uploadState.fileName} — {formatCount(uploadState.rowCount)} users uploaded
                </span>
              </div>

              {/* Enrichment results */}
              {uploadState.enrichment && (
                <div className="flex gap-3">
                  <div className="flex-1 rounded-md bg-[#27AE60]/8 p-3">
                    <div className="text-lg font-bold text-[#27AE60]">{formatCount(uploadState.enrichment.matched)}</div>
                    <div className="text-xs text-text-secondary">Matched in connected data sources</div>
                    <div className="mt-1 text-[10px] text-text-secondary">Full profile, reachability & history available</div>
                  </div>
                  <div className="flex-1 rounded-md bg-[#F2994A]/8 p-3">
                    <div className="text-lg font-bold text-[#F2994A]">{formatCount(uploadState.enrichment.unmatched)}</div>
                    <div className="text-xs text-text-secondary">Not found in data sources</div>
                    <div className="mt-1 text-[10px] text-text-secondary">Reachable via SMS & AI Voice only (phone number)</div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {uploadState.warnings.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {uploadState.warnings.map((warn, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#F2994A]" />
                      <span className="text-text-secondary">{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview table */}
              <div className="overflow-hidden rounded border border-[#E5E7EB]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F9FAFB]">
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">Phone</th>
                      <th className="px-3 py-2 text-left font-medium text-text-secondary">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadState.preview.map((row, i) => (
                      <tr key={i} className="border-t border-[#F3F4F6]">
                        <td className="px-3 py-1.5 font-mono text-text-primary">{row.phone}</td>
                        <td className="px-3 py-1.5 text-text-secondary">{row.name ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-xs text-text-secondary">
                  Showing 5 of {formatCount(uploadState.rowCount)} rows
                </div>
              </div>
            </div>
          )}

          {uploadState?.status === 'error' && (
            <div className="flex items-center gap-2 rounded-lg border border-[#EB5757]/20 bg-[#EB5757]/5 p-4">
              <AlertTriangle size={18} className="text-[#EB5757]" />
              <span className="text-sm text-[#EB5757]">{uploadState.errors[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* AI insights */}
      {insights.length > 0 && (
        <div className="flex flex-col gap-2">
          {insights.map((insight) => (
            <InlineInsight key={insight.id} insight={insight} />
          ))}
        </div>
      )}

      {toast && (
        <Toast message={toast} type="success" visible={true} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
