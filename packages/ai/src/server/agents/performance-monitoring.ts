/**
 * Multi-Step Agent Performance Monitoring and Optimization
 * Advanced performance tracking and optimization for multi-step agent execution
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import type { StepCondition } from './step-conditions';

/**
 * Performance metrics for agent execution
 */
export interface AgentPerformanceMetrics {
  executionTime: number;
  tokenUsage: {
    total: number;
    prompt: number;
    completion: number;
    averagePerStep: number;
  };
  stepMetrics: {
    totalSteps: number;
    averageStepTime: number;
    slowestStepTime: number;
    fastestStepTime: number;
    stepsWithToolCalls: number;
    stepsWithErrors: number;
  };
  efficiency: {
    tokensPerSecond: number;
    stepsPerSecond: number;
    toolCallSuccessRate: number;
    errorRate: number;
  };
  resourceUsage: {
    peakMemoryMB?: number;
    averageMemoryMB?: number;
    cpuTime?: number;
  };
}

/**
 * Step-level performance data
 */
export interface StepPerformanceData {
  stepNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCallCount: number;
  hasError: boolean;
  finishReason?: string;
  memoryUsageMB?: number;
  complexity?: 'low' | 'medium' | 'high';
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitorConfig {
  enableMemoryTracking?: boolean;
  enableCPUTracking?: boolean;
  enableDetailedStepTracking?: boolean;
  warningThresholds?: {
    stepTimeMs?: number;
    totalTimeMs?: number;
    tokensPerStep?: number;
    memoryUsageMB?: number;
  };
  optimizationHints?: boolean;
}

/**
 * Agent Performance Monitor
 */
export class AgentPerformanceMonitor {
  private stepData: StepPerformanceData[] = [];
  private startTime: number = 0;
  private totalTokens: number = 0;
  private config: PerformanceMonitorConfig;
  private memoryBaseline?: number;

  constructor(config: PerformanceMonitorConfig = {}) {
    this.config = {
      enableMemoryTracking: true,
      enableCPUTracking: false,
      enableDetailedStepTracking: true,
      warningThresholds: {
        stepTimeMs: 10000, // 10 seconds
        totalTimeMs: 60000, // 1 minute
        tokensPerStep: 2000,
        memoryUsageMB: 500,
      },
      optimizationHints: true,
      ...config,
    };
  }

  /**
   * Start monitoring an agent execution
   */
  startMonitoring(): void {
    this.startTime = Date.now();
    this.stepData = [];
    this.totalTokens = 0;

    if (this.config.enableMemoryTracking) {
      this.memoryBaseline = this.getMemoryUsage();
    }

    logInfo('Agent Performance Monitor: Started monitoring', {
      operation: 'agent_perf_monitor_start',
      metadata: {
        enableMemoryTracking: this.config.enableMemoryTracking,
        enableDetailedStepTracking: this.config.enableDetailedStepTracking,
      },
    });
  }

  /**
   * Record the start of a step
   */
  recordStepStart(stepNumber: number): void {
    if (!this.config.enableDetailedStepTracking) return;

    const stepData: StepPerformanceData = {
      stepNumber,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      toolCallCount: 0,
      hasError: false,
      memoryUsageMB: this.config.enableMemoryTracking ? this.getMemoryUsage() : undefined,
    };

    this.stepData[stepNumber] = stepData;
  }

  /**
   * Record the completion of a step
   */
  recordStepComplete(stepResult: any): void {
    const stepNumber = stepResult.stepNumber || this.stepData.length - 1;
    const stepData = this.stepData[stepNumber];

    if (!stepData) return;

    stepData.endTime = Date.now();
    stepData.duration = stepData.endTime - stepData.startTime;
    stepData.tokenUsage = stepResult.usage;
    stepData.toolCallCount = stepResult.toolCalls?.length || 0;
    stepData.hasError = stepResult.finishReason === 'error' || false;
    stepData.finishReason = stepResult.finishReason;

    if (this.config.enableMemoryTracking) {
      stepData.memoryUsageMB = this.getMemoryUsage();
    }

    // Determine step complexity
    stepData.complexity = this.categorizeStepComplexity(stepData);

    // Update total token count
    if (stepData.tokenUsage) {
      this.totalTokens += stepData.tokenUsage.totalTokens;
    }

    // Check for warnings
    this.checkStepWarnings(stepData);

    logInfo('Agent Performance Monitor: Step completed', {
      operation: 'agent_perf_monitor_step',
      metadata: {
        stepNumber,
        duration: stepData.duration,
        tokenUsage: stepData.tokenUsage?.totalTokens,
        toolCallCount: stepData.toolCallCount,
        complexity: stepData.complexity,
      },
    });
  }

