import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

import { BaseProvider } from '../../shared/providers/base-provider';

import {
  Capability,
  CompletionOptions,
  CompletionResponse,
  StreamChunk,
  StreamOptions,
} from '../../shared/types';

export class GoogleSearchProvider extends BaseProvider {
  readonly capabilities = new Set<Capability>(['complete', 'stream']);
  readonly name = 'google-search';
  readonly type = 'ai-sdk' as const;

  private model: any;
  private useSearchGrounding: boolean;

  constructor(modelName: string = 'gemini-1.5-pro', useSearchGrounding: boolean = true) {
    super();
    this.useSearchGrounding = useSearchGrounding;
    this.model = google(modelName, {
      useSearchGrounding: this.useSearchGrounding,
    });
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      const generateOptions: any = {
        model: this.model,
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.temperature && { temperature: options.temperature }),
      };

      if (options.messages && options.messages.length > 0) {
        generateOptions.messages = options.messages;
      } else if (options.prompt) {
        generateOptions.prompt = options.prompt;
        if (options.systemPrompt) {
          generateOptions.system = options.systemPrompt;
        }
      } else {
        throw new Error('Either prompt or messages must be provided');
      }

      const result = await generateText(generateOptions);

      const response: CompletionResponse = {
        text: result.text,
        ...(this.mapFinishReason(result.finishReason) && {
          finishReason: this.mapFinishReason(result.finishReason)!,
        }),
        ...(result.sources && { sources: result.sources }),
        ...(result.usage && {
          usage: {
            completionTokens: result.usage.completionTokens,
            promptTokens: result.usage.promptTokens,
            totalTokens: result.usage.totalTokens,
          },
        }),
      };

      // Add Google-specific metadata if available
      if (result.providerMetadata?.google) {
        const metadata = result.providerMetadata.google;
        // Could extend response interface to include grounding metadata
        // For now, just ensure sources are included
      }

      return response;
    } catch (error: any) {
      throw this.formatError(error, 'completion');
    }
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    try {
      this.validateOptions(options);

      const streamOptions: any = {
        model: this.model,
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.temperature && { temperature: options.temperature }),
      };

      if (options.messages && options.messages.length > 0) {
        streamOptions.messages = options.messages;
      } else if (options.prompt) {
        streamOptions.prompt = options.prompt;
        if (options.systemPrompt) {
          streamOptions.system = options.systemPrompt;
        }
      } else {
        throw new Error('Either prompt or messages must be provided');
      }

      const result = await streamText(streamOptions);

      let isFirst = true;

      for await (const chunk of result.textStream) {
        const streamChunk: StreamChunk = {
          isFirst,
          isLast: false,
          text: chunk,
        };

        if (options.onChunk) {
          options.onChunk(streamChunk);
        }

        yield streamChunk;
        isFirst = false;
      }

      // Final chunk
      yield {
        isFirst: false,
        isLast: true,
        text: '',
      };
    } catch (error: any) {
      throw this.formatError(error, 'streaming');
    }
  }

  private mapFinishReason(
    reason?: string,
  ): 'content_filter' | 'length' | 'stop' | 'tool_calls' | undefined {
    switch (reason) {
      case 'content-filter':
        return 'content_filter';
      case 'length':
        return 'length';
      case 'stop':
        return 'stop';
      case 'tool-calls':
        return 'tool_calls';
      default:
        return undefined;
    }
  }
}

export function createGoogleSearchProvider(
  modelName?: string,
  useSearchGrounding?: boolean,
): GoogleSearchProvider {
  return new GoogleSearchProvider(modelName, useSearchGrounding);
}
