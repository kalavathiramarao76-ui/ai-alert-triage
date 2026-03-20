'use client';

import { useState, useEffect } from 'react';
import { favorites, FavoriteType } from '@/lib/favorites';

interface FavoriteButtonProps {
  id: string;
  type: FavoriteType;
  title: string;
  priority?: string;
  category?: string;
  timestamp: string;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({
  id,
  type,
  title,
  priority,
  category,
  timestamp,
  size = 'sm',
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setIsFav(favorites.isFavorite(id));
    const handler = () => setIsFav(favorites.isFavorite(id));
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, [id]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isFav) {
      favorites.remove(id);
      setIsFav(false);
    } else {
      favorites.add({ id, type, title, priority, category, timestamp });
      setIsFav(true);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
  };

  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={toggle}
      className={`relative group transition-transform duration-200 hover:scale-110 ${
        animating ? 'favorite-star-pop' : ''
      }`}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`${sizeClasses} transition-all duration-300 ${
          isFav
            ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]'
            : 'text-zinc-600 group-hover:text-yellow-400/60'
        }`}
        viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
      {animating && (
        <>
          <span className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
        </>
      )}
    </button>
  );
}
