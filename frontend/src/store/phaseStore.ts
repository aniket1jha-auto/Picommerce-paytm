import { create } from 'zustand';
import type { Phase } from '@/types';

export type ThemeMode = 'dark' | 'light';

interface PhaseState {
  phase: Phase;
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  companionCollapsed: boolean;
  setPhase: (phase: Phase) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleCompanion: () => void;
}

const THEME_STORAGE_KEY = 'pi-commerce.theme';

function readInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

function applyThemeClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function persistTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

const initialTheme = readInitialTheme();
applyThemeClass(initialTheme);

export const usePhaseStore = create<PhaseState>((set) => ({
  phase: 'day30',
  theme: initialTheme,
  sidebarCollapsed: false,
  companionCollapsed: false,
  setPhase: (phase) => set({ phase }),
  setTheme: (theme) => {
    applyThemeClass(theme);
    persistTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      applyThemeClass(next);
      persistTheme(next);
      return { theme: next };
    }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleCompanion: () => set((state) => ({ companionCollapsed: !state.companionCollapsed })),
}));
