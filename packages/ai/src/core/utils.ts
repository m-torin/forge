import type { ModelMessage, UIMessage } from 'ai';
import { convertToModelMessages } from 'ai';

/**
 * Core utility functions for @repo/ai
 */

/**
 * Generate unique operation ID using ES2023 patterns
 */
export const generateOperationId = (): string => {
  return `ai_op_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

/**
 * Calculate estimated cost for token usage
 */
export function calculateCost(
  modelId: string = '',
  usage: { inputTokens: number; outputTokens: number },
): number {
  // Rough cost estimates per 1k tokens (as of 2024)
  const costMap: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    // Default fallback
    default: { input: 0.001, output: 0.002 },
  };

  // Find matching cost or use default (ES2023: Object.hasOwn)
  const modelKey =
    Object.keys(costMap).find(key => modelId.toLowerCase().includes(key.toLowerCase())) ??
    'default';

  const rates = costMap[modelKey];

  return (usage.inputTokens / 1000) * rates.input + (usage.outputTokens / 1000) * rates.output;
}

/**
 * Validate AI operation configuration using ES2023 patterns
 */
export const validateConfig = (config: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  config.temperature != null &&
    (config.temperature < 0 || config.temperature > 2) &&
    errors.push('Temperature must be between 0 and 2');

  config.maxOutputTokens != null &&
    config.maxOutputTokens < 1 &&
    errors.push('maxOutputTokens must be greater than 0');

  config.topP != null &&
    (config.topP < 0 || config.topP > 1) &&
    errors.push('topP must be between 0 and 1');

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Merge configuration objects with defaults using ES2023 structuredClone for deep merge safety
 */
export const mergeConfigs = <T extends Record<string, any>>(
  base: T,
  override: Partial<T> = {},
): T => ({
  ...base,
  ...override,
});

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {},
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, backoffFactor = 2 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // lastError is always set when we exhaust retries
  throw lastError;
}

/**
 * Check if error is retryable using ES2023 patterns
 */
export const isRetryableError = (error: any): boolean => {
  if (!error) return false;

  const retryablePatterns = [
    /rate limit/i,
    /timeout/i,
    /connection/i,
    /network/i,
    /503/,
    /502/,
    /500/,
  ] as const;

  const message = error.message ?? String(error);
  return retryablePatterns.some(pattern => pattern.test(message));
};

/**
 * Format token usage for display using ES2023 patterns
 */
export const formatUsage = (usage: {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}) => ({
  ...usage,
  formatted: `${usage.inputTokens.toLocaleString()} in + ${usage.outputTokens.toLocaleString()} out = ${usage.totalTokens.toLocaleString()} total`,
  cost: calculateCost('default', usage),
});

/**
 * Message utilities for data transformation
 */
export const messageUtils = {
  /**
   * Normalize message format for AI operations
   */
  normalize: (messages: Array<ModelMessage | UIMessage | string>): any[] => {
    if (!Array.isArray(messages)) {
      return [];
    }

    return messages.flatMap(message => {
      if (typeof message === 'string') {
        return [{ role: 'user' as const, content: message } as ModelMessage];
      }

      if (message && typeof message === 'object') {
        if ('content' in message && message.content !== undefined) {
          return [
            {
              ...(message as ModelMessage),
              role: (message as ModelMessage).role ?? 'user',
            },
          ];
        }

        if ('parts' in (message as UIMessage)) {
          const { id, ...rest } = message as UIMessage & { id?: string };
          return convertToModelMessages([{ ...rest }]);
        }

        if ('text' in (message as { text?: string })) {
          const text = (message as { text?: string }).text ?? '';
          return [
            {
              role: (message as { role?: ModelMessage['role'] }).role ?? 'user',
              content: text,
              ...(message as Record<string, unknown>),
            } as ModelMessage,
          ];
        }
      }

      return [];
    });
  },
};
