import { Lightbulb, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { mockPromptSuggestions } from '@/data/mock/agents';
import type { PromptSuggestion } from '@/types/agent';

interface Props {
  agentId: string;
}

const SEVERITY_COLORS = {
  low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' },
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
};

const TYPE_ICONS = {
  clarity: MessageSquare,
  edge_case: AlertCircle,
  tone: TrendingUp,
  examples: Lightbulb,
  structure: Lightbulb,
};

function SuggestionCard({ suggestion }: { suggestion: PromptSuggestion }) {
  const colors = SEVERITY_COLORS[suggestion.severity];
  const Icon = TYPE_ICONS[suggestion.type];

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white`}>
          <Icon size={20} className={colors.icon} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-text-primary">{suggestion.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded capitalize ${colors.bg} ${colors.text} border ${colors.border}`}>
              {suggestion.severity}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-3">{suggestion.description}</p>
          
          {suggestion.currentText && (
            <div className="mb-3">
              <div className="text-xs font-medium text-text-secondary mb-1">Current:</div>
              <div className="rounded bg-white p-2 text-xs text-text-primary font-mono border border-gray-200">
                {suggestion.currentText}
              </div>
            </div>
          )}
          
          {suggestion.suggestedText && (
            <div className="mb-3">
              <div className="text-xs font-medium text-text-secondary mb-1">Suggested:</div>
              <div className="rounded bg-white p-2 text-xs text-text-primary font-mono border border-green-200">
                {suggestion.suggestedText}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-secondary">
              <strong>Impact:</strong> {suggestion.impact}
            </div>
            <button
              className="text-xs font-medium text-cyan hover:underline"
              data-testid={`apply-suggestion-${suggestion.id}`}
            >
              Apply Suggestion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PromptEnhancement({ agentId: _agentId }: Props) {
  const suggestions = mockPromptSuggestions;
  const highPriority = suggestions.filter((s) => s.severity === 'high');
  const mediumPriority = suggestions.filter((s) => s.severity === 'medium');
  const lowPriority = suggestions.filter((s) => s.severity === 'low');

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-br from-cyan/5 to-cyan/10 border border-cyan/20 p-5">
        <div className="flex items-start gap-3">
          <Lightbulb size={24} className="text-cyan" />
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              AI-Powered Prompt Analysis
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Based on {suggestions.length} areas for improvement identified from call analysis and best practices.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-text-secondary">{highPriority.length} High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-text-secondary">{mediumPriority.length} Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-text-secondary">{lowPriority.length} Low Priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {highPriority.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            High Priority Improvements
          </h3>
          <div className="space-y-3">
            {highPriority.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {mediumPriority.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Medium Priority Improvements
          </h3>
          <div className="space-y-3">
            {mediumPriority.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {lowPriority.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Low Priority Improvements
          </h3>
          <div className="space-y-3">
            {lowPriority.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
