'use server';

import { createStreamableValue } from '@ai-sdk/rsc';
import { logError } from '@repo/observability';
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod/v3';
import { safeEnv } from '../../../env';
import { getModel } from '../../core/operations';
import { TEMPS, TOKENS } from '../../providers/shared';

/**
 * Server Actions for AI operations
 * These can be used directly in React Server Components
 */

/**
 * Generate text server action
 */
export async function generateTextAction(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    userId?: string;
    conversationId?: string;
  } = {},
) {
  try {
    const env = safeEnv();
    const model = getModel(options.model || env.DEFAULT_AI_MODEL);

    const result = await generateText({
      model,
      prompt,
      temperature: options.temperature ?? TEMPS.BALANCED,
      maxOutputTokens: options.maxOutputTokens ?? TOKENS.SHORT,
    });

    return {
      success: true,
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
    };
  } catch (error) {
    logError('[AI Server Action] Text generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate structured object server action
 */
export async function generateObjectAction<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    userId?: string;
    conversationId?: string;
  } = {},
) {
  try {
    const env = safeEnv();
    const model = getModel(options.model || env.DEFAULT_AI_MODEL);

    const result = await generateObject({
      model,
      prompt,
      schema: schema as any, // Type assertion for AI SDK v5 compatibility
      temperature: options.temperature ?? TEMPS.VERY_LOW,
      maxOutputTokens: options.maxOutputTokens ?? TOKENS.MEDIUM,
    });

    return {
      success: true,
      object: result.object,
      usage: result.usage,
      finishReason: result.finishReason,
    };
  } catch (error) {
    logError('[AI Server Action] Object generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Stream text server action
 */
export async function streamTextAction(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    userId?: string;
    conversationId?: string;
  } = {},
) {
  const env = safeEnv();
  const model = getModel(options.model || env.DEFAULT_AI_MODEL);

  const stream = createStreamableValue('');

  // Start streaming in background
  (async () => {
    try {
      const { textStream } = streamText({
        model,
        prompt,
        temperature: options.temperature ?? TEMPS.BALANCED,
        maxOutputTokens: options.maxOutputTokens ?? TOKENS.SHORT,
      });

      let fullText = '';
      for await (const chunk of textStream) {
        // In AI SDK v5, textStream yields strings directly
        fullText += chunk;
        stream.update(fullText);
      }

      stream.done(fullText);
    } catch (error) {
      logError('[AI Server Action] Text streaming failed:', error);
      stream.error(error);
    }
  })();

  return stream.value;
}

/**
 * Generate chat response with conversation context
 */
export async function generateChatResponseAction(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    tools?: Record<string, any>;
    userId?: string;
    conversationId?: string;
  } = {},
) {
  try {
    const env = safeEnv();
    const model = getModel(options.model || env.DEFAULT_AI_MODEL);

    const result = await generateText({
      model,
      messages,
      temperature: options.temperature ?? TEMPS.BALANCED,
      maxOutputTokens: options.maxOutputTokens ?? TOKENS.SHORT,
      tools: options.tools,
    });

    // TODO: Integrate with @repo/db-prisma to save conversation
    if (options.conversationId && options.userId) {
      // await saveConversationMessage({
      //   conversationId: options.conversationId,
      //   userId: options.userId,
      //   message: { role: 'assistant', content: result.text },
      //   usage: result.usage,
      // });
    }

    return {
      success: true,
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
    };
  } catch (error) {
    logError('[AI Server Action] Chat response failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze content server action (common use case)
 */
export async function analyzeContentAction(
  content: string,
  analysisType: 'sentiment' | 'summary' | 'keywords' | 'classification',
  options: {
    model?: string;
    userId?: string;
    categories?: string[];
  } = {},
) {
  const prompts = {
    sentiment: `Analyze the sentiment of the following content and respond with a JSON object containing "sentiment" (positive/negative/neutral), "confidence" (0-1), and "reasoning":\n\n${content}`,
    summary: `Provide a concise summary of the following content in 2-3 sentences:\n\n${content}`,
    keywords: `Extract the most important keywords and phrases from the following content. Return a JSON array of strings:\n\n${content}`,
    classification: `Classify the following content into one of these categories: ${options.categories?.join(', ') || 'general, technical, business, personal'}. Return a JSON object with "category" and "confidence" (0-1):\n\n${content}`,
  };

  const schemas = {
    sentiment: z.object({
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      confidence: z.number().min(0).max(1),
      reasoningText: z.string(),
    }),
    summary: z.string(),
    keywords: z.array(z.string()),
    classification: z.object({
      category: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  };

  if (analysisType === 'summary') {
    return generateTextAction(prompts[analysisType], options);
  } else {
    return generateObjectAction(prompts[analysisType], schemas[analysisType] as z.ZodSchema<any>, {
      ...options,
      temperature: 0.1,
    });
  }
}

/**
 * Batch process multiple prompts
 */
export async function batchProcessAction(
  prompts: Array<{
    id: string;
    prompt: string;
    type: 'text' | 'object';
    schema?: z.ZodSchema<any>;
  }>,
  options: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    userId?: string;
  } = {},
) {
  try {
    const results = await Promise.all(
      prompts.map(async item => {
        if (item.type === 'object' && item.schema) {
          const result = await generateObjectAction(item.prompt, item.schema, options);
          return { id: item.id, ...result };
        } else {
          const result = await generateTextAction(item.prompt, options);
          return { id: item.id, ...result };
        }
      }),
    );

    return {
      success: true,
      results,
      totalProcessed: results.length,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length,
    };
  } catch (error) {
    logError('[AI Server Action] Batch processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: [],
      totalProcessed: 0,
      successCount: 0,
      errorCount: prompts.length,
    };
  }
}

/**
 * Generate with tool calling
 */
export async function generateWithToolsAction(
  prompt: string,
  tools: Record<string, any>,
  options: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    maxToolRoundtrips?: number;
    userId?: string;
    conversationId?: string;
  } = {},
) {
  try {
    const env = safeEnv();
    const model = getModel(options.model || env.DEFAULT_AI_MODEL);

    const result = await generateText({
      model,
      prompt,
      tools,
      temperature: options.temperature ?? TEMPS.BALANCED,
      maxOutputTokens: options.maxOutputTokens ?? TOKENS.MEDIUM,
    });

    return {
      success: true,
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
      steps: result.steps,
    };
  } catch (error) {
    logError('[AI Server Action] Tool generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
