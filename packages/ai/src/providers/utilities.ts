/**
 * Provider utilities and helper functions
 */

import type { LanguageModel } from 'ai';
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod/v3';
import { getDefaultModel } from './registry';

// Analysis functions
export async function analyzeSentiment(text: string, model?: LanguageModel) {
  const result = await generateObject({
    model: model || getDefaultModel(),
    prompt: `Analyze the sentiment of this text: ${text}`,
    schema: z.object({
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      confidence: z.number(),
    }),
  });
  return result.object;
}

export async function extractEntities(text: string, model?: LanguageModel) {
  const result = await generateObject({
    model: model || getDefaultModel(),
    prompt: `Extract named entities from this text: ${text}`,
    schema: z.object({
      entities: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
        }),
      ),
    }),
  });
  return result.object.entities;
}

export async function moderateContent(text: string, model?: LanguageModel) {
  const result = await generateObject({
    model: model || getDefaultModel(),
    prompt: `Moderate this content for safety: ${text}`,
    schema: z.object({
      safe: z.boolean(),
      categories: z.array(z.string()),
    }),
  });
  return result.object;
}

// Configuration-based generation functions
export async function generateTextWithConfig(prompt: string, config: any) {
  return generateText({
    model: config.model || getDefaultModel(),
    prompt,
    ...config,
  });
}

export async function generateObjectWithConfig(prompt: string, schema: any, config: any) {
  return generateObject({
    model: config.model || getDefaultModel(),
    prompt,
    schema,
    ...config,
  });
}

export async function streamTextWithConfig(prompt: string, config: any) {
  return streamText({
    model: config.model || getDefaultModel(),
    prompt,
    ...config,
  });
}

// Validation functions
export function validateGenerateOptions(options: any): boolean {
  // Basic validation - expand as needed
  return options && typeof options === 'object';
}

// Error handling
export function formatProviderError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// Model creation helpers
export function createModel(provider: string, modelId: string, config?: any) {
  // This is a simplified version - expand based on your needs
  return { provider, modelId, ...config };
}

export function createModels(configs: Array<{ provider: string; modelId: string; config?: any }>) {
  return configs.map(c => createModel(c.provider, c.modelId, c.config));
}

// Legacy support
export function getLegacyModel() {
  return getDefaultModel();
}

export function getModel(modelId?: string) {
  // In a real implementation, this would look up the model by ID
  return getDefaultModel();
}

// Type exports
export interface GenerateOptions {
  model?: LanguageModel;
  temperature?: number;
  maxOutputTokens?: number;
  [key: string]: any;
}

export interface ModelConfig {
  provider: string;
  modelId: string;
  apiKey?: string;
  baseUrl?: string;
  [key: string]: any;
}
