'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'triage' | 'incident' | 'webhook' | 'team';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'att_notifications';
const MAX_NOTIFICATIONS = 20;

const typeIcons: Record<Notification['type'], { icon: JSX.Element; color: string }> = {
  triage: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: 'text-amber-400 bg-amber-400/10',
  },
  incident: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    ),
    color: 'text-red-400 bg-red-400/10',
  },
  webhook: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    color: 'text-blue-400 bg-blue-400/10',
  },
  team: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    color: 'text-green-400 bg-green-400/10',
  },
};

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function generateSampleNotifications(): Notification[] {
  const now = Date.now();
  return [
    { id: 'n1', type: 'triage', title: 'Alert triaged automatically', description: 'High CPU usage on prod-api-3 classified as P1', timestamp: new Date(now - 300000).toISOString(), read: false },
    { id: 'n2', type: 'incident', title: 'Incident INC-042 created', description: 'Database connection pool exhaustion affecting checkout service', timestamp: new Date(now - 900000).toISOString(), read: false },
    { id: 'n3', type: 'webhook', title: 'Webhook received', description: 'PagerDuty integration delivered 3 new alerts', timestamp: new Date(now - 1800000).toISOString(), read: false },
    { id: 'n4', type: 'team', title: 'Team action', description: 'Sarah acknowledged INC-041 and started investigation', timestamp: new Date(now - 3600000).toISOString(), read: true },
    { id: 'n5', type: 'triage', title: '5 alerts marked as noise', description: 'AI detected duplicate health-check failures across 5 alerts', timestamp: new Date(now - 7200000).toISOString(), read: true },
    { id: 'n6', type: 'incident', title: 'Incident INC-041 resolved', description: 'Memory leak in auth-service patched and deployed', timestamp: new Date(now - 14400000).toISOString(), read: true },
    { id: 'n7', type: 'webhook', title: 'Datadog webhook connected', description: 'New integration configured for production monitors', timestamp: new Date(now - 28800000).toISOString(), read: true },
    { id: 'n8', type: 'team', title: 'Escalation triggered', description: 'P0 alert auto-escalated to on-call engineer Mike', timestamp: new Date(now - 43200000).toISOString(), read: true },
  ];
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [hasNewShake, setHasNewShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        const samples = generateSampleNotifications();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
        setNotifications(samples);
      }
    } catch {
      const samples = generateSampleNotifications();
      setNotifications(samples);
    }
    setMounted(true);
  }, []);

  // Trigger shake when there are unread notifications on mount
  useEffect(() => {
    if (mounted && notifications.some((n) => !n.read)) {
      setHasNewShake(true);
      const timer = setTimeout(() => setHasNewShake(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  const persist = useCallback((updated: Notification[]) => {
    const pruned = updated.slice(0, MAX_NOTIFICATIONS);
    setNotifications(pruned);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  }, []);

  const markAllRead = () => {
    persist(notifications.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    persist(notifications.filter((n) => n.id !== id));
  };

  const markRead = (id: string) => {
    persist(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 transition-all duration-200 ${hasNewShake ? 'bell-shake' : ''}`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-96 max-h-[480px] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40 overflow-hidden notification-panel-enter z-[60]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="w-10 h-10 mx-auto text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p className="text-sm text-zinc-500">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon, color } = typeIcons[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-800/50 cursor-pointer transition-colors hover:bg-zinc-800/40 ${!n.read ? 'bg-zinc-800/20' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                        <span className={`text-sm font-medium truncate ${!n.read ? 'text-white' : 'text-zinc-300'}`}>
                          {n.title}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{n.description}</p>
                      <span className="text-[10px] text-zinc-500 mt-1 block">{relativeTime(n.timestamp)}</span>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="mt-1 p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                      aria-label="Dismiss notification"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
