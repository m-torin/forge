import { google } from '@ai-sdk/google';
import type { EmbeddingModelV2 } from '@ai-sdk/provider';

/**
 * Shared Google Gemini model configurations with enhanced features
 * Following Vercel AI SDK patterns for consistency across apps
 * Server-side only (requires @ai-sdk/google)
 */

// Create Google models with enhanced configuration
const createGoogleModel = (modelName: string) => {
  return google(modelName);
  // Note: In AI SDK v5, safety settings and other provider options are now passed
  // via providerOptions in the generateText/streamText call, not in the model constructor
  // Example usage:
  // generateText({
  //   model: google('gemini-1.5-pro'),
  //   providerOptions: {
  //     google: {
  //       safetySettings: [
  //         { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
  //       ]
  //     }
  //   }
  // })
  // Search grounding will be enabled via environment configuration
  // Caching will be handled at the provider level
};

export const GOOGLE_MODELS = {
  'gemini-1.5-pro-latest': createGoogleModel('gemini-1.5-pro-latest'),
  'gemini-1.5-flash': createGoogleModel('gemini-1.5-flash'),
  'gemini-2.0-flash-exp': createGoogleModel('gemini-2.0-flash-exp'),
} as const;

export const GOOGLE_EMBEDDING_MODELS: Record<string, EmbeddingModelV2<string>> = {
  'text-embedding-004': google.textEmbeddingModel('text-embedding-004'),
} as const;

// Google model metadata
export const GOOGLE_MODEL_METADATA = {
  'gemini-1.5-pro-latest': {
    name: 'Gemini 1.5 Pro',
    description: "Google's most capable model with 2M context window",
    contextWindow: 2097152, // 2M tokens
    capabilities: ['text', 'vision', 'tools', 'structured-output', 'search-grounding'],
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient model with 1M context window',
    contextWindow: 1048576, // 1M tokens
    capabilities: ['text', 'vision', 'tools', 'structured-output', 'search-grounding'],
  },
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash (Experimental)',
    description: 'Next-generation experimental model',
    contextWindow: 1048576, // 1M tokens
    capabilities: ['text', 'vision', 'tools', 'structured-output', 'search-grounding'],
  },
} as const;
