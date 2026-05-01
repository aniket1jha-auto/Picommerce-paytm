import { useState } from 'react';
import type { AgentConfiguration } from '@/types/agent';
import { LANGUAGE_OPTIONS } from '@/data/agentConstants';
import { AdvancedChatSettings } from '@/components/agents/builder/AdvancedChatSettings';

interface Props {
  config: AgentConfiguration;
  onSave: (config: Partial<AgentConfiguration>) => void;
  onNext: () => void;
  onPrev: () => void;
}

function VoiceAdvancedStep({ config, onSave, onNext, onPrev }: Props) {
  const [temperature, setTemperature] = useState(config.llmConfig.temperature);
  const [maxTokens, setMaxTokens] = useState(config.llmConfig.maxTokens);
  const [silenceTimeout, setSilenceTimeout] = useState(config.conversationSettings.silenceTimeout);
  const [maxDuration, setMaxDuration] = useState(config.conversationSettings.maxDuration);
  const [language, setLanguage] = useState(config.conversationSettings.language);
  const [allowInterruptions, setAllowInterruptions] = useState(config.audioConfig.allowInterruptions);

  const handleNext = () => {
    onSave({
      llmConfig: {
        ...config.llmConfig,
        temperature,
        maxTokens,
      },
      conversationSettings: {
        ...config.conversationSettings,
        silenceTimeout,
        maxDuration,
        language,
      },
      audioConfig: {
        ...config.audioConfig,
        allowInterruptions,
      },
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Advanced Settings</h2>
        <p className="text-sm text-text-secondary">
          Fine-tune your agent&apos;s behavior and performance
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Response style</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Creativity: {temperature.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
                data-testid="temperature-slider"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Predictable</span>
                <span>Creative</span>
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Lower = sticks closer to the script. Higher = more variation in wording.
                Recovery and KYC use-cases work best at 0.2&ndash;0.4.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Max response length: ~{Math.round(maxTokens * 0.75).toLocaleString()} words
              </label>
              <input
                type="range"
                min="512"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                className="w-full"
                data-testid="max-tokens-slider"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>~380 words</span>
                <span>~3,000 words</span>
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                The longest single reply the agent can produce in one turn. Behind the scenes
                this is measured in tokens &mdash; roughly 4 characters of English per token,
                so 1,000 tokens &asymp; 750 words. Voice calls rarely need more than ~1,200.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Conversation Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Silence Timeout (seconds)
              </label>
              <input
                type="number"
                min="3"
                max="15"
                value={silenceTimeout}
                onChange={(e) => setSilenceTimeout(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                data-testid="silence-timeout-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Max Duration (seconds)
              </label>
              <input
                type="number"
                min="60"
                max="1800"
                step="60"
                value={maxDuration}
                onChange={(e) => setMaxDuration(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
                data-testid="max-duration-input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
              data-testid="language-select"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Audio Settings</h3>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allowInterruptions}
              onChange={(e) => setAllowInterruptions(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-cyan focus:ring-cyan"
              data-testid="allow-interruptions-checkbox"
            />
            <span className="text-sm text-text-primary">
              Allow user interruptions during agent speech
            </span>
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Compliance</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.compliance.contentFiltering}
                disabled
                className="h-4 w-4 rounded border-gray-300 text-cyan focus:ring-cyan"
              />
              <span className="text-sm text-text-secondary">
                Content filtering (Always enabled)
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.compliance.piiDetection}
                disabled
                className="h-4 w-4 rounded border-gray-300 text-cyan focus:ring-cyan"
              />
              <span className="text-sm text-text-secondary">PII detection (Always enabled)</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.compliance.recordingConsent}
                disabled
                className="h-4 w-4 rounded border-gray-300 text-cyan focus:ring-cyan"
              />
              <span className="text-sm text-text-secondary">
                Recording consent (Always enabled)
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.compliance.tcpaCompliance}
                disabled
                className="h-4 w-4 rounded border-gray-300 text-cyan focus:ring-cyan"
              />
              <span className="text-sm text-text-secondary">TCPA compliance (Always enabled)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
          data-testid="advanced-prev-btn"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90"
          data-testid="advanced-next-btn"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export function AdvancedStep(props: Props) {
  if (props.config.type === 'chat') {
    return <AdvancedChatSettings {...props} />;
  }
  return <VoiceAdvancedStep {...props} />;
}
