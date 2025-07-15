/**
 * Tool Call Repair Mechanisms for AI SDK v5
 *
 * Handles imperfect model outputs and provides recovery strategies
 * for failed tool executions. Supports both manual repair and
 * experimental_repairToolCall API (AI SDK v5.0+).
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import { tool as aiTool, type Tool } from 'ai';
import { z } from 'zod/v4';

// Import experimental repair function if available
let experimentalRepairToolCall: any;
try {
  const aiModule = require('ai');
  experimentalRepairToolCall = aiModule.experimental_repairToolCall;
} catch {
  // Not available in this version
}

/**
 * Tool repair strategies
 */
export type RepairStrategy = 'reformat' | 'validate' | 'fallback' | 'retry' | 'sanitize';

/**
 * Tool repair configuration
 */
export interface ToolRepairConfig {
  maxRetries: number;
  repairStrategies: RepairStrategy[];
  timeout?: number;
  onRepairAttempt?: (context: RepairAttemptContext) => void | Promise<void>;
  onRepairSuccess?: (context: RepairSuccessContext) => void | Promise<void>;
  onRepairFailure?: (context: RepairFailureContext) => void | Promise<void>;
}

/**
 * Repair attempt context
 */
export interface RepairAttemptContext {
  toolName: string;
  originalInput: any;
  error: any;
  attempt: number;
  maxRetries: number;
  strategy: RepairStrategy;
  repairedInput?: any;
}

/**
 * Repair success context
 */
export interface RepairSuccessContext {
  toolName: string;
  originalInput: any;
  repairedInput: any;
  result: any;
  totalAttempts: number;
  successfulStrategy: RepairStrategy;
}

/**
 * Repair failure context
 */
export interface RepairFailureContext {
  toolName: string;
  originalInput: any;
  finalError: any;
  totalAttempts: number;
  strategiesAttempted: RepairStrategy[];
}

/**
 * Repair result
 */
export interface RepairResult<T = any> {
  success: boolean;
  result?: T;
  error?: any;
  repairedInput?: any;
  strategy?: RepairStrategy;
  attempts: number;
}

/**
 * Tool input sanitizers for common issues
 */
export const inputSanitizers = {
  /**
   * Remove extra whitespace and normalize strings
   */
  normalizeText: (input: any): any => {
    if (typeof input === 'string') {
      return input.trim().replace(/\s+/g, ' ');
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = inputSanitizers.normalizeText(value);
      }
      return sanitized;
    }
    return input;
  },

  /**
   * Fix common JSON formatting issues
   */
  fixJsonFormat: (input: any): any => {
    if (typeof input === 'string') {
      try {
        // Try to parse as JSON first
        return JSON.parse(input);
      } catch {
        // Common fixes for malformed JSON
        let fixed = input
          .replace(/'/g, '"') // Single quotes to double quotes
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Add quotes to keys

        try {
          return JSON.parse(fixed);
        } catch {
          return input; // Return original if still invalid
        }
      }
    }
    return input;
  },

  /**
   * Convert strings to numbers where appropriate
   */
  convertNumbers: (input: any): any => {
    if (typeof input === 'string' && /^\d+\.?\d*$/.test(input)) {
      return parseFloat(input);
    }
    if (typeof input === 'object' && input !== null) {
      const converted: any = {};
      for (const [key, value] of Object.entries(input)) {
        converted[key] = inputSanitizers.convertNumbers(value);
      }
      return converted;
    }
    return input;
  },

  /**
   * Remove null/undefined values
   */
  removeNulls: (input: any): any => {
    if (Array.isArray(input)) {
      return input.filter(item => item != null).map(inputSanitizers.removeNulls);
    }
    if (typeof input === 'object' && input !== null) {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (value != null) {
          cleaned[key] = inputSanitizers.removeNulls(value);
        }
      }
      return cleaned;
    }
    return input;
  },
};

/**
 * Default repair strategies implementation
 */
