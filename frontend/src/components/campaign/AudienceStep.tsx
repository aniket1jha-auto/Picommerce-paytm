'use client';

import { useState, useRef } from 'react';
import { Users, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Info, Plus, Trash2, Zap } from 'lucide-react';
import type { CampaignData, HighIntentCriterion } from './CampaignWizard';
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

// ─── High Intent helpers ──────────────────────────────────────────────────────

const ATTRIBUTE_OPTIONS = [
  'last_app_open',
  'ltv',
  'spend_3m',
  'transaction_count_30d',
  'campaign_response_rate',
  'kyc_status',
  'loan_preapproved',
  'kyc_page_views_7d',
  'kyc_steps_completed',
  'product_views_7d',
  'cart_items',
  'loan_page_views',
  'salary_credited_30d',
  'policy_expiry',
  'renewal_reminder_opened',
  'auto_renewal_history',
];

const OPERATOR_OPTIONS = ['>', '<', '=', '>=', '<=', 'is true', 'is not null'];

interface AiSuggestion {
  id: string;
  label: string;
  attribute: string;
  operator: string;
  value: string;
}

function getAiSuggestedCriteria(eventName: string): AiSuggestion[] {
  switch (eventName) {
    case 'kyc_completed':
      return [
        { id: 'ai-kyc-1', label: 'Opened KYC page in last 7 days', attribute: 'kyc_page_views_7d', operator: '>', value: '0' },
        { id: 'ai-kyc-2', label: 'Active on app in last 3 days', attribute: 'last_app_open', operator: '<', value: '3d' },
        { id: 'ai-kyc-3', label: 'Completed partial KYC steps', attribute: 'kyc_steps_completed', operator: '>', value: '0' },
      ];
    case 'transaction_completed':
      return [
        { id: 'ai-txn-1', label: 'Browsed products in last 7 days', attribute: 'product_views_7d', operator: '>', value: '0' },
        { id: 'ai-txn-2', label: 'Added items to cart', attribute: 'cart_items', operator: '>', value: '0' },
        { id: 'ai-txn-3', label: 'Spent > ₹5,000 in last 3 months', attribute: 'spend_3m', operator: '>', value: '5000' },
      ];
    case 'loan_applied':
      return [
        { id: 'ai-loan-1', label: 'Viewed loan offers page', attribute: 'loan_page_views', operator: '>', value: '0' },
        { id: 'ai-loan-2', label: 'Pre-approved for loan', attribute: 'loan_preapproved', operator: 'is true', value: '' },
        { id: 'ai-loan-3', label: 'Salary credited in last 30 days', attribute: 'salary_credited_30d', operator: 'is true', value: '' },
      ];
    case 'insurance_renewed':
      return [
        { id: 'ai-ins-1', label: 'Policy expiring in < 7 days', attribute: 'policy_expiry', operator: '<', value: '7d' },
        { id: 'ai-ins-2', label: 'Opened renewal reminder', attribute: 'renewal_reminder_opened', operator: 'is true', value: '' },
        { id: 'ai-ins-3', label: 'Has auto-renewal enabled previously', attribute: 'auto_renewal_history', operator: 'is true', value: '' },
      ];
    default:
      return [
        { id: 'ai-def-1', label: 'Active on app in last 7 days', attribute: 'last_app_open', operator: '<', value: '7d' },
        { id: 'ai-def-2', label: 'LTV > ₹10,000', attribute: 'ltv', operator: '>', value: '10000' },
        { id: 'ai-def-3', label: 'Engaged with previous campaigns', attribute: 'campaign_response_rate', operator: '>', value: '0.3' },
      ];
  }
}

function buildAttributeExpression(criterion: AiSuggestion): string {
  if (criterion.operator === 'is true' || criterion.operator === 'is not null') {
    return `${criterion.attribute} ${criterion.operator}`;
  }
  return `${criterion.attribute} ${criterion.operator} ${criterion.value}`;
}

interface HighIntentSectionProps {
  segmentSize: number;
  eventName: string;
  highIntent: CampaignData['highIntent'];
  onChange: (updated: CampaignData['highIntent']) => void;
}

