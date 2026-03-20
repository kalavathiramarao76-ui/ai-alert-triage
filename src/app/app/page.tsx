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
    <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-20" />
        <div className="skeleton h-5 w-16" />
        <div className="skeleton h-5 w-12" />
      </div>
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 border border-zinc-800 rounded-lg bg-zinc-900/30">
      <div className="mx-auto w-20 h-20 mb-6 relative">
        <svg className="w-20 h-20 text-zinc-700" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth={1}>
          <rect x="10" y="16" width="60" height="48" rx="4" />
          <path d="M10 28h60" />
          <circle cx="20" cy="22" r="2" fill="currentColor" />
          <circle cx="28" cy="22" r="2" fill="currentColor" />
          <circle cx="36" cy="22" r="2" fill="currentColor" />
          <rect x="20" y="36" width="40" height="4" rx="2" className="text-zinc-600" fill="currentColor" />
          <rect x="20" y="46" width="28" height="4" rx="2" className="text-zinc-600" fill="currentColor" />
        </svg>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No alerts yet</h3>
      <p className="text-sm text-zinc-400 max-w-sm mx-auto">
        Paste alert JSON or use the form above to submit alerts for AI-powered triage and classification.
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

      // Track analytics
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time alert management and AI-powered triage
          </p>
        </div>
        {triaged.length > 0 && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 rounded-lg transition-colors"
          >
            Clear All Data
          </button>
        )}
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <AlertInbox onSubmit={handleSubmit} loading={loading} />

          {/* Loading skeletons */}
          {(loading || initialLoading) && triaged.length === 0 && (
            <div className="space-y-2">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Empty state */}
          {!loading && !initialLoading && triaged.length === 0 && (
            <EmptyState />
          )}

          {/* Groups */}
          {groups.length > 0 && (
            <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-4 card-hover-lift">
              <h2 className="text-sm font-semibold text-white mb-3">
                Alert Groups ({groups.length})
              </h2>
              <div className="space-y-2">
                {groups.slice(0, 5).map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800"
                  >
                    <div>
                      <span className="text-sm text-white font-medium">{g.title}</span>
                      {g.rootCause && (
                        <p className="text-xs text-zinc-400 mt-0.5">{g.rootCause}</p>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {g.alerts.length} alert(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent triaged alerts */}
          {recentAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white mb-3">
                Recent Triaged Alerts ({triaged.length})
              </h2>
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
        </div>

        {/* Sidebar metrics */}
        <div className="lg:col-span-1">
          <MetricsPanel metrics={metrics} />
        </div>
      </div>
    </div>
  );
}
