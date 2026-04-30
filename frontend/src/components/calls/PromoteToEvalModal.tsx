import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal, Button, Input, Textarea, useToast, cn } from '@/components/ui';
import { useEvalStore } from '@/store/evalStore';
import type { Call } from '@/types/call';
import type { TestCallScript } from '@/types/testCall';

/**
 * Promote-to-eval modal — Phase 4.6
 *
 * The marquee Phase-4 interaction. From a call drill-down, click "Promote to
 * eval test case" → this modal opens, pre-filled with sensible defaults
 * derived from the call:
 *
 *   - Test name (auto-suggested slug like 'kyc_aadhaar_otp_timeout')
 *   - Description (auto-suggested from the call's failure mode if any)
 *   - Per-turn input/fixed roles (defaults: user turns = input, agent turns = fixed)
 *   - Judge plan (auto-suggested based on what went wrong)
 *   - Expected outcome (defaults to score >= 0.8)
 *   - Tags (auto: agent use case, failure mode if any)
 *
 * On save, writes to the evalStore and shows a toast linking to the new case.
 * (The eval-case detail page lands in D.2.)
 */

interface Props {
  open: boolean;
  onClose: () => void;
  call: Call;
  script: TestCallScript;
  onPromoted: (evalCaseId: string) => void;
}

type ExpectedKind = 'pass_fail' | 'score_threshold';

