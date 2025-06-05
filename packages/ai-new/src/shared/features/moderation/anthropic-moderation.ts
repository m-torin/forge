import type {
  BatchContentAnalysisRequest,
  ContentModerationRequest,
  ContentModerationResult,
} from '../../types/moderation';

export interface AnthropicMessage {
  content: string;
  role: 'user' | 'assistant';
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

  async call(
    messages: AnthropicMessage[],
    systemPrompt?: string,
  ): Promise<{ status: number; body: any }> {
    const {
      apiKey,
      baseUrl = 'https://api.anthropic.com',
      maxTokens,
      model,
      temperature,
    } = this.config;

    const response = await fetch(`${baseUrl}/v1/messages`, {
      body: JSON.stringify({
        max_tokens: maxTokens || 1000,
        messages,
        model: model || 'claude-3-5-sonnet-20241022',
        temperature: temperature || 0.1,
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
      const responseText = response.body.content?.[0]?.text || response.body;
      const result = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
      return result;
    } catch {
      return {
        confidence: 0.5,
        categories: {
          adultContent: { confidence: 0, flagged: false },
          hateSpeech: { confidence: 0, flagged: false },
          spam: { confidence: 0, flagged: false },
          toxicity: { confidence: 0, flagged: false },
        },
        explanation: 'Failed to parse AI response',
        safe: true,
        violations: [],
      };
    }
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    reasoning: string;
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
      const responseText = response.body.content?.[0]?.text || response.body;
      return typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
    } catch {
      return { confidence: 0.5, reasoning: 'Failed to parse response', sentiment: 'neutral' };
    }
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
      const responseText = response.body.content?.[0]?.text || response.body;
      return typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
    } catch {
      return { confidence: 0.5, category: 'unknown', reasoning: 'Failed to parse response' };
    }
  }

  async extractEntities(
    text: string,
    customPrompt?: string,
  ): Promise<{ entities: { type: string; value: string; confidence: number }[] }> {
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
      const responseText = response.body.content?.[0]?.text || response.body;
      return typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
    } catch {
      return { entities: [] };
    }
  }

  async batchAnalyzeContent(
    request: BatchContentAnalysisRequest,
  ): Promise<{ id: string; result: any; error?: string }[]> {
    const { analysisType, contents, customPrompt } = request;
    const results: { id: string; result: any; error?: string }[] = [];

    const batchSize = 5;
    for (let i = 0; i < contents.length; i += batchSize) {
      const batch = contents.slice(i, i + batchSize);

      const batchPromises = batch.map(async (item) => {
        try {
          let result;

          switch (analysisType) {
            case 'moderation':
              result = await this.moderateContent({
                content: item.content,
                contentType: item.contentType,
                customPrompt,
                moderationRules: {
                  checkAdultContent: true,
                  checkHateSpeech: true,
                  checkSpam: true,
                  checkToxicity: true,
                },
              });
              break;

            case 'sentiment':
              result = await this.analyzeSentiment(item.content);
              break;

            case 'classification':
              result = await this.classifyContent(item.content, customPrompt);
              break;

            case 'extraction':
              result = await this.extractEntities(item.content, customPrompt);
              break;

            default:
              throw new Error(`Unknown analysis type: ${analysisType}`);
          }

          return { id: item.id, result };
        } catch (error) {
          return {
            id: item.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            result: null,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + batchSize < contents.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

export function createAnthropicModerationService(
  config?: AnthropicModerationConfig,
): AnthropicModerationService | null {
  const apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('[ANTHROPIC] No API key found in environment');
    return null;
  }

  const finalConfig: AnthropicModerationConfig = {
    apiKey,
    baseUrl: config?.baseUrl || process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
    maxTokens:
      config?.maxTokens ||
      (process.env.ANTHROPIC_MAX_TOKENS ? parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10) : 1000),
    model: config?.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    temperature:
      config?.temperature ||
      (process.env.ANTHROPIC_TEMPERATURE ? parseFloat(process.env.ANTHROPIC_TEMPERATURE) : 0.1),
  };

  return new AnthropicModerationService(finalConfig);
}
