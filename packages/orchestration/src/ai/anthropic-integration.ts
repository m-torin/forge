import type { WorkflowContext } from '@upstash/workflow';

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
 * Call Anthropic API using the proper context.api.anthropic.call method
 */
export async function callAnthropicAPI(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
  messages: AnthropicMessage[],
  systemPrompt?: string,
): Promise<{ status: number; body: any }> {
  const { apiKey, maxTokens, model, temperature } = config;

  // Use the proper context.api.anthropic.call method
  return await context.api.anthropic.call(stepName, {
    body: {
      max_tokens: maxTokens || 1000,
      messages,
      model: model || 'claude-3-5-sonnet-20241022',
      temperature: temperature || 0.1,
      ...(systemPrompt && { system: systemPrompt }),
    },
    operation: 'messages.create',
    token: apiKey,
  });
}

/**
 * Fallback to context.call for when context.api.anthropic is not available
 */
export async function callAnthropicAPIFallback(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
  messages: AnthropicMessage[],
  systemPrompt?: string,
): Promise<any> {
  const { apiKey, baseUrl, maxTokens, model, temperature } = config;

  return context.call(stepName, {
    url: `${baseUrl}/v1/messages`,
    body: {
      max_tokens: maxTokens || 1000,
      messages,
      model: model || 'claude-3-5-sonnet-20241022',
      temperature: temperature || 0.1,
      ...(systemPrompt && { system: systemPrompt }),
    },
    headers: {
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    method: 'POST',
    retries: 3,
    timeout: 60000, // 60 second timeout for AI calls
  });
}

/**
 * Content moderation using Anthropic
 */
export async function moderateContent(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
  request: ContentModerationRequest,
): Promise<ContentModerationResult> {
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

  const response = await callAnthropicWithFallback(
    context,
    stepName,
    config,
    messages,
    systemPrompt,
  );

  try {
    // Handle both context.api.anthropic and context.call response formats
    const responseText = response.body.content?.[0]?.text || response.body;
    const result = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
    return result;
  } catch (error) {
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
 * Batch content analysis using Anthropic
 */
export async function batchAnalyzeContent(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
  request: BatchContentAnalysisRequest,
): Promise<{ id: string; result: any; error?: string }[]> {
  const { analysisType, contents, customPrompt } = request;

  return context.run(stepName, async () => {
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
              result = await moderateContent(context, `moderate-${item.id}`, config, {
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
              result = await analyzeSentiment(
                context,
                `sentiment-${item.id}`,
                config,
                item.content,
              );
              break;

            case 'classification':
              result = await classifyContent(
                context,
                `classify-${item.id}`,
                config,
                item.content,
                customPrompt,
              );
              break;

            case 'extraction':
              result = await extractEntities(
                context,
                `extract-${item.id}`,
                config,
                item.content,
                customPrompt,
              );
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
  });
}

/**
 * Sentiment analysis using Anthropic
 */
export async function analyzeSentiment(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
  text: string,
): Promise<{
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

  const response = await callAnthropicWithFallback(
    context,
    stepName,
    config,
    messages,
    systemPrompt,
  );

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
export async function classifyContent(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
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

  const response = await callAnthropicWithFallback(
    context,
    stepName,
    config,
    messages,
    systemPrompt,
  );

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
export async function extractEntities(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
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

  const response = await callAnthropicWithFallback(
    context,
    stepName,
    config,
    messages,
    systemPrompt,
  );

  try {
    const responseText = response.body.content?.[0]?.text || response.body;
    return typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
  } catch {
    return { entities: [] };
  }
}

/**
 * Enhanced wrapper for context.api.anthropic with automatic fallback
 */
export async function callAnthropicWithFallback(
  context: WorkflowContext<any>,
  stepName: string,
  config: AnthropicConfig,
  messages: AnthropicMessage[],
  systemPrompt?: string,
): Promise<{ status: number; body: any }> {
  // Try the proper context.api.anthropic.call method first
  try {
    if (context.api && (context.api as any).anthropic) {
      return await callAnthropicAPI(context, stepName, config, messages, systemPrompt);
    }
  } catch (error) {
    console.warn('[ANTHROPIC] context.api.anthropic not available, falling back to context.call');
  }

  // Fallback to direct API call via context.call
  const result = await callAnthropicAPIFallback(context, stepName, config, messages, systemPrompt);

  // Normalize the response to match context.api format
  return {
    body: result.body || result,
    status: result.status || 200,
  };
}

/**
 * Type-safe Anthropic API call with proper types
 */
export async function callAnthropicTyped<TResponse = any, TRequest = any>(
  context: WorkflowContext<any>,
  stepName: string,
  config: {
    token: string;
    operation: 'messages.create';
    body: TRequest;
  },
): Promise<{ status: number; body: TResponse }> {
  return await context.api.anthropic.call<TResponse, TRequest>(stepName, config);
}
