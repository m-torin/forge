import type { LanguageModelV2 } from '@ai-sdk/provider';
import { withReasoningMiddleware } from '../../server/providers/custom-providers';

/**
 * Apply reasoning middleware to specific models
 * Following Vercel AI SDK patterns for reasoning model setup
 */
export function applyReasoningMiddleware(
  models: Record<string, LanguageModelV2>,
  config: {
    reasoningModels: string[];
    tagName?: string;
  },
): Record<string, LanguageModelV2> {
  const result = { ...models };

  config.reasoningModels.forEach(modelKey => {
    if (result[modelKey]) {
      result[modelKey] = withReasoningMiddleware(result[modelKey], config.tagName || 'think');
    }
  });

  return result;
}

/**
 * Helper to create reasoning models with default configuration
 */
export function createReasoningModels(baseModels: Record<string, LanguageModelV2>) {
  return applyReasoningMiddleware(baseModels, {
    reasoningModels: ['chat-model-reasoning'],
    tagName: 'think',
  });
}