function HighIntentSection({ segmentSize, eventName, highIntent, onChange }: HighIntentSectionProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAttr, setCustomAttr] = useState(ATTRIBUTE_OPTIONS[0]);
  const [customOp, setCustomOp] = useState(OPERATOR_OPTIONS[0]);
  const [customVal, setCustomVal] = useState('');

  const aiSuggestions = getAiSuggestedCriteria(eventName);

  // Sync AI suggestions into criteria list on first enable (or when eventName changes)
  function handleToggle(enabled: boolean) {
    if (enabled && highIntent.criteria.length === 0) {
      // Seed with all AI suggestions, none selected yet
      const seeded: HighIntentCriterion[] = aiSuggestions.map((s) => ({
        id: s.id,
        label: s.label,
        attribute: s.attribute,
        operator: s.operator,
        value: s.value,
        selected: false,
        source: 'ai_suggested',
      }));
      onChange({ ...highIntent, enabled, criteria: seeded, estimatedCount: 0 });
    } else {
      onChange({ ...highIntent, enabled });
    }
  }

  function toggleCriterion(id: string) {
    const updated = highIntent.criteria.map((c) =>
      c.id === id ? { ...c, selected: !c.selected } : c,
    );
    const selectedCount = updated.filter((c) => c.selected).length;
    // Mock estimated count: 15-25% of segment, scaling up with more criteria selected
    const pct = selectedCount === 0 ? 0 : 0.15 + (selectedCount - 1) * 0.03;
    const estimatedCount = Math.round(segmentSize * Math.min(pct, 0.28));
    onChange({ ...highIntent, criteria: updated, estimatedCount });
  }

  function removeCriterion(id: string) {
    const updated = highIntent.criteria.filter((c) => c.id !== id);
    const selectedCount = updated.filter((c) => c.selected).length;
    const pct = selectedCount === 0 ? 0 : 0.15 + (selectedCount - 1) * 0.03;
    const estimatedCount = Math.round(segmentSize * Math.min(pct, 0.28));
    onChange({ ...highIntent, criteria: updated, estimatedCount });
  }

  function addCustomCriterion() {
    if (!customAttr) return;
    const newCriterion: HighIntentCriterion = {
      id: `custom-${Date.now()}`,
      label: `${customAttr} ${customOp}${customVal ? ` ${customVal}` : ''}`,
      attribute: customAttr,
      operator: customOp,
      value: customVal,
      selected: true,
      source: 'custom',
    };
    const updated = [...highIntent.criteria, newCriterion];
    const selectedCount = updated.filter((c) => c.selected).length;
    const pct = selectedCount === 0 ? 0 : 0.15 + (selectedCount - 1) * 0.03;
    const estimatedCount = Math.round(segmentSize * Math.min(pct, 0.28));
    onChange({ ...highIntent, criteria: updated, estimatedCount });
    setCustomVal('');
    setShowCustomForm(false);
  }

  const selectedCount = highIntent.criteria.filter((c) => c.selected).length;
  const estimatedPct =
    segmentSize > 0 ? Math.round((highIntent.estimatedCount / segmentSize) * 100) : 0;

  const aiCriteria = highIntent.criteria.filter((c) => c.source === 'ai_suggested');
  const customCriteria = highIntent.criteria.filter((c) => c.source === 'custom');

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Section header with toggle */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[#F3F4F6]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
            <Zap size={15} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">High Value Users</p>
            <p className="text-xs text-text-secondary">
              Identify high-value users within this segment for a more aggressive outreach sequence
            </p>
          </div>
        </div>
        {/* Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={highIntent.enabled}
          onClick={() => handleToggle(!highIntent.enabled)}
          className={[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
            highIntent.enabled ? 'bg-amber-400' : 'bg-[#D1D5DB]',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
              highIntent.enabled ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
        </button>
      </div>

      {/* Expanded content */}
      {highIntent.enabled && (
        <div className="flex flex-col gap-5 p-4">
          {/* AI-Suggested Criteria */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                AI-Suggested Criteria
              </span>
              <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-cyan">
                Based on your campaign goal
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {aiCriteria.map((criterion) => (
                <button
                  key={criterion.id}
                  type="button"
                  onClick={() => toggleCriterion(criterion.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                    criterion.selected
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-[#E5E7EB] bg-[#F9FAFB] hover:border-amber-200 hover:bg-amber-50/50',
                  ].join(' ')}
                >
                  {/* Checkbox */}
                  <div
                    className={[
                      'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors',
                      criterion.selected
                        ? 'border-amber-400 bg-amber-400'
                        : 'border-[#D1D5DB] bg-white',
                    ].join(' ')}
                  >
                    {criterion.selected && (
                      <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-text-primary">{criterion.label}</span>
                      <span className="rounded-full bg-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan">
                        AI suggested
                      </span>
                    </div>
                    <code className="mt-0.5 block text-[11px] text-text-secondary font-mono">
                      {buildAttributeExpression(criterion)}
                    </code>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Criteria */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Custom Criteria
            </span>

            {customCriteria.length > 0 && (
              <div className="flex flex-col gap-2">
                {customCriteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCriterion(criterion.id)}
                      className={[
                        'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors',
                        criterion.selected
                          ? 'border-amber-400 bg-amber-400'
                          : 'border-[#D1D5DB] bg-white',
                      ].join(' ')}
                    >
                      {criterion.selected && (
                        <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-text-primary">{criterion.label}</span>
                      <code className="mt-0.5 block text-[11px] text-text-secondary font-mono">
                        {buildAttributeExpression(criterion)}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterion.id)}
                      className="rounded p-1 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Remove criterion"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showCustomForm ? (
              <div className="flex flex-col gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={customAttr}
                    onChange={(e) => setCustomAttr(e.target.value)}
                    className="rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
                  >
                    {ATTRIBUTE_OPTIONS.map((attr) => (
                      <option key={attr} value={attr}>{attr}</option>
                    ))}
                  </select>
                  <select
                    value={customOp}
                    onChange={(e) => setCustomOp(e.target.value)}
                    className="rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
                  >
                    {OPERATOR_OPTIONS.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  {customOp !== 'is true' && customOp !== 'is not null' && (
                    <input
                      type="text"
                      placeholder="value"
                      value={customVal}
                      onChange={(e) => setCustomVal(e.target.value)}
                      className="w-28 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addCustomCriterion}
                    className="inline-flex items-center rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-[#F3F4F6]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-[#D1D5DB] bg-white px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-600"
              >
                <Plus size={13} />
                Add custom criterion
              </button>
            )}
          </div>

          {/* Estimated count stat card */}
          {selectedCount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-600">
                  {highIntent.estimatedCount.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-medium text-amber-700">estimated high-value users</span>
              </div>
              <p className="mt-0.5 text-xs text-amber-600">
                ~{estimatedPct}% of segment · match {selectedCount} selected{' '}
                {selectedCount === 1 ? 'criterion' : 'criteria'}
              </p>
            </div>
          )}

          {/* Info note about waterfall impact */}
          <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(0,186,242,0.25)] bg-[rgba(0,186,242,0.04)] px-4 py-3">
            <Info size={15} className="mt-0.5 shrink-0 text-cyan" />
            <p className="text-xs text-text-secondary leading-relaxed">
              <span className="font-semibold text-text-primary">How this affects the outreach sequence: </span>
              High-value users will get a dedicated outreach sequence with shorter wait times and more
              channel touchpoints to maximise conversion. Regular users will follow the standard sequence.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AudienceStep({ campaignData, onUpdate }: AudienceStepProps) {
  const { isDay0, segments } = usePhaseData();
  const insights = useInsights('audience_step');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<AudienceMode>('segment');
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selectedSegment = segments.find((s) => s.id === campaignData.segmentId) ?? null;

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

      {/* High Value Users — for selected segments */}
      {mode === 'segment' && selectedSegment && (
        <HighIntentSection
          segmentSize={selectedSegment.size}
          eventName={campaignData.goal.goals[0]?.eventName ?? ''}
          highIntent={campaignData.highIntent}
          onChange={(updated) => onUpdate({ highIntent: updated })}
        />
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
