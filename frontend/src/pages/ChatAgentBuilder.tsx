import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChatSetupStep } from '@/components/agents/chat-builder/ChatSetupStep';
import { ChatPromptInstructionsStep } from '@/components/agents/chat-builder/ChatPromptInstructionsStep';
import { ChatTestDeployStep } from '@/components/agents/chat-builder/ChatTestDeployStep';
import { useAgentStore } from '@/store/agentStore';
import type { AgentConfiguration } from '@/types/agent';
import { instructionStepsForUseCase } from '@/data/chatAgentConstants';

const STEPS = [
  { id: 1, name: 'Setup' },
  { id: 2, name: 'Prompt & Instructions' },
  { id: 3, name: 'Test & Deploy' },
];

function buildInitialChatConfig(): AgentConfiguration {
  const useCase = 'recovery_followup';
  const channel = 'whatsapp';
  return {
    name: '',
    description: '',
    type: 'chat',
    useCase,
    templateId: undefined,
    model: 'gpt-realtime-mini',
    voice: 'coral',
    systemPrompt: '',
    personality: { traits: [], tone: 'professional', role: '' },
    objectives: [],
    guidelines: { dos: [], donts: [] },
    instructionSteps: instructionStepsForUseCase(useCase, channel),
    globalToolIds: [],
    flow: { nodes: [], edges: [] },
    builtInTools: [],
    customFunctions: [],
    audioConfig: {
      inputFormat: 'pcm16',
      outputFormat: 'pcm16',
      turnDetection: 'server_vad',
      allowInterruptions: true,
    },
    llmConfig: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0.3,
      presencePenalty: 0.3,
    },
    conversationSettings: {
      silenceTimeout: 5,
      maxDuration: 600,
      endCallPhrases: ['goodbye', 'end call', 'thank you'],
      language: 'en-US',
      speechRate: 1.0,
    },
    compliance: {
      contentFiltering: true,
      piiDetection: true,
      recordingConsent: true,
      tcpaCompliance: true,
    },
    environment: 'test',
    chatChannel: channel,
    chatLanguages: ['en'],
    chatDisplayName: '',
    mustAlwaysRules: [],
    mustNeverRules: [],
  };
}

export function ChatAgentBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<AgentConfiguration>(buildInitialChatConfig);
  const createAgent = useAgentStore((s) => s.createAgent);
  const deployAgent = useAgentStore((s) => s.deployAgent);

  const handleSave = useCallback((partial: Partial<AgentConfiguration>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeploy = (mode: 'deploy' | 'draft'): string => {
    const agent = createAgent({
      ...config,
      type: 'chat',
    });
    if (mode === 'deploy') {
      deployAgent(agent.id);
    }
    return agent.id;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/agents"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-cyan hover:underline"
        >
          ← Agents
        </Link>
        <PageHeader
          title="Create Chat Agent"
          subtitle="Audiences / Agents / New chat agent"
        />
      </div>

      <div className="rounded-lg bg-white p-6 ring-1 ring-[#E5E7EB]">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    currentStep > step.id
                      ? 'border-cyan bg-cyan text-white'
                      : currentStep === step.id
                        ? 'border-cyan bg-white text-cyan'
                        : 'border-[#E5E7EB] bg-white text-text-secondary',
                  ].join(' ')}
                >
                  {currentStep > step.id ? <Check size={20} strokeWidth={2.5} /> : step.id}
                </div>
                <span
                  className={[
                    'text-center text-xs font-medium',
                    currentStep >= step.id ? 'text-text-primary' : 'text-text-secondary',
                  ].join(' ')}
                >
                  {step.name}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={[
                    'mx-2 h-0.5 flex-1 self-start mt-[18px] min-w-[12px] transition-colors',
                    currentStep > step.id ? 'bg-cyan' : 'bg-[#E5E7EB]',
                  ].join(' ')}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 ring-1 ring-[#E5E7EB]">
        {currentStep === 1 && (
          <ChatSetupStep config={config} onSave={handleSave} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <ChatPromptInstructionsStep
            config={config}
            onSave={handleSave}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
        {currentStep === 3 && (
          <ChatTestDeployStep config={config} onPrev={handlePrev} onDeploy={handleDeploy} />
        )}
      </div>
    </div>
  );
}
