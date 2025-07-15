/**
 * AI SDK v5 Agent Utilities
 * Utility functions and helpers for agent framework
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import type { LanguageModel } from 'ai';
import { generateText } from 'ai';
import type { MultiStepConfig, MultiStepResult } from './multi-step-execution';
import type { StepCondition } from './step-conditions';

/**
 * Agent execution options
 */
export interface AgentExecutionOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  fallbackModel?: LanguageModel;
  gracefulDegradation?: boolean;
  trackMetrics?: boolean;
}

/**
 * Agent metrics
 */
export interface AgentMetrics {
  executionTime: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  stepCount: number;
  toolCallCount: number;
  averageStepTime: number;
  successRate: number;
  errorCount: number;
}

/**
 * Agent execution context for monitoring and debugging
 */
export interface AgentExecutionContext {
  agentId: string;
  sessionId: string;
  startTime: number;
  metrics: Partial<AgentMetrics>;
  steps: any[];
  errors: Error[];
  warnings: string[];
}

/**
 * Create an enhanced agent executor with retry logic and monitoring
 */
export class AgentExecutor {
  private contexts = new Map<string, AgentExecutionContext>();
  private globalMetrics: AgentMetrics[] = [];

  /**
   * Execute an agent with enhanced error handling and monitoring
   */
  async executeWithRetry(
    agentId: string,
    prompt: string,
    config: MultiStepConfig,
    options: AgentExecutionOptions = {},
  ): Promise<MultiStepResult> {
    const sessionId = this.generateSessionId();
    const context: AgentExecutionContext = {
      agentId,
      sessionId,
      startTime: Date.now(),
      metrics: {},
      steps: [],
      errors: [],
      warnings: [],
    };

    this.contexts.set(sessionId, context);

    const {
      timeout = 300000, // 5 minutes
      retryAttempts = 3,
      retryDelay = 1000,
      fallbackModel,
      gracefulDegradation = true,
      trackMetrics = true,
    } = options;

    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt < retryAttempts) {
      try {
        logInfo('Agent Executor: Starting execution attempt', {
          operation: 'agent_executor_attempt',
          metadata: {
            agentId,
            sessionId,
            attempt: attempt + 1,
            maxAttempts: retryAttempts,
          },
        });

        const result = await this.executeWithTimeout(
          prompt,
          config,
          context,
          timeout,
          trackMetrics,
        );

        // Update success metrics
        if (trackMetrics) {
          this.updateSuccessMetrics(context, result);
        }

        logInfo('Agent Executor: Execution successful', {
          operation: 'agent_executor_success',
          metadata: {
            agentId,
            sessionId,
            attempt: attempt + 1,
            executionTime: Date.now() - context.startTime,
          },
        });

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        context.errors.push(lastError);
        attempt++;

        logWarn('Agent Executor: Execution attempt failed', {
          operation: 'agent_executor_attempt_failed',
          metadata: {
            agentId,
            sessionId,
            attempt,
            maxAttempts: retryAttempts,
            error: lastError.message,
          },
        });

        if (attempt < retryAttempts) {
          // Try with fallback model if available and this is the last attempt before final
          if (fallbackModel && attempt === retryAttempts - 1) {
            logInfo('Agent Executor: Using fallback model', {
              operation: 'agent_executor_fallback_model',
              metadata: { agentId, sessionId },
            });

            config = { ...config, model: fallbackModel };
          }

          // Wait before retry
          await this.delay(retryDelay * attempt);
        }
      }
    }

    // All attempts failed
    if (gracefulDegradation) {
      logWarn('Agent Executor: All attempts failed, returning graceful degradation', {
        operation: 'agent_executor_graceful_degradation',
        metadata: { agentId, sessionId, attempts: retryAttempts },
      });

      return this.createGracefulDegradationResult(context, lastError ?? new Error('Unknown error'));
    }

    logError('Agent Executor: All attempts failed', {
      operation: 'agent_executor_all_failed',
      metadata: { agentId, sessionId, attempts: retryAttempts },
      error: lastError ?? new Error('Unknown error'),
    });

