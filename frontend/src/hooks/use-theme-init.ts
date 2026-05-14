'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';

export function useThemeInit(): void {
  const setTheme = useUIStore((s) => s.setTheme);

  useEffect(() => {
    const stored = localStorage.getItem('lc-theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [setTheme]);
}
