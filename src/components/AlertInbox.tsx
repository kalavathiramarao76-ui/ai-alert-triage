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
      // Treat as plain text alert
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
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Alert Inbox</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('paste')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'paste' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Paste JSON
          </button>
          <button
            onClick={() => setMode('form')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'form' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      <div className="p-4">
        {mode === 'paste' ? (
          <div className="space-y-3">
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder='Paste alert JSON from PagerDuty, Datadog, CloudWatch, OpsGenie, or any custom format...\n\nExample:\n[{"title": "High CPU", "description": "CPU > 95%", "source": "Datadog", "severity": "critical"}]'
              className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-green-500/50 font-mono resize-none"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handlePasteSubmit}
                disabled={loading || !pasteInput.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? 'Triaging...' : 'Triage Alerts'}
              </button>
              <button
                onClick={loadSamples}
                disabled={loading}
                className="px-4 py-2 border border-zinc-700 hover:border-zinc-600 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
              >
                Load Sample Alerts
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-green-500/50"
                >
                  <option>PagerDuty</option>
                  <option>Datadog</option>
                  <option>CloudWatch</option>
                  <option>OpsGenie</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData((p) => ({ ...p, severity: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-green-500/50"
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
              <label className="block text-xs text-zinc-400 mb-1">Title</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Alert title..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-green-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Alert description and details..."
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-green-500/50 resize-none"
              />
            </div>
            <button
              onClick={handleFormSubmit}
              disabled={loading || !formData.title.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Triaging...' : 'Submit & Triage'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
