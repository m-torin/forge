import { auth } from '#/app/(auth)/auth';
import { isRAGEnabled } from '#/lib/ai/tools/rag/rag-tools';
import { mockRAGKnowledgeBase, shouldUseMockRAG } from '#/lib/mock-data';
import { logError } from '@repo/observability';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const SearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  topK: z.number().min(1).max(20).default(5),
  namespace: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = SearchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { query, topK, namespace } = validationResult.data;

    // Handle mock mode
    if (shouldUseMockRAG()) {
      const results = mockRAGKnowledgeBase.search(query, topK);
      return NextResponse.json({
        results,
        mode: 'mock',
        query,
        resultsCount: results.length,
      });
    }

    // Real mode: query vector database
    if (!isRAGEnabled()) {
      return NextResponse.json({ error: 'RAG is not configured' }, { status: 500 });
    }

    try {
      const { createRAGClient } = await import('#/lib/ai/rag-client');
      const { env } = await import('#/root/env');

      const vectorClient = await createRAGClient({
        vectorUrl: env.UPSTASH_VECTOR_REST_URL || '',
        vectorToken: env.UPSTASH_VECTOR_REST_TOKEN || '',
        namespace: namespace || `user_${session.user.id}`,
      });

      // Query with embedding
      const results = await vectorClient.query(query, { topK });

      // Format results
      const formattedResults = results.map((result: any) => ({
        content: result.metadata?.content || '',
        score: result.score,
        metadata: {
          documentId: result.metadata?.documentId,
          documentTitle: result.metadata?.documentTitle,
          chunkIndex: result.metadata?.chunkIndex,
          category: result.metadata?.category,
          tags: result.metadata?.tags || [],
          ...result.metadata,
        },
      }));

      return NextResponse.json({
        results: formattedResults,
        mode: 'real',
        query,
        resultsCount: formattedResults.length,
      });
    } catch (vectorError) {
      await logError('Vector search failed', { error: vectorError });
      return NextResponse.json(
        {
          error: 'Search failed',
          details: vectorError instanceof Error ? vectorError.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    await logError('Search API error', { error });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
