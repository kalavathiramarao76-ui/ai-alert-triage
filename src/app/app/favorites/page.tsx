'use client';

import { useState, useEffect } from 'react';
import { favorites, FavoriteItem, FavoriteType } from '@/lib/favorites';
import FavoriteButton from '@/components/FavoriteButton';

type FilterType = 'all' | FavoriteType;

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setItems(favorites.getAll());
    const handler = () => setItems(favorites.getAll());
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, []);

  const filtered = items
    .filter((item) => filter === 'all' || item.type === filter)
    .filter(
      (item) =>
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const alertCount = items.filter((i) => i.type === 'alert').length;
  const incidentCount = items.filter((i) => i.type === 'incident').length;

  const priorityColors: Record<string, string> = {
    P0: 'bg-red-500/15 text-red-400 border-red-500/30',
    P1: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    P2: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    P3: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    P4: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  };

  const categoryColors: Record<string, string> = {
    infra: 'bg-purple-500/15 text-purple-400',
    app: 'bg-cyan-500/15 text-cyan-400',
    network: 'bg-blue-500/15 text-blue-400',
    security: 'bg-red-500/15 text-red-400',
    database: 'bg-amber-500/15 text-amber-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Favorites
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Your saved triages and incidents for quick access
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              favorites.clear();
            }}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/50 border border-zinc-800">
          {([
            { key: 'all' as FilterType, label: 'All', count: items.length },
            { key: 'alert' as FilterType, label: 'Alerts', count: alertCount },
            { key: 'incident' as FilterType, label: 'Incidents', count: incidentCount },
          ]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              {label}
              <span className="ml-1.5 text-[10px] opacity-60">{count}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search favorites..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 outline-none focus:border-green-500/50"
          />
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-16 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <svg
            className="w-16 h-16 mx-auto text-zinc-700 mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No favorites yet</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Star triaged alerts and incidents to save them here for quick access.
          </p>
        </div>
      )}

      {/* No results */}
      {items.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 border border-zinc-800 rounded-lg bg-zinc-900/30">
          <p className="text-sm text-zinc-400">No favorites match your filters.</p>
        </div>
      )}

      {/* Favorites list */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 card-hover-lift group"
          >
            <FavoriteButton
              id={item.id}
              type={item.type}
              title={item.title}
              priority={item.priority}
              category={item.category}
              timestamp={item.timestamp}
              size="md"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    item.type === 'alert'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}
                >
                  {item.type}
                </span>
                {item.priority && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      priorityColors[item.priority] || priorityColors.P3
                    }`}
                  >
                    {item.priority}
                  </span>
                )}
                {item.category && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                      categoryColors[item.category] || 'bg-zinc-500/15 text-zinc-400'
                    }`}
                  >
                    {item.category}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
            </div>

            <div className="text-right shrink-0">
              <p className="text-[10px] text-zinc-500">
                Saved {new Date(item.savedAt).toLocaleDateString()}
              </p>
              <p className="text-[10px] text-zinc-600">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
