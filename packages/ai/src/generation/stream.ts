import { logError } from '@repo/observability';
import type { ModelMessage, UIMessage } from 'ai';
import { z } from 'zod/v3';
import { chatFragments } from '../core/fragments';
import { executeAIOperation } from '../core/operations';
import type { ChatConfig, ChatResult, StructuredDataConfig } from '../core/types';
import { getDefaultModel } from '../providers/registry';

/**
 * Standardized streaming utilities for monorepo
 * Streaming patterns with proper error handling and backpressure
 */

/**
 * Stream text generation with full AI SDK v5 support
 */
export async function streamText(
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<ChatConfig> = {},
): Promise<ChatResult> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const result = await executeAIOperation('streamText', {
    ...chatFragments.basicChat,
    model: options.model || getDefaultModel(),
    messages,
    ...options,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || {
        message: 'Failed to stream text',
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
    message: result.text,
    text: result.text,
    messages: result.response?.messages,
    usage: result.usage,
    steps: result.steps,
    finishReason: result.finishReason,
    // AI SDK v5 Streaming Support
    toUIMessageStreamResponse: result.toUIMessageStreamResponse,
    pipeTextStreamToResponse: result.pipeTextStreamToResponse,
    // AI SDK v5 Response Access
    response: result.response,
  };
}

/**
 * Stream with chunk processing
 */
export async function streamTextWithProcessor(
  prompt: string | UIMessage[] | ModelMessage[],
  onChunk: (chunk: any) => void | Promise<void>,
  options: Partial<ChatConfig> = {},
): Promise<ChatResult> {
  return streamText(prompt, {
    ...options,
    experimental_streamHooks: {
      onChunk: async chunk => {
        try {
          await onChunk(chunk);
        } catch (error) {
          logError('[AI Stream] Chunk processing error:', error);
        }
      },
      ...options.experimental_streamHooks,
    },
  });
}

/**
 * Stream with progress tracking
 */
export async function streamTextWithProgress(
  prompt: string | UIMessage[] | ModelMessage[],
  onProgress: (progress: { tokens: number; chunks: number; duration: number }) => void,
  options: Partial<ChatConfig> = {},
): Promise<ChatResult> {
  let chunkCount = 0;
  let tokenCount = 0;
  const startTime = Date.now();

  return streamTextWithProcessor(
    prompt,
    chunk => {
      chunkCount++;
      if (chunk.type === 'text-delta') {
        const delta = chunk.delta ?? chunk.textDelta ?? chunk.text ?? '';
        tokenCount += delta.length;
      }

      const duration = Date.now() - startTime;
      onProgress({ tokens: tokenCount, chunks: chunkCount, duration });
    },
    options,
  );
}

/**
 * Enhanced StreamProcessor with AI SDK v5 event types
 */
export class StreamProcessor {
  private events: any[] = [];
  private text = '';
  private reasoning = '';
  private toolCalls: any[] = [];
  private toolResults: any[] = [];
  private sources: any[] = [];
  private files: any[] = [];
  private startTime = Date.now();

  constructor(private onUpdate?: (state: EnhancedStreamState) => void) {}

  /**
   * Process stream with full AI SDK v5 event handling
   */
  async processFullStream(
    prompt: string | UIMessage[] | ModelMessage[],
    options: Partial<ChatConfig> = {},
  ): Promise<EnhancedStreamResult> {
    const { result, fullStream } = await streamTextWithFullStream(prompt, options);

    // Process the full stream
    await this.handleFullStream(fullStream);

    return {
      ...result,
      text: this.text,
      reasoning: this.reasoning,
      events: this.events,
      toolCalls: this.toolCalls,
      toolResults: this.toolResults,
      sources: this.sources,
      files: this.files,
      duration: Date.now() - this.startTime,
    };
  }

  /**
   * Legacy method for backwards compatibility
   */
  async process(
    prompt: string | UIMessage[] | ModelMessage[],
    options: Partial<ChatConfig> = {},
  ): Promise<StreamResult> {
    const result = await streamTextWithProcessor(prompt, chunk => this.handleChunk(chunk), options);

    return {
      ...result,
      text: this.text,
      chunks: this.events, // Changed from chunks to events
      duration: Date.now() - this.startTime,
    };
  }

  private async handleFullStream(fullStream: ReadableStream) {
    const reader = fullStream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const event = value as any;
        this.events.push(event);

        // Handle different AI SDK v5 event types
        switch (event.type) {
          case 'start':
            this.handleStartEvent(event);
            break;
          case 'text-start':
            this.handleTextStartEvent(event);
            break;
          case 'text-delta':
            this.handleTextDeltaEvent(event);
            break;
          case 'text-end':
            this.handleTextEndEvent(event);
            break;
          case 'reasoning-start':
            this.handleReasoningStartEvent(event);
            break;
          case 'reasoning-delta':
            this.handleReasoningDeltaEvent(event);
            break;
          case 'reasoning-end':
            this.handleReasoningEndEvent(event);
            break;
          case 'source':
            this.handleSourceEvent(event);
            break;
          case 'file':
            this.handleFileEvent(event.file);
            break;
          case 'tool-call':
            this.handleToolCallEvent(event);
            break;
          case 'tool-result':
            this.handleToolResultEvent(event);
            break;
          case 'finish':
            this.handleFinishEvent(event);
            break;
          case 'error':
            this.handleErrorEvent(event);
            break;
        }

        this.notifyUpdate(event);
      }
    } finally {
      reader.releaseLock();
    }
  }

  private handleChunk(chunk: any) {
    this.events.push(chunk);

    if (chunk.type === 'text-delta') {
      const delta = chunk.delta ?? chunk.textDelta ?? chunk.text ?? '';
      this.text += delta;
    }

    this.notifyUpdate(chunk);
  }

  private handleStartEvent(_event: any) {
    // Reset state for new stream
  }

  private handleTextStartEvent(_event: any) {
    // Text generation started
  }

  private handleTextDeltaEvent(event: any) {
    this.text += event.delta ?? event.textDelta ?? event.text ?? '';
  }

  private handleTextEndEvent(_event: any) {
    // Text generation completed
  }

  private handleReasoningStartEvent(_event: any) {
    // Reasoning started
  }

  private handleReasoningDeltaEvent(event: any) {
    this.reasoning += event.delta ?? event.reasoningDelta ?? event.text ?? '';
  }

  private handleReasoningEndEvent(_event: any) {
    // Reasoning completed
  }

  private handleSourceEvent(event: any) {
    this.sources.push(event);
  }

  private handleFileEvent(event: any) {
    this.files.push(event);
  }

  private handleToolCallEvent(event: any) {
    this.toolCalls.push(event);
  }

  private handleToolResultEvent(event: any) {
    this.toolResults.push(event);
  }

  private handleFinishEvent(_event: any) {
    // Stream finished
  }

  private handleErrorEvent(event: any) {
    logError('[StreamProcessor] Stream error', event.error as Error);
  }

  private notifyUpdate(lastEvent: any) {
    if (this.onUpdate) {
      this.onUpdate({
        text: this.text,
        reasoning: this.reasoning,
        events: this.events.length,
        toolCalls: this.toolCalls.length,
        toolResults: this.toolResults.length,
        sources: this.sources.length,
        files: this.files.length,
        lastEvent,
        duration: Date.now() - this.startTime,
      });
    }
  }
}

