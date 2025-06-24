/**
 * Environment-agnostic AI exports
 *
 * This file provides AI functionality that works in both Node.js and Next.js environments.
 * It uses runtime detection to load the appropriate implementation.
 */

// Shared types and utilities that work everywhere
export * from './shared/types';
export * from './shared/providers/registry';
export * from './shared/utils/validation';

// Runtime detection function
function isNextJSEnvironment(): boolean {
  try {
    // Check if we're in a Next.js environment
    return (
      typeof window !== 'undefined' ||
      (typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== undefined)
    );
  } catch {
    return false;
  }
}

// Dynamic imports based on runtime
export async function createAIManager(config?: any) {
  if (isNextJSEnvironment()) {
    const { ServerAIManager } = await import('./server-next');
    return config ? new ServerAIManager(config) : ServerAIManager.fromEnv();
  } else {
    const { ServerAIManager } = await import('./server');
    return config ? new ServerAIManager(config) : ServerAIManager.fromEnv();
  }
}

export async function createClientManager(config?: any) {
  if (isNextJSEnvironment()) {
    const { ClientAIManager } = await import('./client-next');
    return new ClientAIManager(config);
  } else {
    const { ClientAIManager } = await import('./client');
    return new ClientAIManager(config);
  }
}

// Re-export embedding functionality (environment-agnostic)
export { embed, embedMany, cosineSimilarity } from 'ai';
export { embedding, createEmbeddingManager, type EmbeddingManager } from './server/embedding/utils';

// Re-export vector functionality (environment-agnostic)
export * from './server/vector';

// Re-export document processing (environment-agnostic)
export * from './server/document';

// Re-export RAG functionality (environment-agnostic)
export * from './server/rag';
