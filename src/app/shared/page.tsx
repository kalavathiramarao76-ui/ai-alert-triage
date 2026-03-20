'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

interface SharedIncident {
  t: string;       // title
  s: string;       // summary
  p: string;       // priority
  st: string;      // status
  c?: string;      // commander
  sc?: string;     // slackChannel
  ca: string;      // createdAt
  ua: string;      // updatedAt
  al: { t: string; p: string; c: string; svc: string }[];
  tl: { ts: string; e: string; a: string }[];
}

const priorityColors: Record<string, string> = {
  P0: 'bg-red-500/15 text-red-400 border-red-500/30',
  P1: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  P2: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  P3: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  P4: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

const statusColors: Record<string, string> = {
  open: 'bg-red-500/15 text-red-400 border-red-500/30',
  investigating: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  mitigated: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  resolved: 'bg-green-500/15 text-green-400 border-green-500/30',
};

function SharedIncidentView() {
  const searchParams = useSearchParams();
  const data = searchParams.get('d');

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔗</div>
          <h1 className="text-xl font-bold text-white">Invalid Share Link</h1>
          <p className="text-sm text-zinc-400">This link doesn&apos;t contain valid incident data.</p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to AlertTriage
          </Link>
        </div>
      </div>
    );
  }

  let incident: SharedIncident;
  try {
    incident = JSON.parse(decodeURIComponent(atob(data)));
  } catch {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-white">Corrupted Share Link</h1>
          <p className="text-sm text-zinc-400">Could not decode incident data from the URL.</p>
          <Link
            href="/"
            className="inline-flex px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to AlertTriage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              AT
            </div>
            <span className="text-lg font-semibold text-white">AlertTriage</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Read-only view
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden">
          {/* Incident header */}
          <div className="border-b border-zinc-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${priorityColors[incident.p] || priorityColors.P3}`}>
                {incident.p}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${statusColors[incident.st] || statusColors.open}`}>
                {incident.st}
              </span>
            </div>
            <span className="text-xs text-zinc-500">
              Created {new Date(incident.ca).toLocaleString()}
            </span>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-white mb-3">{incident.t}</h1>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{incident.s}</p>
            </div>

            {/* Meta */}
            {(incident.c || incident.sc) && (
              <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                {incident.c && (
                  <span className="text-xs text-zinc-500">
                    Commander: <span className="text-zinc-300 font-medium">{incident.c}</span>
                  </span>
                )}
                {incident.sc && (
                  <span className="text-xs text-zinc-500">
                    Channel: <span className="text-green-400 font-medium">{incident.sc}</span>
                  </span>
                )}
              </div>
            )}

            {/* Affected alerts */}
            {incident.al && incident.al.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-white mb-3">
                  Affected Alerts ({incident.al.length})
                </h2>
                <div className="space-y-2">
                  {incident.al.map((alert, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800"
                    >
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${priorityColors[alert.p] || priorityColors.P3}`}>
                        {alert.p}
                      </span>
                      <span className="text-sm text-zinc-300 flex-1">{alert.t}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{alert.c}</span>
                      <span className="text-[10px] text-zinc-600">{alert.svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {incident.tl && incident.tl.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-white mb-3">Timeline</h2>
                <div className="space-y-3 relative">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-zinc-800" />
                  {incident.tl.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 relative">
                      <div className="w-[11px] h-[11px] rounded-full bg-green-500/20 border-2 border-green-500 mt-0.5 shrink-0 z-10" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(entry.ts).toLocaleTimeString()}
                          </span>
                          <span className="text-[10px] text-zinc-600">{entry.a}</span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-0.5">{entry.e}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800 px-6 py-3 flex items-center justify-between">
            <span className="text-[10px] text-zinc-600">
              Shared from AlertTriage AI
            </span>
            <span className="text-[10px] text-zinc-600">
              Last updated {new Date(incident.ua).toLocaleString()}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500 mb-3">Want AI-powered alert triage for your team?</p>
          <Link
            href="/"
            className="inline-flex px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Get Started with AlertTriage
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SharedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-zinc-400 text-sm">Loading shared incident...</div>
        </div>
      }
    >
      <SharedIncidentView />
    </Suspense>
  );
}
