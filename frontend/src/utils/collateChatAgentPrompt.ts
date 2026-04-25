import type { AgentConfiguration } from '@/types/agent';
import { ALL_TOOLS } from '@/data/toolConstants';

function toolLine(ids: string[]): string {
  if (!ids.length) return '';
  const names = ids.map((id) => ALL_TOOLS.find((t) => t.id === id)?.name ?? id);
  return `Valid tool IDs (emit exactly one line \`[TOOL:tool_id]\` before your reply when needed): ${ids.join(', ')}. Tool names for reference: ${names.join(', ')}.`;
}

/**
 * Full system string for Anthropic test chat: identity, constraints, ordered steps, tools.
 */
export function collateChatAgentSystemPrompt(config: AgentConfiguration): string {
  const blocks: string[] = [];

  const intro = config.chatDisplayName?.trim()
    ? `Customer-facing name: ${config.chatDisplayName.trim()}`
    : '';
  if (intro) blocks.push(intro);

  const langs = (config.chatLanguages ?? []).length
    ? `Supported / preferred languages: ${(config.chatLanguages ?? []).join(', ')}. If Auto-detect is included, mirror the customer's language.`
    : '';
  if (langs) blocks.push(langs);

  if (config.systemPrompt?.trim()) {
    blocks.push(`## System prompt\n${config.systemPrompt.trim()}`);
  }

  const always = (config.mustAlwaysRules ?? []).map((r) => r.trim()).filter(Boolean);
  if (always.length) {
    blocks.push(`## Must always\n${always.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
  }

  const never = (config.mustNeverRules ?? []).map((r) => r.trim()).filter(Boolean);
  if (never.length) {
    blocks.push(`## Must never\n${never.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
  }

  const steps = config.instructionSteps ?? [];
  if (steps.length) {
    const stepText = steps
      .map((s, i) => {
        const lines = [`### Step ${i + 1}`, s.instruction.trim() || '(no instruction yet)'];
        if (s.transitionCondition?.trim()) {
          lines.push(`Transition: ${s.transitionCondition.trim()}`);
        }
        if (s.attachedToolIds?.length) {
          lines.push(`Tools for this step: ${s.attachedToolIds.join(', ')}`);
        }
        if (s.quickReplies?.some((q) => q.trim())) {
          lines.push(
            `Quick reply buttons to offer when appropriate: ${s.quickReplies!.filter((q) => q.trim()).join(' | ')}`,
          );
        }
        return lines.join('\n');
      })
      .join('\n\n');
    blocks.push(`## Conversation instructions (follow in order)\n${stepText}`);
  }

  const globalIds = config.globalToolIds ?? [];
  const stepIds = [...new Set(steps.flatMap((s) => s.attachedToolIds ?? []))];
  const allToolIds = [...new Set([...globalIds, ...stepIds])];
  if (allToolIds.length) {
    blocks.push(`## Tools\n${toolLine(allToolIds)}`);
  } else {
    blocks.push('## Tools\nNo tools are configured for this agent.');
  }

  blocks.push(
    '## Output format\nWhen you invoke a tool, output a single line in the exact format `[TOOL:tool_id]` on its own line, then your customer-visible message on following lines. Use only tool IDs listed above.',
  );

  return blocks.join('\n\n');
}
