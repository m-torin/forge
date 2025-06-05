import OpenAI from 'openai';

import { BaseProvider } from '../../shared/providers/base-provider';

import type {
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
  readonly name = 'openai-direct';
  readonly type = 'direct' as const;
  readonly capabilities = new Set<Capability>([
    'complete',
    'stream',
    'embed',
    'generateObject',
    'tools',
    'moderate',
  ]);

  private client: OpenAI;
  private config: DirectOpenAIConfig;

  constructor(config: DirectOpenAIConfig) {
    super();
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      organization: config.organization,
      timeout: config.timeout || 30000, // 30 second default
    });
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      const response = await this.client.chat.completions.create({
        max_tokens: options.maxTokens || this.config.maxTokens || 1000,
        messages: [
          ...(options.systemPrompt
            ? [{ content: options.systemPrompt, role: 'system' as const }]
            : []),
          { content: options.prompt, role: 'user' as const },
        ],
        model: options.model || this.config.model || 'gpt-4-turbo',
        temperature: options.temperature ?? this.config.temperature ?? 0.1,
      });

      return {
        id: response.id,
        finishReason: this.mapFinishReason(response.choices[0]?.finish_reason),
        model: response.model,
        text: response.choices[0]?.message?.content || '',
        usage: response.usage
          ? {
              completionTokens: response.usage.completion_tokens,
              promptTokens: response.usage.prompt_tokens,
              totalTokens: response.usage.total_tokens,
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

      const stream = await this.client.chat.completions.create({
        max_tokens: options.maxTokens || this.config.maxTokens || 1000,
        messages: [
          ...(options.systemPrompt
            ? [{ content: options.systemPrompt, role: 'system' as const }]
            : []),
          { content: options.prompt, role: 'user' as const },
        ],
        model: options.model || this.config.model || 'gpt-4-turbo',
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
    } catch (error) {
      throw this.formatError(error, 'streaming');
    }
  }

  async embed(options: EmbedOptions): Promise<EmbeddingResponse> {
    try {
      const input = Array.isArray(options.input) ? options.input : [options.input];

      const response = await this.client.embeddings.create({
        input,
        model: options.model || 'text-embedding-3-small',
      });

      return {
        embeddings: response.data.map((item) => item.embedding),
        model: response.model,
        usage: response.usage
          ? {
              completionTokens: 0,
              promptTokens: response.usage.prompt_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw this.formatError(error, 'embedding');
    }
  }

  private mapFinishReason(
    reason?: string,
  ): 'stop' | 'length' | 'tool_calls' | 'content_filter' | undefined {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
        return 'tool_calls';
      case 'content_filter':
        return 'content_filter';
      default:
        return undefined;
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
        confidence: Math.max(...Object.values(result.category_scores || {})),
        explanation:
          violations.length > 0
            ? `Content flagged for: ${violations.join(', ')}`
            : 'Content is safe',
        safe: !result.flagged,
        violations,
      };
    } catch (error) {
      throw this.formatError(error, 'moderation');
    }
  }
}

export function createDirectOpenAIProvider(
  config?: Partial<DirectOpenAIConfig>,
): DirectOpenAIProvider | null {
  const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('[DirectOpenAIProvider] No API key found');
    return null;
  }

  const finalConfig: DirectOpenAIConfig = {
    apiKey,
    baseUrl: config?.baseUrl || process.env.OPENAI_BASE_URL,
    maxTokens:
      config?.maxTokens ??
      (process.env.OPENAI_MAX_TOKENS ? parseInt(process.env.OPENAI_MAX_TOKENS, 10) : 1000),
    model: config?.model || process.env.OPENAI_MODEL || 'gpt-4-turbo',
    organization: config?.organization || process.env.OPENAI_ORGANIZATION,
    temperature:
      config?.temperature ??
      (process.env.OPENAI_TEMPERATURE ? parseFloat(process.env.OPENAI_TEMPERATURE) : 0.1),
  };

  return new DirectOpenAIProvider(finalConfig);
}
