'use client';

import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.classList.toggle('light', resolved === 'light');
  document.documentElement.classList.toggle('dark', resolved !== 'light');
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('at-theme') as Theme | null;
    const initial = stored || 'dark';
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') applyTheme('system');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  const cycle = () => {
    const order: Theme[] = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    localStorage.setItem('at-theme', next);
    applyTheme(next);
  };

  if (!mounted) return <div className="w-9 h-9" />;

  const resolved = theme === 'system' ? getSystemTheme() : theme;

  return (
    <button
      onClick={cycle}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-700 dark:border-zinc-700 hover:border-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 transition-all duration-200 group"
      title={`Theme: ${theme}`}
      aria-label={`Current theme: ${theme}. Click to cycle.`}
    >
      {/* Sun icon */}
      <svg
        className={`w-4 h-4 absolute transition-all duration-200 ${
          resolved === 'light'
            ? 'opacity-100 rotate-0 scale-100 text-amber-500'
            : 'opacity-0 rotate-90 scale-50 text-amber-500'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      {/* Moon icon */}
      <svg
        className={`w-4 h-4 absolute transition-all duration-200 ${
          resolved === 'dark'
            ? 'opacity-100 rotate-0 scale-100 text-blue-400'
            : 'opacity-0 -rotate-90 scale-50 text-blue-400'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      {/* System indicator dot */}
      {theme === 'system' && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
      )}
    </button>
  );
}
