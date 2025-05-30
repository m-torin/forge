// Anthropic AI provider integration

/**
 * Anthropic API configuration
 */
export interface AnthropicConfig {
  /** Anthropic API key */
  apiKey: string;
  /** API base URL (for testing or different endpoints) */
  baseUrl?: string;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Model to use (default: claude-3-sonnet-20240229) */
  model?: string;
  /** Temperature for response randomness */
  temperature?: number;
}

/**
 * Message for Anthropic API
 */
export interface AnthropicMessage {
  content: string;
  role: 'user' | 'assistant';
}

/**
 * Content moderation request
 */
export interface ContentModerationRequest {
  content: string;
  contentType: 'text' | 'image_url';
  customPrompt?: string;
  moderationRules: {
    checkToxicity: boolean;
    checkSpam: boolean;
    checkAdultContent: boolean;
    checkHateSpeech: boolean;
    customRules?: string[];
  };
}

/**
 * Content moderation result
 */
export interface ContentModerationResult {
  categories: {
    toxicity: { flagged: boolean; confidence: number };
    spam: { flagged: boolean; confidence: number };
    adultContent: { flagged: boolean; confidence: number };
    hateSpeech: { flagged: boolean; confidence: number };
    custom?: { rule: string; flagged: boolean; confidence: number }[];
  };
  confidence: number;
  explanation: string;
  safe: boolean;
  violations: string[];
}

/**
 * Batch content analysis request
 */
export interface BatchContentAnalysisRequest {
  analysisType: 'moderation' | 'sentiment' | 'classification' | 'extraction';
  contents: {
    id: string;
    content: string;
    contentType: 'text' | 'image_url';
    metadata?: any;
  }[];
  customPrompt?: string;
  rules?: any;
}

/**
 * Create Anthropic configuration from environment
 */
export function createAnthropicConfigFromEnv(): AnthropicConfig | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('[ANTHROPIC] No API key found in environment');
    return null;
  }

  return {
    apiKey,
    baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
    maxTokens: process.env.ANTHROPIC_MAX_TOKENS
      ? parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10)
      : 1000,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    temperature: process.env.ANTHROPIC_TEMPERATURE
      ? parseFloat(process.env.ANTHROPIC_TEMPERATURE)
      : 0.1,
  };
}

/**
 * Anthropic API client
 */
export class AnthropicClient {
  private config: AnthropicConfig;

  constructor(config: AnthropicConfig) {
    this.config = config;
  }

  /**
   * Call Anthropic API directly
   */
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

  /**
   * Content moderation using Anthropic
   */
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
      // Fallback if AI doesn't return valid JSON
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

  /**
   * Sentiment analysis using Anthropic
   */
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

  /**
   * Content classification using Anthropic
   */
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

  /**
   * Entity extraction using Anthropic
   */
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

  /**
   * Batch content analysis
   */
  async batchAnalyzeContent(
    request: BatchContentAnalysisRequest,
  ): Promise<{ id: string; result: any; error?: string }[]> {
    const { analysisType, contents, customPrompt } = request;
    const results: { id: string; result: any; error?: string }[] = [];

    // Process in batches to avoid overwhelming the API
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

      // Small delay between batches to respect rate limits
      if (i + batchSize < contents.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

/**
 * Create an Anthropic client instance
 */
export function createAnthropicClient(config?: AnthropicConfig): AnthropicClient | null {
  const finalConfig = config || createAnthropicConfigFromEnv();

  if (!finalConfig) {
    return null;
  }

  return new AnthropicClient(finalConfig);
}
