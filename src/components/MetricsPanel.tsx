'use client';

import { DashboardMetrics } from '@/types';

export default function MetricsPanel({ metrics }: { metrics: DashboardMetrics }) {
  const maxVolume = Math.max(...metrics.alertVolume.map((v) => v.count), 1);

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Alerts" value={metrics.totalAlerts} color="text-white" />
        <StatCard title="Active Incidents" value={metrics.activeIncidents} color="text-red-400" />
        <StatCard title="Noise Rate" value={`${metrics.noisePercentage}%`} color="text-yellow-400" />
        <StatCard title="Avg MTTR" value={`${metrics.mttrMinutes}m`} color="text-green-400" />
      </div>

      {/* Priority breakdown */}
      <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Alerts by Priority</h3>
        <div className="space-y-2">
          {(['P0', 'P1', 'P2', 'P3', 'P4'] as const).map((p) => {
            const count = metrics.alertsByPriority[p];
            const total = Math.max(metrics.totalAlerts, 1);
            const pct = Math.round((count / total) * 100);
            const colors: Record<string, string> = {
              P0: 'bg-red-500', P1: 'bg-orange-500', P2: 'bg-yellow-500', P3: 'bg-blue-500', P4: 'bg-zinc-500',
            };
            return (
              <div key={p} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-6">{p}</span>
                <div className="flex-1 h-5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${colors[p]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-zinc-400 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Alerts by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['infra', 'app', 'network', 'security', 'database'] as const).map((cat) => (
            <div key={cat} className="text-center p-2 rounded-lg bg-zinc-800/50">
              <div className="text-lg font-bold text-white">{metrics.alertsByCategory[cat]}</div>
              <div className="text-xs text-zinc-400 capitalize">{cat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert volume chart */}
      <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Alert Volume (24h)</h3>
        <div className="flex items-end gap-0.5 h-32">
          {metrics.alertVolume.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full bg-green-500/60 rounded-t transition-all duration-300 hover:bg-green-500 min-h-[2px]"
                style={{ height: `${(v.count / maxVolume) * 100}%` }}
                title={`${v.hour}: ${v.count} alerts`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-zinc-600">24h ago</span>
          <span className="text-[10px] text-zinc-600">Now</span>
        </div>
      </div>

      {/* Top offenders */}
      {metrics.topOffenders.length > 0 && (
        <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Top Alert Sources</h3>
          <div className="space-y-2">
            {metrics.topOffenders.map((o, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{o.service}</span>
                <span className="text-sm font-mono text-green-400">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50">
      <div className="text-xs text-zinc-500 uppercase tracking-wider">{title}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
