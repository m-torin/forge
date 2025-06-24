// @ts-ignore - Package may not be installed yet
import { Index } from '@upstash/vector';
import type {
  VectorDB,
  VectorDBConfig,
  VectorRecord,
  VectorSearchOptions,
  VectorSearchResult,
} from './types';

export class UpstashVectorDB implements VectorDB {
  private index: Index;
  private namespace?: string;

  constructor(config: VectorDBConfig) {
    this.index = new Index({
      url: config.url,
      token: config.token,
    });
    this.namespace = config.namespace;
  }

  async upsert(records: VectorRecord[]): Promise<void> {
    const formattedRecords = records.map((record) => ({
      id: record.id,
      vector: record.values,
      metadata: record.metadata,
    }));

    if (this.namespace) {
      await this.index.namespace(this.namespace).upsert(formattedRecords);
    } else {
      await this.index.upsert(formattedRecords);
    }
  }

  async query(vector: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    const queryOptions = {
      topK: options.topK ?? 10,
      includeValues: options.includeValues ?? false,
      includeMetadata: options.includeMetadata ?? true,
      filter: options.filter,
    };

    let result;
    if (this.namespace) {
      result = await this.index.namespace(this.namespace).query({
        vector,
        ...queryOptions,
      });
    } else {
      result = await this.index.query({
        vector,
        ...queryOptions,
      });
    }

    return (
      result.matches?.map((match: any) => ({
        id: match.id,
        score: match.score ?? 0,
        values: match.vector,
        metadata: match.metadata,
      })) ?? []
    );
  }

  async delete(ids: string[]): Promise<void> {
    if (this.namespace) {
      await this.index.namespace(this.namespace).deleteMany(ids);
    } else {
      await this.index.deleteMany(ids);
    }
  }

  async fetch(ids: string[]): Promise<VectorRecord[]> {
    let result;
    if (this.namespace) {
      result = await this.index.namespace(this.namespace).fetch(ids);
    } else {
      result = await this.index.fetch(ids);
    }

    return Object.entries(result.vectors ?? {}).map(([id, vector]: [string, any]) => ({
      id,
      values: (vector as any).vector ?? [],
      metadata: (vector as any).metadata,
    }));
  }

  async describe(): Promise<{ dimension: number; totalVectorCount: number }> {
    let stats;
    if (this.namespace) {
      stats = await this.index.namespace(this.namespace).describeIndexStats();
    } else {
      stats = await this.index.describeIndexStats();
    }

    return {
      dimension: stats.dimension ?? 0,
      totalVectorCount: stats.totalVectorCount ?? 0,
    };
  }
}

/**
 * Create Upstash Vector DB instance
 */
export function createUpstashVectorDB(config?: Partial<VectorDBConfig>): UpstashVectorDB | null {
  const url = config?.url ?? process.env.UPSTASH_VECTOR_REST_URL;
  const token = config?.token ?? process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    // eslint-disable-next-line no-console
    console.warn('[UpstashVectorDB] Missing URL or token');
    return null;
  }

  const finalConfig: VectorDBConfig = {
    url,
    token,
    namespace: config?.namespace ?? process.env.UPSTASH_VECTOR_NAMESPACE,
  };

  return new UpstashVectorDB(finalConfig);
}
