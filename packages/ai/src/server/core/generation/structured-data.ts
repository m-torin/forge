/**
 * AI SDK v5 Structured Data Generation
 * Enhanced object and array generation with schema validation
 */

import type { LanguageModel } from 'ai';
import { generateObject, streamObject } from 'ai';
import { z } from 'zod/v4';

export interface StructuredGenerationConfig {
  model: LanguageModel;
  maxRetries?: number;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Enhanced structured data generation with common schemas
 */
export class StructuredDataGenerator {
  private config: StructuredGenerationConfig;

  constructor(config: StructuredGenerationConfig) {
    this.config = config;
  }

  /**
   * Generate a single object with schema validation
   */
  async generateObject<T>({
    schema,
    prompt,
    system,
    mode = 'auto' as const,
  }: {
    schema: z.ZodSchema<T>;
    prompt: string;
    system?: string;
    mode?: 'auto' | 'tool' | 'json';
  }) {
    return generateObject({
      model: this.config.model as any,
      schema,
      prompt,
      system,
      mode,
      maxRetries: this.config.maxRetries ?? 2,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.maxOutputTokens,
    } as any);
  }

  /**
   * Stream object generation with real-time updates
   */
  async streamObject<T>({
    schema,
    prompt,
    system,
    mode = 'auto' as const,
  }: {
    schema: z.ZodSchema<T>;
    prompt: string;
    system?: string;
    mode?: 'auto' | 'tool' | 'json';
  }) {
    return streamObject({
      model: this.config.model as any,
      schema,
      prompt,
      system,
      mode,
      maxRetries: this.config.maxRetries ?? 2,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.maxOutputTokens,
    } as any);
  }

  /**
   * Generate an array of objects
   */
  async generateArray<T>({
    schema,
    prompt,
    system,
    count,
  }: {
    schema: z.ZodSchema<T>;
    prompt: string;
    system?: string;
    count?: number;
  }) {
    const contextualPrompt = count
      ? `${prompt}

Generate exactly ${count} items.`
      : prompt;

    return this.generateObject({
      schema,
      prompt: contextualPrompt,
      system,
      mode: 'auto',
    });
  }

  /**
   * Generate with repair capability for malformed JSON
   */
  async generateWithRepair<T>({
    schema,
    prompt,
    system,
    repairAttempts: _repairAttempts = 3,
  }: {
    schema: z.ZodSchema<T>;
    prompt: string;
    system?: string;
    repairAttempts?: number;
  }) {
    return generateObject({
      model: this.config.model as any,
      schema,
      prompt,
      system,
      maxRetries: this.config.maxRetries ?? 2,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.maxOutputTokens,
      experimental_repairText: async ({ text, error }: { text: string; error: any }) => {
        // Simple repair strategy: try to fix common JSON issues
        if (error.name === 'JSONParseError') {
          // Add missing closing braces/brackets
          let repaired = text;
          const openBraces = (text.match(/\{/g) || []).length;
          const closeBraces = (text.match(/\}/g) || []).length;
          const openBrackets = (text.match(/\[/g) || []).length;
          const closeBrackets = (text.match(/\]/g) || []).length;

          // Add missing closing braces
          for (let i = 0; i < openBraces - closeBraces; i++) {
            repaired += '}';
          }

          // Add missing closing brackets
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            repaired += ']';
          }

          return repaired;
        }
        return null; // Can't repair
      },
    } as any);
  }
}

/**
 * Common schemas for structured generation
 */
