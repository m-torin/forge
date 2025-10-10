/**
 * RAG Telemetry and Usage Tracking
 * Provides comprehensive metrics for RAG operations
 */

import { logInfo, logWarn } from '@repo/observability/server/next';

export interface RAGUsageMetrics {
  operation: string;
  timestamp: string;
  duration: number;

  // Query metrics
  queryLength?: number;
  queryType?: 'embedding' | 'upstash_hosted';

  // Search metrics
  topK?: number;
  resultsReturned?: number;
  averageRelevance?: number;
  highestRelevance?: number;
  lowestRelevance?: number;

  // Embedding metrics
  embeddingTokens?: number;
  embeddingModel?: string;
  embeddingDuration?: number;

  // Document metrics
  documentsProcessed?: number;
  chunksCreated?: number;
  chunksStored?: number;

  // Error metrics
  error?: string;
  success: boolean;
}

export interface RAGTelemetryConfig {
  enableMetrics?: boolean;
  enablePerformanceTracking?: boolean;
  enableCostTracking?: boolean;
  logLevel?: 'info' | 'warn' | 'error';
}

/**
 * RAG Telemetry Tracker
 */
export class RAGTelemetry {
  private config: Required<RAGTelemetryConfig>;
  private metrics: RAGUsageMetrics[] = [];

  constructor(config: RAGTelemetryConfig = {}) {
    this.config = {
      enableMetrics: config.enableMetrics ?? true,
      enablePerformanceTracking: config.enablePerformanceTracking ?? true,
      enableCostTracking: config.enableCostTracking ?? false,
      logLevel: config.logLevel ?? 'info',
    };
  }

  /**
   * Start tracking an operation
   */
  startOperation(operation: string): RAGOperationTracker {
    return new RAGOperationTracker(operation, this);
  }

  /**
   * Record a completed operation
   */
  recordOperation(metrics: RAGUsageMetrics): void {
    if (!this.config.enableMetrics) return;

    this.metrics.push(metrics);

    // Log the operation
    const logData = {
      operation: metrics.operation,
      duration: metrics.duration,
      success: metrics.success,
      ...(metrics.resultsReturned && { results: metrics.resultsReturned }),
      ...(metrics.averageRelevance && { avgRelevance: metrics.averageRelevance }),
      ...(metrics.embeddingTokens && { embeddingTokens: metrics.embeddingTokens }),
      ...(metrics.error && { error: metrics.error }),
    };

    if (metrics.success) {
      logInfo(`RAG Operation: ${metrics.operation}`, logData);
    } else {
      logWarn(`RAG Operation Failed: ${metrics.operation}`, logData);
    }
  }

  /**
   * Get aggregated metrics
   */
  getMetrics(timeRangeMs?: number): RAGMetricsSummary {
    const cutoff = timeRangeMs ? Date.now() - timeRangeMs : 0;
    const relevantMetrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > cutoff);

    const successful = relevantMetrics.filter(m => m.success);
    const failed = relevantMetrics.filter(m => !m.success);

