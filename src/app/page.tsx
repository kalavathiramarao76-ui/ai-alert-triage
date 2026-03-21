'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

function useScrollFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollFadeIn();
  return (
    <div ref={ref} className={`fade-section ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-[#09090b] text-white antialiased">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#09090b]/80">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">AlertTriage</span>
          </div>
          <Link
            href="/app"
            className="px-4 py-1.5 bg-white text-[#09090b] rounded-md text-xs font-semibold hover:-translate-y-px transition-transform duration-200"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-32 px-6">
        {/* Subtle top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono mb-8">
            Intelligent alert triage for SRE teams
          </p>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] text-balance">
            Triage alerts in
            <br />
            <span className="text-emerald-400">seconds</span>, not hours.
          </h1>
          <p className="mt-8 text-base sm:text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
            AI classifies, deduplicates, and prioritizes your PagerDuty, Datadog,
            and CloudWatch alerts so your team focuses on what matters.
          </p>
          <div className="mt-12">
            <Link
              href="/app"
              className="inline-flex px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#09090b] rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]"
            >
              Start triaging alerts
            </Link>
          </div>
        </div>
      </section>

      {/* ── Integrations strip ── */}
      <FadeSection className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-8 font-mono">
            Works with your stack
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['PagerDuty', 'Datadog', 'CloudWatch', 'OpsGenie', 'Grafana'].map((s) => (
              <span
                key={s}
                className="text-sm text-zinc-500 font-medium px-4 py-2 border border-white/5 rounded-md bg-white/[0.02]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ── Editorial Feature 1 ── */}
      <FadeSection className="py-32 px-6">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-500/80 font-mono mb-4">
              Classification
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              47 alerts arrive.<br />
              <span className="text-zinc-500">12 actually matter.</span>
            </h2>
            <p className="mt-6 text-base text-zinc-500 leading-relaxed max-w-md">
              AI assigns P0 through P4 priority, tags by category -- infrastructure,
              application, network, security, database -- and identifies the affected service.
              Your team stops guessing and starts resolving.
            </p>
          </div>
          <div className="border border-white/5 rounded-lg bg-white/[0.02] p-6 font-mono text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-zinc-400">P0</span>
                <span className="text-white">API latency &gt; 5s — payments-svc</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-zinc-400">P0</span>
                <span className="text-white">Database connection pool exhausted</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-zinc-400">P1</span>
                <span className="text-white">Error rate spike — checkout-svc</span>
              </div>
              <div className="h-px bg-white/5 my-4" />
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="text-zinc-600">P4</span>
                <span className="text-zinc-600">CPU 72% on staging-worker-03</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="text-zinc-600">P4</span>
                <span className="text-zinc-600">Disk usage warning — logs volume</span>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── Editorial Feature 2 ── */}
      <FadeSection className="py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 border border-white/5 rounded-lg bg-white/[0.02] p-6 font-mono text-sm">
            <div className="space-y-2">
              <p className="text-zinc-600">## Root Cause Cluster</p>
              <p className="text-emerald-400">3 alerts → 1 incident</p>
              <div className="h-px bg-white/5 my-3" />
              <p className="text-zinc-400">
                <span className="text-amber-400">src:</span> payments-svc, checkout-svc, db-primary
              </p>
              <p className="text-zinc-400">
                <span className="text-amber-400">cause:</span> connection pool exhaustion on db-primary
              </p>
              <p className="text-zinc-400">
                <span className="text-amber-400">impact:</span> payment processing degraded
              </p>
              <p className="text-zinc-400">
                <span className="text-amber-400">action:</span> increase pool_size, restart pgbouncer
              </p>
              <div className="h-px bg-white/5 my-3" />
              <p className="text-zinc-600">19 alerts flagged as noise. Suppressed.</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-500/80 font-mono mb-4">
              Deduplication
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Kill the noise.<br />
              <span className="text-zinc-500">See the signal.</span>
            </h2>
            <p className="mt-6 text-base text-zinc-500 leading-relaxed max-w-md">
              AI groups duplicates and related alerts by root cause. 47 alerts
              collapse into 3 incident clusters. Your team deals with causes,
              not symptoms, reducing ticket volume by up to 60%.
            </p>
          </div>
        </div>
      </FadeSection>

      {/* ── Editorial Feature 3 ── */}
      <FadeSection className="py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-500/80 font-mono mb-4">
              Incident Response
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              From alert to<br />
              <span className="text-zinc-500">incident summary.</span>
            </h2>
            <p className="mt-6 text-base text-zinc-500 leading-relaxed max-w-md">
              Auto-generate incident reports with timeline, impact assessment, and
              recommended actions. Copy to Slack, page the right team, and start
              the war room -- all from one triage result.
            </p>
          </div>
          <div className="border border-white/5 rounded-lg bg-white/[0.02] p-6 font-mono text-sm space-y-3">
            <p className="text-emerald-400 font-semibold">INC-2847 — Payment Processing Degradation</p>
            <div className="h-px bg-white/5" />
            <div className="space-y-2 text-zinc-400">
              <p><span className="text-zinc-600">14:32</span> DB connection pool alerts begin</p>
              <p><span className="text-zinc-600">14:33</span> API latency exceeds SLO threshold</p>
              <p><span className="text-zinc-600">14:35</span> Checkout error rate spikes to 12%</p>
              <p><span className="text-zinc-600">14:36</span> AI triage: root cause identified</p>
            </div>
            <div className="h-px bg-white/5" />
            <p className="text-zinc-500 text-xs">Slack message drafted. On-call engineer paged.</p>
          </div>
        </div>
      </FadeSection>

      {/* ── How It Works ── */}
      <FadeSection className="py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 font-mono mb-4 text-center">
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-20">
            Three steps. Zero config.
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                num: '01',
                title: 'Ingest',
                desc: 'Pipe alerts from any source via webhook. PagerDuty, Datadog, CloudWatch, or raw JSON.',
              },
              {
                num: '02',
                title: 'Analyze',
                desc: 'AI classifies priority, detects duplicates, identifies root cause clusters, and filters noise.',
              },
              {
                num: '03',
                title: 'Act',
                desc: 'Get prioritized incidents with recommended actions, auto-generated summaries, and escalation paths.',
              },
            ].map((step) => (
              <div key={step.num}>
                <span className="text-5xl font-bold text-white/[0.06] block mb-4 font-mono">
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ── Terminal Demo ── */}
      <FadeSection className="py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 font-mono mb-4 text-center">
            Live triage
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-16">
            Watch it work.
          </h2>
          <div className="border border-white/[0.06] rounded-xl bg-[#0c0c0e] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-xs text-zinc-600 font-mono">alert-triage --analyze</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-3 leading-relaxed">
              <p className="text-zinc-600">$ Ingesting 47 alerts from 3 sources...</p>
              <p className="text-zinc-400">  PagerDuty &nbsp;&nbsp;→ 22 alerts</p>
              <p className="text-zinc-400">  Datadog &nbsp;&nbsp;&nbsp;&nbsp;→ 18 alerts</p>
              <p className="text-zinc-400">  CloudWatch &nbsp;→ &nbsp;7 alerts</p>
              <div className="h-px bg-white/5 my-4" />
              <p className="text-emerald-400">  12 classified P0/P1 critical</p>
              <p className="text-amber-400"> &nbsp;8 duplicate groups → merged into 3 clusters</p>
              <p className="text-zinc-500">  19 alerts flagged as noise (40% reduction)</p>
              <div className="h-px bg-white/5 my-4" />
              <p className="text-emerald-400">  5 incident summaries generated</p>
              <p className="text-emerald-400">  Recommended actions attached</p>
              <p className="text-zinc-600">$ Done in 2.3s</p>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── Stats / Social Proof ── */}
      <FadeSection className="py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 font-mono mb-12 text-center">
            Trusted by SRE teams
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '60%', label: 'noise reduction' },
              { value: '2.3s', label: 'avg triage time' },
              { value: '3x', label: 'faster MTTR' },
              { value: '47→3', label: 'alert compression' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-zinc-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ── Bottom CTA ── */}
      <FadeSection className="py-40 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            Stop drowning<br />in alerts.
          </h2>
          <p className="mt-8 text-base text-zinc-500 max-w-md mx-auto">
            No setup. No API keys. Paste alerts, get triage.
          </p>
          <div className="mt-12">
            <Link
              href="/app"
              className="inline-flex px-10 py-4 bg-white text-[#09090b] rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-px hover:shadow-[0_0_60px_rgba(255,255,255,0.1)]"
            >
              Launch AlertTriage
            </Link>
          </div>
        </div>
      </FadeSection>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-xs text-zinc-700 font-mono">AlertTriage</span>
          <span className="text-xs text-zinc-700 font-mono">Built for SRE teams</span>
        </div>
      </footer>
    </div>
  );
}
