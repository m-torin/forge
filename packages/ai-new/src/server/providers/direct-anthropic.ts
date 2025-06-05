import Anthropic from '@anthropic-ai/sdk';

import { BaseProvider } from '../../shared/providers/base-provider';

import type {
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
  readonly name = 'anthropic-direct';
  readonly type = 'direct' as const;
  readonly capabilities = new Set<Capability>([
    'complete',
    'stream',
    'moderate',
    'sentiment',
    'extraction',
    'classify',
  ]);

  private client: Anthropic;
  private config: DirectAnthropicConfig;

  constructor(config: DirectAnthropicConfig) {
    super();
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000, // 30 second default
    });
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    try {
      this.validateOptions(options);

      const response = await this.client.messages.create({
        max_tokens: options.maxTokens || this.config.maxTokens || 1000,
        messages: [{ content: options.prompt, role: 'user' }],
        model: options.model || this.config.model || 'claude-3-5-sonnet-20241022',
        temperature: options.temperature ?? this.config.temperature ?? 0.1,
        ...(options.systemPrompt && { system: options.systemPrompt }),
      });

      return {
        id: response.id,
        finishReason: this.mapFinishReason(response.stop_reason || undefined),
        model: response.model,
        text: response.content[0]?.type === 'text' ? response.content[0].text : '',
        usage: {
          completionTokens: response.usage.output_tokens,
          promptTokens: response.usage.input_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      throw this.formatError(error, 'completion');
    }
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    try {
      this.validateOptions(options);

      const stream = await this.client.messages.create({
        max_tokens: options.maxTokens || this.config.maxTokens || 1000,
        messages: [{ content: options.prompt, role: 'user' }],
        model: options.model || this.config.model || 'claude-3-5-sonnet-20241022',
        stream: true,
        temperature: options.temperature ?? this.config.temperature ?? 0.1,
        ...(options.systemPrompt && { system: options.systemPrompt }),
      });

      let isFirst = true;
      let totalText = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          totalText += text;

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
    } catch (error) {
      throw this.formatError(error, 'streaming');
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
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        temperature: 0.1,
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';

      try {
        const result = JSON.parse(responseText);
        return {
          confidence: result.confidence || 0.5,
          explanation: result.explanation || 'Content analysis completed',
          safe: result.safe || true,
          violations: result.violations || [],
        };
      } catch (parseError) {
        // Re-throw error instead of returning fake safe response
        throw this.formatError(
          new Error(
            `Failed to parse moderation response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          ),
          'moderation',
        );
      }
    } catch (error) {
      throw this.formatError(error, 'moderation');
    }
  }

  private mapFinishReason(
    reason?: string,
  ): 'stop' | 'length' | 'tool_calls' | 'content_filter' | undefined {
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
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        temperature: 0.1,
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        // Re-throw error instead of returning fake response
        throw this.formatError(
          new Error(
            `Failed to parse sentiment response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          ),
          'sentiment analysis',
        );
      }
    } catch (error) {
      throw this.formatError(error, 'sentiment analysis');
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
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        temperature: 0.1,
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        // Re-throw error instead of returning empty response
        throw this.formatError(
          new Error(
            `Failed to parse entity extraction response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          ),
          'entity extraction',
        );
      }
    } catch (error) {
      throw this.formatError(error, 'entity extraction');
    }
  }
}

export function createDirectAnthropicProvider(
  config?: Partial<DirectAnthropicConfig>,
): DirectAnthropicProvider | null {
  const apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('[DirectAnthropicProvider] No API key found');
    return null;
  }

  const finalConfig: DirectAnthropicConfig = {
    apiKey,
    baseUrl: config?.baseUrl || process.env.ANTHROPIC_BASE_URL,
    maxTokens:
      config?.maxTokens ??
      (process.env.ANTHROPIC_MAX_TOKENS ? parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10) : 1000),
    model: config?.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    temperature:
      config?.temperature ??
      (process.env.ANTHROPIC_TEMPERATURE ? parseFloat(process.env.ANTHROPIC_TEMPERATURE) : 0.1),
  };

  return new DirectAnthropicProvider(finalConfig);
}
