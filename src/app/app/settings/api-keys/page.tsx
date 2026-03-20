'use client';

import { useState, useEffect, useCallback } from 'react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  active: boolean;
}

const STORAGE_KEY = 'att_api_keys';

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'at_';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setKeys(JSON.parse(stored));
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  const persist = useCallback((updated: ApiKey[]) => {
    setKeys(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const createKey = () => {
    const name = newKeyName.trim() || 'Unnamed Key';
    const key = generateKey();
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name,
      key,
      prefix: key.slice(0, 11) + '...',
      createdAt: new Date().toISOString(),
      lastUsed: null,
      active: true,
    };
    setRevealedKey(key);
    setJustCreatedId(newKey.id);
    persist([newKey, ...keys]);
    setNewKeyName('');
  };

  const revokeKey = (id: string) => {
    persist(keys.filter((k) => k.id !== id));
    setConfirmRevoke(null);
    if (justCreatedId === id) {
      setJustCreatedId(null);
      setRevealedKey(null);
    }
  };

  const toggleKey = (id: string) => {
    persist(keys.map((k) => (k.id === id ? { ...k, active: !k.active } : k)));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
            Enterprise
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">API Key Management</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Create and manage API keys for third-party integrations
        </p>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
        <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="text-sm text-amber-300 font-medium">Demo Environment</p>
          <p className="text-xs text-zinc-400 mt-0.5">Keys are stored locally in your browser for this demo. In production, keys would be securely hashed server-side.</p>
        </div>
      </div>

      {/* Create new key */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Generate New API Key</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., PagerDuty Integration)"
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && createKey()}
          />
          <button
            onClick={createKey}
            className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors shrink-0 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Generate
          </button>
        </div>

        {/* Revealed key after creation */}
        {revealedKey && justCreatedId && (
          <div className="mt-4 p-4 rounded-lg border border-green-500/30 bg-green-500/5 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              <span className="text-sm font-medium text-green-400">Key created — copy it now, it won&apos;t be shown again</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-sm font-mono text-green-300 break-all select-all">
                {revealedKey}
              </code>
              <button
                onClick={() => copyToClipboard(revealedKey, 'new')}
                className="px-3 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-800 text-sm text-white transition-colors shrink-0"
              >
                {copied === 'new' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => { setRevealedKey(null); setJustCreatedId(null); }}
              className="mt-2 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Key list */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">Active Keys ({keys.length})</h2>
        </div>

        {keys.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            <p className="text-sm text-zinc-500">No API keys created yet</p>
            <p className="text-xs text-zinc-600 mt-1">Generate your first key above to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {keys.map((k) => (
              <div key={k.id} className="px-6 py-4 flex items-center gap-4">
                {/* Key icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${k.active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{k.name}</span>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${k.active ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-800'}`}>
                      {k.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <code className="text-xs font-mono text-zinc-400">{k.prefix}</code>
                    <button
                      onClick={() => copyToClipboard(k.key, k.id)}
                      className="text-[10px] text-zinc-500 hover:text-green-400 transition-colors"
                    >
                      {copied === k.id ? 'Copied!' : 'Copy full key'}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-zinc-500">
                    <span>Created {formatDate(k.createdAt)}</span>
                    <span>{k.lastUsed ? `Last used ${formatDate(k.lastUsed)}` : 'Never used'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleKey(k.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${k.active ? 'bg-green-500' : 'bg-zinc-700'}`}
                    aria-label={k.active ? 'Deactivate key' : 'Activate key'}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${k.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>

                  {/* Revoke */}
                  {confirmRevoke === k.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => revokeKey(k.id)}
                        className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmRevoke(null)}
                        className="px-2 py-1 text-xs rounded border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRevoke(k.id)}
                      className="px-2.5 py-1 text-xs rounded border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
