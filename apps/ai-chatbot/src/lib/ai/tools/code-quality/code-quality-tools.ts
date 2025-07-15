/**
 * Code Quality Analysis Tools for AI Chatbot
 *
 * Provides comprehensive code analysis capabilities integrated with the AI chatbot,
 * allowing users to analyze code quality, detect patterns, and generate improvements.
 */

import {
  createCodeQualityWorkflow,
  workflowPresets,
  type CodeQualityWorkflowConfig,
} from '@repo/ai/server/tools';
import { tool } from 'ai';
import { z } from 'zod/v4';

// Input schema for code quality analysis
const codeQualityInputSchema = z.object({
  packagePath: z.string().describe('Path to the package or directory to analyze'),
  preset: z
    .enum(['quick', 'comprehensive', 'automated'])
    .default('comprehensive')
    .describe('Analysis preset'),
  options: z
    .object({
      createPR: z.boolean().default(false).describe('Create a pull request with improvements'),
      targetBranch: z.string().default('main').describe('Target branch for PR creation'),
      includeVercelOptimizations: z
        .boolean()
        .default(true)
        .describe('Include Vercel-specific optimizations'),
      includeTypeScriptAnalysis: z.boolean().default(true).describe('Include TypeScript analysis'),
      includeESLintAnalysis: z.boolean().default(true).describe('Include ESLint analysis'),
    })
    .optional()
    .default({
      createPR: false,
      targetBranch: 'main',
      includeVercelOptimizations: true,
      includeTypeScriptAnalysis: true,
      includeESLintAnalysis: true,
    }),
});

// Simplified code quality tool for AI chatbot use
export const codeQualityAnalysisTool = tool({
  description:
    'Perform comprehensive code quality analysis on a codebase. Analyzes TypeScript/JavaScript files, detects architectural patterns, provides optimization recommendations, and optionally creates pull requests with improvements.',

  inputSchema: codeQualityInputSchema,

  execute: async ({ packagePath, preset = 'comprehensive', options = {} }) => {
    try {
      // Create workflow configuration based on user input
      const workflowConfig: CodeQualityWorkflowConfig = {
        ...workflowPresets[preset],
        createPR: options.createPR,
        analysisConfig: {
          ...workflowPresets[preset].analysisConfig,
          targetBranch: options.targetBranch,
          vercelOptimizations: options.includeVercelOptimizations,
          typescript: options.includeTypeScriptAnalysis,
          eslint: options.includeESLintAnalysis,
        },
      };

      // Create the workflow
      const workflow = createCodeQualityWorkflow(workflowConfig);

      // Generate a unique session ID
      const sessionId = `chatbot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Return workflow information for the AI to use
      return {
        sessionId,
        workflow: {
          toolNames: Object.keys(workflow.tools),
          maxSteps: workflow.config.maxSteps,
          maxDuration: workflow.config.maxDuration,
          createPR: workflow.config.createPR,
          preset,
        },
        analysisConfig: workflow.config.analysisConfig,
        packagePath,
        instructions: `Code quality analysis workflow configured for ${packagePath}. The analysis will:
        
1. Create an isolated Git worktree for safety
2. Discover and prioritize files for analysis  
3. Detect architectural patterns (React, Next.js, state management, etc.)
4. Perform comprehensive code analysis (TypeScript, ESLint, complexity)
5. Analyze Vercel-specific optimization opportunities
6. Generate a detailed quality report with recommendations
${options.createPR ? '7. Create a pull request with improvements' : ''}

Use the individual tools from the workflow in sequence to perform the analysis.`,
        tools: workflow.tools,
        nextSteps: [
          'Start with the worktree creation tool',
          'Then use file discovery to identify files to analyze',
          'Run pattern detection, code analysis, and Vercel optimization in parallel',
          'Generate a comprehensive report',
          options.createPR ? 'Create a pull request with improvements' : 'Review recommendations',
        ],
      };
    } catch (error) {
      return {
        error: `Failed to setup code quality analysis: ${(error as Error).message}`,
        packagePath,
        preset,
      };
    }
  },

  // Multi-modal result content for rich display
  experimental_toToolResultContent: result => [
    {
      type: 'text',
      text: result.error
        ? `❌ Code Quality Analysis Setup Failed:\n${result.error}`
        : `🔍 Code Quality Analysis Configured!\n` +
          `📁 Package: ${result.packagePath}\n` +
          `⚙️ Preset: ${result.preset}\n` +
          `🛠️ Tools Available: ${result.workflow.toolNames.length}\n` +
          `⏱️ Max Duration: ${Math.round(result.workflow.maxDuration / 60000)} minutes\n` +
          `🎯 Max Steps: ${result.workflow.maxSteps}\n` +
          `${result.workflow.createPR ? '🚀 PR Creation: Enabled' : '📊 Report Only Mode'}\n\n` +
          `${result.instructions}\n\n` +
          `Next Steps:\n${result.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
    },
  ],
});

// Quick code review tool for simpler use cases
export const quickCodeReviewTool = tool({
  description:
    'Perform a quick code review analysis on a specific file or small directory. Provides immediate feedback on code quality issues.',

  inputSchema: z.object({
    filePath: z.string().describe('Path to the file or directory to review'),
    focusAreas: z
      .array(z.enum(['typescript', 'eslint', 'complexity', 'patterns', 'vercel']))
      .default(['typescript', 'eslint', 'complexity'])
      .describe('Areas to focus the review on'),
  }),

  execute: async ({ filePath, focusAreas = ['typescript', 'eslint', 'complexity'] }) => {
    try {
      // Create a lightweight analysis configuration
      const sessionId = `quick-review-${Date.now()}`;

      return {
        sessionId,
        filePath,
        focusAreas,
        analysis: {
          typescript: focusAreas.includes('typescript') ? 'TypeScript analysis enabled' : 'Skipped',
          eslint: focusAreas.includes('eslint') ? 'ESLint analysis enabled' : 'Skipped',
          complexity: focusAreas.includes('complexity') ? 'Complexity analysis enabled' : 'Skipped',
          patterns: focusAreas.includes('patterns') ? 'Pattern detection enabled' : 'Skipped',
          vercel: focusAreas.includes('vercel')
            ? 'Vercel optimization analysis enabled'
            : 'Skipped',
        },
        instructions:
          'Quick code review configured. This will analyze the specified file(s) for the selected focus areas and provide immediate feedback.',
        nextSteps: [
          'The analysis will examine the file for code quality issues',
          'Results will include specific recommendations',
          'No pull request will be created - this is for immediate feedback only',
        ],
      };
    } catch (error) {
      return {
        error: `Failed to setup quick code review: ${(error as Error).message}`,
        filePath,
      };
    }
  },

  experimental_toToolResultContent: result => [
    {
      type: 'text',
      text: result.error
        ? `❌ Quick Code Review Setup Failed:\n${result.error}`
        : `⚡ Quick Code Review Configured!\n` +
          `📄 File: ${result.filePath}\n` +
          `🎯 Focus Areas: ${result.focusAreas.join(', ')}\n\n` +
          `Analysis Configuration:\n` +
          `${Object.entries(result.analysis)
            .map(([area, status]) => `• ${area}: ${status}`)
            .join('\n')}\n\n` +
          `${result.instructions}\n\n` +
          `Next Steps:\n${result.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
    },
  ],
});

// Export code quality tools for AI chatbot integration
export const codeQualityTools = {
  codeQualityAnalysis: codeQualityAnalysisTool,
  quickCodeReview: quickCodeReviewTool,
};

export type CodeQualityToolsType = typeof codeQualityTools;
