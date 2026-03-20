'use client';

import { useState, useEffect, useMemo } from 'react';
import { audit, AuditEntry, AuditActionType } from '@/lib/audit';

const ACTION_TYPE_COLORS: Record<AuditActionType, string> = {
  triage: 'bg-blue-400/15 text-blue-400',
  incident: 'bg-red-400/15 text-red-400',
  webhook: 'bg-purple-400/15 text-purple-400',
  api_key: 'bg-amber-400/15 text-amber-400',
  settings: 'bg-zinc-400/15 text-zinc-400',
  role: 'bg-indigo-400/15 text-indigo-400',
  login: 'bg-emerald-400/15 text-emerald-400',
};

const ACTION_TYPE_LABELS: Record<AuditActionType, string> = {
  triage: 'Triage',
  incident: 'Incident',
  webhook: 'Webhook',
  api_key: 'API Key',
  settings: 'Settings',
  role: 'Role',
  login: 'Login',
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterType, setFilterType] = useState<AuditActionType | ''>('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    audit.seed();
    setEntries(audit.getAll());
    setMounted(true);
  }, []);

  const uniqueUsers = useMemo(() => {
    const seen = new Map<string, string>();
    entries.forEach((e) => seen.set(e.userId, e.userName));
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [entries]);

  const filtered = useMemo(() => {
    return audit.getFiltered({
      userId: filterUser || undefined,
      actionType: (filterType as AuditActionType) || undefined,
      startDate: filterDateStart ? new Date(filterDateStart).toISOString() : undefined,
      endDate: filterDateEnd ? new Date(filterDateEnd + 'T23:59:59').toISOString() : undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, filterUser, filterType, filterDateStart, filterDateEnd]);

  const handleExport = () => {
    const csv = audit.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/app/settings" className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Log</h1>
            <p className="text-sm text-zinc-400 mt-1">Track all actions across your organization</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="">All Users</option>
            {uniqueUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AuditActionType | '')}
            className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="">All Actions</option>
            {(Object.keys(ACTION_TYPE_LABELS) as AuditActionType[]).map((type) => (
              <option key={type} value={type}>{ACTION_TYPE_LABELS[type]}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDateStart}
            onChange={(e) => setFilterDateStart(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
            placeholder="Start date"
          />
          <input
            type="date"
            value={filterDateEnd}
            onChange={(e) => setFilterDateEnd(e.target.value)}
            className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50"
            placeholder="End date"
          />
        </div>
        {(filterUser || filterType || filterDateStart || filterDateEnd) && (
          <button
            onClick={() => { setFilterUser(''); setFilterType(''); setFilterDateStart(''); setFilterDateEnd(''); }}
            className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activity Timeline
          </h2>
          <span className="text-xs text-zinc-500">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-zinc-500">No audit events match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {filtered.map((entry, idx) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-zinc-800/20 transition-colors audit-stagger"
                style={{ animationDelay: `${Math.min(idx * 50, 500)}ms` }}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  entry.actionType === 'triage' ? 'bg-blue-400/20 text-blue-400' :
                  entry.actionType === 'incident' ? 'bg-red-400/20 text-red-400' :
                  entry.actionType === 'webhook' ? 'bg-purple-400/20 text-purple-400' :
                  entry.actionType === 'api_key' ? 'bg-amber-400/20 text-amber-400' :
                  entry.actionType === 'role' ? 'bg-indigo-400/20 text-indigo-400' :
                  entry.actionType === 'login' ? 'bg-emerald-400/20 text-emerald-400' :
                  'bg-zinc-400/20 text-zinc-400'
                }`}>
                  {entry.userAvatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{entry.userName}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${ACTION_TYPE_COLORS[entry.actionType]}`}>
                      {ACTION_TYPE_LABELS[entry.actionType]}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-0.5">{entry.action}</p>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-zinc-500 flex-shrink-0 text-right">
                  <div>{formatRelativeTime(entry.timestamp)}</div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
