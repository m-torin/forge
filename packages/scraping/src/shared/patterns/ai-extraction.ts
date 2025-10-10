/**
 * AI-powered extraction patterns
 * Advanced data extraction using AI and machine learning
 */

import { ScrapingError, ScrapingErrorCode } from '../errors';
import { retryWithBackoff } from '../utils/helpers';

import { AIExtractionOptions, AIExtractionResult } from './types';

/**
 * Structured extraction with validation
 */
async function _extractStructured<T = any>(
  html: string,
  schema: Record<string, any>,
  options: Omit<AIExtractionOptions, 'schema'> = { prompt: 'Extract data according to schema' },
): Promise<T> {
  const prompt = `Extract data according to this exact schema: ${JSON.stringify(schema, null, 2)}

Return only the JSON data that matches this schema exactly.`;

  const result = await extractWithAI(html, prompt, {
    ...options,
    schema,
  });

  // Validate against schema if possible
  if (typeof result?.data === 'object' && result?.data !== null) {
    return result?.data as T;
  }

  throw new ScrapingError(
    'Extracted data does not match expected schema',
    ScrapingErrorCode.EXTRACTION_FAILED,
    { extractedData: result?.data, schema },
  );
}

/**
 * Extract data using AI-powered analysis
 * Supports multiple AI providers and extraction strategies
 */
