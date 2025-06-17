import Anthropic from '@anthropic-ai/sdk';

import { BaseProvider } from '../../shared/providers/base-provider';

import {
  Capability,
  CompletionOptions,
  CompletionResponse,
  DirectAnthropicConfig,
  EntityResult,
  ModerationResult,
  SentimentResult,
  StreamChunk,
  StreamOptions,
} from '../../shared/types';

export class DirectAnthropicProvider extends BaseProvider {
  readonly capabilities = new Set<Capability>([
    'classify',
    'complete',
    'extraction',
    'moderate',
    'sentiment',
    'stream',
  ]);
  readonly name = 'anthropic-direct';
  readonly type = 'direct' as const;

  private client: Anthropic;
  private config: DirectAnthropicConfig;

  constructor(config: DirectAnthropicConfig) {
    super();
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      ...(config.baseUrl && { baseURL: config.baseUrl }),
      timeout: config.timeout ?? 30000, // 30 second default
    });
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      const response = await this.client.messages.create({
        max_tokens: 300,
        messages: [
          {
            content: `Analyze the sentiment of this text. Return JSON with:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": number (0-1),
  "reasoning": "brief explanation"
}

Text: ${text}`,
            role: 'user',
          },
        ],
        model: this.config.model ?? 'claude-3-5-sonnet-20241022',
        temperature: 0.1,
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';

      try {
        return JSON.parse(responseText);
      } catch (error: any) {
        // Re-throw error instead of returning fake response
        throw this.formatError(
          new Error(
            `Failed to parse sentiment response: ${error instanceof Error ? error.message : String(error)}`,
          ),
          'sentiment analysis',
        );
      }
    } catch (error: any) {
      throw this.formatError(error, 'sentiment analysis');
    }
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      const response = await this.client.messages.create({
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        messages: [{ content: options.prompt, role: 'user' }],
        model: options.model ?? this.config.model ?? 'claude-3-5-sonnet-20241022',
        temperature: options.temperature ?? this.config.temperature ?? 0.1,
        ...(options.systemPrompt && { system: options.systemPrompt }),
      });

      const finishReason = this.mapFinishReason(response.stop_reason ?? undefined);
      const completionResponse: CompletionResponse = {
        text: response.content[0]?.type === 'text' ? response.content[0].text : '',
        ...(finishReason && { finishReason }),
        ...(response.id && { id: response.id }),
        ...(response.model && { model: response.model }),
        usage: {
          completionTokens: response.usage.output_tokens,
          promptTokens: response.usage.input_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
      return completionResponse;
    } catch (error: any) {
      throw this.formatError(error, 'completion');
    }
  }

  async extractEntities(text: string): Promise<EntityResult> {
    try {
      const response = await this.client.messages.create({
        max_tokens: 500,
        messages: [
          {
            content: `Extract entities from this text. Return JSON with:
{
  "entities": [
    {"type": "person|organization|location|date|email|phone", "value": "entity_value", "confidence": number}
  ]
}

Text: ${text}`,
            role: 'user',
          },
        ],
        model: this.config.model ?? 'claude-3-5-sonnet-20241022',
        temperature: 0.1,
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';

      try {
        return JSON.parse(responseText);
      } catch (error: any) {
        // Re-throw error instead of returning empty response
        throw this.formatError(
          new Error(
            `Failed to parse entity extraction response: ${error instanceof Error ? error.message : String(error)},`,
          ),
          'entity extraction',
        );
      }
    } catch (error: any) {
      throw this.formatError(error, 'entity extraction');
    }
  }

  async moderate(content: string): Promise<ModerationResult> {
    try {
      const response = await this.client.messages.create({
        max_tokens: 500,
        messages: [
          {
            content: `Please analyze this content for safety issues. Return JSON with this format:
{
  "safe": boolean,
  "violations": ["list", "of", "violations"],
  "confidence": number (0-1),
  "explanation": "brief explanation"
}

Content to analyze: ${content}`,
            role: 'user',
          },
        ],
        model: this.config.model ?? 'claude-3-5-sonnet-20241022',
        temperature: 0.1,
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';

      try {
        const result = JSON.parse(responseText);
        return {
          confidence: result.confidence ?? 0.5,
          explanation: result.explanation ?? 'Content analysis completed',
          safe: result.safe ?? true,
          violations: result.violations ?? [],
        };
      } catch (error: any) {
        // Re-throw error instead of returning fake safe response
        throw this.formatError(
          new Error(
            `Failed to parse moderation response: ${error instanceof Error ? error.message : String(error)},`,
          ),
          'moderation',
        );
      }
    } catch (error: any) {
      throw this.formatError(error, 'moderation');
    }
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    try {
      this.validateOptions(options);

      const stream = await this.client.messages.create({
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        messages: [{ content: options.prompt, role: 'user' }],
        model: options.model ?? this.config.model ?? 'claude-3-5-sonnet-20241022',
        stream: true,
        temperature: options.temperature ?? this.config.temperature ?? 0.1,
        ...(options.systemPrompt && { system: options.systemPrompt }),
      });

      let isFirst = true;
      let _totalText = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          _totalText += text;

          const streamChunk: StreamChunk = {
            isFirst,
            isLast: false,
            text,
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
      case 'end_turn':
      case 'stop_sequence':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      default:
        return undefined;
    }
  }
}

export function createDirectAnthropicProvider(
  config?: Partial<DirectAnthropicConfig>,
): DirectAnthropicProvider | null {
  const apiKey = config?.apiKey ?? process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn('[DirectAnthropicProvider] No API key found');
    return null;
  }

  const finalConfig: DirectAnthropicConfig = {
    apiKey,
    maxTokens:
      config?.maxTokens ??
      (process.env.ANTHROPIC_MAX_TOKENS ? parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10) : 1000),
    model: config?.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022',
    temperature:
      config?.temperature ??
      (process.env.ANTHROPIC_TEMPERATURE ? parseFloat(process.env.ANTHROPIC_TEMPERATURE) : 0.1),
    ...(config?.baseUrl && { baseUrl: config.baseUrl }),
    ...(process.env.ANTHROPIC_BASE_URL && { baseUrl: process.env.ANTHROPIC_BASE_URL }),
  };

  return new DirectAnthropicProvider(finalConfig);
}