  /**
   * Complete monitoring and generate final metrics
   */
  completeMonitoring(): AgentPerformanceMetrics {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    const stepMetrics = this.calculateStepMetrics();
    const efficiency = this.calculateEfficiencyMetrics(totalTime);
    const resourceUsage = this.calculateResourceUsage();

    const metrics: AgentPerformanceMetrics = {
      executionTime: totalTime,
      tokenUsage: {
        total: this.totalTokens,
        prompt: this.stepData.reduce((sum, step) => sum + (step.tokenUsage?.promptTokens || 0), 0),
        completion: this.stepData.reduce(
          (sum, step) => sum + (step.tokenUsage?.completionTokens || 0),
          0,
        ),
        averagePerStep: this.totalTokens / Math.max(this.stepData.length, 1),
      },
      stepMetrics,
      efficiency,
      resourceUsage,
    };

    if (this.config.optimizationHints) {
      this.generateOptimizationHints(metrics);
    }

    logInfo('Agent Performance Monitor: Monitoring completed', {
      operation: 'agent_perf_monitor_complete',
      metadata: {
        totalTime,
        totalSteps: this.stepData.length,
        totalTokens: this.totalTokens,
        efficiency: efficiency.tokensPerSecond,
      },
    });

    return metrics;
  }

  /**
   * Get current memory usage in MB
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024;
    }
    return 0;
  }

  /**
   * Categorize step complexity based on various factors
   */
  private categorizeStepComplexity(stepData: StepPerformanceData): 'low' | 'medium' | 'high' {
    const { duration, toolCallCount, tokenUsage } = stepData;
    const tokens = tokenUsage?.totalTokens || 0;

    if (duration > 8000 || toolCallCount > 3 || tokens > 1500) {
      return 'high';
    } else if (duration > 3000 || toolCallCount > 1 || tokens > 500) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Calculate step-level metrics
   */
  private calculateStepMetrics() {
    const durations = this.stepData.map(step => step.duration).filter(d => d > 0);
    const stepsWithToolCalls = this.stepData.filter(step => step.toolCallCount > 0).length;
    const stepsWithErrors = this.stepData.filter(step => step.hasError).length;

    return {
      totalSteps: this.stepData.length,
      averageStepTime:
        durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      slowestStepTime: durations.length > 0 ? Math.max(...durations) : 0,
      fastestStepTime: durations.length > 0 ? Math.min(...durations) : 0,
      stepsWithToolCalls,
      stepsWithErrors,
    };
  }

  /**
   * Calculate efficiency metrics
   */
  private calculateEfficiencyMetrics(totalTime: number) {
    const totalSteps = this.stepData.length;
    const successfulToolCalls = this.stepData.reduce((sum, step) => {
      return sum + (step.hasError ? 0 : step.toolCallCount);
    }, 0);
    const totalToolCalls = this.stepData.reduce((sum, step) => sum + step.toolCallCount, 0);

    return {
      tokensPerSecond: totalTime > 0 ? (this.totalTokens / totalTime) * 1000 : 0,
      stepsPerSecond: totalTime > 0 ? (totalSteps / totalTime) * 1000 : 0,
      toolCallSuccessRate: totalToolCalls > 0 ? successfulToolCalls / totalToolCalls : 1,
      errorRate:
        totalSteps > 0 ? this.stepData.filter(step => step.hasError).length / totalSteps : 0,
    };
  }

  /**
   * Calculate resource usage metrics
   */
  private calculateResourceUsage() {
    const memoryUsages = this.stepData
      .map(step => step.memoryUsageMB)
      .filter((usage): usage is number => usage !== undefined);

    return {
      peakMemoryMB: memoryUsages.length > 0 ? Math.max(...memoryUsages) : undefined,
      averageMemoryMB:
        memoryUsages.length > 0
          ? memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length
          : undefined,
      cpuTime: undefined, // CPU tracking not implemented yet
    };
  }

  /**
   * Check for performance warnings on individual steps
   */
  private checkStepWarnings(stepData: StepPerformanceData): void {
    const thresholds = this.config.warningThresholds;
    if (!thresholds) return;

    if (stepData.duration > (thresholds.stepTimeMs ?? Infinity)) {
      logWarn('Agent Performance Monitor: Slow step detected', {
        operation: 'agent_perf_slow_step',
        metadata: {
          stepNumber: stepData.stepNumber,
          duration: stepData.duration,
          threshold: thresholds.stepTimeMs,
          toolCallCount: stepData.toolCallCount,
          complexity: stepData.complexity,
        },
      });
    }

    if (
      stepData.tokenUsage &&
      stepData.tokenUsage.totalTokens > (thresholds.tokensPerStep ?? Infinity)
    ) {
      logWarn('Agent Performance Monitor: High token usage in step', {
        operation: 'agent_perf_high_tokens',
        metadata: {
          stepNumber: stepData.stepNumber,
          tokenUsage: stepData.tokenUsage.totalTokens,
          threshold: thresholds.tokensPerStep,
        },
      });
    }

    if (stepData.memoryUsageMB && stepData.memoryUsageMB > (thresholds.memoryUsageMB ?? Infinity)) {
      logWarn('Agent Performance Monitor: High memory usage in step', {
        operation: 'agent_perf_high_memory',
        metadata: {
          stepNumber: stepData.stepNumber,
          memoryUsage: stepData.memoryUsageMB,
          threshold: thresholds.memoryUsageMB,
        },
      });
    }
  }

  /**
   * Generate optimization hints based on performance data
   */
  private generateOptimizationHints(metrics: AgentPerformanceMetrics): void {
    const hints: string[] = [];

    // Step time optimization
    if (metrics.stepMetrics.averageStepTime > 5000) {
      hints.push('Consider breaking down complex steps or optimizing tool implementations');
    }

    // Token usage optimization
    if (metrics.tokenUsage.averagePerStep > 1000) {
      hints.push('Consider more concise prompts or breaking down tasks into smaller steps');
    }

    // Tool call optimization
    if (metrics.efficiency.toolCallSuccessRate < 0.8) {
      hints.push('High tool call failure rate - review tool configurations and error handling');
    }

    // Error rate optimization
    if (metrics.efficiency.errorRate > 0.1) {
      hints.push('High error rate detected - review step conditions and error handling');
    }

    // Memory optimization
    if (metrics.resourceUsage.peakMemoryMB && metrics.resourceUsage.peakMemoryMB > 300) {
      hints.push('High memory usage - consider implementing streaming or batch processing');
    }

    if (hints.length > 0) {
      logInfo('Agent Performance Monitor: Optimization hints', {
        operation: 'agent_perf_optimization_hints',
        metadata: { hints },
      });
    }
  }

  /**
   * Get detailed step data for analysis
   */
  getStepData(): StepPerformanceData[] {
    return [...this.stepData];
  }

  /**
   * Get performance summary for a specific step range
   */
  getStepRangeMetrics(startStep: number, endStep: number): Partial<AgentPerformanceMetrics> {
    const rangeData = this.stepData.slice(startStep, endStep + 1);
    const totalTime = rangeData.reduce((sum, step) => sum + step.duration, 0);
    const totalTokens = rangeData.reduce(
      (sum, step) => sum + (step.tokenUsage?.totalTokens || 0),
      0,
    );

    return {
      executionTime: totalTime,
      tokenUsage: {
        total: totalTokens,
        prompt: rangeData.reduce((sum, step) => sum + (step.tokenUsage?.promptTokens || 0), 0),
        completion: rangeData.reduce(
          (sum, step) => sum + (step.tokenUsage?.completionTokens || 0),
          0,
        ),
        averagePerStep: totalTokens / Math.max(rangeData.length, 1),
      },
      stepMetrics: {
        totalSteps: rangeData.length,
        averageStepTime: totalTime / Math.max(rangeData.length, 1),
        slowestStepTime: Math.max(...rangeData.map(s => s.duration)),
        fastestStepTime: Math.min(...rangeData.map(s => s.duration)),
        stepsWithToolCalls: rangeData.filter(s => s.toolCallCount > 0).length,
        stepsWithErrors: rangeData.filter(s => s.hasError).length,
      },
    };
  }

  /**
   * Clean up resources and destroy the monitor
   */
  destroy(): void {
    this.stepData = [];
    this.totalTokens = 0;
    this.startTime = 0;
    this.memoryBaseline = undefined;
  }

  /**
   * Get workflow metrics for complex workflows
   */
  getWorkflowMetrics(workflowName?: string): {
    totalSteps: number;
    completedSteps: number;
    size: number;
    hits: number;
    misses: number;
    evictions: number;
    avgHitRate: number;
  } {
    const totalSteps = this.stepData.length;
    const successfulSteps = this.stepData.filter(step => !step.hasError).length;

    return {
      totalSteps,
      completedSteps: successfulSteps,
      size: totalSteps,
      hits: successfulSteps,
      misses: totalSteps - successfulSteps,
      evictions: 0, // Not applicable for this context
      avgHitRate: totalSteps > 0 ? successfulSteps / totalSteps : 0,
    };
  }
}

/**
 * Create optimized step conditions based on performance analysis
 */
export function createPerformanceOptimizedConditions(
  performanceHistory: AgentPerformanceMetrics[],
): StepCondition[] {
  const avgExecutionTime =
    performanceHistory.reduce((sum, m) => sum + m.executionTime, 0) / performanceHistory.length;
  const avgTokensPerStep =
    performanceHistory.reduce((sum, m) => sum + m.tokenUsage.averagePerStep, 0) /
    performanceHistory.length;
  const avgStepsPerExecution =
    performanceHistory.reduce((sum, m) => sum + m.stepMetrics.totalSteps, 0) /
    performanceHistory.length;

  const conditions: StepCondition[] = [];

  // Optimize based on historical execution time
  if (avgExecutionTime > 30000) {
    // 30 seconds
    conditions.push(
      ({ steps }) => steps.length >= Math.max(3, Math.floor(avgStepsPerExecution * 0.7)),
    );
  }

  // Optimize based on token usage patterns
  if (avgTokensPerStep > 800) {
    conditions.push(({ usage }: any) => {
      const totalTokens = usage?.totalTokens || 0;
      return totalTokens >= avgTokensPerStep * avgStepsPerExecution * 0.8;
    });
  }

  // Add error-based early termination
  conditions.push(({ toolResults }: any) => {
    if (!toolResults) return false;
    const errorCount = toolResults.filter((r: any) => r.error).length;
    return errorCount >= 2; // Stop after 2 consecutive errors
  });

  return conditions;
}

/**
 * Performance benchmarking utilities
 */
export const performanceBenchmarks = {
  /**
   * Benchmark different step condition strategies
   */
  async benchmarkStepConditions(
    baseConfig: any,
    testPrompts: string[],
    conditionSets: { name: string; conditions: StepCondition[] }[],
  ) {
    const results: Record<string, AgentPerformanceMetrics[]> = {};

    for (const { name, conditions: _conditions } of conditionSets) {
      results[name] = [];

      for (const _prompt of testPrompts) {
        const monitor = new AgentPerformanceMonitor();
        monitor.startMonitoring();

        try {
          // This would be replaced with actual executeMultiStepAgent call
          // const result = await executeMultiStepAgent(prompt, {
          //   ...baseConfig,
          //   stopWhen: conditions,
          //   onStepFinish: (step) => monitor.recordStepComplete(step)
          // });

          const metrics = monitor.completeMonitoring();
          results[name].push(metrics);
        } catch (error) {
          logWarn(`Benchmark failed for ${name}`, {
            operation: 'agent_perf_benchmark_error',
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    }

    return results;
  },

  /**
   * Calculate performance comparison metrics
   */
  comparePerformanceResults(results: Record<string, AgentPerformanceMetrics[]>) {
    const comparison: Record<string, any> = {};

    for (const [name, metrics] of Object.entries(results)) {
      const avgTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
      const avgTokens = metrics.reduce((sum, m) => sum + m.tokenUsage.total, 0) / metrics.length;
      const avgSteps =
        metrics.reduce((sum, m) => sum + m.stepMetrics.totalSteps, 0) / metrics.length;
      const avgEfficiency =
        metrics.reduce((sum, m) => sum + m.efficiency.tokensPerSecond, 0) / metrics.length;

      comparison[name] = {
        averageExecutionTime: avgTime,
        averageTokenUsage: avgTokens,
        averageSteps: avgSteps,
        averageEfficiency: avgEfficiency,
        successRate: metrics.filter(m => m.efficiency.errorRate < 0.1).length / metrics.length,
      };
    }

    return comparison;
  },
};
