import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { embed, generateObject, generateText, streamText } from 'ai';

import { BaseProvider } from '../../shared/providers/base-provider';

import {
  Capability,
  CompletionOptions,
  CompletionResponse,
  EmbeddingResponse,
  EmbedOptions,
  ObjectOptions,
  StreamChunk,
  StreamOptions,
} from '../../shared/types';

export class AISdkProvider extends BaseProvider {
  readonly capabilities = new Set<Capability>([
    'complete',
    'embed',
    'generateObject',
    'stream',
    'tools',
  ]);
  readonly name: string;
  readonly type = 'ai-sdk' as const;

  private model: any;
  private providerName: string;

  constructor(providerName: 'anthropic' | 'google' | 'openai', modelName?: string) {
    super();
    this.providerName = providerName;
    this.name = `${providerName}-ai-sdk`;

    switch (providerName) {
      case 'anthropic':
        this.model = anthropic(modelName ?? 'claude-3-5-sonnet-20241022');
        break;
      case 'google':
        this.model = google(modelName ?? 'gemini-1.5-pro');
        break;
      case 'openai':
        this.model = openai(modelName ?? 'gpt-4-turbo');
        break;
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      const result = await generateText({
        model: this.model,
        prompt: options.prompt,
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.systemPrompt && { system: options.systemPrompt }),
        ...(options.temperature && { temperature: options.temperature }),
      });

      const response: CompletionResponse = {
        text: result.text,
        ...(this.mapFinishReason(result.finishReason) && {
          finishReason: this.mapFinishReason(result.finishReason)!,
        }),
        ...(this.model.modelId && { model: this.model.modelId }),
        ...(result.usage && {
          usage: {
            completionTokens: result.usage.completionTokens,
            promptTokens: result.usage.promptTokens,
            totalTokens: result.usage.totalTokens,
          },
        }),
      };
      return response;
    } catch (error: any) {
      throw this.formatError(error, 'completion');
    }
  }

  async embed(options: EmbedOptions): Promise<EmbeddingResponse> {
    try {
      // AI SDK embed only works with certain providers
      if (this.providerName !== 'openai') {
        throw new Error(`Embedding not supported for ${this.providerName} in AI SDK mode`);
      }

      const inputs = Array.isArray(options.input) ? options.input : [options.input];
      const embeddings: number[][] = [];
      let totalTokens = 0;

      // Process each input separately to avoid data corruption
      for (const input of inputs) {
        const result = await embed({
          model: openai.embedding('text-embedding-3-small'),
          value: input,
        });

        embeddings.push(result.embedding);
        totalTokens += result.usage?.tokens ?? 0;
      }

      return {
        embeddings,
        usage: {
          completionTokens: 0,
          promptTokens: 0,
          totalTokens,
        },
      };
    } catch (error: any) {
      throw this.formatError(error, 'embedding');
    }
  }

  async generateObject<T>(options: ObjectOptions<T>): Promise<T> {
    try {
      const result = await generateObject({
        model: this.model,
        prompt: options.prompt,
        schema: options.schema as any, // AI SDK expects specific schema format
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.temperature && { temperature: options.temperature }),
      });

      return result.object as T;
    } catch (error: any) {
      throw this.formatError(error, 'object generation');
    }
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    try {
      this.validateOptions(options);

      const result = await streamText({
        model: this.model,
        prompt: options.prompt,
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.systemPrompt && { system: options.systemPrompt }),
        ...(options.temperature && { temperature: options.temperature }),
      });

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

export function createAnthropicAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('anthropic', modelName);
}

export function createGoogleAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('google', modelName);
}

export function createOpenAIAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('openai', modelName);
}