/**
 * Stream with rate limiting (for high-volume use cases)
 */
export async function streamTextWithRateLimit(
  prompt: string | UIMessage[] | ModelMessage[],
  rateLimitMs = 100,
  options: Partial<ChatConfig> = {},
): Promise<ChatResult> {
  let lastChunkTime = 0;

  return streamTextWithProcessor(
    prompt,
    async chunk => {
      const now = Date.now();
      const elapsed = now - lastChunkTime;

      if (elapsed < rateLimitMs) {
        await new Promise(resolve => setTimeout(resolve, rateLimitMs - elapsed));
      }

      lastChunkTime = Date.now();
    },
    options,
  );
}

/**
 * Stream with domain-specific configuration
 */
export async function streamForDomain(
  domain: keyof typeof chatFragments,
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<ChatConfig> = {},
): Promise<ChatResult> {
  const fragment = chatFragments[domain];
  if (!fragment) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  return streamText(prompt, {
    ...fragment,
    ...options,
  });
}

/**
 * Stream text with experimental structured output support (AI SDK v5)
 * Allows streaming text while extracting structured data
 */
export async function streamTextWithStructuredOutput<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  schema: z.ZodType<T>,
  options: Partial<StructuredDataConfig<T> & ChatConfig> = {},
): Promise<
  ChatResult & {
    experimental_partialOutputStream?: ReadableStream<T>;
    experimental_output?: T;
  }
> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const result = await executeAIOperation('streamText', {
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
    throw result.error || new Error('Failed to stream text with structured output');
  }

  return {
    message: result.text,
    text: result.text,
    messages: result.response?.messages,
    usage: result.usage,
    steps: result.steps,
    finishReason: result.finishReason,
    experimental_partialOutputStream: result.experimental_partialOutputStream,
    experimental_output: result.experimental_output,
    // AI SDK v5 Streaming Support
    toUIMessageStreamResponse: result.toUIMessageStreamResponse,
    pipeTextStreamToResponse: result.pipeTextStreamToResponse,
    // AI SDK v5 Response Access
    response: result.response,
  } as ChatResult & {
    experimental_partialOutputStream?: ReadableStream<T>;
    experimental_output?: T;
  };
}

