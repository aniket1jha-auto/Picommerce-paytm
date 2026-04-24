import { useState } from 'react';
import { Search, Play } from 'lucide-react';
import { useAgentStore } from '@/store/agentStore';
import type { CallTranscript, SentimentType } from '@/types/agent';

interface Props {
  agentId: string;
}

const SENTIMENT_COLORS: Record<SentimentType, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-700',
};

export function TranscriptViewer({ agentId }: Props) {
  const allTranscripts = useAgentStore((s) => s.transcripts);
  const transcripts = allTranscripts.filter((t) => t.agentId === agentId);
  const [selectedTranscript, setSelectedTranscript] = useState<CallTranscript | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const active = selectedTranscript ?? transcripts[0] ?? null;

  const filteredTranscripts = transcripts.filter(
    (t) =>
      t.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Transcript List */}
      <div className="col-span-1 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcripts..."
            className="w-full rounded-lg border border-[#E5E7EB] pl-10 pr-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            data-testid="transcript-search"
          />
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredTranscripts.map((transcript) => (
            <button
              key={transcript.id}
              onClick={() => setSelectedTranscript(transcript)}
              className={`w-full rounded-lg border p-3 text-left transition-all ${
                active?.id === transcript.id
                  ? 'border-cyan bg-cyan/5'
                  : 'border-[#E5E7EB] hover:border-cyan/50'
              }`}
              data-testid={`transcript-${transcript.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">
                  {new Date(transcript.timestamp).toLocaleDateString()}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    transcript.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {transcript.status}
                </span>
              </div>
              <div className="text-sm text-text-primary line-clamp-2">
                {transcript.messages[0]?.content}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                <span>{Math.floor(transcript.duration / 60)}m {transcript.duration % 60}s</span>
                <span>•</span>
                <span>{transcript.messages.length} messages</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transcript Detail */}
      <div className="col-span-2">
        {active ? (
          <div className="rounded-lg bg-white p-5 ring-1 ring-[#E5E7EB]">
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#E5E7EB]">
              <div>
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  Call Transcript
                </h3>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span>{new Date(active.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>Duration: {Math.floor(active.duration / 60)}m {active.duration % 60}s</span>
                  <span>•</span>
                  <span>Cost: ${active.metadata.cost.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-gray-50"
                data-testid="play-audio-btn"
              >
                <Play size={14} />
                Play Audio
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {active.messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    message.role === 'agent' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.role === 'agent'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {message.role === 'agent' ? 'A' : 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-primary capitalize">
                        {message.role}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.sentiment && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            SENTIMENT_COLORS[message.sentiment]
                          }`}
                        >
                          {message.sentiment}
                        </span>
                      )}
                      {message.intent && (
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan/10 text-cyan">
                          {message.intent}
                        </span>
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.role === 'agent'
                          ? 'bg-purple-50 text-text-primary'
                          : 'bg-blue-50 text-text-primary'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {active.tags.length > 0 && (
              <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
                <div className="text-xs font-medium text-text-secondary mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {active.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-white p-12 ring-1 ring-[#E5E7EB] text-center">
            <p className="text-sm text-text-secondary">Select a transcript to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
