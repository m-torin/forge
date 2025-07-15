/**
 * Client-side Upstash Vector functionality
 * This provides Upstash Vector types and utilities that are safe for client-side use
 */

// Note: We only export essential types and utilities for client-side use
// Server operations should use @repo/database/upstash/server

// Client-safe Upstash Vector configuration interface
export interface UpstashVectorClientConfig {
  url: string;
  token: string;
  // Note: token should never be exposed to client-side in production
}

// Client-side Vector interface (for type checking)
export interface ClientVectorInterface {
  // Query operations
  query(options: {
    vector?: number[];
    data?: string;
    topK?: number;
    filter?: string;
    includeVectors?: boolean;
    includeMetadata?: boolean;
    includeData?: boolean;
    namespace?: string;
  }): Promise<any[]>;

  // Metadata operations
  fetch(
    ids: string | string[],
    options?: {
      includeVectors?: boolean;
      includeMetadata?: boolean;
      includeData?: boolean;
      namespace?: string;
    },
  ): Promise<any>;

  // Information
  info(): Promise<any>;

  // Namespace operations
  listNamespaces(): Promise<string[]>;
}

// Vector query builder interface
export interface VectorQueryBuilder {
  vector?: number[];
  data?: string;
  topK?: number;
  filter?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
  includeData?: boolean;
  namespace?: string;
}

// Client-side helper functions
export function isVectorError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.message.includes('UPSTASH') ||
      error.message.includes('vector') ||
      error.message.includes('dimension'))
  );
}

export function validateVectorDimensions(vector: number[], expectedDimensions: number): boolean {
  return Array.isArray(vector) && vector.length === expectedDimensions;
}

export function validateVectorId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 512;
}

export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

// Client-side vector utilities
export const VECTOR_PATTERNS = {
  MAX_ID_LENGTH: 512,
  MAX_METADATA_SIZE: 40 * 1024, // 40KB
  MAX_BATCH_SIZE: 1000,
  DEFAULT_TOP_K: 10,
  MAX_TOP_K: 10000,
} as const;

// Client-side vector data validation
export function validateVectorData(data: {
  id: string;
  vector?: number[];
  metadata?: Record<string, any>;
  data?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate ID
  if (!validateVectorId(data.id)) {
    errors.push('ID must be a non-empty string with maximum 512 characters');
  }

  // Validate vector if provided
  if (data.vector && !Array.isArray(data.vector)) {
    errors.push('Vector must be an array of numbers');
  }

  if (data.vector && data.vector.some(val => typeof val !== 'number' || !isFinite(val))) {
    errors.push('Vector must contain only finite numbers');
  }

  // Validate metadata if provided
  if (data.metadata) {
    try {
      const metadataString = JSON.stringify(data.metadata);
      if (metadataString.length > VECTOR_PATTERNS.MAX_METADATA_SIZE) {
        errors.push(`Metadata must be less than ${VECTOR_PATTERNS.MAX_METADATA_SIZE} bytes`);
      }
    } catch {
      errors.push('Metadata must be JSON serializable');
    }
  }

  // Validate data if provided
  if (data.data && typeof data.data !== 'string') {
    errors.push('Data must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Client-side query validation
export function validateQueryOptions(options: VectorQueryBuilder): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate vector if provided
  if (options.vector && !Array.isArray(options.vector)) {
    errors.push('Vector must be an array of numbers');
  }

  if (options.vector && options.vector.some(val => typeof val !== 'number' || !isFinite(val))) {
    errors.push('Vector must contain only finite numbers');
  }

  // Validate topK
  if (options.topK !== undefined) {
    if (
      !Number.isInteger(options.topK) ||
      options.topK < 1 ||
      options.topK > VECTOR_PATTERNS.MAX_TOP_K
    ) {
      errors.push(`TopK must be an integer between 1 and ${VECTOR_PATTERNS.MAX_TOP_K}`);
    }
  }

  // Validate filter if provided
  if (options.filter && typeof options.filter !== 'string') {
    errors.push('Filter must be a string');
  }

  // Validate namespace if provided
  if (options.namespace && typeof options.namespace !== 'string') {
    errors.push('Namespace must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Client-side error handling utilities
export function getVectorErrorMessage(error: unknown): string {
  if (!isVectorError(error)) {
    return 'An unknown error occurred';
  }

  const message = error.message.toLowerCase();

  if (message.includes('dimension')) {
    return 'Vector dimensions do not match the index configuration';
  }

  if (message.includes('quota') || message.includes('limit')) {
    return 'Rate limit or quota exceeded';
  }

  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return 'Authentication failed or insufficient permissions';
  }

  if (message.includes('not found')) {
    return 'Vector or namespace not found';
  }

  return error.message;
}

// Note: Actual Upstash Vector client instance creation is not available on client-side
// This file provides types and utilities for client-side code that works with vector data
export const CLIENT_VECTOR_NOTE = `
Upstash Vector client instances can only be created on the server side.
Import from '@repo/database/upstash/server' or '@repo/database/upstash/server/next' for actual vector operations.
` as const;
