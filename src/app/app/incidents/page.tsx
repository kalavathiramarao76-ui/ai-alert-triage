'use client';

import { useState, useEffect } from 'react';
import { Incident } from '@/types';
import { storage } from '@/lib/storage';
import IncidentCard from '@/components/IncidentCard';
import ShareIncident from '@/components/ShareIncident';
import Link from 'next/link';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setIncidents(storage.getIncidents());
  }, []);

  const updateStatus = (id: string, status: Incident['status']) => {
    const updated = incidents.map((inc) =>
      inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc
    );
    setIncidents(updated);
    storage.setIncidents(updated);
  };

  const deleteIncident = (id: string) => {
    const updated = incidents.filter((inc) => inc.id !== id);
    setIncidents(updated);
    storage.setIncidents(updated);
  };

  const copyToClipboard = (incident: Incident) => {
    const text = `🔥 INCIDENT: ${incident.title}
Priority: ${incident.priority}
Status: ${incident.status}
Commander: ${incident.commander || 'TBD'}
Channel: ${incident.slackChannel || 'TBD'}

Summary:
${incident.summary}

Affected Alerts: ${incident.alerts.length}
${incident.alerts.map((a) => `- [${a.priority}] ${a.title}`).join('\n')}

Timeline:
${incident.timeline.map((t) => `- ${t.timestamp}: ${t.event}`).join('\n')}`;

    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Incidents</h1>
          <p className="text-sm text-zinc-400 mt-1">
            AI-generated incident summaries from triaged alerts
          </p>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <div className="mx-auto w-20 h-20 mb-6">
            <svg className="w-20 h-20 text-zinc-700" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth={1}>
              <rect x="16" y="12" width="48" height="56" rx="4" />
              <line x1="26" y1="28" x2="54" y2="28" strokeWidth={2} />
              <line x1="26" y1="38" x2="48" y2="38" />
              <line x1="26" y1="46" x2="42" y2="46" />
              <line x1="26" y1="54" x2="50" y2="54" />
              <circle cx="56" cy="56" r="10" className="text-green-500/30" fill="currentColor" stroke="none" />
              <path d="M52 56l3 3 5-5" className="text-green-500" strokeWidth={2} />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No incidents yet</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Select triaged alerts and create an incident from the Triage view
          </p>
          <Link
            href="/app/triage"
            className="inline-flex px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to Triage View
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="animate-fade-in">
              <IncidentCard incident={incident} />
              <div className="flex items-center gap-2 mt-2 ml-4">
                <select
                  value={incident.status}
                  onChange={(e) => updateStatus(incident.id, e.target.value as Incident['status'])}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-green-500/50"
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="mitigated">Mitigated</option>
                  <option value="resolved">Resolved</option>
                </select>
                <ShareIncident incident={incident} />
                <button
                  onClick={() => copyToClipboard(incident)}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-green-400 border border-zinc-800 hover:border-green-500/30 rounded transition-colors"
                >
                  Copy for Slack
                </button>
                <button
                  onClick={() => deleteIncident(incident.id)}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
