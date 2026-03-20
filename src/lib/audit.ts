'use client';

export type AuditActionType =
  | 'triage'
  | 'incident'
  | 'webhook'
  | 'api_key'
  | 'settings'
  | 'role'
  | 'login';

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  actionType: AuditActionType;
  timestamp: string;
  metadata?: Record<string, string>;
}

const AUDIT_KEY = 'att_audit_log';

function getEntries(): AuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setEntries(entries: AuditEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}

export const audit = {
  log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
    const full: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const entries = getEntries();
    entries.unshift(full);
    // Keep max 500 entries
    if (entries.length > 500) entries.length = 500;
    setEntries(entries);
    return full;
  },

  getAll(): AuditEntry[] {
    return getEntries();
  },

  getFiltered(filters: {
    userId?: string;
    actionType?: AuditActionType;
    startDate?: string;
    endDate?: string;
  }): AuditEntry[] {
    let entries = getEntries();
    if (filters.userId) {
      entries = entries.filter((e) => e.userId === filters.userId);
    }
    if (filters.actionType) {
      entries = entries.filter((e) => e.actionType === filters.actionType);
    }
    if (filters.startDate) {
      entries = entries.filter((e) => e.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      entries = entries.filter((e) => e.timestamp <= filters.endDate!);
    }
    return entries;
  },

  exportCSV(): string {
    const entries = getEntries();
    const headers = ['ID', 'User', 'Action', 'Type', 'Timestamp'];
    const rows = entries.map((e) =>
      [e.id, e.userName, `"${e.action}"`, e.actionType, e.timestamp].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  },

  clear(): void {
    if (typeof window !== 'undefined') localStorage.removeItem(AUDIT_KEY);
  },

  seed(): void {
    const existing = getEntries();
    if (existing.length > 0) return;

    const now = Date.now();
    const hour = 3600000;

    const seedData: Omit<AuditEntry, 'id'>[] = [
      { userId: 'u1', userName: 'Sarah Chen', userAvatar: 'SC', action: 'Triaged 5 alerts from Datadog', actionType: 'triage', timestamp: new Date(now - hour * 0.5).toISOString() },
      { userId: 'u2', userName: 'Marcus Johnson', userAvatar: 'MJ', action: 'Created incident "Database latency spike"', actionType: 'incident', timestamp: new Date(now - hour * 1).toISOString() },
      { userId: 'u1', userName: 'Sarah Chen', userAvatar: 'SC', action: 'Generated API key "prod-integration"', actionType: 'api_key', timestamp: new Date(now - hour * 2).toISOString() },
      { userId: 'u3', userName: 'Priya Patel', userAvatar: 'PP', action: 'Updated webhook endpoint for PagerDuty', actionType: 'webhook', timestamp: new Date(now - hour * 3).toISOString() },
      { userId: 'u4', userName: 'Alex Rivera', userAvatar: 'AR', action: 'Triaged 3 alerts — 1 marked as noise', actionType: 'triage', timestamp: new Date(now - hour * 4).toISOString() },
      { userId: 'u5', userName: 'Jordan Kim', userAvatar: 'JK', action: 'Changed role of Alex Rivera to Analyst', actionType: 'role', timestamp: new Date(now - hour * 5).toISOString() },
      { userId: 'u2', userName: 'Marcus Johnson', userAvatar: 'MJ', action: 'Resolved incident "Redis connection pool exhausted"', actionType: 'incident', timestamp: new Date(now - hour * 8).toISOString() },
      { userId: 'u1', userName: 'Sarah Chen', userAvatar: 'SC', action: 'Revoked API key "staging-old"', actionType: 'api_key', timestamp: new Date(now - hour * 10).toISOString() },
      { userId: 'u3', userName: 'Priya Patel', userAvatar: 'PP', action: 'Triaged 8 alerts from CloudWatch', actionType: 'triage', timestamp: new Date(now - hour * 12).toISOString() },
      { userId: 'u4', userName: 'Alex Rivera', userAvatar: 'AR', action: 'Created webhook for Slack #ops-alerts', actionType: 'webhook', timestamp: new Date(now - hour * 16).toISOString() },
      { userId: 'u5', userName: 'Jordan Kim', userAvatar: 'JK', action: 'Updated team settings — enabled SSO', actionType: 'settings', timestamp: new Date(now - hour * 20).toISOString() },
      { userId: 'u1', userName: 'Sarah Chen', userAvatar: 'SC', action: 'Created incident "Auth service 5xx errors"', actionType: 'incident', timestamp: new Date(now - hour * 24).toISOString() },
      { userId: 'u2', userName: 'Marcus Johnson', userAvatar: 'MJ', action: 'Triaged 12 alerts — 4 duplicates grouped', actionType: 'triage', timestamp: new Date(now - hour * 30).toISOString() },
      { userId: 'u3', userName: 'Priya Patel', userAvatar: 'PP', action: 'Added new role "On-Call Lead" with custom permissions', actionType: 'role', timestamp: new Date(now - hour * 36).toISOString() },
      { userId: 'u4', userName: 'Alex Rivera', userAvatar: 'AR', action: 'Signed in from new device (MacBook Pro)', actionType: 'login', timestamp: new Date(now - hour * 48).toISOString() },
    ];

    const entries: AuditEntry[] = seedData.map((e, i) => ({
      ...e,
      id: `audit-seed-${i}`,
    }));

    setEntries(entries);
  },
};
