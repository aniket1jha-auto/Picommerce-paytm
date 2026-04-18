import { useState } from 'react';
import { Check, Volume2 } from 'lucide-react';
import type { AgentConfiguration, VoiceType, ModelType } from '@/types/agent';
import { USE_CASE_OPTIONS, VOICE_OPTIONS, MODEL_OPTIONS } from '@/data/agentConstants';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  isFirstStep: boolean;
}

export function BasicsVoiceStep({ config, onSave, onNext }: Props) {
  const [name, setName] = useState(config.name);
  const [description, setDescription] = useState(config.description);
  const [useCase, setUseCase] = useState(config.useCase);
  const [model, setModel] = useState<ModelType>(config.model);
  const [voice, setVoice] = useState<VoiceType>(config.voice);

  const isValid = name.trim() && description.trim();

  const handleNext = () => {
    onSave({ name, description, type: 'voice', useCase, model, voice });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">Basics & Voice</h2>
        <p className="text-sm text-text-secondary">
          Name your agent, pick a use case, and choose how it sounds
        </p>
      </div>

      {/* Name & Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Agent Name *</label>
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
          <label className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what this agent does..."
            rows={2}
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            data-testid="agent-description-input"
          />
        </div>
      </div>

      {/* Use Case */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">Use Case *</label>
        <div className="grid grid-cols-3 gap-2.5">
          {USE_CASE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setUseCase(option.id)}
              className={`rounded-lg border-2 p-3 text-left transition-all ${
                useCase === option.id ? 'border-cyan bg-cyan/5' : 'border-[#E5E7EB] hover:border-cyan/40'
              }`}
              data-testid={`use-case-${option.id}`}
            >
              <div className="text-lg mb-0.5">{option.icon}</div>
              <div className="text-sm font-medium text-text-primary">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">AI Model</label>
        <div className="grid grid-cols-2 gap-3">
          {MODEL_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setModel(option.id)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                model === option.id ? 'border-cyan bg-cyan/5' : 'border-[#E5E7EB] hover:border-cyan/40'
              }`}
              data-testid={`model-${option.id}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-text-primary">{option.name}</span>
                {model === option.id && <Check size={16} className="text-cyan" />}
              </div>
              <p className="text-xs text-text-secondary">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Voice */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">Voice</label>
        <div className="grid grid-cols-5 gap-2">
          {VOICE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setVoice(option.id)}
              className={`rounded-lg border-2 p-3 text-center transition-all ${
                voice === option.id ? 'border-cyan bg-cyan/5' : 'border-[#E5E7EB] hover:border-cyan/40'
              }`}
              data-testid={`voice-${option.id}`}
            >
              <div className="flex justify-center mb-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${voice === option.id ? 'bg-cyan/10' : 'bg-gray-100'}`}>
                  <Volume2 size={14} className={voice === option.id ? 'text-cyan' : 'text-text-secondary'} />
                </div>
              </div>
              <div className="text-xs font-semibold text-text-primary capitalize">{option.name}</div>
              <div className="text-[10px] text-text-secondary mt-0.5 line-clamp-1">{option.characteristics[0]}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleNext}
          disabled={!isValid}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="basics-next-btn"
        >
          Continue to Instructions
        </button>
      </div>
    </div>
  );
}
