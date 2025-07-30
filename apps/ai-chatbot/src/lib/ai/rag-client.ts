'use server';

import { logError } from '@repo/observability';

/**
 * Simplified RAG client that works around import issues
 */

export async function createRAGClient(config: {
  vectorUrl: string;
  vectorToken: string;
  namespace?: string;
}) {
  try {
    // Use dynamic import to avoid module resolution issues during build
    const [vectorModule, aiModule] = await Promise.all([import('@upstash/vector'), import('ai')]);

    const { Index } = vectorModule;
    const { embed, embedMany } = aiModule;

    const index = new Index({
      url: config.vectorUrl,
      token: config.vectorToken,
    });

    const ns = config.namespace ? index.namespace(config.namespace) : index;

    return {
      async upsert(data: Array<{ id: string; content: string; metadata?: any }>) {
        // Generate embeddings - simplified version
        const { embeddings } = await embedMany({
          model: 'text-embedding-3-small' as any,
          values: data.map(item => item.content),
        });

        const vectorData = data.map((item, i) => ({
          id: item.id,
          vector: embeddings[i],
          metadata: {
            ...item.metadata,
            content: item.content,
            timestamp: new Date().toISOString(),
          },
        }));

        await ns.upsert(vectorData);
        return { success: true, count: vectorData.length, ids: vectorData.map(v => v.id) };
      },

      async query(queryText: string, options: { topK?: number } = {}) {
        const { embedding } = await embed({
          model: 'text-embedding-3-small' as any,
          value: queryText,
        });

        const results = await ns.query({
          vector: embedding,
          topK: options.topK || 5,
          includeMetadata: true,
        });

        return results.map((result: any) => ({
          id: String(result.id),
          score: result.score || 0,
          content: String(result.metadata?.content || ''),
          metadata: result.metadata,
        }));
      },

      async delete(ids: string[]) {
        await ns.delete(ids);
        return { success: true };
      },
    };
  } catch (error) {
    logError('Failed to create RAG client', error);
    throw error;
  }
}