    return {
      totalOperations: relevantMetrics.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      successRate: relevantMetrics.length > 0 ? successful.length / relevantMetrics.length : 0,

      averageDuration:
        successful.length > 0
          ? successful.reduce((sum, m) => sum + m.duration, 0) / successful.length
          : 0,

      totalEmbeddingTokens: successful.reduce((sum, m) => sum + (m.embeddingTokens || 0), 0),
      totalDocumentsProcessed: successful.reduce((sum, m) => sum + (m.documentsProcessed || 0), 0),
      totalChunksCreated: successful.reduce((sum, m) => sum + (m.chunksCreated || 0), 0),

      averageRelevance: this.calculateAverageRelevance(successful),

      operationBreakdown: this.getOperationBreakdown(relevantMetrics),
      errorBreakdown: this.getErrorBreakdown(failed),
    };
  }

  private calculateAverageRelevance(metrics: RAGUsageMetrics[]): number {
    const relevanceMetrics = metrics.filter(m => m.averageRelevance !== undefined);
    if (relevanceMetrics.length === 0) return 0;

    return (
      relevanceMetrics.reduce((sum, m) => sum + (m.averageRelevance || 0), 0) /
      relevanceMetrics.length
    );
  }

  private getOperationBreakdown(metrics: RAGUsageMetrics[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    metrics.forEach(m => {
      breakdown[m.operation] = (breakdown[m.operation] || 0) + 1;
    });
    return breakdown;
  }

  private getErrorBreakdown(failedMetrics: RAGUsageMetrics[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    failedMetrics.forEach(m => {
      if (m.error) {
        breakdown[m.error] = (breakdown[m.error] || 0) + 1;
      }
    });
    return breakdown;
  }

  /**
   * Clear metrics (useful for testing or memory management)
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * Operation tracker for individual RAG operations
 */
export class RAGOperationTracker {
  private startTime: number;
  private metrics: Partial<RAGUsageMetrics>;

  constructor(
    private operation: string,
    private telemetry: RAGTelemetry,
  ) {
    this.startTime = Date.now();
    this.metrics = {
      operation,
      timestamp: new Date().toISOString(),
      success: false,
    };
  }

  /**
   * Set query information
   */
  setQuery(query: string, type: 'embedding' | 'upstash_hosted' = 'embedding'): this {
    this.metrics.queryLength = query.length;
    this.metrics.queryType = type;
    return this;
  }

  /**
   * Set search parameters
   */
  setSearchParams(topK: number): this {
    this.metrics.topK = topK;
    return this;
  }

  /**
   * Set search results
   */
  setSearchResults(results: Array<{ score: number }>): this {
    this.metrics.resultsReturned = results.length;

    if (results.length > 0) {
      const scores = results.map(r => r.score);
      this.metrics.averageRelevance = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      this.metrics.highestRelevance = Math.max(...scores);
      this.metrics.lowestRelevance = Math.min(...scores);
    }

    return this;
  }

  /**
   * Set embedding information
   */
  setEmbedding(tokens: number, model: string, duration?: number): this {
    this.metrics.embeddingTokens = tokens;
    this.metrics.embeddingModel = model;
    this.metrics.embeddingDuration = duration;
    return this;
  }

  /**
   * Set document processing information
   */
  setDocumentProcessing(documents: number, chunks: number, stored?: number): this {
    this.metrics.documentsProcessed = documents;
    this.metrics.chunksCreated = chunks;
    this.metrics.chunksStored = stored || chunks;
    return this;
  }

  /**
   * Mark operation as successful and record metrics
   */
  success(): void {
    this.metrics.success = true;
    this.metrics.duration = Date.now() - this.startTime;
    this.telemetry.recordOperation(this.metrics as RAGUsageMetrics);
  }

  /**
   * Mark operation as failed and record metrics
   */
  error(error: string | Error): void {
    this.metrics.success = false;
    this.metrics.error = error instanceof Error ? error.message : error;
    this.metrics.duration = Date.now() - this.startTime;
    this.telemetry.recordOperation(this.metrics as RAGUsageMetrics);
  }
}

interface RAGMetricsSummary {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  successRate: number;
  averageDuration: number;
  totalEmbeddingTokens: number;
  totalDocumentsProcessed: number;
  totalChunksCreated: number;
  averageRelevance: number;
  operationBreakdown: Record<string, number>;
  errorBreakdown: Record<string, number>;
}

/**
 * Global RAG telemetry instance
 */
const ragTelemetry = new RAGTelemetry();

/**
 * Helper function to track a RAG operation
 */
export async function trackRAGOperation<T>(
  operation: string,
  fn: (tracker: RAGOperationTracker) => Promise<T>,
): Promise<T> {
  const tracker = ragTelemetry.startOperation(operation);

  try {
    const result = await fn(tracker);
    tracker.success();
    return result;
  } catch (error) {
    tracker.error(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Usage examples
 */
const examples = {
  /**
   * Basic tracking example
   */
  basic: `
import { trackRAGOperation } from './telemetry';

const results = await trackRAGOperation('vector_search', async (tracker) => {
  tracker.setQuery(query, 'embedding').setSearchParams(5);
  
  const results = await vectorStore.queryWithEmbedding(query, { topK: 5 });
  
  tracker.setSearchResults(results);
  return results;
});
  `,

  /**
   * Document processing tracking
   */
  documentProcessing: `
const result = await trackRAGOperation('document_ingestion', async (tracker) => {
  tracker.setDocumentProcessing(1, chunks.length);
  
  const result = await vectorStore.addDocument({
    id: 'doc1',
    content: document,
    metadata: { title: 'My Document' }
  });
  
  return result;
});
  `,
};