/**
 * Stream with full AI SDK v5 fullStream access
 */
export async function streamTextWithFullStream(
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<ChatConfig> = {},
): Promise<{
  result: ChatResult;
  fullStream: ReadableStream;
}> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const result = await executeAIOperation('streamText', {
    ...chatFragments.basicChat,
    model: options.model || getDefaultModel(),
    messages,
    ...options,
  });

  if (!result.success) {
    throw result.error;
  }

  return {
    result: {
      success: true,
      message: result.text,
      text: result.text,
      usage: result.usage,
      steps: result.steps,
      finishReason: result.finishReason,
      toUIMessageStreamResponse: result.toUIMessageStreamResponse,
      pipeTextStreamToResponse: result.pipeTextStreamToResponse,
      response: result.response,
    },
    fullStream: result.fullStream!, // Full event stream access
  };
}

/**
 * Process fullStream with event handlers
 */
export async function processFullStream(
  fullStream: ReadableStream,
  handlers: {
    onStart?: () => void;
    onTextDelta?: (text: string) => void;
    onToolCall?: (toolCall: any) => void;
    onToolResult?: (result: any) => void;
    onError?: (error: any) => void;
    onFinish?: () => void;
  } = {},
): Promise<{
  text: string;
  toolCalls: any[];
  toolResults: any[];
}> {
  let text = '';
  const toolCalls: any[] = [];
  const toolResults: any[] = [];

  const reader = fullStream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Process each event type from fullStream
      const event = value as any;

      switch (event.type) {
        case 'start':
          handlers.onStart?.();
          break;
        case 'text-delta':
          {
            const delta = event.delta ?? event.textDelta ?? event.text ?? '';
            text += delta;
            handlers.onTextDelta?.(delta);
          }
          break;
        case 'tool-call':
          toolCalls.push(event);
          handlers.onToolCall?.(event);
          break;
        case 'tool-result':
          toolResults.push(event);
          handlers.onToolResult?.(event);
          break;
        case 'error':
          handlers.onError?.(event);
          break;
        case 'finish':
          handlers.onFinish?.();
          break;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { text, toolCalls, toolResults };
}

/**
 * Utilities for common streaming patterns
 */
export const streamUtils = {
  /**
   * Convert stream to async iterator
   */
  async *toAsyncIterator(
    prompt: string | UIMessage[] | ModelMessage[],
    options: Partial<ChatConfig> = {},
  ): AsyncIterableIterator<any> {
    const result = await streamText(prompt, options);
    if (result.toUIMessageStreamResponse) {
      // This would need to be adapted based on AI SDK stream format
      // Placeholder for actual stream iteration
      yield* [];
    }
  },

  /**
   * Collect stream chunks into array
   */
  async collectChunks(
    prompt: string | UIMessage[] | ModelMessage[],
    options: Partial<ChatConfig> = {},
  ): Promise<any[]> {
    const chunks: any[] = [];
    await streamTextWithProcessor(
      prompt,
      chunk => {
        chunks.push(chunk);
      },
      options,
    );
    return chunks;
  },

  /**
   * Get only the final text from stream
   */
  async getFinalText(
    prompt: string | UIMessage[] | ModelMessage[],
    options: Partial<ChatConfig> = {},
  ): Promise<string> {
    let finalText = '';
    await streamTextWithProcessor(
      prompt,
      chunk => {
        if (chunk.type === 'text-delta') {
          const delta = chunk.delta ?? chunk.textDelta ?? chunk.text ?? '';
          finalText += delta;
        }
      },
      options,
    );
    return finalText;
  },
};

// Types for stream processing
interface StreamState {
  text: string;
  chunks: number;
  lastChunk: any;
  duration: number;
}

interface EnhancedStreamState {
  text: string;
  reasoning: string;
  events: number;
  toolCalls: number;
  toolResults: number;
  sources: number;
  files: number;
  lastEvent: any;
  duration: number;
}

interface StreamResult extends ChatResult {
  text: string;
  chunks: any[];
  duration: number;
}

interface EnhancedStreamResult extends ChatResult {
  text: string;
  reasoning: string;
  events: any[];
  toolCalls: any[];
  toolResults: any[];
  sources: any[];
  files: any[];
  duration: number;
}
