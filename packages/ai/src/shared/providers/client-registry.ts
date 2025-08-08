/**
 * Client-safe provider registry
 *
 * This module provides client-safe access to AI provider configurations
 * without importing server-only dependencies.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { customProvider } from 'ai';

/**
 * Client-safe provider registry that can be used in both client and server components.
 * This is a simplified version that doesn't include server-only dependencies like MCP.
 */
export const clientRegistry = customProvider({
  languageModels: {
    // OpenAI models
    'openai:gpt-4o': openai('gpt-4o'),
    'openai:gpt-4o-mini': openai('gpt-4o-mini'),
    'openai:gpt-4-turbo': openai('gpt-4-turbo'),
    'openai:gpt-4o-reasoning': openai('gpt-4o'),

    // Anthropic models
    'anthropic:sonnet': anthropic('claude-3-5-sonnet-latest'),
    'anthropic:haiku': anthropic('claude-3-5-haiku-latest'),
    'anthropic:sonnet-reasoning': anthropic('claude-3-5-sonnet-latest'),

    // Google models
    'google:gemini-pro': google('gemini-2.0-flash-exp'),
    'google:gemini-flash': google('gemini-1.5-flash'),
  },

  textEmbeddingModels: {
    'openai:text-embedding-3-small': openai.textEmbeddingModel('text-embedding-3-small'),
    'openai:text-embedding-3-large': openai.textEmbeddingModel('text-embedding-3-large'),
  },

  fallbackProvider: openai,
});

/**
 * Type-safe model helper for client-side usage
 */
export const clientModels = {
  language: {
    best: () => clientRegistry.languageModel('openai:gpt-4o'),
    fast: () => clientRegistry.languageModel('openai:gpt-4o-mini'),
    reasoningText: () => clientRegistry.languageModel('openai:gpt-4o-reasoning'),
  },
  embedding: {
    default: () => clientRegistry.textEmbeddingModel('openai:text-embedding-3-small'),
    large: () => clientRegistry.textEmbeddingModel('openai:text-embedding-3-large'),
  },
};
