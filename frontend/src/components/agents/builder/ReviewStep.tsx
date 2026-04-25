import { useState } from 'react';
import { Check, Play, AlertCircle } from 'lucide-react';
import type { AgentConfiguration } from '@/types/agent';
import { ChatTestPanel } from '@/components/agents/chat-builder/ChatTestPanel';
import { chatChannelLabel, chatUseCaseLabel } from '@/data/chatAgentConstants';

interface Props {
  config: AgentConfiguration;
  onPrev: () => void;
  onDeploy: () => void;
  isLastStep: boolean;
}

function ConfigurationSummary({ config }: { config: AgentConfiguration }) {
  const toolCount = new Set([
    ...(config.globalToolIds ?? []),
    ...(config.builtInTools ?? []),
    ...(config.instructionSteps ?? []).flatMap((s) => s.attachedToolIds ?? []),
  ]).size;

  return (
    <div className="rounded-lg bg-white border border-[#E5E7EB] p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Configuration Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Name:</span>
          <span className="text-text-primary font-medium">{config.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Type:</span>
          <span className="text-text-primary font-medium capitalize">{config.type}</span>
        </div>
        {config.type === 'chat' ? (
          <>
            <div className="flex justify-between text-sm gap-4">
              <span className="text-text-secondary shrink-0">Channel:</span>
              <span className="text-text-primary font-medium text-right">
                {chatChannelLabel(config.chatChannel ?? 'whatsapp')}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-4">
              <span className="text-text-secondary shrink-0">Display Name:</span>
              <span className="text-text-primary font-medium text-right">
                {config.chatDisplayName?.trim() || '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm gap-4">
              <span className="text-text-secondary shrink-0">Response Languages:</span>
              <span className="text-text-primary font-medium text-right">
                {(config.chatLanguages ?? []).length ? (config.chatLanguages ?? []).join(', ') : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Fallback Language:</span>
              <span className="text-text-primary font-medium">
                {config.chatFallbackLanguage ?? 'English'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Model:</span>
              <span className="text-text-primary font-medium">{config.model}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Voice:</span>
              <span className="text-text-primary font-medium capitalize">{config.voice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Language:</span>
              <span className="text-text-primary font-medium">
                {config.conversationSettings.language}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Use Case:</span>
          <span className="text-text-primary font-medium">
            {config.type === 'chat'
              ? chatUseCaseLabel(config.useCase)
              : config.useCase.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Tools Enabled:</span>
          <span className="text-text-primary font-medium">{toolCount}</span>
        </div>
      </div>
    </div>
  );
}

export function ReviewStep({ config, onPrev, onDeploy }: Props) {
  const [environment, setEnvironment] = useState<'test' | 'production'>('test');
  const [showTestConsole, setShowTestConsole] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setShowTestConsole(true);
    }, 2000);
  };

  const handleDeploy = () => {
    onDeploy();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Review & Deploy</h2>
        <p className="text-sm text-text-secondary">
          Review your agent configuration and test before deploying
        </p>
      </div>

      <div className="space-y-4">
        {config.type === 'chat' ? (
          <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
            <ConfigurationSummary config={config} />
            <div className="flex min-h-0 flex-col gap-2 min-h-[420px]">
              <h3 className="text-sm font-semibold text-text-primary">Test your agent</h3>
              <p className="text-xs text-text-secondary">
                Simulate a conversation before deploying
              </p>
              <div className="flex min-h-[420px] flex-1 flex-col">
                <ChatTestPanel config={config} layout="review" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <ConfigurationSummary config={config} />

            <div className="rounded-lg bg-gradient-to-br from-cyan/5 to-cyan/10 border border-cyan/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">Test Your Agent</h3>
                  <p className="text-xs text-text-secondary">
                    Make a test call to experience how your agent sounds and behaves
                  </p>
                </div>
                <button
                  onClick={handleTest}
                  disabled={isTesting}
                  className="inline-flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan/90 disabled:opacity-50"
                  data-testid="test-agent-btn"
                >
                  {isTesting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Start Test Call
                    </>
                  )}
                </button>
              </div>

              {showTestConsole && (
                <div className="rounded-lg bg-white p-4 border border-cyan/30">
                  <div className="flex items-start gap-3 mb-3">
                    <Check size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-text-primary mb-1">
                        Test call completed successfully
                      </div>
                      <div className="text-xs text-text-secondary">
                        Duration: 45 seconds • Latency: 380ms • Voice: {config.voice}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary bg-gray-50 p-3 rounded font-mono">
                    Agent: &quot;Hi, this is {config.personality.role}. How can I help you
                    today?&quot;
                    <br />
                    User: &quot;I&apos;d like to learn more about your product.&quot;
                    <br />
                    Agent: &quot;I&apos;d be happy to help! Could you tell me a bit about what
                    you&apos;re looking for?&quot;
                    <br />
                    ...
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Deployment Environment
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEnvironment('test')}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                environment === 'test'
                  ? 'border-cyan bg-cyan/5'
                  : 'border-[#E5E7EB] hover:border-cyan/50'
              }`}
              data-testid="env-test"
            >
              <div className="font-semibold text-text-primary mb-1">Test Environment</div>
              <div className="text-xs text-text-secondary">
                Safe for testing, limited to 100 calls/day
              </div>
            </button>
            <button
              type="button"
              onClick={() => setEnvironment('production')}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                environment === 'production'
                  ? 'border-cyan bg-cyan/5'
                  : 'border-[#E5E7EB] hover:border-cyan/50'
              }`}
              data-testid="env-production"
            >
              <div className="font-semibold text-text-primary mb-1">Production Environment</div>
              <div className="text-xs text-text-secondary">Live deployment, full capacity</div>
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-amber-900 mb-1">Before deploying</div>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                <li>Test your agent thoroughly to ensure it behaves as expected</li>
                <li>Review compliance settings for your use case</li>
                <li>Monitor performance metrics after deployment</li>
                <li>You can always pause or update your agent later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-6 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
          data-testid="review-prev-btn"
        >
          Back
        </button>
        <button
          onClick={handleDeploy}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-cyan to-cyan/90 px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg"
          data-testid="deploy-agent-btn"
        >
          <Check size={16} />
          Deploy Agent
        </button>
      </div>
    </div>
  );
}