export const CommonSchemas = {
  // Content schemas
  article: z.object({
    title: z.string().describe('Article title'),
    summary: z.string().describe('Brief summary'),
    content: z.string().describe('Main content'),
    tags: z.array(z.string()).describe('Relevant tags'),
    estimatedReadTime: z.number().describe('Estimated read time in minutes'),
  }),

  recipe: z.object({
    name: z.string().describe('Recipe name'),
    description: z.string().describe('Brief description'),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
        unit: z.string().optional(),
      }),
    ),
    instructions: z.array(z.string()),
    prepTime: z.number().describe('Prep time in minutes'),
    cookTime: z.number().describe('Cook time in minutes'),
    servings: z.number().describe('Number of servings'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  }),

  product: z.object({
    name: z.string().describe('Product name'),
    description: z.string().describe('Product description'),
    price: z.number().describe('Price in dollars'),
    category: z.string().describe('Product category'),
    features: z.array(z.string()).describe('Key features'),
    specifications: z.record(z.string(), z.string()).describe('Technical specs'),
    availability: z.enum(['in-stock', 'out-of-stock', 'pre-order']),
  }),

  // Data analysis schemas
  summary: z.object({
    keyPoints: z.array(z.string()).describe('Main points'),
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number().min(0).max(1).describe('Confidence score'),
    topics: z.array(z.string()).describe('Identified topics'),
    actionItems: z.array(z.string()).optional().describe('Action items'),
  }),

  classification: z.object({
    category: z.string().describe('Primary category'),
    subcategory: z.string().optional().describe('Subcategory'),
    confidence: z.number().min(0).max(1),
    reasoningText: z.string().describe('Classification reasoning'),
    alternativeCategories: z
      .array(
        z.object({
          category: z.string(),
          confidence: z.number().min(0).max(1),
        }),
      )
      .optional(),
  }),

  // Structured data extraction
  contactInfo: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    company: z.string().optional(),
    title: z.string().optional(),
  }),

  event: z.object({
    title: z.string(),
    description: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
    category: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
  }),
} as const;

/**
 * Utility functions for structured generation
 */
export const StructuredUtils = {
  /**
   * Validate generated object against schema
   */
  validateObject<T>(
    data: unknown,
    schema: z.ZodSchema<T>,
  ): { success: true; data: T } | { success: false; error: string } {
    try {
      const validated = schema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  },

  /**
   * Create a schema that allows partial objects
   */
  partial<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
    return schema.partial();
  },

  /**
   * Create a schema with optional fields for streaming
   */
  streamable<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
    const streamableShape = {} as { [K in keyof T]: z.ZodOptional<T[K]> };

    for (const [key, value] of Object.entries(schema.shape)) {
      (streamableShape as any)[key] = (value as z.ZodTypeAny).optional();
    }

    return z.object(streamableShape);
  },

  /**
   * Merge multiple schemas for complex objects
   */
  merge<T extends z.ZodRawShape, U extends z.ZodRawShape>(
    schema1: z.ZodObject<T>,
    schema2: z.ZodObject<U>,
  ) {
    return schema1.merge(schema2);
  },
} as const;

/**
 * Factory function to create a structured data generator
 */
export function createStructuredGenerator(config: StructuredGenerationConfig) {
  return new StructuredDataGenerator(config);
}

/**
 * Quick generation functions for common use cases
 */
export const quickGenerate = {
  /**
   * Generate a summary of text content
   */
  async summary(text: string, model: LanguageModel) {
    const generator = new StructuredDataGenerator({ model });
    return generator.generateObject({
      schema: CommonSchemas.summary,
      prompt: `Analyze and summarize the following text:

${text}`,
      system: 'You are an expert at analyzing and summarizing content.',
    });
  },

  /**
   * Classify content into categories
   */
  async classify(text: string, categories: string[], model: LanguageModel) {
    const generator = new StructuredDataGenerator({ model });
    return generator.generateObject({
      schema: CommonSchemas.classification,
      prompt: `Classify the following text into one of these categories: ${categories.join(', ')}

Text: ${text}`,
      system: 'You are an expert content classifier.',
    });
  },

  /**
   * Extract structured data from unstructured text
   */
  async extract<T>(
    text: string,
    schema: z.ZodSchema<T>,
    description: string,
    model: LanguageModel,
  ) {
    const generator = new StructuredDataGenerator({ model });
    return generator.generateObject({
      schema,
      prompt: `Extract ${description} from the following text:

${text}`,
      system: `You are an expert at extracting structured information. Only include information that is explicitly mentioned in the text.`,
    });
  },
} as const;
