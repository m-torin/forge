/**
 * AI SDK v5 Agent Controls
 * Implementation of experimental_prepareStep and advanced agent controls
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import type { LanguageModel, ToolChoice } from 'ai';

/**
 * Context provided to prepareStep callback (AI SDK v5 format)
 */
export interface PrepareStepContext {
  steps: any[];
  stepNumber: number;
  model: LanguageModel;
  messages: any[];
}

/**
 * Result returned from prepareStep callback
 */
export interface PrepareStepResult {
  model?: LanguageModel;
  toolChoice?: ToolChoice<any>;
  activeTools?: string[];
  maxOutputTokens?: number;
  temperature?: number;
  system?: string;
  messages?: any[];
  metadata?: Record<string, any>;
}

/**
 * Callback function type for prepareStep (AI SDK v5)
 */
export type PrepareStepCallback = (
  context: PrepareStepContext,
) => PrepareStepResult | Promise<PrepareStepResult> | void | Promise<void>;

/**
 * Agent control configuration
 */
export interface AgentControlConfig {
  /** Dynamic step preparation */
  prepareStep?: PrepareStepCallback;
  /** Step monitoring callback */
  onStepStart?: (context: PrepareStepContext) => void | Promise<void>;
  /** Step completion callback */
  onStepFinish?: (context: PrepareStepContext & { result: any }) => void | Promise<void>;
  /** Error handling callback */
  onStepError?: (context: PrepareStepContext & { error: Error }) => void | Promise<void>;
}

/**
 * Create a prepareStep callback that switches models based on step
 */
export function createModelSwitchingPrepareStep(
  modelMap: Record<number, LanguageModel>,
): PrepareStepCallback {
  return ({ stepNumber }) => {
    const model = modelMap[stepNumber];
    if (model) {
      logInfo('Agent Control: Switching model for step', {
        operation: 'agent_model_switch',
        metadata: { stepNumber, modelSwitched: true },
      });
      return { model };
    }
  };
}

/**
 * Create a prepareStep callback that forces specific tools for steps
 */
export function createToolForcingPrepareStep(toolMap: Record<number, string>): PrepareStepCallback {
  return ({ stepNumber }) => {
    const toolName = toolMap[stepNumber];
    if (toolName) {
      logInfo('Agent Control: Forcing tool for step', {
        operation: 'agent_tool_force',
        metadata: { stepNumber, toolName },
      });
      return {
        toolChoice: { type: 'tool', toolName },
        activeTools: [toolName],
      };
    }
  };
}

/**
 * Create a prepareStep callback that limits available tools per step
 */
export function createToolLimitingPrepareStep(
  toolMap: Record<number, string[]>,
): PrepareStepCallback {
  return ({ stepNumber }) => {
    const activeTools = toolMap[stepNumber];
    if (activeTools) {
      logInfo('Agent Control: Limiting tools for step', {
        operation: 'agent_tool_limit',
        metadata: { stepNumber, activeTools },
      });
      return { activeTools: activeTools };
    }
  };
}

/**
 * Create a prepareStep callback that adjusts temperature based on step
 */
export function createTemperatureAdjustingPrepareStep(
  temperatureMap: Record<number, number>,
): PrepareStepCallback {
  return ({ stepNumber }) => {
    const temperature = temperatureMap[stepNumber];
    if (temperature !== undefined) {
      logInfo('Agent Control: Adjusting temperature for step', {
        operation: 'agent_temperature_adjust',
        metadata: { stepNumber, temperature },
      });
      return { temperature };
    }
  };
}

/**
 * Create a prepareStep callback that modifies system prompt per step
 */
export function createSystemPromptPrepareStep(
  systemMap: Record<number, string>,
): PrepareStepCallback {
  return ({ stepNumber }) => {
    const system = systemMap[stepNumber];
    if (system) {
      logInfo('Agent Control: Updating system prompt for step', {
        operation: 'agent_system_update',
        metadata: { stepNumber, systemLength: system.length },
      });
      return { system };
    }
  };
}

/**
 * Combine multiple prepareStep callbacks
 */
