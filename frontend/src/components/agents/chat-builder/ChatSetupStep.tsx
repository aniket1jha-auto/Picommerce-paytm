import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { AgentConfiguration } from '@/types/agent';
import {
  CHAT_CHANNELS,
  CHAT_USE_CASES,
  CHAT_LANGUAGES,
  instructionStepsForUseCase,
} from '@/data/chatAgentConstants';

interface Props {
  config: AgentConfiguration;
  onSave: (partial: Partial<AgentConfiguration>) => void;
  onNext: () => void;
}

export function ChatSetupStep({ config, onSave, onNext }: Props) {
  const [name, setName] = useState(config.name);
  const [channel, setChannel] = useState(config.chatChannel ?? 'whatsapp');
  const [useCase, setUseCase] = useState(config.useCase || 'recovery_followup');
  const [languages, setLanguages] = useState<string[]>(
    () => (config.chatLanguages?.length ? config.chatLanguages : ['en']),
  );
  const [langOpen, setLangOpen] = useState(false);
  const [displayName, setDisplayName] = useState(config.chatDisplayName ?? '');

  const langSummary = useMemo(() => {
    return languages
      .map((id) => CHAT_LANGUAGES.find((l) => l.id === id)?.label ?? id)
      .join(' · ');
  }, [languages]);

  const toggleLang = (id: string) => {
    setLanguages((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleNext = () => {
    const nextSteps =
      config.useCase !== useCase || config.chatChannel !== channel
        ? instructionStepsForUseCase(useCase, channel)
        : config.instructionSteps;

    onSave({
      name: name.trim(),
      useCase,
      chatChannel: channel,
      chatLanguages: languages,
      chatDisplayName: displayName.trim(),
      description: `Chat · ${CHAT_CHANNELS.find((c) => c.id === channel)?.label ?? channel}`,
      instructionSteps: nextSteps,
    });
    onNext();
  };

  const valid = name.trim() && languages.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-text-primary">Setup</h2>
        <p className="text-sm text-text-secondary">Basic information about your chat agent</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Agent Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya — WhatsApp Support"
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Which channel will this agent handle? *
          </label>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {CHAT_CHANNELS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChannel(c.id)}
                className={[
                  'rounded-lg border-2 p-4 text-left transition-all',
                  channel === c.id
                    ? 'border-cyan bg-cyan/5 shadow-sm'
                    : 'border-[#E5E7EB] hover:border-cyan/40',
                ].join(' ')}
              >
                <div className="mb-2 text-2xl">{c.icon}</div>
                <div className="text-sm font-semibold text-text-primary">{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Use Case *</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CHAT_USE_CASES.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUseCase(u.id)}
                className={[
                  'rounded-lg border-2 p-3 text-left transition-all',
                  useCase === u.id
                    ? 'border-cyan bg-cyan/5 shadow-sm'
                    : 'border-[#E5E7EB] hover:border-cyan/40',
                ].join(' ')}
              >
                <div className="mb-1 text-xl">{u.icon}</div>
                <div className="text-sm font-medium text-text-primary">{u.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Language *</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-left text-sm text-text-primary focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
            >
              <span className={languages.length ? 'text-text-primary' : 'text-text-secondary'}>
                {languages.length ? langSummary : 'Select languages…'}
              </span>
              <span className="text-xs text-text-secondary">{langOpen ? '▲' : '▼'}</span>
            </button>
            {langOpen && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white py-2 shadow-lg">
                {CHAT_LANGUAGES.map((l) => (
                  <label
                    key={l.id}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-[#F9FAFB]"
                  >
                    <input
                      type="checkbox"
                      checked={languages.includes(l.id)}
                      onChange={() => toggleLang(l.id)}
                      className="rounded border-[#E5E7EB] text-cyan focus:ring-cyan"
                    />
                    {l.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1.5 text-xs text-text-secondary">
            Auto-detect responds in the customer&apos;s language
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Priya from Paytm Support"
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20"
          />
          <p className="mt-1.5 text-xs text-text-secondary">
            How the agent introduces itself in the first message
          </p>
        </div>
      </div>

      <div className="flex justify-between border-t border-[#F3F4F6] pt-6">
        <Link
          to="/agents"
          className="inline-flex items-center rounded-md border border-transparent px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-[#F9FAFB] hover:text-text-primary"
        >
          Back
        </Link>
        <button
          type="button"
          onClick={handleNext}
          disabled={!valid}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
