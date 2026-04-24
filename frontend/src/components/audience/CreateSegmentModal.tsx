import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Segment, SegmentSource, Campaign } from '@/types';
import { formatCount } from '@/utils/format';
import {
  ConditionBuilder,
  type FilterState,
  defaultFilterState,
  cloneFilterState,
} from '@/components/audience/ConditionBuilder';
import {
  SEGMENT_CHANNEL_META,
} from '@/data/segmentBuilderConstants';
import {
  buildReachabilityFromEstimate,
  estimateFromFilterState,
  SAMPLE_PREVIEW_CONTACTS,
  AI_WHY_BULLETS,
  defaultAiFilterState,
} from '@/components/audience/segmentPreviewUtils';

interface CreateSegmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (segment: Segment) => void;
  campaigns: Campaign[];
}

function rid(): string {
  return `seg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function SegmentPreviewPanel({ estimate }: { estimate: number }) {
  const reach = useMemo(() => buildReachabilityFromEstimate(estimate), [estimate]);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,41,112,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Live preview</p>
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
        onClick={() => {}}
        className="mt-4 text-xs font-medium text-cyan hover:underline"
      >
        Preview sample contacts
      </button>

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
    </div>
  );
}

function ChoiceScreen({
  onPick,
}: {
  onPick: (mode: 'rule' | 'ai') => void;
}) {
  return (
    <div className="px-6 py-6">
      <h2 className="text-center text-lg font-semibold text-text-primary">Create a segment</h2>
      <p className="mt-1 text-center text-sm text-text-secondary">Choose how you want to build it</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onPick('rule')}
          className="flex flex-col items-start rounded-xl border-2 border-[#E5E7EB] bg-white p-6 text-left shadow-[0_1px_3px_rgba(0,41,112,0.08)] transition-all hover:border-cyan hover:shadow-[0_4px_12px_rgba(0,41,112,0.12)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EFF6FF]">
            <Filter size={24} className="text-[#3B82F6]" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-primary">Rule-based segment</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Filter your audience manually using conditions and logic
          </p>
          <span className="mt-6 text-sm font-semibold text-cyan">Build manually</span>
        </button>
        <button
          type="button"
          onClick={() => onPick('ai')}
          className="flex flex-col items-start rounded-xl border-2 border-[#E5E7EB] bg-white p-6 text-left shadow-[0_1px_3px_rgba(0,41,112,0.08)] transition-all hover:border-cyan hover:shadow-[0_4px_12px_rgba(0,41,112,0.12)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/15 to-purple-50">
            <Sparkles size={24} className="text-cyan" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-text-primary">AI-suggested segment</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Describe your goal and let AI find the right audience
          </p>
          <span className="mt-6 text-sm font-semibold text-cyan">Use AI</span>
        </button>
      </div>
    </div>
  );
}

type SegmentMode = 'static' | 'dynamic';
type DynamicRefresh = 'daily' | 'on_trigger';

function buildSegmentPayload(
  source: SegmentSource,
  name: string,
  description: string,
  filter: FilterState,
  mode: SegmentMode,
  dynamicRefresh: DynamicRefresh,
  globalDnd: boolean,
  traiDnd: boolean,
): Segment {
  const est = estimateFromFilterState(filter);
  const reach = buildReachabilityFromEstimate(est);
  const filtersSummary = JSON.stringify({
    filter,
    mode,
    dynamicRefresh,
    globalDnd,
    traiDnd,
  }).slice(0, 500);
  return {
    id: rid(),
    name: name.trim() || 'Untitled segment',
    description: description.trim() || '—',
    size: est,
    segmentSource: source,
    filters: filtersSummary,
    reachability: reach,
    lastUpdated: new Date().toISOString(),
  };
}

export function CreateSegmentModal({ open, onClose, onSave, campaigns }: CreateSegmentModalProps) {
  const [view, setView] = useState<'choice' | 'rule' | 'ai'>('choice');

  // Rule flow
  const [ruleStep, setRuleStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filterState, setFilterState] = useState<FilterState>(() => defaultFilterState());
  const [exclusionsOpen, setExclusionsOpen] = useState(false);
  const [globalDnd, setGlobalDnd] = useState(true);
  const [traiDnd, setTraiDnd] = useState(true);
  const [suppressionIds, setSuppressionIds] = useState<string[]>([]);
  const [segmentMode, setSegmentMode] = useState<SegmentMode>('dynamic');
  const [dynamicRefresh, setDynamicRefresh] = useState<DynamicRefresh>('daily');

  // AI flow
  const [aiStep, setAiStep] = useState(1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiName, setAiName] = useState('High-intent EMI recovery candidates');
  const [aiDescription, setAiDescription] = useState(
    'Users with rising DPD and positive WhatsApp engagement, outstanding above ₹5,000.',
  );
  const [aiFilter, setAiFilter] = useState<FilterState>(() => defaultAiFilterState());
  const [aiRulesOpen, setAiRulesOpen] = useState(false);

  const previewEstimate = useMemo(() => estimateFromFilterState(filterState), [filterState]);
  const aiEstimate = useMemo(() => estimateFromFilterState(aiFilter), [aiFilter]);

  useEffect(() => {
    if (!open) {
      setView('choice');
      setRuleStep(1);
      setAiStep(1);
      setName('');
      setDescription('');
      setFilterState(defaultFilterState());
      setAiPrompt('');
      setAiLoading(false);
      setSuppressionIds([]);
      setExclusionsOpen(false);
      setAiRulesOpen(false);
      setAiFilter(defaultAiFilterState());
    }
  }, [open]);

  function runAiGenerate() {
    setAiLoading(true);
    window.setTimeout(() => {
      setAiLoading(false);
      setAiStep(2);
    }, 900);
  }

  function handleSaveRule() {
    const seg = buildSegmentPayload('rule-based', name, description, filterState, segmentMode, dynamicRefresh, globalDnd, traiDnd);
    onSave(seg);
    onClose();
  }

  function handleSaveAi() {
    const seg = buildSegmentPayload('ai', aiName, aiDescription, aiFilter, segmentMode, dynamicRefresh, globalDnd, traiDnd);
    onSave(seg);
    onClose();
  }

  function handleEditAiToRule() {
    setFilterState(cloneFilterState(aiFilter));
    setView('rule');
    setRuleStep(2);
  }

  const segmentTypeRadios = (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-primary">Segment type</label>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E7EB] p-4">
        <input
          type="radio"
          name="segMode"
          checked={segmentMode === 'static'}
          onChange={() => setSegmentMode('static')}
          className="mt-1"
        />
        <div>
          <p className="text-sm font-medium text-text-primary">Static</p>
          <p className="text-sm text-text-secondary">
            Snapshot of current matches — list is frozen at creation
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
          <p className="text-sm font-medium text-text-primary">Dynamic</p>
          <p className="text-sm text-text-secondary">
            Auto-refreshes — new contacts matching conditions are added automatically
          </p>
          {segmentMode === 'dynamic' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-text-secondary">Refresh:</span>
              {(['daily', 'on_trigger'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDynamicRefresh(r)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    dynamicRefresh === r ? 'bg-cyan text-white' : 'bg-[#F3F4F6] text-text-secondary'
                  }`}
                >
                  {r === 'daily' ? 'Daily' : 'On trigger event'}
                </button>
              ))}
            </div>
          )}
        </div>
      </label>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-6xl rounded-lg bg-white shadow-xl"
            style={{ boxShadow: '0 4px 12px rgba(0,41,112,0.12)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {view === 'choice' && 'New segment'}
                {view === 'rule' && `Rule-based segment · Step ${ruleStep} of 4`}
                {view === 'ai' && `AI segment · Step ${aiStep} of 3`}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-text-secondary hover:bg-[#F3F4F6]"
              >
                <X size={20} />
              </button>
            </div>

            {view === 'choice' && <ChoiceScreen onPick={(m) => { setView(m); if (m === 'rule') setRuleStep(1); else setAiStep(1); }} />}

            {view === 'rule' && (
              <div className="flex flex-col gap-6 px-5 py-6 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 space-y-6">
                  {ruleStep === 1 && (
                    <>
                      <div>
                        <h3 className="text-xl font-semibold text-text-primary">Segment details</h3>
                        <p className="mt-1 text-sm text-text-secondary">Name and describe this segment</p>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text-primary">
                          Segment name *
                        </label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. High-risk EMI accounts"
                          className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text-primary">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional context for your team"
                          rows={4}
                          className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                        />
                      </div>
                    </>
                  )}
                  {ruleStep === 2 && (
                    <ConditionBuilder state={filterState} onChange={setFilterState} />
                  )}
                  {ruleStep === 3 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setExclusionsOpen(!exclusionsOpen)}
                        className="flex w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-left"
                      >
                        <span className="text-sm font-semibold text-text-primary">Exclude contacts</span>
                        {exclusionsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {exclusionsOpen && (
                        <div className="mt-3 space-y-4 rounded-lg border border-[#E5E7EB] p-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={globalDnd}
                              onChange={(e) => setGlobalDnd(e.target.checked)}
                            />
                            Global DND (recommended)
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={traiDnd}
                              onChange={(e) => setTraiDnd(e.target.checked)}
                            />
                            TRAI DND scrub
                          </label>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-text-primary">
                              Campaign suppression
                            </label>
                            <p className="mb-2 text-xs text-text-secondary">
                              Exclude users who responded to these campaigns
                            </p>
                            <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-[#E5E7EB] p-2">
                              {campaigns.map((c) => (
                                <label key={c.id} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={suppressionIds.includes(c.id)}
                                    onChange={() =>
                                      setSuppressionIds((prev) =>
                                        prev.includes(c.id)
                                          ? prev.filter((x) => x !== c.id)
                                          : [...prev, c.id],
                                      )
                                    }
                                  />
                                  {c.name}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {!exclusionsOpen && (
                        <p className="mt-2 text-xs text-text-secondary">
                          Exclusions collapsed — Global DND and TRAI scrub on by default
                        </p>
                      )}
                    </div>
                  )}
                  {ruleStep === 4 && segmentTypeRadios}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (ruleStep === 1) {
                          setView('choice');
                        } else {
                          setRuleStep((s) => s - 1);
                        }
                      }}
                      className="rounded-md border border-[#E5E7EB] px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-50"
                    >
                      {ruleStep === 1 ? 'Cancel' : 'Back'}
                    </button>
                    <div className="flex gap-2">
                      {ruleStep < 4 ? (
                        <button
                          type="button"
                          disabled={ruleStep === 1 && !name.trim()}
                          onClick={() => setRuleStep((s) => s + 1)}
                          className="rounded-md bg-cyan px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan/90 disabled:opacity-40"
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSaveRule}
                          className="rounded-md bg-cyan px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan/90"
                        >
                          Save Segment
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {ruleStep >= 2 && (
                  <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
                    <SegmentPreviewPanel estimate={previewEstimate} />
                  </div>
                )}
              </div>
            )}

            {view === 'ai' && (
              <div className="space-y-6 px-5 py-6">
                {aiStep === 1 && aiLoading && (
                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
                    <p className="text-sm font-medium text-text-secondary">Generating segment…</p>
                  </div>
                )}

                {aiStep === 1 && !aiLoading && (
                  <>
                    <div className="mx-auto max-w-2xl text-center">
                      <h3 className="text-xl font-semibold text-text-primary">Describe your audience</h3>
                      <p className="mt-1 text-sm text-text-secondary">We&apos;ll suggest a segment definition</p>
                    </div>
                    <div className="mx-auto max-w-2xl">
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={8}
                        placeholder="Describe who you want to reach and why..."
                        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-4 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                      />
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {[
                          'Find users most likely to pay overdue EMIs',
                          'Identify loan-eligible users who haven\'t applied',
                          'Re-engage dormant users with high wallet balance',
                          'Find new merchants with incomplete activation',
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setAiPrompt(chip)}
                            className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-cyan hover:text-cyan"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={!aiPrompt.trim() || aiLoading}
                        onClick={runAiGenerate}
                        className="mt-6 w-full rounded-md bg-cyan py-3 text-sm font-medium text-white hover:bg-cyan/90 disabled:opacity-40"
                      >
                        Generate Segment
                      </button>
                    </div>
                  </>
                )}

                {aiStep === 2 && (
                  <div className="relative flex flex-col gap-6 lg:flex-row">
                    {aiLoading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/85">
                        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
                        <p className="text-sm font-medium text-text-secondary">Regenerating…</p>
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-6">
                      <div className="rounded-lg border border-[#E5E7EB] p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          Suggested segment
                        </p>
                        <input
                          value={aiName}
                          onChange={(e) => setAiName(e.target.value)}
                          className="mt-2 w-full border-b border-transparent text-lg font-semibold text-text-primary outline-none focus:border-cyan"
                        />
                        <textarea
                          value={aiDescription}
                          onChange={(e) => setAiDescription(e.target.value)}
                          rows={3}
                          className="mt-2 w-full resize-none text-sm text-text-secondary outline-none"
                        />
                        <p className="mt-3 text-sm font-semibold text-text-primary">
                          ~{formatCount(aiEstimate)} contacts
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {SEGMENT_CHANNEL_META.map(({ key, label, color }) => {
                            const reach = buildReachabilityFromEstimate(aiEstimate);
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1"
                              >
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-xs text-text-secondary">{label}</span>
                                <span className="text-xs font-semibold">
                                  {formatCount((reach as Record<string, number>)[key] ?? 0)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-text-primary">Why this segment</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
                          {AI_WHY_BULLETS.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setAiRulesOpen(!aiRulesOpen)}
                          className="flex items-center gap-2 text-sm font-medium text-cyan hover:underline"
                        >
                          View conditions →
                          {aiRulesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {aiRulesOpen && (
                          <div className="mt-3">
                            <ConditionBuilder state={aiFilter} onChange={setAiFilter} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full shrink-0 lg:w-80">
                      <SegmentPreviewPanel estimate={aiEstimate} />
                    </div>
                  </div>
                )}

                {aiStep === 3 && <div className="max-w-2xl space-y-4">{segmentTypeRadios}</div>}

                {view === 'ai' && aiStep === 1 && !aiLoading && (
                  <div className="flex justify-between border-t border-[#E5E7EB] pt-4">
                    <button
                      type="button"
                      onClick={() => setView('choice')}
                      className="text-sm font-medium text-text-secondary hover:text-text-primary"
                    >
                      Back
                    </button>
                  </div>
                )}

                {view === 'ai' && aiStep === 2 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] px-5 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAiLoading(true);
                        window.setTimeout(() => setAiLoading(false), 800);
                      }}
                      className="rounded-md border border-[#E5E7EB] px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Regenerate
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleEditAiToRule}
                        className="rounded-md border border-[#E5E7EB] px-4 py-2 text-sm font-medium hover:bg-gray-50"
                      >
                        Edit conditions
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiStep(3)}
                        className="rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white hover:bg-cyan/90"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {view === 'ai' && aiStep === 3 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setAiStep(2)}
                      className="rounded-md border border-[#E5E7EB] px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAi}
                      className="rounded-md bg-cyan px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan/90"
                    >
                      Save Segment
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
