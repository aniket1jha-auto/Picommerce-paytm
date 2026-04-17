import { create } from 'zustand';
import type { Agent, AgentConfiguration, CallTranscript, ABTest } from '@/types/agent';
import { mockAgents, mockTranscripts, mockABTests } from '@/data/mock/agents';

interface AgentState {
  agents: Agent[];
  currentAgent: Agent | null;
  transcripts: CallTranscript[];
  abTests: ABTest[];
  
  // Actions
  setCurrentAgent: (agent: Agent | null) => void;
  getAgentById: (id: string) => Agent | undefined;
  createAgent: (config: AgentConfiguration) => Agent;
  updateAgent: (id: string, config: Partial<AgentConfiguration>) => void;
  deleteAgent: (id: string) => void;
  deployAgent: (id: string) => void;
  pauseAgent: (id: string) => void;
  getTranscriptsForAgent: (agentId: string) => CallTranscript[];
  getABTestsForAgent: (agentId: string) => ABTest[];
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: mockAgents,
  currentAgent: null,
  transcripts: mockTranscripts,
  abTests: mockABTests,

  setCurrentAgent: (agent) => set({ currentAgent: agent }),

  getAgentById: (id) => {
    return get().agents.find((agent) => agent.id === id);
  },

  createAgent: (config) => {
    const newAgent: Agent = {
      id: `agent_${Date.now()}`,
      config,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        avgDuration: 0,
        avgLatency: 0,
        completionRate: 0,
      },
      version: 1,
    };

    set((state) => ({
      agents: [...state.agents, newAgent],
    }));

    return newAgent;
  },

  updateAgent: (id, configUpdate) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              config: { ...agent.config, ...configUpdate },
              updatedAt: new Date().toISOString(),
              version: agent.version + 1,
            }
          : agent
      ),
    }));
  },

  deleteAgent: (id) => {
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    }));
  },

  deployAgent: (id) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status: 'deployed',
              deployedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : agent
      ),
    }));
  },

  pauseAgent: (id) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status: 'paused',
              updatedAt: new Date().toISOString(),
            }
          : agent
      ),
    }));
  },

  getTranscriptsForAgent: (agentId) => {
    return get().transcripts.filter((t) => t.agentId === agentId);
  },

  getABTestsForAgent: (agentId) => {
    return get().abTests.filter((t) => t.agentId === agentId);
  },
}));
