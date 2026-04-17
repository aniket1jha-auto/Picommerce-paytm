import { useState, useEffect } from 'react';
import type { AgentConfiguration } from '@/types/agent';
import { USE_CASE_OPTIONS } from '@/data/agentConstants';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  isFirstStep: boolean;
}

export function BasicInfoStep({ config, onSave, onNext }: Props) {
  const [name, setName] = useState(config.name);
  const [description, setDescription] = useState(config.description);
  const [type, setType] = useState(config.type);
  const [useCase, setUseCase] = useState(config.useCase);

  const isValid = name.trim() && description.trim();

  const handleNext = () => {
    onSave({ name, description, type, useCase });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Basic Information</h2>
        <p className="text-sm text-text-secondary">
          Let's start with the basics. What kind of agent are you building?
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Agent Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sales Outreach Agent"
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            data-testid="agent-name-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this agent does and its primary goals..."
            rows={3}
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            data-testid="agent-description-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Agent Type *
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType('voice')}
              className={`flex-1 rounded-lg border-2 p-4 text-left transition-all ${
                type === 'voice'
                  ? 'border-cyan bg-cyan/5'
                  : 'border-[#E5E7EB] hover:border-cyan/50'
              }`}
              data-testid="agent-type-voice"
            >
              <div className="text-2xl mb-2">🎤</div>
              <div className="font-semibold text-text-primary">Voice Agent</div>
              <div className="text-xs text-text-secondary mt-1">
                AI-powered phone calls with speech-to-speech
              </div>
            </button>
            <button
              type="button"
              onClick={() => setType('chat')}
              className={`flex-1 rounded-lg border-2 p-4 text-left transition-all opacity-50 cursor-not-allowed ${
                type === 'chat'
                  ? 'border-cyan bg-cyan/5'
                  : 'border-[#E5E7EB]'
              }`}
              disabled
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="font-semibold text-text-secondary">Chat Agent</div>
              <div className="text-xs text-text-secondary mt-1">
                Coming soon
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Use Case *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {USE_CASE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setUseCase(option.id)}
                className={`rounded-lg border-2 p-3 text-left transition-all ${
                  useCase === option.id
                    ? 'border-cyan bg-cyan/5'
                    : 'border-[#E5E7EB] hover:border-cyan/50'
                }`}
                data-testid={`use-case-${option.id}`}
              >
                <div className="text-xl mb-1">{option.icon}</div>
                <div className="text-sm font-medium text-text-primary">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="basic-info-next-btn"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
