import { NextRequest, NextResponse } from 'next/server';
import { aiChat, INCIDENT_SYSTEM_PROMPT } from '@/lib/ai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alerts, title } = body;

    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return NextResponse.json({ error: 'alerts array is required' }, { status: 400 });
    }

    const userMessage = `Generate an incident summary from these triaged alerts:

${title ? `Suggested title: ${title}` : ''}

Alerts:
${alerts.map((a: Record<string, string>, i: number) => `
--- Alert ${i + 1} ---
Title: ${a.title}
Priority: ${a.priority}
Category: ${a.category}
Service: ${a.affectedService}
Description: ${a.description}
Suggested Actions: ${a.suggestedActions || 'N/A'}
Escalation: ${a.escalationPath || 'N/A'}
`).join('\n')}

Generate a comprehensive incident report. Return ONLY valid JSON matching the specified format. No markdown.`;

    const result = await aiChat(INCIDENT_SYSTEM_PROMPT, userMessage, false);

    let parsed;
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({
        incident: null,
        rawResponse: result,
        error: 'Failed to parse AI response',
      }, { status: 200 });
    }

    return NextResponse.json({ incident: parsed });
  } catch (error) {
    console.error('Incident API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
