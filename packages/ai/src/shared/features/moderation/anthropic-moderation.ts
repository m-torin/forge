import { logWarn } from '@repo/observability';
import {
  BatchContentAnalysisRequest,
  ContentModerationRequest,
  ContentModerationResult,
} from '../../types/moderation';

export interface AnthropicMessage {
  content: string;
  role: 'assistant' | 'user';
}

export interface AnthropicModerationConfig {
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  model?: string;
  temperature?: number;
}

export class AnthropicModerationService {
  private config: AnthropicModerationConfig;

  constructor(config: AnthropicModerationConfig) {
    this.config = config;
  }

  async analyzeSentiment(text: string): Promise<{
    confidence: number;
    reasoning: string;
    sentiment: 'negative' | 'neutral' | 'positive';
  }> {
    const systemPrompt = `Analyze the sentiment of the provided text. Return a JSON object with:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": number (0-1),
  "reasoning": "brief explanation"
}`;

    const messages: AnthropicMessage[] = [
      { content: `Analyze the sentiment of this text: ${text}`, role: 'user' },
    ];

    const response = await this.call(messages, systemPrompt);

    try {
      const responseText = response.body.content?.[0]?.text ?? response.body;
      return typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
    } catch {
      return { confidence: 0.5, reasoning: 'Failed to parse response', sentiment: 'neutral' };
    }
  }

  async batchAnalyzeContent(
    request: BatchContentAnalysisRequest,
  ): Promise<{ error?: string; id: string; result: any }[]> {
    const { analysisType, contents, customPrompt } = request;
    const results: { error?: string; id: string; result: any }[] = [];

    const batchSize = 5;
    for (let i = 0; i < contents.length; i += batchSize) {
      const batch = contents.slice(i, i + batchSize);

      const batchPromises = batch.map(async (item: any) => {
        try {
          let result;

          switch (analysisType) {
            case 'classification':
              result = await this.classifyContent(item.content, customPrompt);
              break;

            case 'extraction':
              result = await this.extractEntities(item.content, customPrompt);
              break;

            case 'moderation':
              result = await this.moderateContent({
                content: item.content,
                contentType: item.contentType,
                moderationRules: {
                  checkAdultContent: true,
                  checkHateSpeech: true,
                  checkSpam: true,
                  checkToxicity: true,
                },
                ...(customPrompt && { customPrompt }),
              });
              break;

            case 'sentiment':
              result = await this.analyzeSentiment(item.content);
              break;

            default:
              throw new Error(`Unknown analysis type: ${analysisType}`);
          }

          return { id: item.id, result };
        } catch (error: any) {
          return {
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
            id: item.id,
            result: null,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + batchSize < contents.length) {
        await new Promise((resolve: any) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  async call(
    messages: AnthropicMessage[],
    systemPrompt?: string,
  ): Promise<{ body: any; status: number }> {
    const {
      apiKey,
      baseUrl = 'https://api.anthropic.com',
      maxTokens,
      model,
      temperature,
    } = this.config;

    const response = await fetch(`${baseUrl}/v1/messages`, {
      body: JSON.stringify({
        max_tokens: maxTokens ?? 1000,
        messages,
        model: model ?? 'claude-3-5-sonnet-20241022',
        temperature: temperature ?? 0.1,
        ...(systemPrompt && { system: systemPrompt }),
      }),
      headers: {
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      method: 'POST',
    });

    const body = await response.json();

    return {
      body,
      status: response.status,
    };
  }

  async classifyContent(
    text: string,
    categories?: string,
  ): Promise<{ category: string; confidence: number; reasoning: string }> {
    const systemPrompt =
      categories ||
      `Classify the content into one of these categories: news, entertainment, business, technology, sports, health, science, politics. Return JSON:
{
  "category": "category_name",
  "confidence": number (0-1),
  "reasoning": "brief explanation"
}`;

    const messages: AnthropicMessage[] = [
      { content: `Classify this content: ${text}`, role: 'user' },
    ];

    const response = await this.call(messages, systemPrompt);

    try {
      const responseText = response.body.content?.[0]?.text ?? response.body;
      return typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
    } catch {
      return { category: 'unknown', confidence: 0.5, reasoning: 'Failed to parse response' };
    }
  }

  async extractEntities(
    text: string,
    customPrompt?: string,
  ): Promise<{ entities: { confidence: number; type: string; value: string }[] }> {
    const systemPrompt =
      customPrompt ||
      `Extract entities from the text. Return JSON:
{
  "entities": [
    {"type": "person|organization|location|date|email|phone", "value": "entity_value", "confidence": number}
  ]
}`;

    const messages: AnthropicMessage[] = [
      { content: `Extract entities from: ${text}`, role: 'user' },
    ];

    const response = await this.call(messages, systemPrompt);

    try {
      const responseText = response.body.content?.[0]?.text ?? response.body;
      return typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
    } catch {
      return { entities: [] };
    }
  }

  async moderateContent(request: ContentModerationRequest): Promise<ContentModerationResult> {
    const { content, contentType, customPrompt, moderationRules } = request;

    const systemPrompt =
      customPrompt ||
      `You are a content moderation AI. Analyze the provided content and determine if it violates any policies.

Return your response as a JSON object with this exact structure:
{
  "safe": boolean,
  "violations": ["list", "of", "violations"],
  "confidence": number (0-1),
  "explanation": "brief explanation",
  "categories": {
    "toxicity": {"flagged": boolean, "confidence": number},
    "spam": {"flagged": boolean, "confidence": number},
    "adultContent": {"flagged": boolean, "confidence": number},
    "hateSpeech": {"flagged": boolean, "confidence": number}
  }
}

Rules to check:
- Toxicity: ${moderationRules.checkToxicity}
- Spam: ${moderationRules.checkSpam}
- Adult Content: ${moderationRules.checkAdultContent}
- Hate Speech: ${moderationRules.checkHateSpeech}`;

    const messages: AnthropicMessage[] = [
      {
        content:
          contentType === 'text'
            ? `Please moderate this text content: ${content}`
            : `Please moderate this image content at URL: ${content}`,
        role: 'user',
      },
    ];

    const response = await this.call(messages, systemPrompt);

    try {
      const responseText = response.body.content?.[0]?.text ?? response.body;
      const result = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
      return result;
    } catch {
      return {
        categories: {
          adultContent: { confidence: 0, flagged: false },
          hateSpeech: { confidence: 0, flagged: false },
          spam: { confidence: 0, flagged: false },
          toxicity: { confidence: 0, flagged: false },
        },
        confidence: 0.5,
        explanation: 'Failed to parse AI response',
        safe: true,
        violations: [],
      };
    }
  }
}

export function createAnthropicModerationService(
  config?: AnthropicModerationConfig,
): AnthropicModerationService | null {
  const apiKey = config?.apiKey ?? process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    logWarn('[ANTHROPIC] No API key found in environment');
    return null;
  }

  const finalConfig: AnthropicModerationConfig = {
    apiKey,
    baseUrl: config?.baseUrl ?? process.env.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com',
    maxTokens:
      config?.maxTokens ??
      (process.env.ANTHROPIC_MAX_TOKENS ? parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10) : 1000),
    model: config?.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022',
    temperature:
      config?.temperature ??
      (process.env.ANTHROPIC_TEMPERATURE ? parseFloat(process.env.ANTHROPIC_TEMPERATURE) : 0.1),
  };

  return new AnthropicModerationService(finalConfig);
}
