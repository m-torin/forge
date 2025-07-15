/**
 * AI SDK v5 Multi-Step Execution Patterns
 * Advanced patterns for multi-step agent execution following official documentation
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import { generateText, streamText, type LanguageModel } from 'ai';
import type { PrepareStepCallback } from './agent-controls';
import {
  AgentPerformanceMonitor,
  type AgentPerformanceMetrics,
  type PerformanceMonitorConfig,
} from './performance-monitoring';
import type { StepCondition } from './step-conditions';

/**
 * Multi-step execution configuration
 */
export interface MultiStepConfig {
  model: LanguageModel;
  tools?: Record<string, any>;
  maxSteps?: number;
  stopWhen?: StepCondition[];
  prepareStep?: PrepareStepCallback;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  onStepFinish?: (step: any) => void | Promise<void>;
  // Performance monitoring configuration
  performanceMonitoring?: PerformanceMonitorConfig;
  enablePerformanceTracking?: boolean;
}

/**
 * Multi-step execution result
 */
export interface MultiStepResult {
  steps: any[];
  finalResult: any;
  totalTokensUsed: number;
  executionTime: number;
  stoppedBy: string;
  metadata: Record<string, any>;
  // Performance metrics (optional)
  performanceMetrics?: AgentPerformanceMetrics;
}

/**
 * Execute a multi-step agent with comprehensive control
 */
