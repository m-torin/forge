// Database-related types and interfaces
// This file contains shared types used across the database package

/**
 * Database connection configuration
 * @param url - Database connection URL
 * @param token - Optional authentication token
 */
export interface DatabaseConnection {
  url: string;
  token?: string;
}

/**
 * Database configuration options
 * @param connection - Database connection settings
 * @param retries - Number of retry attempts
 * @param timeout - Connection timeout in milliseconds
 */
export interface DatabaseConfig {
  connection: DatabaseConnection;
  retries?: number;
  timeout?: number;
}

// Common database operation types
/**
 * Common database query options
 * @param limit - Maximum number of records to return
 * @param offset - Number of records to skip
 * @param orderBy - Field to order by
 * @param orderDirection - Sort direction
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Result of a bulk database operation
 * @param success - Whether the operation succeeded
 * @param processed - Number of records processed
 * @param errors - Array of error messages
 */
export interface BulkOperationResult {
  success: boolean;
  processed: number;
  errors: string[];
}

// Vector-specific types
/**
 * Result from a vector similarity search
 * @param id - Unique identifier of the vector
 * @param score - Similarity score
 * @param metadata - Optional metadata associated with the vector
 * @param data - Optional data payload
 */
export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
  data?: string;
}

/**
 * Configuration for vector search queries
 * @param vector - Query vector for similarity search
 * @param data - Text data to vectorize and search
 * @param topK - Number of top results to return
 * @param filter - Filter expression to apply
 * @param namespace - Vector namespace to search in
 * @param includeVectors - Whether to include vector data in results
 * @param includeMetadata - Whether to include metadata in results
 * @param includeData - Whether to include data payload in results
 */
export interface VectorQuery {
  vector?: number[];
  data?: string;
  topK?: number;
  filter?: string;
  namespace?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
  includeData?: boolean;
}

// Redis-specific types
/**
 * Result of a Redis operation
 * @param success - Whether the operation succeeded
 * @param value - The returned value, if any
 * @param error - Error message if operation failed
 */
export interface RedisOperationResult {
  success: boolean;
  value?: any;
  error?: string;
}

// Firestore-specific types
/**
 * Firestore document structure
 * @param id - Document identifier
 * @param data - Document data payload
 * @param created - Document creation timestamp
 * @param updated - Document last update timestamp
 */
export interface FirestoreDocument {
  id: string;
  data: Record<string, any>;
  created?: Date;
  updated?: Date;
}

/**
 * Configuration for Firestore queries
 * @param collection - Collection name to query
 * @param where - Array of where conditions
 * @param orderBy - Array of ordering rules
 * @param limit - Maximum number of documents to return
 */
export interface FirestoreQuery {
  collection: string;
  where?: Array<{
    field: string;
    operator:
      | '=='
      | '!='
      | '<'
      | '<='
      | '>'
      | '>='
      | 'in'
      | 'not-in'
      | 'array-contains'
      | 'array-contains-any';
    value: any;
  }>;
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  limit?: number;
}
