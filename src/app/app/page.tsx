'use client';

import { useState, useEffect, useCallback } from 'react';
import { RawAlert, TriagedAlert, AlertGroup } from '@/types';
import { storage } from '@/lib/storage';
import { analytics } from '@/lib/analytics';
import { generateMockMetrics } from '@/lib/mock-data';
import AlertInbox from '@/components/AlertInbox';
import MetricsPanel from '@/components/MetricsPanel';
import AlertCard from '@/components/AlertCard';

function SkeletonCard() {
  return (
    <div className="border border-zinc-800/60 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton h-5 w-24 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 border border-zinc-800/40 rounded-2xl bg-zinc-900/20">
      <div className="mx-auto w-24 h-24 mb-8 relative">
        <svg className="w-24 h-24 text-zinc-800" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth={0.75}>
          <rect x="10" y="16" width="60" height="48" rx="6" />
          <path d="M10 28h60" />
          <circle cx="20" cy="22" r="2" fill="currentColor" />
          <circle cx="28" cy="22" r="2" fill="currentColor" />
          <circle cx="36" cy="22" r="2" fill="currentColor" />
          <rect x="20" y="36" width="40" height="3" rx="1.5" className="text-zinc-700" fill="currentColor" />
          <rect x="20" y="45" width="28" height="3" rx="1.5" className="text-zinc-700" fill="currentColor" />
        </svg>
        <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">No alerts yet</h3>
      <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
        Paste alert JSON or use the form to submit alerts for AI-powered triage and classification.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [triaged, setTriaged] = useState<TriagedAlert[]>([]);
  const [groups, setGroups] = useState<AlertGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTriaged(storage.getTriagedAlerts());
    setGroups(storage.getGroups());
    setInitialLoading(false);
  }, []);

  const handleSubmit = useCallback(async (alerts: Partial<RawAlert>[]) => {
    setLoading(true);
    setError(null);
    const triageStart = Date.now();

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alerts }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        if (errorData.error === 'FREE_LIMIT_REACHED') {
          window.dispatchEvent(new CustomEvent('usage-changed', { detail: errorData.count }));
          return;
        }
      }

      const data = await response.json();

      if (data.error && !data.triaged) {
        throw new Error(data.error);
      }

      const now = new Date().toISOString();
      const triagedAlerts: TriagedAlert[] = (data.triaged || []).map(
        (t: Partial<TriagedAlert>, i: number) => ({
          id: `alert-${Date.now()}-${i}`,
          source: alerts[i]?.source || t.source || 'unknown',
          title: t.title || alerts[i]?.title || 'Alert',
          description: t.description || alerts[i]?.description || '',
          severity: alerts[i]?.severity || 'medium',
          timestamp: now,
          rawPayload: alerts[i]?.rawPayload || '',
          status: t.isNoise ? 'noise' as const : 'triaged' as const,
          priority: t.priority || 'P3',
          category: t.category || 'app',
          affectedService: t.affectedService || 'unknown',
          isNoise: t.isNoise || false,
          noiseReason: t.noiseReason,
          duplicateGroupId: t.duplicateGroupId,
          suggestedActions: t.suggestedActions || [],
          escalationPath: t.escalationPath || 'N/A',
          runbookUrl: t.runbookUrl,
          confidence: t.confidence || 75,
          triageTimestamp: now,
        })
      );

      const newGroups: AlertGroup[] = (data.groups || []).map(
        (g: Partial<AlertGroup>) => ({
          id: g.id || `group-${Date.now()}`,
          title: g.title || 'Alert Group',
          alerts: triagedAlerts.filter((a) => a.duplicateGroupId === g.id),
          rootCause: g.rootCause,
        })
      );

      storage.addTriagedAlerts(triagedAlerts);
      storage.addGroups(newGroups);

      const triageTimeMs = Date.now() - triageStart;
      const categories = triagedAlerts.map((a) => a.category || 'app');
      analytics.trackTriage(triagedAlerts.length, categories, triageTimeMs);
      const noiseCount = triagedAlerts.filter((a) => a.isNoise).length;
      if (noiseCount > 0) analytics.trackNoiseFiltered(noiseCount);

      setTriaged((prev) => [...triagedAlerts, ...prev]);
      setGroups((prev) => [...newGroups, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Triage failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearAll = () => {
    storage.clearAll();
    setTriaged([]);
    setGroups([]);
  };

  const metrics = generateMockMetrics(triaged);
  const recentAlerts = triaged.slice(0, 20);

  return (
    <div className="animate-fade-in">
      {/* Noise texture — same as landing page */}
      <div className="noise-overlay" />

      {/* ── Hero header ── */}
      <section className="pt-4 pb-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-emerald-500 uppercase tracking-[0.2em] mb-3">
              Dashboard
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
              Alert Triage
            </h1>
            <p className="text-base text-zinc-500 mt-3 max-w-lg leading-relaxed">
              AI-powered alert management. Real-time classification, noise reduction, and intelligent routing.
            </p>
          </div>
          {triaged.length > 0 && (
            <button
              onClick={clearAll}
              className="shrink-0 px-4 py-2 text-xs font-medium text-zinc-500 hover:text-red-400 border border-zinc-800/60 hover:border-red-500/30 rounded-xl transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </section>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-8 border border-red-500/20 bg-red-500/5 rounded-2xl p-5 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Stats hero — full-width massive numbers ── */}
      <section className="mb-10">
        <MetricsPanel metrics={metrics} />
      </section>

      {/* ── Main content ── */}
      <section className="space-y-10">
        {/* Alert Inbox */}
        <AlertInbox onSubmit={handleSubmit} loading={loading} />

        {/* Loading skeletons */}
        {(loading || initialLoading) && triaged.length === 0 && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Empty state */}
        {!loading && !initialLoading && triaged.length === 0 && (
          <EmptyState />
        )}

        {/* ── Alert Groups ── */}
        {groups.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-white tracking-tight">Correlated Groups</h2>
              <span className="text-xs font-mono text-zinc-600 bg-zinc-800/50 px-2.5 py-1 rounded-full">
                {groups.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.slice(0, 6).map((g) => (
                <div
                  key={g.id}
                  className="group border border-zinc-800/50 rounded-2xl p-5 bg-zinc-900/20 hover:border-zinc-700/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                        {g.title}
                      </h3>
                      {g.rootCause && (
                        <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">{g.rootCause}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-2xl font-mono font-bold text-zinc-600">
                      {g.alerts.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Triaged Alerts ── */}
        {recentAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-white tracking-tight">Recent Alerts</h2>
              <span className="text-xs font-mono text-zinc-600 bg-zinc-800/50 px-2.5 py-1 rounded-full">
                {triaged.length}
              </span>
            </div>
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  expanded={expandedAlerts.has(alert.id)}
                  onToggleExpand={toggleExpand}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Bottom breathing room */}
      <div className="h-16" />
    </div>
  );
}
