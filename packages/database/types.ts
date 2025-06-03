export interface DatabaseAdapter {
  count(collection: string, query?: any): Promise<number>;
  create<T>(collection: string, data: any): Promise<T>;
  delete<T>(collection: string, id: string): Promise<T>;
  disconnect(): Promise<void>;
  findMany<T>(collection: string, query?: any): Promise<T[]>;
  findUnique<T>(collection: string, query: any): Promise<T | null>;
  getClient(): any;
  initialize(): Promise<void>;
  raw<T = any>(operation: string, params: any): Promise<T>;
  update<T>(collection: string, id: string, data: any): Promise<T>;
}

export interface VectorDatabaseAdapter extends DatabaseAdapter {
  // Core vector operations
  query<T>(
    options: {
      vector?: number[];
      data?: string;
      sparseVector?: {
        indices: number[];
        values: number[];
      };
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
    },
    queryOptions?: any,
  ): Promise<T[]>;

  fetch<T>(
    ids: string | string[],
    options?: {
      namespace?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
    },
  ): Promise<T[]>;

  deleteMany<T>(ids: string | string[], options?: { namespace?: string }): Promise<T>;
  upsertData<T>(data: any, options?: { namespace?: string }): Promise<T>;
  // Batch operations
  upsertMany<T>(vectors: any[], namespace?: string): Promise<T>;

  // Metadata operations
  updateMetadata<T>(
    id: string,
    metadata: Record<string, any>,
    options?: { namespace?: string },
  ): Promise<T>;

  // Index management
  getInfo(): Promise<any>;
  reset(): Promise<any>;

  // Vector type-specific operations
  queryByText<T>(
    text: string,
    options?: {
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
      namespace?: string;
    },
  ): Promise<T[]>;

  upsertText<T>(
    data: {
      id: string;
      data: string;
      metadata?: Record<string, any>;
    }[],
    options?: { namespace?: string },
  ): Promise<T>;

  upsertDense<T>(
    vectors: {
      id: string;
      vector: number[];
      metadata?: Record<string, any>;
    }[],
    options?: { namespace?: string },
  ): Promise<T>;

  upsertSparse<T>(
    vectors: {
      id: string;
      sparseVector: {
        indices: number[];
        values: number[];
      };
      metadata?: Record<string, any>;
    }[],
    options?: { namespace?: string },
  ): Promise<T>;

  upsertHybrid<T>(
    vectors: {
      id: string;
      vector: number[];
      sparseVector: {
        indices: number[];
        values: number[];
      };
      metadata?: Record<string, any>;
    }[],
    options?: { namespace?: string },
  ): Promise<T>;

  querySparse<T>(
    sparseVector: {
      indices: number[];
      values: number[];
    },
    options?: {
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
    },
  ): Promise<T[]>;

  queryHybrid<T>(
    vector: number[],
    sparseVector: {
      indices: number[];
      values: number[];
    },
    options?: {
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
    },
  ): Promise<T[]>;

  // Namespace management helpers
  getNamespaceInfo(namespace: string): Promise<any>;
  listNamespaces(): Promise<string[]>;
}

export interface RedisDatabaseAdapter extends DatabaseAdapter {
  deleteMultiple<T>(collection: string, ids: string[]): Promise<T[]>;
  getMultiple<T>(collection: string, ids: string[]): Promise<(T | null)[]>;
  setMultiple<T>(collection: string, records: { id: string; [key: string]: any }[]): Promise<T[]>;
  // Redis-specific operations
  setWithExpiration<T>(
    collection: string,
    id: string,
    data: any,
    expirationSeconds: number,
  ): Promise<T>;

  // Key management
  exists(collection: string, id: string): Promise<boolean>;
  expire(collection: string, id: string, seconds: number): Promise<boolean>;
  ttl(collection: string, id: string): Promise<number>;

  decrement(collection: string, id: string, field?: string, by?: number): Promise<number>;
  // Numeric operations
  increment(collection: string, id: string, field?: string, by?: number): Promise<number>;

  listLength(collection: string, id: string): Promise<number>;
  listPop<T>(collection: string, id: string): Promise<T | null>;
  // List operations
  listPush<T>(collection: string, id: string, ...values: T[]): Promise<number>;
  listRange<T>(collection: string, id: string, start?: number, end?: number): Promise<T[]>;

  // Set operations
  setAdd<T>(collection: string, id: string, ...members: T[]): Promise<number>;
  setIsMember<T>(collection: string, id: string, member: T): Promise<boolean>;
  setMembers<T>(collection: string, id: string): Promise<T[]>;
  setRemove<T>(collection: string, id: string, ...members: T[]): Promise<number>;

  hashDelete(collection: string, id: string, ...fields: string[]): Promise<number>;
  hashGet<T>(collection: string, id: string, field: string): Promise<T | null>;
  hashGetAll<T>(collection: string, id: string): Promise<Record<string, T>>;
  // Hash operations
  hashSet(collection: string, id: string, field: string, value: any): Promise<number>;

  // Sorted set operations
  sortedSetAdd(
    collection: string,
    id: string,
    ...members: { score: number; member: any }[]
  ): Promise<number>;
  sortedSetRange<T>(
    collection: string,
    id: string,
    start: number,
    end: number,
    withScores?: boolean,
  ): Promise<T[] | { member: T; score: number }[]>;
  sortedSetScore<T>(collection: string, id: string, member: T): Promise<number | null>;

  flushAll(): Promise<string>;
  flushDb(): Promise<string>;
  // Utility methods
  ping(): Promise<string>;
}
