import { create } from 'zustand'
import type { Team } from '@/types'

interface TeamState {
  teams: Team[];
  selectedTeamId: string | null;
  loading: boolean;
  error: string | null;
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;
  selectTeam: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  selectedTeamId: null,
  loading: false,
  error: null,
  setTeams: (teams) => set({ teams }),
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
      selectedTeamId: state.selectedTeamId === id ? null : state.selectedTeamId,
    })),
  selectTeam: (id) => set({ selectedTeamId: id }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
