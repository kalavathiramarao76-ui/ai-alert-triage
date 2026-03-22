'use client';

import { useState, useEffect, useCallback } from 'react';
import { TriagedAlert, Priority, Category } from '@/types';
import { storage } from '@/lib/storage';
import { analytics } from '@/lib/analytics';
import AlertCard from '@/components/AlertCard';
import Link from 'next/link';

export default function TriagePage() {
  const [triaged, setTriaged] = useState<TriagedAlert[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [showNoise, setShowNoise] = useState(true);
  const [creatingIncident, setCreatingIncident] = useState(false);

  useEffect(() => {
    setTriaged(storage.getTriagedAlerts());
  }, []);

  const filtered = triaged.filter((a) => {
    if (filterPriority !== 'all' && a.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    if (!showNoise && a.isNoise) return false;
    return true;
  });

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  };

  const createIncident = async () => {
    const selectedAlerts = triaged.filter((a) => selected.has(a.id));
    if (selectedAlerts.length === 0) return;

    setCreatingIncident(true);
    try {
      const response = await fetch('/api/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alerts: selectedAlerts }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        if (errorData.error === 'FREE_LIMIT_REACHED') {
          window.dispatchEvent(new CustomEvent('usage-changed', { detail: errorData.count }));
          return;
        }
      }

      const data = await response.json();
      if (data.incident) {
        const incident = {
          id: `inc-${Date.now()}`,
          title: data.incident.title || 'Incident',
          summary: data.incident.summary || '',
          priority: data.incident.priority || 'P2',
          status: 'investigating' as const,
          alerts: selectedAlerts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          commander: data.incident.commander,
          slackChannel: data.incident.slackChannel,
          timeline: data.incident.timeline || [],
        };
        storage.addIncident(incident);
        analytics.trackIncidentCreated();
        setSelected(new Set());
        window.location.href = '/app/incidents';
      }
    } catch (err) {
      console.error('Failed to create incident:', err);
    } finally {
      setCreatingIncident(false);
    }
  };

  const noiseCount = triaged.filter((a) => a.isNoise).length;
  const criticalCount = triaged.filter((a) => a.priority === 'P0' || a.priority === 'P1').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Triage View</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {triaged.length} alerts triaged | {criticalCount} critical | {noiseCount} noise
          </p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={createIncident}
            disabled={creatingIncident}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {creatingIncident ? 'Creating...' : `Create Incident (${selected.size} alerts)`}
          </button>
        )}
      </div>

      {triaged.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <div className="mx-auto w-20 h-20 mb-6">
            <svg className="w-20 h-20 text-zinc-700" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth={1}>
              <path d="M20 60L40 20L60 60H20Z" />
              <line x1="40" y1="35" x2="40" y2="48" strokeWidth={2} />
              <circle cx="40" cy="54" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No triaged alerts yet</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Go to the Dashboard to submit alerts for AI triage
          </p>
          <Link
            href="/app"
            className="inline-flex px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-xs border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded-lg transition-colors"
            >
              {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>

            <div className="h-4 w-px bg-zinc-800" />

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-green-500/50"
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 Critical</option>
              <option value="P1">P1 High</option>
              <option value="P2">P2 Medium</option>
              <option value="P3">P3 Low</option>
              <option value="P4">P4 Info</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-green-500/50"
            >
              <option value="all">All Categories</option>
              <option value="infra">Infrastructure</option>
              <option value="app">Application</option>
              <option value="network">Network</option>
              <option value="security">Security</option>
              <option value="database">Database</option>
            </select>

            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showNoise}
                onChange={(e) => setShowNoise(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500 focus:ring-offset-0"
              />
              Show noise ({noiseCount})
            </label>

            <span className="ml-auto text-xs text-zinc-500">
              Showing {filtered.length} of {triaged.length}
            </span>
          </div>

          {/* Alert list */}
          <div className="space-y-2">
            {filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                selected={selected.has(alert.id)}
                onSelect={toggleSelect}
                expanded={expandedAlerts.has(alert.id)}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
