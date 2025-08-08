/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * Code Analysis Tool for Code Quality Assessment
 *
 * Performs comprehensive code quality analysis including TypeScript checking,
 * ESLint analysis, complexity calculation, and issue detection.
 */

import { tool } from 'ai';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod/v4';
import { mcpClient } from '../mcp-client';
import type { FileAnalysis, Issue } from '../types';
import { BoundedCache } from '../utils';

// Create a cache for analysis results
const analysisCache = new BoundedCache({
  maxSize: 500,
  ttl: 3600000, // 1 hour
  enableAnalytics: true,
});

// Input schema for code analysis
const analysisInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  filePaths: z.array(z.string()).describe('File paths to analyze'),
  options: z
    .object({
      typescript: z.boolean().default(true).describe('Run TypeScript analysis'),
      eslint: z.boolean().default(true).describe('Run ESLint analysis'),
      complexity: z.boolean().default(true).describe('Calculate complexity metrics'),
      maxComplexity: z.number().default(10).describe('Maximum acceptable complexity'),
    })
    .optional()
    .default({
      typescript: true,
      eslint: true,
      complexity: true,
      maxComplexity: 10,
    }),
});

// Analysis result
interface CodeAnalysisResult {
  sessionId: string;
  analyses: FileAnalysis[];
  summary: {
    totalFiles: number;
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    averageComplexity: number;
    highComplexityFiles: number;
  };
}

