// Redis-based progress tracking for SEO generation workflow
// Enhanced with token usage and cost monitoring

import { SEO_CONFIG, SEO_REDIS_KEYS } from './config';
import { SeoGenerationResult, SeoStrategy } from './types';

// Mock Redis for development - will be replaced with actual Redis implementation
const mockRedis = {
  data: new Map<string, any>(),

  async hset(key: string, data: Record<string, any>) {
    this.data.set(key, { ...this.data.get(key), ...data });
  },

  async hgetall(key: string) {
    return this.data.get(key) || {};
  },

  async hincrby(key: string, field: string, increment: number) {
    const current = this.data.get(key) || {};
    current[field] = (parseInt(current[field] || '0') + increment).toString();
    this.data.set(key, current);
  },

  async expire(_key: string, _seconds: number) {
    // Mock - in real implementation would set TTL
  },

  pipeline() {
    const operations: Array<() => Promise<any>> = [];
    return {
      hset: (key: string, data: Record<string, any>) => {
        operations.push(() => mockRedis.hset(key, data));
        return this;
      },
      hincrby: (key: string, field: string, increment: number) => {
        operations.push(() => mockRedis.hincrby(key, field, increment));
        return this;
      },
      async exec() {
        return Promise.all(operations.map((op) => op()));
      },
    };
  },
};

const redis = mockRedis;

/**
 * Tracks SEO processing progress for individual products
 */
export async function trackSeoProgress(
  productId: string,
  stage: 'started' | 'lmstudio' | 'claude' | 'completed' | 'failed',
  metadata?: {
    strategy?: SeoStrategy;
    tokensUsed?: number;
    confidence?: number;
    error?: string;
  },
): Promise<void> {
  try {
    const progressKey = `${SEO_REDIS_KEYS.seoProgress}:${productId}`;
    const now = new Date().toISOString();

    // Update product-level progress
    const progressData: Record<string, any> = {
      stage,
      lastUpdated: now,
      timestamp: now,
    };

    if (metadata) {
      if (metadata.strategy) progressData.strategy = metadata.strategy;
      if (metadata.tokensUsed) progressData.tokensUsed = metadata.tokensUsed;
      if (metadata.confidence) progressData.confidence = metadata.confidence;
      if (metadata.error) progressData.error = metadata.error;
    }

    await redis.hset(progressKey, progressData);

    // Update global statistics
    const pipeline = redis.pipeline();

    switch (stage) {
      case 'started':
        pipeline.hincrby(SEO_REDIS_KEYS.stats, 'totalStarted', 1);
        break;
      case 'completed':
        pipeline.hincrby(SEO_REDIS_KEYS.stats, 'totalCompleted', 1);
        if (metadata?.tokensUsed) {
          pipeline.hincrby(SEO_REDIS_KEYS.stats, 'totalTokensUsed', metadata.tokensUsed);
        }
        break;
      case 'failed':
        pipeline.hincrby(SEO_REDIS_KEYS.stats, 'totalFailed', 1);
        break;
    }

    pipeline.hset(SEO_REDIS_KEYS.stats, { lastUpdated: now });
    await pipeline.exec();

    // Set TTL for product progress
    await redis.expire(progressKey, SEO_CONFIG.redis.metaTTL);
  } catch (error) {
    console.error('Failed to track SEO progress', {
      productId,
      stage,
      error,
    });
  }
}

/**
 * Tracks workflow-level progress with enhanced metrics
 */
export async function trackSeoWorkflowProgress(
  workflowRunId: string,
  totalProducts: number,
  processedProducts: number,
  additionalData?: {
    strategy?: SeoStrategy;
    priorityBatch?: boolean;
    tokensUsed?: number;
    avgConfidence?: number;
  },
): Promise<void> {
  try {
    const progressKey = `${SEO_REDIS_KEYS.workflowProgress}:${workflowRunId}`;

    const progressData = {
      totalProducts,
      processedProducts,
      percentage: Math.round((processedProducts / totalProducts) * 100),
      lastUpdated: new Date().toISOString(),
      ...additionalData,
    };

    await redis.hset(progressKey, progressData);
    await redis.expire(progressKey, SEO_CONFIG.redis.statsTTL);
  } catch (error) {
    console.error('Failed to track SEO workflow progress', {
      workflowRunId,
      error,
    });
  }
}

/**
 * Updates batch-level SEO statistics with enhanced metrics
 */
export async function updateSeoBatchStats(results: SeoGenerationResult[]): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    const now = new Date().toISOString();

    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;
    let skipped = 0;
    let totalTokens = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    results.forEach((result) => {
      totalProcessed++;

      if (result.skipped) {
        skipped++;
      } else if (result.success) {
        successful++;
        if (result.tokensUsed) totalTokens += result.tokensUsed;
        if (result.confidence) {
          totalConfidence += result.confidence;
          confidenceCount++;
        }
      } else {
        failed++;
      }
    });

    // Update global stats
    pipeline.hincrby(SEO_REDIS_KEYS.stats, 'batchTotalProcessed', totalProcessed);
    pipeline.hincrby(SEO_REDIS_KEYS.stats, 'batchSuccessful', successful);
    pipeline.hincrby(SEO_REDIS_KEYS.stats, 'batchFailed', failed);
    pipeline.hincrby(SEO_REDIS_KEYS.stats, 'batchSkipped', skipped);
    pipeline.hincrby(SEO_REDIS_KEYS.stats, 'batchTokensUsed', totalTokens);

    if (confidenceCount > 0) {
      const avgConfidence = totalConfidence / confidenceCount;
      pipeline.hset(SEO_REDIS_KEYS.stats, { lastBatchAvgConfidence: avgConfidence.toFixed(2) });
    }

    // Calculate success rate
    if (totalProcessed > 0) {
      const successRate = ((successful / (totalProcessed - skipped)) * 100).toFixed(2);
      pipeline.hset(SEO_REDIS_KEYS.stats, { successRate: successRate });
    }

    pipeline.hset(SEO_REDIS_KEYS.stats, { lastBatchUpdate: now });

    await pipeline.exec();
  } catch (error) {
    console.error('Failed to update SEO batch stats', { error });
  }
}

