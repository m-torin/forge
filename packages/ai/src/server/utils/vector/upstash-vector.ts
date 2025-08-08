// @ts-ignore - Package may not be installed yet
import { logWarn } from '@repo/observability';
import { Index } from '@upstash/vector';
import type { DeleteResult, UpsertResult, VectorDBStats } from '../../../shared/types/vector';
import type {
  VectorDB,
  VectorDBConfig,
  VectorRecord,
  VectorSearchOptions,
  VectorSearchResult,
} from './types';

export class UpstashVectorDB implements VectorDB {
  private index: Index | null = null;
  private namespace?: string;

  constructor(config: VectorDBConfig) {
    // Gracefully handle missing or empty credentials
    if (!config.url || !config.token || config.url === '' || config.token === '') {
      logWarn(
        '[UpstashVectorDB] Missing or empty credentials - Vector operations will be disabled',
      );
      return;
    }

    this.index = new Index({
      url: config.url,
      token: config.token,
    });
    this.namespace = config.namespace;
  }

  private getIndexWithNamespace() {
    if (!this.index) {
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    return this.namespace ? this.index.namespace(this.namespace) : this.index;
  }

  async upsert(records: VectorRecord[]): Promise<UpsertResult> {
    try {
      const formattedRecords = records.map(record => ({
        id: record.id,
        vector: record.values,
        metadata: record.metadata,
      }));

      await this.getIndexWithNamespace().upsert(formattedRecords);

      return {
        success: true,
        count: records.length,
        ids: records.map(r => r.id),
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        ids: [],
        errors: records.map(r => ({ id: r.id, error: String(error) })),
      };
    }
  }

  async query(vector: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    const queryOptions: any = {
      vector,
      topK: options.topK ?? 10,
      includeVectors: options.includeValues ?? false,
      includeMetadata: options.includeMetadata ?? true,
      includeData: false,
      ...(options.filter && {
        filter:
          typeof options.filter === 'string' ? options.filter : JSON.stringify(options.filter),
      }),
    };

    const result = await this.getIndexWithNamespace().query(queryOptions);

    return (
      result?.map((match: any) => ({
        id: match.id,
        score: match.score ?? 0,
        values: match.vector,
        metadata: match.metadata,
      })) ?? []
    );
  }

  async delete(ids: string[]): Promise<DeleteResult> {
    try {
      await this.getIndexWithNamespace().delete(ids);

      return {
        success: true,
        deletedCount: ids.length,
        deletedIds: ids,
      };
    } catch (error) {
      return {
        success: false,
        deletedCount: 0,
        deletedIds: [],
        errors: ids.map(id => ({ id, error: String(error) })),
      };
    }
  }

  async fetch(ids: string[]): Promise<VectorRecord[]> {
    const result = await this.getIndexWithNamespace().fetch(ids, {
      includeMetadata: true,
      includeVectors: true,
      includeData: true,
    });

    return (
      result?.map((item: any) => ({
        id: item.id,
        values: item.vector ?? [],
        metadata: item.metadata,
        data: item.data,
      })) ?? []
    );
  }

  async describe(): Promise<VectorDBStats> {
    try {
      if (!this.index) {
        throw new Error('Vector index not initialized - credentials missing or invalid');
      }
      const info = await this.index.info();
      return {
        dimension: info.dimension,
        totalVectorCount: info.vectorCount,
      };
    } catch {
      return {
        dimension: 0,
        totalVectorCount: 0,
      };
    }
  }

  // Additional methods that are used by the tools but not in the base interface

  async range(
    options: {
      cursor?: string;
      limit?: number;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
    } = {},
  ): Promise<{
    nextCursor: string;
    vectors: VectorRecord[];
  }> {
    const result = await this.getIndexWithNamespace().range({
      cursor: options.cursor || '',
      limit: options.limit ?? 100,
      includeMetadata: options.includeMetadata ?? true,
      includeVectors: options.includeVectors ?? false,
      includeData: options.includeData ?? false,
    });

    return {
      nextCursor: result.nextCursor,
      vectors:
        result.vectors?.map((item: any) => ({
          id: item.id,
          values: item.vector ?? [],
          metadata: item.metadata,
          data: item.data,
        })) ?? [],
    };
  }

  async listNamespaces(): Promise<string[]> {
    try {
      if (!this.index) {
        throw new Error('Vector index not initialized - credentials missing or invalid');
      }
      return await this.index.listNamespaces();
    } catch {
      return [];
    }
  }

  async deleteNamespace(namespace: string): Promise<boolean> {
    try {
      if (!this.index) {
        throw new Error('Vector index not initialized - credentials missing or invalid');
      }
      await this.index.deleteNamespace(namespace);
      return true;
    } catch {
      return false;
    }
  }

  async update(
    id: string,
    updates: {
      vector?: number[];
      metadata?: Record<string, any>;
      data?: string;
      metadataUpdateMode?: 'PATCH' | 'OVERWRITE';
    },
  ): Promise<boolean> {
    try {
      const updatePayload: any = { id };

      if (updates.vector) {
        updatePayload.vector = updates.vector;
      }

      if (updates.metadata) {
        updatePayload.metadata = updates.metadata;
      }

      if (updates.data) {
        updatePayload.data = updates.data;
      }

      if (updates.metadataUpdateMode) {
        updatePayload.metadataUpdateMode = updates.metadataUpdateMode;
      }

      await this.getIndexWithNamespace().update(updatePayload);
      return true;
    } catch {
      return false;
    }
  }

  async reset(options?: { all?: boolean }): Promise<boolean> {
    try {
      if (!this.index) {
        throw new Error('Vector index not initialized - credentials missing or invalid');
      }
      if (options?.all) {
        await this.index.reset({ all: true });
      } else {
        await this.getIndexWithNamespace().reset();
      }
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Upstash Vector DB instance
 */
export function createUpstashVectorDB(config?: Partial<VectorDBConfig>): UpstashVectorDB | null {
  const url = config?.url ?? process.env.UPSTASH_VECTOR_REST_URL;
  const token = config?.token ?? process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    logWarn('UpstashVectorDB missing URL or token', {
      operation: 'upstash_vector_db_creation',
      hasUrl: !!url,
      hasToken: !!token,
    });
    return null;
  }

  const finalConfig: VectorDBConfig = {
    url,
    token,
    namespace: config?.namespace ?? process.env.UPSTASH_VECTOR_NAMESPACE,
  };

  return new UpstashVectorDB(finalConfig);
}