export function PromoteToEvalModal({ open, onClose, call, script, onPromoted }: Props) {
  const createCase = useEvalStore((s) => s.createCase);
  const { toast } = useToast();

  /* ─── Auto-suggest defaults ──────────────────────────────────────────── */

  const failureCtx = useMemo(() => {
    const overrides = call.scriptOverrides?.toolCalls ?? {};
    for (const tc of script.turns.flatMap((t) => (t.kind === 'agent' ? t.toolCalls ?? [] : []))) {
      const ov = overrides[tc.id];
      const status = ov?.status ?? tc.status;
      if (status === 'failure') {
        return {
          toolName: tc.toolName,
          toolId: tc.toolId,
          errorMessage: ov?.errorMessage ?? tc.errorMessage ?? 'Tool call failed',
        };
      }
    }
    return null;
  }, [call, script]);

  const initialName = useMemo(() => {
    if (failureCtx) {
      // E.g. 'send_text' + 'timeout' → 'send_text_timeout'
      const reason = failureCtx.errorMessage.toLowerCase().includes('timeout')
        ? 'timeout'
        : 'failure';
      return `${script.id.replace(/-/g, '_')}_${failureCtx.toolId}_${reason}`;
    }
    return `${script.id.replace(/-/g, '_')}_regression_${call.id.slice(-4)}`;
  }, [call, script, failureCtx]);

  const initialDescription = useMemo(() => {
    if (failureCtx) {
      return `Verify the agent gracefully handles a ${failureCtx.toolName} failure (${failureCtx.errorMessage}) — without inventing information, and offering an appropriate fallback.`;
    }
    return `Regression test built from a real call. Verify the agent's behavior across the conversation matches the expected response.`;
  }, [failureCtx]);

  const initialJudgePlan = useMemo(() => {
    if (failureCtx) {
      return [
        `The agent must:`,
        `  - Acknowledge the ${failureCtx.toolName} failure without blaming the user.`,
        `  - Not invent information that the failed tool was supposed to provide.`,
        `  - Offer a sensible fallback (e.g. SMS the link, schedule a callback, transfer to a human).`,
        `  - Confirm the customer's preference and close politely.`,
      ].join('\n');
    }
    return [
      `The agent must:`,
      `  - Stay on intent throughout the conversation.`,
      `  - Comply with disclosure language (RBI, TRAI as applicable).`,
      `  - Hand off cleanly when asked.`,
    ].join('\n');
  }, [failureCtx]);

  const initialTags = useMemo(() => {
    const tags = [script.id];
    if (failureCtx) {
      tags.push('failure');
      if (failureCtx.errorMessage.toLowerCase().includes('timeout')) tags.push('timeout');
    }
    if (call.flags.length > 0) tags.push('flagged');
    return tags;
  }, [call, script, failureCtx]);

  /* ─── State ──────────────────────────────────────────────────────────── */

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [judgePlan, setJudgePlan] = useState(initialJudgePlan);
  const [expectedKind, setExpectedKind] = useState<ExpectedKind>('score_threshold');
  const [scoreThreshold, setScoreThreshold] = useState(0.8);
  const [tagsInput, setTagsInput] = useState(initialTags.join(', '));
  const [turnRoles, setTurnRoles] = useState<Array<'input' | 'fixed'>>(() =>
    script.turns.map((t) => (t.kind === 'user' ? 'input' : 'fixed')),
  );

  const canSave = name.trim().length > 2 && judgePlan.trim().length > 8;

  function handleSave() {
    if (!canSave) return;
    const newCase = createCase({
      agentId: call.agentId,
      name: name.trim(),
      description: description.trim(),
      source: 'promoted_from_call',
      sourceCallId: call.id,
      scriptId: call.scriptId,
      turnRoles,
      judgePlan: judgePlan.trim(),
      expectedOutcome:
        expectedKind === 'pass_fail'
          ? { kind: 'pass_fail' }
          : { kind: 'score_threshold', threshold: scoreThreshold },
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    toast({
      kind: 'success',
      title: 'Eval case added',
      body: `"${newCase.name}" saved to ${call.agentName}'s eval suite.`,
    });
    onPromoted(newCase.id);
    onClose();
  }

  function toggleRole(idx: number) {
    setTurnRoles((roles) => roles.map((r, i) => (i === idx ? (r === 'input' ? 'fixed' : 'input') : r)));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          Promote call to eval test case
        </span>
      }
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!canSave} onClick={handleSave}>
            Add to eval suite
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Test name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          helper="Short, lowercase slug. Used for the eval suite list."
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          helper="What this test validates. Stays out of the agent's view; for human reviewers."
        />

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-text-secondary">
            Mock conversation ({script.turns.length} turns)
          </span>
          <p className="text-[11px] text-text-tertiary -mt-1">
            Imported from <span className="font-mono">{call.id}</span>. Toggle each turn:{' '}
            <span className="text-info font-medium">input</span> = the user's words drive the eval;{' '}
            <span className="text-accent font-medium">fixed</span> = the judge expects the agent to respond like this.
          </p>
          <div className="rounded-md border border-border-subtle bg-surface-sunken p-2 max-h-[200px] overflow-y-auto flex flex-col gap-1">
            {script.turns.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleRole(i)}
                className={cn(
                  'group flex items-start gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors',
                  turnRoles[i] === 'input'
                    ? 'bg-info-soft hover:bg-info-soft/80'
                    : 'bg-accent-soft hover:bg-accent-soft/80',
                )}
              >
                <span
                  className={cn(
                    'shrink-0 inline-flex items-center justify-center rounded-sm w-12 h-4 text-[10px] font-semibold uppercase tracking-wider',
                    turnRoles[i] === 'input' ? 'bg-info text-text-on-accent' : 'bg-accent text-text-on-accent',
                  )}
                >
                  {turnRoles[i]}
                </span>
                <span className="text-[10px] uppercase text-text-tertiary tabular-nums w-12 shrink-0">
                  {t.kind}
                </span>
                <span className="text-text-primary line-clamp-2">{t.text}</span>
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Judge plan"
          value={judgePlan}
          onChange={(e) => setJudgePlan(e.target.value)}
          rows={5}
          helper="Plain-English criteria the LLM-as-judge will score against. Auto-suggested from the call's failure mode."
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-text-secondary">Expected outcome</span>
            <div className="grid grid-cols-2 gap-1 rounded-md border border-border-default bg-surface-sunken p-1">
              <button
                type="button"
                onClick={() => setExpectedKind('pass_fail')}
                className={cn(
                  'rounded px-2 py-1 text-[12px] font-medium',
                  expectedKind === 'pass_fail'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary',
                )}
              >
                Strict pass / fail
              </button>
              <button
                type="button"
                onClick={() => setExpectedKind('score_threshold')}
                className={cn(
                  'rounded px-2 py-1 text-[12px] font-medium',
                  expectedKind === 'score_threshold'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary',
                )}
              >
                Score threshold
              </button>
            </div>
          </div>

          {expectedKind === 'score_threshold' && (
            <Input
              label="Pass when score ≥"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={scoreThreshold}
              onChange={(e) => setScoreThreshold(Number(e.target.value))}
            />
          )}
        </div>

        <Input
          label="Tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          helper="Comma-separated. Used for filtering in the eval suite."
        />
      </div>
    </Modal>
  );
}
