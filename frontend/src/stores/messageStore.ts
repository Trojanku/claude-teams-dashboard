import { create } from 'zustand'
import type { Message } from '@/types'

interface MessageState {
  messages: Message[];
  filterTeamId: string | null;
  filterAgentName: string | null;
  loading: boolean;
  error: string | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setFilterTeamId: (teamId: string | null) => void;
  setFilterAgentName: (agentName: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  filterTeamId: null,
  filterAgentName: null,
  loading: false,
  error: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setFilterTeamId: (teamId) => set({ filterTeamId: teamId }),
  setFilterAgentName: (agentName) => set({ filterAgentName: agentName }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
