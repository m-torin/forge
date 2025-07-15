// types.ts
export const OPENAI_MODELS = {
  GPT4: 'gpt-4',
  GPT4_TURBO: 'gpt-4-1106-preview',
  GPT35_TURBO: 'gpt-3.5-turbo',
} as const;

export type OpenAIModel = (typeof OPENAI_MODELS)[keyof typeof OPENAI_MODELS];
