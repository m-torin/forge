/**
 * Pure Anthropic AI SDK Implementation
 * Following Vercel AI SDK patterns exactly - no custom abstractions
 * Supports all official AI SDK features: reasoning, cache control, computer tools
 */

import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { logInfo, logWarn } from '@repo/observability/shared-env';
import type { LanguageModel } from 'ai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod/v4';

/**
 * Provider Instance Creation (Pure AI SDK)
 * Supports custom settings as per AI SDK documentation
 */
export interface AnthropicProviderConfig {
  baseURL?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

/**
 * Anthropic Provider Metadata (AI SDK compliant)
 * Returned in providerMetadata.anthropic
 */
export interface AnthropicProviderMetadata {
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
  [key: string]: unknown;
}

/**
 * Anthropic Generate Result with proper typing
 */
export interface AnthropicGenerateResult {
  text: string;
  reasoning?: string;
  reasoningDetails?: any;
  usage: any;
  providerMetadata?: {
    anthropic?: AnthropicProviderMetadata;
  };
}

/**
 * Anthropic model settings (AI SDK compliant)
 */
export interface AnthropicModelSettings {
  sendReasoning?: boolean;
}

/**
 * Create custom Anthropic provider instance
 * Follows AI SDK pattern: createAnthropic({ custom settings })
 */
export function createAnthropicProvider(config?: AnthropicProviderConfig) {
  if (config) {
    return createAnthropic(config);
  }
  // Return default provider
  return anthropic;
}

/**
 * Model Creation Utilities (Pure AI SDK)
 */

/**
 * Create Anthropic model with reasoning support
 * Pure AI SDK pattern - reasoning via providerOptions
 */
export function createAnthropicWithReasoning(
  modelName: string = 'claude-3-5-sonnet-20241022',
  budgetTokens: number = 12000,
) {
  const model = anthropic(modelName);

  return {
    model,
    // Helper to create generateText calls with reasoning
    async generateWithReasoning(prompt: string, options?: any) {
      return await generateText({
        model,
        prompt,
        ...options,
        providerOptions: {
          ...options?.providerOptions,
          anthropic: {
            ...options?.providerOptions?.anthropic,
            thinking: { type: 'enabled' as const, budgetTokens },
          },
        },
      });
    },
  };
}

/**
 * Create Anthropic model with cache control support
 * Pure AI SDK pattern - cache control via message providerOptions
 */
export function createAnthropicWithCaching(modelName: string = 'claude-3-5-sonnet-20240620') {
  return anthropic(modelName);
}

/**
 * Computer Tools (Pure AI SDK)
 * Direct usage of anthropic.tools.* as per AI SDK documentation
 */

/**
 * Create bash tool (Pure AI SDK pattern)
 */
export function createBashTool(
  execute: (params: { command?: string; restart?: boolean }) => Promise<string>,
) {
  return anthropic.tools.bash_20250124({ execute });
}

/**
 * Create text editor tool (Pure AI SDK pattern)
 * Note: Must be named 'str_replace_editor' in tools object as per AI SDK docs
 */
export function createTextEditorTool(
  execute: (params: {
    command: 'view' | 'create' | 'str_replace' | 'insert' | 'undo_edit';
    path: string;
    file_text?: string;
    insert_line?: number;
    new_str?: string;
    old_str?: string;
    view_range?: number[];
  }) => Promise<string>,
) {
  return anthropic.tools.textEditor_20250124({ execute });
}

/**
 * Create computer tool (Pure AI SDK pattern)
 */
export function createComputerTool(config: {
  displayWidthPx: number;
  displayHeightPx: number;
  displayNumber?: number;
  execute: (params: {
    action:
      | 'key'
      | 'type'
      | 'scroll'
      | 'wait'
      | 'mouse_move'
      | 'left_click'
      | 'left_click_drag'
      | 'right_click'
      | 'middle_click'
      | 'double_click'
      | 'triple_click'
      | 'screenshot'
      | 'cursor_position'
      | 'hold_key'
      | 'left_mouse_down'
      | 'left_mouse_up';
    coordinate?: number[];
    text?: string;
  }) => Promise<string | { type: 'image'; data: string }>;
  experimental_toToolResultContent?: (result: any) => any[];
}) {
  return anthropic.tools.computer_20250124(config);
}

/**
 * Utility Functions (Not Abstractions)
 * Simple helpers that use pure AI SDK patterns
 */

/**
 * Quick sentiment analysis using generateObject (Pure AI SDK)
 */
export async function analyzeSentiment(
  text: string,
  model: LanguageModel = anthropic('claude-3-5-sonnet-20241022'),
) {
  const schema = z.object({
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
  });

  const result = await generateObject({
    model,
    prompt: `Analyze the sentiment of this text:\n\n${text}`,
    schema,
    temperature: 0.1,
  });

  return result.object;
}

/**
 * Quick content moderation using generateObject (Pure AI SDK)
 */
export async function moderateContent(
  text: string,
  model: LanguageModel = anthropic('claude-3-5-sonnet-20241022'),
) {
  const schema = z.object({
    flagged: z.boolean(),
    categories: z.object({
      violence: z.boolean(),
      sexual: z.boolean(),
      harassment: z.boolean(),
      selfHarm: z.boolean(),
      hateSpeech: z.boolean(),
    }),
    scores: z.object({
      violence: z.number().min(0).max(1),
      sexual: z.number().min(0).max(1),
      harassment: z.number().min(0).max(1),
      selfHarm: z.number().min(0).max(1),
      hateSpeech: z.number().min(0).max(1),
    }),
    reasoning: z.string(),
  });

  const result = await generateObject({
    model,
    prompt: `Analyze this text for content moderation. Be thorough but fair:\n\n${text}`,
    schema,
    temperature: 0.1,
  });

  return result.object;
}

/**
 * Entity extraction using generateObject (Pure AI SDK)
 */
export async function extractEntities(
  text: string,
  model: LanguageModel = anthropic('claude-3-5-sonnet-20241022'),
) {
  const schema = z.array(
    z.object({
      type: z.string(),
      value: z.string(),
      confidence: z.number().min(0).max(1),
      metadata: z.record(z.string(), z.any()).optional(),
    }),
  );

  const result = await generateObject({
    model,
    prompt: `Extract all entities (people, places, organizations, dates, etc.) from this text:\n\n${text}`,
    schema,
    temperature: 0.1,
  });

  return result.object;
}

/**
 * Cache Control Helper (Pure AI SDK Pattern)
 * Shows how to use cache control in messages with proper validation
 */
export async function createCachedMessage(
  content: string,
  role: 'system' | 'user' | 'assistant' = 'system',
  options?: {
    minTokens?: number;
    validateTokens?: boolean;
    modelName?: string;
  },
) {
  // AI SDK cache control minimum token requirements
  const getMinTokensForModel = (modelName?: string): number => {
    if (!modelName) return 1024; // Default for most models

    const lowerModel = modelName.toLowerCase();
    // Claude 3.5 Haiku and Claude 3 Haiku need 2048 tokens
    if (lowerModel.includes('haiku')) {
      return 2048;
    }
    // Claude 3.7 Sonnet, Claude 3.5 Sonnet and Claude 3 Opus need 1024 tokens
    return 1024;
  };

  if (options?.validateTokens !== false) {
    const minTokens = options?.minTokens || getMinTokensForModel(options?.modelName);
    // Rough token estimation (1 token ≈ 4 characters for English text)
    const estimatedTokens = Math.ceil(content.length / 4);

    if (estimatedTokens < minTokens) {
      await import('@repo/observability/server/next');
      logWarn(
        `Cache control: content has ~${estimatedTokens} tokens, below minimum ${minTokens} tokens for effective caching with ${options?.modelName || 'this model'}. Shorter prompts cannot be cached even if marked with cacheControl.`,
        {
          operation: 'cache_control',
          provider: 'anthropic',
          model: options?.modelName,
          metadata: { estimatedTokens, minTokens },
        },
      );
    }
  }

  return {
    role,
    content,
    providerOptions: {
      anthropic: {
        cacheControl: { type: 'ephemeral' as const },
      },
    },
  };
}

/**
 * Helper to validate cache control requirements before sending request
 */
export function validateCacheControl(
  content: string,
  modelName: string = 'claude-3-5-sonnet',
): { canCache: boolean; estimatedTokens: number; minRequired: number } {
  const minTokens = modelName.toLowerCase().includes('haiku') ? 2048 : 1024;
  const estimatedTokens = Math.ceil(content.length / 4);

  return {
    canCache: estimatedTokens >= minTokens,
    estimatedTokens,
    minRequired: minTokens,
  };
}

/**
 * Reasoning Helper (Pure AI SDK Pattern)
 * Shows how to extract reasoning from results with proper typing
 */
export function extractReasoning(result: any): AnthropicGenerateResult {
  return {
    text: result.text,
    reasoning: result.reasoning,
    reasoningDetails: result.reasoningDetails,
    usage: result.usage,
    providerMetadata: result.providerMetadata,
  };
}

/**
 * Helper to extract cache metadata from Anthropic results
 */
export function extractCacheMetadata(result: any): AnthropicProviderMetadata | undefined {
  return result.providerMetadata?.anthropic;
}

/**
 * Examples Following AI SDK Documentation Exactly
 */
export const examples = {
  // Basic usage
  async basic() {
    const model = anthropic('claude-3-haiku-20240307');
    return await generateText({
      model,
      prompt: 'Write a vegetarian lasagna recipe for 4 people.',
    });
  },

  // Reasoning (AI SDK pattern)
  async reasoning() {
    const { text, reasoning, reasoningDetails } = await generateText({
      model: anthropic('claude-4-opus-20250514'),
      prompt: 'How many people will live in the world in 2040?',
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 12000 },
        },
      },
    });

    return { text, reasoning, reasoningDetails };
  },

  // Cache control (AI SDK pattern)
  async caching() {
    const errorMessage = '... long error message ...';

    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'You are a JavaScript expert.' },
            {
              type: 'text',
              text: `Error message: ${errorMessage}`,
              providerOptions: {
                anthropic: { cacheControl: { type: 'ephemeral' } },
              },
            },
            { type: 'text', text: 'Explain the error message.' },
          ],
        },
      ],
    });

    logInfo('Anthropic cache control result', {
      textLength: result.text.length,
      providerMetadata: result.providerMetadata?.anthropic,
      operation: 'caching',
    });
    return result;
  },

  // Computer tools (AI SDK pattern)
  async computerUse() {
    const bashTool = createBashTool(async ({ command }) => {
      return `Executed: ${command}`;
    });

    const textEditorTool = createTextEditorTool(async ({ command, path, file_text }) => {
      if (command === 'create') {
        return `Created file ${path} with content: ${file_text}`;
      }
      return `Executed ${command} on ${path}`;
    });

    return await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt:
        "Create a new file called example.txt, write 'Hello World' to it, and run 'cat example.txt' in the terminal",
      tools: {
        bash: bashTool,
        str_replace_editor: textEditorTool, // Note: specific name required
      },
    });
  },
};
