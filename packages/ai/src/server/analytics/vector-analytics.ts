/**
 * Vector Analytics for Performance Monitoring
 * Tracks vector operations, performance metrics, and usage patterns
 */

import type { VectorDB } from '../../shared/types/vector';

export interface VectorAnalytics {
  trackQuery(query: string, results: number, latency: number, namespace?: string): void;
  trackUpsert(vectorCount: number, latency: number, namespace?: string): void;
  trackDelete(vectorCount: number, latency: number, namespace?: string): void;
  getMetrics(timeframe?: 'hour' | 'day' | 'week'): VectorMetrics;
  getUsageStats(): VectorUsageStats;
  reset(): void;
}

export interface VectorMetrics {
  queries: {
    total: number;
    avgLatency: number;
    avgResults: number;
    successRate: number;
  };
  upserts: {
    total: number;
    avgLatency: number;
    avgVectorCount: number;
    successRate: number;
  };
  deletes: {
    total: number;
    avgLatency: number;
    avgVectorCount: number;
    successRate: number;
  };
  timeframe: string;
  timestamp: string;
}

export interface VectorUsageStats {
  totalOperations: number;
  namespaceDistribution: Record<string, number>;
  peakUsageHour: string;
  avgOperationsPerHour: number;
  errorRate: number;
}

/**
 * In-memory vector analytics implementation
 */
export class InMemoryVectorAnalytics implements VectorAnalytics {
  private operations: Array<{
    type: 'query' | 'upsert' | 'delete';
    timestamp: number;
    latency: number;
    count: number;
    namespace: string;
    success: boolean;
  }> = [];

  private maxOperations = 10000; // Keep last 10k operations

  trackQuery(query: string, results: number, latency: number, namespace = 'default'): void {
    this.addOperation({
      type: 'query',
      timestamp: Date.now(),
      latency,
      count: results,
      namespace,
      success: true,
    });
  }

  trackUpsert(vectorCount: number, latency: number, namespace = 'default'): void {
    this.addOperation({
      type: 'upsert',
      timestamp: Date.now(),
      latency,
      count: vectorCount,
      namespace,
      success: true,
    });
  }

  trackDelete(vectorCount: number, latency: number, namespace = 'default'): void {
    this.addOperation({
      type: 'delete',
      timestamp: Date.now(),
      latency,
      count: vectorCount,
      namespace,
      success: true,
    });
  }

  getMetrics(timeframe: 'hour' | 'day' | 'week' = 'hour'): VectorMetrics {
    const now = Date.now();
    const timeframeMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    }[timeframe];

    const recentOps = this.operations.filter(op => now - op.timestamp <= timeframeMs);

    const queries = recentOps.filter(op => op.type === 'query');
    const upserts = recentOps.filter(op => op.type === 'upsert');
    const deletes = recentOps.filter(op => op.type === 'delete');

    return {
      queries: {
        total: queries.length,
        avgLatency: this.average(queries.map(op => op.latency)),
        avgResults: this.average(queries.map(op => op.count)),
        successRate: queries.filter(op => op.success).length / Math.max(queries.length, 1),
      },
      upserts: {
        total: upserts.length,
        avgLatency: this.average(upserts.map(op => op.latency)),
        avgVectorCount: this.average(upserts.map(op => op.count)),
        successRate: upserts.filter(op => op.success).length / Math.max(upserts.length, 1),
      },
      deletes: {
        total: deletes.length,
        avgLatency: this.average(deletes.map(op => op.latency)),
        avgVectorCount: this.average(deletes.map(op => op.count)),
        successRate: deletes.filter(op => op.success).length / Math.max(deletes.length, 1),
      },
      timeframe,
      timestamp: new Date().toISOString(),
    };
  }

  getUsageStats(): VectorUsageStats {
    const namespaceDistribution: Record<string, number> = {};
    const hourlyUsage: Record<string, number> = {};

    this.operations.forEach(op => {
      // Namespace distribution
      namespaceDistribution[op.namespace] = (namespaceDistribution[op.namespace] || 0) + 1;

      // Hourly usage
      const hour = new Date(op.timestamp).toISOString().slice(0, 13);
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
    });

    const peakUsageHour = Object.entries(hourlyUsage).reduce(
      (max, [hour, count]) => (count > max.count ? { hour, count } : max),
      { hour: '', count: 0 },
    ).hour;

    const totalHours = Object.keys(hourlyUsage).length;
    const avgOperationsPerHour = totalHours > 0 ? this.operations.length / totalHours : 0;

    const failedOps = this.operations.filter(op => !op.success).length;
    const errorRate = this.operations.length > 0 ? failedOps / this.operations.length : 0;

    return {
      totalOperations: this.operations.length,
      namespaceDistribution,
      peakUsageHour,
      avgOperationsPerHour,
      errorRate,
    };
  }

  reset(): void {
    this.operations = [];
  }

  private addOperation(operation: (typeof this.operations)[0]): void {
    this.operations.push(operation);

    // Keep only recent operations
    if (this.operations.length > this.maxOperations) {
      this.operations = this.operations.slice(-this.maxOperations);
    }
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
}

/**
 * Vector database wrapper with analytics
 */
export class AnalyticsVectorDB {
  constructor(
    private vectorDB: VectorDB,
    private analytics: VectorAnalytics = new InMemoryVectorAnalytics(),
  ) {}

  async query(vector: number[], options?: any) {
    const startTime = Date.now();
    try {
      const results = await this.vectorDB.query(vector, options);
      const latency = Date.now() - startTime;
      this.analytics.trackQuery('vector_query', results.length, latency, options?.namespace);
      return results;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.analytics.trackQuery('vector_query', 0, latency, options?.namespace);
      throw error;
    }
  }

  async upsert(vectors: any[], options?: any) {
    const startTime = Date.now();
    try {
      const result = await this.vectorDB.upsert(vectors);
      const latency = Date.now() - startTime;
      this.analytics.trackUpsert(vectors.length, latency, options?.namespace);
      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.analytics.trackUpsert(vectors.length, latency, options?.namespace);
      throw error;
    }
  }

  async delete(ids: string[], options?: any) {
    const startTime = Date.now();
    try {
      const result = await this.vectorDB.delete(ids);
      const latency = Date.now() - startTime;
      this.analytics.trackDelete(ids.length, latency, options?.namespace);
      return result;
    } catch (error) {
      const latency = Date.now() - startTime;
      this.analytics.trackDelete(ids.length, latency, options?.namespace);
      throw error;
    }
  }

  // Delegate other methods
  async fetch(ids: string[]) {
    return this.vectorDB.fetch(ids);
  }

  async range(options?: any) {
    return this.vectorDB.range?.(options) || { nextCursor: '', vectors: [] };
  }

  async describe(_options?: any) {
    return this.vectorDB.describe?.() || { dimension: 0, totalVectorCount: 0 };
  }

  async listNamespaces() {
    return this.vectorDB.listNamespaces?.();
  }

  async deleteNamespace(namespace: string) {
    return this.vectorDB.deleteNamespace?.(namespace);
  }

  async update(vector: any, options?: any) {
    return this.vectorDB.update?.(vector, options);
  }

  getAnalytics(): VectorAnalytics {
    return this.analytics;
  }
}

/**
 * Create analytics-enabled vector database
 */
export function createAnalyticsVectorDB(
  vectorDB: VectorDB,
  analytics?: VectorAnalytics,
): AnalyticsVectorDB {
  return new AnalyticsVectorDB(vectorDB, analytics);
}
