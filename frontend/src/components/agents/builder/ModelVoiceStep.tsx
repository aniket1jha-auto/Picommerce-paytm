import { useState } from 'react';
import { Check, Info } from 'lucide-react';
import type { AgentConfiguration, VoiceType } from '@/types/agent';
import { VOICE_OPTIONS } from '@/data/agentConstants';
import { ChannelIdentityChat } from '@/components/agents/builder/ChannelIdentityChat';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  onPrev: () => void;
}

function VoiceOnlyStep({ config, onSave, onNext, onPrev }: Props) {
  const [voice, setVoice] = useState<VoiceType>(config.voice);

  const handleNext = () => {
    onSave({ voice });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Voice Selection</h2>
        <p className="text-sm text-text-secondary">
          Choose the voice that best fits your use case
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">Voice *</label>
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
                <span className="font-semibold text-text-primary capitalize">{option.name}</span>
                {voice === option.id && (
                  <Check size={16} className="text-cyan" strokeWidth={2.5} />
                )}
              </div>
              <p className="text-xs text-text-secondary mb-2">{option.description}</p>
              <div className="flex flex-wrap gap-1">
                {option.characteristics.map((char, idx) => (
                  <span key={idx} className="text-xs bg-cyan/10 text-cyan px-2 py-0.5 rounded">
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
            You&apos;ll be able to test the selected voice before deploying your agent in the
            Review step.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
          data-testid="model-voice-prev-btn"
        >
          Back
        </button>
        <button
          type="button"
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

export function ModelVoiceStep(props: Props) {
  if (props.config.type === 'chat') {
    return <ChannelIdentityChat {...props} />;
  }
  return <VoiceOnlyStep {...props} />;
}
