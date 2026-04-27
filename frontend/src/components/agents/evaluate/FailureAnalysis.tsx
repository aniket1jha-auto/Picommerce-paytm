import { AlertTriangle, TrendingDown, Wrench } from 'lucide-react';
import { mockFailurePatterns } from '@/data/mock/agents';
import type { FailurePattern } from '@/types/agent';

interface Props {
  agentId: string;
}

function FailureCard({ pattern }: { pattern: FailurePattern }) {
  return (
    <div className="rounded-lg bg-white border-2 border-red-200 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-base font-semibold text-text-primary">{pattern.type}</h4>
            <div className="text-right">
              <div className="text-lg font-bold text-red-600">{pattern.count}</div>
              <div className="text-xs text-text-secondary">{pattern.percentage.toFixed(1)}% of failures</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-medium text-text-secondary mb-2">Example Cases:</div>
        <ul className="space-y-1.5">
          {pattern.examples.map((example, idx) => (
            <li key={idx} className="text-sm text-text-primary flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span className="flex-1">{example}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-green-50 border border-green-200 p-3">
        <div className="flex items-start gap-2">
          <Wrench size={16} className="text-green-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-medium text-green-900 mb-1">Suggested Fix</div>
            <div className="text-sm text-green-800">{pattern.suggestedFix}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FailureAnalysis({ agentId: _agentId }: Props) {
  const patterns = mockFailurePatterns.filter((p) => {
    const hay = [
      p.type,
      p.suggestedFix,
      ...p.examples,
    ]
      .join(' ')
      .toLowerCase();
    return (
      hay.includes('api') ||
      hay.includes('tool') ||
      hay.includes('webhook') ||
      hay.includes('crm') ||
      hay.includes('calendar')
    );
  });
  const totalFailures = patterns.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-5">
        <div className="flex items-start gap-3">
          <TrendingDown size={24} className="text-red-600" />
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              Tool call analysis
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              {patterns.length === 0 ? (
                <>
                  No tool-related failures detected yet. This section will populate once your agent starts using tools in production.
                </>
              ) : (
                <>
                  Identified {patterns.length} common tool-related failure patterns across {totalFailures} failed calls.
                  Addressing these issues could improve success rate by 10-15%.
                </>
              )}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-semibold text-text-primary">{totalFailures}</span>
                <span className="text-text-secondary ml-1">Tool Failures</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">{patterns.length}</span>
                <span className="text-text-secondary ml-1">Patterns Detected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {patterns.length > 0 && (
        <div className="space-y-4">
          {patterns.map((pattern, idx) => (
            <FailureCard key={idx} pattern={pattern} />
          ))}
        </div>
      )}

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-2">
          <div className="text-xl">💡</div>
          <div>
            <div className="text-sm font-medium text-blue-900 mb-1">Pro Tip</div>
            <p className="text-sm text-blue-800">
              Start by addressing high-percentage tool failures first. Even small improvements to retries, timeouts,
              and fallbacks can have a significant impact on overall agent performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
