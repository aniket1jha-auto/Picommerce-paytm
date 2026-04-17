import { create } from 'zustand';
import type { Phase } from '@/types';

interface PhaseState {
  phase: Phase;
  sidebarCollapsed: boolean;
  companionCollapsed: boolean;
  setPhase: (phase: Phase) => void;
  toggleSidebar: () => void;
  toggleCompanion: () => void;
}

export const usePhaseStore = create<PhaseState>((set) => ({
  phase: 'day30',
  sidebarCollapsed: false,
  companionCollapsed: false,
  setPhase: (phase) => set({ phase }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleCompanion: () => set((state) => ({ companionCollapsed: !state.companionCollapsed })),
}));
