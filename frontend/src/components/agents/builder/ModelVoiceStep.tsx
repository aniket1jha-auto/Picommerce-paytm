import { useState } from 'react';
import { Check, Info } from 'lucide-react';
import type { AgentConfiguration, VoiceType, ModelType } from '@/types/agent';
import { VOICE_OPTIONS, MODEL_OPTIONS } from '@/data/agentConstants';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ModelVoiceStep({ config, onSave, onNext, onPrev }: Props) {
  const [model, setModel] = useState<ModelType>(config.model);
  const [voice, setVoice] = useState<VoiceType>(config.voice);

  const handleNext = () => {
    onSave({ model, voice });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Model & Voice Selection</h2>
        <p className="text-sm text-text-secondary">
          Choose the AI model and voice that best fits your use case
        </p>
      </div>

      <div className="space-y-6">
        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            AI Model *
          </label>
          <div className="space-y-3">
            {MODEL_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setModel(option.id)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  model === option.id
                    ? 'border-cyan bg-cyan/5'
                    : 'border-[#E5E7EB] hover:border-cyan/50'
                }`}
                data-testid={`model-${option.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-text-primary">{option.name}</span>
                      {option.costMultiplier > 1 && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          {option.costMultiplier}x cost
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{option.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {option.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  {model === option.id && (
                    <Check size={20} className="text-cyan ml-4" strokeWidth={2.5} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Voice *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {VOICE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setVoice(option.id)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  voice === option.id
                    ? 'border-cyan bg-cyan/5'
                    : 'border-[#E5E7EB] hover:border-cyan/50'
                }`}
                data-testid={`voice-${option.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-text-primary capitalize">
                    {option.name}
                  </span>
                  {voice === option.id && (
                    <Check size={16} className="text-cyan" strokeWidth={2.5} />
                  )}
                </div>
                <p className="text-xs text-text-secondary mb-2">{option.description}</p>
                <div className="flex flex-wrap gap-1">
                  {option.characteristics.map((char, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-cyan/10 text-cyan px-2 py-0.5 rounded"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
            <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              You'll be able to test the selected voice before deploying your agent in the Review step.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
          data-testid="model-voice-prev-btn"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
          data-testid="model-voice-next-btn"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
