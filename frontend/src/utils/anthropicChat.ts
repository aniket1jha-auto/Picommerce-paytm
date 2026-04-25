const MODEL = 'claude-sonnet-4-20250514';

type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> };

type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
};

type MessagesResponse = {
  content?: AnthropicContentBlock[];
  error?: { message?: string };
};

function getApiBase(): string {
  if (import.meta.env.DEV) {
    return '/api/anthropic';
  }
  return '/api/anthropic';
}

/**
 * Calls Anthropic Messages API via dev proxy (`/api/anthropic`) or same path in production
 * (must be proxied by your host — keys stay server-side).
 */
export async function sendAnthropicChatMessage(params: {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}): Promise<{ text: string; toolCalls: { name: string }[] }> {
  const body = {
    model: MODEL,
    max_tokens: 1000,
    system: params.system,
    messages: params.messages.map(
      (m): AnthropicMessage => ({
        role: m.role,
        content: m.content,
      }),
    ),
  };

  const res = await fetch(`${getApiBase()}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as MessagesResponse;

  if (!res.ok) {
    const msg = json?.error?.message ?? res.statusText ?? 'Request failed';
    throw new Error(msg);
  }

  const toolCalls: { name: string }[] = [];
  const textParts: string[] = [];

  for (const block of json.content ?? []) {
    if (block.type === 'text') {
      textParts.push(block.text);
    } else if (block.type === 'tool_use') {
      toolCalls.push({ name: block.name });
    }
  }

  return { text: textParts.join('\n').trim(), toolCalls };
}
