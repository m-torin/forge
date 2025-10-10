/**
 * Configuration utilities for Upstash Vector client
 */

import { logWarn } from '@repo/observability/server/next';
import { z } from 'zod';
import type { UpstashVectorConfig } from './types';

/**
 * Upstash Vector configuration schema
 */
export const upstashVectorConfigSchema = z.object({
  url: z.string().url(),
  token: z.string().min(1),
  embeddings: z.optional(
    z.object({
      provider: z.enum(['openai', 'cohere', 'huggingface']),
      apiKey: z.string().min(1),
      model: z.string().min(1),
      dimensions: z.number().int().positive().optional(),
    }),
  ),
});

/**
 * Default Upstash Vector configuration from environment variables
 */
export function getDefaultConfig(): UpstashVectorConfig | null {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const config: UpstashVectorConfig = { url, token };

  // Add embeddings config if available
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    config.embeddings = {
      provider: 'openai',
      apiKey: openaiKey,
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
    };
  }

  return config;
}

/**
 * Validate Upstash Vector configuration
 */
export function validateConfig(config: unknown): UpstashVectorConfig {
  const result = upstashVectorConfigSchema.safeParse(config);
  if (!result.success) {
    logWarn('Invalid Upstash Vector config, using defaults', {
      error: result.error.message,
      receivedConfig: config,
    });
    return {
      url: '',
      token: '',
    } as UpstashVectorConfig;
  }
  return result.data;
}

/**
 * Runtime detection utility
 */
export function detectRuntime(): 'node' | 'edge' | 'browser' | 'worker' {
  // Check for Node.js
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'node';
  }

  // Check for Edge Runtime
  if (typeof EdgeRuntime !== 'undefined') {
    return 'edge';
  }

  // Check for Web Worker
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    return 'worker';
  }

  // Default to browser
  if (typeof window !== 'undefined') {
    return 'browser';
  }

  // Fallback to edge for unknown environments
  return 'edge';
}

/**
 * Get optimal embedding dimensions for a model
 */
export function getModelDimensions(model: string): number {
  const dimensionMap: Record<string, number> = {
    'text-embedding-ada-002': 1536,
    'text-embedding-3-small': 1536,
    'text-embedding-3-large': 3072,
    'embed-english-v3.0': 1024,
    'embed-multilingual-v3.0': 1024,
    'sentence-transformers/all-MiniLM-L6-v2': 384,
  };

  return dimensionMap[model] || 1536; // Default to ada-002 dimensions
}
