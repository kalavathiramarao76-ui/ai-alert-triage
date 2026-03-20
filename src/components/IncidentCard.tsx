'use client';

import { Incident } from '@/types';
import PriorityBadge from './PriorityBadge';

export default function IncidentCard({ incident }: { incident: Incident }) {
  const statusColors: Record<string, string> = {
    open: 'bg-red-500/15 text-red-400 border-red-500/30',
    investigating: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    mitigated: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden card-hover-lift">
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={incident.priority} />
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColors[incident.status]}`}>
            {incident.status}
          </span>
        </div>
        <span className="text-xs text-zinc-500">
          {new Date(incident.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <h3 className="text-base font-semibold text-white">{incident.title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{incident.summary}</p>

        {incident.commander && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-500">Commander: <span className="text-zinc-300">{incident.commander}</span></span>
            {incident.slackChannel && (
              <span className="text-zinc-500">Channel: <span className="text-green-400">{incident.slackChannel}</span></span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{incident.alerts.length} alert(s)</span>
          <span>|</span>
          <span>Updated {new Date(incident.updatedAt).toLocaleString()}</span>
        </div>

        {incident.timeline.length > 0 && (
          <div className="border-t border-zinc-800 pt-3">
            <h4 className="text-xs font-medium text-zinc-300 mb-2">Timeline</h4>
            <div className="space-y-2">
              {incident.timeline.map((entry, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs text-zinc-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    <p className="text-xs text-zinc-300">{entry.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