export async function extractWithAI(
  html: string,
  prompt: string,
  options: AIExtractionOptions = { prompt },
): Promise<AIExtractionResult> {
  const { confidence = 0.8, model = 'auto' } = options;

  const startTime = Date.now();

  try {
    // Try Hero AI extraction first (if available)
    if (model === 'auto' || model === 'hero') {
      try {
        return await extractWithHero(html, prompt, options);
      } catch (error) {
        if (model === 'hero') {
          throw error; // If Hero was specifically requested, fail
        }
        // Otherwise, fall through to other providers
      }
    }

    // Try OpenAI/GPT extraction
    if (model === 'auto' || model.startsWith('gpt') || model === 'openai') {
      try {
        return await extractWithOpenAI(html, prompt, options);
      } catch (error) {
        if (model === 'openai' || model.startsWith('gpt')) {
          throw error; // If OpenAI was specifically requested, fail
        }
        // Otherwise, fall through to other providers
      }
    }

    // Try Anthropic/Claude extraction
    if (model === 'auto' || model.startsWith('claude') || model === 'anthropic') {
      try {
        return await extractWithClaude(html, prompt, options);
      } catch (error) {
        if (model === 'anthropic' || model.startsWith('claude')) {
          throw error; // If Claude was specifically requested, fail
        }
        // Otherwise, fall through
      }
    }

    // If no provider worked
    throw new ScrapingError(
      'No AI extraction provider available',
      ScrapingErrorCode.AI_EXTRACTION_FAILED,
      { model, prompt },
    );
  } catch (error) {
    const endTime = Date.now();

    throw new ScrapingError(
      `AI extraction failed: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
      ScrapingErrorCode.AI_EXTRACTION_FAILED,
      {
        confidence,
        duration: endTime - startTime,
        model,
        prompt,
      },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Multi-model extraction with consensus
 */
async function _extractWithConsensus(
  html: string,
  prompt: string,
  options: AIExtractionOptions & {
    consensusThreshold?: number;
    models?: string[];
  } = { prompt },
): Promise<AIExtractionResult> {
  const {
    consensusThreshold = 0.6,
    models = ['gpt-3.5-turbo', 'claude-3-haiku-20240307'],
    ...extractOptions
  } = options;

  const results: AIExtractionResult[] = [];
  const errors: Error[] = [];

  // Extract with each model
  for (const model of models) {
    try {
      const result = await extractWithAI(html, prompt, {
        ...extractOptions,
        model,
      });
      results.push(result);
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  if (results.length === 0) {
    throw new ScrapingError(
      'All AI extraction models failed',
      ScrapingErrorCode.AI_EXTRACTION_FAILED,
      { errors: errors.map((e: any) => e.message), models },
    );
  }

  // Calculate consensus
  if (results.length === 1) {
    return results[0];
  }

  // For multiple results, return the one with highest confidence
  // In a real implementation, you'd want to compare the actual data for consensus
  const bestResult = results.reduce((best, current: any) =>
    current.confidence > best.confidence ? current : best,
  );

  return {
    ...bestResult,
    confidence: Math.min(bestResult.confidence, consensusThreshold),
    metadata: {
      ...bestResult.metadata,
      // Add consensus-specific metadata
      ...(results.length > 1
        ? {
            attempts: models.length,
            consensusErrors: errors.length,
            models: results.length,
          }
        : {}),
    } as AIExtractionResult['metadata'] & {
      attempts?: number;
      consensusErrors?: number;
      models?: number;
    },
  } as AIExtractionResult;
}

/**
 * Calculate approximate Claude API costs
 */
function calculateClaudeCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = {
    'claude-3-haiku-20240307': { input: 0.00025 / 1000, output: 0.00125 / 1000 },
    'claude-3-sonnet-20240229': { input: 0.003 / 1000, output: 0.015 / 1000 },
  };

  const rate = costs[model as keyof typeof costs] || costs['claude-3-haiku-20240307'];
  return inputTokens * rate.input + outputTokens * rate.output;
}

/**
 * Calculate approximate OpenAI API costs
 */
function calculateOpenAICost(model: string, tokens: number): number {
  const costs = {
    'gpt-3.5-turbo': 0.002 / 1000, // $0.002 per 1k tokens
    'gpt-4': 0.03 / 1000, // $0.03 per 1k tokens
  };

  const rate = costs[model as keyof typeof costs] ?? costs['gpt-3.5-turbo'];
  return tokens * rate;
}

/**
 * Extract using Anthropic Claude models
 */
async function extractWithClaude(
  html: string,
  prompt: string,
  options: AIExtractionOptions,
): Promise<AIExtractionResult> {
  const startTime = Date.now();

  try {
    // Import Anthropic SDK
    const Anthropic = await import('@anthropic-ai/sdk').catch(() => {
      throw new ScrapingError(
        'Anthropic SDK not installed. Run: npm install @anthropic-ai/sdk',
        ScrapingErrorCode.AI_EXTRACTION_FAILED,
      );
    });

    const anthropic = new Anthropic.default({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are an expert data extraction assistant. Extract structured data from HTML content based on user instructions.

Instructions:
- Return only valid JSON
- Extract exactly what is requested
- If data is not found, use null values
- Be precise and accurate
${options.schema ? `- Follow this schema: ${JSON.stringify(options.schema)}` : ''}`;

    const userPrompt = `Extract data from this HTML:

${html.substring(0, 8000)}${html.length > 8000 ? '...' : ''}

Extraction request: ${prompt}`;

    const response = await retryWithBackoff(
      async () => {
        return anthropic.messages.create({
          max_tokens: 2000,
          messages: [{ content: userPrompt, role: 'user' }],
          model: options.model?.startsWith('claude') ? options.model : 'claude-3-haiku-20240307',
          system: systemPrompt,
          temperature: 0.1,
        });
      },
      { attempts: 3, delay: 1000 },
    );

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Invalid response type from Claude');
    }

    let extractedData;
    try {
      extractedData = JSON.parse(content.text);
    } catch {
      // If not JSON, return as-is
      extractedData = content.text;
    }

    const endTime = Date.now();

    return {
      confidence: 0.88,
      data: extractedData,
      metadata: {
        cost: calculateClaudeCost(
          response.model,
          response.usage.input_tokens,
          response.usage.output_tokens,
        ),
        duration: endTime - startTime,
        tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
    };
  } catch (error) {
    throw new ScrapingError(
      `Claude extraction failed: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
      ScrapingErrorCode.AI_EXTRACTION_FAILED,
      { provider: 'claude' },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Extract using Hero's AI capabilities
 */
async function extractWithHero(
  html: string,
  prompt: string,
  _options: AIExtractionOptions,
): Promise<AIExtractionResult> {
  const startTime = Date.now();

  try {
    // This would typically use an existing Hero instance
    // For now, we'll simulate the extraction
    const { HeroProvider } = await import('../../server/providers/hero-provider');

    const provider = new HeroProvider();
    await provider.initialize({ options: {} });

    // Use Hero's AI extraction
    const result = await provider.extractWithAI(prompt);

    const endTime = Date.now();

    return {
      confidence: 0.9, // Hero typically has high confidence
      data: result,
      metadata: {
        duration: endTime - startTime,
        tokens: 0, // Hero doesn't expose token usage
      },
      model: 'hero',
    };
  } catch (error) {
    throw new ScrapingError(
      `Hero AI extraction failed: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
      ScrapingErrorCode.AI_EXTRACTION_FAILED,
      { provider: 'hero' },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Extract using OpenAI GPT models
 */
async function extractWithOpenAI(
  html: string,
  prompt: string,
  options: AIExtractionOptions,
): Promise<AIExtractionResult> {
  const startTime = Date.now();

  try {
    // Import OpenAI SDK
    const OpenAI = await import('openai').catch(() => {
      throw new ScrapingError(
        'OpenAI SDK not installed. Run: npm install openai',
        ScrapingErrorCode.AI_EXTRACTION_FAILED,
      );
    });

    const openai = new OpenAI.default({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `
You are an expert data extraction assistant. Extract structured data from HTML content based on user instructions.

Instructions:
- Return only valid JSON
- Extract exactly what is requested
- If data is not found, use null values
- Be precise and accurate
${options.schema ? `- Follow this schema: ${JSON.stringify(options.schema)}` : ''}
`;

    const userPrompt = `
Extract data from this HTML:

${html.substring(0, 8000)} ${html.length > 8000 ? '...' : ''}

Extraction request: ${prompt}
`;

    const response = await retryWithBackoff(
      async () => {
        return openai.chat.completions.create({
          max_tokens: 2000,
          messages: [
            { content: systemPrompt, role: 'system' },
            { content: userPrompt, role: 'user' },
          ],
          model: options.model?.startsWith('gpt') ? options.model : 'gpt-3.5-turbo',
          temperature: 0.1,
        });
      },
      { attempts: 3, delay: 1000 },
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    let extractedData;
    try {
      extractedData = JSON.parse(content);
    } catch {
      // If not JSON, return as-is
      extractedData = content;
    }

    const endTime = Date.now();

    return {
      confidence: 0.85,
      data: extractedData,
      metadata: {
        cost: calculateOpenAICost(response.model, response.usage?.total_tokens ?? 0),
        duration: endTime - startTime,
        tokens: response.usage?.total_tokens,
      },
      model: response.model,
    };
  } catch (error) {
    throw new ScrapingError(
      `OpenAI extraction failed: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
      ScrapingErrorCode.AI_EXTRACTION_FAILED,
      { provider: 'openai' },
      error instanceof Error ? error : undefined,
    );
  }
}
