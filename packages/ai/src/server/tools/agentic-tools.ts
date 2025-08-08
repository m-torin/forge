/**
 * Agentic Tool Patterns for AI SDK v5
 *
 * Provides advanced multi-step tool execution patterns including:
 * - Step-based execution control
 * - Stopping conditions
 * - Lifecycle hooks
 * - Step history tracking
 */

import { tool as aiTool, hasToolCall, type ModelMessage, type StopCondition, type Tool } from 'ai';
import { z } from 'zod';
import { stepCountIs } from '../agents/step-conditions';
import { repairToolCall, type RepairResult, type ToolRepairConfig } from './tool-repair';

/**
 * Step execution context for agentic workflows
 */
export interface AgentStepContext {
  stepNumber: number;
  maxSteps?: number;
  steps: any[];
  toolCallId?: string;
  messages: ModelMessage[];
  abortSignal?: AbortSignal;
}

/**
 * Lifecycle hooks for agent execution
 */
export interface AgentLifecycleHooks {
  /** Called before each step */
  onStepStart?: (context: AgentStepContext) => void | Promise<void>;

  /** Called after each step completes */
  onStepFinish?: (params: {
    text?: string;
    toolCalls?: any[];
    toolResults?: any[];
    finishReason?: string;
    usage?: any;
    stepNumber: number;
  }) => void | Promise<void>;

  /** Prepare next step dynamically (AI SDK v5) */
  prepareStep?: (context: AgentStepContext) => Promise<{
    model?: any;
    toolChoice?: 'auto' | 'none' | 'required' | { type: 'tool'; toolName: string };
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    activeTools?: string[];
  } | void>;

  /** Called when tool execution fails for repair attempts */
  onToolRepair?: (context: {
    toolName: string;
    error: any;
    attempt: number;
    maxRetries: number;
  }) => Promise<boolean>; // return true to retry, false to fail
}

/**
 * Configuration for agentic tool execution
 */
export interface AgenticToolConfig<TParams = any, TResult = any> {
  description: string;
  inputSchema: z.ZodSchema<TParams>;
  execute: (args: TParams, context: AgentStepContext) => Promise<TResult> | TResult;

  /** Maximum steps for multi-step execution */
  maxSteps?: number;

  /** Stopping conditions */
  stopWhen?: StopCondition<any> | StopCondition<any>[];

  /** Lifecycle hooks */
  hooks?: AgentLifecycleHooks;

  /** Enable step history tracking */
  trackHistory?: boolean;

  /** Tool repair configuration for handling failed executions */
  repairConfig?: ToolRepairConfig;

  /** Multi-modal result support */
  toModelOutput?: (result: TResult) => {
    type: 'content';
    value: Array<
      { type: 'text'; text: string } | { type: 'media'; mediaType: string; data: string }
    >;
  };
}

/**
 * Step history tracker
 */
export class StepHistoryTracker {
  private history: any[] = [];

  addStep(step: any) {
    this.history.push(step);
  }

  getHistory() {
    return this.history;
  }

  getAllToolCalls() {
    return this.history.flatMap((step: any) => step.toolCalls || []);
  }

  getAllToolResults() {
    return this.history.flatMap((step: any) => step.toolResults || []);
  }

  getStepCount() {
    return this.history.length;
  }

  clear() {
    this.history = [];
  }
}

/**
 * Create an agentic tool with multi-step capabilities
 */
