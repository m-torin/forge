/**
 * Main entry point for @repo/db-upstash-vector package
 * Provides Upstash Vector database client with AI embeddings and similarity search
 */

// Export all types
export type * from './types';

// Export configuration utilities
export * from './config';

// Export main client functions
export { createClient, createClientOperations } from './client';
export { createEdgeClient, createServerClient, safeServerOperation } from './server';

// Export operations
export { AIOperations, DocumentOperations, SemanticSearchOperations } from './operations';

// Export embedding utilities
export * from './embeddings';

// Re-export commonly used Upstash Vector types
export type {
  DeleteOptions,
  FetchOptions,
  Index,
  InfoResult,
  Metadata,
  QueryOptions,
  QueryResult,
  StatsResult,
  UpsertOptions,
  Vector,
} from '@upstash/vector';
