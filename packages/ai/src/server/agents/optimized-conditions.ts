/**
 * Performance-Optimized Step Conditions
 * Creates optimized step conditions based on performance analysis and adaptive learning
 */

import { logInfo } from '@repo/observability/server/next';
import type { AgentPerformanceMetrics } from './performance-monitoring';
import type { StepCondition } from './step-conditions';

/**
 * Condition optimization configuration
 */
export interface ConditionOptimizationConfig {
  targetExecutionTime?: number; // milliseconds
  targetTokenUsage?: number;
  targetStepCount?: number;
  optimizationStrategy?: 'conservative' | 'balanced' | 'aggressive';
  adaptiveLearning?: boolean;
  historicalDataWeight?: number; // 0-1, how much to weight historical data
}

/**
 * Performance-based condition factory
 */
export class OptimizedConditionFactory {
  private performanceHistory: AgentPerformanceMetrics[] = [];
  private config: Required<ConditionOptimizationConfig>;

  constructor(config: ConditionOptimizationConfig = {}) {
    this.config = {
      targetExecutionTime: 30000, // 30 seconds
      targetTokenUsage: 5000,
      targetStepCount: 8,
      optimizationStrategy: 'balanced',
      adaptiveLearning: true,
      historicalDataWeight: 0.7,
      ...config,
    };
  }

  /**
   * Add performance data to the optimization history
   */
  addPerformanceData(metrics: AgentPerformanceMetrics): void {
    this.performanceHistory.push(metrics);

    // Keep only recent history (last 50 executions)
    if (this.performanceHistory.length > 50) {
      this.performanceHistory = this.performanceHistory.slice(-50);
    }

    if (this.config.adaptiveLearning) {
      this.adaptTargets();
    }

    logInfo('Optimized Conditions: Performance data added', {
      operation: 'optimized_conditions_data_added',
      metadata: {
        historyLength: this.performanceHistory.length,
        averageExecutionTime: this.getAverageExecutionTime(),
        averageTokenUsage: this.getAverageTokenUsage(),
        averageStepCount: this.getAverageStepCount(),
      },
    });
  }

  /**
   * Create optimized step conditions based on current configuration and history
   */
  createOptimizedConditions(): StepCondition[] {
    const conditions: StepCondition[] = [];

    // Add execution time based condition
    const timeCondition = this.createTimeBasedCondition();
    if (timeCondition) conditions.push(timeCondition);

    // Add token usage based condition
    const tokenCondition = this.createTokenBasedCondition();
    if (tokenCondition) conditions.push(tokenCondition);

    // Add step count based condition
    const stepCondition = this.createStepCountCondition();
    if (stepCondition) conditions.push(stepCondition);

    // Add efficiency based conditions
    const efficiencyConditions = this.createEfficiencyBasedConditions();
    conditions.push(...efficiencyConditions);

    // Add error handling conditions
    const errorConditions = this.createErrorBasedConditions();
    conditions.push(...errorConditions);

    logInfo('Optimized Conditions: Created optimized conditions', {
      operation: 'optimized_conditions_created',
      metadata: {
        conditionCount: conditions.length,
        strategy: this.config.optimizationStrategy,
        hasHistoricalData: this.performanceHistory.length > 0,
      },
    });

    return conditions;
  }

  /**
   * Create a time-based condition that adapts to execution patterns
   */
  private createTimeBasedCondition(): StepCondition | null {
    const avgExecutionTime = this.getAverageExecutionTime();
    const avgStepTime = this.getAverageStepTime();

    if (avgStepTime === 0) return null;

    const targetStepsForTime = Math.floor(this.config.targetExecutionTime / avgStepTime);

    return ({ stepNumber }: any) => {
      const adjustedTarget = this.applyStrategyMultiplier(targetStepsForTime);
      return stepNumber >= adjustedTarget;
    };
  }

  /**
   * Create a token-based condition that considers historical usage patterns
   */
  private createTokenBasedCondition(): StepCondition | null {
    const avgTokensPerStep = this.getAverageTokensPerStep();

    if (avgTokensPerStep === 0) return null;

    const targetStepsForTokens = Math.floor(this.config.targetTokenUsage / avgTokensPerStep);

    return ({ usage }: any) => {
      const totalTokens = usage?.totalTokens || 0;
      const adjustedTarget = this.applyStrategyMultiplier(this.config.targetTokenUsage);
      return totalTokens >= adjustedTarget;
    };
  }

  /**
   * Create a step count condition with adaptive limits
   */
  private createStepCountCondition(): StepCondition {
    const adjustedTarget = this.applyStrategyMultiplier(this.config.targetStepCount);

    return ({ stepNumber }: any) => {
      return stepNumber >= adjustedTarget;
    };
  }

