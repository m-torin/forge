import { anthropic } from '@ai-sdk/anthropic';
// import { deepseek } from '@ai-sdk/deepseek'; // TODO: Enable when package is available
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { perplexity } from '@ai-sdk/perplexity';
import { embed, embedMany, generateObject, generateText, streamText } from 'ai';

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

  constructor(providerName: 'anthropic' | 'google' | 'openai' | 'perplexity', modelName?: string) {
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
      case 'perplexity':
        this.model = perplexity(modelName ?? 'sonar-pro');
        break;
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      // Support both single prompt and messages array patterns
      let generateTextOptions: any = {
        model: this.model,
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.temperature && { temperature: options.temperature }),
      };

      if (options.messages && options.messages.length > 0) {
        // Use messages array for chat-style completion
        generateTextOptions.messages = options.messages;
      } else if (options.prompt) {
        // Use single prompt with optional system prompt
        generateTextOptions.prompt = options.prompt;
        if (options.systemPrompt) {
          generateTextOptions.system = options.systemPrompt;
        }
      } else {
        throw new Error('Either prompt or messages must be provided');
      }

      const result = await generateText(generateTextOptions);

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
        ...(result.sources && { sources: result.sources }),
      };
      return response;
    } catch (error: any) {
      throw this.formatError(error, 'completion');
    }
  }

  async embed(options: EmbedOptions): Promise<EmbeddingResponse> {
    try {
      // AI SDK embed only works with certain providers
      if (!['openai'].includes(this.providerName)) {
        throw new Error(`Embedding not supported for ${this.providerName} in AI SDK mode`);
      }

      const inputs = Array.isArray(options.input) ? options.input : [options.input];

      // Use embedMany for batch operations when multiple inputs
      if (inputs.length > 1) {
        const result = await embedMany({
          model: openai.embedding(options.model ?? 'text-embedding-3-small'),
          values: inputs,
        });

        return {
          embeddings: result.embeddings,
          usage: {
            completionTokens: 0,
            promptTokens: 0,
            totalTokens: result.usage?.tokens ?? 0,
          },
        };
      } else {
        // Use single embed for single input
        const result = await embed({
          model: openai.embedding(options.model ?? 'text-embedding-3-small'),
          value: inputs[0],
        });

        return {
          embeddings: [result.embedding],
          usage: {
            completionTokens: 0,
            promptTokens: 0,
            totalTokens: result.usage?.tokens ?? 0,
          },
        };
      }
    } catch (error: any) {
      throw this.formatError(error, 'embedding');
    }
  }

  async generateObject<T>(options: ObjectOptions<T>): Promise<T> {
    try {
      const generateOptions: any = {
        model: this.model,
        prompt: options.prompt,
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.temperature && { temperature: options.temperature }),
      };

      // Handle schema vs output mode
      if (options.output === 'array') {
        generateOptions.output = 'array';
        generateOptions.schema = options.schema;
      } else {
        // Default object mode
        generateOptions.schema = options.schema;
      }

      const result = await generateObject(generateOptions);
      return result.object as T;
    } catch (error: any) {
      throw this.formatError(error, 'object generation');
    }
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    try {
      this.validateOptions(options);

      // Support both single prompt and messages array patterns
      let streamTextOptions: any = {
        model: this.model,
        ...(options.maxTokens && { maxTokens: options.maxTokens }),
        ...(options.temperature && { temperature: options.temperature }),
      };

      if (options.messages && options.messages.length > 0) {
        // Use messages array for chat-style streaming
        streamTextOptions.messages = options.messages;
      } else if (options.prompt) {
        // Use single prompt with optional system prompt
        streamTextOptions.prompt = options.prompt;
        if (options.systemPrompt) {
          streamTextOptions.system = options.systemPrompt;
        }
      } else {
        throw new Error('Either prompt or messages must be provided');
      }

      const result = await streamText(streamTextOptions);

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

// TODO: Enable when @ai-sdk/deepseek package is available
// export function createDeepSeekAISdkProvider(modelName?: string): AISdkProvider {
//   return new AISdkProvider('deepseek', modelName);
// }

/**
 * Helper function for reasoning model pattern:
 * 1. Generate reasoning with DeepSeek (or other reasoning model)
 * 2. Extract structured data with lightweight model (like gpt-4o-mini)
 */
export async function generateObjectWithReasoning<T>(options: {
  extractionModel?: AISdkProvider;
  reasoningModel: AISdkProvider;
  reasoningPrompt: string;
  schema: object | Record<string, unknown>;
  extractionPrompt?: string;
  output?: 'array' | 'object';
}): Promise<T> {
  // Step 1: Generate reasoning with reasoning model
  const reasoningResult = await options.reasoningModel.complete({
    prompt: options.reasoningPrompt,
  });

  // Step 2: Extract structured data with extraction model (default to gpt-4o-mini)
  const extractionModel = options.extractionModel ?? createOpenAIAISdkProvider('gpt-4o-mini');

  const extractionPrompt =
    options.extractionPrompt ??
    'Extract the desired information from this text: \n' + reasoningResult.text;

  return extractionModel.generateObject<T>({
    prompt: extractionPrompt,
    schema: options.schema,
    ...(options.output && { output: options.output }),
  });
}

export function createGoogleAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('google', modelName);
}

export function createOpenAIAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('openai', modelName);
}

export function createPerplexityAISdkProvider(modelName?: string): AISdkProvider {
  return new AISdkProvider('perplexity', modelName);
}
