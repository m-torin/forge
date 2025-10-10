import { createStreamableUI, createStreamableValue } from '@ai-sdk/rsc';
import { generateText, LanguageModel, streamText } from 'ai';
import { ReactNode } from 'react';
import { safeEnv } from '../../../env';
import { getDefaultModel } from '../../providers/registry';
import { TEMPS } from '../../providers/shared';

/**
 * Server-side streaming utilities for React Server Components
 * Provides helpers for streaming AI responses in RSC context
 */

/**
 * Create streamable text response for RSC
 */
export async function createStreamableText(
  prompt: string,
  options: {
    model?: LanguageModel | string;
    temperature?: number;
    maxOutputTokens?: number;
    onUpdate?: (text: string) => void;
    onComplete?: (text: string) => void;
  } = {},
) {
  const stream = createStreamableValue('');
  safeEnv();

  // Start streaming in background
  (async () => {
    try {
      const model =
        typeof options.model === 'string' ? getDefaultModel() : options.model || getDefaultModel();
      const { textStream } = streamText({
        model,
        prompt,
        temperature: options.temperature ?? TEMPS.BALANCED,
      });

      let fullText = '';

      for await (const chunk of textStream) {
        // In AI SDK v5, textStream yields strings directly
        fullText += chunk;
        stream.update(fullText);
        options.onUpdate?.(fullText);
      }

      stream.done(fullText);
      options.onComplete?.(fullText);
    } catch (error) {
      stream.error(error);
    }
  })();

  return stream.value;
}

/**
 * Create streamable UI component for RSC
 */
export async function createStreamableComponent(
  initialComponent: ReactNode,
  options: {
    onUpdate?: (component: ReactNode) => ReactNode;
    onComplete?: (component: ReactNode) => ReactNode;
  } = {},
): Promise<any> {
  const stream = createStreamableUI(initialComponent);

  return {
    ui: stream.value,
    update: (component: ReactNode) => {
      const updated = options.onUpdate?.(component) || component;
      stream.update(updated);
    },
    complete: (component: ReactNode) => {
      const completed = options.onComplete?.(component) || component;
      stream.done(completed);
    },
    error: (error: any) => stream.error(error),
  };
}

/**
 * Stream text with UI updates
 */
export async function streamTextWithUI(
  prompt: string,
  renderText: (text: string, isComplete: boolean) => ReactNode,
  options: {
    model?: LanguageModel | string;
    temperature?: number;
    maxOutputTokens?: number;
  } = {},
) {
  const ui = createStreamableUI(renderText('', false));
  safeEnv();

  // Start streaming in background
  (async () => {
    try {
      const model =
        typeof options.model === 'string' ? getDefaultModel() : options.model || getDefaultModel();
      const { textStream } = streamText({
        model,
        prompt,
        temperature: options.temperature ?? TEMPS.BALANCED,
      });

      let fullText = '';

      for await (const chunk of textStream) {
        // In AI SDK v5, textStream yields strings directly
        fullText += chunk;
        ui.update(renderText(fullText, false));
      }

      ui.done(renderText(fullText, true));
    } catch (error) {
      ui.error(error);
    }
  })();

  return ui.value;
}

/**
 * Create a progressive loading UI with AI streaming
 */
export async function createProgressiveUI(
  stages: Array<{
    prompt: string;
    renderLoading: () => ReactNode;
    renderResult: (result: string) => ReactNode;
    model?: LanguageModel | string;
  }>,
) {
  const ui = createStreamableUI(null);
  const results: string[] = [];

  // Start processing stages
  (async () => {
    try {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];

        // Show loading state
        ui.update(
          <div>
            {results.map((result, idx) => stages[idx].renderResult(result))}
            {stage.renderLoading()}
          </div>,
        );

        // Generate result
        safeEnv();
        const model =
          typeof stage.model === 'string' ? getDefaultModel() : stage.model || getDefaultModel();
        const { text } = await generateText({
          model,
          prompt: stage.prompt,
          temperature: TEMPS.BALANCED,
        });

        results.push(text);

        // Update with result
        ui.update(<div>{results.map((result, idx) => stages[idx].renderResult(result))}</div>);
      }

      // Mark as complete
      ui.done(<div>{results.map((result, idx) => stages[idx].renderResult(result))}</div>);
    } catch (error) {
      ui.error(error);
    }
  })();

  return ui.value;
}

