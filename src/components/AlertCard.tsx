'use client';

import { TriagedAlert } from '@/types';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import FavoriteButton from './FavoriteButton';

interface AlertCardProps {
  alert: TriagedAlert;
  selected?: boolean;
  onSelect?: (id: string) => void;
  expanded?: boolean;
  onToggleExpand?: (id: string) => void;
}

export default function AlertCard({ alert, selected, onSelect, expanded, onToggleExpand }: AlertCardProps) {
  const isNew = alert.status === 'new' || alert.status === 'triaged';
  return (
    <div
      className={`group border rounded-2xl p-5 transition-all cursor-pointer ${
        isNew && !alert.isNoise ? 'alert-pulse-new' : ''
      } ${
        alert.isNoise
          ? 'border-zinc-800/40 bg-zinc-900/10 opacity-50'
          : selected
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-zinc-800/50 bg-zinc-900/20 hover:border-zinc-700/60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(alert.id)}
              className="mt-1.5 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <PriorityBadge priority={alert.priority} />
              <CategoryBadge category={alert.category} />
              {alert.isNoise && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800/60 text-zinc-500 border border-zinc-700/40">
                  Noise
                </span>
              )}
              <span className="text-[11px] text-zinc-600 font-mono">{alert.source}</span>
            </div>
            <h3 className="text-sm font-medium text-white leading-snug group-hover:text-emerald-400 transition-colors">
              {alert.title}
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">{alert.description}</p>

            {expanded && (
              <div className="mt-4 space-y-4 border-t border-zinc-800/40 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Service</span>
                    <p className="text-sm text-emerald-400 font-mono mt-0.5">{alert.affectedService}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Confidence</span>
                    <p className="text-sm text-white font-mono mt-0.5">{alert.confidence}%</p>
                  </div>
                </div>

                {alert.isNoise && alert.noiseReason && (
                  <div>
                    <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Noise Reason</span>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{alert.noiseReason}</p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Suggested Actions</span>
                  <ul className="mt-2 space-y-1.5">
                    {alert.suggestedActions.map((action, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500/70 mt-0.5 shrink-0">&rarr;</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Escalation</span>
                  <p className="text-xs text-zinc-400 mt-1">{alert.escalationPath}</p>
                </div>

                {alert.duplicateGroupId && (
                  <div>
                    <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Group</span>
                    <p className="text-xs text-blue-400 font-mono mt-0.5">{alert.duplicateGroupId}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <FavoriteButton
            id={alert.id}
            type="alert"
            title={alert.title}
            priority={alert.priority}
            category={alert.category}
            timestamp={alert.timestamp}
          />
          <span className="text-[11px] text-zinc-600 font-mono tabular-nums">
            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {onToggleExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(alert.id);
              }}
              className="text-zinc-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800/50"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
