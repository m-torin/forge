/**
 * Main entry point for @repo/db-firestore package
 * Provides Firebase Firestore client with Next.js and edge runtime support
 */

// Export all types
export type * from './types';

// Export configuration utilities
export * from './config';

// Export runtime-specific clients
export { createClient } from './client';
export { createServerClient, firestore, getServerClient, safeServerOperation } from './server';

// Export utility functions
export { executeBatch, paginateQuery, safeFirestoreOperation } from './server';

// Export operations
export { AnalyticsOperations, ContentOperations, UserOperations } from './operations';

// Export utilities
export * from './utils';

// Re-export commonly used Firestore types
export type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
  GeoPoint,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  Transaction,
  WriteBatch,
  WriteResult,
} from 'firebase-admin/firestore';
