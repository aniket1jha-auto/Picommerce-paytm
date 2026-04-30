import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input, Select, Button, Card, EmptyState, cn } from '@/components/ui';
import type { KnowledgeBase, KBRetrievalResult } from '@/types/knowledgeBase';
import { retrieve } from '@/utils/mockRetrieval';

interface Props {
  kb: KnowledgeBase;
}

const SUGGESTIONS_BY_KB: Record<string, string[]> = {
  'kb-001': [
    'What is Paytm Postpaid?',
    'List Paytm wallet features',
    'Insurance products available',
  ],
  'kb-002': [
    'What is the wallet monthly limit?',
    'How long do refunds take?',
    'Chargeback eligibility',
  ],
  'kb-003': [
    'How do I complete KYC with Aadhaar OTP?',
    'Why does the OTP fail?',
    'KYC rejection reasons',
  ],
  'kb-004': [
    'Recovery script for DPD 0–30',
    'Settlement options for DPD 31–60',
    'RBI escalation playbook',
  ],
};

export function KBTestRetrievalPanel({ kb }: Props) {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(4);
  const [scoreThreshold, setScoreThreshold] = useState(0.6);
  const [submitted, setSubmitted] = useState(false);

  const results: KBRetrievalResult[] = useMemo(() => {
    if (!submitted || !query.trim()) return [];
    return retrieve({ knowledgeBaseId: kb.id, query, topK, scoreThreshold });
  }, [kb.id, query, topK, scoreThreshold, submitted]);

  const suggestions = SUGGESTIONS_BY_KB[kb.id] ?? [];

  function handleRun() {
    if (!query.trim()) return;
    setSubmitted(true);
  }

  if (kb.chunkCount === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No content to retrieve from"
        body="Upload documents to this knowledge base before testing retrieval."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      {/* Query + results */}
      <div className="flex flex-col gap-3">
        <Card>
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] font-medium text-text-secondary">Query</span>
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                />
                <Input
                  placeholder="Ask something the agent might be asked…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSubmitted(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                  className="pl-9"
                />
              </div>
              <Button variant="primary" onClick={handleRun} disabled={!query.trim()}>
                Run
              </Button>
            </div>

            {!submitted && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-text-tertiary self-center">Try:</span>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQuery(s);
                      setSubmitted(true);
                    }}
                    className="rounded-full border border-border-subtle bg-surface px-2.5 h-6 text-[12px] text-text-secondary hover:border-border-default hover:text-text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        {submitted && (
          <div className="flex flex-col gap-2">
            <div className="text-[12px] text-text-secondary">
              {results.length === 0
                ? 'No chunks above threshold.'
                : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </div>
            {results.map((r) => (
              <ResultCard key={r.id} result={r} />
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-3">
        <Card>
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
              Retrieval settings
            </span>
            <Select
              label="Top K"
              value={String(topK)}
              onChange={(e) => {
                setTopK(Number(e.target.value));
                setSubmitted(false);
              }}
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
            <Select
              label="Score threshold"
              value={String(scoreThreshold)}
              onChange={(e) => {
                setScoreThreshold(Number(e.target.value));
                setSubmitted(false);
              }}
            >
              {[0, 0.5, 0.6, 0.65, 0.7, 0.75, 0.8].map((n) => (
                <option key={n} value={n}>
                  {n.toFixed(2)}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        <Card>
          <div className="text-[11px] text-text-tertiary">
            Mock retrieval — curated query→chunks plus deterministic random fallback.
            Real vector search lands in v2.
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: KBRetrievalResult }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[12px] font-medium text-text-primary truncate">
          {result.documentName}
          {result.pageOrSection && (
            <span className="ml-1.5 text-text-tertiary">· {result.pageOrSection}</span>
          )}
        </div>
        <ScorePill score={result.score} />
      </div>
      <p className="mt-2 text-[13px] leading-5 text-text-primary">{result.text}</p>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 0.85
      ? 'bg-success-soft text-success'
      : score >= 0.7
      ? 'bg-info-soft text-info'
      : 'bg-neutral-soft text-text-secondary';
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 h-5 inline-flex items-center text-[11px] font-medium tabular-nums',
        tone,
      )}
    >
      {score.toFixed(2)}
    </span>
  );
}
