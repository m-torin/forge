/**
 * Firestore type definitions and interfaces
 */

// Re-export Firebase types
export type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
  GeoPoint,
  GetOptions,
  OrderByDirection,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  SetOptions,
  Timestamp,
  Transaction,
  UpdateData,
  WhereFilterOp,
  WriteBatch,
  WriteResult,
} from 'firebase-admin/firestore';

/**
 * Firestore configuration
 */
export interface FirestoreConfig {
  projectId: string;
  clientEmail?: string;
  privateKey?: string;
  keyFilename?: string;
  databaseURL?: string;
  databaseId?: string;
}

/**
 * Client configuration for browser environments
 */
export interface FirestoreClientConfig {
  projectId: string;
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

/**
 * Query builder types
 */
export interface QueryBuilder<T = DocumentData> {
  where(field: string, op: WhereFilterOp, value: any): QueryBuilder<T>;
  orderBy(field: string, direction?: OrderByDirection): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  startAt(...values: any[]): QueryBuilder<T>;
  startAfter(...values: any[]): QueryBuilder<T>;
  endAt(...values: any[]): QueryBuilder<T>;
  endBefore(...values: any[]): QueryBuilder<T>;
  get(): Promise<QuerySnapshot<T>>;
}

/**
 * Collection operations interface
 */
export interface CollectionOperations<T = DocumentData> {
  add(data: T): Promise<DocumentReference<T>>;
  doc(id?: string): DocumentOperations<T>;
  where(field: string, op: WhereFilterOp, value: any): QueryBuilder<T>;
  orderBy(field: string, direction?: OrderByDirection): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  get(): Promise<QuerySnapshot<T>>;
}

/**
 * Document operations interface
 */
export interface DocumentOperations<T = DocumentData> {
  get(options?: GetOptions): Promise<DocumentSnapshot<T>>;
  set(data: T, options?: SetOptions): Promise<WriteResult>;
  update(data: UpdateData<T>): Promise<WriteResult>;
  delete(): Promise<WriteResult>;
  onSnapshot(
    callback: (snapshot: DocumentSnapshot<T>) => void,
    errorCallback?: (error: Error) => void,
  ): () => void;
  collection(collectionPath: string): CollectionOperations;
}

/**
 * Firestore client interface
 */
export interface FirestoreClient {
  collection(collectionPath: string): CollectionOperations;
  doc(documentPath: string): DocumentOperations;
  runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
  batch(): WriteBatch;
  getAll(...documentReferences: DocumentReference[]): Promise<DocumentSnapshot[]>;
  terminate(): Promise<void>;
  enablePersistence?(): Promise<void>;
  clearPersistence?(): Promise<void>;
}

/**
 * Firestore operation result types
 */
export type FirestoreResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
  startAfter?: any;
  endBefore?: any;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: any;
  prevCursor?: any;
}

/**
 * Real-time subscription options
 */
export interface SubscriptionOptions {
  includeMetadataChanges?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Subscription result
 */
export interface Subscription {
  unsubscribe: () => void;
}

/**
 * Batch operation types
 */
export type BatchOperation =
  | { type: 'set'; ref: DocumentReference; data: any; options?: SetOptions }
  | { type: 'update'; ref: DocumentReference; data: any }
  | { type: 'delete'; ref: DocumentReference };

/**
 * Index configuration
 */
export interface IndexConfig {
  collectionGroup?: string;
  queryScope?: 'COLLECTION' | 'COLLECTION_GROUP';
  fields: Array<{
    fieldPath: string;
    order?: 'ASCENDING' | 'DESCENDING';
    arrayConfig?: 'CONTAINS';
  }>;
}

/**
 * Runtime environment detection
 */
export type RuntimeEnvironment = 'nodejs' | 'browser' | 'edge' | 'worker';

/**
 * Environment-specific client options
 */
export interface EnvironmentOptions {
  runtime?: RuntimeEnvironment;
  enableOffline?: boolean;
  cacheSizeBytes?: number;
  experimentalForceLongPolling?: boolean;
}
