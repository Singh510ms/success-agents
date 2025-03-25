import { create } from 'zustand';
import { agentConfigs as defaultAgentConfigs } from '@/lib/agents/types';
import type { AgentConfig, AgentType } from '@/lib/agents/types';

// Helper to get initial state from localStorage or default configs
const getInitialState = (): AgentConfig[] => {
  if (typeof window !== 'undefined') {
    const savedAgents = localStorage.getItem('agentConfigs');
    if (savedAgents) {
      try {
        return JSON.parse(savedAgents);
      } catch (e) {
        console.error('Failed to parse saved agent configs:', e);
      }
    }
  }
  return defaultAgentConfigs;
};

interface AgentState {
  agents: AgentConfig[];
  toggleAgent: (id: AgentType) => void;
  updateAgentModel: (id: AgentType, modelId: string) => void;
  updateAgentPrompt: (id: AgentType, systemPrompt: string) => void;
  saveAgentChanges: () => void;
}

export const useAgents = create<AgentState>((set) => ({
  agents: getInitialState(),
  toggleAgent: (id) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, enabled: !agent.enabled } : agent
      ),
    })),
  updateAgentModel: (id, modelId) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, model: modelId } : agent
      ),
    })),
  updateAgentPrompt: (id, systemPrompt) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, systemPrompt } : agent
      ),
    })),
  saveAgentChanges: () => {
    set((state) => {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('agentConfigs', JSON.stringify(state.agents));
      }
      console.log('Agent configurations saved');
      return state;
    });
  },
})); 