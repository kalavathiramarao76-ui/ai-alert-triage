'use client';

export type FavoriteType = 'alert' | 'incident';

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  priority?: string;
  category?: string;
  timestamp: string;
  savedAt: string;
}

const FAVORITES_KEY = 'at_favorites';

function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFavorites(items: FavoriteItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}

export const favorites = {
  getAll: (): FavoriteItem[] => getFavorites(),

  add: (item: Omit<FavoriteItem, 'savedAt'>): void => {
    const existing = getFavorites();
    if (existing.some((f) => f.id === item.id)) return;
    const newItem: FavoriteItem = { ...item, savedAt: new Date().toISOString() };
    setFavorites([newItem, ...existing]);
    window.dispatchEvent(new CustomEvent('favorites-changed'));
  },

  remove: (id: string): void => {
    const existing = getFavorites();
    setFavorites(existing.filter((f) => f.id !== id));
    window.dispatchEvent(new CustomEvent('favorites-changed'));
  },

  isFavorite: (id: string): boolean => {
    return getFavorites().some((f) => f.id === id);
  },

  getCount: (): number => getFavorites().length,

  getByType: (type: FavoriteType): FavoriteItem[] => {
    return getFavorites().filter((f) => f.type === type);
  },

  clear: (): void => {
    setFavorites([]);
    window.dispatchEvent(new CustomEvent('favorites-changed'));
  },
};
