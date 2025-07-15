/**
 * AI SDK v5 Experimental Output Features
 * Advanced output processing and transformation capabilities
 */

import type { LanguageModelV2 } from '@ai-sdk/provider';
import { logWarn } from '@repo/observability';
import type { EmbeddingModel } from 'ai';
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod/v4';

export interface OutputTransformConfig {
  enableJsonRepair?: boolean;
  enableSchemaValidation?: boolean;
  enableContentFiltering?: boolean;
  enableSentimentAnalysis?: boolean;
  enableEntityExtraction?: boolean;
  enableSummaryGeneration?: boolean;
  customTransforms?: Array<(output: any) => Promise<any> | any>;
}

export interface OutputResult<T = any> {
  original: T;
  transformed: T;
  metadata: {
    transformsApplied: string[];
    processingTime: number;
    confidence?: number;
    sentiment?: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
    };
    entities?: Array<{
      text: string;
      type: string;
      confidence: number;
    }>;
    summary?: string;
    validationErrors?: string[];
  };
}

export interface StreamingOutputProcessor {
  onChunk?: (chunk: any, accumulated: string) => Promise<void> | void;
  onComplete?: (finalOutput: string) => Promise<any> | any;
  enableRealTimeProcessing?: boolean;
  chunkTransforms?: Array<(chunk: any) => any>;
}

/**
 * Advanced output processing manager
 */
export class OutputProcessor {
  private model: LanguageModelV2;
  private embeddingModel?: EmbeddingModel<string>;
  private config: OutputTransformConfig;

  constructor(
    model: LanguageModelV2,
    config: OutputTransformConfig = {},
    embeddingModel?: EmbeddingModel<string>,
  ) {
    this.model = model;
    this.embeddingModel = embeddingModel;
    this.config = {
      enableJsonRepair: true,
      enableSchemaValidation: true,
      enableContentFiltering: false,
      enableSentimentAnalysis: false,
      enableEntityExtraction: false,
      enableSummaryGeneration: false,
      customTransforms: [],
      ...config,
    };
  }

  /**
   * Text generation with output processing
   */
  async generateText(
    prompt: string,
    options?: Parameters<typeof generateText>[0] & {
      outputTransforms?: OutputTransformConfig;
    },
  ): Promise<OutputResult<string>> {
    const startTime = Date.now();
    const transformsApplied: string[] = [];

    // Generate initial text
    const result = await generateText({
      model: this.model,
      prompt,
      ...options,
    });

    let transformed = result.text;
    const metadata: OutputResult['metadata'] = {
      transformsApplied,
      processingTime: 0,
    };

    // Apply content filtering
    if (this.config.enableContentFiltering) {
      transformed = await this.filterContent(transformed);
      transformsApplied.push('content-filtering');
    }

    // Apply sentiment analysis
    if (this.config.enableSentimentAnalysis) {
      metadata.sentiment = await this.analyzeSentiment(transformed);
      transformsApplied.push('sentiment-analysis');
    }

    // Apply entity extraction
    if (this.config.enableEntityExtraction) {
      metadata.entities = await this.extractEntities(transformed);
      transformsApplied.push('entity-extraction');
    }

    // Apply summary generation
    if (this.config.enableSummaryGeneration && transformed.length > 500) {
      metadata.summary = await this.generateSummary(transformed);
      transformsApplied.push('summary-generation');
    }

    // Apply custom transforms
    for (const transform of this.config.customTransforms || []) {
      transformed = await transform(transformed);
      transformsApplied.push('custom-transform');
    }

    metadata.processingTime = Date.now() - startTime;

    return {
      original: result.text,
      transformed,
      metadata,
    };
  }

