/**
 * MCP Tool Chain Orchestration System
 * Advanced workflow management for chaining multiple MCP tools and operations
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import { EventEmitter } from 'events';
import type { FeatureFlagContext } from '../feature-flags/config';
import { mcpAnalytics } from './analytics';
import type { McpManagedConnection } from './connection-pool';
import { mcpConnectionPool } from './connection-pool';

/**
 * Tool execution context
 */
export interface McpToolExecutionContext {
  executionId: string;
  sessionId?: string;
  userId?: string;
  parentExecutionId?: string;
  depth: number;
  startTime: number;
  timeout: number;
  retryCount: number;
  metadata: Record<string, any>;
}

/**
 * Tool execution step definition
 */
export interface McpToolStep {
  id: string;
  name: string;
  description?: string;
  toolName: string;
  connectionId?: string;
  profileId?: string;
  parameters: Record<string, any>;
  condition?: McpStepCondition;
  retryPolicy?: McpRetryPolicy;
  timeout?: number;
  parallelGroup?: string;
  dependencies?: string[];
  outputs?: string[];
  errorHandling?: McpErrorHandling;
  metadata?: Record<string, any>;
}

/**
 * Step execution condition
 */
export interface McpStepCondition {
  type: 'always' | 'on_success' | 'on_failure' | 'on_condition';
  expression?: string; // JavaScript expression for evaluation
  expectedValues?: Record<string, any>;
}

/**
 * Retry policy for step execution
 */
export interface McpRetryPolicy {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelayMs: number;
  maxDelayMs: number;
  retryOn?: string[]; // Error types to retry on
}

/**
 * Error handling strategy
 */
export interface McpErrorHandling {
  strategy: 'fail_fast' | 'continue' | 'retry' | 'fallback';
  fallbackStep?: string;
  maxErrors?: number;
  timeout?: number;
}

/**
 * Tool chain workflow definition
 */
export interface McpToolChain {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: McpToolStep[];
  globalSettings: {
    timeout: number;
    maxParallelExecution: number;
    retryPolicy: McpRetryPolicy;
    errorHandling: McpErrorHandling;
  };
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
  metadata: {
    author: string;
    created: string;
    modified: string;
    tags: string[];
    category: string;
  };
}

/**
 * Step execution result
 */
export interface McpStepExecutionResult {
  stepId: string;
  success: boolean;
  output: any;
  error?: Error;
  executionTime: number;
  retryCount: number;
  metadata: {
    connectionId?: string;
    toolName: string;
    startTime: number;
    endTime: number;
    memoryUsage?: number;
  };
}

/**
 * Chain execution result
 */
export interface McpChainExecutionResult {
  chainId: string;
  executionId: string;
  success: boolean;
  totalExecutionTime: number;
  stepsExecuted: number;
  stepsSuccessful: number;
  stepsFailed: number;
  stepsSkipped: number;
  stepResults: McpStepExecutionResult[];
  finalOutput: any;
  error?: Error;
  metadata: {
    userId?: string;
    sessionId?: string;
    startTime: number;
    endTime: number;
    peakMemoryUsage: number;
    networkRequests: number;
  };
}

/**
 * Execution state
 */
export type McpExecutionState =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Active execution tracking
 */
export interface McpActiveExecution {
  executionId: string;
  chainId: string;
  state: McpExecutionState;
  currentStep?: string;
  context: McpToolExecutionContext;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  startTime: number;
  estimatedCompletion?: number;
  error?: Error;
}

/**
 * Orchestration configuration
 */
export interface McpOrchestrationConfig {
  maxConcurrentChains: number;
  maxConcurrentSteps: number;
  defaultTimeout: number;
  enablePersistence: boolean;
  enableAnalytics: boolean;
  resourceLimits: {
    maxMemoryMB: number;
    maxExecutionTime: number;
    maxNetworkRequests: number;
  };
}

/**
 * Default orchestration configuration
 */
const DEFAULT_ORCHESTRATION_CONFIG: McpOrchestrationConfig = {
  maxConcurrentChains: 5,
  maxConcurrentSteps: 20,
  defaultTimeout: 300000, // 5 minutes
  enablePersistence: true,
  enableAnalytics: true,
  resourceLimits: {
    maxMemoryMB: 512,
    maxExecutionTime: 600000, // 10 minutes
    maxNetworkRequests: 100,
  },
};

/**
 * MCP Tool Chain Orchestrator
 */
