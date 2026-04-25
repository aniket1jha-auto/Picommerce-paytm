import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  ConditionBuilder,
  defaultFilterState,
  type FilterState,
} from '@/components/audience/ConditionBuilder';
import { SegmentPreviewPanel } from '@/components/audience/SegmentPreviewPanel';
import { estimateFromFilterState, buildReachabilityFromEstimate } from '@/components/audience/segmentPreviewUtils';
import { filterStateToPlainEnglish } from '@/utils/segmentFilterEnglish';
import { usePhaseData } from '@/hooks/usePhaseData';
import type { Segment } from '@/types';

const SEGMENT_GOALS = [
  'Recovery',
  'Sales',
  'KYC',
  'Onboarding',
  'Re-engagement',
  'Retention',
  'Custom',
] as const;

type SegmentGoal = (typeof SEGMENT_GOALS)[number];

type DynamicRefresh = 'hourly' | 'every_6_hours' | 'daily' | 'weekly';

const STEPS = [
  { label: 'Segment Details', shortLabel: '1' },
  { label: 'Define Conditions', shortLabel: '2' },
  { label: 'Exclusions', shortLabel: '3' },
  { label: 'Segment Settings', shortLabel: '4' },
  { label: 'Review & Save', shortLabel: '5' },
];

function rid(): string {
  return `seg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function StepNav({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <nav aria-label="Segment wizard steps">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <li key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isCompleted
                      ? 'bg-cyan text-white'
                      : isCurrent
                        ? 'bg-cyan text-white ring-2 ring-cyan ring-offset-2'
                        : 'bg-[#E5E7EB] text-text-secondary',
                  ].join(' ')}
                >
                  {isCompleted ? <Check size={14} strokeWidth={2.5} /> : stepNum}
                </div>
                <span
                  className={[
                    'text-xs font-medium transition-colors',
                    isCurrent ? 'text-cyan' : isCompleted ? 'text-text-primary' : 'text-text-secondary',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={['h-[2px] flex-1 transition-colors', isCompleted ? 'bg-cyan' : 'bg-[#E5E7EB]'].join(
                    ' ',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

function hasConditionInput(f: FilterState): boolean {
  const lineVal = (c: { value?: string; value2?: string }) =>
    Boolean(c.value?.trim() || c.value2?.trim());
  for (const it of f.items) {
    if (it.kind === 'condition') {
      if (lineVal(it.condition)) return true;
    } else if (it.conditions.some(lineVal)) return true;
  }
  return false;
}

export function CreateSegmentFilters() {
  const navigate = useNavigate();
  const { campaigns, segments } = usePhaseData();
  const dndInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [segmentGoal, setSegmentGoal] = useState<SegmentGoal | ''>('');
  const [filterState, setFilterState] = useState<FilterState>(() => defaultFilterState());

  const [globalDnd, setGlobalDnd] = useState(true);
  const [traiDnd, setTraiDnd] = useState(true);
  const [customDndFiles, setCustomDndFiles] = useState<string[]>([]);
  const [suppressionIds, setSuppressionIds] = useState<string[]>([]);
  const [excludedSegmentIds, setExcludedSegmentIds] = useState<string[]>([]);

  const [segmentMode, setSegmentMode] = useState<'static' | 'dynamic'>('static');
  const [dynamicRefresh, setDynamicRefresh] = useState<DynamicRefresh>('daily');
  const [triggerNewContact, setTriggerNewContact] = useState(false);
  const [triggerAttribute, setTriggerAttribute] = useState(false);
  const [triggerCampaignResponse, setTriggerCampaignResponse] = useState(false);

  const previewEstimate = useMemo(() => estimateFromFilterState(filterState), [filterState]);

  const isDirty = useCallback(() => {
    if (name.trim() || description.trim() || segmentGoal) return true;
    if (hasConditionInput(filterState)) return true;
    if (!globalDnd || !traiDnd) return true;
    if (customDndFiles.length) return true;
    if (suppressionIds.length || excludedSegmentIds.length) return true;
    if (segmentMode !== 'static' || dynamicRefresh !== 'daily') return true;
    if (triggerNewContact || triggerAttribute || triggerCampaignResponse) return true;
    return false;
  }, [
    name,
    description,
    segmentGoal,
    filterState,
    globalDnd,
    traiDnd,
    customDndFiles.length,
    suppressionIds.length,
    excludedSegmentIds.length,
    segmentMode,
    dynamicRefresh,
    triggerNewContact,
    triggerAttribute,
    triggerCampaignResponse,
  ]);

  const handleAudiencesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isDirty()) return;
    e.preventDefault();
    if (window.confirm('You have unsaved changes. Leave anyway?')) {
      navigate('/audiences');
    }
  };

  const totalSteps = STEPS.length;
  const isLastStep = currentStep === totalSteps;

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) return;
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      if (isDirty() && !window.confirm('You have unsaved changes. Leave anyway?')) return;
      navigate('/audiences/segments/new');
      return;
    }
    setDirection(-1);
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const conditionsSummary = useMemo(() => filterStateToPlainEnglish(filterState), [filterState]);

  const suppressionNames = useMemo(
    () => suppressionIds.map((id) => campaigns.find((c) => c.id === id)?.name ?? id),
    [suppressionIds, campaigns],
  );

  const excludedNames = useMemo(
    () => excludedSegmentIds.map((id) => segments.find((s) => s.id === id)?.name ?? id),
    [excludedSegmentIds, segments],
  );

  const handleSave = () => {
    const est = previewEstimate;
    const reach = buildReachabilityFromEstimate(est);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      segmentGoal: segmentGoal || undefined,
      filter: filterState,
      globalDnd,
      traiDnd,
      customDndFiles,
      suppressionIds,
      excludedSegmentIds,
      segmentMode,
      dynamicRefresh: segmentMode === 'dynamic' ? dynamicRefresh : undefined,
      triggers: {
        newContact: triggerNewContact,
        attributeChange: triggerAttribute,
        campaignResponse: triggerCampaignResponse,
      },
    };
    const seg: Segment = {
      id: rid(),
      name: name.trim() || 'Untitled segment',
      description: description.trim() || '—',
      size: est,
      segmentSource: 'rule-based',
      creationSource: 'filter',
      segmentGoal: segmentGoal ? String(segmentGoal) : undefined,
      filters: JSON.stringify(payload).slice(0, 2000),
      reachability: reach,
      lastUpdated: new Date().toISOString(),
      usedInCampaigns: [],
    };
    navigate('/audiences', { state: { savedSegment: seg, highlightSegmentId: seg.id } });
  };

  const onDndFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setCustomDndFiles((prev) => [...prev, ...Array.from(files).map((f) => f.name)]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/audiences"
          onClick={handleAudiencesClick}
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-cyan hover:underline"
        >
          ← Audiences
        </Link>
        <PageHeader title="Create Segment" subtitle="Audiences / Filter synced contacts" />
      </div>

      <div className="rounded-xl bg-white p-6 ring-1 ring-[#E5E7EB]">
        <StepNav currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-[#E5E7EB]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="p-6"
              >
                {currentStep === 1 && (
                  <div className="mx-auto max-w-2xl space-y-5">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-text-primary">Segment name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. High DPD Recovery — North India"
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-text-primary">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Describe who is in this segment and why"
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-text-primary">Segment goal</label>
                      <select
                        value={segmentGoal}
                        onChange={(e) => setSegmentGoal(e.target.value as SegmentGoal | '')}
                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                      >
                        <option value="">Select goal…</option>
                        {SEGMENT_GOALS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-2">
                    <h2 className="text-base font-semibold text-text-primary">Define conditions</h2>
                    <p className="text-sm text-text-secondary">Add filters to define who belongs in this segment</p>
                    <div className="mt-4">
                      <ConditionBuilder state={filterState} onChange={setFilterState} hideIntro />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">Exclusions</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Define who should be excluded from this segment
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                      <h3 className="text-sm font-semibold text-text-primary">DND List</h3>
                      <label className="mt-3 flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={globalDnd}
                          onChange={(e) => setGlobalDnd(e.target.checked)}
                          className="mt-1 rounded border-[#D1D5DB]"
                        />
                        <div>
                          <p className="text-sm font-medium text-text-primary">Apply Global DND List</p>
                          <p className="text-xs text-text-secondary">
                            Contacts who have opted out of all communications
                          </p>
                        </div>
                      </label>
                      <label className="mt-3 flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={traiDnd}
                          onChange={(e) => setTraiDnd(e.target.checked)}
                          className="mt-1 rounded border-[#D1D5DB]"
                        />
                        <div>
                          <p className="text-sm font-medium text-text-primary">Apply TRAI DND Scrub</p>
                          <p className="text-xs text-text-secondary">
                            Regulatory DND registry — mandatory for outbound calls and SMS
                          </p>
                        </div>
                      </label>
                      <input
                        ref={dndInputRef}
                        type="file"
                        accept=".csv"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          onDndFiles(e.target.files);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => dndInputRef.current?.click()}
                        className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-text-primary hover:bg-[#F9FAFB]"
                      >
                        <Upload size={14} />+ Upload Custom DND List
                      </button>
                      {customDndFiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {customDndFiles.map((fn) => (
                            <span
                              key={fn}
                              className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-medium text-text-secondary"
                            >
                              {fn}
                              <button
                                type="button"
                                className="text-text-secondary hover:text-red-600"
                                onClick={() => setCustomDndFiles((prev) => prev.filter((x) => x !== fn))}
                                aria-label={`Remove ${fn}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">Suppress contacts from campaigns</h3>
                      <p className="mt-1 text-xs text-text-secondary">
                        Exclude contacts who already received or responded to specific campaigns
                      </p>
                      <select
                        className="mt-3 w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                        value=""
                        onChange={(e) => {
                          const id = e.target.value;
                          if (id && !suppressionIds.includes(id)) {
                            setSuppressionIds((s) => [...s, id]);
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">Add campaign…</option>
                        {campaigns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {suppressionIds.map((id) => {
                          const c = campaigns.find((x) => x.id === id);
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[11px] font-medium"
                            >
                              {c?.name ?? id}
                              <button
                                type="button"
                                className="hover:text-red-600"
                                onClick={() => setSuppressionIds((s) => s.filter((x) => x !== id))}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">Exclude contacts in other segments</h3>
                      <select
                        className="mt-3 w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                        value=""
                        onChange={(e) => {
                          const id = e.target.value;
                          if (id && !excludedSegmentIds.includes(id)) {
                            setExcludedSegmentIds((s) => [...s, id]);
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">Add segment…</option>
                        {segments.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {excludedSegmentIds.map((id) => {
                          const s = segments.find((x) => x.id === id);
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[11px] font-medium"
                            >
                              {s?.name ?? id}
                              <button
                                type="button"
                                className="hover:text-red-600"
                                onClick={() => setExcludedSegmentIds((x) => x.filter((y) => y !== id))}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8">
                    <h2 className="text-base font-semibold text-text-primary">Segment Settings</h2>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Segment type</p>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E7EB] p-4">
                        <input
                          type="radio"
                          name="segMode"
                          checked={segmentMode === 'static'}
                          onChange={() => setSegmentMode('static')}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">Snapshot</p>
                          <p className="text-sm text-text-secondary">
                            A frozen list of contacts matching conditions at time of creation. Does not update
                            automatically.
                          </p>
                        </div>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E7EB] p-4">
                        <input
                          type="radio"
                          name="segMode"
                          checked={segmentMode === 'dynamic'}
                          onChange={() => setSegmentMode('dynamic')}
                          className="mt-1"
                        />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">Auto-updating</p>
                          <p className="text-sm text-text-secondary">
                            Refreshes automatically. New contacts matching your conditions are added; contacts who no
                            longer match are removed.
                          </p>
                          {segmentMode === 'dynamic' && (
                            <div className="mt-4 space-y-3">
                              <label className="block text-xs font-medium text-text-secondary">Refresh frequency</label>
                              <select
                                value={dynamicRefresh}
                                onChange={(e) => setDynamicRefresh(e.target.value as DynamicRefresh)}
                                className="w-full max-w-xs rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
                              >
                                <option value="hourly">Hourly</option>
                                <option value="every_6_hours">Every 6 hours</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                              </select>
                              <p className="text-xs font-medium text-text-secondary">Trigger events (optional)</p>
                              <div className="flex flex-col gap-2 text-sm">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={triggerNewContact}
                                    onChange={(e) => setTriggerNewContact(e.target.checked)}
                                    className="rounded border-[#D1D5DB]"
                                  />
                                  New contact added to data source
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={triggerAttribute}
                                    onChange={(e) => setTriggerAttribute(e.target.checked)}
                                    className="rounded border-[#D1D5DB]"
                                  />
                                  Contact attribute changes (e.g. DPD bucket changes)
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={triggerCampaignResponse}
                                    onChange={(e) => setTriggerCampaignResponse(e.target.checked)}
                                    className="rounded border-[#D1D5DB]"
                                  />
                                  Campaign response event
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="mx-auto max-w-2xl space-y-6">
                    <h2 className="text-base font-semibold text-text-primary">Review & Save</h2>
                    <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        Segment overview
                      </p>
                      <p className="mt-2 text-sm font-semibold text-text-primary">{name || '—'}</p>
                      <p className="mt-1 text-sm text-text-secondary">{description || '—'}</p>
                      <p className="mt-2 text-xs text-text-secondary">
                        Goal: <span className="font-medium text-text-primary">{segmentGoal || '—'}</span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#E5E7EB] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        Conditions summary
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-text-primary">{conditionsSummary}</p>
                    </div>
                    <div className="rounded-lg border border-[#E5E7EB] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        Exclusions summary
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                        <li>Global DND: {globalDnd ? 'Applied' : 'Not applied'}</li>
                        <li>TRAI DND: {traiDnd ? 'Applied' : 'Not applied'}</li>
                        <li>Custom DND lists: {customDndFiles.length ? customDndFiles.join(', ') : 'None'}</li>
                        <li>
                          Suppressed campaigns:{' '}
                          {suppressionNames.length ? suppressionNames.join(', ') : 'None'}
                        </li>
                        <li>Excluded segments: {excludedNames.length ? excludedNames.join(', ') : 'None'}</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#E5E7EB] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        Segment settings
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                        <li>
                          Type:{' '}
                          <span className="font-medium text-text-primary">
                            {segmentMode === 'static' ? 'Static' : 'Dynamic'}
                            {segmentMode === 'dynamic' &&
                              ` · ${
                                dynamicRefresh === 'every_6_hours'
                                  ? 'Every 6 hours'
                                  : dynamicRefresh.charAt(0).toUpperCase() + dynamicRefresh.slice(1)
                              }`}
                          </span>
                        </li>
                        {(triggerNewContact || triggerAttribute || triggerCampaignResponse) &&
                          segmentMode === 'dynamic' && (
                            <li>
                              Triggers:{' '}
                              {[
                                triggerNewContact && 'New contact',
                                triggerAttribute && 'Attribute change',
                                triggerCampaignResponse && 'Campaign response',
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </li>
                          )}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-[#F9FAFB]"
            >
              Back
            </button>
            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !name.trim()}
                className="inline-flex items-center rounded-md bg-cyan px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center rounded-md bg-cyan px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Save Segment
              </button>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
          <SegmentPreviewPanel estimate={previewEstimate} variant="filter" />
        </div>
      </div>
    </div>
  );
}
