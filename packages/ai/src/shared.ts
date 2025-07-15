/**
 * Environment-agnostic AI exports
 *
 * This file provides AI functionality that works in both Node.js and Next.js environments.
 * Only exports truly shared components that have no server-only dependencies.
 */

// Shared types and utilities that work everywhere
export * from './shared/errors';
export * from './shared/types';
export * from './shared/utils/validation';

// Model metadata that works in both client and server
export { ANTHROPIC_MODEL_METADATA } from './shared/models/metadata';

// Re-export embedding functionality from ai SDK (environment-agnostic)
export { cosineSimilarity, embed, embedMany } from 'ai';

// Re-export only type definitions to avoid server-only imports
export type { RAGConfig, RAGDocument, RAGPipeline, RAGSearchResult } from './server/rag/types';
export type { VectorDB, VectorDBConfig } from './server/utils/vector/types';

// Client-safe provider registry
export {
  clientModels,
  clientRegistry,
  clientRegistry as registry,
} from './shared/providers/client-registry';
