/**
 * LM Studio Provider Module
 * Maximum SDK Usage - Minimal Abstractions
 *
 * ARCHITECTURAL DECISION: Maximum SDK Trust Pattern
 * =================================================
 *
 * LM Studio provides an OpenAI-compatible API server for local models.
 * Since it's 100% OpenAI-compatible, we achieve maximum DRY by:
 *
 * 1. Using @ai-sdk/openai-compatible directly (no custom wrappers)
 * 2. Only providing configuration convenience functions
 * 3. No response processing (SDK handles everything)
 * 4. No capability detection (user manages local models)
 *
 * USAGE EXAMPLES:
 *
 * Basic usage (using default instance):
 * ```typescript
 * import { lmstudio } from '@repo/ai';
 * import { generateText } from 'ai';
 *
 * const { text } = await generateText({
 *   model: lmstudio('llama-3.2-1b'),
 *   prompt: 'Write a vegetarian lasagna recipe for 4 people.',
 * });
 * ```
 *
 * Custom configuration:
 * ```typescript
 * import { createLMStudio } from '@repo/ai';
 *
 * const customStudio = createLMStudio('http://localhost:8080/v1');
 * const model = customStudio('your-model-name');
 * ```
 *
 * Embeddings:
 * ```typescript
 * const embedding = await embed({
 *   model: lmstudio.textEmbeddingModel('text-embedding-nomic-embed-text-v1.5'),
 *   value: 'sunny day at the beach',
 * });
 * ```
 *
 * Environment-based model registration:
 * ```bash
 * # Simple comma-separated format
 * LM_STUDIO_MODELS="llama-3.2-1b,mistral-7b-instruct,codellama-7b"
 *
 * # JSON format for more control
 * LM_STUDIO_MODELS='[
 *   {"name": "llama-3.2-1b", "id": "llama-small", "type": "language"},
 *   {"name": "mistral-7b-instruct", "id": "mistral", "type": "language"},
 *   {"name": "text-embedding-nomic-embed-text-v1.5", "id": "embeddings", "type": "embedding"}
 * ]'
 * ```
 *
 * Then use semantic names:
 * ```typescript
 * import { models } from '@repo/ai';
 *
 * const model = models.language('llama-small'); // Uses your registered model
 * const model2 = models.language('local'); // Uses first registered model
 * ```
 *
 * SPECTRUM POSITIONING: OpenAI/Custom (Maximum SDK Usage)
 *
 * OpenAI/Custom ←────── Anthropic ←────── xAI ←────── Perplexity
 * (LM Studio)           (Balanced)        (SDK-First)  (Min SDK)
 * (Max SDK)
 *
 * RATIONALE: LM Studio has zero unique API features requiring abstraction.
 * The SDK provides complete functionality, we just point it to localhost.
 */

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

/**
 * Default LM Studio configuration
 * Port 1234 is the default in LM Studio UI
 */
export const LM_STUDIO_DEFAULTS = {
  DEFAULT_BASE_URL: 'http://localhost:1234/v1',
  DEFAULT_NAME: 'lmstudio',
} as const;

/**
 * Create LM Studio provider instance
 * @param baseURL - LM Studio server URL (default: http://localhost:1234/v1)
 * @param name - Provider name for debugging (default: 'lmstudio')
 */
export function createLMStudio(
  baseURL: string = LM_STUDIO_DEFAULTS.DEFAULT_BASE_URL,
  name: string = LM_STUDIO_DEFAULTS.DEFAULT_NAME,
) {
  return createOpenAICompatible({
    name,
    baseURL,
    // No API key needed for local server
  });
}

/**
 * Default LM Studio provider instance
 * Uses LM_STUDIO_BASE_URL environment variable if available,
 * otherwise defaults to localhost:1234
 */
export const lmstudio = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
});

/**
 * Helper function to create LM Studio instance with custom port
 * @param port - Port number for localhost LM Studio server
 */
const createLMStudioWithPort = (port: number) =>
  createOpenAICompatible({
    name: 'lmstudio',
    baseURL: `http://localhost:${port}/v1`,
  });

/**
 * Helper function to create LM Studio instance with remote host
 * @param host - Hostname or IP address
 * @param port - Port number (default: 1234)
 * @param secure - Use HTTPS instead of HTTP (default: false)
 */
const createRemoteLMStudio = (host: string, port: number = 1234, secure: boolean = false) =>
  createOpenAICompatible({
    name: 'lmstudio',
    baseURL: `${secure ? 'https' : 'http'}://${host}:${port}/v1`,
  });

/**
 * Type definitions for LM Studio usage
 */
export interface LMStudioConfig {
  baseURL?: string;
  name?: string;
}

interface LMStudioModelConfig {
  id: string;
  name: string;
  type?: 'language' | 'embedding';
  description?: string;
}

/**
 * Parse LM Studio models from environment variable
 * Supports both JSON format and simple comma-separated format
 */
function parseLMStudioModels(modelsEnv: string): LMStudioModelConfig[] {
  if (!modelsEnv) return [];

  try {
    // Try JSON format first
    const parsed = JSON.parse(modelsEnv);
    if (Array.isArray(parsed)) {
      return parsed.map((model: any) => ({
        id: model.id || model.name || 'model',
        name: model.name || model.id || 'model',
        type: model.type || 'language',
        description: model.description,
      }));
    }
  } catch {
    // Fall back to comma-separated format
    return modelsEnv
      .split(',')
      .map(modelName => {
        const trimmed = modelName.trim();
        return {
          id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: trimmed,
          type: 'language' as const,
        };
      })
      .filter(model => model.name);
  }

  return [];
}

/**
 * Get user-configured LM Studio models from environment
 */
function getUserLMStudioModels(): LMStudioModelConfig[] {
  const modelsEnv = process.env.LM_STUDIO_MODELS;
  return parseLMStudioModels(modelsEnv || '');
}

/**
 * LM Studio setup instructions and configuration examples
 * Based on official LM Studio documentation
 */
const LM_STUDIO_INFO = {
  SETUP_STEPS: [
    '1. Download and install LM Studio from https://lmstudio.ai/',
    '2. Download a model in the "Search" tab',
    '3. Start the server in the "Local Server" tab',
    '4. Configure your models via environment variables',
    '5. Use semantic names or direct model names in your code',
  ],
  DEFAULT_PORT: 1234,
  DEFAULT_BASE_URL: 'http://localhost:1234/v1',
  ENVIRONMENT_EXAMPLES: {
    // Simple comma-separated format
    SIMPLE: 'LM_STUDIO_MODELS="llama-3.2-1b,mistral-7b-instruct,codellama-7b"',
    // JSON format for full control
    JSON: `LM_STUDIO_MODELS='[
      {"name": "llama-3.2-1b", "id": "llama-small", "type": "language"},
      {"name": "mistral-7b-instruct", "id": "mistral", "type": "language"},
      {"name": "text-embedding-nomic-embed-text-v1.5", "id": "embeddings", "type": "embedding"}
    ]'`,
    // Single model fallback
    SINGLE: 'LM_STUDIO_MODEL="llama-3.2-1b"',
    // Custom base URL
    CUSTOM_URL: 'LM_STUDIO_BASE_URL="http://localhost:8080/v1"',
  },
  EXAMPLE_MODELS: [
    'llama-3.2-1b',
    'llama-3.2-3b',
    'llama-3.1-8b',
    'mistral-7b-instruct',
    'codellama-7b-instruct',
  ],
  EMBEDDING_MODELS: ['text-embedding-nomic-embed-text-v1.5', 'text-embedding-bge-small-en-v1.5'],
} as const;