export const repairStrategies = {
  /**
   * Reformat input to match expected schema
   */
  reformat: async (input: any, _schema: z.ZodSchema): Promise<any> => {
    // Apply common sanitizers
    let formatted = inputSanitizers.normalizeText(input);
    formatted = inputSanitizers.fixJsonFormat(formatted);
    formatted = inputSanitizers.convertNumbers(formatted);
    formatted = inputSanitizers.removeNulls(formatted);

    return formatted;
  },

  /**
   * Validate and provide defaults for missing fields
   */
  validate: async (input: any, schema: z.ZodSchema): Promise<any> => {
    try {
      return schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Try to provide defaults for missing required fields
        const issues = error.issues;
        let repaired = { ...input };

        for (const issue of issues) {
          if (issue.code === 'invalid_type' && issue.expected === 'string') {
            repaired[issue.path[0]] = String(repaired[issue.path[0]] || '');
          } else if (issue.code === 'invalid_type' && issue.expected === 'number') {
            repaired[issue.path[0]] = Number(repaired[issue.path[0]]) || 0;
          } else if (issue.code === 'invalid_type' && issue.expected === 'boolean') {
            repaired[issue.path[0]] = Boolean(repaired[issue.path[0]]);
          }
        }

        return repaired;
      }
      throw error;
    }
  },

  /**
   * Provide fallback values for completely invalid input
   */
  fallback: async (input: any, schema: z.ZodSchema): Promise<any> => {
    // Extract default values from schema if available
    try {
      const result = schema.safeParse({});
      if (result.success) {
        return result.data;
      }
    } catch {
      // Schema doesn't have defaults
    }

    // Provide generic fallbacks based on schema type
    if (schema instanceof z.ZodString) {
      return '';
    }
    if (schema instanceof z.ZodNumber) {
      return 0;
    }
    if (schema instanceof z.ZodBoolean) {
      return false;
    }
    if (schema instanceof z.ZodArray) {
      return [];
    }
    if (schema instanceof z.ZodObject) {
      return {};
    }

    return input;
  },

  /**
   * Simple retry with original input
   */
  retry: async (input: any): Promise<any> => {
    return input;
  },

  /**
   * Sanitize input using all available sanitizers
   */
  sanitize: async (input: any): Promise<any> => {
    let sanitized = input;
    for (const sanitizer of Object.values(inputSanitizers)) {
      sanitized = sanitizer(sanitized);
    }
    return sanitized;
  },
};

/**
 * Repair a tool call with the given strategies
 */
export async function repairToolCall<T>(
  originalTool: Tool,
  input: any,
  error: any,
  config: ToolRepairConfig,
): Promise<RepairResult<T>> {
  // Try experimental repair API first if available (AI SDK v5.0+)
  if (experimentalRepairToolCall) {
    try {
      const repairResult = await experimentalRepairToolCall({
        tool: originalTool,
        input,
        error,
        maxRetries: config.maxRetries,
        strategies: config.repairStrategies,
      });

      if (repairResult.success) {
        return {
          success: true,
          result: repairResult.result,
          repairedInput: repairResult.repairedInput,
          strategy: repairResult.strategy || 'experimental',
          attempts: repairResult.attempts || 1,
        };
      }
    } catch (experimentalError) {
      logWarn('Experimental repair failed, falling back to manual repair:', experimentalError);
    }
  }

  // Fallback to manual repair strategies
  const { maxRetries, repairStrategies: strategies, timeout } = config;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const strategy of strategies) {
      try {
        // Notify about repair attempt
        if (config.onRepairAttempt) {
          await config.onRepairAttempt({
            toolName: originalTool.description || 'Unknown Tool',
            originalInput: input,
            error,
            attempt,
            maxRetries,
            strategy,
          });
        }

        // Apply repair strategy
        const strategyFn = repairStrategies[strategy];
        if (!strategyFn) {
          continue;
        }

        let repairedInput: any;

        if (strategy === 'retry') {
          repairedInput = input;
        } else {
          // Get schema from tool if available
          const schema = (originalTool as any).parameters || (originalTool as any).inputSchema;
          repairedInput = await strategyFn(input, schema);
        }

        // Execute tool with repaired input
        const executeWithTimeout = timeout
          ? Promise.race([
              originalTool.execute?.(repairedInput, {
                toolCallId: `repair-${Date.now()}`,
                messages: [],
              }) || Promise.resolve(null),
              new Promise((_resolve, reject) =>
                setTimeout(() => reject(new Error('Tool execution timeout')), timeout),
              ),
            ])
          : originalTool.execute?.(repairedInput, {
              toolCallId: `repair-${Date.now()}`,
              messages: [],
            }) || Promise.resolve(null);

        const result = await executeWithTimeout;

        // Success - notify and return
        if (config.onRepairSuccess) {
          await config.onRepairSuccess({
            toolName: originalTool.description || 'Unknown Tool',
            originalInput: input,
            repairedInput,
            result,
            totalAttempts: attempt,
            successfulStrategy: strategy,
          });
        }

        return {
          success: true,
          result,
          repairedInput,
          strategy,
          attempts: attempt,
        };
      } catch (repairError) {
        // Continue to next strategy
        if (config.onRepairAttempt) {
          await config.onRepairAttempt({
            toolName: originalTool.description || 'Unknown Tool',
            originalInput: input,
            error: repairError,
            attempt,
            maxRetries,
            strategy,
          });
        }
        continue;
      }
    }
  }

  // All repair attempts failed
  if (config.onRepairFailure) {
    await config.onRepairFailure({
      toolName: originalTool.description || 'Unknown Tool',
      originalInput: input,
      finalError: error,
      totalAttempts: maxRetries,
      strategiesAttempted: strategies,
    });
  }

  return {
    success: false,
    error,
    attempts: maxRetries,
  };
}

