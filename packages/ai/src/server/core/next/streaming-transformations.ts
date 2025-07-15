import type { LanguageModelV2 } from '@ai-sdk/provider';
import { smoothStream, streamObject, streamText, type UIMessageStreamWriter } from 'ai';
import type { z } from 'zod/v4';

export interface StreamTextConfig {
  model: LanguageModelV2;
  system?: string;
  prompt: string;
  enableSmoothing?: boolean;
  chunkingStrategy?: 'word' | 'line';
  prediction?: {
    type: 'content';
    content: string;
  };
}

export interface StreamObjectConfig<T extends z.ZodSchema> {
  model: LanguageModelV2;
  system?: string;
  prompt: string;
  schema: T;
}

export interface StreamHandler {
  onTextDelta?: (textDelta: string) => void;
  onObjectDelta?: (object: any) => void;
  onComplete?: (content: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Streams text generation with optional smoothing and data stream writing
 */
export async function streamTextGeneration(
  config: StreamTextConfig,
  dataStream: UIMessageStreamWriter,
  handler?: StreamHandler,
): Promise<string> {
  const {
    model,
    system,
    prompt,
    enableSmoothing = true,
    chunkingStrategy = 'word',
    prediction,
  } = config;

  let draftContent = '';

  try {
    const streamConfig: any = {
      model,
      system,
      prompt,
    };

    if (enableSmoothing) {
      streamConfig.experimental_transform = smoothStream({
        chunking: chunkingStrategy,
      });
    }

    if (prediction) {
      streamConfig.providerOptions = {
        openai: {
          prediction,
        },
      };
    }

    const { fullStream } = streamText(streamConfig);

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text') {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: 'text' as any,
          text: text,
        });

        handler?.onTextDelta?.(text);
      }
    }

    handler?.onComplete?.(draftContent);
    return draftContent;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    handler?.onError?.(err);
    throw err;
  }
}

/**
 * Streams object generation with schema validation and data stream writing
 */
export async function streamObjectGeneration<T extends z.ZodSchema>(
  config: StreamObjectConfig<T>,
  dataStream: UIMessageStreamWriter,
  handler?: StreamHandler,
): Promise<string> {
  const { model, system, prompt, schema } = config;

  let draftContent = '';

  try {
    const { fullStream } = streamObject({
      model,
      system,
      prompt,
      schema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;

        handler?.onObjectDelta?.(object);

        // Handle different object types - customize based on schema
        if (
          object &&
          typeof object === 'object' &&
          'code' in object &&
          typeof (object as any).code === 'string'
        ) {
          const code = (object as any).code as string;
          dataStream.write({
            type: 'data-code-delta' as any,
            data: code,
          } as any);
          draftContent = code;
        } else if (
          object &&
          typeof object === 'object' &&
          'text' in object &&
          typeof (object as any).text === 'string'
        ) {
          const text = (object as any).text as string;
          dataStream.write({
            type: 'text' as any,
            text: text,
          });
          draftContent = text;
        } else if (
          object &&
          typeof object === 'object' &&
          'content' in object &&
          typeof (object as any).content === 'string'
        ) {
          const content = (object as any).content as string;
          dataStream.write({
            type: 'data-content-delta' as any,
            data: content,
          } as any);
          draftContent = content;
        }
      }
    }

    handler?.onComplete?.(draftContent);
    return draftContent;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    handler?.onError?.(err);
    throw err;
  }
}

/**
 * Generic stream processor that can handle different delta types
 */
export class StreamProcessor {
  private content = '';
  private handlers: StreamHandler;

  constructor(
    private dataStream: UIMessageStreamWriter,
    handlers: StreamHandler = {},
  ) {
    this.handlers = handlers;
  }

  /**
   * Processes a text delta
   */
  processTextDelta(textDelta: string): void {
    this.content += textDelta;
    this.dataStream.write({
      type: 'text' as any,
      text: textDelta,
    });
    this.handlers.onTextDelta?.(textDelta);
  }

  /**
   * Processes a code delta
   */
  processCodeDelta(code: string): void {
    this.content = code;
    this.dataStream.write({
      type: 'data-code-delta' as any,
      data: code,
    } as any);
  }

  /**
   * Processes an object delta
   */
  processObjectDelta(object: any): void {
    this.handlers.onObjectDelta?.(object);
  }

  /**
   * Signals completion and returns final content
   */
  complete(): string {
    this.handlers.onComplete?.(this.content);
    return this.content;
  }

  /**
   * Handles errors
   */
  error(error: Error): void {
    this.handlers.onError?.(error);
  }

  /**
   * Gets current content
   */
  getContent(): string {
    return this.content;
  }
}

/**
 * Creates a reusable document handler with streaming capabilities
 */
export function createStreamingDocumentHandler<T extends string>(config: {
  kind: T;
  onCreateDocument: (params: {
    title: string;
    processor: StreamProcessor;
    model: LanguageModelV2;
  }) => Promise<string>;
  onUpdateDocument: (params: {
    content: string;
    description: string;
    processor: StreamProcessor;
    model: LanguageModelV2;
  }) => Promise<string>;
}) {
  return {
    kind: config.kind,
    createDocument: async (
      title: string,
      dataStream: UIMessageStreamWriter,
      model: LanguageModelV2,
      handler?: StreamHandler,
    ): Promise<string> => {
      const processor = new StreamProcessor(dataStream, handler);
      return config.onCreateDocument({ title, processor, model });
    },
    updateDocument: async (
      content: string,
      description: string,
      dataStream: UIMessageStreamWriter,
      model: LanguageModelV2,
      handler?: StreamHandler,
    ): Promise<string> => {
      const processor = new StreamProcessor(dataStream, handler);
      return config.onUpdateDocument({ content, description, processor, model });
    },
  };
}
