/**
 * AI SDK-compliant route handlers for Next.js
 * Replaces custom NextVectorAPI with proper AI SDK patterns
 */

import { logError, logWarn } from '@repo/observability/server/next';

import type { CoreMessage, LanguageModel } from 'ai';
import {
  createDataStreamResponse,
  generateObject,
  generateText,
  streamObject,
  streamText,
} from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAnthropicWithReasoning } from '../providers/anthropic';

/**
 * Configuration for AI SDK routes
 */
export interface AIRouteConfig {
  model?: LanguageModel;
  maxTokens?: number;
  temperature?: number;
  allowedOrigins?: string[];
  enableStreaming?: boolean;
  enableTools?: boolean;
  enableReasoning?: boolean;
}

/**
 * Create a chat completion route using AI SDK patterns
 * This follows the standard AI SDK route pattern instead of custom implementations
 */
export function createChatRoute(config: AIRouteConfig = {}) {
  return async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { messages, model: requestModel, maxTokens, temperature, stream = true } = body;

      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
      }

      // Use provided model or default
      const model = requestModel || config.model || createAnthropicWithReasoning().model;

      const options = {
        model,
        messages: messages as CoreMessage[],
        maxTokens: maxTokens || config.maxTokens || 1000,
        temperature: temperature || config.temperature || 0.7,
      };

      if (stream && config.enableStreaming !== false) {
        // Use AI SDK's streamText function
        const result = await streamText(options);

        // Return streaming response using AI SDK's helper
        return result.toDataStreamResponse();
      } else {
        // Use AI SDK's generateText function for non-streaming
        const result = await generateText(options);

        return NextResponse.json({
          content: result.text,
          usage: result.usage,
          finishReason: result.finishReason,
        });
      }
    } catch (error) {
      logError('Chat route error', error instanceof Error ? error : new Error(String(error)), {
        operation: 'ai_chat_route',
      });
      return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
    }
  };
}

/**
 * Create a text generation route using AI SDK patterns
 */
export function createGenerateRoute(
  config: AIRouteConfig = {},
): (req: NextRequest) => Promise<Response> {
  return async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { prompt, system, model: requestModel, maxTokens, temperature } = body;

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }

      const model = requestModel || config.model || createAnthropicWithReasoning().model;

      const result = await generateText({
        model,
        prompt,
        system,
        maxTokens: maxTokens || config.maxTokens || 1000,
        temperature: temperature || config.temperature || 0.7,
      });

      return NextResponse.json({
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
      });
    } catch (error) {
      logError('Generate route error', error instanceof Error ? error : new Error(String(error)), {
        operation: 'ai_generate_route',
      });
      return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
    }
  };
}

/**
 * Create an object generation route using AI SDK patterns
 */
export function createObjectRoute(config: AIRouteConfig = {}) {
  return async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { prompt, schema, model: requestModel, maxTokens, temperature, stream = false } = body;

      if (!prompt || !schema) {
        return NextResponse.json({ error: 'Prompt and schema are required' }, { status: 400 });
      }

      const model = requestModel || config.model || createAnthropicWithReasoning().model;

      const options = {
        model,
        prompt,
        schema,
        maxTokens: maxTokens || config.maxTokens || 1000,
        temperature: temperature || config.temperature || 0.7,
      };

      if (stream && config.enableStreaming !== false) {
        const result = await streamObject(options);
        return result.toTextStreamResponse();
      } else {
        const result = await generateObject(options);
        return NextResponse.json({
          object: result.object,
          usage: result.usage,
          finishReason: result.finishReason,
        });
      }
    } catch (error) {
      logError(
        'Object generation route error',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'ai_generate_object_route',
        },
      );
      return NextResponse.json({ error: 'Failed to generate object' }, { status: 500 });
    }
  };
}

/**
 * Create a streaming route with data stream support
 */
