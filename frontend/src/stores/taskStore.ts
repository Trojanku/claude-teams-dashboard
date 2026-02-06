import { create } from 'zustand'
import type { Task } from '@/types'

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  filterTeamId: string | null;
  loading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  selectTask: (id: string | null) => void;
  setFilterTeamId: (teamId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTaskId: null,
  filterTeamId: null,
  loading: false,
  error: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    })),
  selectTask: (id) => set({ selectedTaskId: id }),
  setFilterTeamId: (teamId) => set({ filterTeamId: teamId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
