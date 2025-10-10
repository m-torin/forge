import { logWarn } from '@repo/observability';
import type { ModelMessage, UIMessage } from 'ai';
import { z } from 'zod/v3';
import { chatFragments } from '../core/fragments';
import { executeAIOperation } from '../core/operations';
import type { ChatConfig, ChatResult, StructuredDataConfig } from '../core/types';
import { getDefaultModel } from '../providers/registry';

/**
 * Standardized text generation for monorepo
 * Simple helpers that reduce boilerplate without hiding AI SDK
 */

/**
 * Generate text from a prompt or messages
 */
export async function generateText(
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<ChatConfig> = {},
): Promise<ChatResult> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const result = await executeAIOperation('generateText', {
    ...chatFragments.basicChat,
    model: options.model || getDefaultModel(),
    messages,
    ...options,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || {
        message: 'Failed to generate text',
        error: new Error('Unknown error'),
      },
      message: result.text,
      text: result.text,
      messages: result.response?.messages,
      usage: result.usage,
      steps: result.steps,
      finishReason: result.finishReason,
      toUIMessageStreamResponse: result.toUIMessageStreamResponse,
      pipeTextStreamToResponse: result.pipeTextStreamToResponse,
      response: result.response,
    };
  }

  return {
    success: true,
    message: result.text || result.data?.text,
    text: result.text || result.data?.text,
    messages: result.response?.messages,
    usage: result.usage,
    steps: result.steps || result.data?.steps,
    finishReason: result.finishReason,
    toUIMessageStreamResponse: result.toUIMessageStreamResponse,
    pipeTextStreamToResponse: result.pipeTextStreamToResponse,
    response: result.response,
  };
}

/**
 * Generate text with specific domain configurations
 */
export async function generateForDomain(
  domain: keyof typeof chatFragments,
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<ChatConfig> = {},
): Promise<ChatResult> {
  const fragment = chatFragments[domain];
  if (!fragment) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  return generateText(prompt, {
    ...fragment,
    ...options,
  });
}

/**
 * Generate text with specific model
 */
export async function generateWithModel(
  modelPath: string,
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<ChatConfig> = {},
): Promise<ChatResult> {
  return generateText(prompt, {
    ...options,
    model: getDefaultModel(),
  });
}

/**
 * Generate text with experimental structured output support (AI SDK v5)
 * Allows combining text generation with structured data extraction
 */
export async function generateTextWithStructuredOutput<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  schema: z.ZodType<T>,
  options: Partial<StructuredDataConfig<T> & ChatConfig> = {},
): Promise<ChatResult & { experimental_output?: T }> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const result = await executeAIOperation('generateText', {
    ...chatFragments.basicChat,
    model: options.model || getDefaultModel(),
    messages,
    experimental_output: {
      schema,
      schemaName: options.schemaName,
      schemaDescription: options.schemaDescription,
    },
    ...options,
  });

  if (!result.success) {
    throw result.error || new Error('Failed to generate text with structured output');
  }

  return {
    message: result.text,
    text: result.text,
    messages: result.response?.messages,
    usage: result.usage,
    steps: result.steps,
    finishReason: result.finishReason,
    experimental_output: result.experimental_output,
    // AI SDK v5 Streaming Support
    toUIMessageStreamResponse: result.toUIMessageStreamResponse,
    pipeTextStreamToResponse: result.pipeTextStreamToResponse,
    // AI SDK v5 Response Access
    response: result.response,
  } as ChatResult & { experimental_output?: T };
}

/**
 * Batch text generation for multiple prompts
 */
export async function generateBatch(
  prompts: Array<string | UIMessage[] | ModelMessage[]>,
  options: Partial<ChatConfig> = {},
): Promise<ChatResult[]> {
  // Process in parallel for efficiency
  return Promise.all(prompts.map(prompt => generateText(prompt, options)));
}

/**
 * Stream text generation (AI SDK v5)
 */
export async function streamText(
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<ChatConfig> = {},
) {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  return executeAIOperation('streamText', {
    ...chatFragments.basicChat,
    model: options.model || getDefaultModel(),
    messages,
    ...options,
  });
}

/**
 * Stream text with full stream access
 */
export async function streamTextWithFullStream(
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<ChatConfig> = {},
) {
  return streamText(prompt, options);
}

/**
 * Stream text with structured output support
 */
export async function streamTextWithStructuredOutput<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  schema: z.ZodType<T>,
  options: Partial<StructuredDataConfig<T> & ChatConfig> = {},
) {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  return executeAIOperation('streamText', {
    ...chatFragments.basicChat,
    model: options.model || getDefaultModel(),
    messages,
    experimental_output: {
      schema,
      schemaName: options.schemaName,
      schemaDescription: options.schemaDescription,
    },
    ...options,
  });
}

/**
 * Simple stream processor utility
 */
export class StreamProcessor {
  static async processStream(stream: any) {
    // For AI SDK v5 streams, just return the stream
    // Consumers can iterate with for-await-of loops
    return stream;
  }

  static async collectText(stream: any): Promise<string> {
    let text = '';

    try {
      // For AI SDK v5 streams, iterate and collect text
      for await (const chunk of stream) {
        if (chunk.type === 'text-delta') {
          const delta = chunk.delta ?? chunk.textDelta ?? chunk.text ?? '';
          text += delta;
        } else if (chunk.type === 'text') {
          text += chunk.text;
        } else if (typeof chunk === 'string') {
          text += chunk;
        }
      }
    } catch (error) {
      logWarn('Stream collection error', { error });
    }

    return text;
  }
}
