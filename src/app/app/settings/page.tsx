'use client';

import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('at-theme') as Theme | null;
    setTheme(stored || 'dark');
    setMounted(true);
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('at-theme', newTheme);
    const resolved = newTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newTheme;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.toggle('light', resolved === 'light');
    document.documentElement.classList.toggle('dark', resolved !== 'light');
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure your AlertTriage experience</p>
      </div>

      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-1">Appearance</h2>
          <p className="text-xs text-zinc-400 mb-4">Choose your preferred color theme</p>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'dark' as Theme, label: 'Dark', desc: 'Easy on the eyes' },
              { value: 'light' as Theme, label: 'Light', desc: 'Classic bright' },
              { value: 'system' as Theme, label: 'System', desc: 'Match your OS' },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => changeTheme(opt.value)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  theme === opt.value
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                }`}
              >
                <div className="text-sm font-medium text-white">{opt.label}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6">
          <h2 className="text-sm font-semibold text-white mb-1">About</h2>
          <p className="text-xs text-zinc-400">
            AlertTriage AI v0.1.0 — Intelligent alert management for SRE teams.
          </p>
        </div>
      </div>
    </div>
  );
}
