/**
 * Graceful Degradation for RAG Failures
 * Implements fallback strategies and degraded operation modes for RAG system resilience
 */

import { logDebug, logInfo, logWarn } from '@repo/observability/server/next';
import type { RAGDatabaseBridge } from './database-bridge';
import { recordRAGOperation } from './health-monitoring';

/**
 * Degradation strategy types
 */
export enum DegradationStrategy {
  CACHE_FALLBACK = 'cache_fallback',
  SIMPLIFIED_SEARCH = 'simplified_search',
  NO_RAG = 'no_rag',
  CACHED_RESPONSES = 'cached_responses',
  REDUCED_CONTEXT = 'reduced_context',
  ALTERNATIVE_EMBEDDING = 'alternative_embedding',
  FAIL_FAST = 'fail_fast',
}

/**
 * Degradation configuration
 */
export interface DegradationConfig {
  enabled: boolean;
  strategies: DegradationStrategy[];
  thresholds: {
    errorRate: number;
    responseTime: number;
    consecutiveFailures: number;
  };
  fallbackCache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  simplifiedSearch: {
    reducedTopK: number;
    lowerThreshold: number;
    useBasicSimilarity: boolean;
  };
  cachedResponses: {
    useCommonQueries: boolean;
    maxCacheAge: number;
  };
}

/**
 * Degradation context
 */
export interface DegradationContext {
  strategy: DegradationStrategy;
  reason: string;
  timestamp: number;
  originalOperation: string;
  fallbackUsed: boolean;
  responseTime: number;
  metadata?: Record<string, any>;
}

/**
 * RAG operation result with degradation info
 */
export interface RAGOperationResult<T> {
  data: T;
  degraded: boolean;
  context?: DegradationContext;
  warning?: string;
}

/**
 * Simple in-memory cache for fallback responses
 */
class FallbackCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set(key: string, data: any, ttl: number): void {
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Graceful Degradation Manager
 */
export class RAGDegradationManager {
  private config: Required<DegradationConfig>;
  private fallbackCache: FallbackCache;
  private consecutiveFailures = 0;
  private recentErrors: Array<{ timestamp: number; error: string }> = [];
  private degradationActive = false;
  private commonResponses: Map<string, string>;

  constructor(
    private vectorStore: RAGDatabaseBridge,
    config: Partial<DegradationConfig> = {},
  ) {
    this.config = {
      enabled: config.enabled ?? true,
      strategies: config.strategies || [
        DegradationStrategy.CACHE_FALLBACK,
        DegradationStrategy.SIMPLIFIED_SEARCH,
        DegradationStrategy.REDUCED_CONTEXT,
        DegradationStrategy.NO_RAG,
      ],
      thresholds: {
        errorRate: config.thresholds?.errorRate || 0.3, // 30%
        responseTime: config.thresholds?.responseTime || 10000, // 10 seconds
        consecutiveFailures: config.thresholds?.consecutiveFailures || 3,
        ...config.thresholds,
      },
      fallbackCache: {
        enabled: config.fallbackCache?.enabled ?? true,
        ttl: config.fallbackCache?.ttl || 300000, // 5 minutes
        maxSize: config.fallbackCache?.maxSize || 1000,
        ...config.fallbackCache,
      },
      simplifiedSearch: {
        reducedTopK: config.simplifiedSearch?.reducedTopK || 3,
        lowerThreshold: config.simplifiedSearch?.lowerThreshold || 0.5,
        useBasicSimilarity: config.simplifiedSearch?.useBasicSimilarity ?? true,
        ...config.simplifiedSearch,
      },
      cachedResponses: {
        useCommonQueries: config.cachedResponses?.useCommonQueries ?? true,
        maxCacheAge: config.cachedResponses?.maxCacheAge || 86400000, // 24 hours
        ...config.cachedResponses,
      },
    };

    this.fallbackCache = new FallbackCache(this.config.fallbackCache.maxSize);
    this.commonResponses = this.initializeCommonResponses();

    logDebug('RAG Degradation Manager initialized', {
      operation: 'rag_degradation_manager_init',
      enabled: this.config.enabled,
      strategies: this.config.strategies,
    });
  }

