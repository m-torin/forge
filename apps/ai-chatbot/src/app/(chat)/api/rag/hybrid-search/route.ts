import { auth } from '#/app/(auth)/auth';
import { createComprehensiveRAGClient } from '#/lib/ai/rag-client';
import { createRAGConfigForUser } from '#/lib/ai/rag-config';
import { getRAGCapabilityLevel, isRAGEnabled } from '#/lib/ai/tools/rag/rag-tools';
import { mockRAGKnowledgeBase, shouldUseMockRAG } from '#/lib/mock-data';
import type { HybridSearchResult } from '@repo/ai/server/rag/hybrid-search';
import { logError, logInfo } from '@repo/observability';
import { NextResponse } from 'next/server';
import { z } from 'zod/v4';

const HybridSearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  topK: z.number().min(1).max(50).default(10),
  namespace: z.string().optional(),

  // Hybrid search specific options
  fusionMethod: z.enum(['rrf', 'weighted', 'max', 'product']).default('rrf'),
  vectorWeight: z.number().min(0).max(1).default(0.7),
  keywordWeight: z.number().min(0).max(1).default(0.3),

  // Search parameters
  vectorTopK: z.number().min(1).max(100).default(20),
  keywordTopK: z.number().min(1).max(100).default(20),
  vectorThreshold: z.number().min(0).max(1).default(0.0),
  keywordThreshold: z.number().min(0).max(1).default(0.0),

  // Boost and filtering options
  boostFields: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  titleBoost: z.number().min(1).max(3).default(1.5),
  phraseBoost: z.number().min(1).max(3).default(1.2),
  recencyBoost: z.boolean().default(false),
  lengthPenalty: z.boolean().default(false),

  // Advanced options
  caseSensitive: z.boolean().default(false),
  stemming: z.boolean().default(true),
  fuzzyMatch: z.boolean().default(false),

  // Response options
  includeScoreBreakdown: z.boolean().default(true),
  includeKeywordMatches: z.boolean().default(true),
  includeMetadata: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = HybridSearchSchema.safeParse(body);

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
      fusionMethod,
      vectorWeight,
      keywordWeight,
      vectorTopK,
      keywordTopK,
      vectorThreshold,
      keywordThreshold,
      boostFields,
      filters,
      titleBoost,
      phraseBoost,
      recencyBoost,
      lengthPenalty,
      caseSensitive,
      stemming,
      fuzzyMatch,
      includeScoreBreakdown,
      includeKeywordMatches,
      includeMetadata,
    } = validationResult.data;

    // Validate weights sum to 1.0
    if (Math.abs(vectorWeight + keywordWeight - 1.0) > 0.01) {
      return NextResponse.json(
        {
          error: 'Invalid weights',
          details: 'Vector weight and keyword weight must sum to 1.0',
        },
        { status: 400 },
      );
    }

    // Handle mock mode
    if (shouldUseMockRAG()) {
      const mockResults = mockRAGKnowledgeBase.search(query, topK);
      const hybridMockResults = mockResults.map((result: any, index: number) => ({
        id: result.id || `mock_${index}`,
        content: result.content,
        metadata: result.metadata,
        vectorScore: Math.random() * 0.4 + 0.6,
        keywordScore: Math.random() * 0.4 + 0.5,
        hybridScore: Math.random() * 0.4 + 0.7,
        keywordMatches: query
          .toLowerCase()
          .split(' ')
          .filter(word => result.content.toLowerCase().includes(word)),
        vectorSimilarity: Math.random() * 0.4 + 0.6,
        rank: index + 1,
        rankingMethod: 'hybrid' as const,
      }));

      return NextResponse.json({
        results: hybridMockResults,
        mode: 'mock',
        searchConfig: {
          fusionMethod,
          vectorWeight,
          keywordWeight,
          query,
        },
        performance: {
          searchLatency: Math.random() * 200 + 300,
          vectorResults: Math.floor(topK * 0.8),
          keywordResults: Math.floor(topK * 0.6),
          fusedResults: hybridMockResults.length,
        },
        resultsCount: hybridMockResults.length,
      });
    }

    // Enhanced hybrid search mode
    if (!isRAGEnabled()) {
      return NextResponse.json({ error: 'RAG is not configured' }, { status: 500 });
    }

    try {
      const capabilityLevel = getRAGCapabilityLevel();
      const startTime = Date.now();

      logInfo('Hybrid search request', {
        operation: 'hybrid_search',
        userId: session.user.id,
        fusionMethod,
        vectorWeight,
        keywordWeight,
        capabilityLevel,
        query: query.substring(0, 100),
      });

      // Create comprehensive RAG client with hybrid search configuration
      const ragConfig = await createRAGConfigForUser(session.user.id);

      // Override hybrid search config with request parameters
      ragConfig.hybridSearchConfig = {
        vectorWeight,
        keywordWeight,
        vectorTopK,
        keywordTopK,
        finalTopK: topK,
        vectorThreshold,
        keywordThreshold,
        fusionMethod,
        phraseBoost,
        titleBoost,
        recencyBoost,
        lengthPenalty,
        caseSensitive,
        stemming,
        fuzzyMatch,
      };

      const ragClient = await createComprehensiveRAGClient(ragConfig);

      // Execute hybrid search with custom weights
      const hybridResults = await ragClient.hybridQuery(query, {
        topK,
        boostFields,
        filters,
        customWeights: {
          vector: vectorWeight,
          keyword: keywordWeight,
        },
      });

      // Format results based on response options
      const formattedResults = hybridResults.map((result: HybridSearchResult) => {
        const formattedResult: any = {
          id: result.id,
          content: result.content,
          rank: result.rank,
          rankingMethod: result.rankingMethod,
        };

        if (includeScoreBreakdown) {
          formattedResult.vectorScore = result.vectorScore;
          formattedResult.keywordScore = result.keywordScore;
          formattedResult.hybridScore = result.hybridScore;
          formattedResult.vectorSimilarity = result.vectorSimilarity;
        } else {
          formattedResult.score = result.hybridScore;
        }

        if (includeKeywordMatches) {
          formattedResult.keywordMatches = result.keywordMatches;
        }

        if (includeMetadata && result.metadata) {
          formattedResult.metadata = result.metadata;
        }

        return formattedResult;
      });

      const searchLatency = Date.now() - startTime;

      // Analyze search performance
      const vectorOnlyResults = formattedResults.filter(r => r.rankingMethod === 'vector').length;
      const keywordOnlyResults = formattedResults.filter(r => r.rankingMethod === 'keyword').length;
      const hybridFusedResults = formattedResults.filter(r => r.rankingMethod === 'hybrid').length;

      logInfo('Hybrid search completed', {
        operation: 'hybrid_search_completed',
        userId: session.user.id,
        resultsCount: formattedResults.length,
        searchLatency,
        fusionBreakdown: {
          vectorOnly: vectorOnlyResults,
          keywordOnly: keywordOnlyResults,
          hybrid: hybridFusedResults,
        },
      });

      return NextResponse.json({
        results: formattedResults,
        mode: 'hybrid',
        searchConfig: {
          fusionMethod,
          vectorWeight,
          keywordWeight,
          vectorTopK,
          keywordTopK,
          finalTopK: topK,
          thresholds: {
            vector: vectorThreshold,
            keyword: keywordThreshold,
          },
          boosts: {
            title: titleBoost,
            phrase: phraseBoost,
            recency: recencyBoost,
          },
          options: {
            caseSensitive,
            stemming,
            fuzzyMatch,
            lengthPenalty,
          },
        },
        performance: {
          searchLatency,
          capabilityLevel,
          vectorResults: vectorOnlyResults + hybridFusedResults,
          keywordResults: keywordOnlyResults + hybridFusedResults,
          fusedResults: hybridFusedResults,
          averageScore:
            formattedResults.length > 0
              ? formattedResults.reduce(
                  (sum: number, r: any) => sum + (r.hybridScore || r.score),
                  0,
                ) / formattedResults.length
              : 0,
        },
        resultsCount: formattedResults.length,
        query,
        timestamp: new Date().toISOString(),
      });
    } catch (hybridError) {
      await logError('Hybrid search failed', {
        error: hybridError,
        userId: session.user.id,
        fusionMethod,
        query: query.substring(0, 100),
      });

      return NextResponse.json(
        {
          error: 'Hybrid search failed',
          details: hybridError instanceof Error ? hybridError.message : 'Unknown error',
          fallbackSuggestion: 'Try using basic search mode or adjust search parameters',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    await logError('Hybrid search API error', { error });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET endpoint for hybrid search configuration info
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isRAGEnabled()) {
      return NextResponse.json({ error: 'RAG is not configured' }, { status: 500 });
    }

    const capabilityLevel = getRAGCapabilityLevel();

    return NextResponse.json({
      available: true,
      capabilityLevel,
      supportedFusionMethods: ['rrf', 'weighted', 'max', 'product'],
      defaultConfig: {
        fusionMethod: 'rrf',
        vectorWeight: 0.7,
        keywordWeight: 0.3,
        vectorTopK: 20,
        keywordTopK: 20,
        finalTopK: 10,
        titleBoost: 1.5,
        phraseBoost: 1.2,
      },
      features: {
        scoreBreakdown: true,
        keywordMatching: true,
        fuzzySearch: capabilityLevel === 'comprehensive',
        recencyBoost: true,
        fieldBoosting: true,
        customFilters: true,
      },
      limits: {
        maxTopK: 50,
        maxVectorTopK: 100,
        maxKeywordTopK: 100,
        maxQueryLength: 1000,
      },
    });
  } catch (error) {
    await logError('Hybrid search config API error', { error });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