  /**
   * Create efficiency-based conditions
   */
  private createEfficiencyBasedConditions(): StepCondition[] {
    const conditions: StepCondition[] = [];

    // Stop if efficiency is decreasing significantly
    if (this.performanceHistory.length > 0) {
      const avgEfficiency = this.getAverageEfficiency();

      conditions.push(({ stepNumber, usage }: any) => {
        if (stepNumber < 3) return false; // Need some steps to measure efficiency

        const currentEfficiency = usage?.totalTokens ? (stepNumber / usage.totalTokens) * 1000 : 0;

        // Stop if current efficiency is less than 50% of historical average
        return currentEfficiency < avgEfficiency * 0.5;
      });
    }

    // Stop if tool calls are consistently failing
    let consecutiveFailures = 0;
    conditions.push(({ toolResults }: any) => {
      if (!toolResults || toolResults.length === 0) return false;

      const hasFailures = toolResults.some((result: any) => result.error);

      if (hasFailures) {
        consecutiveFailures++;
        return consecutiveFailures >= 3; // Stop after 3 consecutive failures
      } else {
        consecutiveFailures = 0;
        return false;
      }
    });

    return conditions;
  }

  /**
   * Create error-based conditions with adaptive thresholds
   */
  private createErrorBasedConditions(): StepCondition[] {
    const conditions: StepCondition[] = [];

    // Dynamic error threshold based on historical error rates
    const avgErrorRate = this.getAverageErrorRate();
    const errorThreshold = Math.max(0.1, avgErrorRate * 1.5); // At least 10% error rate

    let errorCount = 0;
    let totalSteps = 0;

    conditions.push(({ toolResults }: any) => {
      totalSteps++;

      if (toolResults) {
        const stepHasError = toolResults.some((result: any) => result.error);
        if (stepHasError) errorCount++;
      }

      if (totalSteps < 3) return false; // Need minimum steps to calculate rate

      const currentErrorRate = errorCount / totalSteps;
      return currentErrorRate > errorThreshold;
    });

    return conditions;
  }

  /**
   * Apply strategy multiplier to target values
   */
  private applyStrategyMultiplier(value: number): number {
    switch (this.config.optimizationStrategy) {
      case 'conservative':
        return Math.floor(value * 0.7); // Stop earlier
      case 'aggressive':
        return Math.floor(value * 1.3); // Allow more steps
      case 'balanced':
      default:
        return value;
    }
  }

  /**
   * Adapt targets based on historical performance
   */
  private adaptTargets(): void {
    if (this.performanceHistory.length < 5) return; // Need minimum data

    const recentHistory = this.performanceHistory.slice(-10);
    const weight = this.config.historicalDataWeight;

    // Adapt execution time target
    const avgRecentTime =
      recentHistory.reduce((sum, m) => sum + m.executionTime, 0) / recentHistory.length;
    this.config.targetExecutionTime = Math.floor(
      this.config.targetExecutionTime * (1 - weight) + avgRecentTime * weight,
    );

    // Adapt token usage target
    const avgRecentTokens =
      recentHistory.reduce((sum, m) => sum + m.tokenUsage.total, 0) / recentHistory.length;
    this.config.targetTokenUsage = Math.floor(
      this.config.targetTokenUsage * (1 - weight) + avgRecentTokens * weight,
    );

    // Adapt step count target
    const avgRecentSteps =
      recentHistory.reduce((sum, m) => sum + m.stepMetrics.totalSteps, 0) / recentHistory.length;
    this.config.targetStepCount = Math.floor(
      this.config.targetStepCount * (1 - weight) + avgRecentSteps * weight,
    );
  }

  /**
   * Get average execution time from history
   */
  private getAverageExecutionTime(): number {
    if (this.performanceHistory.length === 0) return 0;
    return (
      this.performanceHistory.reduce((sum, m) => sum + m.executionTime, 0) /
      this.performanceHistory.length
    );
  }

  /**
   * Get average token usage from history
   */
  private getAverageTokenUsage(): number {
    if (this.performanceHistory.length === 0) return 0;
    return (
      this.performanceHistory.reduce((sum, m) => sum + m.tokenUsage.total, 0) /
      this.performanceHistory.length
    );
  }

  /**
   * Get average step count from history
   */
  private getAverageStepCount(): number {
    if (this.performanceHistory.length === 0) return 0;
    return (
      this.performanceHistory.reduce((sum, m) => sum + m.stepMetrics.totalSteps, 0) /
      this.performanceHistory.length
    );
  }

