import { auth } from '#/app/(auth)/auth';
import { createComprehensiveRAGClient } from '#/lib/ai/rag-client';
import { createRAGConfigForUser } from '#/lib/ai/rag-config';
import { getRAGCapabilityLevel, isRAGEnabled } from '#/lib/ai/tools/rag/rag-tools';
import { mockRAGKnowledgeBase, shouldUseMockRAG } from '#/lib/mock-data';
import { logError, logInfo } from '@repo/observability';
import { NextResponse } from 'next/server';
import { z } from 'zod/v4';

const SearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  topK: z.number().min(1).max(50).default(10),
  namespace: z.string().optional(),
  // Enhanced search options
  searchMode: z.enum(['basic', 'hybrid', 'enhanced']).default('hybrid'),
  searchStrategy: z.enum(['balanced', 'semantic', 'precise', 'comprehensive']).default('balanced'),
  threshold: z.number().min(0).max(1).default(0.7),
  includeMetadata: z.boolean().default(true),
  contextWindow: z.number().optional(),
  boostFields: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  customWeights: z
    .object({
      vector: z.number().min(0).max(1),
      keyword: z.number().min(0).max(1),
    })
    .optional(),
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

    const {
      query,
      topK,
      namespace,
      searchMode,
      searchStrategy,
      threshold,
      includeMetadata,
      contextWindow,
      boostFields,
      filters,
      customWeights,
    } = validationResult.data;

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

    // Enhanced mode: comprehensive RAG search
    if (!isRAGEnabled()) {
      return NextResponse.json({ error: 'RAG is not configured' }, { status: 500 });
    }

    try {
      const capabilityLevel = getRAGCapabilityLevel();

      logInfo('Enhanced RAG search request', {
        operation: 'enhanced_rag_search',
        userId: session.user.id,
        searchMode,
        searchStrategy,
        capabilityLevel,
        query: query.substring(0, 100),
      });

      // Create comprehensive RAG client with user configuration
      const ragConfig = await createRAGConfigForUser(session.user.id, searchStrategy as any);
      const ragClient = await createComprehensiveRAGClient(ragConfig);

      let results: any[] = [];
      let searchMetadata: any = {
        searchMode,
        searchStrategy,
        capabilityLevel,
        query,
        timestamp: new Date().toISOString(),
      };

      // Execute search based on mode
      switch (searchMode) {
        case 'basic':
          // Legacy vector-only search
          results = await ragClient.query(query, { topK });
          searchMetadata.method = 'vector_only';
          break;

        case 'hybrid':
          // Hybrid vector + keyword search
          const hybridResults = await ragClient.hybridQuery(query, {
            topK,
            boostFields,
            filters,
            customWeights,
          });

          results = hybridResults.map((result: any) => ({
            id: result.id,
            content: result.content,
            score: result.hybridScore,
            vectorScore: result.vectorScore,
            keywordScore: result.keywordScore,
            keywordMatches: result.keywordMatches,
            rank: result.rank,
            rankingMethod: result.rankingMethod,
            metadata: result.metadata,
          }));

          searchMetadata.method = 'hybrid';
          searchMetadata.fusionDetails = {
            vectorResults: hybridResults.filter((r: any) => r.vectorScore > 0).length,
            keywordResults: hybridResults.filter((r: any) => r.keywordScore > 0).length,
            hybridResults: hybridResults.filter((r: any) => r.rankingMethod === 'hybrid').length,
          };
          break;

        case 'enhanced':
          // Enhanced search with context processing
          const enhancedResults = await ragClient.enhancedSearch(query, {
            topK,
            threshold,
            includeMetadata,
            contextWindow,
          });

          results = enhancedResults.map((result: any) => ({
            id: result.id || `enhanced_${Date.now()}_${Math.random()}`,
            content: result.content,
            score: result.score,
            metadata: result.metadata,
            source: result.source,
            contextLength: result.content?.length || 0,
            relevanceFactors: result.relevanceFactors,
          }));

          searchMetadata.method = 'enhanced';
          searchMetadata.enhancementFeatures = {
            sourceTracking: results.some(r => r.source),
            contextProcessing: !!contextWindow,
            metadataEnrichment: includeMetadata,
          };
          break;

        default:
          throw new Error(`Unsupported search mode: ${searchMode}`);
      }

      // Filter by threshold if specified
      if (threshold > 0) {
        results = results.filter((result: any) => result.score >= threshold);
      }

      // Apply final topK limit
      results = results.slice(0, topK);

      logInfo('Enhanced RAG search completed', {
        operation: 'enhanced_rag_search_completed',
        userId: session.user.id,
        resultsCount: results.length,
        searchMode,
        averageScore:
          results.length > 0
            ? results.reduce((sum: number, r: any) => sum + r.score, 0) / results.length
            : 0,
      });

      return NextResponse.json({
        results,
        mode: 'enhanced',
        searchMetadata,
        resultsCount: results.length,
        performance: {
          capabilityLevel,
          searchLatency: Date.now() - new Date(searchMetadata.timestamp).getTime(),
        },
      });
    } catch (vectorError) {
      await logError('Enhanced search failed', {
        error: vectorError,
        userId: session.user.id,
        searchMode,
        query: query.substring(0, 100),
      });

      return NextResponse.json(
        {
          error: 'Enhanced search failed',
          details: vectorError instanceof Error ? vectorError.message : 'Unknown error',
          fallbackAvailable: true,
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