export function agenticTool<TParams, TResult>(
  config: AgenticToolConfig<TParams, TResult>,
): Tool & {
  agenticConfig: AgenticToolConfig<TParams, TResult>;
  stepHistory: StepHistoryTracker;
} {
  const stepHistory = new StepHistoryTracker();

  const baseTool = aiTool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (
      args: any,
      options: any = { toolCallId: 'agentic', messages: [] },
    ): Promise<any> => {
      const context: AgentStepContext = {
        stepNumber: stepHistory.getStepCount(),
        maxSteps: config.maxSteps,
        steps: stepHistory.getHistory(),
        toolCallId: options?.toolCallId,
        messages: options?.messages || [],
        abortSignal: options?.abortSignal,
      };

      // Call onStepStart if provided
      if (config.hooks?.onStepStart) {
        await config.hooks.onStepStart(context);
      }

      try {
        // Execute with context
        const result = await config.execute(args, context);

        // Track history if enabled
        if (config.trackHistory) {
          stepHistory.addStep({
            text: '',
            toolCalls: [{ toolName: config.description, args }],
            toolResults: [{ toolName: config.description, result }],
            finishReason: 'tool-calls',
            usage: {},
          });
        }

        return result;
      } catch (error) {
        // Attempt repair if configured
        if (config.repairConfig) {
          const repairResult: RepairResult<TResult> = await repairToolCall(
            baseTool,
            args,
            error,
            config.repairConfig,
          );

          if (repairResult.success) {
            // Track successful repair
            if (config.trackHistory) {
              stepHistory.addStep({
                text: '',
                toolCalls: [{ toolName: config.description, args: repairResult.repairedInput }],
                toolResults: [{ toolName: config.description, result: repairResult.result }],
                finishReason: 'tool-calls',
                usage: {},
              });
            }

            return repairResult.result;
          }
        }

        // If no repair config or repair failed, throw original error
        throw error;
      }
    },
    toModelOutput: config.toModelOutput,
  } as any) as Tool;

  return Object.assign(baseTool, {
    agenticConfig: config,
    stepHistory,
  });
}

/**
 * Enhanced stopping conditions for AI SDK v5
 */
export const StoppingConditions = {
  /** Stop after N steps */
  afterSteps: (n: number) => stepCountIs(n),

  /** Stop when specific tool is called */
  whenToolCalled: (toolName: string) => hasToolCall(toolName),

  /** Stop after total tokens */
  maxOutputTokens:
    (tokens: number): StopCondition<any> =>
    ({ steps }: any) => {
      const totalTokens = steps.reduce(
        (sum: any, step: any) => sum + (step.usage?.totalTokens || 0),
        0,
      );
      return totalTokens >= tokens;
    },

  /** Stop when assistant message contains specific text */
  whenResponseContains:
    (text: string): StopCondition<any> =>
    ({ steps }: any) => {
      return steps.some(
        (step: any) => step.text && step.text.toLowerCase().includes(text.toLowerCase()),
      );
    },

  /** Stop when specific reasoning is provided */
  whenReasoningContains:
    (reasoning: string): StopCondition<any> =>
    ({ steps }: any) => {
      return steps.some(
        (step: any) =>
          step.reasoningText && step.reasoningText.toLowerCase().includes(reasoning.toLowerCase()),
      );
    },

  /** Stop after specific time duration */
  afterDuration: (durationMs: number): StopCondition<any> => {
    const startTime = Date.now();
    return () => Date.now() - startTime > durationMs;
  },

  /** Stop when error count exceeds threshold */
  onErrorThreshold:
    (maxErrors: number): StopCondition<any> =>
    ({ steps }: any) => {
      const errorCount = steps.filter((step: any) =>
        step.toolResults?.some((result: any) => result.error),
      ).length;
      return errorCount >= maxErrors;
    },

  /** Stop when specific condition in text */
  whenTextContains:
    (text: string): StopCondition<any> =>
    ({ steps }: any) => {
      const lastStep = steps[steps.length - 1];
      return lastStep?.text?.includes(text) || false;
    },

  /** Stop after time limit */
  afterDurationMs: (ms: number): StopCondition<any> => {
    const startTime = Date.now();
    return () => Date.now() - startTime >= ms;
  },
};

/**
 * Multi-step workflow configuration with active tools support
 */
export interface MultiStepWorkflowConfig {
  tools: Record<string, Tool>;
  maxSteps?: number;
  stopWhen?: StopCondition<any> | StopCondition<any>[];
  hooks?: AgentLifecycleHooks;
  /** Dynamic tool availability per step */
  activeToolsStrategy?:
    | 'all'
    | 'progressive'
    | 'conditional'
    | ((context: AgentStepContext) => string[]);
  /** Tool repair configuration */
  repairConfig?: {
    maxRetries: number;
    repairStrategies: ('reformat' | 'validate' | 'fallback')[];
  };
}

