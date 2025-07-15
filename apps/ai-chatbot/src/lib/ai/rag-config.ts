'use server';

import { env } from '#/root/env';
import type { HybridSearchConfig } from '@repo/ai/server/rag/hybrid-search';
import { logError, logInfo } from '@repo/observability';
import type { ComprehensiveRAGConfig } from './rag-client';

/**
 * Production RAG Configuration Management
 * Provides validated configurations for different deployment scenarios
 */

export interface RAGEnvironmentConfig {
  name: string;
  description: string;
  hybridSearchConfig: HybridSearchConfig;
  enableSourceTracking: boolean;
  enableBatchProcessing: boolean;
  enableConversationMemory: boolean;
  maxContextLength: number;
  memoryRetentionDays: number;
  performanceProfile: 'economy' | 'balanced' | 'performance' | 'enterprise';
}

export const RAG_PRESETS: Record<string, RAGEnvironmentConfig> = {
  development: {
    name: 'Development',
    description: 'Optimized for development and testing with comprehensive logging',
    hybridSearchConfig: {
      vectorWeight: 0.6,
      keywordWeight: 0.4,
      vectorTopK: 15,
      keywordTopK: 15,
      finalTopK: 8,
      fusionMethod: 'rrf',
      phraseBoost: 1.3,
      titleBoost: 1.5,
      recencyBoost: false,
      lengthPenalty: false,
    },
    enableSourceTracking: true,
    enableBatchProcessing: true,
    enableConversationMemory: true,
    maxContextLength: 3000,
    memoryRetentionDays: 7,
    performanceProfile: 'balanced',
  },

  production: {
    name: 'Production',
    description: 'Balanced configuration for production workloads',
    hybridSearchConfig: {
      vectorWeight: 0.7,
      keywordWeight: 0.3,
      vectorTopK: 20,
      keywordTopK: 20,
      finalTopK: 10,
      fusionMethod: 'rrf',
      phraseBoost: 1.2,
      titleBoost: 1.4,
      recencyBoost: true,
      lengthPenalty: true,
    },
    enableSourceTracking: true,
    enableBatchProcessing: true,
    enableConversationMemory: true,
    maxContextLength: 4000,
    memoryRetentionDays: 30,
    performanceProfile: 'performance',
  },

  enterprise: {
    name: 'Enterprise',
    description: 'High-performance configuration for enterprise deployments',
    hybridSearchConfig: {
      vectorWeight: 0.6,
      keywordWeight: 0.4,
      vectorTopK: 30,
      keywordTopK: 30,
      finalTopK: 15,
      fusionMethod: 'rrf',
      phraseBoost: 1.4,
      titleBoost: 1.6,
      recencyBoost: true,
      lengthPenalty: true,
      fuzzyMatch: true,
    },
    enableSourceTracking: true,
    enableBatchProcessing: true,
    enableConversationMemory: true,
    maxContextLength: 6000,
    memoryRetentionDays: 90,
    performanceProfile: 'enterprise',
  },

  economy: {
    name: 'Economy',
    description: 'Cost-optimized configuration with reduced resource usage',
    hybridSearchConfig: {
      vectorWeight: 0.8,
      keywordWeight: 0.2,
      vectorTopK: 10,
      keywordTopK: 10,
      finalTopK: 5,
      fusionMethod: 'weighted',
      phraseBoost: 1.1,
      titleBoost: 1.2,
      recencyBoost: false,
      lengthPenalty: false,
    },
    enableSourceTracking: false,
    enableBatchProcessing: true,
    enableConversationMemory: false,
    maxContextLength: 2000,
    memoryRetentionDays: 7,
    performanceProfile: 'economy',
  },

  realtime: {
    name: 'Real-time',
    description: 'Optimized for low-latency, real-time interactions',
    hybridSearchConfig: {
      vectorWeight: 0.7,
      keywordWeight: 0.3,
      vectorTopK: 12,
      keywordTopK: 12,
      finalTopK: 6,
      fusionMethod: 'weighted',
      phraseBoost: 1.2,
      titleBoost: 1.3,
      recencyBoost: false,
      lengthPenalty: false,
    },
    enableSourceTracking: true,
    enableBatchProcessing: false,
    enableConversationMemory: true,
    maxContextLength: 2500,
    memoryRetentionDays: 14,
    performanceProfile: 'performance',
  },
};

