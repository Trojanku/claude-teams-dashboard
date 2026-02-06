import { create } from 'zustand'
import type { Agent, AgentActivity } from '@/types'

interface AgentState {
  agents: Agent[];
  activities: AgentActivity[];
  selectedAgentId: string | null;
  loading: boolean;
  error: string | null;
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  addActivity: (activity: AgentActivity) => void;
  setActivities: (activities: AgentActivity[]) => void;
  selectAgent: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  activities: [],
  selectedAgentId: null,
  loading: false,
  error: null,
  setAgents: (agents) => set({ agents }),
  updateAgent: (agentId, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.agentId === agentId ? { ...a, ...updates } : a)),
    })),
  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 200),
    })),
  setActivities: (activities) => set({ activities }),
  selectAgent: (id) => set({ selectedAgentId: id }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
