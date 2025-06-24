export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, any>;
}

export interface VectorSearchOptions {
  topK?: number;
  includeValues?: boolean;
  includeMetadata?: boolean;
  filter?: Record<string, any>;
}

export interface VectorDBConfig {
  url: string;
  token: string;
  namespace?: string;
}

export interface VectorDB {
  upsert(records: VectorRecord[]): Promise<void>;
  query(vector: number[], options?: VectorSearchOptions): Promise<VectorSearchResult[]>;
  delete(ids: string[]): Promise<void>;
  fetch(ids: string[]): Promise<VectorRecord[]>;
  describe(): Promise<{ dimension: number; totalVectorCount: number }>;
}