  /**
   * Object generation with validation and repair
   */
  async generateObject<T>(
    schema: z.ZodSchema<T>,
    prompt: string,
    options?: Parameters<typeof generateObject>[0] & {
      repairAttempts?: number;
      validationMode?: 'strict' | 'loose' | 'repair';
    },
  ): Promise<OutputResult<T>> {
    const startTime = Date.now();
    const transformsApplied: string[] = [];
    const validationErrors: string[] = [];

    let result: any;
    let validationMode = options?.validationMode || 'repair';
    let repairAttempts = options?.repairAttempts || 3;

    try {
      // Extract valid generateObject options (excluding our custom options)
      const {
        repairAttempts: _repairAttempts,
        validationMode: _validationMode,
        ...generateObjectOptions
      } = options || {};

      // Initial generation
      result = await generateObject({
        model: this.model,
        schema,
        prompt,
        ...generateObjectOptions,
      });

      transformsApplied.push('object-generation');
    } catch (error) {
      if (validationMode === 'strict') {
        throw error;
      }

      validationErrors.push(
        `Initial generation failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Attempt JSON repair
      if (this.config.enableJsonRepair && repairAttempts > 0) {
        result = await this.repairAndRetry(schema, prompt, options, repairAttempts);
        transformsApplied.push('json-repair');
      } else {
        throw error;
      }
    }

    // Additional validation if enabled
    if (this.config.enableSchemaValidation) {
      try {
        result.object = schema.parse(result.object);
        transformsApplied.push('schema-validation');
      } catch (validationError) {
        validationErrors.push(
          `Schema validation failed: ${validationError instanceof Error ? validationError.message : String(validationError)}`,
        );

        if (validationMode === 'strict') {
          throw validationError;
        }
      }
    }

    // Apply custom transforms to the object
    let transformed = result.object;
    for (const transform of this.config.customTransforms || []) {
      transformed = await transform(transformed);
      transformsApplied.push('custom-transform');
    }

    const metadata: OutputResult['metadata'] = {
      transformsApplied,
      processingTime: Date.now() - startTime,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
    };

    return {
      original: result.object,
      transformed,
      metadata,
    };
  }

  /**
   * Streaming with real-time processing
   */
  async streamText(
    prompt: string,
    processor: StreamingOutputProcessor,
    options?: Parameters<typeof streamText>[0],
  ): Promise<AsyncIterable<string>> {
    const result = await streamText({
      model: this.model,
      prompt,
      ...options,
    });

    let accumulated = '';

    return {
      async *[Symbol.asyncIterator]() {
        for await (const chunk of result.textStream) {
          accumulated += chunk;

          // Apply chunk-level transforms
          let processedChunk = chunk;
          if (processor.chunkTransforms) {
            for (const transform of processor.chunkTransforms) {
              processedChunk = transform(processedChunk);
            }
          }

          // Execute chunk callback
          if (processor.onChunk) {
            await processor.onChunk(processedChunk, accumulated);
          }

          yield processedChunk;
        }

        // Process final output
        if (processor.onComplete) {
          const finalResult = await processor.onComplete(accumulated);
          if (finalResult !== undefined) {
            yield finalResult;
          }
        }
      },
    };
  }

  /**
   * Repair and retry object generation
   */
  private async repairAndRetry<T>(
    schema: z.ZodSchema<T>,
    prompt: string,
    options: any,
    attempts: number,
  ): Promise<any> {
    let repairPrompt = `
The previous attempt to generate a JSON object failed. Please generate a valid JSON object that conforms to this schema:

${JSON.stringify(schema._def, null, 2)}

Original prompt: ${prompt}

Requirements:
- Return only valid JSON
- Ensure all required fields are present
- Use appropriate data types
- Follow the schema structure exactly
    `.trim();

    for (let i = 0; i < attempts; i++) {
      try {
        return await generateObject({
          model: this.model,
          schema,
          prompt: repairPrompt,
          ...options,
        });
      } catch (error) {
        if (i === attempts - 1) {
          throw error;
        }

        // Add more specific guidance for next attempt
        repairPrompt += `

Previous error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    throw new Error('Failed to repair object after maximum attempts');
  }

  /**
   * Filter potentially harmful content
   */
  private async filterContent(text: string): Promise<string> {
    // Simple content filtering - in production, use a proper content moderation service
    const harmfulPatterns = [
      /\b(hate|violence|harmful)\b/gi,
      // Add more patterns as needed
    ];

    let filtered = text;
    for (const pattern of harmfulPatterns) {
      filtered = filtered.replace(pattern, '[FILTERED]');
    }

    return filtered;
  }

  /**
   * Analyze sentiment of text
   */
  private async analyzeSentiment(text: string): Promise<{
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  }> {
    try {
      // Simple sentiment analysis using the language model
      const result = await generateObject({
        model: this.model,
        schema: z.object({
          score: z
            .number()
            .min(-1)
            .max(1)
            .describe('Sentiment score from -1 (negative) to 1 (positive)'),
          label: z.enum(['positive', 'negative', 'neutral']).describe('Sentiment label'),
          reasoning: z.string().describe('Brief explanation of the sentiment'),
        }),
        prompt: `Analyze the sentiment of this text and provide a score from -1 (very negative) to 1 (very positive):

"${text}"

Consider the overall tone, emotional content, and context.`,
      });

      return {
        score: result.object.score,
        label: result.object.label,
      };
    } catch (error) {
      logWarn('Sentiment analysis failed:', error);
      return { score: 0, label: 'neutral' };
    }
  }

  /**
   * Extract named entities from text
   */
  private async extractEntities(text: string): Promise<
    Array<{
      text: string;
      type: string;
      confidence: number;
    }>
  > {
    try {
      const result = await generateObject({
        model: this.model,
        schema: z.object({
          entities: z.array(
            z.object({
              text: z.string().describe('The entity text'),
              type: z.string().describe('Entity type (PERSON, ORGANIZATION, LOCATION, DATE, etc.)'),
              confidence: z.number().min(0).max(1).describe('Confidence score'),
            }),
          ),
        }),
        prompt: `Extract named entities from this text. Identify people, organizations, locations, dates, and other important entities:

"${text}"

Provide confidence scores for each entity based on how certain you are about the classification.`,
      });

      return result.object.entities;
    } catch (error) {
      logWarn('Entity extraction failed:', error);
      return [];
    }
  }

  /**
   * Generate summary of long text
   */
  private async generateSummary(text: string): Promise<string> {
    try {
      const result = await generateText({
        model: this.model,
        prompt: `Provide a concise summary of the following text in 2-3 sentences:

"${text}"

Focus on the main points and key information.`,
        maxOutputTokens: 150,
      });

      return result.text.trim();
    } catch (error) {
      logWarn('Summary generation failed:', error);
      return 'Summary generation failed';
    }
  }
}

/**
 * Factory functions for common use cases
 */
export const outputProcessors = {
  /**
   * Content creation processor with filtering and analysis
   */
  contentCreation: (model: LanguageModelV2) =>
    new OutputProcessor(model, {
      enableContentFiltering: true,
      enableSentimentAnalysis: true,
      enableSummaryGeneration: true,
    }),

  /**
   * Data processing with strict validation
   */
  dataProcessing: (model: LanguageModelV2) =>
    new OutputProcessor(model, {
      enableJsonRepair: true,
      enableSchemaValidation: true,
    }),

  /**
   * Research and analysis with entity extraction
   */
  research: (model: LanguageModelV2, embeddingModel?: EmbeddingModel<string>) =>
    new OutputProcessor(
      model,
      {
        enableEntityExtraction: true,
        enableSummaryGeneration: true,
        enableSentimentAnalysis: true,
      },
      embeddingModel,
    ),

  /**
   * Production-ready processor with minimal overhead
   */
  production: (model: LanguageModelV2) =>
    new OutputProcessor(model, {
      enableJsonRepair: true,
      enableSchemaValidation: true,
      enableContentFiltering: true,
    }),
} as const;

/**
 * High-level convenience functions
 */
export const generation = {
  /**
   * Generate text with automatic enhancement
   */
  async text(
    model: LanguageModelV2,
    prompt: string,
    options?: {
      enableAnalysis?: boolean;
      enableFiltering?: boolean;
      customTransforms?: Array<(text: string) => string>;
    },
  ): Promise<OutputResult<string>> {
    const processor = new OutputProcessor(model, {
      enableContentFiltering: options?.enableFiltering ?? true,
      enableSentimentAnalysis: options?.enableAnalysis ?? true,
      customTransforms: options?.customTransforms,
    });

    return processor.generateText(prompt);
  },

  /**
   * Generate object with automatic repair
   */
  async object<T>(
    model: LanguageModelV2,
    schema: z.ZodSchema<T>,
    prompt: string,
    options?: {
      repairAttempts?: number;
      validationMode?: 'strict' | 'loose' | 'repair';
    },
  ): Promise<OutputResult<T>> {
    const processor = new OutputProcessor(model, {
      enableJsonRepair: true,
      enableSchemaValidation: true,
    });

    const {
      repairAttempts: _repairAttempts,
      validationMode: _validationMode,
      ...validOptions
    } = options || {};
    return processor.generateObject(
      schema,
      prompt,
      Object.keys(validOptions).length > 0 ? (validOptions as any) : undefined,
    );
  },

  /**
   * Stream with real-time processing
   */
  async stream(
    model: LanguageModelV2,
    prompt: string,
    onChunk?: (chunk: string, accumulated: string) => void,
  ): Promise<AsyncIterable<string>> {
    const processor = new OutputProcessor(model);

    return processor.streamText(prompt, {
      onChunk: onChunk ? async (chunk, acc) => onChunk(chunk, acc) : undefined,
      enableRealTimeProcessing: true,
    });
  },
} as const;

/**
 * Utility schemas for common output types
 */
export const outputSchemas = {
  analysis: z.object({
    summary: z.string().describe('Brief summary'),
    keyPoints: z.array(z.string()).describe('Main points'),
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number().min(0).max(1),
  }),

  classification: z.object({
    category: z.string().describe('Primary category'),
    subcategory: z.string().optional().describe('Subcategory if applicable'),
    confidence: z.number().min(0).max(1),
    reasoning: z.string().describe('Explanation of classification'),
  }),

  extraction: z.object({
    entities: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        confidence: z.number().min(0).max(1),
      }),
    ),
    relationships: z
      .array(
        z.object({
          subject: z.string(),
          predicate: z.string(),
          object: z.string(),
        }),
      )
      .optional(),
  }),

  decision: z.object({
    decision: z.boolean().describe('True/false decision'),
    confidence: z.number().min(0).max(1),
    reasoning: z.string().describe('Explanation of decision'),
    factors: z.array(z.string()).describe('Key decision factors'),
  }),
} as const;