/**
 * Create a multi-step agent workflow with enhanced capabilities
 */
export function createAgentWorkflow(config: MultiStepWorkflowConfig) {
  const stepHistory = new StepHistoryTracker();
  const toolNames = Object.keys(config.tools);

  return {
    tools: config.tools,
    maxSteps: config.maxSteps || 5,
    stopWhen: config.stopWhen || stepCountIs(config.maxSteps || 5),

    onStepFinish: async (params: any) => {
      // Track step
      stepHistory.addStep({
        text: params.text,
        toolCalls: params.toolCalls,
        toolResults: params.toolResults,
        finishReason: params.finishReason,
        usage: params.usage,
      });

      // Call user hook
      if (config.hooks?.onStepFinish) {
        await config.hooks.onStepFinish({
          ...params,
          stepNumber: stepHistory.getStepCount(),
        });
      }
    },

    prepareStep: async (context: any) => {
      const agentContext: AgentStepContext = {
        stepNumber: context.stepNumber,
        maxSteps: context.maxSteps,
        steps: stepHistory.getHistory(),
        messages: context.messages,
      };

      // Determine active tools based on strategy
      let activeTools: string[] | undefined;

      if (config.activeToolsStrategy) {
        if (typeof config.activeToolsStrategy === 'function') {
          activeTools = config.activeToolsStrategy(agentContext);
        } else {
          switch (config.activeToolsStrategy) {
            case 'all':
              activeTools = toolNames;
              break;
            case 'progressive':
              // Gradually unlock tools as steps progress
              const progressRatio = context.stepNumber / (context.maxSteps || 5);
              const toolsToShow = Math.ceil(toolNames.length * Math.min(progressRatio + 0.3, 1));
              activeTools = toolNames.slice(0, toolsToShow);
              break;
            case 'conditional':
              // Show tools based on previous step results
              const lastStep = stepHistory.getHistory()[stepHistory.getStepCount() - 1];
              if (lastStep?.toolResults?.some((r: any) => r.result?.needsMoreTools)) {
                activeTools = toolNames;
              } else {
                activeTools = toolNames.slice(0, Math.ceil(toolNames.length / 2));
              }
              break;
          }
        }
      }

      // Get user's custom preparation
      const userPrep = config.hooks?.prepareStep
        ? await config.hooks.prepareStep(agentContext)
        : {};

      const finalActiveTools = activeTools || userPrep?.activeTools;

      // Always use stable activeTools API (AI SDK v5.0+)
      return {
        ...userPrep,
        activeTools: finalActiveTools,
      };
    },

    getStepHistory: () => stepHistory.getHistory(),
    getAllToolCalls: () => stepHistory.getAllToolCalls(),
    getAllToolResults: () => stepHistory.getAllToolResults(),
    getActiveTools: (stepNumber: number) => {
      // Helper to get active tools for a given step
      const mockContext: AgentStepContext = {
        stepNumber,
        maxSteps: config.maxSteps || 5,
        steps: stepHistory.getHistory(),
        messages: [],
      };

      if (typeof config.activeToolsStrategy === 'function') {
        return config.activeToolsStrategy(mockContext);
      }
      return toolNames; // fallback to all tools
    },
  };
}

/**
 * Predefined agentic tool patterns
 */
