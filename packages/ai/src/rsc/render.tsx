/**
 * AI SDK v5 RSC - Render Implementation
 * Render AI responses as React components
 */

import { streamUI as aiStreamUI } from '@ai-sdk/rsc';
import { logError, logInfo } from '@repo/observability/server/next';
import { type CoreAssistantMessage, type CoreToolMessage } from 'ai';
import { type ReactNode } from 'react';

/**
 * Enhanced render function with additional features
 */
export async function render<_T extends any[]>(
  options: Parameters<typeof aiStreamUI>[0],
): Promise<ReactNode> {
  logInfo('RSC: Starting render', {
    operation: 'rsc_render_start',
    metadata: {
      hasTools: !!options.tools,
      hasModel: !!options.model,
      messagesCount: options.messages?.length || 0,
    },
  });

  try {
    const result = await aiStreamUI(options);

    logInfo('RSC: Render completed', {
      operation: 'rsc_render_complete',
    });

    return result.value;
  } catch (error) {
    logError('RSC: Render failed', {
      operation: 'rsc_render_error',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Render with error boundary
 */
export async function renderWithErrorBoundary(
  options: Parameters<typeof aiStreamUI>[0] & {
    onError?: (error: Error) => ReactNode;
    fallback?: ReactNode;
  },
): Promise<ReactNode> {
  const { onError, fallback, ...renderOptions } = options;

  try {
    return await render(renderOptions);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (onError) {
      return onError(err);
    }

    if (fallback) {
      return fallback;
    }

    throw error;
  }
}

/**
 * Render patterns for common use cases
 */
export const renderPatterns = {
  /**
   * Chat message renderer
   */
  chatMessage: (message: CoreAssistantMessage | CoreToolMessage) => {
    if (message.role === 'assistant') {
      const content = Array.isArray(message.content)
        ? message.content
            .map(part => (part.type === 'text' ? part.text : JSON.stringify(part)))
            .join(' ')
        : String(message.content);

      return (
        <div className="assistant-message">
          <div className="message-header">AI Assistant</div>
          <div className="message-content">{content}</div>
        </div>
      );
    }

    if (message.role === 'tool') {
      return (
        <div className="tool-message">
          <div className="tool-header">Tool: {message.content[0].toolName}</div>
          <div className="tool-result">
            <pre>{JSON.stringify(message.content[0].output, null, 2)}</pre>
          </div>
        </div>
      );
    }

    return null;
  },

  /**
   * Loading state renderer
   */
  loadingState: (message: string = 'Processing...') => (
    <div className="loading-state">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  ),

  /**
   * Error state renderer
   */
  errorState: (error: Error) => (
    <div className="error-state">
      <h3>Error</h3>
      <p>{error.message}</p>
      <details>
        <summary>Stack trace</summary>
        <pre>{error.stack}</pre>
      </details>
    </div>
  ),

  /**
   * Tool call renderer
   */
  toolCall: (toolName: string, args: any, result?: any) => (
    <div className="tool-call">
      <div className="tool-header">
        <span className="tool-name">{toolName}</span>
        <span className="tool-status">{result ? '✓' : '...'}</span>
      </div>
      <details>
        <summary>Arguments</summary>
        <pre>{JSON.stringify(args, null, 2)}</pre>
      </details>
      {result && (
        <details>
          <summary>Result</summary>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </details>
      )}
    </div>
  ),
};

/**
 * Create a custom renderer with middleware
 */
export function createCustomRenderer(middleware: Array<(options: any) => any>) {
  return async (options: Parameters<typeof aiStreamUI>[0]): Promise<ReactNode> => {
    let processedOptions = options;

    // Apply middleware in order
    for (const mw of middleware) {
      processedOptions = await mw(processedOptions);
    }

    return render(processedOptions);
  };
}

/**
 * Render with telemetry
 */
export async function renderWithTelemetry(
  options: Parameters<typeof aiStreamUI>[0] & {
    telemetry?: {
      userId?: string;
      sessionId?: string;
      metadata?: Record<string, any>;
    };
  },
): Promise<ReactNode> {
  const startTime = Date.now();
  const { telemetry, ...renderOptions } = options;

  logInfo('RSC: Render with telemetry', {
    operation: 'rsc_render_telemetry',
    metadata: {
      ...telemetry,
      startTime,
    },
  });

  try {
    const result = await render(renderOptions);

    const duration = Date.now() - startTime;

    logInfo('RSC: Render telemetry complete', {
      operation: 'rsc_render_telemetry_complete',
      metadata: {
        ...telemetry,
        duration,
      },
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logError('RSC: Render telemetry error', {
      operation: 'rsc_render_telemetry_error',
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
 * Batch renderer for multiple messages
 */
export async function renderBatch(
  messages: Array<CoreAssistantMessage | CoreToolMessage>,
  options: Omit<Parameters<typeof aiStreamUI>[0], 'messages'>,
): Promise<ReactNode[]> {
  const results = await Promise.all(
    messages.map(message =>
      render({
        ...options,
        messages: [message],
      }),
    ),
  );

  return results;
}

/**
 * Conditional renderer based on message type
 */
export function createConditionalRenderer(renderers: {
  assistant?: (message: CoreAssistantMessage) => ReactNode;
  tool?: (message: CoreToolMessage) => ReactNode;
  default?: (message: any) => ReactNode;
}) {
  return (message: CoreAssistantMessage | CoreToolMessage): ReactNode => {
    if (message.role === 'assistant' && renderers.assistant) {
      return renderers.assistant(message);
    }

    if (message.role === 'tool' && renderers.tool) {
      return renderers.tool(message);
    }

    if (renderers.default) {
      return renderers.default(message);
    }

    return null;
  };
}

/**
 * Create a themed renderer
 */
export function createThemedRenderer(theme: {
  colors?: {
    primary?: string;
    secondary?: string;
    error?: string;
    success?: string;
  };
  fonts?: {
    body?: string;
    heading?: string;
    code?: string;
  };
  spacing?: {
    small?: string;
    medium?: string;
    large?: string;
  };
}) {
  return {
    message: (content: string, type: 'info' | 'error' | 'success' = 'info') => (
      <div
        style={{
          color:
            theme.colors?.[type === 'error' ? 'error' : type === 'success' ? 'success' : 'primary'],
          fontFamily: theme.fonts?.body,
          padding: theme.spacing?.medium,
        }}
      >
        {content}
      </div>
    ),

    heading: (text: string, level: 1 | 2 | 3 = 1) => {
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
      return (
        <>
          {Tag === 'h1' && (
            <h1
              style={{
                color: theme.colors?.primary,
                fontFamily: theme.fonts?.heading,
                marginTop: theme.spacing?.large,
                marginBottom: theme.spacing?.medium,
              }}
            >
              {text}
            </h1>
          )}
          {Tag === 'h2' && (
            <h2
              style={{
                color: theme.colors?.primary,
                fontFamily: theme.fonts?.heading,
                marginTop: theme.spacing?.large,
                marginBottom: theme.spacing?.medium,
              }}
            >
              {text}
            </h2>
          )}
          {Tag === 'h3' && (
            <h3
              style={{
                color: theme.colors?.primary,
                fontFamily: theme.fonts?.heading,
                marginTop: theme.spacing?.large,
                marginBottom: theme.spacing?.medium,
              }}
            >
              {text}
            </h3>
          )}
        </>
      );
    },

    code: (code: string, language?: string) => (
      <pre
        style={{
          backgroundColor: theme.colors?.secondary,
          fontFamily: theme.fonts?.code,
          padding: theme.spacing?.medium,
          overflow: 'auto',
        }}
      >
        <code data-language={language}>{code}</code>
      </pre>
    ),
  };
}
