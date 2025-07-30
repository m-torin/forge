/**
 * AI Provider Registry with Model Aliases and Configurations
 * Centralizes provider management with smart routing and fallbacks
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createRetryMiddleware, retryPresets } from '@repo/ai/server';
import { logWarn } from '@repo/observability';
import {
  createProviderRegistry,
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from 'ai';

const isProduction = process.env.NODE_ENV === 'production';

// Create retry middleware
const retryMiddleware = createRetryMiddleware(
  isProduction ? retryPresets.production() : retryPresets.development(),
);

/**
 * Create the centralized provider registry with model aliases
 */
export const providerRegistry = createProviderRegistry(
  {
    // OpenAI models with custom configurations
    openai: customProvider({
      languageModels: {
        // Fast, cost-effective model for simple tasks
        fast: wrapLanguageModel({
          model: openai('gpt-4o-mini'),
          middleware: [
            retryMiddleware,
            defaultSettingsMiddleware({
              settings: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              },
            }),
          ],
        }),

        // Balanced model for general use
        balanced: wrapLanguageModel({
          model: openai('gpt-4o'),
          middleware: [
            retryMiddleware,
            defaultSettingsMiddleware({
              settings: {
                temperature: 0.8,
                maxOutputTokens: 4096,
              },
            }),
          ],
        }),

        // Advanced reasoning model
        reasoning: wrapLanguageModel({
          model: openai('o1-preview'),
          middleware: [
            retryMiddleware,
            defaultSettingsMiddleware({
              settings: {
                maxOutputTokens: 8192,
              },
            }),
          ],
        }),
      },
      fallbackProvider: openai,
    }),

    // Anthropic models with custom configurations
    anthropic: customProvider({
      languageModels: {
        // Fast Haiku model
        fast: wrapLanguageModel({
          model: anthropic('claude-3-haiku-20240307'),
          middleware: [
            retryMiddleware,
            defaultSettingsMiddleware({
              settings: {
                temperature: 0.7,
                maxOutputTokens: 4096,
              },
            }),
          ],
        }),

        // Latest Sonnet for balanced performance
        balanced: wrapLanguageModel({
          model: anthropic('claude-3-5-sonnet-20241022'),
          middleware: [
            retryMiddleware,
            defaultSettingsMiddleware({
              settings: {
                temperature: 0.8,
                maxOutputTokens: 8192,
              },
            }),
          ],
        }),

        // Claude 4 models with full reasoning support
        'claude-4-opus-20250514': wrapLanguageModel({
          model: anthropic('claude-4-opus-20250514'),
          middleware: [
            retryMiddleware,
            defaultSettingsMiddleware({
              settings: {
                headers: {
                  'anthropic-beta': 'interleaved-thinking-2025-05-14',
                },
                maxOutputTokens: 100000,
                providerOptions: {
                  anthropic: {
                    thinking: { type: 'enabled', budgetTokens: 15000 },
                  },
                },
              },
            }),
          ],
        }),

        'claude-4-sonnet-20250514': wrapLanguageModel({
          model: anthropic('claude-4-sonnet-20250514'),
          middleware: [
            retryMiddleware,
            defaultSettingsMiddleware({
              settings: {
                headers: {
                  'anthropic-beta': 'interleaved-thinking-2025-05-14',
                },
                maxOutputTokens: 50000,
                providerOptions: {
                  anthropic: {
                    thinking: { type: 'enabled', budgetTokens: 12000 },
                  },
                },
              },
            }),
          ],
        }),

        // Extended reasoning configuration (Claude 3.7)
        reasoning: wrapLanguageModel({
          model: anthropic('claude-3-7-sonnet-20250219'),
          middleware: [
            retryMiddleware,
            defaultSettingsMiddleware({
              settings: {
                headers: {
                  'anthropic-beta': 'interleaved-thinking-2025-05-14',
                },
                maxOutputTokens: 100000,
                providerOptions: {
                  anthropic: {
                    thinking: { type: 'enabled', budgetTokens: 12000 },
                  },
                },
              },
            }),
          ],
        }),
      },
      fallbackProvider: anthropic,
    }),
  },
  {
    // Use colon separator for cleaner syntax
    separator: ':',
  },
);

/**
 * Model selection strategies based on task type
 */
export const modelSelectionStrategies = {
  // For quick responses and simple queries
  speed: {
    primary: 'openai:fast',
    fallback: 'anthropic:fast',
  },

  // For balanced performance and quality
  balanced: {
    primary: 'anthropic:balanced',
    fallback: 'openai:balanced',
  },

  // For complex reasoning and analysis
  reasoning: {
    primary: 'anthropic:reasoning',
    fallback: 'openai:reasoning',
  },

  // For creative writing and content generation
  creative: {
    primary: 'anthropic:balanced',
    fallback: 'openai:balanced',
  },
};

/**
 * Get model based on strategy and user entitlements
 */
export function selectModel(
  strategy: keyof typeof modelSelectionStrategies = 'balanced',
  userType: string = 'regular',
): string {
  const modelStrategy = modelSelectionStrategies[strategy];

  // Premium users get primary models, regular users get fallbacks
  if (userType === 'premium') {
    return modelStrategy.primary;
  }

  // Regular users get more cost-effective options
  return strategy === 'reasoning'
    ? modelSelectionStrategies.balanced.fallback // Downgrade reasoning to balanced
    : modelStrategy.fallback;
}

/**
 * Get image generation model (if available)
 */
export function getImageModel(quality: 'standard' | 'hd' = 'standard') {
  try {
    return providerRegistry.imageModel(quality === 'hd' ? 'openai:dall-e-3' : 'openai:dall-e-2');
  } catch {
    // Image models may not be available
    return null;
  }
}

/**
 * Helper to get a language model with automatic fallback
 */
export async function getModelWithFallback(modelId: string, fallbackId?: string) {
  try {
    return providerRegistry.languageModel(modelId as any);
  } catch (error) {
    if (fallbackId) {
      logWarn('Model not available, using fallback', { modelId, fallbackId });
      return providerRegistry.languageModel(fallbackId as any);
    }
    throw error;
  }
}
