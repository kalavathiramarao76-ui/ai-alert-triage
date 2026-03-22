import { NextRequest, NextResponse } from 'next/server';
import { aiChat, TRIAGE_SYSTEM_PROMPT } from '@/lib/ai';
import { checkAndIncrementUsage, isAuthenticated } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    const authed = await isAuthenticated(ip);

    if (!authed) {
      const { allowed, count } = await checkAndIncrementUsage(ip);
      if (!allowed) {
        return NextResponse.json(
          {
            error: 'FREE_LIMIT_REACHED',
            message: `Free trial complete. You've used ${count} of 3 free generations. Sign in with Google to continue.`,
            count,
            remaining: 0,
          },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const { alerts, stream: useStream } = body;

    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return NextResponse.json({ error: 'alerts array is required' }, { status: 400 });
    }

    const userMessage = `Triage the following ${alerts.length} alert(s). For each, provide priority, category, affected service, noise assessment, suggested actions, and escalation path.

Alerts:
${alerts.map((a: Record<string, string>, i: number) => `
--- Alert ${i + 1} ---
Source: ${a.source || 'unknown'}
Title: ${a.title}
Description: ${a.description}
Severity (from source): ${a.severity || 'not specified'}
Raw Payload: ${a.rawPayload || 'N/A'}
`).join('\n')}

Remember: Return ONLY valid JSON matching the specified format. No markdown.`;

    if (useStream) {
      const readableStream = await aiChat(TRIAGE_SYSTEM_PROMPT, userMessage, true);
      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const result = await aiChat(TRIAGE_SYSTEM_PROMPT, userMessage, false);

    let parsed;
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({
        triaged: [],
        groups: [],
        noiseCount: 0,
        rawResponse: result,
        error: 'Failed to parse AI response as JSON',
      }, { status: 200 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Triage API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
