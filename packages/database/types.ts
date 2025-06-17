export interface DatabaseAdapter {
  count(collection: string, query?: any): Promise<number>;
  create<T>(collection: string, data: any): Promise<T>;
  delete<T>(collection: string, id: string): Promise<T>;
  disconnect(): Promise<void>;
  findMany<T>(collection: string, query?: any): Promise<T[]>;
  findUnique<T>(collection: string, query: any): Promise<null | T>;
  getClient(): any;
  initialize(): Promise<void>;
  raw<T = any>(operation: string, params: any): Promise<T>;
  update<T>(collection: string, id: string, data: any): Promise<T>;
}

export interface RedisDatabaseAdapter extends DatabaseAdapter {
  decrement(collection: string, id: string, field?: string, by?: number): Promise<number>;
  deleteMultiple<T>(collection: string, ids: string[]): Promise<T[]>;
  // Key management
  exists(collection: string, id: string): Promise<boolean>;
  expire(collection: string, id: string, seconds: number): Promise<boolean>;

  flushAll(): Promise<string>;
  flushDb(): Promise<string>;
  getMultiple<T>(collection: string, ids: string[]): Promise<(null | T)[]>;

  hashDelete(collection: string, id: string, ...fields: string[]): Promise<number>;
  hashGet<T>(collection: string, id: string, field: string): Promise<null | T>;

  hashGetAll<T>(collection: string, id: string): Promise<Record<string, T>>;
  // Hash operations
  hashSet(collection: string, id: string, field: string, value: any): Promise<number>;
  // Numeric operations
  increment(collection: string, id: string, field?: string, by?: number): Promise<number>;
  listLength(collection: string, id: string): Promise<number>;

  listPop<T>(collection: string, id: string): Promise<null | T>;
  // List operations
  listPush<T>(collection: string, id: string, ...values: T[]): Promise<number>;
  listRange<T>(collection: string, id: string, start?: number, end?: number): Promise<T[]>;
  // Utility methods
  ping(): Promise<string>;

  // Set operations
  setAdd<T>(collection: string, id: string, ...members: T[]): Promise<number>;
  setIsMember<T>(collection: string, id: string, member: T): Promise<boolean>;
  setMembers<T>(collection: string, id: string): Promise<T[]>;
  setMultiple<T>(collection: string, records: { [key: string]: any; id: string }[]): Promise<T[]>;

  setRemove<T>(collection: string, id: string, ...members: T[]): Promise<number>;
  // Redis-specific operations
  setWithExpiration<T>(
    collection: string,
    id: string,
    data: any,
    expirationSeconds: number,
  ): Promise<T>;
  // Sorted set operations
  sortedSetAdd(
    collection: string,
    id: string,
    ...members: { member: any; score: number }[]
  ): Promise<number>;

  sortedSetRange<T>(
    collection: string,
    id: string,
    start: number,
    end: number,
    withScores?: boolean,
  ): Promise<T[] | { member: T; score: number }[]>;
  sortedSetScore<T>(collection: string, id: string, member: T): Promise<null | number>;
  ttl(collection: string, id: string): Promise<number>;
}

export interface VectorDatabaseAdapter extends DatabaseAdapter {
  deleteMany<T>(ids: string | string[], options?: { namespace?: string }): Promise<T>;

  fetch<T>(
    ids: string | string[],
    options?: {
      includeData?: boolean;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
    },
  ): Promise<T[]>;

  // Index management
  getInfo(): Promise<any>;
  // Namespace management helpers
  getNamespaceInfo(namespace: string): Promise<any>;
  listNamespaces(): Promise<string[]>;

  // Core vector operations
  query<T>(
    options: {
      data?: string;
      filter?: string;
      includeData?: boolean;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      sparseVector?: {
        indices: number[];
        values: number[];
      };
      topK?: number;
      vector?: number[];
    },
    queryOptions?: any,
  ): Promise<T[]>;

  // Vector type-specific operations
  queryByText<T>(
    text: string,
    options?: {
      filter?: string;
      includeData?: boolean;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
      topK?: number;
    },
  ): Promise<T[]>;
  queryHybrid<T>(
    vector: number[],
    sparseVector: {
      indices: number[];
      values: number[];
    },
    options?: {
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
      topK?: number;
    },
  ): Promise<T[]>;

  querySparse<T>(
    sparseVector: {
      indices: number[];
      values: number[];
    },
    options?: {
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
      topK?: number;
    },
  ): Promise<T[]>;

  reset(): Promise<any>;

  // Metadata operations
  updateMetadata<T>(
    id: string,
    metadata: Record<string, any>,
    options?: { namespace?: string },
  ): Promise<T>;

  upsertData<T>(data: any, options?: { namespace?: string }): Promise<T>;

  upsertDense<T>(
    vectors: {
      id: string;
      metadata?: Record<string, any>;
      vector: number[];
    }[],
    options?: { namespace?: string },
  ): Promise<T>;

  upsertHybrid<T>(
    vectors: {
      id: string;
      metadata?: Record<string, any>;
      sparseVector: {
        indices: number[];
        values: number[];
      };
      vector: number[];
    }[],
    options?: { namespace?: string },
  ): Promise<T>;

  // Batch operations
  upsertMany<T>(vectors: any[], namespace?: string): Promise<T>;

  upsertSparse<T>(
    vectors: {
      id: string;
      metadata?: Record<string, any>;
      sparseVector: {
        indices: number[];
        values: number[];
      };
    }[],
    options?: { namespace?: string },
  ): Promise<T>;
  upsertText<T>(
    data: {
      data: string;
      id: string;
      metadata?: Record<string, any>;
    }[],
    options?: { namespace?: string },
  ): Promise<T>;
}