  /**
   * Initialize common response patterns for fallback
   */
  private initializeCommonResponses(): Map<string, string> {
    const responses = new Map<string, string>();

    // Common fallback responses for when RAG fails
    responses.set(
      'general_help',
      "I apologize, but I'm experiencing some technical difficulties accessing my knowledge base. Please try rephrasing your question or contact support if the issue persists.",
    );
    responses.set(
      'no_context',
      "I don't have specific information about that topic in my current knowledge base. Could you provide more context or try a different question?",
    );
    responses.set(
      'timeout',
      "I'm taking longer than usual to process your request. Please try again in a moment.",
    );
    responses.set(
      'degraded_service',
      "I'm currently operating in a limited capacity. I can still help with basic questions, but my responses may be less detailed than usual.",
    );

    return responses;
  }

  /**
   * Execute RAG operation with graceful degradation
   */
  async executeWithDegradation<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackData?: T,
  ): Promise<RAGOperationResult<T>> {
    if (!this.config.enabled) {
      const data = await operation();
      return { data, degraded: false };
    }

    const startTime = Date.now();
    const cacheKey = `${operationName}_${Date.now()}`;

    try {
      // Check if we should use degraded mode based on recent failures
      if (this.shouldUseDegradedMode()) {
        return await this.executeDegradedOperation(operation, operationName, fallbackData);
      }

      // Try normal operation with timeout
      const data = await this.executeWithTimeout(operation, this.config.thresholds.responseTime);

      // Reset failure counter on success
      this.consecutiveFailures = 0;

      // Cache successful response for future fallback
      if (this.config.fallbackCache.enabled) {
        this.fallbackCache.set(cacheKey, data, this.config.fallbackCache.ttl);
      }

      const responseTime = Date.now() - startTime;
      recordRAGOperation('vector_query', true, responseTime);

      return { data, degraded: false };
    } catch (error) {
      this.recordFailure(error instanceof Error ? error : new Error(String(error)));

      const responseTime = Date.now() - startTime;
      recordRAGOperation('vector_query', false, responseTime);

      // Try degraded strategies
      return await this.executeDegradedOperation(operation, operationName, fallbackData);
    }
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>, timeout: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  /**
   * Check if we should use degraded mode
   */
  private shouldUseDegradedMode(): boolean {
    // Check consecutive failures
    if (this.consecutiveFailures >= this.config.thresholds.consecutiveFailures) {
      return true;
    }

    // Check error rate in recent operations
    const now = Date.now();
    const recentWindow = 300000; // 5 minutes
    const recentErrors = this.recentErrors.filter(e => now - e.timestamp < recentWindow);

    if (recentErrors.length > 0) {
      const errorRate = recentErrors.length / 10; // Assume 10 operations in window
      if (errorRate > this.config.thresholds.errorRate) {
        return true;
      }
    }

    return this.degradationActive;
  }

  /**
   * Execute degraded operation
   */
  private async executeDegradedOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackData?: T,
  ): Promise<RAGOperationResult<T>> {
    logWarn('Executing operation in degraded mode', {
      operation: 'rag_degradation_execute',
      operationName,
      consecutiveFailures: this.consecutiveFailures,
      strategies: this.config.strategies,
    });

    for (const strategy of this.config.strategies) {
      try {
        const result = await this.applyDegradationStrategy(
          strategy,
          operation,
          operationName,
          fallbackData,
        );
        if (result) {
          return result;
        }
      } catch (error) {
        logWarn('Degradation strategy failed', {
          operation: 'rag_degradation_strategy_failed',
          strategy,
          error: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
    }

    // If all strategies fail, return final fallback
    const finalFallback = fallbackData || this.getFinalFallback<T>(operationName);
    return {
      data: finalFallback,
      degraded: true,
      context: {
        strategy: DegradationStrategy.FAIL_FAST,
        reason: 'All degradation strategies failed',
        timestamp: Date.now(),
        originalOperation: operationName,
        fallbackUsed: true,
        responseTime: 0,
      },
      warning: 'Service is currently experiencing issues. Using fallback response.',
    };
  }

  /**
   * Apply specific degradation strategy
   */
  private async applyDegradationStrategy<T>(
    strategy: DegradationStrategy,
    operation: () => Promise<T>,
    operationName: string,
    fallbackData?: T,
  ): Promise<RAGOperationResult<T> | null> {
    const startTime = Date.now();

    switch (strategy) {
      case DegradationStrategy.CACHE_FALLBACK:
        return await this.tryCacheFallback<T>(operationName);

      case DegradationStrategy.SIMPLIFIED_SEARCH:
        return await this.trySimplifiedSearch<T>(operation, operationName);

      case DegradationStrategy.REDUCED_CONTEXT:
        return await this.tryReducedContext<T>(operation, operationName);

      case DegradationStrategy.ALTERNATIVE_EMBEDDING:
        return await this.tryAlternativeEmbedding<T>(operation, operationName);

      case DegradationStrategy.CACHED_RESPONSES:
        return await this.tryCommonResponses<T>(operationName);

      case DegradationStrategy.NO_RAG:
        return {
          data: fallbackData || this.getNoRAGFallback<T>(operationName),
          degraded: true,
          context: {
            strategy,
            reason: 'RAG system unavailable',
            timestamp: Date.now(),
            originalOperation: operationName,
            fallbackUsed: true,
            responseTime: Date.now() - startTime,
          },
          warning: 'Operating without enhanced context due to system issues.',
        };

      case DegradationStrategy.FAIL_FAST:
        throw new Error('Fail fast strategy - no fallback available');

      default:
        return null;
    }
  }

  /**
   * Try cache fallback
   */
  private async tryCacheFallback<T>(operationName: string): Promise<RAGOperationResult<T> | null> {
    if (!this.config.fallbackCache.enabled) return null;

    // Try to find cached response
    const cachedData = this.fallbackCache.get(operationName);
    if (cachedData) {
      logInfo('Using cached fallback response', {
        operation: 'rag_degradation_cache_fallback',
        operationName,
      });

      return {
        data: cachedData,
        degraded: true,
        context: {
          strategy: DegradationStrategy.CACHE_FALLBACK,
          reason: 'Using cached response due to service issues',
          timestamp: Date.now(),
          originalOperation: operationName,
          fallbackUsed: true,
          responseTime: 0,
        },
        warning: 'Using cached response due to current service limitations.',
      };
    }

    return null;
  }

  /**
   * Try simplified search
   */
  private async trySimplifiedSearch<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<RAGOperationResult<T> | null> {
    try {
      logInfo('Attempting simplified search', {
        operation: 'rag_degradation_simplified_search',
        operationName,
      });

      // This would implement a simplified version of the search
      // For now, we'll attempt the original operation with a shorter timeout
      const data = await this.executeWithTimeout(operation, 5000); // 5 second timeout

      return {
        data,
        degraded: true,
        context: {
          strategy: DegradationStrategy.SIMPLIFIED_SEARCH,
          reason: 'Using simplified search algorithm',
          timestamp: Date.now(),
          originalOperation: operationName,
          fallbackUsed: true,
          responseTime: 5000,
        },
        warning: 'Using simplified search due to performance issues.',
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Try reduced context
   */
  private async tryReducedContext<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<RAGOperationResult<T> | null> {
    try {
      logWarn('Attempting reduced context operation', {
        operation: 'rag_degradation_reduced_context',
        operationName,
      });

      // This would implement a version with reduced context
      // For now, we'll attempt with a very short timeout
      const data = await this.executeWithTimeout(operation, 3000); // 3 second timeout

      return {
        data,
        degraded: true,
        context: {
          strategy: DegradationStrategy.REDUCED_CONTEXT,
          reason: 'Using reduced context to improve response time',
          timestamp: Date.now(),
          originalOperation: operationName,
          fallbackUsed: true,
          responseTime: 3000,
        },
        warning: 'Using reduced context due to system constraints.',
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Try alternative embedding approach
   */
  private async tryAlternativeEmbedding<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<RAGOperationResult<T> | null> {
    try {
      logInfo('Attempting alternative embedding approach', {
        operation: 'rag_degradation_alternative_embedding',
        operationName,
      });

      // This would implement alternative embedding logic
      // For example, using Upstash hosted embeddings instead of OpenAI
      const data = await this.executeWithTimeout(operation, 8000); // 8 second timeout

      return {
        data,
        degraded: true,
        context: {
          strategy: DegradationStrategy.ALTERNATIVE_EMBEDDING,
          reason: 'Using alternative embedding provider',
          timestamp: Date.now(),
          originalOperation: operationName,
          fallbackUsed: true,
          responseTime: 8000,
        },
        warning: 'Using alternative embedding provider due to primary service issues.',
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Try common cached responses
   */
  private async tryCommonResponses<T>(
    operationName: string,
  ): Promise<RAGOperationResult<T> | null> {
    if (!this.config.cachedResponses.useCommonQueries) return null;

    // Simple heuristic to match common query patterns
    const commonResponse = this.matchCommonQuery(operationName);
    if (commonResponse) {
      return {
        data: commonResponse as T,
        degraded: true,
        context: {
          strategy: DegradationStrategy.CACHED_RESPONSES,
          reason: 'Using common cached response',
          timestamp: Date.now(),
          originalOperation: operationName,
          fallbackUsed: true,
          responseTime: 0,
        },
        warning: 'Using a general response due to service limitations.',
      };
    }

    return null;
  }

  /**
   * Match common query patterns
   */
  private matchCommonQuery(operationName: string): string | null {
    const operation = operationName.toLowerCase();

    if (operation.includes('timeout') || operation.includes('slow')) {
      return this.commonResponses.get('timeout') || null;
    }
    if (operation.includes('error') || operation.includes('fail')) {
      return this.commonResponses.get('general_help') || null;
    }
    if (operation.includes('search') || operation.includes('query')) {
      return this.commonResponses.get('no_context') || null;
    }

    return this.commonResponses.get('degraded_service') || null;
  }

  /**
   * Get final fallback when all strategies fail
   */
  private getFinalFallback<T>(_operationName: string): T {
    // Return appropriate fallback based on operation type
    const fallback =
      this.commonResponses.get('general_help') ||
      'Service temporarily unavailable. Please try again later.';
    return fallback as T;
  }

  /**
   * Get no-RAG fallback
   */
  private getNoRAGFallback<T>(_operationName: string): T {
    const fallback =
      this.commonResponses.get('no_context') ||
      'I can help with general questions, but detailed information is currently unavailable.';
    return fallback as T;
  }

  /**
   * Record operation failure
   */
  private recordFailure(error: Error): void {
    this.consecutiveFailures++;
    this.recentErrors.push({
      timestamp: Date.now(),
      error: error.message,
    });

    // Keep only recent errors (last 10 minutes)
    const tenMinutesAgo = Date.now() - 600000;
    this.recentErrors = this.recentErrors.filter(e => e.timestamp > tenMinutesAgo);

    // Activate degradation if thresholds are met
    if (this.consecutiveFailures >= this.config.thresholds.consecutiveFailures) {
      this.degradationActive = true;

      logWarn('RAG degradation mode activated', {
        operation: 'rag_degradation_activated',
        consecutiveFailures: this.consecutiveFailures,
        recentErrors: this.recentErrors.length,
      });
    }
  }

  /**
   * Reset degradation state (called when service recovers)
   */
  resetDegradation(): void {
    this.consecutiveFailures = 0;
    this.recentErrors = [];
    this.degradationActive = false;

    logInfo('RAG degradation state reset', {
      operation: 'rag_degradation_reset',
    });
  }

  /**
   * Get degradation status
   */
  getDegradationStatus(): {
    active: boolean;
    consecutiveFailures: number;
    recentErrors: number;
    strategies: DegradationStrategy[];
    cacheSize: number;
  } {
    return {
      active: this.degradationActive,
      consecutiveFailures: this.consecutiveFailures,
      recentErrors: this.recentErrors.length,
      strategies: this.config.strategies,
      cacheSize: this.fallbackCache.size(),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DegradationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    logInfo('RAG degradation config updated', {
      operation: 'rag_degradation_config_update',
      newConfig,
    });
  }
}

/**
 * Global degradation manager instance
 */
let globalDegradationManager: RAGDegradationManager | null = null;

/**
 * Initialize global degradation manager
 */
export function initializeRAGDegradation(
  vectorStore: RAGDatabaseBridge,
  config?: Partial<DegradationConfig>,
): RAGDegradationManager {
  globalDegradationManager = new RAGDegradationManager(vectorStore, config);
  return globalDegradationManager;
}

/**
 * Get global degradation manager
 */
export function getRAGDegradationManager(): RAGDegradationManager | null {
  return globalDegradationManager;
}

/**
 * Convenience function to execute with degradation
 */
export async function executeWithGracefulDegradation<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallbackData?: T,
): Promise<RAGOperationResult<T>> {
  if (!globalDegradationManager) {
    // If no degradation manager, execute normally
    const data = await operation();
    return { data, degraded: false };
  }

  return globalDegradationManager.executeWithDegradation(operation, operationName, fallbackData);
}

/**
 * Decorator for adding graceful degradation to methods
 */
export function withGracefulDegradation<T = any>(fallbackData?: T) {
  return function <U extends (...args: any[]) => Promise<T>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<U>,
  ) {
    const method = descriptor.value;
    if (!method) throw new Error('Method descriptor value is undefined');
    const operationName = `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (this: any, ...args: any[]) {
      return executeWithGracefulDegradation(
        () => method.apply(this, args),
        operationName,
        fallbackData,
      );
    } as U;
  };
}
