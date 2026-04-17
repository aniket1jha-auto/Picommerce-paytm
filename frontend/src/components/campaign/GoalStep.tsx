'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { CampaignData, CampaignGoal } from './CampaignWizard';

interface GoalStepProps {
  campaignData: CampaignData;
  onUpdate: (updates: Partial<CampaignData>) => void;
}

const PRESET_EVENTS = [
  { value: 'kyc_completed', label: 'KYC Completed' },
  { value: 'transaction_completed', label: 'Transaction Completed' },
  { value: 'loan_applied', label: 'Loan Applied' },
  { value: 'insurance_renewed', label: 'Insurance Renewed' },
  { value: 'app_opened', label: 'App Opened' },
  { value: 'subscription_activated', label: 'Subscription Activated' },
  { value: 'payment_collected', label: 'Payment Collected' },
  { value: 'document_submitted', label: 'Document Submitted' },
  { value: 'cart_purchase', label: 'Cart Purchase' },
  { value: 'referral_completed', label: 'Referral Completed' },
] as const;

function generateId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function GoalCard({
  goal,
  index,
  total,
  onUpdate,
  onRemove,
}: {
  goal: CampaignGoal;
  index: number;
  total: number;
  onUpdate: (updated: CampaignGoal) => void;
  onRemove: () => void;
}) {
  const isCustomEvent = goal.eventName !== '' && !PRESET_EVENTS.some((e) => e.value === goal.eventName);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F3F4F6] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/10 text-[11px] font-bold text-cyan">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-text-primary">
            Goal {index + 1}
          </span>
          {goal.eventName && (
            <span className="rounded bg-[#F3F4F6] px-2 py-0.5 font-mono text-[11px] text-text-secondary">
              {goal.eventName}
            </span>
          )}
        </div>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1 text-text-secondary transition-colors hover:bg-[#FEE2E2] hover:text-[#EF4444]"
            aria-label="Remove goal"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Conversion Event */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Conversion Event
          </label>
          <select
            value={isCustomEvent ? '__custom__' : (goal.eventName || '')}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__custom__') {
                onUpdate({ ...goal, eventName: '' });
              } else {
                onUpdate({ ...goal, eventName: val });
              }
            }}
            className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
          >
            <option value="" disabled>Select a conversion event…</option>
            {PRESET_EVENTS.map((ev) => (
              <option key={ev.value} value={ev.value}>{ev.label}</option>
            ))}
            <option value="__custom__">Custom event…</option>
          </select>

          {(isCustomEvent || goal.eventName === '') && (
            <input
              type="text"
              value={isCustomEvent ? goal.eventName : ''}
              onChange={(e) => onUpdate({ ...goal, eventName: e.target.value })}
              placeholder="Enter custom event name (e.g., referral_completed)"
              className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            />
          )}
        </div>

      </div>
    </div>
  );
}

export function GoalStep({ campaignData, onUpdate }: GoalStepProps) {
  const goalData = campaignData.goal;

  function updateGoals(goals: CampaignGoal[]) {
    onUpdate({ goal: { ...goalData, goals } });
  }

  function addGoal() {
    updateGoals([
      ...goalData.goals,
      {
        id: generateId(),
        eventName: '',
        segmentType: 'batch',
        description: '',
      },
    ]);
  }

  function updateGoal(id: string, updated: CampaignGoal) {
    updateGoals(goalData.goals.map((g) => (g.id === id ? updated : g)));
  }

  function removeGoal(id: string) {
    updateGoals(goalData.goals.filter((g) => g.id !== id));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onUpdate({ name: e.target.value });
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onUpdate({ goal: { ...goalData, description: e.target.value } });
  }

  function handleOperatorChange(op: 'and' | 'or') {
    onUpdate({ goal: { ...goalData, goalsOperator: op } });
  }


  // Auto-add first goal if none exist
  if (goalData.goals.length === 0) {
    addGoal();
    return null; // re-render with the goal added
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Campaign Goal</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Name your campaign, define what you want to achieve, and set conversion goals.
        </p>
      </div>

      {/* Campaign Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="campaign-name" className="text-sm font-medium text-text-primary">
          Campaign Name
        </label>
        <input
          id="campaign-name"
          type="text"
          value={campaignData.name}
          onChange={handleNameChange}
          placeholder="e.g., KYC Re-engagement — Metro High-LTV"
          className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
        />
      </div>

      {/* Campaign Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="goal-description" className="text-sm font-medium text-text-primary">
          Campaign Description
        </label>
        <textarea
          id="goal-description"
          rows={3}
          value={goalData.description}
          onChange={handleDescriptionChange}
          placeholder="Describe what you want to achieve with this campaign. e.g., 'Re-engage 45K dormant high-LTV users who haven't transacted in 60+ days.'"
          className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
        />
      </div>

      {/* Goals List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Conversion Goals</h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              Define the events that signal success. Each goal can be triggered in real-time or evaluated in batches.
            </p>
          </div>
          <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-semibold text-text-secondary">
            {goalData.goals.length} {goalData.goals.length === 1 ? 'goal' : 'goals'}
          </span>
        </div>

        {goalData.goals.map((goal, idx) => (
          <div key={goal.id}>
            <GoalCard
              goal={goal}
              index={idx}
              total={goalData.goals.length}
              onUpdate={(updated) => updateGoal(goal.id, updated)}
              onRemove={() => removeGoal(goal.id)}
            />
            {/* AND/OR toggle between goals */}
            {idx < goalData.goals.length - 1 && (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="h-px flex-1 bg-[#E5E7EB]" />
                <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-0.5">
                  <button
                    type="button"
                    onClick={() => handleOperatorChange('and')}
                    className={[
                      'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                      goalData.goalsOperator === 'and'
                        ? 'bg-white text-cyan shadow-sm'
                        : 'text-text-secondary hover:text-text-primary',
                    ].join(' ')}
                  >
                    AND
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOperatorChange('or')}
                    className={[
                      'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                      goalData.goalsOperator === 'or'
                        ? 'bg-white text-cyan shadow-sm'
                        : 'text-text-secondary hover:text-text-primary',
                    ].join(' ')}
                  >
                    OR
                  </button>
                </div>
                <div className="h-px flex-1 bg-[#E5E7EB]" />
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addGoal}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D1D5DB] bg-white px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-cyan hover:bg-cyan/5 hover:text-cyan"
        >
          <Plus size={16} />
          Add Another Goal
        </button>
      </div>

    </div>
  );
}