export async function executeMultiStepAgent(
  prompt: string,
  config: MultiStepConfig,
): Promise<MultiStepResult> {
  const startTime = Date.now();
  let totalTokensUsed = 0;
  const steps: any[] = [];
  let stoppedBy = 'maxSteps';

  // Initialize performance monitor if enabled
  const performanceMonitor = config.enablePerformanceTracking
    ? new AgentPerformanceMonitor(config.performanceMonitoring)
    : null;

  if (performanceMonitor) {
    performanceMonitor.startMonitoring();
  }

  logInfo('Multi-Step Agent: Starting execution', {
    operation: 'multi_step_agent_start',
    metadata: {
      maxSteps: config.maxSteps,
      hasStopConditions: !!config.stopWhen?.length,
      hasPrepareStep: !!config.prepareStep,
      toolCount: Object.keys(config.tools || {}).length,
      performanceTracking: !!performanceMonitor,
    },
  });

  try {
    const result = await generateText({
      model: config.model,
      prompt,
      tools: config.tools,
      ...(config.maxSteps && {
        stopWhen: [({ steps }: { steps: any[] }) => steps.length >= (config.maxSteps ?? 10)],
      }),
      system: config.system,
      temperature: config.temperature,
      maxOutputTokens: config.maxOutputTokens,
      ...(config.prepareStep && { prepareStep: config.prepareStep }),
      onStepFinish: async stepResult => {
        const stepNumber = steps.length;
        steps.push(stepResult);
        totalTokensUsed += stepResult.usage?.totalTokens || 0;

        // Record step performance if monitoring is enabled
        if (performanceMonitor) {
          const stepWithNumber = { ...stepResult, stepNumber };
          performanceMonitor.recordStepComplete(stepWithNumber);
        }

        logInfo('Multi-Step Agent: Step completed', {
          operation: 'multi_step_agent_step',
          metadata: {
            stepNumber: stepNumber + 1,
            tokenUsage: stepResult.usage?.totalTokens || 0,
            hasToolCalls: !!stepResult.toolCalls?.length,
            finishReason: stepResult.finishReason,
          },
        });

        // Check stop conditions
        if (config.stopWhen) {
          const stepContext = {
            stepNumber: steps.length - 1,
            maxSteps: config.maxSteps || 10,
            steps,
            finishReason: stepResult.finishReason,
            toolCalls: stepResult.toolCalls,
            text: stepResult.text,
          };

          for (const [index, condition] of config.stopWhen.entries()) {
            if (condition(stepContext)) {
              stoppedBy = `stopCondition_${index}`;
              logInfo('Multi-Step Agent: Stopped by condition', {
                operation: 'multi_step_agent_stop_condition',
                metadata: { conditionIndex: index, stepNumber: steps.length },
              });
              break;
            }
          }
        }

        // Call user-provided step finish callback
        if (config.onStepFinish) {
          try {
            await config.onStepFinish(stepResult);
          } catch (error) {
            logWarn('Multi-Step Agent: Step finish callback failed', {
              operation: 'multi_step_agent_callback_error',
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        }
      },
    });

    const executionTime = Date.now() - startTime;
    let performanceMetrics: AgentPerformanceMetrics | undefined;

    if (performanceMonitor) {
      performanceMetrics = performanceMonitor.completeMonitoring();
    }

    logInfo('Multi-Step Agent: Execution completed', {
      operation: 'multi_step_agent_complete',
      metadata: {
        totalSteps: steps.length,
        totalTokensUsed,
        executionTime,
        stoppedBy,
        finalFinishReason: result.finishReason,
        averageStepTime: performanceMetrics?.stepMetrics.averageStepTime,
        tokensPerSecond: performanceMetrics?.efficiency.tokensPerSecond,
      },
    });

    return {
      steps,
      finalResult: result,
      totalTokensUsed,
      executionTime,
      stoppedBy,
      metadata: {
        stepCount: steps.length,
        averageTokensPerStep: totalTokensUsed / Math.max(steps.length, 1),
        executionTimePerStep: executionTime / Math.max(steps.length, 1),
      },
      performanceMetrics,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    let performanceMetrics: AgentPerformanceMetrics | undefined;

    if (performanceMonitor) {
      performanceMetrics = performanceMonitor.completeMonitoring();
    }

    logError('Multi-Step Agent: Execution failed', {
      operation: 'multi_step_agent_error',
      metadata: {
        stepsCompleted: steps.length,
        totalTokensUsed,
        executionTime,
        errorRate: performanceMetrics?.efficiency.errorRate,
      },
      error: error instanceof Error ? error : new Error(String(error)),
    });

    throw error;
  }
}

/**
 * Stream a multi-step agent with real-time updates
 */
export async function streamMultiStepAgent(
  prompt: string,
  config: MultiStepConfig & {
    onChunk?: (chunk: any) => void;
    onStep?: (step: any) => void;
  },
) {
  const startTime = Date.now();
  let totalTokensUsed = 0;
  const steps: any[] = [];

  logInfo('Multi-Step Agent: Starting streaming execution', {
    operation: 'multi_step_agent_stream_start',
    metadata: {
      maxSteps: config.maxSteps,
      hasOnChunk: !!config.onChunk,
      hasOnStep: !!config.onStep,
    },
  });

  const result = streamText({
    model: config.model,
    prompt,
    tools: config.tools,
    ...(config.maxSteps && {
      stopWhen: [({ steps }: { steps: any[] }) => steps.length >= (config.maxSteps ?? 10)],
    }),
    system: config.system,
    temperature: config.temperature,
    maxOutputTokens: config.maxOutputTokens,
    ...(config.prepareStep && { prepareStep: config.prepareStep }),
    onStepFinish: async stepResult => {
      steps.push(stepResult);
      totalTokensUsed += stepResult.usage?.totalTokens || 0;

      logInfo('Multi-Step Agent: Streaming step completed', {
        operation: 'multi_step_agent_stream_step',
        metadata: {
          stepNumber: steps.length,
          tokenUsage: stepResult.usage?.totalTokens || 0,
        },
      });

      // Call user-provided step callback
      if (config.onStep) {
        try {
          await config.onStep(stepResult);
        } catch (error) {
          logWarn('Multi-Step Agent: Step callback failed', {
            operation: 'multi_step_agent_stream_callback_error',
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }

      // Call general step finish callback
      if (config.onStepFinish) {
        try {
          await config.onStepFinish(stepResult);
        } catch (error) {
          logWarn('Multi-Step Agent: Step finish callback failed', {
            operation: 'multi_step_agent_stream_finish_error',
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    },
  });

  // Set up chunk handling if provided
  if (config.onChunk) {
    const reader = result.textStream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        try {
          config.onChunk(value);
        } catch (error) {
          logWarn('Multi-Step Agent: Chunk callback failed', {
            operation: 'multi_step_agent_chunk_error',
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  return result;
}

/**
 * Execute multiple agents in parallel
 */
export async function executeParallelAgents(
  configs: Array<{
    name: string;
    prompt: string;
    config: MultiStepConfig;
  }>,
): Promise<Record<string, MultiStepResult>> {
  logInfo('Multi-Step Agent: Starting parallel execution', {
    operation: 'multi_step_agent_parallel_start',
    metadata: { agentCount: configs.length },
  });

  const startTime = Date.now();

  try {
    const results = await Promise.all(
      configs.map(async ({ name, prompt, config }) => {
        try {
          const result = await executeMultiStepAgent(prompt, config);
          return { name, result };
        } catch (error) {
          logError(`Multi-Step Agent: Parallel agent '${name}' failed`, {
            operation: 'multi_step_agent_parallel_error',
            metadata: { agentName: name },
            error: error instanceof Error ? error : new Error(String(error)),
          });
          throw error;
        }
      }),
    );

    const executionTime = Date.now() - startTime;

    logInfo('Multi-Step Agent: Parallel execution completed', {
      operation: 'multi_step_agent_parallel_complete',
      metadata: {
        agentCount: configs.length,
        totalExecutionTime: executionTime,
        averageExecutionTime: executionTime / configs.length,
      },
    });

    return Object.fromEntries(results.map(({ name, result }) => [name, result]));
  } catch (error) {
    logError('Multi-Step Agent: Parallel execution failed', {
      operation: 'multi_step_agent_parallel_failed',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Execute agents in sequence with context passing
 */
export async function executeSequentialAgents(
  configs: Array<{
    name: string;
    prompt: string | ((previousResults: MultiStepResult[]) => string);
    config: MultiStepConfig;
  }>,
): Promise<MultiStepResult[]> {
  logInfo('Multi-Step Agent: Starting sequential execution', {
    operation: 'multi_step_agent_sequential_start',
    metadata: { agentCount: configs.length },
  });

  const results: MultiStepResult[] = [];
  const startTime = Date.now();

  try {
    for (const [index, { name, prompt, config }] of configs.entries()) {
      logInfo(`Multi-Step Agent: Executing sequential agent '${name}'`, {
        operation: 'multi_step_agent_sequential_step',
        metadata: { agentName: name, agentIndex: index },
      });

      const finalPrompt = typeof prompt === 'function' ? prompt(results) : prompt;
      const result = await executeMultiStepAgent(finalPrompt, config);
      results.push(result);
    }

    const executionTime = Date.now() - startTime;

    logInfo('Multi-Step Agent: Sequential execution completed', {
      operation: 'multi_step_agent_sequential_complete',
      metadata: {
        agentCount: configs.length,
        totalExecutionTime: executionTime,
        totalSteps: results.reduce((sum, r) => sum + r.steps.length, 0),
        totalTokens: results.reduce((sum, r) => sum + r.totalTokensUsed, 0),
      },
    });

    return results;
  } catch (error) {
    logError('Multi-Step Agent: Sequential execution failed', {
      operation: 'multi_step_agent_sequential_failed',
      metadata: { completedAgents: results.length },
      error: error instanceof Error ? error : new Error(String(error)),
    });
    throw error;
  }
}

/**
 * Common multi-step execution patterns
 */
export const multiStepPatterns = {
  /**
   * Research and synthesis pattern
   */
  researchAndSynthesize: async (
    topic: string,
    model: LanguageModel,
    tools: Record<string, any>,
  ) => {
    return executeSequentialAgents([
      {
        name: 'researcher',
        prompt: `Research the topic: ${topic}. Gather comprehensive information from multiple sources.`,
        config: {
          model,
          tools,
          maxSteps: 10,
          system: 'You are a thorough researcher. Gather accurate, relevant information.',
        },
      },
      {
        name: 'synthesizer',
        prompt: results => {
          const researchData = results[0]?.finalResult?.text || '';
          return `Based on this research data, create a comprehensive synthesis:

${researchData}`;
        },
        config: {
          model,
          tools: {},
          maxSteps: 5,
          system: 'You are a synthesis expert. Create coherent insights from research data.',
        },
      },
    ]);
  },

  /**
   * Plan and execute pattern
   */
  planAndExecute: async (task: string, model: LanguageModel, tools: Record<string, any>) => {
    return executeSequentialAgents([
      {
        name: 'planner',
        prompt: `Create a detailed plan for: ${task}`,
        config: {
          model,
          tools: {},
          maxSteps: 5,
          system: 'You are a strategic planner. Create detailed, actionable plans.',
        },
      },
      {
        name: 'executor',
        prompt: results => {
          const plan = results[0]?.finalResult?.text || '';
          return `Execute this plan step by step:

${plan}`;
        },
        config: {
          model,
          tools,
          maxSteps: 20,
          system: 'You are an executor. Follow plans systematically and thoroughly.',
        },
      },
    ]);
  },

  /**
   * Analyze, decide, and act pattern
   */
  analyzeDecideAct: async (situation: string, model: LanguageModel, tools: Record<string, any>) => {
    return executeSequentialAgents([
      {
        name: 'analyzer',
        prompt: `Analyze this situation: ${situation}`,
        config: {
          model,
          tools,
          maxSteps: 8,
          system: 'You are an analytical expert. Provide thorough situation analysis.',
        },
      },
      {
        name: 'decider',
        prompt: results => {
          const analysis = results[0]?.finalResult?.text || '';
          return `Based on this analysis, make a decision:

${analysis}`;
        },
        config: {
          model,
          tools: {},
          maxSteps: 3,
          system: 'You are a decision maker. Make clear, well-reasoned decisions.',
        },
      },
      {
        name: 'actor',
        prompt: results => {
          const decision = results[1]?.finalResult?.text || '';
          return `Act on this decision:

${decision}`;
        },
        config: {
          model,
          tools,
          maxSteps: 15,
          system: 'You are an action-oriented executor. Implement decisions effectively.',
        },
      },
    ]);
  },
} as const;
