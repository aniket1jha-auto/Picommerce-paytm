import { Play, Square, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { Agent } from '@/types/agent';

interface Props {
  agent: Agent;
}

export function TestConsole({ agent }: Props) {
  const [isTesting, setIsTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  const handleStartTest = () => {
    setIsTesting(true);
    setTestComplete(false);
    // Simulate test call
    setTimeout(() => {
      setIsTesting(false);
      setTestComplete(true);
    }, 3000);
  };

  const handleStopTest = () => {
    setIsTesting(false);
    setTestComplete(true);
  };

  return (
    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            Live Test Console
          </h3>
          <p className="text-sm text-text-secondary">
            Test your agent in real-time before connecting to campaigns
          </p>
        </div>
        {!isTesting ? (
          <button
            onClick={handleStartTest}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg"
            data-testid="start-test-call-btn"
          >
            <Play size={16} />
            Start Test Call
          </button>
        ) : (
          <button
            onClick={handleStopTest}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700"
            data-testid="stop-test-call-btn"
          >
            <Square size={16} />
            End Call
          </button>
        )}
      </div>

      {isTesting && (
        <div className="rounded-lg bg-white p-5 border border-purple-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 animate-pulse">
              <Volume2 size={24} className="text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">Call in progress...</div>
              <div className="text-xs text-text-secondary">Testing voice: {agent.config.voice} • Model: {agent.config.model}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="text-xs font-medium text-purple-600 w-16">Agent:</div>
              <div className="flex-1 text-sm text-text-primary">
                "Hi, this is {agent.config.personality.role}. How can I help you today?"
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-xs font-medium text-blue-600 w-16">User:</div>
              <div className="flex-1 text-sm text-text-primary italic">
                (Your test responses appear here)
              </div>
            </div>
          </div>
        </div>
      )}

      {testComplete && !isTesting && (
        <div className="rounded-lg bg-white p-5 border border-green-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-text-primary">Test call completed</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-text-secondary">Duration</div>
              <div className="font-medium text-text-primary">2m 15s</div>
            </div>
            <div>
              <div className="text-xs text-text-secondary">Latency</div>
              <div className="font-medium text-text-primary">385ms</div>
            </div>
            <div>
              <div className="text-xs text-text-secondary">Cost</div>
              <div className="font-medium text-text-primary">$0.23</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
