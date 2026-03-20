'use client';

import { useState, useEffect, useRef } from 'react';
import { analytics, AnalyticsData } from '@/lib/analytics';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString()}{suffix}
    </span>
  );
}

function DonutChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return null;

  const colors = [
    { stroke: '#22c55e', bg: 'bg-green-500' },
    { stroke: '#3b82f6', bg: 'bg-blue-500' },
    { stroke: '#f59e0b', bg: 'bg-amber-500' },
    { stroke: '#ef4444', bg: 'bg-red-500' },
    { stroke: '#8b5cf6', bg: 'bg-violet-500' },
  ];

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  const segments = entries.map(([label, value], i) => {
    const pct = value / total;
    const dashLength = pct * circumference;
    const offset = accumulated * circumference;
    accumulated += pct;
    return { label, value, pct, dashLength, offset, color: colors[i % colors.length] };
  });

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-40 h-40 flex-shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={seg.color.stroke}
              strokeWidth="20"
              strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
              strokeDashoffset={-seg.offset}
              className="transition-all duration-700 ease-out"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{total}</span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${seg.color.bg}`} />
            <span className="text-zinc-300 capitalize">{seg.label}</span>
            <span className="text-zinc-500 ml-auto">{Math.round(seg.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d, i) => {
        const heightPct = (d.count / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-400 tabular-nums">{d.count}</span>
            <div className="w-full relative rounded-t-md overflow-hidden" style={{ height: '100px' }}>
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-md transition-all duration-700 ease-out"
                style={{
                  height: `${heightPct}%`,
                  animationDelay: `${i * 80}ms`,
                }}
              />
            </div>
            <span className="text-[10px] text-zinc-500">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return null;
  const flames = streak >= 7 ? '🔥🔥🔥' : streak >= 3 ? '🔥🔥' : '🔥';
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
      <span className="text-base">{flames}</span>
      <span className="text-sm font-semibold text-orange-400">{streak}-day streak</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let d = analytics.get();
    // If no data, seed with mock for demo
    if (d.alertsTriaged === 0) {
      d = analytics.seedMockData();
    }
    setData(d);

    const handler = () => setData(analytics.get());
    window.addEventListener('analytics-updated', handler);
    return () => window.removeEventListener('analytics-updated', handler);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Alerts Triaged',
      value: data.alertsTriaged,
      suffix: '',
      icon: '⚡',
      color: 'from-green-500/20 to-green-500/5 border-green-500/20',
      textColor: 'text-green-400',
    },
    {
      label: 'Incidents Created',
      value: data.incidentsCreated,
      suffix: '',
      icon: '🚨',
      color: 'from-red-500/20 to-red-500/5 border-red-500/20',
      textColor: 'text-red-400',
    },
    {
      label: 'Avg Triage Time',
      value: data.avgTriageTime,
      suffix: 's',
      icon: '⏱️',
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
      textColor: 'text-blue-400',
    },
    {
      label: 'Noise Filtered',
      value: data.noiseFiltered,
      suffix: '',
      icon: '🔇',
      color: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
      textColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usage Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Track your triage performance and alert patterns
          </p>
        </div>
        <StreakBadge streak={data.currentStreak} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${stat.color} p-5 card-hover-lift`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-xs text-zinc-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Alert Categories</h2>
          <DonutChart data={data.categoryBreakdown} />
        </div>

        {/* Bar chart */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-white mb-5">7-Day Activity</h2>
          {data.dailyActivity.length > 0 ? (
            <BarChart data={data.dailyActivity} />
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-zinc-500">
              No activity data yet
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Insights</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
            <span className="text-xl">📊</span>
            <div>
              <div className="text-sm text-white font-medium">
                {data.alertsTriaged > 0
                  ? `${Math.round((data.noiseFiltered / data.alertsTriaged) * 100)}% noise ratio`
                  : '0% noise ratio'}
              </div>
              <div className="text-xs text-zinc-400">Noise vs actionable</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
            <span className="text-xl">🏆</span>
            <div>
              <div className="text-sm text-white font-medium">
                {Object.entries(data.categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
              </div>
              <div className="text-xs text-zinc-400">Top category</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
            <span className="text-xl">⚡</span>
            <div>
              <div className="text-sm text-white font-medium">
                {data.avgTriageTime < 30 ? 'Fast' : data.avgTriageTime < 60 ? 'Good' : 'Needs work'}
              </div>
              <div className="text-xs text-zinc-400">Triage speed rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
