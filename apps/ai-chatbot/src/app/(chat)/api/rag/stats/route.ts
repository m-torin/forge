import { auth } from '#/app/(auth)/auth';
import { db } from '#/lib/db';
import { ragDocument, ragQuery } from '#/lib/db/schema';
import { shouldUseMockRAG } from '#/lib/mock-data';
import { logError } from '@repo/observability';
import { count, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle demo mode
    if (shouldUseMockRAG()) {
      return NextResponse.json({
        totalDocuments: 47,
        userDocuments: 12,
        totalQueries: 234,
        userQueries: 89,
        avgRelevanceScore: 0.82,
        topCategories: [
          { category: 'technical', count: 18 },
          { category: 'product', count: 15 },
          { category: 'support', count: 14 },
        ],
        recentActivity: [
          {
            type: 'document_added',
            title: 'API Documentation',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          },
          {
            type: 'query_executed',
            query: 'How to implement authentication?',
            resultsCount: 5,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          },
        ],
        lastUpdated: new Date().toISOString(),
      });
    }

    const userId = session.user.id;

    // Get document statistics
    const documentStats = await db
      .select({
        total: count(ragDocument.id),
      })
      .from(ragDocument);

    const userDocumentStats = await db
      .select({
        count: count(ragDocument.id),
      })
      .from(ragDocument)
      .where(eq(ragDocument.userId, userId));

    // Get query statistics
    const queryStats = await db
      .select({
        total: count(ragQuery.id),
      })
      .from(ragQuery);

    const userQueryStats = await db
      .select({
        count: count(ragQuery.id),
      })
      .from(ragQuery)
      .where(eq(ragQuery.userId, userId));

    // Get category distribution
    const categoryStats = await db
      .select({
        category: ragDocument.metadata,
        count: count(ragDocument.id),
      })
      .from(ragDocument)
      .where(eq(ragDocument.userId, userId))
      .groupBy(ragDocument.metadata)
      .limit(10);

    // Get recent queries
    const recentQueries = await db
      .select({
        query: ragQuery.query,
        results: ragQuery.results,
        createdAt: ragQuery.createdAt,
      })
      .from(ragQuery)
      .where(eq(ragQuery.userId, userId))
      .orderBy(desc(ragQuery.createdAt))
      .limit(5);

    // Get recent documents
    const recentDocuments = await db
      .select({
        title: ragDocument.title,
        createdAt: ragDocument.createdAt,
      })
      .from(ragDocument)
      .where(eq(ragDocument.userId, userId))
      .orderBy(desc(ragDocument.createdAt))
      .limit(5);

    // Calculate average relevance score from recent queries
    const relevanceScores = recentQueries.flatMap(q => {
      if (!q.results) return [];
      try {
        const resultsString = Array.isArray(q.results)
          ? JSON.stringify(q.results)
          : (q.results as string);
        const parsed = JSON.parse(resultsString);
        return Array.isArray(parsed)
          ? parsed.map((r: any) => r.score).filter((s): s is number => typeof s === 'number')
          : [];
      } catch {
        return [];
      }
    });

    const avgRelevanceScore =
      relevanceScores.length > 0
        ? relevanceScores.reduce((a, b) => a + b) / relevanceScores.length
        : 0;

    // Build recent activity
    const recentActivity = [
      ...recentDocuments.map(doc => ({
        type: 'document_added' as const,
        title: doc.title,
        timestamp: doc.createdAt.toISOString(),
      })),
      ...recentQueries.map(query => ({
        type: 'query_executed' as const,
        query: query.query,
        resultsCount: (() => {
          if (!query.results) return 0;
          try {
            const resultsString = Array.isArray(query.results)
              ? JSON.stringify(query.results)
              : (query.results as string);
            const parsed = JSON.parse(resultsString);
            return Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            return 0;
          }
        })(),
        timestamp: query.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({
      totalDocuments: documentStats[0]?.total || 0,
      userDocuments: userDocumentStats[0]?.count || 0,
      totalQueries: queryStats[0]?.total || 0,
      userQueries: userQueryStats[0]?.count || 0,
      avgRelevanceScore: Math.round(avgRelevanceScore * 100) / 100,
      topCategories: categoryStats.map(stat => {
        // Extract category from metadata
        const metadata = stat.category as any;
        const category = metadata?.category || 'uncategorized';
        return { category, count: stat.count };
      }),
      recentActivity,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    await logError('Error fetching RAG stats', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