    throw lastError ?? new Error('Unknown error');
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(
    prompt: string,
    config: MultiStepConfig,
    context: AgentExecutionContext,
    timeout: number,
    trackMetrics: boolean,
  ): Promise<MultiStepResult> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent execution timed out after ${timeout}ms`));
      }, timeout);
    });

    const executionPromise = this.executeAgent(prompt, config, context, trackMetrics);

    return Promise.race([executionPromise, timeoutPromise]);
  }

  /**
   * Core agent execution logic
   */
  private async executeAgent(
    prompt: string,
    config: MultiStepConfig,
    context: AgentExecutionContext,
    trackMetrics: boolean,
  ): Promise<MultiStepResult> {
    const startTime = Date.now();
    let totalTokensUsed = 0;
    const steps: any[] = [];

    const result = await generateText({
      model: config.model,
      prompt,
      tools: config.tools,
      system: config.system,
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens,
      ...(config.stopWhen && { stopWhen: config.stopWhen }),
      ...(config.prepareStep && { prepareStep: config.prepareStep }),
      onStepFinish: async stepResult => {
        steps.push(stepResult);
        context.steps.push(stepResult);
        totalTokensUsed += stepResult.usage?.totalTokens || 0;

        if (trackMetrics) {
          this.updateStepMetrics(context, stepResult);
        }

        // Call original callback if provided
        if (config.onStepFinish) {
          try {
            await config.onStepFinish(stepResult);
          } catch (error) {
            const warning = `Step finish callback failed: ${error}`;
            context.warnings.push(warning);
            logWarn('Agent Executor: Step callback failed', {
              operation: 'agent_executor_step_callback_error',
              metadata: { sessionId: context.sessionId },
            });
          }
        }
      },
    });

    const executionTime = Date.now() - startTime;

    return {
      steps,
      finalResult: result,
      totalTokensUsed,
      executionTime,
      stoppedBy: result.finishReason || 'completed',
      metadata: {
        sessionId: context.sessionId,
        stepCount: steps.length,
        averageTokensPerStep: totalTokensUsed / Math.max(steps.length, 1),
        executionTimePerStep: executionTime / Math.max(steps.length, 1),
        warningCount: context.warnings.length,
        errorCount: context.errors.length,
      },
    };
  }

  /**
   * Update step metrics
   */
  private updateStepMetrics(context: AgentExecutionContext, stepResult: any): void {
    if (!context.metrics.tokenUsage) {
      context.metrics.tokenUsage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      };
    }

    if (stepResult.usage) {
      context.metrics.tokenUsage.promptTokens += stepResult.usage.promptTokens || 0;
      context.metrics.tokenUsage.completionTokens += stepResult.usage.completionTokens || 0;
      context.metrics.tokenUsage.totalTokens += stepResult.usage.totalTokens || 0;
    }

    context.metrics.stepCount = (context.metrics.stepCount || 0) + 1;
    context.metrics.toolCallCount =
      (context.metrics.toolCallCount || 0) + (stepResult.toolCalls?.length || 0);
  }

  /**
   * Update success metrics
   */
  private updateSuccessMetrics(context: AgentExecutionContext, result: MultiStepResult): void {
    const executionTime = Date.now() - context.startTime;

    context.metrics.executionTime = executionTime;
    context.metrics.averageStepTime = executionTime / Math.max(result.steps.length, 1);
    context.metrics.successRate = 1; // This execution was successful
    context.metrics.errorCount = context.errors.length;

    // Add to global metrics
    this.globalMetrics.push(context.metrics as AgentMetrics);
  }

  /**
   * Create graceful degradation result
   */
  private createGracefulDegradationResult(
    context: AgentExecutionContext,
    error: Error,
  ): MultiStepResult {
    const executionTime = Date.now() - context.startTime;

    return {
      steps: context.steps,
      finalResult: {
        text: 'Agent execution failed, returning partial results',
        finishReason: 'error',
        usage: context.metrics.tokenUsage,
      },
      totalTokensUsed: context.metrics.tokenUsage?.totalTokens || 0,
      executionTime,
      stoppedBy: 'error_graceful_degradation',
      metadata: {
        sessionId: context.sessionId,
        gracefulDegradation: true,
        originalError: error.message,
        warningCount: context.warnings.length,
        errorCount: context.errors.length,
      },
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get execution context
   */
  getExecutionContext(sessionId: string): AgentExecutionContext | undefined {
    return this.contexts.get(sessionId);
  }

  /**
   * Get global metrics summary
   */
  getGlobalMetrics(): {
    totalExecutions: number;
    averageExecutionTime: number;
    averageTokenUsage: number;
    averageStepCount: number;
    successRate: number;
    totalErrors: number;
  } {
    if (this.globalMetrics.length === 0) {
      return {
        totalExecutions: 0,
        averageExecutionTime: 0,
        averageTokenUsage: 0,
        averageStepCount: 0,
        successRate: 0,
        totalErrors: 0,
      };
    }

    const totalExecutions = this.globalMetrics.length;
    const totalExecutionTime = this.globalMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    const totalTokens = this.globalMetrics.reduce((sum, m) => sum + m.tokenUsage.totalTokens, 0);
    const totalSteps = this.globalMetrics.reduce((sum, m) => sum + m.stepCount, 0);
    const successfulExecutions = this.globalMetrics.filter(m => m.successRate > 0).length;
    const totalErrors = this.globalMetrics.reduce((sum, m) => sum + m.errorCount, 0);

    return {
      totalExecutions,
      averageExecutionTime: totalExecutionTime / totalExecutions,
      averageTokenUsage: totalTokens / totalExecutions,
      averageStepCount: totalSteps / totalExecutions,
      successRate: successfulExecutions / totalExecutions,
      totalErrors,
    };
  }

  /**
   * Clear metrics and contexts
   */
  clearMetrics(): void {
    this.globalMetrics = [];
    this.contexts.clear();

    logInfo('Agent Executor: Metrics cleared', {
      operation: 'agent_executor_metrics_cleared',
    });
  }
}

/**
 * Agent validation utilities
 */
export class AgentValidator {
  /**
   * Validate agent configuration
   */
  static validateAgentConfig(config: MultiStepConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!config.model) {
      errors.push('Model is required');
    }

    // Check maxSteps
    if (config.maxSteps && config.maxSteps < 1) {
      errors.push('maxSteps must be at least 1');
    }

    if (config.maxSteps && config.maxSteps > 50) {
      warnings.push('maxSteps > 50 may result in high token usage');
    }

    // Check temperature
    if (config.temperature !== undefined) {
      if (config.temperature < 0 || config.temperature > 2) {
        errors.push('temperature must be between 0 and 2');
      }
    }

    // Check tools
    if (config.tools && Object.keys(config.tools).length > 20) {
      warnings.push('Large number of tools may affect performance');
    }

    // Check system prompt length
    if (config.system && config.system.length > 10000) {
      warnings.push('Very long system prompt may affect performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate stop conditions
   */
  static validateStopConditions(conditions: StepCondition[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (conditions.length === 0) {
      warnings.push('No stop conditions defined - agent may run indefinitely');
    }

    if (conditions.length > 10) {
      warnings.push('Large number of stop conditions may affect performance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Agent performance analyzer
 */
export class AgentPerformanceAnalyzer {
  /**
   * Analyze agent performance from execution results
   */
  static analyzePerformance(results: MultiStepResult[]): {
    averageExecutionTime: number;
    averageTokenUsage: number;
    averageStepCount: number;
    tokenEfficiency: number;
    stepEfficiency: number;
    recommendations: string[];
  } {
    if (results.length === 0) {
      return {
        averageExecutionTime: 0,
        averageTokenUsage: 0,
        averageStepCount: 0,
        tokenEfficiency: 0,
        stepEfficiency: 0,
        recommendations: ['No execution data available'],
      };
    }

    const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    const totalTokens = results.reduce((sum, r) => sum + r.totalTokensUsed, 0);
    const totalSteps = results.reduce((sum, r) => sum + r.steps.length, 0);

    const averageExecutionTime = totalExecutionTime / results.length;
    const averageTokenUsage = totalTokens / results.length;
    const averageStepCount = totalSteps / results.length;

    // Calculate efficiency metrics
    const tokenEfficiency = averageTokenUsage / Math.max(averageExecutionTime / 1000, 1); // tokens per second
    const stepEfficiency = averageStepCount / Math.max(averageExecutionTime / 1000, 1); // steps per second

    // Generate recommendations
    const recommendations: string[] = [];

    if (averageExecutionTime > 60000) {
      recommendations.push('Consider reducing maxSteps or optimizing tools for faster execution');
    }

    if (averageTokenUsage > 10000) {
      recommendations.push(
        'High token usage detected - consider shorter system prompts or more efficient tools',
      );
    }

    if (averageStepCount > 20) {
      recommendations.push(
        'High step count - consider better stop conditions or more focused agent design',
      );
    }

    if (tokenEfficiency < 10) {
      recommendations.push(
        'Low token efficiency - consider optimizing model selection or prompt design',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Agent performance looks good');
    }

    return {
      averageExecutionTime,
      averageTokenUsage,
      averageStepCount,
      tokenEfficiency,
      stepEfficiency,
      recommendations,
    };
  }
}

/**
 * Global agent executor instance
 */
export const globalAgentExecutor = new AgentExecutor();

/**
 * Utility functions for common agent operations
 */
export const agentUtils = {
  /**
   * Create a simple agent configuration
   */
  createSimpleConfig: (
    model: LanguageModel,
    tools: Record<string, any>,
    options: {
      maxSteps?: number;
      temperature?: number;
      system?: string;
    } = {},
  ): MultiStepConfig => ({
    model,
    tools,
    maxSteps: options.maxSteps || 10,
    temperature: options.temperature || 0.5,
    system: options.system,
  }),

  /**
   * Execute agent with default error handling
   */
  executeWithDefaults: async (
    agentId: string,
    prompt: string,
    config: MultiStepConfig,
  ): Promise<MultiStepResult> => {
    return globalAgentExecutor.executeWithRetry(agentId, prompt, config, {
      retryAttempts: 2,
      gracefulDegradation: true,
      trackMetrics: true,
    });
  },

  /**
   * Validate and execute agent
   */
  validateAndExecute: async (
    agentId: string,
    prompt: string,
    config: MultiStepConfig,
  ): Promise<MultiStepResult> => {
    const validation = AgentValidator.validateAgentConfig(config);

    if (!validation.valid) {
      throw new Error(`Agent configuration invalid: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      logWarn('Agent configuration warnings', {
        operation: 'agent_config_warnings',
        metadata: { warnings: validation.warnings },
      });
    }

    return agentUtils.executeWithDefaults(agentId, prompt, config);
  },
} as const;
