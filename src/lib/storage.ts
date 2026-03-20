'use client';

import { RawAlert, TriagedAlert, Incident, AlertGroup } from '@/types';

const KEYS = {
  RAW_ALERTS: 'att_raw_alerts',
  TRIAGED_ALERTS: 'att_triaged_alerts',
  INCIDENTS: 'att_incidents',
  GROUPS: 'att_groups',
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getRawAlerts: (): RawAlert[] => getItem(KEYS.RAW_ALERTS, []),
  setRawAlerts: (alerts: RawAlert[]) => setItem(KEYS.RAW_ALERTS, alerts),
  addRawAlert: (alert: RawAlert) => {
    const alerts = storage.getRawAlerts();
    alerts.unshift(alert);
    storage.setRawAlerts(alerts);
  },

  getTriagedAlerts: (): TriagedAlert[] => getItem(KEYS.TRIAGED_ALERTS, []),
  setTriagedAlerts: (alerts: TriagedAlert[]) => setItem(KEYS.TRIAGED_ALERTS, alerts),
  addTriagedAlerts: (newAlerts: TriagedAlert[]) => {
    const existing = storage.getTriagedAlerts();
    const merged = [...newAlerts, ...existing];
    storage.setTriagedAlerts(merged);
  },

  getIncidents: (): Incident[] => getItem(KEYS.INCIDENTS, []),
  setIncidents: (incidents: Incident[]) => setItem(KEYS.INCIDENTS, incidents),
  addIncident: (incident: Incident) => {
    const incidents = storage.getIncidents();
    incidents.unshift(incident);
    storage.setIncidents(incidents);
  },

  getGroups: (): AlertGroup[] => getItem(KEYS.GROUPS, []),
  setGroups: (groups: AlertGroup[]) => setItem(KEYS.GROUPS, groups),
  addGroups: (newGroups: AlertGroup[]) => {
    const existing = storage.getGroups();
    const merged = [...newGroups, ...existing];
    storage.setGroups(merged);
  },

  clearAll: () => {
    Object.values(KEYS).forEach((key) => {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
    });
  },
};
