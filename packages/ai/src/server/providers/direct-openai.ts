import OpenAI from 'openai';

import { BaseProvider } from '../../shared/providers/base-provider';

import {
  Capability,
  CompletionOptions,
  CompletionResponse,
  DirectOpenAIConfig,
  EmbeddingResponse,
  EmbedOptions,
  ModerationResult,
  StreamChunk,
  StreamOptions,
} from '../../shared/types';

export class DirectOpenAIProvider extends BaseProvider {
  readonly capabilities = new Set<Capability>([
    'complete',
    'embed',
    'generateObject',
    'moderate',
    'stream',
    'tools',
  ]);
  readonly name = 'openai-direct';
  readonly type = 'direct' as const;

  private client: OpenAI;
  private config: DirectOpenAIConfig;

  constructor(config: DirectOpenAIConfig) {
    super();
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      ...(config.baseUrl && { baseURL: config.baseUrl }),
      ...(config.organization && { organization: config.organization }),
      timeout: config.timeout ?? 30000, // 30 second default
    });
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      // Build messages array from either single prompt or messages array
      let messages: Array<{ content: string; role: 'system' | 'user' | 'assistant' }>;

      if (options.messages && options.messages.length > 0) {
        // Use provided messages array
        messages = options.messages;
      } else if (options.prompt) {
        // Convert single prompt to messages format
        messages = [
          ...(options.systemPrompt
            ? [{ content: options.systemPrompt, role: 'system' as const }]
            : []),
          { content: options.prompt, role: 'user' as const },
        ];
      } else {
        throw new Error('Either prompt or messages must be provided');
      }

      const response = await this.client.chat.completions.create({
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        messages,
        model: options.model ?? this.config.model ?? 'gpt-4-turbo',
        temperature: options.temperature ?? this.config.temperature ?? 0.1,
      });

      const finishReason = this.mapFinishReason(response.choices[0]?.finish_reason);
      const completionResponse: CompletionResponse = {
        text: response.choices[0]?.message?.content ?? '',
        ...(finishReason && { finishReason }),
        ...(response.id && { id: response.id }),
        ...(response.model && { model: response.model }),
        ...(response.usage && {
          usage: {
            completionTokens: response.usage.completion_tokens,
            promptTokens: response.usage.prompt_tokens,
            totalTokens: response.usage.total_tokens,
          },
        }),
      };
      return completionResponse;
    } catch (error: any) {
      throw this.formatError(error, 'completion');
    }
  }

  async embed(options: EmbedOptions): Promise<EmbeddingResponse> {
    try {
      const input = Array.isArray(options.input) ? options.input : [options.input];

      // OpenAI supports batch embedding natively
      const response = await this.client.embeddings.create({
        input,
        model: options.model ?? 'text-embedding-3-small',
      });

      return {
        embeddings: response.data.map((item: any) => item.embedding),
        model: response.model,
        ...(response.usage && {
          usage: {
            completionTokens: 0,
            promptTokens: response.usage.prompt_tokens,
            totalTokens: response.usage.total_tokens,
          },
        }),
      };
    } catch (error: any) {
      throw this.formatError(error, 'embedding');
    }
  }

  /**
   * Enhanced batch embedding method using OpenAI's native batch support
   */
  async embedBatch(texts: string[], model?: string): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        input: texts,
        model: model ?? 'text-embedding-3-small',
      });

      return response.data.map((item: any) => item.embedding);
    } catch (error: any) {
      throw this.formatError(error, 'batch embedding');
    }
  }

  async moderate(content: string): Promise<ModerationResult> {
    try {
      const response = await this.client.moderations.create({
        input: content,
      });

      const result = response.results[0];
      if (!result) {
        return {
          confidence: 0.5,
          explanation: 'No moderation result returned',
          safe: true,
          violations: [],
        };
      }

      const violations: string[] = [];
      if (result.categories) {
        for (const [category, flagged] of Object.entries(result.categories)) {
          if (flagged) {
            violations.push(category);
          }
        }
      }

      return {
        confidence: Math.max(...Object.values(result.category_scores ?? {})),
        explanation:
          violations.length > 0
            ? `Content flagged for: ${violations.join(', ')}`
            : 'Content is safe',
        safe: !result.flagged,
        violations,
      };
    } catch (error: any) {
      throw this.formatError(error, 'moderation');
    }
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    try {
      this.validateOptions(options);

      // Build messages array from either single prompt or messages array
      let messages: Array<{ content: string; role: 'system' | 'user' | 'assistant' }>;

      if (options.messages && options.messages.length > 0) {
        // Use provided messages array
        messages = options.messages;
      } else if (options.prompt) {
        // Convert single prompt to messages format
        messages = [
          ...(options.systemPrompt
            ? [{ content: options.systemPrompt, role: 'system' as const }]
            : []),
          { content: options.prompt, role: 'user' as const },
        ];
      } else {
        throw new Error('Either prompt or messages must be provided');
      }

      const stream = await this.client.chat.completions.create({
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        messages,
        model: options.model ?? this.config.model ?? 'gpt-4-turbo',
        stream: true,
        temperature: options.temperature ?? this.config.temperature ?? 0.1,
      });

      let isFirst = true;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          const streamChunk: StreamChunk = {
            isFirst,
            isLast: false,
            text: content,
          };

          if (options.onChunk) {
            options.onChunk(streamChunk);
          }

          yield streamChunk;
          isFirst = false;
        }
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
      case 'content_filter':
        return 'content_filter';
      case 'length':
        return 'length';
      case 'stop':
        return 'stop';
      case 'tool_calls':
        return 'tool_calls';
      default:
        return undefined;
    }
  }
}

export function createDirectOpenAIProvider(
  config?: Partial<DirectOpenAIConfig>,
): DirectOpenAIProvider | null {
  const apiKey = config?.apiKey ?? process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn('[DirectOpenAIProvider] No API key found');
    return null;
  }

  const finalConfig: DirectOpenAIConfig = {
    apiKey,
    maxTokens:
      config?.maxTokens ??
      (process.env.OPENAI_MAX_TOKENS ? parseInt(process.env.OPENAI_MAX_TOKENS, 10) : 1000),
    model: config?.model ?? process.env.OPENAI_MODEL ?? 'gpt-4-turbo',
    temperature:
      config?.temperature ??
      (process.env.OPENAI_TEMPERATURE ? parseFloat(process.env.OPENAI_TEMPERATURE) : 0.1),
    ...(config?.baseUrl && { baseUrl: config.baseUrl }),
    ...(process.env.OPENAI_BASE_URL && { baseUrl: process.env.OPENAI_BASE_URL }),
    ...(config?.organization && { organization: config.organization }),
    ...(process.env.OPENAI_ORGANIZATION && { organization: process.env.OPENAI_ORGANIZATION }),
  };

  return new DirectOpenAIProvider(finalConfig);
}
