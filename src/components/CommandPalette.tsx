'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Command {
  id: string;
  label: string;
  icon: string;
  href: string;
  keywords: string[];
  category: 'navigation' | 'settings';
}

const commands: Command[] = [
  { id: 'inbox', label: 'Alert Inbox', icon: '📥', href: '/app', keywords: ['inbox', 'alerts', 'dashboard', 'home'], category: 'navigation' },
  { id: 'triage', label: 'Triage Alerts', icon: '⚡', href: '/app/triage', keywords: ['triage', 'classify', 'sort', 'ai'], category: 'navigation' },
  { id: 'incidents', label: 'View Incidents', icon: '🔥', href: '/app/incidents', keywords: ['incidents', 'view', 'open', 'active'], category: 'navigation' },
  { id: 'settings', label: 'Settings', icon: '⚙️', href: '/app/settings', keywords: ['settings', 'preferences', 'config'], category: 'settings' },
  { id: 'apikeys', label: 'API Keys', icon: '🔑', href: '/app/settings/api-keys', keywords: ['api', 'keys', 'tokens', 'auth'], category: 'settings' },
  { id: 'roles', label: 'Roles & Permissions', icon: '🛡️', href: '/app/settings/roles', keywords: ['roles', 'permissions', 'rbac', 'access'], category: 'settings' },
  { id: 'audit', label: 'Audit Log', icon: '📋', href: '/app/settings/audit', keywords: ['audit', 'log', 'history', 'trail'], category: 'settings' },
  { id: 'create-incident', label: 'Create Incident', icon: '🚨', href: '/app/triage', keywords: ['create', 'incident', 'new', 'report'], category: 'navigation' },
  { id: 'favorites', label: 'Favorites', icon: '⭐', href: '/app/favorites', keywords: ['favorites', 'starred', 'saved', 'bookmarks'], category: 'navigation' },
];

const RECENT_KEY = 'at-cmd-recent';
const MAX_RECENT = 5;

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function fuzzyScore(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower === q) return 100;
  if (lower.startsWith(q)) return 90;
  if (lower.includes(q)) return 80;
  let score = 0;
  let qi = 0;
  let lastMatchIdx = -1;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) {
      score += 10;
      if (lastMatchIdx === i - 1) score += 5; // consecutive bonus
      lastMatchIdx = i;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load recent commands
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {}
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredCommands = query.trim()
    ? commands
        .map((cmd) => {
          const labelScore = fuzzyScore(cmd.label, query);
          const keywordScore = Math.max(...cmd.keywords.map((k) => fuzzyScore(k, query)));
          const bestScore = Math.max(labelScore, keywordScore);
          const matches = fuzzyMatch(cmd.label, query) || cmd.keywords.some((k) => fuzzyMatch(k, query));
          return { cmd, score: bestScore, matches };
        })
        .filter((r) => r.matches)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.cmd)
    : (() => {
        // Show recent first, then rest
        const recent = recentIds
          .map((id) => commands.find((c) => c.id === id))
          .filter(Boolean) as Command[];
        const rest = commands.filter((c) => !recentIds.includes(c.id));
        return [...recent, ...rest];
      })();

  const execute = useCallback(
    (cmd: Command) => {
      // Save to recent
      const updated = [cmd.id, ...recentIds.filter((id) => id !== cmd.id)].slice(0, MAX_RECENT);
      setRecentIds(updated);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {}

      setOpen(false);
      router.push(cmd.href);
    },
    [recentIds, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        execute(filteredCommands[selectedIndex]);
      }
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!open) return null;

  const hasRecent = !query.trim() && recentIds.length > 0;
  const recentCount = recentIds.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-zinc-700/50 bg-zinc-900/90 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden cmd-palette-enter">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <svg className="w-5 h-5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">
              No commands found for &ldquo;{query}&rdquo;
            </div>
          )}

          {filteredCommands.map((cmd, i) => {
            const isSelected = i === selectedIndex;
            const isRecentDivider = hasRecent && i === recentCount;

            return (
              <div key={cmd.id}>
                {/* Section labels */}
                {hasRecent && i === 0 && (
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    Recent
                  </div>
                )}
                {isRecentDivider && (
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mt-1 border-t border-zinc-800 pt-2">
                    All Commands
                  </div>
                )}

                <button
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-green-500/10 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg w-6 text-center">{cmd.icon}</span>
                  <span className="text-sm font-medium flex-1">{cmd.label}</span>
                  {cmd.category === 'settings' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                      Settings
                    </span>
                  )}
                  {isSelected && (
                    <kbd className="text-[10px] text-zinc-500">↵</kbd>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-[10px] text-zinc-600">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">↵</kbd> select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">esc</kbd> close</span>
          </div>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
}

/** Inline trigger button for the navbar */
export function CommandPaletteTrigger() {
  const handleClick = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  return (
    <button
      onClick={handleClick}
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      title="Command Palette (⌘K)"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <span>Search...</span>
      <kbd className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-500">⌘K</kbd>
    </button>
  );
}
