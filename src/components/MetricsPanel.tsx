'use client';

import { DashboardMetrics } from '@/types';

export default function MetricsPanel({ metrics }: { metrics: DashboardMetrics }) {
  const maxVolume = Math.max(...metrics.alertVolume.map((v) => v.count), 1);

  return (
    <div className="space-y-8">
      {/* ── Hero stats — massive monospace numbers ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroStat
          label="Total Alerts"
          value={metrics.totalAlerts}
          color="text-white"
        />
        <HeroStat
          label="Active Incidents"
          value={metrics.activeIncidents}
          color="text-red-400"
          pulse={metrics.activeIncidents > 0}
        />
        <HeroStat
          label="Noise Filtered"
          value={`${metrics.noisePercentage}%`}
          color="text-amber-400"
        />
        <HeroStat
          label="Mean Time to Resolve"
          value={`${metrics.mttrMinutes}m`}
          color="text-emerald-400"
        />
      </div>

      {/* ── Priority + Categories + Volume — horizontal cards ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Priority breakdown */}
        <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/20">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] mb-5">
            By Priority
          </h3>
          <div className="space-y-3">
            {(['P0', 'P1', 'P2', 'P3', 'P4'] as const).map((p) => {
              const count = metrics.alertsByPriority[p];
              const total = Math.max(metrics.totalAlerts, 1);
              const pct = Math.round((count / total) * 100);
              const colors: Record<string, string> = {
                P0: 'bg-red-500',
                P1: 'bg-orange-500',
                P2: 'bg-amber-500',
                P3: 'bg-blue-500',
                P4: 'bg-zinc-600',
              };
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500 w-7">{p}</span>
                  <div className="flex-1 h-2 bg-zinc-800/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[p]} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-zinc-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/20">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] mb-5">
            By Category
          </h3>
          <div className="space-y-3">
            {(['infra', 'app', 'network', 'security', 'database'] as const).map((cat) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 capitalize">{cat}</span>
                <span className="text-xl font-mono font-bold text-white tabular-nums">
                  {metrics.alertsByCategory[cat]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert volume sparkline */}
        <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/20">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] mb-5">
            Volume &middot; 24h
          </h3>
          <div className="flex items-end gap-[3px] h-28">
            {metrics.alertVolume.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div
                  className="w-full bg-emerald-500/40 rounded-sm transition-all duration-300 group-hover:bg-emerald-400/70 min-h-[2px]"
                  style={{ height: `${(v.count / maxVolume) * 100}%` }}
                  title={`${v.hour}: ${v.count} alerts`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-zinc-700">24h ago</span>
            <span className="text-[10px] text-zinc-700">Now</span>
          </div>
        </div>
      </div>

      {/* ── Top offenders — inline ── */}
      {metrics.topOffenders.length > 0 && (
        <div className="border border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/20">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] mb-5">
            Top Alert Sources
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.topOffenders.map((o, i) => (
              <div key={i} className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-1">
                <span className="text-sm text-zinc-400 truncate">{o.service}</span>
                <span className="text-2xl font-mono font-bold text-white tabular-nums">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HeroStat({
  label,
  value,
  color,
  pulse,
}: {
  label: string;
  value: string | number;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className="relative border border-zinc-800/50 rounded-2xl p-6 bg-zinc-900/20 overflow-hidden group hover:border-zinc-700/50 transition-colors">
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.15em] mb-3">
          {label}
        </p>
        <p className={`text-4xl sm:text-5xl font-bold font-mono tabular-nums tracking-tight ${color} ${pulse ? 'animate-pulse' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