/**
 * Create a tool with built-in repair mechanisms
 */
export function createRepairableTool<_TParams, TResult>(
  baseTool: Tool,
  repairConfig: ToolRepairConfig,
): Tool {
  return aiTool({
    description: baseTool.description,
    parameters: (baseTool as any).parameters,
    execute: async (input: any, options: any) => {
      try {
        // Try original execution first
        return await baseTool.execute?.(input, options);
      } catch (error) {
        // Attempt repair
        const repairResult = await repairToolCall<TResult>(baseTool, input, error, repairConfig);

        if (repairResult.success) {
          return repairResult.result;
        }

        // If repair failed, throw the original error
        throw error;
      }
    },
  });
}

/**
 * Default repair configurations for common scenarios
 */
export const repairPresets = {
  /**
   * Basic repair for user input validation issues
   */
  userInput: {
    maxRetries: 2,
    repairStrategies: ['sanitize', 'validate', 'reformat'] as RepairStrategy[],
    timeout: 10000,
  },

  /**
   * Aggressive repair for API data formatting issues
   */
  apiData: {
    maxRetries: 3,
    repairStrategies: ['reformat', 'sanitize', 'validate', 'fallback'] as RepairStrategy[],
    timeout: 15000,
  },

  /**
   * Simple retry for transient errors
   */
  transient: {
    maxRetries: 3,
    repairStrategies: ['retry'] as RepairStrategy[],
    timeout: 5000,
  },

  /**
   * Comprehensive repair for complex data structures
   */
  comprehensive: {
    maxRetries: 4,
    repairStrategies: ['sanitize', 'reformat', 'validate', 'fallback', 'retry'] as RepairStrategy[],
    timeout: 20000,
    onRepairAttempt: async (context: any) => {
      logInfo(`🔧 Repair attempt ${context.attempt}: ${context.strategy}`);
    },
    onRepairSuccess: async (context: any) => {
      logInfo(
        `✅ Repair successful after ${context.totalAttempts} attempts using ${context.successfulStrategy}`,
      );
    },
    onRepairFailure: async (context: any) => {
      logError(`❌ Repair failed after ${context.totalAttempts} attempts`);
    },
  },
} as const;

/**
 * Create tools with repair capabilities using presets
 */
export const repairableTools = {
  withUserInputRepair: (tool: Tool) => createRepairableTool(tool, repairPresets.userInput),
  withApiDataRepair: (tool: Tool) => createRepairableTool(tool, repairPresets.apiData),
  withTransientRepair: (tool: Tool) => createRepairableTool(tool, repairPresets.transient),
  withComprehensiveRepair: (tool: Tool) => createRepairableTool(tool, repairPresets.comprehensive),
};
