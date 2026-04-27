import { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import type { AgentConfiguration } from '@/types/agent';
import { PERSONALITY_TRAITS, TONE_OPTIONS, PROMPT_TEMPLATES } from '@/data/agentConstants';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PromptStep({ config, onSave, onNext, onPrev }: Props) {
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt);
  const [traits, setTraits] = useState<string[]>(config.personality.traits);
  const [tone, setTone] = useState(config.personality.tone);
  const [role, setRole] = useState(config.personality.role);
  const [objectives, setObjectives] = useState<string[]>(config.objectives);
  const [dos, setDos] = useState<string[]>(config.guidelines.dos);
  const [donts, setDonts] = useState<string[]>(config.guidelines.donts);
  const [showTemplates, setShowTemplates] = useState(!config.systemPrompt);

  const toggleTrait = (trait: string) => {
    setTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const applyTemplate = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSystemPrompt(template.systemPrompt);
      setShowTemplates(false);
    }
  };

  const handleNext = () => {
    onSave({
      systemPrompt,
      personality: { traits, tone, role },
      objectives,
      guidelines: { dos, donts },
    });
    onNext();
  };

  const hasKeyIntent = objectives.some((o) => o.trim().length > 0);
  const missingSystemPrompt = systemPrompt.trim().length === 0;
  const missingRole = role.trim().length === 0;
  const missingKeyIntents = !hasKeyIntent;

  const isValid = !missingSystemPrompt && !missingRole && !missingKeyIntents;

  function InfoHint({
    text,
    required = false,
    missing = false,
  }: {
    text: string;
    required?: boolean;
    missing?: boolean;
  }) {
    const colorClass = missing ? 'text-red-600' : 'text-text-secondary';

    return (
      <span className="group relative inline-flex items-center">
        <span
          className={[
            'inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-semibold leading-none',
            missing ? 'border-red-300 bg-red-50' : 'border-[#E5E7EB] bg-white',
            colorClass,
          ].join(' ')}
          aria-label={required ? 'Required field info' : 'Field info'}
        >
          <Info size={12} />
        </span>
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs leading-relaxed text-text-secondary shadow-lg group-hover:block">
          <span className="font-semibold text-text-primary">{required ? 'Required. ' : ''}</span>
          {text}
        </span>
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">System Prompt & Personality</h2>
        <p className="text-sm text-text-secondary">
          Define how your agent thinks, speaks, and behaves
        </p>
      </div>

      {showTemplates && (
        <div className="rounded-lg bg-gradient-to-br from-cyan/5 to-cyan/10 p-5 border border-cyan/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-cyan" />
            <span className="font-semibold text-text-primary">Start with a Template</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {PROMPT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className="rounded-lg bg-white p-3 text-left hover:ring-2 hover:ring-cyan transition-all"
                data-testid={`template-${template.id}`}
              >
                <div className="font-medium text-sm text-text-primary mb-1">{template.name}</div>
                <div className="text-xs text-text-secondary">Pre-configured for {template.useCase}</div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowTemplates(false)}
            className="text-xs text-cyan hover:underline"
          >
            Start from scratch instead
          </button>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
            <span>System Prompt</span>
            <InfoHint
              required
              missing={missingSystemPrompt}
              text="Define the agent’s overall behavior, constraints, and style. This is the top-level instruction the agent should always follow."
            />
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful assistant that...&#10;&#10;Your main goal is to...&#10;&#10;Key responsibilities:&#10;- ...&#10;- ..."
            rows={8}
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm font-mono focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            data-testid="system-prompt-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <span>Role/Identity</span>
              <InfoHint
                required
                missing={missingRole}
                text="Who the agent is. This helps the agent adopt the right voice and context (e.g., Sales Rep, Support Agent, Appointment Booker)."
              />
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Sales Representative"
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
              data-testid="role-input"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <span>Tone</span>
              <InfoHint text="The default communication tone the agent should use across responses." />
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
              data-testid="tone-select"
            >
              {TONE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
            <span>Personality Traits</span>
            <InfoHint text="Optional traits that shape how the agent behaves (e.g., Friendly, Concise, Patient). You can select multiple." />
          </label>
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TRAITS.map((trait) => (
              <button
                key={trait}
                type="button"
                onClick={() => toggleTrait(trait)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  traits.includes(trait)
                    ? 'bg-cyan text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`trait-${trait.toLowerCase()}`}
              >
                {trait}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
            <span>Key Intents</span>
            <InfoHint
              required
              missing={missingKeyIntents}
              text="What the agent should try to accomplish in conversations. Add 1+ intents; these guide decision-making and prioritization."
            />
          </label>
          <div className="space-y-2">
            {objectives.map((obj, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={obj}
                  onChange={(e) => {
                    const newObjectives = [...objectives];
                    newObjectives[idx] = e.target.value;
                    setObjectives(newObjectives);
                  }}
                  placeholder="e.g., Qualify leads effectively"
                  className="flex-1 rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                />
                <button
                  type="button"
                  onClick={() => setObjectives(objectives.filter((_, i) => i !== idx))}
                  className="text-sm text-red-600 hover:text-red-700 px-3"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setObjectives([...objectives, ''])}
              className="text-sm text-cyan hover:underline"
              data-testid="add-objective-btn"
            >
              + Add Intent
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <span>Do&apos;s (Best Practices)</span>
              <InfoHint text="Optional guidelines describing what the agent should do while interacting with users." />
            </label>
            <div className="space-y-2">
              {dos.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newDos = [...dos];
                      newDos[idx] = e.target.value;
                      setDos(newDos);
                    }}
                    placeholder="Do this..."
                    className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                  />
                  <button
                    type="button"
                    onClick={() => setDos(dos.filter((_, i) => i !== idx))}
                    className="text-xs text-red-600 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDos([...dos, ''])}
                className="text-xs text-cyan hover:underline"
              >
                + Add Do
              </button>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-2">
              <span>Don&apos;ts (What to Avoid)</span>
              <InfoHint text="Optional guidelines describing what the agent must avoid (tone, compliance, unsafe actions, etc.)." />
            </label>
            <div className="space-y-2">
              {donts.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newDonts = [...donts];
                      newDonts[idx] = e.target.value;
                      setDonts(newDonts);
                    }}
                    placeholder="Don't do this..."
                    className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                  />
                  <button
                    type="button"
                    onClick={() => setDonts(donts.filter((_, i) => i !== idx))}
                    className="text-xs text-red-600 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDonts([...donts, ''])}
                className="text-xs text-cyan hover:underline"
              >
                + Add Don't
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
          data-testid="prompt-prev-btn"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="prompt-next-btn"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