export function createStreamRoute(config: AIRouteConfig = {}) {
  return async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { messages, model: requestModel, maxTokens, temperature, tools } = body;

      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
      }

      const model = requestModel || config.model || createAnthropicWithReasoning().model;

      const result = await streamText({
        model,
        messages: messages as CoreMessage[],
        maxTokens: maxTokens || config.maxTokens || 1000,
        temperature: temperature || config.temperature || 0.7,
        tools: config.enableTools ? tools : undefined,
      });

      // Use AI SDK's data stream response for structured streaming
      return createDataStreamResponse({
        execute: dataStream => {
          result.fullStream.pipeTo(
            new WritableStream({
              write(chunk) {
                if (chunk.type === 'text-delta') {
                  dataStream.writeData({
                    type: 'text',
                    content: chunk.textDelta,
                  });
                } else if (chunk.type === 'tool-call') {
                  dataStream.writeData({
                    type: 'tool-call',
                    content: {
                      toolCallId: chunk.toolCallId,
                      toolName: chunk.toolName,
                      args: chunk.args,
                    },
                  });
                } else if (chunk.type === 'tool-result') {
                  dataStream.writeData({
                    type: 'tool-result',
                    content: {
                      toolCallId: chunk.toolCallId,
                      toolName: chunk.toolName,
                      args: chunk.args,
                      result: chunk.result,
                    },
                  });
                } else if (chunk.type === 'finish') {
                  dataStream.writeData({
                    type: 'finish',
                    content: {
                      usage: chunk.usage,
                      finishReason: chunk.finishReason,
                    },
                  });
                }
              },
            }),
          );
        },
      });
    } catch (error) {
      logError('Stream route error', error instanceof Error ? error : new Error(String(error)), {
        operation: 'ai_stream_route',
      });
      return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 });
    }
  };
}

/**
 * Route factory for common AI operations
 */
export function createAIRoutes(
  config: AIRouteConfig = {},
): Record<string, (req: NextRequest) => Promise<Response>> {
  return {
    // Standard chat completion
    'POST /api/chat': createChatRoute(config),

    // Text generation
    'POST /api/generate': createGenerateRoute(config),

    // Object generation
    'POST /api/generate-object': createObjectRoute(config),

    // Streaming with data stream
    'POST /api/stream': createStreamRoute(config),

    // Legacy chat endpoint for backward compatibility
    'POST /api/ai/chat': createChatRoute(config),
  };
}

/**
 * Enhanced chat route with vector context integration
 * This replaces the custom createVectorChatAPI
 */
export function createVectorChatRoute(
  config: AIRouteConfig & {
    vectorSearch?: (query: string) => Promise<any[]>;
    contextTopK?: number;
    similarityThreshold?: number;
  },
) {
  return async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const {
        messages,
        vectorContext: providedContext,
        enableVectorSearch = true,
        model: requestModel,
        maxTokens,
        temperature,
      } = body;

      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
      }

      let vectorContext = providedContext || [];

      // Automatically search for context if enabled and search function provided
      if (enableVectorSearch && config.vectorSearch && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
          try {
            vectorContext = await config.vectorSearch(lastMessage.content);
          } catch (error) {
            logWarn('Vector search failed', {
              error: error instanceof Error ? error.message : String(error),
              operation: 'vector_search',
            });
            // Continue without vector context
          }
        }
      }

      // Enhance system message with vector context
      let enhancedMessages = [...messages];
      if (vectorContext.length > 0) {
        const contextString = vectorContext
          .map((item: any) => `${item.content || item.text || JSON.stringify(item)}`)
          .join('\n\n');

        const systemMessage = {
          role: 'system' as const,
          content: `You have access to the following relevant information:\n\n${contextString}\n\nUse this information to provide accurate and helpful responses when relevant.`,
        };

        // Add or prepend system message
        const hasSystemMessage = enhancedMessages[0]?.role === 'system';
        if (hasSystemMessage) {
          enhancedMessages[0] = {
            ...enhancedMessages[0],
            content: `${enhancedMessages[0].content}\n\n${systemMessage.content}`,
          };
        } else {
          enhancedMessages = [systemMessage, ...enhancedMessages];
        }
      }

      const model = requestModel || config.model || createAnthropicWithReasoning().model;

      const result = await streamText({
        model,
        messages: enhancedMessages as CoreMessage[],
        maxTokens: maxTokens || config.maxTokens || 1000,
        temperature: temperature || config.temperature || 0.7,
      });

      return result.toDataStreamResponse();
    } catch (error) {
      logError(
        'Vector chat route error',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'ai_vector_chat_route',
        },
      );
      return NextResponse.json({ error: 'Failed to process vector chat request' }, { status: 500 });
    }
  };
}

/**
 * Utility to create a complete set of AI routes with sensible defaults
 */
export function setupAIRoutes(
  config: AIRouteConfig = {},
): Record<string, (req: NextRequest) => Promise<Response>> {
  const defaultModel = createAnthropicWithReasoning();

  return createAIRoutes({
    model: defaultModel.model,
    maxTokens: 1000,
    temperature: 0.7,
    enableStreaming: true,
    enableTools: true,
    enableReasoning: true,
    ...config,
  });
}
