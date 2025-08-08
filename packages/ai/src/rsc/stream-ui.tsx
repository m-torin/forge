/**
 * AI SDK v5 RSC - Stream UI Implementation
 * Stream React components from server to client
 */

import { type LanguageModelV2 } from '@ai-sdk/provider';
import { streamUI as aiStreamUI } from '@ai-sdk/rsc';
import { logError, logInfo } from '@repo/observability/server/next';
import { type ReactNode } from 'react';

/**
 * Enhanced streamUI with additional features
 */
export async function streamUI(options: Parameters<typeof aiStreamUI>[0]) {
  logInfo('RSC: Starting UI streaming', {
    operation: 'rsc_stream_ui_start',
    metadata: {
      hasTools: !!options.tools,
      hasInitial: !!options.initial,
      // maxSteps may not be available in @ai-sdk/rsc v1.0.0-canary.22
      maxSteps: (options as any).maxSteps,
    },
  });

  try {
    const result = await aiStreamUI(options);

    logInfo('RSC: UI streaming completed', {
      operation: 'rsc_stream_ui_complete',
    });

    return result;
  } catch (error) {
    logError('RSC: UI streaming failed', {
      operation: 'rsc_stream_ui_error',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Stream UI with error boundaries
 */
export async function streamUIWithErrorBoundary(
  options: Parameters<typeof aiStreamUI>[0] & {
    onError?: (error: Error) => ReactNode;
    fallback?: ReactNode;
  },
) {
  const { onError, fallback, ...streamOptions } = options;

  try {
    return await streamUI(streamOptions);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (onError) {
      return {
        component: onError(err),
        finishReason: 'error' as const,
        usage: { totalTokens: 0, inputTokens: 0, outputTokens: 0 },
      };
    }

    if (fallback) {
      return {
        component: fallback,
        finishReason: 'error' as const,
        usage: { totalTokens: 0, inputTokens: 0, outputTokens: 0 },
      };
    }

    throw error;
  }
}

/**
 * Common UI streaming patterns
 */
export const streamUIPatterns = {
  /**
   * Loading state pattern
   */
  withLoadingState: (
    loadingComponent: ReactNode,
    streamOptions: Parameters<typeof aiStreamUI>[0],
  ): Parameters<typeof aiStreamUI>[0] => ({
    ...streamOptions,
    initial: loadingComponent,
  }),

  /**
   * Error recovery pattern with onFinish
   */
  withRetry: (
    maxRetries: number,
    streamOptions: Parameters<typeof aiStreamUI>[0],
  ): Parameters<typeof aiStreamUI>[0] => {
    let retries = 0;

    return {
      ...streamOptions,
      onFinish: async event => {
        if (event.finishReason === 'error' && retries < maxRetries) {
          retries++;
          logInfo('RSC: Retrying UI generation', {
            operation: 'rsc_stream_ui_retry',
            metadata: { attempt: retries, maxRetries },
          });
          // The actual retry logic should be handled at a higher level
        }
        if (streamOptions.onFinish) {
          await streamOptions.onFinish(event);
        }
      },
    };
  },
};

/**
 * Create a streaming UI component factory
 */
export function createStreamingUIFactory(defaults: Partial<Parameters<typeof aiStreamUI>[0]>) {
  return (options: Parameters<typeof aiStreamUI>[0]) => streamUI({ ...defaults, ...options });
}

/**
 * Stream UI with telemetry
 */
export async function streamUIWithTelemetry(
  options: Parameters<typeof aiStreamUI>[0] & {
    telemetry?: {
      userId?: string;
      sessionId?: string;
      metadata?: Record<string, any>;
    };
  },
) {
  const startTime = Date.now();
  const { telemetry, ...streamOptions } = options;

  logInfo('RSC: UI streaming with telemetry', {
    operation: 'rsc_stream_ui_telemetry',
    metadata: {
      ...telemetry,
      startTime,
    },
  });

  try {
    const result = await streamUI(streamOptions);

    const duration = Date.now() - startTime;

    logInfo('RSC: UI streaming telemetry complete', {
      operation: 'rsc_stream_ui_telemetry_complete',
      metadata: {
        ...telemetry,
        duration,
        // Note: usage and finishReason may not be available in @ai-sdk/rsc v1.0.0-canary.22
        usage: (result as any).usage,
        finishReason: (result as any).finishReason,
      },
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError('RSC: UI streaming telemetry error', {
      operation: 'rsc_stream_ui_telemetry_error',
      metadata: {
        ...telemetry,
        duration,
      },
      error: error instanceof Error ? error : new Error(String(error)),
    });

    throw error;
  }
}

/**
 * Streaming UI examples
 * Note: AI SDK RSC is experimental and development is currently paused.
 * These examples show the basic patterns for reference.
 */
export const streamingUIExamples = {
  /**
   * Basic chat interface
   */
  basicChat: (model: LanguageModelV2, prompt: string) =>
    streamUI({
      model,
      prompt,
      initial: <div>AI is thinking...</div>,
    }),

  /**
   * Chat with loading state
   */
  chatWithLoading: (model: LanguageModelV2, prompt: string) =>
    streamUIPatterns.withLoadingState(<div>Loading your response...</div>, {
      model,
      prompt,
    }),

  /**
   * Note: Tool examples removed due to RSC API compatibility issues.
   * AI SDK RSC is experimental and has complex type requirements.
   * For production use, consider using AI SDK UI instead.
   */
};