/**
 * Stream with tool calling support in RSC
 */
export async function streamWithTools(
  prompt: string,
  tools: Record<string, any>,
  renderMessage: (content: string, toolCalls?: any[]) => ReactNode,
  options: {
    model?: LanguageModel | string;
    temperature?: number;
    maxOutputTokens?: number;
  } = {},
) {
  const ui = createStreamableUI(renderMessage(''));
  safeEnv();

  (async () => {
    try {
      const model =
        typeof options.model === 'string' ? getDefaultModel() : options.model || getDefaultModel();
      const result = await generateText({
        model,
        prompt,
        tools,
        temperature: options.temperature ?? TEMPS.BALANCED,
      });

      // Handle tool calls if present
      if (result.toolCalls && result.toolCalls.length > 0) {
        ui.update(renderMessage(result.text, result.toolCalls));
      } else {
        ui.update(renderMessage(result.text));
      }

      ui.done(renderMessage(result.text, result.toolCalls));
    } catch (error) {
      ui.error(error);
    }
  })();

  return ui.value;
}

/**
 * Batch multiple AI operations with progressive UI
 */
export async function batchOperationsWithUI(
  operations: Array<{
    id: string;
    prompt: string;
    model?: LanguageModel | string;
    renderPending: () => ReactNode;
    renderComplete: (result: string) => ReactNode;
    renderError: (error: any) => ReactNode;
  }>,
) {
  const ui = createStreamableUI(
    <div>
      {operations.map(op => (
        <div key={op.id}>{op.renderPending()}</div>
      ))}
    </div>,
  );

  const results = new Map<
    string,
    { status: 'pending' | 'complete' | 'error'; data?: string; error?: any }
  >();

  // Initialize all as pending
  operations.forEach(op => {
    results.set(op.id, { status: 'pending' });
  });

  // Process all operations in parallel
  const promises = operations.map(async op => {
    try {
      const model =
        typeof op.model === 'string' ? getDefaultModel() : op.model || getDefaultModel();
      const { text } = await generateText({
        model,
        prompt: op.prompt,
        temperature: TEMPS.BALANCED,
      });

      results.set(op.id, { status: 'complete', data: text });
    } catch (error) {
      results.set(op.id, { status: 'error', error });
    }

    // Update UI after each completion
    ui.update(
      <div>
        {operations.map(operation => {
          const result = results.get(operation.id);

          if (!result) {
            return <div key={operation.id}>{operation.renderPending()}</div>;
          }

          switch (result.status) {
            case 'pending':
              return <div key={operation.id}>{operation.renderPending()}</div>;
            case 'complete':
              if (result.data === undefined) {
                return <div key={operation.id}>{operation.renderPending()}</div>;
              }
              return <div key={operation.id}>{operation.renderComplete(result.data)}</div>;
            case 'error':
              return <div key={operation.id}>{operation.renderError(result.error)}</div>;
            default:
              return <div key={operation.id}>{operation.renderPending()}</div>;
          }
        })}
      </div>,
    );
  });

  // Wait for all to complete
  await Promise.all(promises);

  // Final update
  ui.done(
    <div>
      {operations.map(operation => {
        const result = results.get(operation.id);

        if (!result) {
          return <div key={operation.id}>{operation.renderPending()}</div>;
        }

        switch (result.status) {
          case 'complete':
            if (result.data === undefined) {
              return <div key={operation.id}>{operation.renderPending()}</div>;
            }
            return <div key={operation.id}>{operation.renderComplete(result.data)}</div>;
          case 'error':
            return <div key={operation.id}>{operation.renderError(result.error)}</div>;
          default:
            return <div key={operation.id}>{operation.renderPending()}</div>;
        }
      })}
    </div>,
  );

  return ui.value;
}