/**
 * Gets real-time SEO workflow progress
 */
export async function getSeoWorkflowProgress(workflowRunId: string): Promise<{
  totalProducts: number;
  processedProducts: number;
  percentage: number;
  strategy?: SeoStrategy;
  tokensUsed?: number;
  avgConfidence?: number;
  lastUpdated: string;
} | null> {
  try {
    const progressKey = `${SEO_REDIS_KEYS.workflowProgress}:${workflowRunId}`;
    const progress = await redis.hgetall(progressKey);

    if (!progress || Object.keys(progress).length === 0) return null;

    return {
      totalProducts: Number(progress.totalProducts || 0),
      processedProducts: Number(progress.processedProducts || 0),
      percentage: Number(progress.percentage || 0),
      strategy: progress.strategy as SeoStrategy,
      tokensUsed: Number(progress.tokensUsed || 0),
      avgConfidence: Number(progress.avgConfidence || 0),
      lastUpdated: progress.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get SEO workflow progress', { workflowRunId, error });
    return null;
  }
}

/**
 * Tracks token usage for cost monitoring (commented AI features)
 */
export async function trackTokenUsage(
  operation: 'lmstudio' | 'claude' | 'mock',
  tokensUsed: number,
  productId: string,
  metadata?: Record<string, any>,
): Promise<void> {
  try {
    const tokenKey = `${SEO_REDIS_KEYS.tokenUsage}:${new Date().toISOString().slice(0, 10)}`;

    const pipeline = redis.pipeline();
    pipeline.hincrby(tokenKey, `${operation}_tokens`, tokensUsed);
    pipeline.hincrby(tokenKey, `${operation}_requests`, 1);
    pipeline.hset(tokenKey, { [`last_${operation}_product`]: productId });

    if (metadata) {
      pipeline.hset(tokenKey, { [`last_${operation}_metadata`]: JSON.stringify(metadata) });
    }

    await pipeline.exec();
    await redis.expire(tokenKey, SEO_CONFIG.redis.metaTTL);
  } catch (error) {
    console.error('Failed to track token usage', { operation, tokensUsed, productId, error });
  }
}

/**
 * Updates SEO metadata in Redis after processing
 */
export async function updateSeoMetadata(
  productId: string,
  strategy: SeoStrategy,
  seoContent: {
    title: string;
    metaDescription: string;
    keywords: string[];
    confidence?: number;
  },
  processingInfo: {
    tokensUsed: number;
    processingTime: number;
    success: boolean;
  },
): Promise<void> {
  try {
    const metaKey = `${SEO_REDIS_KEYS.seoMeta}:${productId}`;

    await redis.hset(metaKey, {
      productId,
      strategy,
      title: seoContent.title,
      metaDescription: seoContent.metaDescription,
      keywordCount: seoContent.keywords.length,
      confidence: seoContent.confidence || 0,
      tokensUsed: processingInfo.tokensUsed,
      processingTime: processingInfo.processingTime,
      success: processingInfo.success,
      generatedAt: new Date().toISOString(),
      version: '1.0',
    });

    await redis.expire(metaKey, SEO_CONFIG.redis.seoTTL);
  } catch (error) {
    console.error('Failed to update SEO metadata', {
      productId,
      error,
    });
  }
}

/**
 * Checks if SEO content should be skipped based on recency
 */
export async function checkSeoGenerationSkip(
  productId: string,
  regenerate: boolean = false,
): Promise<{ skip: boolean; reason?: string }> {
  if (regenerate) {
    return { skip: false };
  }

  try {
    const metaKey = `${SEO_REDIS_KEYS.seoMeta}:${productId}`;
    const metadata = await redis.hgetall(metaKey);

    if (!metadata || Object.keys(metadata).length === 0) return { skip: false };

    if (metadata.generatedAt && metadata.success === 'true') {
      const generatedAt = new Date(metadata.generatedAt);
      const daysSinceGeneration = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60 * 24);

      // Skip if generated within last 30 days and was successful
      if (daysSinceGeneration < 30) {
        return {
          skip: true,
          reason: `SEO content generated ${Math.round(daysSinceGeneration)} days ago`,
        };
      }
    }

    return { skip: false };
  } catch (error) {
    console.error('Error checking SEO skip status', { productId, error });
    return { skip: false };
  }
}

/**
 * Gets comprehensive SEO processing statistics from Redis
 */
export async function getSeoRedisStats(): Promise<Record<string, any>> {
  try {
    const stats = await redis.hgetall(SEO_REDIS_KEYS.stats);
    return stats || {};
  } catch (error) {
    console.error('Failed to get SEO Redis stats', { error });
    return {};
  }
}
