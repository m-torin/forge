/**
 * Full Code Quality Analysis Workflow
 *
 * Orchestrates the complete code quality analysis pipeline using AI SDK v5
 * multi-step execution with progressive tool unlocking and stopping conditions.
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import type { Tool } from 'ai';
import { hasToolCall } from 'ai';
import { analysisTool } from '../tools/analysis';
import { fileDiscoveryTool } from '../tools/file-discovery';
import { patternDetectionTool } from '../tools/pattern-detection';
import { prCreationTool } from '../tools/pr-creation';
import { reportGenerationTool } from '../tools/report-generation';
import { vercelOptimizationTool } from '../tools/vercel-optimization';
import { worktreeTool } from '../tools/worktree';
import type { CodeQualityConfig } from '../types';
// stepCountIs may not be available in current AI SDK version
const _stepCountIs = (count: number) => ({ type: 'maxSteps', count });

// Workflow configuration
export interface CodeQualityWorkflowConfig {
  /** Maximum number of steps allowed */
  maxSteps?: number;
  /** Maximum duration in milliseconds */
  maxDuration?: number;
  /** Create PR automatically after analysis */
  createPR?: boolean;
  /** Analysis configuration */
  analysisConfig?: CodeQualityConfig;
}

// Create the complete code quality analysis workflow
export function createCodeQualityWorkflow(config: CodeQualityWorkflowConfig = {}) {
  const {
    maxSteps = 10,
    maxDuration = 600000, // 10 minutes
    createPR = false,
    analysisConfig = {},
  } = config;

  // All available tools in the workflow
  const tools: Record<string, Tool> = {
    createWorktree: worktreeTool,
    discoverFiles: fileDiscoveryTool,
    analyzePatterns: patternDetectionTool,
    analyzeCode: analysisTool,
    optimizeForVercel: vercelOptimizationTool,
    generateReport: reportGenerationTool,
    createPullRequest: prCreationTool,
  };

  // Stopping conditions for the workflow
  const stopWhen = [
    // Stop after maximum steps
    // stepCountIs(maxSteps), // Temporarily disabled - not available in current AI SDK

    // Stop when PR is created (if enabled)
    ...(createPR ? [hasToolCall('createPullRequest')] : [hasToolCall('generateReport')]),

    // Stop after maximum duration
    {
      evaluate: ({ steps }: any) => {
        if (steps.length === 0) return false;
        const startTime = steps[0].timestamp || Date.now();
        return Date.now() - startTime > maxDuration;
      },
    },

    // Stop on critical errors (more than 3 consecutive failed tool calls)
    {
      evaluate: ({ steps }: any) => {
        if (steps.length < 3) return false;
        const lastThreeSteps = steps.slice(-3);
        return lastThreeSteps.every((step: any) =>
          step.toolResults?.some((result: any) => result.isError),
        );
      },
    },
  ];

  // Progressive tool unlocking based on workflow steps
  const experimental_prepareStep = async ({ stepNumber, steps }: any) => {
    const completedToolCalls = steps.flatMap(
      (step: any) => step.toolCalls?.map((tc: any) => tc.toolName) || [],
    );

    const hasCompletedTool = (toolName: string) => completedToolCalls.includes(toolName);

    // Step 0: Always start with worktree creation
    if (stepNumber === 0) {
      return {
        toolChoice: { type: 'tool', toolName: 'createWorktree' },
        activeTools: ['createWorktree'],
      };
    }

    // Step 1: After worktree creation, discover files
    if (hasCompletedTool('createWorktree') && !hasCompletedTool('discoverFiles')) {
      return {
        toolChoice: { type: 'tool', toolName: 'discoverFiles' },
        activeTools: ['discoverFiles'],
      };
    }

    // Step 2-4: After file discovery, run analysis tools in parallel
    if (
      hasCompletedTool('discoverFiles') &&
      !hasCompletedTool('analyzePatterns') &&
      !hasCompletedTool('analyzeCode') &&
      !hasCompletedTool('optimizeForVercel')
    ) {
      return {
        activeTools: ['analyzePatterns', 'analyzeCode', 'optimizeForVercel'],
      };
    }

    // Step 5: After all analysis is complete, generate report
    if (
      hasCompletedTool('analyzePatterns') &&
      hasCompletedTool('analyzeCode') &&
      hasCompletedTool('optimizeForVercel') &&
      !hasCompletedTool('generateReport')
    ) {
      return {
        toolChoice: { type: 'tool', toolName: 'generateReport' },
        activeTools: ['generateReport'],
      };
    }

    // Step 6: After report generation, optionally create PR
    if (createPR && hasCompletedTool('generateReport') && !hasCompletedTool('createPullRequest')) {
      return {
        toolChoice: { type: 'tool', toolName: 'createPullRequest' },
        activeTools: ['createPullRequest'],
      };
    }

    // Default: allow any remaining tools
    return {
      activeTools: Object.keys(tools),
    };
  };

  // Lifecycle hooks for progress tracking and error handling
  const onStepFinish = async ({ toolCalls, toolResults, stepNumber, finishReason }: any) => {
    // Log progress
    if (toolCalls && toolCalls.length > 0) {
      const toolNames = toolCalls.map((tc: any) => tc.toolName).join(', ');
      logInfo(`Step ${stepNumber} completed: ${toolNames}`);

      // Check for errors
      const errors = toolResults?.filter((tr: any) => tr.isError) || [];
      if (errors.length > 0) {
        logError(`Step ${stepNumber} errors: ${errors.map((e: any) => e.result).join(', ')}`);
      }
    }

    // Log completion
    if (finishReason === 'stop') {
      logInfo('Code quality analysis workflow completed successfully');
    } else if (finishReason === 'length') {
      logInfo('Code quality analysis workflow stopped due to length limit');
    }
  };

  // Tool repair configuration for handling failures
  const experimental_repairToolCall = async ({
    toolCall,
    error,
    tools: _tools,
    attempt,
    maxRetries = 3,
  }: any) => {
    logWarn(
      `Tool ${toolCall.toolName} failed (attempt ${attempt}/${maxRetries}): ${error.message}`,
    );

    // Specific repair strategies for different tools
    switch (toolCall.toolName) {
      case 'createWorktree':
        // For worktree creation, try with different session ID
        if (attempt < maxRetries) {
          const newSessionId = `${toolCall.args.sessionId}-retry-${attempt}`;
          return { ...toolCall, args: { ...toolCall.args, sessionId: newSessionId } };
        }
        break;

      case 'discoverFiles':
        // For file discovery, try with more restrictive patterns
        if (attempt < maxRetries) {
          const moreExcludes = [
            ...(toolCall.args.excludePatterns || []),
            '**/*.min.js',
            '**/vendor/**',
          ];
          return { ...toolCall, args: { ...toolCall.args, excludePatterns: moreExcludes } };
        }
        break;

      case 'analyzeCode':
        // For code analysis, try with reduced options
        if (attempt < maxRetries) {
          const reducedOptions = {
            ...toolCall.args.options,
            typescript: false, // Disable TypeScript analysis if it's failing
            complexity: true, // Keep complexity analysis
          };
          return { ...toolCall, args: { ...toolCall.args, options: reducedOptions } };
        }
        break;

      default:
        // Generic retry with same parameters
        if (attempt < maxRetries) {
          return toolCall;
        }
    }

    // If we can't repair, return null to fail the tool call
    return null;
  };

  return {
    tools,
    stopWhen,
    experimental_prepareStep,
    onStepFinish,
    experimental_repairToolCall,
    config: {
      maxSteps,
      maxDuration,
      createPR,
      analysisConfig,
    },
  };
}

// Predefined workflow configurations
export const workflowPresets = {
  /** Quick analysis without optimizations */
  quick: {
    maxSteps: 6,
    maxDuration: 300000, // 5 minutes
    createPR: false,
    analysisConfig: {
      typescript: true,
      eslint: false,
      vercelOptimizations: false,
    },
  },

  /** Full analysis with all optimizations */
  comprehensive: {
    maxSteps: 10,
    maxDuration: 900000, // 15 minutes
    createPR: false,
    analysisConfig: {
      typescript: true,
      eslint: true,
      vercelOptimizations: true,
    },
  },

  /** Full analysis with automatic PR creation */
  automated: {
    maxSteps: 12,
    maxDuration: 1200000, // 20 minutes
    createPR: true,
    analysisConfig: {
      typescript: true,
      eslint: true,
      vercelOptimizations: true,
      targetBranch: 'main',
    },
  },
};

// Default export for the full workflow
export const codeQualityWorkflow = createCodeQualityWorkflow(workflowPresets.comprehensive);

// Types are already exported above
