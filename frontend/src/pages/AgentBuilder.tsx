import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BasicInfoStep } from '@/components/agents/builder/BasicInfoStep';
import { ModelVoiceStep } from '@/components/agents/builder/ModelVoiceStep';
import { PromptStep } from '@/components/agents/builder/PromptStep';
import { InstructionsStep } from '@/components/agents/builder/InstructionsStep';
import { AdvancedStep } from '@/components/agents/builder/AdvancedStep';
import { ReviewStep } from '@/components/agents/builder/ReviewStep';
import { useAgentStore } from '@/store/agentStore';
import type { AgentConfiguration } from '@/types/agent';

const STEPS = [
  { id: 1, name: 'Basic Info', component: BasicInfoStep },
  { id: 2, name: 'Model & Voice', component: ModelVoiceStep },
  { id: 3, name: 'System Prompt', component: PromptStep },
  { id: 4, name: 'Instructions', component: InstructionsStep },
  { id: 5, name: 'Advanced Settings', component: AdvancedStep },
  { id: 6, name: 'Review & Deploy', component: ReviewStep },
];

const DEFAULT_CONFIG: AgentConfiguration = {
  name: '',
  description: '',
  type: 'voice',
  useCase: 'sales',
  model: 'gpt-realtime-mini',
  voice: 'coral',
  systemPrompt: '',
  personality: {
    traits: [],
    tone: 'professional',
    role: '',
  },
  objectives: [],
  guidelines: {
    dos: [],
    donts: [],
  },
  instructionSteps: [
    {
      id: 'ins-default-1',
      instruction: '',
      transitionCondition: '',
      attachedToolIds: [],
    },
  ],
  globalToolIds: [],
  flow: {
    nodes: [],
    edges: [],
  },
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
};

export function AgentBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<AgentConfiguration>(DEFAULT_CONFIG);
  const navigate = useNavigate();
  const createAgent = useAgentStore((s) => s.createAgent);

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = (stepConfig: Partial<AgentConfiguration>) => {
    setConfig({ ...config, ...stepConfig });
  };

  const handleDeploy = () => {
    const agent = createAgent(config);
    navigate(`/agents/${agent.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create Agent"
        subtitle="Build and configure your AI agent step by step"
      />

      {/* Progress Steps */}
      <div className="rounded-lg bg-white p-6 ring-1 ring-[#E5E7EB]">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    currentStep > step.id
                      ? 'border-cyan bg-cyan text-white'
                      : currentStep === step.id
                      ? 'border-cyan bg-white text-cyan'
                      : 'border-[#E5E7EB] bg-white text-text-secondary'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check size={20} strokeWidth={2.5} />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    currentStep >= step.id ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    currentStep > step.id ? 'bg-cyan' : 'bg-[#E5E7EB]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-lg bg-white p-6 ring-1 ring-[#E5E7EB]">
        <CurrentStepComponent
          config={config}
          onSave={handleSave}
          onNext={handleNext}
          onPrev={handlePrev}
          onDeploy={handleDeploy}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === STEPS.length}
        />
      </div>
    </div>
  );
}
