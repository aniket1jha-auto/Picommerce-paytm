import { useState } from 'react';
import { Check, Play, AlertCircle } from 'lucide-react';
import type { AgentConfiguration } from '@/types/agent';

interface Props {
  config: AgentConfiguration;
  onPrev: () => void;
  onDeploy: () => void;
  isLastStep: boolean;
}

export function ReviewStep({ config, onPrev, onDeploy }: Props) {
  const [environment, setEnvironment] = useState<'test' | 'production'>('test');
  const [showTestConsole, setShowTestConsole] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = () => {
    setIsTesting(true);
    // Simulate test call
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

      {/* Configuration Summary */}
      <div className="space-y-4">
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
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Model:</span>
              <span className="text-text-primary font-medium">{config.model}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Voice:</span>
              <span className="text-text-primary font-medium capitalize">{config.voice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Use Case:</span>
              <span className="text-text-primary font-medium capitalize">{config.useCase}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Language:</span>
              <span className="text-text-primary font-medium">{config.conversationSettings.language}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Tools Enabled:</span>
              <span className="text-text-primary font-medium">{config.builtInTools.length}</span>
            </div>
          </div>
        </div>

        {/* Test Console */}
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
                Agent: "Hi, this is {config.personality.role}. How can I help you today?"<br />
                User: "I'd like to learn more about your product."<br />
                Agent: "I'd be happy to help! Could you tell me a bit about what you're looking for?"<br />
                ...
              </div>
            </div>
          )}
        </div>

        {/* Environment Selection */}
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
              <div className="text-xs text-text-secondary">
                Live deployment, full capacity
              </div>
            </button>
          </div>
        </div>

        {/* Important Notes */}
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
