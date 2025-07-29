/**
 * Next.js server-side Upstash Vector functionality
 * This provides Next.js-specific Vector features with server-only imports
 */

import 'server-only';

// Next.js specific server functionality
import type { FetchResult, QueryResult } from '@upstash/vector';
import { headers } from 'next/headers';
import { cache } from 'react';
import { upstash, upstashVectorClientSingleton } from './server';

// Use centralized observability logger
import { logError } from '@repo/observability';

type Dict = Record<string, unknown>;

// Re-export all base server functionality
export * from './server';

// Cached Vector operations for React Server Components
export const getCachedVectorQuery = cache(
  async (
    vector: number[],
    options?: {
      topK?: number;
      filter?: string;
      namespace?: string;
    },
  ): Promise<QueryResult<Dict>[]> => {
    const ns = upstash.namespace(options?.namespace || '');
    return await ns.query({
      vector,
      topK: options?.topK || 10,
      filter: options?.filter,
      includeVectors: true,
      includeMetadata: true,
      includeData: true,
    });
  },
);

export const getCachedVectorInfo = cache(async () => {
  return await upstash.info();
});

export const getCachedVectorFetch = cache(
  async (
    ids: string | string[],
    options?: {
      namespace?: string;
    },
  ): Promise<FetchResult<Dict>[]> => {
    const fetchIds = Array.isArray(ids) ? ids : [ids];
    const ns = upstash.namespace(options?.namespace || '');
    return await ns.fetch(fetchIds, {
      includeVectors: true,
      includeMetadata: true,
      includeData: true,
    });
  },
);

/**
 * Next.js-specific Vector utilities
 */
export async function getVectorWithHeaders(): Promise<{
  vector: any;
  headers: {
    userAgent: string;
    ip: string;
  };
}> {
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || 'unknown';
  const ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || 'unknown';

  return {
    vector: upstashVectorClientSingleton(),
    headers: {
      userAgent,
      ip,
    },
  };
}

/**
 * Semantic search utilities for Next.js
 */
export async function semanticSearch<_T>(
  query: string,
  options?: {
    topK?: number;
    filter?: string;
    namespace?: string;
    threshold?: number;
  },
): Promise<
  Array<{
    id: string | number;
    score: number;
    data?: string;
    metadata?: Dict;
  }>
> {
  const ns = upstash.namespace(options?.namespace || '');
  const response = await ns.query({
    data: query,
    topK: options?.topK || 10,
    filter: options?.filter,
    includeData: true,
    includeMetadata: true,
  });

  if (!response || response.length === 0) {
    return [];
  }

  let results = response;

  // Filter by threshold if provided
  if (options?.threshold !== undefined) {
    const threshold = options.threshold;
    results = results.filter((match: QueryResult<Dict>) => match.score >= threshold);
  }

  return results.map((match: QueryResult<Dict>) => ({
    id: match.id,
    score: match.score,
    data: match.data,
    metadata: match.metadata,
  }));
}

/**
 * Content similarity utilities for Next.js
 */
export async function findSimilarContent(
  contentId: string,
  options?: {
    topK?: number;
    threshold?: number;
    namespace?: string;
  },
): Promise<
  Array<{
    id: string | number;
    score: number;
    metadata?: Dict;
  }>
> {
  // First fetch the reference vector
  const referenceVector = await getCachedVectorFetch(contentId, {
    namespace: options?.namespace,
  });

  if (!referenceVector || !referenceVector[0]?.vector) {
    throw new Error(`Content ${contentId} not found`);
  }

  const vector = referenceVector[0].vector;

  // Query for similar vectors
  const response = await getCachedVectorQuery(vector, {
    topK: options?.topK || 10,
    namespace: options?.namespace,
  });

  if (!response || response.length === 0) {
    return [];
  }

  // Filter by threshold and exclude the reference vector itself
  let results = response.filter((match: QueryResult<Dict>) => match.id !== contentId);

  if (options?.threshold !== undefined) {
    const threshold = options.threshold;
    results = results.filter((match: QueryResult<Dict>) => match.score >= threshold);
  }

  return results.map((match: QueryResult<Dict>) => ({
    id: match.id,
    score: match.score,
    metadata: match.metadata,
  }));
}

/**
 * User preference vector utilities
 */
export async function getUserVectorPreferences(
  userId: string,
  namespace = 'user_preferences',
): Promise<{
  id: string;
  vector?: number[];
  metadata?: Dict;
} | null> {
  const response = await getCachedVectorFetch(`user:${userId}`, { namespace });

  if (!response || !response[0]) {
    return null;
  }

  const userVector = response[0];
  return {
    id: `user:${userId}`,
    vector: userVector.vector,
    metadata: userVector.metadata,
  };
}

export async function updateUserVectorPreferences(
  userId: string,
  preferences: {
    vector?: number[];
    metadata?: Dict;
  },
  namespace = 'user_preferences',
): Promise<void> {
  const ns = upstash.namespace(namespace);
  await ns.upsert([
    {
      id: `user:${userId}`,
      vector: preferences.vector,
      metadata: {
        ...preferences.metadata,
        userId,
        updatedAt: new Date().toISOString(),
      },
    } as any,
  ]);
}

/**
 * Content recommendation utilities
 */
