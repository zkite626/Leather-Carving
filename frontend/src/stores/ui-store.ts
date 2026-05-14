import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  sidebarCollapsed: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed: boolean) =>
    set({ sidebarCollapsed: collapsed }),

  setTheme: (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('lc-theme', theme);
    } catch {
      // localStorage may be unavailable
    }
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('lc-theme', newTheme);
      } catch {
        // localStorage may be unavailable
      }
      return { theme: newTheme };
    }),
}));
