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

      {/* Enterprise Section */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
            Enterprise
          </span>
        </div>
        <div className="space-y-3">
          <a
            href="/app/settings/api-keys"
            className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white">API Key Management</div>
                <div className="text-xs text-zinc-400 mt-0.5">Generate and manage keys for integrations</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>

          <a
            href="/app/settings/roles"
            className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Roles & Permissions</div>
                <div className="text-xs text-zinc-400 mt-0.5">RBAC controls and team member access</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>

          <a
            href="/app/settings/audit"
            className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Audit Log</div>
                <div className="text-xs text-zinc-400 mt-0.5">Track all actions and security events</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