  /**
   * Get average step time from history
   */
  private getAverageStepTime(): number {
    if (this.performanceHistory.length === 0) return 0;
    return (
      this.performanceHistory.reduce((sum, m) => sum + m.stepMetrics.averageStepTime, 0) /
      this.performanceHistory.length
    );
  }

  /**
   * Get average tokens per step from history
   */
  private getAverageTokensPerStep(): number {
    if (this.performanceHistory.length === 0) return 0;
    return (
      this.performanceHistory.reduce((sum, m) => sum + m.tokenUsage.averagePerStep, 0) /
      this.performanceHistory.length
    );
  }

  /**
   * Get average efficiency from history
   */
  private getAverageEfficiency(): number {
    if (this.performanceHistory.length === 0) return 0;
    return (
      this.performanceHistory.reduce((sum, m) => sum + m.efficiency.tokensPerSecond, 0) /
      this.performanceHistory.length
    );
  }

  /**
   * Get average error rate from history
   */
  private getAverageErrorRate(): number {
    if (this.performanceHistory.length === 0) return 0;
    return (
      this.performanceHistory.reduce((sum, m) => sum + m.efficiency.errorRate, 0) /
      this.performanceHistory.length
    );
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<ConditionOptimizationConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ConditionOptimizationConfig>): void {
    this.config = { ...this.config, ...updates };

    logInfo('Optimized Conditions: Configuration updated', {
      operation: 'optimized_conditions_config_updated',
      metadata: updates,
    });
  }

  /**
   * Get performance statistics
   */
  getPerformanceStatistics() {
    if (this.performanceHistory.length === 0) {
      return null;
    }

    return {
      totalExecutions: this.performanceHistory.length,
      averageExecutionTime: this.getAverageExecutionTime(),
      averageTokenUsage: this.getAverageTokenUsage(),
      averageStepCount: this.getAverageStepCount(),
      averageStepTime: this.getAverageStepTime(),
      averageTokensPerStep: this.getAverageTokensPerStep(),
      averageEfficiency: this.getAverageEfficiency(),
      averageErrorRate: this.getAverageErrorRate(),
      currentTargets: {
        executionTime: this.config.targetExecutionTime,
        tokenUsage: this.config.targetTokenUsage,
        stepCount: this.config.targetStepCount,
      },
    };
  }

  /**
   * Reset performance history
   */
  resetHistory(): void {
    this.performanceHistory = [];

    logInfo('Optimized Conditions: Performance history reset', {
      operation: 'optimized_conditions_history_reset',
    });
  }
}

/**
 * Global optimized condition factory instance
 */
export const globalConditionFactory = new OptimizedConditionFactory();

/**
 * Quick access functions for creating optimized conditions
 */
export const optimizedConditions = {
  /**
   * Create conservative conditions (stop early, minimize resource usage)
   */
  conservative: () => {
    const factory = new OptimizedConditionFactory({
      optimizationStrategy: 'conservative',
      targetExecutionTime: 15000, // 15 seconds
      targetTokenUsage: 2000,
      targetStepCount: 5,
    });
    return factory.createOptimizedConditions();
  },

  /**
   * Create balanced conditions (standard optimization)
   */
  balanced: () => {
    const factory = new OptimizedConditionFactory({
      optimizationStrategy: 'balanced',
    });
    return factory.createOptimizedConditions();
  },

  /**
   * Create aggressive conditions (allow longer execution for complex tasks)
   */
  aggressive: () => {
    const factory = new OptimizedConditionFactory({
      optimizationStrategy: 'aggressive',
      targetExecutionTime: 60000, // 1 minute
      targetTokenUsage: 10000,
      targetStepCount: 15,
    });
    return factory.createOptimizedConditions();
  },

  /**
   * Create research-focused conditions (optimized for information gathering)
   */
  research: () => {
    const factory = new OptimizedConditionFactory({
      optimizationStrategy: 'aggressive',
      targetExecutionTime: 120000, // 2 minutes
      targetTokenUsage: 20000,
      targetStepCount: 25,
    });
    return factory.createOptimizedConditions();
  },

  /**
   * Create conditions with custom learning from provided performance data
   */
  withLearning: (
    performanceHistory: AgentPerformanceMetrics[],
    config?: ConditionOptimizationConfig,
  ) => {
    const factory = new OptimizedConditionFactory({
      adaptiveLearning: true,
      ...config,
    });

    performanceHistory.forEach(metrics => factory.addPerformanceData(metrics));
    return factory.createOptimizedConditions();
  },
};
