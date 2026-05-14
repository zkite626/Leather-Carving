'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';
import styles from './theme-toggle.module.css';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useUIStore();

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    try {
      const stored = localStorage.getItem('lc-theme');
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
        return;
      }
    } catch {
      // localStorage may be unavailable
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, [setTheme]);

  const classNames = [styles.toggle, className].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      type="button"
    >
      {/* Sun icon (visible in dark mode) */}
      <svg
        className={`${styles.icon} ${styles.sunIcon}`}
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9" cy="9" r="3.75" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 1.5V3M9 15V16.5M1.5 9H3M15 9H16.5M3.705 3.705L4.765 4.765M13.235 13.235L14.295 14.295M3.705 14.295L4.765 13.235M13.235 4.765L14.295 3.705" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Moon icon (visible in light mode) */}
      <svg
        className={`${styles.icon} ${styles.moonIcon}`}
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.75 9.9375C15.3728 13.0159 12.7785 15.375 9.5625 15.375C5.94459 15.375 3 12.4304 3 8.8125C3 5.59649 5.35909 3.00221 8.4375 2.625C7.6189 3.91994 7.3125 5.47319 7.3125 7.125C7.3125 10.5441 9.95595 13.3125 13.3125 13.3125C14.9643 13.3125 16.5176 13.0061 17.8125 12.1875L15.75 9.9375Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
