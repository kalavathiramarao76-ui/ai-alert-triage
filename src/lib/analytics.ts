'use client';

export interface AnalyticsData {
  alertsTriaged: number;
  incidentsCreated: number;
  avgTriageTime: number; // seconds
  noiseFiltered: number;
  currentStreak: number; // consecutive days
  categoryBreakdown: Record<string, number>;
  dailyActivity: { day: string; count: number }[];
  lastActiveDate: string;
}

const ANALYTICS_KEY = 'att_analytics';

function getAnalytics(): AnalyticsData {
  if (typeof window === 'undefined') return defaultAnalytics();
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : defaultAnalytics();
  } catch {
    return defaultAnalytics();
  }
}

function saveAnalytics(data: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

function defaultAnalytics(): AnalyticsData {
  return {
    alertsTriaged: 0,
    incidentsCreated: 0,
    avgTriageTime: 0,
    noiseFiltered: 0,
    currentStreak: 0,
    categoryBreakdown: {},
    dailyActivity: [],
    lastActiveDate: '',
  };
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(data: AnalyticsData): void {
  const today = todayKey();
  if (data.lastActiveDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (data.lastActiveDate === yesterdayKey) {
    data.currentStreak += 1;
  } else if (data.lastActiveDate !== today) {
    data.currentStreak = 1;
  }
  data.lastActiveDate = today;
}

function addDailyActivity(data: AnalyticsData, count: number): void {
  const today = todayKey();
  const existing = data.dailyActivity.find((d) => d.day === today);
  if (existing) {
    existing.count += count;
  } else {
    data.dailyActivity.push({ day: today, count });
  }
  // Keep only last 7 days
  data.dailyActivity = data.dailyActivity.slice(-7);
}

export const analytics = {
  get: getAnalytics,

  trackTriage(count: number, categories: string[], triageTimeMs: number): void {
    const data = getAnalytics();
    data.alertsTriaged += count;

    // Running average
    const totalTime = data.avgTriageTime * (data.alertsTriaged - count) + triageTimeMs / 1000;
    data.avgTriageTime = Math.round(totalTime / data.alertsTriaged);

    categories.forEach((cat) => {
      data.categoryBreakdown[cat] = (data.categoryBreakdown[cat] || 0) + 1;
    });

    updateStreak(data);
    addDailyActivity(data, count);
    saveAnalytics(data);
    window.dispatchEvent(new CustomEvent('analytics-updated'));
  },

  trackNoiseFiltered(count: number): void {
    const data = getAnalytics();
    data.noiseFiltered += count;
    saveAnalytics(data);
  },

  trackIncidentCreated(): void {
    const data = getAnalytics();
    data.incidentsCreated += 1;
    updateStreak(data);
    addDailyActivity(data, 0);
    saveAnalytics(data);
    window.dispatchEvent(new CustomEvent('analytics-updated'));
  },

  /** Generate mock data for demo purposes */
  seedMockData(): AnalyticsData {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dailyActivity = days.map((day, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: Math.floor(Math.random() * 18) + 3,
      };
    });

    const data: AnalyticsData = {
      alertsTriaged: 247,
      incidentsCreated: 18,
      avgTriageTime: 34,
      noiseFiltered: 89,
      currentStreak: 5,
      categoryBreakdown: {
        infra: 72,
        app: 58,
        network: 41,
        security: 34,
        database: 42,
      },
      dailyActivity,
      lastActiveDate: todayKey(),
    };

    saveAnalytics(data);
    return data;
  },

  reset(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ANALYTICS_KEY);
    }
  },
};
