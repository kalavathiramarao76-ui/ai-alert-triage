import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Normalize webhooks from different sources
    const alert = normalizeWebhook(body, req.headers.get('x-alert-source') || 'custom');

    return NextResponse.json({
      success: true,
      alert,
      message: 'Alert received. Use the dashboard to view and triage.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid payload' },
      { status: 400 }
    );
  }
}

function normalizeWebhook(
  payload: Record<string, unknown>,
  source: string
): { title: string; description: string; source: string; severity: string; rawPayload: string } {
  const rawPayload = JSON.stringify(payload, null, 2);

  // PagerDuty format
  if (payload.event?.toString() || payload.incident) {
    const incident = (payload.incident || payload) as Record<string, unknown>;
    return {
      title: (incident.title || incident.summary || 'PagerDuty Alert') as string,
      description: (incident.description || incident.summary || rawPayload) as string,
      source: 'PagerDuty',
      severity: ((incident.urgency || incident.severity || 'high') as string).toLowerCase(),
      rawPayload,
    };
  }

  // Datadog format
  if (payload.alert_type || payload.event_type) {
    return {
      title: (payload.title || payload.event_title || 'Datadog Alert') as string,
      description: (payload.body || payload.text || rawPayload) as string,
      source: 'Datadog',
      severity: (payload.alert_type as string) || 'warning',
      rawPayload,
    };
  }

  // CloudWatch format
  if (payload.AlarmName || payload.Source === 'aws.cloudwatch') {
    return {
      title: (payload.AlarmName || 'CloudWatch Alarm') as string,
      description: (payload.AlarmDescription || payload.NewStateReason || rawPayload) as string,
      source: 'CloudWatch',
      severity: payload.NewStateValue === 'ALARM' ? 'critical' : 'warning',
      rawPayload,
    };
  }

  // OpsGenie format
  if (payload.action || payload.alert) {
    const alert = (payload.alert || payload) as Record<string, unknown>;
    return {
      title: (alert.message || alert.alias || 'OpsGenie Alert') as string,
      description: (alert.description || rawPayload) as string,
      source: 'OpsGenie',
      severity: ((alert.priority || 'P3') as string).toLowerCase(),
      rawPayload,
    };
  }

  // Generic
  return {
    title: (payload.title || payload.name || payload.message || 'Custom Alert') as string,
    description: (payload.description || payload.body || payload.details || rawPayload) as string,
    source: source,
    severity: ((payload.severity || payload.priority || 'medium') as string).toLowerCase(),
    rawPayload,
  };
}
