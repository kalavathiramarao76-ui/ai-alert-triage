'use client';

import { useState, useCallback } from 'react';
import { Incident } from '@/types';

interface ShareIncidentProps {
  incident: Incident;
}

function encodeIncident(incident: Incident): string {
  const payload = {
    t: incident.title,
    s: incident.summary,
    p: incident.priority,
    st: incident.status,
    c: incident.commander,
    sc: incident.slackChannel,
    ca: incident.createdAt,
    ua: incident.updatedAt,
    al: incident.alerts.map((a) => ({
      t: a.title,
      p: a.priority,
      c: a.category,
      svc: a.affectedService,
    })),
    tl: incident.timeline.map((t) => ({
      ts: t.timestamp,
      e: t.event,
      a: t.author,
    })),
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function generateShareUrl(incident: Incident): string {
  const encoded = encodeIncident(incident);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/shared?d=${encoded}`;
}

export default function ShareIncident({ incident }: ShareIncidentProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = generateShareUrl(incident);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const shareToSlack = useCallback(() => {
    const text = encodeURIComponent(
      `🔥 Incident: ${incident.title}\nPriority: ${incident.priority} | Status: ${incident.status}\n${shareUrl}`
    );
    window.open(`https://slack.com/share?text=${text}`, '_blank');
  }, [incident, shareUrl]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-green-400 border border-zinc-800 hover:border-green-500/30 rounded transition-colors"
        title="Share incident"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        Share
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl border border-zinc-700/50 bg-zinc-900/95 backdrop-blur-xl shadow-xl shadow-black/30 overflow-hidden cmd-palette-enter">
            <div className="px-3 py-2 border-b border-zinc-800">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Share Incident</p>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  copyLink();
                  setTimeout(() => setShowMenu(false), 1500);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-green-500/10 hover:text-white transition-colors"
              >
                <span className="text-base">
                  {copied ? '✅' : '🔗'}
                </span>
                <div>
                  <p className="font-medium text-xs">{copied ? 'Copied!' : 'Copy Link'}</p>
                  <p className="text-[10px] text-zinc-500">Shareable read-only URL</p>
                </div>
              </button>

              <button
                onClick={shareToSlack}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-300 hover:bg-green-500/10 hover:text-white transition-colors"
              >
                <span className="text-base">💬</span>
                <div>
                  <p className="font-medium text-xs">Share to Slack</p>
                  <p className="text-[10px] text-zinc-500">Open in Slack with incident info</p>
                </div>
              </button>
            </div>

            <div className="px-3 py-2 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-600 truncate" title={shareUrl}>
                {shareUrl.slice(0, 45)}...
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
