// types.ts
export const CLAUDE_MODELS = {
  OPUS: 'claude-3-opus-20240229',
  SONNET: 'claude-3-sonnet-20240229',
  HAIKU: 'claude-3-haiku-20240307',
  CLAUDE_2: 'claude-2.1',
} as const;

export const MODEL_OPTIONS = [
  { label: 'Claude 3 Opus', value: CLAUDE_MODELS.OPUS },
  { label: 'Claude 3 Sonnet', value: CLAUDE_MODELS.SONNET },
  { label: 'Claude 3 Haiku', value: CLAUDE_MODELS.HAIKU },
  { label: 'Claude 2.1', value: CLAUDE_MODELS.CLAUDE_2 },
] as const;

// Type for model values
export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];
