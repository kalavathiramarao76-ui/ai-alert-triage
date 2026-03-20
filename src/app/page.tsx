import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 grid-bg">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              AT
            </div>
            <span className="text-lg font-semibold text-white">AlertTriage</span>
          </div>
          <Link
            href="/app"
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">AI-Powered Alert Intelligence</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight tracking-tight">
            Cut through
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500"> alert noise</span>
            <br />with AI triage
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Stop drowning in alerts. AlertTriage uses AI to classify, deduplicate, and prioritize
            your alerts from PagerDuty, Datadog, CloudWatch, and more — so your SRE team can
            focus on what actually matters.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/app"
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors glow-green"
            >
              Start Triaging Alerts
            </Link>
            <a
              href="#features"
              className="px-6 py-3 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Terminal mockup */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="border border-zinc-800 rounded-lg bg-zinc-900/80 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">alert-triage --analyze</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-2">
              <p className="text-zinc-500">$ Analyzing 47 incoming alerts...</p>
              <p className="text-green-400">✓ 12 alerts classified as P0/P1 critical</p>
              <p className="text-yellow-400">⚡ 8 duplicate groups identified</p>
              <p className="text-zinc-400">↳ Merged into 3 root cause clusters</p>
              <p className="text-blue-400">◈ 19 alerts flagged as noise (40% reduction)</p>
              <p className="text-green-400">✓ 5 incident summaries auto-generated</p>
              <p className="text-zinc-500">$ Actions recommended for all triaged alerts</p>
              <p className="text-emerald-400 animate-pulse">█</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything your SRE team needs
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integration sources */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-800/50">
        <h3 className="text-center text-sm text-zinc-500 uppercase tracking-wider mb-8">
          Works with your existing alerting stack
        </h3>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {['PagerDuty', 'Datadog', 'CloudWatch', 'OpsGenie', 'Grafana', 'Custom JSON'].map((s) => (
            <div
              key={s}
              className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/30 text-sm text-zinc-400 font-medium"
            >
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center border border-zinc-800 rounded-2xl p-12 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to tame your alert storm?</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            Paste your alerts, let AI do the triage. No setup, no API keys, no configuration.
          </p>
          <Link
            href="/app"
            className="inline-flex px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors glow-green"
          >
            Launch AlertTriage
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-xs text-zinc-600">AlertTriage AI - Built for SRE teams</span>
          <span className="text-xs text-zinc-600">Powered by AI</span>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '⚡',
    title: 'AI Priority Classification',
    description: 'Automatically classify alerts P0-P4 with category tagging (infra, app, network, security, database) and affected service identification.',
  },
  {
    icon: '🔗',
    title: 'Smart Deduplication',
    description: 'AI identifies duplicate and related alerts, grouping them by root cause to reduce ticket volume by up to 60%.',
  },
  {
    icon: '🔇',
    title: 'Noise Reduction',
    description: 'Flag false positives, flapping alerts, and low-signal noise. Know which alerts to ignore and which demand immediate action.',
  },
  {
    icon: '📋',
    title: 'Action Recommender',
    description: 'Get AI-suggested immediate actions, escalation paths, and relevant runbook links for every triaged alert.',
  },
  {
    icon: '🔥',
    title: 'Incident Generator',
    description: 'Auto-generate incident summaries from triaged alerts, complete with timelines, impact assessment, and Slack-ready comms.',
  },
  {
    icon: '📊',
    title: 'Real-time Dashboard',
    description: 'Monitor alert volume, priority distribution, noise percentage, MTTR trends, and top offending services at a glance.',
  },
];
