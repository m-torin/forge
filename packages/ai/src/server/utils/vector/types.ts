// Re-export types from shared types to avoid conflicts
export type {
  VectorDBOperations as VectorDB,
  BaseVectorRecord as VectorRecord,
  BaseVectorSearchOptions as VectorSearchOptions,
  BaseVectorSearchResult as VectorSearchResult,
} from '../../../shared/types/vector';

export interface VectorDBConfig {
  url: string;
  token: string;
  namespace?: string;
}
