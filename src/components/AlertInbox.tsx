'use client';

import { useState } from 'react';
import { RawAlert } from '@/types';
import { SAMPLE_ALERTS } from '@/lib/mock-data';

interface AlertInboxProps {
  onSubmit: (alerts: Partial<RawAlert>[]) => void;
  loading: boolean;
}

export default function AlertInbox({ onSubmit, loading }: AlertInboxProps) {
  const [mode, setMode] = useState<'paste' | 'form'>('paste');
  const [pasteInput, setPasteInput] = useState('');
  const [formData, setFormData] = useState({ source: 'Custom', title: '', description: '', severity: 'high' });

  const handlePasteSubmit = () => {
    if (!pasteInput.trim()) return;

    try {
      const parsed = JSON.parse(pasteInput);
      const alerts = Array.isArray(parsed) ? parsed : [parsed];
      onSubmit(alerts.map((a: Record<string, string>) => ({
        source: a.source || 'Custom',
        title: a.title || a.name || a.message || a.AlarmName || 'Alert',
        description: a.description || a.body || a.details || a.AlarmDescription || JSON.stringify(a),
        severity: a.severity || a.priority || a.urgency || 'medium',
        rawPayload: JSON.stringify(a, null, 2),
      })));
    } catch {
      onSubmit([{
        source: 'Custom',
        title: pasteInput.slice(0, 100),
        description: pasteInput,
        severity: 'medium',
        rawPayload: pasteInput,
      }]);
    }
  };

  const handleFormSubmit = () => {
    if (!formData.title.trim()) return;
    onSubmit([{
      source: formData.source,
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
    }]);
    setFormData({ source: 'Custom', title: '', description: '', severity: 'high' });
  };

  const loadSamples = () => {
    onSubmit(SAMPLE_ALERTS);
  };

  return (
    <div className="border border-zinc-800/50 rounded-2xl bg-zinc-900/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/40 px-6 py-4">
        <h2 className="text-sm font-semibold text-white tracking-tight">Alert Inbox</h2>
        <div className="flex items-center gap-1 bg-zinc-800/40 rounded-xl p-0.5">
          <button
            onClick={() => setMode('paste')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'paste'
                ? 'bg-zinc-700/80 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Paste JSON
          </button>
          <button
            onClick={() => setMode('form')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'form'
                ? 'bg-zinc-700/80 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {mode === 'paste' ? (
          <div className="space-y-4">
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder='Paste alert JSON from PagerDuty, Datadog, CloudWatch, OpsGenie...'
              className="w-full h-36 bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-4 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 font-mono resize-none transition-all"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handlePasteSubmit}
                disabled={loading || !pasteInput.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-sm font-medium transition-all hover:-translate-y-px active:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Triaging...
                  </span>
                ) : 'Triage Alerts'}
              </button>
              <button
                onClick={loadSamples}
                disabled={loading}
                className="px-5 py-2.5 border border-zinc-800/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-300 rounded-xl text-sm font-medium transition-all"
              >
                Load Samples
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value }))}
                  className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl px-3.5 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 transition-all"
                >
                  <option>PagerDuty</option>
                  <option>Datadog</option>
                  <option>CloudWatch</option>
                  <option>OpsGenie</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData((p) => ({ ...p, severity: e.target.value }))}
                  className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl px-3.5 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 transition-all"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="warning">Warning</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Title</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Alert title..."
                className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-xl px-3.5 py-2.5 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Alert description and details..."
                className="w-full h-24 bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-4 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 resize-none transition-all"
              />
            </div>
            <button
              onClick={handleFormSubmit}
              disabled={loading || !formData.title.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-sm font-medium transition-all hover:-translate-y-px active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Triaging...
                </span>
              ) : 'Submit & Triage'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
