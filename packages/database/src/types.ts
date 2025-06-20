// Database-related types and interfaces
// This file contains shared types used across the database package

export interface DatabaseConnection {
  url: string;
  token?: string;
}

export interface DatabaseConfig {
  connection: DatabaseConnection;
  retries?: number;
  timeout?: number;
}

// Common database operation types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  errors: string[];
}

// Vector-specific types
export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
  data?: string;
}

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
export interface RedisOperationResult {
  success: boolean;
  value?: any;
  error?: string;
}

// Firestore-specific types
export interface FirestoreDocument {
  id: string;
  data: Record<string, any>;
  created?: Date;
  updated?: Date;
}

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
