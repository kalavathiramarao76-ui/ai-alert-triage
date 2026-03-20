'use client';

import { TriagedAlert } from '@/types';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';

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
      className={`border rounded-lg p-4 transition-all cursor-pointer card-hover-lift ${
        isNew && !alert.isNoise ? 'alert-pulse-new' : ''
      } ${
        alert.isNoise
          ? 'border-zinc-800 bg-zinc-900/30 opacity-60'
          : selected
          ? 'border-green-500/50 bg-green-500/5'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(alert.id)}
              className="mt-1 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500 focus:ring-offset-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <PriorityBadge priority={alert.priority} />
              <CategoryBadge category={alert.category} />
              {alert.isNoise && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-700/50 text-zinc-400 border border-zinc-600">
                  Noise
                </span>
              )}
              <span className="text-xs text-zinc-500">{alert.source}</span>
            </div>
            <h3 className="text-sm font-medium text-white truncate">{alert.title}</h3>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{alert.description}</p>

            {expanded && (
              <div className="mt-3 space-y-3 border-t border-zinc-800 pt-3">
                <div>
                  <span className="text-xs font-medium text-zinc-300">Affected Service:</span>
                  <span className="text-xs text-green-400 ml-2">{alert.affectedService}</span>
                </div>

                {alert.isNoise && alert.noiseReason && (
                  <div>
                    <span className="text-xs font-medium text-zinc-300">Noise Reason:</span>
                    <p className="text-xs text-zinc-400 mt-0.5">{alert.noiseReason}</p>
                  </div>
                )}

                <div>
                  <span className="text-xs font-medium text-zinc-300">Suggested Actions:</span>
                  <ul className="mt-1 space-y-1">
                    {alert.suggestedActions.map((action, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                        <span className="text-green-500 mt-0.5">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-medium text-zinc-300">Escalation:</span>
                  <p className="text-xs text-zinc-400 mt-0.5">{alert.escalationPath}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">
                    Confidence: <span className="text-green-400">{alert.confidence}%</span>
                  </span>
                  {alert.duplicateGroupId && (
                    <span className="text-xs text-zinc-500">
                      Group: <span className="text-blue-400">{alert.duplicateGroupId}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-zinc-500">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </span>
          {onToggleExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(alert.id);
              }}
              className="text-zinc-500 hover:text-white transition-colors p-1"
            >
              {expanded ? '▾' : '▸'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
