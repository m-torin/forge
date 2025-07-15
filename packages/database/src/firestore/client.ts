/**
 * Client-side Firestore functionality
 * This provides Firestore types and utilities that are safe to use on the client side
 */

// Re-export safe types from firebase-admin/firestore
export type {
  CollectionGroup,
  DocumentData,
  FieldValue,
  Query as FirestoreQuery,
  GeoPoint,
  Timestamp,
  Transaction,
  WriteBatch,
  WriteResult,
} from 'firebase-admin/firestore';

// Client-safe Firestore configuration interface
export interface FirestoreClientConfig {
  projectId: string;
  clientEmail?: string;
  // Note: privateKey should never be exposed to client-side
  databaseURL?: string;
}

// Client-side Firestore interface (for type checking)
export interface ClientFirestoreInterface {
  // Document operations
  getDoc(collection: string, id: string): Promise<any | null>;
  setDoc(collection: string, id: string, data: any): Promise<void>;
  updateDoc(collection: string, id: string, data: Partial<any>): Promise<void>;
  deleteDoc(collection: string, id: string): Promise<void>;

  // Collection operations
  getDocs(collection: string, query?: any): Promise<any[]>;
  addDoc(collection: string, data: any): Promise<string>; // Returns document ID

  // Query operations
  where(field: string, operator: FirestoreOperator, value: any): any;
  orderBy(field: string, direction?: 'asc' | 'desc'): any;
  limit(count: number): any;
  offset(count: number): any;

  // Batch operations
  batch(): any;
  transaction(callback: (transaction: any) => Promise<any>): Promise<any>;
}

// Firestore query operators that are safe for client-side validation
export type FirestoreOperator =
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in';

// Client-side query builder interface
export interface FirestoreQueryBuilder {
  collection: string;
  where?: Array<{
    field: string;
    operator: FirestoreOperator;
    value: any;
  }>;
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  limit?: number;
  offset?: number;
}

// Client-side helper functions
export function isFirestoreError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.message.includes('PERMISSION_DENIED') ||
      error.message.includes('NOT_FOUND') ||
      error.message.includes('ALREADY_EXISTS') ||
      error.message.includes('INVALID_ARGUMENT'))
  );
}

export function validateFirestoreDocId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (id.length === 0 || id.length > 1500) return false;

  // Firestore document IDs cannot contain certain characters
  const invalidChars = /[\/\x00-\x1f\x7f]/;
  return !invalidChars.test(id);
}

export function validateFirestoreFieldPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;

  // Field paths cannot start or end with dots, or contain consecutive dots
  if (path.startsWith('.') || path.endsWith('.') || path.includes('..')) return false;

  // Field paths cannot contain certain characters
  const invalidChars = /[~*\/\[\]]/;
  return !invalidChars.test(path);
}

export function sanitizeFirestoreData(data: any): any {
  if (data === null || data === undefined) return null;

  if (typeof data === 'object' && !Array.isArray(data)) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip undefined values (Firestore doesn't support them)
      if (value !== undefined) {
        // Validate field names
        if (validateFirestoreFieldPath(key)) {
          sanitized[key] = sanitizeFirestoreData(value);
        }
      }
    }
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestoreData(item));
  }

  return data;
}

// Client-side Firestore query builder
export class ClientFirestoreQueryBuilder implements FirestoreQueryBuilder {
  public collection: string;
  public where?: Array<{ field: string; operator: FirestoreOperator; value: any }>;
  public orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  public limit?: number;
  public offset?: number;

  constructor(collection: string) {
    this.collection = collection;
  }

  addWhere(field: string, operator: FirestoreOperator, value: any): this {
    if (!this.where) this.where = [];
    this.where.push({ field, operator, value });
    return this;
  }

  addOrderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    if (!this.orderBy) this.orderBy = [];
    this.orderBy.push({ field, direction });
    return this;
  }

  setLimit(count: number): this {
    this.limit = Math.max(0, Math.floor(count));
    return this;
  }

  setOffset(count: number): this {
    this.offset = Math.max(0, Math.floor(count));
    return this;
  }

  build(): FirestoreQueryBuilder {
    return {
      collection: this.collection,
      where: this.where,
      orderBy: this.orderBy,
      limit: this.limit,
      offset: this.offset,
    };
  }
}

// Client-side Firestore patterns and constants
export const FIRESTORE_PATTERNS = {
  MAX_DOC_ID_LENGTH: 1500,
  MAX_FIELD_PATH_LENGTH: 1500,
  MAX_BATCH_SIZE: 500,
  MAX_TRANSACTION_RETRIES: 5,
  COLLECTION_ID_REGEX: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  FIELD_PATH_SEPARATOR: '.',
} as const;

// Client-side validation utilities
export const FirestoreValidators = {
  isValidDocumentId: validateFirestoreDocId,
  isValidFieldPath: validateFirestoreFieldPath,
  isValidCollectionId: (id: string) => FIRESTORE_PATTERNS.COLLECTION_ID_REGEX.test(id),
  isValidBatchSize: (size: number) => size > 0 && size <= FIRESTORE_PATTERNS.MAX_BATCH_SIZE,
  sanitizeData: sanitizeFirestoreData,
} as const;

// Client-side error handling utilities
export function getFirestoreErrorMessage(error: unknown): string {
  if (!isFirestoreError(error)) {
    return 'An unknown error occurred';
  }

  const message = error.message.toLowerCase();

  if (message.includes('permission_denied')) {
    return 'You do not have permission to perform this operation';
  }

  if (message.includes('not_found')) {
    return 'The requested document was not found';
  }

  if (message.includes('already_exists')) {
    return 'A document with this ID already exists';
  }

  if (message.includes('invalid_argument')) {
    return 'Invalid data provided';
  }

  return error.message;
}

// Note: Actual Firestore client instance creation is not available on client-side
// This file provides types and utilities for client-side code that works with Firestore data
export const CLIENT_FIRESTORE_NOTE = `
Firestore client instances can only be created on the server side.
Import from '@repo/database/firestore/server' or '@repo/database/firestore/server/next' for actual Firestore operations.
` as const;
