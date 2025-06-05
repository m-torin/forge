import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { embed, generateObject, generateText, streamText } from 'ai';

import { BaseProvider } from '../../shared/providers/base-provider';

import type {
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
  readonly name: string;
  readonly type = 'ai-sdk' as const;
  readonly capabilities = new Set<Capability>([
    'complete',
    'stream',
    'embed',
    'generateObject',
    'tools',
  ]);

  private model: any;
  private providerName: string;

  private mapFinishReason(
    reason?: string,
  ): 'stop' | 'length' | 'tool_calls' | 'content_filter' | undefined {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool-calls':
        return 'tool_calls';
      case 'content-filter':
        return 'content_filter';
      default:
        return undefined;
    }
  }

  constructor(providerName: 'openai' | 'anthropic' | 'google', modelName?: string) {
    super();
    this.providerName = providerName;
    this.name = `${providerName}-ai-sdk`;

    switch (providerName) {
      case 'openai':
        this.model = openai(modelName || 'gpt-4-turbo');
        break;
      case 'anthropic':
        this.model = anthropic(modelName || 'claude-3-5-sonnet-20241022');
        break;
      case 'google':
        this.model = google(modelName || 'gemini-1.5-pro');
        break;
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      const result = await generateText({
        maxTokens: options.maxTokens,
        model: this.model,
        prompt: options.prompt,
        system: options.systemPrompt,
        temperature: options.temperature,
      });

      return {
        finishReason: this.mapFinishReason(result.finishReason),
        model: this.model.modelId,
        text: result.text,
        usage: result.usage
          ? {
              completionTokens: result.usage.completionTokens,
              promptTokens: result.usage.promptTokens,
              totalTokens: result.usage.totalTokens,
            }
          : undefined,
      };
    } catch (error) {
      throw this.formatError(error, 'completion');
    }
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    try {
      this.validateOptions(options);

      const result = await streamText({
        maxTokens: options.maxTokens,
        model: this.model,
        prompt: options.prompt,
        system: options.systemPrompt,
        temperature: options.temperature,
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
    } catch (error) {
      throw this.formatError(error, 'streaming');
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
        totalTokens += result.usage?.tokens || 0;
      }

      return {
        embeddings,
        usage: {
          completionTokens: 0,
          promptTokens: 0,
          totalTokens,
        },
      };
    } catch (error) {
      throw this.formatError(error, 'embedding');
    }
  }

  async generateObject<T>(options: ObjectOptions<T>): Promise<T> {
    try {
      const result = await generateObject({
        maxTokens: options.maxTokens,
        model: this.model,
        prompt: options.prompt,
        schema: options.schema as any, // AI SDK expects specific schema format
        temperature: options.temperature,
      });

      return result.object as T;
    } catch (error) {
      throw this.formatError(error, 'object generation');
    }
  }
}

export function createOpenAIAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('openai', modelName);
}

export function createAnthropicAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('anthropic', modelName);
}

export function createGoogleAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('google', modelName);
}