/**
 * Configuration validation and creation
 */
export class RAGConfigManager {
  private static instance: RAGConfigManager;
  private currentConfig: RAGEnvironmentConfig | null = null;

  static getInstance(): RAGConfigManager {
    if (!RAGConfigManager.instance) {
      RAGConfigManager.instance = new RAGConfigManager();
    }
    return RAGConfigManager.instance;
  }

  /**
   * Get validated configuration for the current environment
   */
  async getConfiguration(
    userId: string,
    preset?: keyof typeof RAG_PRESETS,
  ): Promise<ComprehensiveRAGConfig> {
    try {
      // Determine preset based on environment or explicit selection
      const selectedPreset = preset || this.detectEnvironmentPreset();
      const envConfig = RAG_PRESETS[selectedPreset] || RAG_PRESETS.production;

      logInfo('Loading RAG configuration', {
        operation: 'rag_config_load',
        preset: selectedPreset,
        userId,
        performanceProfile: envConfig.performanceProfile,
      });

      // Validate environment variables
      this.validateEnvironment();

      // Create comprehensive configuration
      const config: ComprehensiveRAGConfig = {
        vectorUrl: env.UPSTASH_VECTOR_REST_URL!,
        vectorToken: env.UPSTASH_VECTOR_REST_TOKEN!,
        namespace: `user_${userId}`,
        hybridSearchConfig: envConfig.hybridSearchConfig,
        enableSourceTracking: envConfig.enableSourceTracking,
        enableBatchProcessing: envConfig.enableBatchProcessing,
        enableConversationMemory: envConfig.enableConversationMemory,
        maxContextLength: envConfig.maxContextLength,
        memoryRetentionDays: envConfig.memoryRetentionDays,
        productionPreset: selectedPreset as any,
      };

      this.currentConfig = envConfig;

      logInfo('RAG configuration loaded successfully', {
        operation: 'rag_config_loaded',
        preset: selectedPreset,
        hasHybridSearch: true,
        hasConversationMemory: envConfig.enableConversationMemory,
        maxContextLength: envConfig.maxContextLength,
      });

      return config;
    } catch (error) {
      logError('Failed to load RAG configuration', { error, userId, preset });
      throw new Error(
        `RAG configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get current configuration details
   */
  getCurrentConfig(): RAGEnvironmentConfig | null {
    return this.currentConfig;
  }

  /**
   * Get available presets
   */
  getAvailablePresets(): Array<{ key: string; config: RAGEnvironmentConfig }> {
    return Object.entries(RAG_PRESETS).map(([key, config]) => ({ key, config }));
  }

  /**
   * Validate configuration against current environment
   */
  validateConfiguration(config: Partial<ComprehensiveRAGConfig>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.vectorUrl) {
      errors.push('Vector URL is required');
    }

    if (!config.vectorToken) {
      errors.push('Vector token is required');
    }

    if (!config.namespace) {
      errors.push('Namespace is required');
    }

    if (
      config.maxContextLength &&
      (config.maxContextLength < 1000 || config.maxContextLength > 10000)
    ) {
      errors.push('Max context length must be between 1000 and 10000');
    }

    if (
      config.memoryRetentionDays &&
      (config.memoryRetentionDays < 1 || config.memoryRetentionDays > 365)
    ) {
      errors.push('Memory retention days must be between 1 and 365');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create custom configuration with validation
   */
  createCustomConfiguration(
    basePreset: keyof typeof RAG_PRESETS,
    overrides: Partial<RAGEnvironmentConfig>,
  ): RAGEnvironmentConfig {
    const base = RAG_PRESETS[basePreset];
    if (!base) {
      throw new Error(`Unknown base preset: ${basePreset}`);
    }

    const customConfig: RAGEnvironmentConfig = {
      ...base,
      ...overrides,
      name: overrides.name || `Custom (${base.name})`,
      description: overrides.description || `Custom configuration based on ${base.name}`,
      hybridSearchConfig: {
        ...base.hybridSearchConfig,
        ...overrides.hybridSearchConfig,
      },
    };

    // Validate the custom configuration
    const validation = this.validateConfiguration({
      vectorUrl: env.UPSTASH_VECTOR_REST_URL,
      vectorToken: env.UPSTASH_VECTOR_REST_TOKEN,
      namespace: 'test',
      maxContextLength: customConfig.maxContextLength,
      memoryRetentionDays: customConfig.memoryRetentionDays,
    });

    if (!validation.valid) {
      throw new Error(`Invalid custom configuration: ${validation.errors.join(', ')}`);
    }

    return customConfig;
  }

  /**
   * Auto-detect appropriate preset based on environment
   */
  private detectEnvironmentPreset(): keyof typeof RAG_PRESETS {
    // Check environment variables and context
    const nodeEnv = process.env.NODE_ENV;
    const isVercel = !!process.env.VERCEL;
    const hasRedis = !!env.UPSTASH_REDIS_REST_URL;

    // Development environment
    if (nodeEnv === 'development') {
      return 'development';
    }

    // Production environments
    if (nodeEnv === 'production') {
      if (isVercel && hasRedis) {
        return 'enterprise'; // Full Vercel + Redis stack
      }
      return 'production'; // Standard production
    }

    // Test environments
    if (nodeEnv === 'test') {
      return 'economy';
    }

    // Default fallback
    return 'production';
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironment(): void {
    const required = ['UPSTASH_VECTOR_REST_URL', 'UPSTASH_VECTOR_REST_TOKEN'];

    const missing = required.filter(key => !env[key as keyof typeof env]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

/**
 * Factory functions for easy configuration creation
 */
export async function createRAGConfigForUser(
  userId: string,
  preset?: keyof typeof RAG_PRESETS,
): Promise<ComprehensiveRAGConfig> {
  const manager = RAGConfigManager.getInstance();
  return await manager.getConfiguration(userId, preset);
}

export function getRAGPresets() {
  const manager = RAGConfigManager.getInstance();
  return manager.getAvailablePresets();
}

export function validateRAGConfig(config: Partial<ComprehensiveRAGConfig>) {
  const manager = RAGConfigManager.getInstance();
  return manager.validateConfiguration(config);
}

/**
 * Performance monitoring and optimization suggestions
 */
export interface RAGPerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  memoryUsage: number;
  recommendedOptimizations: string[];
}

export class RAGPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const values = this.metrics.get(key)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getPerformanceReport(): RAGPerformanceMetrics {
    const responseTimes = this.metrics.get('response_time') || [];
    const errors = this.metrics.get('errors') || [];
    const successes = this.metrics.get('successes') || [];
    const memory = this.metrics.get('memory_usage') || [];

    const totalRequests = errors.length + successes.length;
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const successRate = totalRequests > 0 ? (successes.length / totalRequests) * 100 : 100;
    const errorRate = totalRequests > 0 ? (errors.length / totalRequests) * 100 : 0;
    const memoryUsage = memory.length > 0 ? memory[memory.length - 1] : 0;

    const recommendations: string[] = [];

    if (averageResponseTime > 2000) {
      recommendations.push('Consider switching to "realtime" preset for faster responses');
    }

    if (errorRate > 5) {
      recommendations.push('High error rate detected, check vector database connectivity');
    }

    if (memoryUsage > 80) {
      recommendations.push(
        'High memory usage, consider reducing context length or enabling memory optimization',
      );
    }

    if (successRate < 95) {
      recommendations.push('Low success rate, review configuration and error logs');
    }

    return {
      averageResponseTime,
      successRate,
      errorRate,
      memoryUsage,
      recommendedOptimizations: recommendations,
    };
  }
}

// Global performance monitor instance
export const ragPerformanceMonitor = new RAGPerformanceMonitor();