// Run command with output capture
async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  timeout: number = 30000,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'pipe' });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', data => {
      stdout += data.toString();
    });

    child.stderr?.on('data', data => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Command timeout'));
    }, timeout);

    child.on('close', code => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code || 0 });
    });

    child.on('error', error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

// Calculate cyclomatic complexity
function calculateComplexity(content: string): number {
  // Simple complexity calculation based on control flow statements
  const complexityPatterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bwhile\s*\(/g,
    /\bfor\s*\(/g,
    /\bdo\s+{/g,
    /\bswitch\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /\bthrow\s+/g,
    /\breturn\s+/g,
    /\?\s*.*?\s*:/g, // ternary operators
    /&&/g,
    /\|\|/g,
  ];

  let complexity = 1; // Base complexity

  for (const pattern of complexityPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
}

// Parse TypeScript compiler output
function parseTypeScriptOutput(output: string, filePath: string): Issue[] {
  const issues: Issue[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    if (line.includes(filePath)) {
      const match = line.match(/(\d+):(\d+)\s*-\s*(error|warning|info)\s*TS(\d+):\s*(.+)/);
      if (match) {
        const [, lineNum, col, severity, code, message] = match;
        issues.push({
          type: severity as 'error' | 'warning' | 'info',
          severity: severity === 'error' ? 3 : severity === 'warning' ? 2 : 1,
          message: message.trim(),
          line: parseInt(lineNum),
          column: parseInt(col),
          rule: `TS${code}`,
        });
      }
    }
  }

  return issues;
}

// Parse ESLint output
function parseESLintOutput(output: string): Issue[] {
  try {
    const results = JSON.parse(output);
    const issues: Issue[] = [];

    for (const result of results) {
      for (const message of result.messages || []) {
        issues.push({
          type: message.severity === 2 ? 'error' : 'warning',
          severity: message.severity,
          message: message.message,
          line: message.line,
          column: message.column,
          rule: message.ruleId || 'unknown',
        });
      }
    }

    return issues;
  } catch {
    return [];
  }
}

// Analyze single file
async function analyzeFile(
  filePath: string,
  packagePath: string,
  options: {
    typescript: boolean;
    eslint: boolean;
    complexity: boolean;
    maxComplexity: number;
  },
): Promise<FileAnalysis> {
  const fullPath = join(packagePath, filePath);
  const issues: Issue[] = [];
  let complexity = 0;

  try {
    // Read file content
    const content = await readFile(fullPath, 'utf-8');
    const stats = await import('node:fs/promises').then(fs => fs.stat(fullPath));

    // Calculate complexity if requested
    if (options.complexity) {
      complexity = calculateComplexity(content);

      if (complexity > options.maxComplexity) {
        issues.push({
          type: 'warning',
          severity: 2,
          message: `High cyclomatic complexity: ${complexity} (max: ${options.maxComplexity})`,
          rule: 'complexity',
        });
      }
    }

    // TypeScript analysis
    if (options.typescript && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
      try {
        const tsResult = await runCommand(
          'npx',
          ['tsc', '--noEmit', '--skipLibCheck', filePath],
          packagePath,
          10000,
        );
        const tsIssues = parseTypeScriptOutput(tsResult.stdout + tsResult.stderr, filePath);
        issues.push(...tsIssues);
      } catch (error) {
        // TypeScript analysis failed, add as info
        issues.push({
          type: 'info',
          severity: 1,
          message: `TypeScript analysis failed: ${(error as Error).message}`,
          rule: 'typescript-error',
        });
      }
    }

    // ESLint analysis
    if (options.eslint) {
      try {
        const eslintResult = await runCommand(
          'npx',
          ['eslint', '--format', 'json', filePath],
          packagePath,
          10000,
        );
        const eslintIssues = parseESLintOutput(eslintResult.stdout);
        issues.push(...eslintIssues);
      } catch (_error) {
        // ESLint analysis failed, might not be configured
        // Don't add this as an issue since it's optional
      }
    }

    return {
      path: filePath,
      size: stats.size,
      lastModified: stats.mtime,
      complexity,
      issues,
    };
  } catch (error) {
    return {
      path: filePath,
      size: 0,
      lastModified: new Date(),
      complexity: 0,
      issues: [
        {
          type: 'error',
          severity: 3,
          message: `Failed to analyze file: ${(error as Error).message}`,
          rule: 'analysis-error',
        },
      ],
    };
  }
}

// Main code analysis tool
export const analysisTool = tool({
  description:
    'Perform comprehensive code quality analysis including TypeScript checking, ESLint analysis, complexity calculation, and issue detection.',

  inputSchema: analysisInputSchema,

  execute: async ({
    sessionId,
    filePaths,
    options = { typescript: true, eslint: true, complexity: true, maxComplexity: 10 },
  }: any) => {
    try {
      // Get package path from session
      const session = await mcpClient.getSession(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const packagePath = session.worktreePath || session.workingDirectory;

      // Analyze files in parallel (with concurrency limit)
      const concurrency = 5;
      const analyses: FileAnalysis[] = [];

      for (let i = 0; i < filePaths.length; i += concurrency) {
        const batch = filePaths.slice(i, i + concurrency);
        const batchPromises = batch.map((filePath: string) =>
          analyzeFile(filePath, packagePath, options),
        );

        const batchResults = await Promise.all(batchPromises);
        analyses.push(...batchResults);
      }

      // Calculate summary statistics
      const totalIssues = analyses.reduce(
        (sum, analysis) => sum + (analysis.issues?.length || 0),
        0,
      );
      const errorCount = analyses.reduce(
        (sum, analysis) =>
          sum + (analysis.issues?.filter(issue => issue.type === 'error').length || 0),
        0,
      );
      const warningCount = analyses.reduce(
        (sum, analysis) =>
          sum + (analysis.issues?.filter(issue => issue.type === 'warning').length || 0),
        0,
      );
      const infoCount = analyses.reduce(
        (sum, analysis) =>
          sum + (analysis.issues?.filter(issue => issue.type === 'info').length || 0),
        0,
      );

      const complexities = analyses.map(a => a.complexity || 0).filter(c => c > 0);
      const averageComplexity =
        complexities.length > 0
          ? Math.round((complexities.reduce((sum, c) => sum + c, 0) / complexities.length) * 10) /
            10
          : 0;

      const highComplexityFiles = analyses.filter(
        a => (a.complexity || 0) > options.maxComplexity,
      ).length;

      const result: CodeAnalysisResult = {
        sessionId,
        analyses,
        summary: {
          totalFiles: analyses.length,
          totalIssues,
          errorCount,
          warningCount,
          infoCount,
          averageComplexity,
          highComplexityFiles,
        },
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'code-analysis',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'code-analysis',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // AI SDK v5: toModelOutput with proper content shapes
  toModelOutput: (result: CodeAnalysisResult) => ({
    type: 'content',
    value: [
      {
        type: 'text',
        text:
          `🔍 Code Analysis Results:\n` +
          `📁 Files analyzed: ${result.summary.totalFiles}\n` +
          `🚨 Total issues: ${result.summary.totalIssues}\n` +
          `❌ Errors: ${result.summary.errorCount}\n` +
          `⚠️ Warnings: ${result.summary.warningCount}\n` +
          `ℹ️ Info: ${result.summary.infoCount}\n` +
          `🔢 Average complexity: ${result.summary.averageComplexity}\n` +
          `📈 High complexity files: ${result.summary.highComplexityFiles}\n` +
          `${result.summary.errorCount === 0 ? '✅ No critical errors found' : '⚠️ Critical errors need attention'}`,
      },
    ],
  }),
} as any);

export type { CodeAnalysisResult };