export const AgenticPatterns = {
  /**
   * Create a sequential processing agent with progressive tool unlocking
   */
  sequential: (tools: Tool[], _options?: { maxRetries?: number }) => {
    let _currentStep = 0;
    const toolsMap = tools.reduce(
      (acc, tool, idx) => ({ ...acc, [`step${idx}`]: tool }),
      {} as Record<string, Tool>,
    );

    return createAgentWorkflow({
      tools: toolsMap,
      stopWhen: stepCountIs(tools.length),
      activeToolsStrategy: 'progressive', // Gradually unlock tools
      hooks: {
        prepareStep: async ({ stepNumber }) => {
          if (stepNumber < tools.length) {
            return {
              toolChoice: { type: 'tool', toolName: `step${stepNumber}` },
              activeTools: [`step${stepNumber}`], // Only current step tool (stable API)
            };
          }
        },
      },
    });
  },

  /**
   * Create a conditional branching agent
   */
  conditional: (config: { evaluator: Tool; branches: Record<string, Tool>; default?: Tool }) => {
    return createAgentWorkflow({
      tools: {
        evaluate: config.evaluator,
        ...config.branches,
        ...(config.default ? { default: config.default } : {}),
      },
      stopWhen: [stepCountIs(2), hasToolCall('final')],
      hooks: {
        prepareStep: async ({ stepNumber, steps }) => {
          if (stepNumber === 0) {
            return { toolChoice: { type: 'tool', toolName: 'evaluate' } };
          }

          const evalResult = steps[0]?.toolResults?.[0]?.result;
          const branchName = evalResult?.branch || 'default';

          if (config.branches[branchName]) {
            return { toolChoice: { type: 'tool', toolName: branchName } };
          }

          return config.default ? { toolChoice: { type: 'tool', toolName: 'default' } } : undefined;
        },
      },
    });
  },

  /**
   * Create a retry-with-refinement agent
   */
  retryWithRefinement: (config: { tool: Tool; validator: Tool; maxRetries?: number }) => {
    let retryCount = 0;
    const maxRetries = config.maxRetries || 3;

    return createAgentWorkflow({
      tools: {
        execute: config.tool,
        validate: config.validator,
      },
      stopWhen: [stepCountIs(maxRetries * 2), hasToolCall('success')],
      hooks: {
        prepareStep: async ({ stepNumber, steps }) => {
          const isEvenStep = stepNumber % 2 === 0;

          if (isEvenStep) {
            return { toolChoice: { type: 'tool', toolName: 'execute' } };
          } else {
            const lastValidation = steps[steps.length - 1]?.toolResults?.[0]?.result;

            if (lastValidation?.valid) {
              return { toolChoice: { type: 'tool', toolName: 'success' } };
            }

            retryCount++;
            if (retryCount >= maxRetries) {
              return { toolChoice: 'none' };
            }

            return { toolChoice: { type: 'tool', toolName: 'execute' } };
          }
        },
      },
    });
  },
};

/**
 * Export common agentic tools
 */
export const commonAgenticTools = {
  /**
   * Planning tool that breaks down tasks
   */
  planningTool: agenticTool({
    description: 'Break down a complex task into steps',
    inputSchema: z.object({
      task: z.string().describe('The task to plan'),
      constraints: z.array(z.string()).optional(),
    }),
    execute: async ({ task, constraints }) => {
      return {
        steps: [
          { step: 1, action: 'Research', description: `Research ${task}` },
          { step: 2, action: 'Analyze', description: 'Analyze findings' },
          { step: 3, action: 'Execute', description: 'Execute plan' },
          { step: 4, action: 'Validate', description: 'Validate results' },
        ],
        estimatedDuration: '2-4 hours',
        constraints,
      };
    },
    maxSteps: 1,
  }),

  /**
   * Validation tool for checking results
   */
  validationTool: agenticTool({
    description: 'Validate results against criteria',
    inputSchema: z.object({
      result: z.any(),
      criteria: z.array(z.string()),
    }),
    execute: async ({ result: _result, criteria }) => {
      const checks = criteria.map(criterion => ({
        criterion,
        passed: Math.random() > 0.3, // Mock validation
        feedback: 'Meets requirements',
      }));

      return {
        valid: checks.every(c => c.passed),
        checks,
        summary: checks.every(c => c.passed) ? 'All criteria met' : 'Some criteria not met',
      };
    },
  }),

  /**
   * Refinement tool for improving results
   */
  refinementTool: agenticTool({
    description: 'Refine and improve a result',
    inputSchema: z.object({
      original: z.any(),
      feedback: z.string(),
      iteration: z.number().optional(),
    }),
    execute: async ({ original, feedback: _feedback, iteration = 1 }) => {
      return {
        refined: { ...original, refined: true, iteration },
        improvements: ['Added clarity', 'Fixed issues', 'Enhanced quality'],
        confidence: 0.85 + iteration * 0.05,
      };
    },
    toModelOutput: result => ({
      type: 'content',
      value: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    }),
  }),
};