export async function getPersonalizedRecommendations(
  userId: string,
  options?: {
    topK?: number;
    contentNamespace?: string;
    userNamespace?: string;
    threshold?: number;
  },
): Promise<
  Array<{
    id: string | number;
    score: number;
    metadata?: Dict;
  }>
> {
  // Get user preference vector
  const userPrefs = await getUserVectorPreferences(
    userId,
    options?.userNamespace || 'user_preferences',
  );

  if (!userPrefs?.vector) {
    return [];
  }

  // Query content based on user preferences
  const response = await getCachedVectorQuery(userPrefs.vector, {
    topK: options?.topK || 20,
    namespace: options?.contentNamespace || 'content',
  });

  if (!response || response.length === 0) {
    return [];
  }

  let results = response;

  // Filter by threshold if provided
  if (options?.threshold !== undefined) {
    const threshold = options.threshold;
    results = results.filter((match: QueryResult<Dict>) => match.score >= threshold);
  }

  return results.map((match: QueryResult<Dict>) => ({
    id: match.id,
    score: match.score,
    metadata: match.metadata,
  }));
}

/**
 * Vector analytics utilities for Next.js
 */
export async function recordVectorInteraction(
  userId: string,
  vectorId: string,
  interactionType: 'view' | 'like' | 'share' | 'click',
  metadata?: Dict,
): Promise<void> {
  const interactionData = {
    userId,
    vectorId,
    interactionType,
    timestamp: new Date().toISOString(),
    userAgent: (await headers()).get('user-agent') || 'unknown',
    ...metadata,
  };

  // Store interaction for analytics
  const ns = upstash.namespace('interactions');
  await ns.upsert([
    {
      id: `interaction:${userId}:${vectorId}:${Date.now()}`,
      data: JSON.stringify(interactionData),
      metadata: interactionData,
    } as any,
  ]);
}

export async function getVectorAnalytics(
  vectorId: string,
  timeframe = '7d',
): Promise<{
  totalInteractions: number;
  uniqueUsers: number;
  interactionsByType: Record<string, number>;
}> {
  const startDate = new Date();
  const days = timeframe.endsWith('d') ? parseInt(timeframe) : 7;
  startDate.setDate(startDate.getDate() - days);

  // Query interactions for this vector
  const ns = upstash.namespace('interactions');
  const response = await ns.query({
    filter: `vectorId='${vectorId}' AND timestamp >= '${startDate.toISOString()}'`,
    topK: 1000,
    includeMetadata: true,
  } as any);

  if (!response || response.length === 0) {
    return {
      totalInteractions: 0,
      uniqueUsers: 0,
      interactionsByType: {},
    };
  }

  const interactions = response;
  const uniqueUsers = new Set(
    interactions.map((match: QueryResult<Dict>) => match.metadata?.userId).filter(Boolean),
  ).size;

  const interactionsByType = interactions.reduce(
    (acc: Record<string, number>, match: QueryResult<Dict>) => {
      const type = (match.metadata?.interactionType || 'unknown') as string;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalInteractions: interactions.length,
    uniqueUsers,
    interactionsByType,
  };
}

/**
 * Vector clustering utilities for Next.js
 */
export async function clusterVectors(
  namespace: string,
  options?: {
    numClusters?: number;
    sampleSize?: number;
  },
): Promise<
  Array<{
    clusterId: string;
    centroid: number[];
    memberIds: string[];
    size: number;
  }>
> {
  // This is a simplified clustering implementation
  // In production, you'd want to use more sophisticated clustering algorithms

  const _sampleSize = options?.sampleSize || 1000;
  const numClusters = options?.numClusters || 10;

  // Get sample vectors
  const info = await getCachedVectorInfo();
  const totalVectors = info.vectorCount || 0;

  if (totalVectors === 0) {
    return [];
  }

  // Simple k-means-like clustering (simplified)
  // In practice, you'd implement proper k-means or use a clustering service
  const clusters: Array<{
    clusterId: string;
    centroid: number[];
    memberIds: string[];
    size: number;
  }> = [];

  for (let i = 0; i < numClusters; i++) {
    clusters.push({
      clusterId: `cluster_${i}`,
      centroid: [], // Would be calculated from actual clustering
      memberIds: [], // Would be populated from clustering results
      size: 0,
    });
  }

  return clusters;
}

/**
 * Vector backup and restore utilities
 */
export async function backupVectorNamespace(namespace: string): Promise<
  Array<{
    id: string | number;
    vector?: number[];
    metadata?: Dict;
    data?: string;
  }>
> {
  // This would typically be done in batches for large datasets
  const vectors: Array<{
    id: string | number;
    vector?: number[];
    metadata?: Dict;
    data?: string;
  }> = [];

  // In practice, you'd need to implement pagination to get all vectors
  // This is a simplified version
  try {
    const ns = upstash.namespace(namespace);
    const response = await ns.query({
      vector: new Array(384).fill(0), // Dummy query to get vectors
      topK: 10000,
      includeVectors: true,
      includeMetadata: true,
      includeData: true,
    });

    if (response && response.length > 0) {
      vectors.push(
        ...response.map((match: QueryResult<Dict>) => ({
          id: match.id,
          vector: match.vector,
          metadata: match.metadata,
          data: match.data,
        })),
      );
    }
  } catch (error) {
    logError('Backup failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      operation: 'upstash_backup',
    });
  }

  return vectors;
}
