export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export type Category = 'infra' | 'app' | 'network' | 'security' | 'database';
export type AlertStatus = 'new' | 'triaged' | 'acknowledged' | 'resolved' | 'noise';

export interface RawAlert {
  id: string;
  source: string;
  title: string;
  description: string;
  severity?: string;
  timestamp: string;
  rawPayload: string;
  status: AlertStatus;
}

export interface TriagedAlert extends RawAlert {
  priority: Priority;
  category: Category;
  affectedService: string;
  isNoise: boolean;
  noiseReason?: string;
  duplicateGroupId?: string;
  suggestedActions: string[];
  escalationPath: string;
  runbookUrl?: string;
  confidence: number;
  triageTimestamp: string;
}

export interface AlertGroup {
  id: string;
  title: string;
  alerts: TriagedAlert[];
  rootCause?: string;
}

export interface Incident {
  id: string;
  title: string;
  summary: string;
  priority: Priority;
  status: 'open' | 'investigating' | 'mitigated' | 'resolved';
  alerts: TriagedAlert[];
  createdAt: string;
  updatedAt: string;
  commander?: string;
  slackChannel?: string;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  timestamp: string;
  event: string;
  author: string;
}

export interface DashboardMetrics {
  totalAlerts: number;
  alertsByPriority: Record<Priority, number>;
  alertsByCategory: Record<Category, number>;
  noisePercentage: number;
  mttrMinutes: number;
  topOffenders: { service: string; count: number }[];
  alertVolume: { hour: string; count: number }[];
  activeIncidents: number;
}

export interface TriageRequest {
  alerts: { title: string; description: string; source: string; severity?: string; rawPayload?: string }[];
}

export interface TriageResponse {
  triaged: TriagedAlert[];
  groups: AlertGroup[];
  noiseCount: number;
}

export interface IncidentRequest {
  alertIds: string[];
  title?: string;
}

export interface IncidentResponse {
  incident: Incident;
}
