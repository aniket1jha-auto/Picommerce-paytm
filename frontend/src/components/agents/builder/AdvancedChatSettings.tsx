import { useState, useRef } from 'react';
import type {
  AgentConfiguration,
  ChatAgentAdvancedSettings,
  ChatOptOutBehavior,
  ChatSessionExpiryAction,
} from '@/types/agent';

const DEFAULT_ADV: ChatAgentAdvancedSettings = {
  sessionExpiryAction: 'template',
  fallbackMessage:
    "I'm sorry, I didn't quite understand that. Could you rephrase, or type HELP to see what I can assist with.",
  maxFallbackAttempts: 2,
  stopKeywords: ['STOP', 'UNSUBSCRIBE', 'OPT OUT'],
  optOutBehavior: 'confirm',
  optOutConfirmationMessage:
    "You've been unsubscribed from our messages. Reply START to re-subscribe or call [number] for support.",
  escalationKeywords: ['legal', 'RBI', 'fraud', 'complaint', 'manager'],
};

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  onPrev: () => void;
}

function ChipInput({
  values,
  onChange,
  placeholder,
  normalize,
  showAddKeywordLink,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Normalize before store + dedupe (e.g. lowercase keywords) */
  normalize?: (v: string) => string;
  showAddKeywordLink?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const norm = normalize ?? ((s: string) => s);

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-text-primary ring-1 ring-[#E5E7EB]"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded px-0.5 text-text-secondary hover:text-red-600"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && draft.trim()) {
            e.preventDefault();
            const normalized = norm(draft.trim());
            const exists = values.some((v) => norm(v).toLowerCase() === normalized.toLowerCase());
            if (!exists) onChange([...values, normalized]);
            setDraft('');
          }
        }}
        placeholder={placeholder ?? 'Type and press Enter'}
        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
      />
      {showAddKeywordLink && (
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="text-xs font-medium text-cyan hover:underline"
        >
          + Add keyword
        </button>
      )}
    </div>
  );
}

export function AdvancedChatSettings({ config, onSave, onNext, onPrev }: Props) {
  const base = config.chatAdvancedSettings ?? DEFAULT_ADV;
  const [sessionExpiryAction, setSessionExpiryAction] = useState<ChatSessionExpiryAction>(
    base.sessionExpiryAction,
  );
  const [fallbackMessage, setFallbackMessage] = useState(base.fallbackMessage);
  const [maxFallbackAttempts, setMaxFallbackAttempts] = useState(base.maxFallbackAttempts);
  const [stopKeywords, setStopKeywords] = useState<string[]>(base.stopKeywords);
  const [optOutBehavior, setOptOutBehavior] = useState<ChatOptOutBehavior>(base.optOutBehavior);
  const [optOutConfirmationMessage, setOptOutConfirmationMessage] = useState(
    base.optOutConfirmationMessage,
  );
  const [escalationKeywords, setEscalationKeywords] = useState<string[]>(
    base.escalationKeywords,
  );

  const showWhatsAppSession = config.chatChannel === 'whatsapp';

  const handleNext = () => {
    onSave({
      chatAdvancedSettings: {
        sessionExpiryAction,
        fallbackMessage,
        maxFallbackAttempts,
        stopKeywords,
        optOutBehavior,
        optOutConfirmationMessage,
        escalationKeywords,
      },
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Advanced Settings</h2>
        <p className="text-sm text-text-secondary">
          Configure session behavior, fallback handling, and opt-out rules
        </p>
      </div>

      <div className="space-y-6">
        {showWhatsAppSession && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Session Settings</h3>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-medium text-amber-900 mb-1">
                WhatsApp 24-hour session window
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Outside the 24hr window, only approved templates can be sent. This agent operates
                within active sessions.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Session expiry action
              </label>
              <div className="space-y-2">
                {(
                  [
                    ['template', 'Send a re-engagement template when session expires'],
                    ['silent', 'Close the conversation silently'],
                    ['human', 'Escalate to human agent'],
                  ] as const
                ).map(([id, label]) => (
                  <label key={id} className="flex cursor-pointer items-start gap-3">
                    <input
                      type="radio"
                      name="sessionExpiry"
                      checked={sessionExpiryAction === id}
                      onChange={() => setSessionExpiryAction(id)}
                      className="mt-1 h-4 w-4 border-gray-300 text-cyan focus:ring-cyan"
                    />
                    <span className="text-sm text-text-primary">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Fallback Behavior</h3>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Fallback message
            </label>
            <textarea
              value={fallbackMessage}
              onChange={(e) => setFallbackMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Max fallback attempts before escalation
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxFallbackAttempts}
              onChange={(e) => setMaxFallbackAttempts(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full max-w-[120px] rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            />
            <p className="text-xs text-text-secondary mt-1">
              After {maxFallbackAttempts} failed attempts, escalate to human agent
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Opt-out Handling</h3>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              STOP keywords
            </label>
            <ChipInput values={stopKeywords} onChange={setStopKeywords} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              On opt-out detected
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="optOut"
                  checked={optOutBehavior === 'confirm'}
                  onChange={() => setOptOutBehavior('confirm')}
                  className="mt-1 h-4 w-4 border-gray-300 text-cyan focus:ring-cyan"
                />
                <span className="text-sm text-text-primary">
                  Send confirmation and close conversation
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="optOut"
                  checked={optOutBehavior === 'human'}
                  onChange={() => setOptOutBehavior('human')}
                  className="mt-1 h-4 w-4 border-gray-300 text-cyan focus:ring-cyan"
                />
                <span className="text-sm text-text-primary">Escalate to human agent</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Opt-out confirmation message
            </label>
            <textarea
              value={optOutConfirmationMessage}
              onChange={(e) => setOptOutConfirmationMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Escalation Keywords</h3>
          <p className="text-sm text-text-secondary">Escalate immediately when customer says:</p>
          <ChipInput
            values={escalationKeywords}
            onChange={setEscalationKeywords}
            placeholder="Type a keyword and press Enter"
            normalize={(s) => s.toLowerCase()}
            showAddKeywordLink
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