export function combinePrepareStepCallbacks(
  ...callbacks: PrepareStepCallback[]
): PrepareStepCallback {
  return async context => {
    const results: PrepareStepResult[] = [];

    for (const callback of callbacks) {
      try {
        const result = await callback(context);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        logWarn('Agent Control: PrepareStep callback failed', {
          operation: 'agent_prepare_step_error',
          metadata: { stepNumber: context.stepNumber },
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    // Merge all results, with later callbacks taking precedence
    return results.reduce((merged, result) => ({ ...merged, ...result }), {});
  };
}

/**
 * Create a complex agent control strategy
 */
export function createAgentControlStrategy(config: {
  phases: Array<{
    startStep: number;
    endStep?: number;
    model?: LanguageModel;
    tools?: string[];
    temperature?: number;
    system?: string;
  }>;
}): PrepareStepCallback {
  return ({ stepNumber }) => {
    // Find the appropriate phase for this step
    const phase = config.phases.find(p => {
      const start = p.startStep;
      const end = p.endStep ?? Infinity;
      return stepNumber >= start && stepNumber <= end;
    });

    if (phase) {
      logInfo('Agent Control: Applying phase strategy', {
        operation: 'agent_phase_strategy',
        metadata: {
          stepNumber,
          phaseStart: phase.startStep,
          phaseEnd: phase.endStep,
          hasModel: !!phase.model,
          toolCount: phase.tools?.length ?? 0,
        },
      });

      return {
        ...(phase.model && { model: phase.model }),
        ...(phase.tools && { activeTools: phase.tools }),
        ...(phase.temperature !== undefined && { temperature: phase.temperature }),
        ...(phase.system && { system: phase.system }),
      };
    }
  };
}

/**
 * Agent control presets for common patterns
 */
export const agentControlPresets = {
  /**
   * Research agent: planning -> research -> synthesis
   */
  researchAgent: createAgentControlStrategy({
    phases: [
      {
        startStep: 0,
        endStep: 2,
        tools: ['plan_research', 'identify_sources'],
        temperature: 0.7,
        system: 'You are in the planning phase. Focus on creating a comprehensive research plan.',
      },
      {
        startStep: 3,
        endStep: 10,
        tools: ['web_search', 'fetch_content', 'analyze_source'],
        temperature: 0.3,
        system: 'You are in the research phase. Gather accurate, relevant information.',
      },
      {
        startStep: 11,
        tools: ['synthesize_findings', 'generate_summary'],
        temperature: 0.5,
        system: 'You are in the synthesis phase. Combine findings into coherent insights.',
      },
    ],
  }),

  /**
   * Code generation agent: analysis -> planning -> implementation -> testing
   */
  codeAgent: createAgentControlStrategy({
    phases: [
      {
        startStep: 0,
        endStep: 1,
        tools: ['analyze_requirements', 'understand_context'],
        temperature: 0.3,
        system: 'Analyze the requirements carefully and understand the context.',
      },
      {
        startStep: 2,
        endStep: 4,
        tools: ['create_plan', 'design_architecture'],
        temperature: 0.5,
        system: 'Create a detailed implementation plan and architecture.',
      },
      {
        startStep: 5,
        endStep: 15,
        tools: ['write_code', 'refactor_code', 'add_documentation'],
        temperature: 0.2,
        system: 'Implement the solution with clean, well-documented code.',
      },
      {
        startStep: 16,
        tools: ['test_code', 'validate_solution', 'create_tests'],
        temperature: 0.3,
        system: 'Test and validate the implementation thoroughly.',
      },
    ],
  }),

  /**
   * Problem-solving agent: understand -> explore -> solve -> verify
   */
  problemSolvingAgent: createAgentControlStrategy({
    phases: [
      {
        startStep: 0,
        endStep: 2,
        tools: ['clarify_problem', 'gather_context'],
        temperature: 0.6,
        system: 'Focus on understanding the problem completely.',
      },
      {
        startStep: 3,
        endStep: 8,
        tools: ['explore_solutions', 'research_approaches', 'brainstorm'],
        temperature: 0.8,
        system: 'Explore creative solutions and approaches.',
      },
      {
        startStep: 9,
        endStep: 15,
        tools: ['implement_solution', 'refine_approach'],
        temperature: 0.4,
        system: 'Implement the chosen solution systematically.',
      },
      {
        startStep: 16,
        tools: ['verify_solution', 'test_results', 'validate_outcome'],
        temperature: 0.3,
        system: 'Verify and validate the solution thoroughly.',
      },
    ],
  }),
} as const;
