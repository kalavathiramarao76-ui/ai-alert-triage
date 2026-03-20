const API_URL = 'https://sai.sharedllm.com/v1/chat/completions';
const MODEL = 'gpt-oss:120b';

export async function aiChat(
  systemPrompt: string,
  userMessage: string,
  stream: false
): Promise<string>;
export async function aiChat(
  systemPrompt: string,
  userMessage: string,
  stream: true
): Promise<ReadableStream>;
export async function aiChat(
  systemPrompt: string,
  userMessage: string,
  stream: boolean
): Promise<string | ReadableStream> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI API error ${response.status}: ${text}`);
  }

  if (stream) {
    return response.body as ReadableStream;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export const TRIAGE_SYSTEM_PROMPT = `You are an expert SRE/DevOps alert triage AI. Analyze alerts and return ONLY valid JSON (no markdown, no backticks).

For each alert, determine:
1. priority: P0 (critical outage), P1 (major impact), P2 (degraded), P3 (minor), P4 (informational)
2. category: infra | app | network | security | database
3. affectedService: the service or component affected
4. isNoise: true if this is likely a false positive, flapping, or low-signal alert
5. noiseReason: if isNoise, explain why
6. suggestedActions: array of 2-4 immediate actions to take
7. escalationPath: who should be paged (e.g., "Platform Eng → SRE Lead → VP Eng")
8. runbookUrl: suggest a relevant runbook path like "/runbooks/service-name/issue-type"
9. confidence: 0-100 confidence in your triage
10. duplicateGroupId: if alerts seem related/duplicate, give them the same group ID (use a descriptive short string)

Return format:
{
  "triaged": [{ ...alert fields for each input alert }],
  "groups": [{ "id": "group-id", "title": "Group Title", "rootCause": "Likely root cause" }],
  "summary": "Brief overall assessment"
}`;

export const INCIDENT_SYSTEM_PROMPT = `You are an expert incident commander AI. Given triaged alerts, generate a comprehensive incident summary. Return ONLY valid JSON (no markdown, no backticks).

Return format:
{
  "title": "Concise incident title",
  "summary": "Detailed incident summary with impact assessment, affected services, and current understanding",
  "priority": "P0-P4",
  "commander": "Suggested incident commander role",
  "slackChannel": "Suggested slack channel name like #inc-service-issue",
  "timeline": [
    { "timestamp": "ISO timestamp", "event": "What happened", "author": "AI Triage" }
  ],
  "suggestedComms": "Draft status page / stakeholder communication"
}`;
