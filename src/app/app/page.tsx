'use client';

import { useState, useEffect, useCallback } from 'react';
import { RawAlert, TriagedAlert, AlertGroup } from '@/types';
import { storage } from '@/lib/storage';
import { generateMockMetrics } from '@/lib/mock-data';
import AlertInbox from '@/components/AlertInbox';
import MetricsPanel from '@/components/MetricsPanel';
import AlertCard from '@/components/AlertCard';

export default function DashboardPage() {
  const [triaged, setTriaged] = useState<TriagedAlert[]>([]);
  const [groups, setGroups] = useState<AlertGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTriaged(storage.getTriagedAlerts());
    setGroups(storage.getGroups());
  }, []);

  const handleSubmit = useCallback(async (alerts: Partial<RawAlert>[]) => {
    setLoading(true);
    setError(null);

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

          {/* Groups */}
          {groups.length > 0 && (
            <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-4">
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
