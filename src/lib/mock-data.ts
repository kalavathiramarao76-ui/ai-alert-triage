import { DashboardMetrics, RawAlert, TriagedAlert } from '@/types';

export function generateMockMetrics(triaged: TriagedAlert[]): DashboardMetrics {
  const alertsByPriority = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
  const alertsByCategory = { infra: 0, app: 0, network: 0, security: 0, database: 0 };
  const serviceCount: Record<string, number> = {};

  triaged.forEach((a) => {
    alertsByPriority[a.priority]++;
    alertsByCategory[a.category]++;
    serviceCount[a.affectedService] = (serviceCount[a.affectedService] || 0) + 1;
  });

  const noiseCount = triaged.filter((a) => a.isNoise).length;

  const topOffenders = Object.entries(serviceCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([service, count]) => ({ service, count }));

  const now = new Date();
  const alertVolume = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now.getTime() - (23 - i) * 3600000);
    return {
      hour: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
      count: Math.floor(Math.random() * 20) + (triaged.length > 0 ? 2 : 0),
    };
  });

  return {
    totalAlerts: triaged.length,
    alertsByPriority,
    alertsByCategory,
    noisePercentage: triaged.length > 0 ? Math.round((noiseCount / triaged.length) * 100) : 0,
    mttrMinutes: Math.floor(Math.random() * 30) + 5,
    topOffenders,
    alertVolume,
    activeIncidents: Math.floor(Math.random() * 3),
  };
}

export const SAMPLE_ALERTS: Partial<RawAlert>[] = [
  {
    source: 'PagerDuty',
    title: 'High CPU usage on prod-api-server-03',
    description: 'CPU utilization has been above 95% for the last 10 minutes on prod-api-server-03. Current load average: 12.4. Service: user-api. Team: Platform Engineering.',
    severity: 'critical',
  },
  {
    source: 'Datadog',
    title: 'Error rate spike on payment-service',
    description: 'Error rate for payment-service has increased to 15% (baseline: 0.5%). HTTP 500 responses increased 30x. Affected endpoints: /api/v2/charge, /api/v2/refund. Region: us-east-1.',
    severity: 'critical',
  },
  {
    source: 'CloudWatch',
    title: 'RDS connection pool exhausted',
    description: 'RDS instance prod-db-primary has reached maximum connections (500/500). Active queries: 487. Blocked queries: 13. Database: orders_db. Instance type: db.r5.2xlarge.',
    severity: 'high',
  },
  {
    source: 'OpsGenie',
    title: 'SSL certificate expiring in 3 days',
    description: 'SSL certificate for api.example.com will expire on 2024-01-20. Certificate CN: *.example.com. Issuer: Let\'s Encrypt. Auto-renewal has not triggered.',
    severity: 'warning',
  },
  {
    source: 'Datadog',
    title: 'Memory usage high on cache-cluster',
    description: 'Redis cluster cache-prod-01 memory usage at 89%. Eviction rate increasing. Connected clients: 1,247. Used memory: 28.5GB / 32GB.',
    severity: 'warning',
  },
  {
    source: 'CloudWatch',
    title: 'Lambda function timeout increase',
    description: 'Lambda function process-orders p99 latency increased from 800ms to 4200ms. Timeout rate: 8%. Concurrent executions: 450/500. Cold start rate: 12%.',
    severity: 'high',
  },
  {
    source: 'Custom',
    title: 'Disk space alert on logging server',
    description: 'Disk usage on log-aggregator-02 at 92%. /var/log partition. Estimated time to full: 6 hours. Log rotation last ran 2 days ago.',
    severity: 'warning',
  },
  {
    source: 'PagerDuty',
    title: 'Health check failing for auth-service',
    description: 'Health check endpoint /health returning 503 for auth-service. 3 of 5 pods reporting unhealthy. Last successful check: 5 minutes ago. Kubernetes namespace: production.',
    severity: 'critical',
  },
  {
    source: 'Datadog',
    title: 'Anomalous login attempts detected',
    description: 'Unusual number of failed login attempts detected: 5,200 in the last hour (baseline: 150). Source IPs: multiple geographic regions. Targeted accounts: admin, service-accounts.',
    severity: 'high',
  },
  {
    source: 'CloudWatch',
    title: 'NAT Gateway packet drop',
    description: 'NAT Gateway nat-0a1b2c3d in us-east-1a dropping packets. Error count: 342 in last 5 minutes. Affected subnets: private-subnet-1, private-subnet-2. No bandwidth limit change.',
    severity: 'medium',
  },
];
