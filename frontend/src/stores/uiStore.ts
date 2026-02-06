import { create } from 'zustand'
import type { ViewType } from '@/types'

interface UIState {
  currentView: ViewType;
  sidebarCollapsed: boolean;
  connected: boolean;
  setCurrentView: (view: ViewType) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setConnected: (connected: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'teams',
  sidebarCollapsed: false,
  connected: false,
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setConnected: (connected) => set({ connected }),
}))