export class McpToolChainOrchestrator extends EventEmitter {
  private toolChains = new Map<string, McpToolChain>();
  private activeExecutions = new Map<string, McpActiveExecution>();
  private executionHistory = new Map<string, McpChainExecutionResult>();
  private resourceMonitor: NodeJS.Timeout | null = null;

  constructor(private config: McpOrchestrationConfig = DEFAULT_ORCHESTRATION_CONFIG) {
    super();
    this.startResourceMonitoring();
  }

  /**
   * Register a tool chain
   */
  registerToolChain(toolChain: McpToolChain): void {
    // Validate tool chain
    this.validateToolChain(toolChain);

    this.toolChains.set(toolChain.id, toolChain);

    logInfo('MCP Orchestrator: Tool chain registered', {
      operation: 'orchestrator_chain_registered',
      metadata: {
        chainId: toolChain.id,
        chainName: toolChain.name,
        stepsCount: toolChain.steps.length,
        version: toolChain.version,
      },
    });
  }

  /**
   * Execute a tool chain
   */
  async executeToolChain(
    chainId: string,
    inputs: Record<string, any> = {},
    context: FeatureFlagContext = {},
  ): Promise<McpChainExecutionResult> {
    const toolChain = this.toolChains.get(chainId);
    if (!toolChain) {
      throw new Error(`Tool chain '${chainId}' not found`);
    }

    // Check execution limits
    if (this.activeExecutions.size >= this.config.maxConcurrentChains) {
      throw new Error('Maximum concurrent chain executions reached');
    }

    const executionId = `exec_${chainId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    const executionContext: McpToolExecutionContext = {
      executionId,
      sessionId: context.sessionId,
      userId: context.user?.id,
      depth: 0,
      startTime,
      timeout: toolChain.globalSettings.timeout || this.config.defaultTimeout,
      retryCount: 0,
      metadata: { inputs, chainVersion: toolChain.version },
    };

    const activeExecution: McpActiveExecution = {
      executionId,
      chainId,
      state: 'pending',
      context: executionContext,
      progress: {
        completed: 0,
        total: toolChain.steps.length,
        percentage: 0,
      },
      startTime,
    };

    this.activeExecutions.set(executionId, activeExecution);

    try {
      logInfo('MCP Orchestrator: Starting tool chain execution', {
        operation: 'orchestrator_chain_start',
        metadata: {
          executionId,
          chainId,
          stepsCount: toolChain.steps.length,
          userId: context.user?.id,
        },
      });

      activeExecution.state = 'running';
      this.emit('execution-started', activeExecution);

      // Execute steps
      const stepResults = await this.executeSteps(toolChain, inputs, executionContext);

      // Calculate results
      const successfulSteps = stepResults.filter(r => r.success).length;
      const failedSteps = stepResults.filter(r => !r.success).length;
      const totalExecutionTime = Date.now() - startTime;

      // Determine final output
      const finalOutput = this.extractFinalOutput(stepResults, toolChain);

      const result: McpChainExecutionResult = {
        chainId,
        executionId,
        success: failedSteps === 0,
        totalExecutionTime,
        stepsExecuted: stepResults.length,
        stepsSuccessful: successfulSteps,
        stepsFailed: failedSteps,
        stepsSkipped: toolChain.steps.length - stepResults.length,
        stepResults,
        finalOutput,
        metadata: {
          userId: context.user?.id,
          sessionId: context.sessionId,
          startTime,
          endTime: Date.now(),
          peakMemoryUsage: process.memoryUsage().heapUsed,
          networkRequests: this.countNetworkRequests(stepResults),
        },
      };

      // Update active execution
      activeExecution.state = result.success ? 'completed' : 'failed';
      activeExecution.progress.completed = stepResults.length;
      activeExecution.progress.percentage = 100;

      // Store in history
      this.executionHistory.set(executionId, result);

      // Analytics tracking
      if (this.config.enableAnalytics) {
        mcpAnalytics.trackEvent({
          operationType: 'tool_execution',
          userId: context.user?.id,
          clientType: 'enhanced',
          metadata: {
            toolName: 'tool_chain_orchestration',
            success: result.success,
            executionTime: totalExecutionTime,
            chainId,
            stepsExecuted: result.stepsExecuted,
            stepsSuccessful: result.stepsSuccessful,
            stepsFailed: result.stepsFailed,
          },
        });
      }

      this.emit('execution-completed', result);

      logInfo('MCP Orchestrator: Tool chain execution completed', {
        operation: 'orchestrator_chain_completed',
        metadata: {
          executionId,
          chainId,
          success: result.success,
          totalExecutionTime,
          stepsExecuted: result.stepsExecuted,
          stepsSuccessful: result.stepsSuccessful,
          stepsFailed: result.stepsFailed,
        },
      });

      return result;
    } catch (error) {
      const executionError = error instanceof Error ? error : new Error(String(error));

      activeExecution.state = 'failed';
      activeExecution.error = executionError;

      const result: McpChainExecutionResult = {
        chainId,
        executionId,
        success: false,
        totalExecutionTime: Date.now() - startTime,
        stepsExecuted: 0,
        stepsSuccessful: 0,
        stepsFailed: 0,
        stepsSkipped: toolChain.steps.length,
        stepResults: [],
        finalOutput: null,
        error: executionError,
        metadata: {
          userId: context.user?.id,
          sessionId: context.sessionId,
          startTime,
          endTime: Date.now(),
          peakMemoryUsage: process.memoryUsage().heapUsed,
          networkRequests: 0,
        },
      };

      this.executionHistory.set(executionId, result);

      // Analytics tracking
      if (this.config.enableAnalytics) {
        mcpAnalytics.trackEvent({
          operationType: 'tool_execution',
          userId: context.user?.id,
          clientType: 'enhanced',
          metadata: {
            toolName: 'tool_chain_orchestration',
            success: false,
            chainId,
            errorType: executionError.name,
            errorMessage: executionError.message,
          },
        });
      }

      this.emit('execution-failed', result);

      logError('MCP Orchestrator: Tool chain execution failed', {
        operation: 'orchestrator_chain_failed',
        metadata: { executionId, chainId },
        error: executionError,
      });

      throw executionError;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Execute tool chain steps
   */
  private async executeSteps(
    toolChain: McpToolChain,
    inputs: Record<string, any>,
    context: McpToolExecutionContext,
  ): Promise<McpStepExecutionResult[]> {
    const results: McpStepExecutionResult[] = [];
    const stepOutputs: Record<string, any> = { ...inputs };
    const executedSteps = new Set<string>();

    // Create dependency graph
    const dependencyGraph = this.buildDependencyGraph(toolChain.steps);

    // Execute steps in topological order
    const executionQueue = this.getExecutionOrder(dependencyGraph);

    for (const stepGroup of executionQueue) {
      // Check if steps can be executed in parallel
      const parallelSteps = stepGroup.filter(step => step.parallelGroup);
      const sequentialSteps = stepGroup.filter(step => !step.parallelGroup);

      // Execute parallel steps
      if (parallelSteps.length > 0) {
        const parallelResults = await Promise.allSettled(
          parallelSteps.map(step => this.executeStep(step, stepOutputs, context)),
        );

        parallelResults.forEach((result, index) => {
          const step = parallelSteps[index];
          if (result.status === 'fulfilled') {
            results.push(result.value);
            if (result.value.success && step.outputs) {
              step.outputs.forEach(outputKey => {
                stepOutputs[outputKey] = result.value.output[outputKey];
              });
            }
          } else {
            results.push({
              stepId: step.id,
              success: false,
              output: null,
              error: result.reason,
              executionTime: 0,
              retryCount: 0,
              metadata: {
                toolName: step.toolName,
                startTime: Date.now(),
                endTime: Date.now(),
              },
            });
          }
          executedSteps.add(step.id);
        });
      }

      // Execute sequential steps
      for (const step of sequentialSteps) {
        // Check step condition
        if (!this.shouldExecuteStep(step, stepOutputs, results)) {
          continue;
        }

        const stepResult = await this.executeStep(step, stepOutputs, context);
        results.push(stepResult);
        executedSteps.add(step.id);

        // Update step outputs
        if (stepResult.success && step.outputs) {
          step.outputs.forEach(outputKey => {
            stepOutputs[outputKey] = stepResult.output[outputKey];
          });
        }

        // Handle errors according to error handling strategy
        if (!stepResult.success) {
          const errorHandling = step.errorHandling || toolChain.globalSettings.errorHandling;

          if (errorHandling.strategy === 'fail_fast') {
            throw stepResult.error || new Error(`Step ${step.id} failed`);
          } else if (errorHandling.strategy === 'fallback' && errorHandling.fallbackStep) {
            // Execute fallback step
            const fallbackStep = toolChain.steps.find(s => s.id === errorHandling.fallbackStep);
            if (fallbackStep && !executedSteps.has(fallbackStep.id)) {
              const fallbackResult = await this.executeStep(fallbackStep, stepOutputs, context);
              results.push(fallbackResult);
              executedSteps.add(fallbackStep.id);
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: McpToolStep,
    availableOutputs: Record<string, any>,
    context: McpToolExecutionContext,
  ): Promise<McpStepExecutionResult> {
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = step.retryPolicy?.maxAttempts || 1;

    while (retryCount < maxRetries) {
      try {
        logInfo('MCP Orchestrator: Executing step', {
          operation: 'orchestrator_step_start',
          metadata: {
            stepId: step.id,
            toolName: step.toolName,
            executionId: context.executionId,
            retryCount,
          },
        });

        // Get connection for the step
        const connection = await this.getConnectionForStep(step);
        if (!connection) {
          throw new Error(`No connection available for step ${step.id}`);
        }

        // Prepare parameters with available outputs
        const resolvedParameters = this.resolveStepParameters(step.parameters, availableOutputs);

        // Execute the tool
        const output = await this.executeTool(
          connection,
          step.toolName,
          resolvedParameters,
          step.timeout || this.config.defaultTimeout,
        );

        const executionTime = Date.now() - startTime;

        const result: McpStepExecutionResult = {
          stepId: step.id,
          success: true,
          output,
          executionTime,
          retryCount,
          metadata: {
            connectionId: connection.id,
            toolName: step.toolName,
            startTime,
            endTime: Date.now(),
            memoryUsage: process.memoryUsage().heapUsed,
          },
        };

        // Track step execution
        mcpAnalytics.trackToolExecution({
          toolName: step.toolName,
          executionTime,
          success: true,
          userId: context.userId,
          clientType: 'enhanced',
          contextSize: JSON.stringify(resolvedParameters).length,
        });

        logInfo('MCP Orchestrator: Step executed successfully', {
          operation: 'orchestrator_step_success',
          metadata: {
            stepId: step.id,
            toolName: step.toolName,
            executionTime,
            retryCount,
          },
        });

        return result;
      } catch (error) {
        retryCount++;
        const stepError = error instanceof Error ? error : new Error(String(error));

        logWarn('MCP Orchestrator: Step execution failed', {
          operation: 'orchestrator_step_failed',
          metadata: {
            stepId: step.id,
            toolName: step.toolName,
            retryCount,
            maxRetries,
          },
          error: stepError,
        });

        if (retryCount >= maxRetries) {
          const executionTime = Date.now() - startTime;

          const result: McpStepExecutionResult = {
            stepId: step.id,
            success: false,
            output: null,
            error: stepError,
            executionTime,
            retryCount,
            metadata: {
              toolName: step.toolName,
              startTime,
              endTime: Date.now(),
              memoryUsage: process.memoryUsage().heapUsed,
            },
          };

          // Track failed execution
          mcpAnalytics.trackToolExecution({
            toolName: step.toolName,
            executionTime,
            success: false,
            userId: context.userId,
            clientType: 'enhanced',
            error: stepError,
          });

          return result;
        }

        // Wait before retry
        const retryPolicy = step.retryPolicy || {
          maxAttempts: 1,
          backoffMultiplier: 2,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
        };
        const delay = Math.min(
          retryPolicy.initialDelayMs * Math.pow(retryPolicy.backoffMultiplier, retryCount - 1),
          retryPolicy.maxDelayMs,
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error(`Step ${step.id} failed after ${maxRetries} attempts`);
  }

  /**
   * Helper methods for orchestration
   */
  private validateToolChain(toolChain: McpToolChain): void {
    if (!toolChain.id || !toolChain.name || !toolChain.steps?.length) {
      throw new Error('Invalid tool chain: missing required fields');
    }

    // Validate step dependencies
    const stepIds = new Set(toolChain.steps.map(s => s.id));
    for (const step of toolChain.steps) {
      if (step.dependencies) {
        for (const dep of step.dependencies) {
          if (!stepIds.has(dep)) {
            throw new Error(`Step ${step.id} has invalid dependency: ${dep}`);
          }
        }
      }
    }
  }

  private buildDependencyGraph(steps: McpToolStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const step of steps) {
      graph.set(step.id, step.dependencies || []);
    }

    return graph;
  }

  private getExecutionOrder(_dependencyGraph: Map<string, string[]>): McpToolStep[][] {
    // Simplified topological sort - would need more sophisticated implementation
    // For now, return steps grouped by dependency level
    const steps = this.toolChains.values().next().value?.steps || [];
    return [steps]; // Single group for simplification
  }

  private shouldExecuteStep(
    step: McpToolStep,
    outputs: Record<string, any>,
    results: McpStepExecutionResult[],
  ): boolean {
    if (!step.condition || step.condition.type === 'always') {
      return true;
    }

    if (step.condition.type === 'on_success') {
      return results.length === 0 || results[results.length - 1].success;
    }

    if (step.condition.type === 'on_failure') {
      return results.length > 0 && !results[results.length - 1].success;
    }

    // More complex condition evaluation would go here
    return true;
  }

  private async getConnectionForStep(step: McpToolStep): Promise<McpManagedConnection | null> {
    // Get connection from pool based on step requirements
    if (step.connectionId) {
      // Use specific connection if specified
      return mcpConnectionPool.getPoolStatistics().totalConnections > 0
        ? ({ id: step.connectionId } as McpManagedConnection)
        : null;
    }

    // Get any available connection for the profile
    // This would integrate with the actual connection pool
    return null;
  }

  private resolveStepParameters(
    parameters: Record<string, any>,
    availableOutputs: Record<string, any>,
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        // Parameter reference
        const refKey = value.slice(2, -1);
        resolved[key] = availableOutputs[refKey] || value;
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private async executeTool(
    connection: McpManagedConnection,
    toolName: string,
    parameters: Record<string, any>,
    _timeout: number,
  ): Promise<any> {
    // This would execute the actual tool through the MCP connection
    // For now, simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      result: `Tool ${toolName} executed with parameters: ${JSON.stringify(parameters)}`,
      timestamp: new Date().toISOString(),
    };
  }

  private extractFinalOutput(stepResults: McpStepExecutionResult[], _toolChain: McpToolChain): any {
    // Extract final output based on chain configuration
    const lastSuccessfulResult = stepResults.reverse().find(result => result.success);

    return lastSuccessfulResult?.output || null;
  }

  private countNetworkRequests(stepResults: McpStepExecutionResult[]): number {
    // Count network requests made during execution
    return stepResults.length; // Simplified - assume one request per step
  }

  private startResourceMonitoring(): void {
    this.resourceMonitor = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const activeExecutionsCount = this.activeExecutions.size;

      if (memoryUsage.heapUsed > this.config.resourceLimits.maxMemoryMB * 1024 * 1024) {
        logWarn('MCP Orchestrator: High memory usage detected', {
          operation: 'orchestrator_high_memory',
          metadata: {
            heapUsed: memoryUsage.heapUsed,
            limit: this.config.resourceLimits.maxMemoryMB * 1024 * 1024,
            activeExecutions: activeExecutionsCount,
          },
        });
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get execution status
   */
  getExecutionStatus(executionId: string): McpActiveExecution | null {
    return this.activeExecutions.get(executionId) || null;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 100): McpChainExecutionResult[] {
    return Array.from(this.executionHistory.values())
      .sort((a, b) => b.metadata.startTime - a.metadata.startTime)
      .slice(0, limit);
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.state = 'cancelled';
      this.emit('execution-cancelled', execution);

      logInfo('MCP Orchestrator: Execution cancelled', {
        operation: 'orchestrator_execution_cancelled',
        metadata: { executionId, chainId: execution.chainId },
      });
    }
  }

  /**
   * Get registered tool chains
   */
  getToolChains(): McpToolChain[] {
    return Array.from(this.toolChains.values());
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    if (this.resourceMonitor) {
      clearInterval(this.resourceMonitor);
      this.resourceMonitor = null;
    }

    // Cancel all active executions
    const cancelPromises = Array.from(this.activeExecutions.keys()).map(id =>
      this.cancelExecution(id),
    );

    await Promise.allSettled(cancelPromises);

    logInfo('MCP Orchestrator: Shutdown completed', {
      operation: 'orchestrator_shutdown',
      metadata: {
        cancelledExecutions: cancelPromises.length,
        registeredChains: this.toolChains.size,
      },
    });
  }
}

/**
 * Global orchestrator instance
 */
export const mcpOrchestrator = new McpToolChainOrchestrator();

/**
 * Utility functions for orchestration
 */
export const orchestrationUtils = {
  registerChain: (toolChain: McpToolChain) => mcpOrchestrator.registerToolChain(toolChain),

  executeChain: (chainId: string, inputs?: Record<string, any>, context?: FeatureFlagContext) =>
    mcpOrchestrator.executeToolChain(chainId, inputs, context),

  getExecutionStatus: (executionId: string) => mcpOrchestrator.getExecutionStatus(executionId),

  getExecutionHistory: (limit?: number) => mcpOrchestrator.getExecutionHistory(limit),

  cancelExecution: (executionId: string) => mcpOrchestrator.cancelExecution(executionId),

  getToolChains: () => mcpOrchestrator.getToolChains(),

  shutdown: () => mcpOrchestrator.shutdown(),
};
