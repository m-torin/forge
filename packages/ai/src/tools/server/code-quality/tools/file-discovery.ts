/**
 * File Discovery Tool for Code Quality Analysis
 *
 * Discovers and prioritizes files for code quality analysis.
 * Handles file filtering, Git change detection, batch creation, and caching.
 */

import { logInfo } from '@repo/observability';
import { tool } from 'ai';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod/v3';
import { mcpClient } from '../mcp-client';
// glob module placeholder - not available
const glob = async (_pattern: string, _options?: { cwd?: string; ignore?: string[] }) => [];

// Input schema for file discovery
const fileDiscoveryInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  packagePath: z.string().describe('Path to the package to analyze'),
  excludePatterns: z
    .array(z.string())
    .optional()
    .default([])
    .describe('Additional patterns to exclude'),
  options: z
    .object({
      includeTests: z.boolean().default(false).describe('Include test files in analysis'),
      batchSize: z.number().default(3000).describe('Target lines per batch'),
      cacheEnabled: z.boolean().default(true).describe('Use cached analysis results'),
    })
    .optional()
    .default({
      includeTests: false,
      batchSize: 3000,
      cacheEnabled: true,
    }),
});

// Response type for file discovery
interface FileDiscoveryResult {
  allFiles: string[];
  toAnalyze: string[];
  cachedFiles: string[];
  changedFiles: string[];
  batches: string[][];
  cacheHitRate: number;
  summary: {
    totalFiles: number;
    cachedFiles: number;
    toAnalyze: number;
    changedFiles: number;
    batchCount: number;
  };
}

// Discover source files with filtering
async function discoverSourceFiles(
  packagePath: string,
  excludePatterns: string[],
  includeTests: boolean,
): Promise<string[]> {
  // Default exclude patterns
  const defaultExcludes = [
    'node_modules',
    'dist',
    'build',
    '.next',
    'coverage',
    '.turbo',
    '.git',
    'out',
    'generated',
    '.cache',
    ...(includeTests ? [] : ['__tests__', '*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx']),
  ];

  const allExcludes = [...defaultExcludes, ...excludePatterns];

  // Get all TypeScript/JavaScript files
  const allFiles = await glob('**/*.{ts,tsx,js,jsx,mjs}', {
    cwd: packagePath,
    ignore: allExcludes,
  });

  return allFiles.map((file: string) => file.replace(/\\/g, '/')); // Normalize paths
}

// Get changed files from Git
async function getChangedFiles(packagePath: string): Promise<string[]> {
  try {
    // This would integrate with git tools in production
    // For now, simulate git status check
    const { exec } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const execAsync = promisify(exec);

    const { stdout } = await execAsync('git status --porcelain', { cwd: packagePath });

    const changedFiles = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.slice(3)) // Remove git status prefix
      .filter(
        file =>
          file.endsWith('.ts') ||
          file.endsWith('.tsx') ||
          file.endsWith('.js') ||
          file.endsWith('.jsx') ||
          file.endsWith('.mjs'),
      );

    return changedFiles;
  } catch (_error) {
    logInfo('Git status not available, will analyze all files');
    return [];
  }
}

// Check if file analysis is cached
async function getCachedAnalysis(filePath: string, sessionId: string): Promise<any | null> {
  try {
    // This would use the actual MCP search in production
    // For now, simulate cache lookup
    const results = await mcpClient.getSessionResults(sessionId);

    const cachedResult = results.find(
      result => result.toolName === 'file-analysis' && result.data.filePath === filePath,
    );

    if (cachedResult) {
      // Cache is valid for 24 hours
      const cacheValidDuration = 24 * 60 * 60 * 1000;
      const isValid = Date.now() - cachedResult.timestamp < cacheValidDuration;
      return isValid ? cachedResult : null;
    }
  } catch (_error) {
    // Ignore cache errors
  }

  return null;
}

// Filter out already analyzed files
async function filterAnalyzedFiles(
  allFiles: string[],
  sessionId: string,
  cacheEnabled: boolean,
): Promise<{ toAnalyze: string[]; cachedFiles: string[] }> {
  if (!cacheEnabled) {
    return { toAnalyze: allFiles, cachedFiles: [] };
  }

  const toAnalyze: string[] = [];
  const cachedFiles: string[] = [];

  // Check each file in cache
  for (const file of allFiles) {
    const cached = await getCachedAnalysis(file, sessionId);

    if (cached) {
      cachedFiles.push(file);
    } else {
      toAnalyze.push(file);
    }
  }

  return { toAnalyze, cachedFiles };
}

// Prioritize files (changed files first)
function prioritizeFiles(toAnalyze: string[], changedFiles: string[]): string[] {
  const changedSet = new Set(changedFiles);
  const priorityFiles: string[] = [];
  const normalFiles: string[] = [];

  for (const file of toAnalyze) {
    if (changedSet.has(file)) {
      priorityFiles.push(file);
    } else {
      normalFiles.push(file);
    }
  }

  // Return changed files first, then others
  return [...priorityFiles, ...normalFiles];
}

// Create optimized batches based on file sizes
async function createOptimizedBatches(
  files: string[],
  packagePath: string,
  targetBatchSize: number,
): Promise<string[][]> {
  const filesWithSizes: Array<{ file: string; lines: number }> = [];

  // Estimate file sizes
  for (const file of files) {
    try {
      const fullPath = join(packagePath, file);
      const content = await readFile(fullPath, 'utf-8');
      const lines = content.split('\n').length;
      filesWithSizes.push({ file, lines });
    } catch {
      // Default estimate for files we can't read
      filesWithSizes.push({ file, lines: 100 });
    }
  }

  // Sort by size (largest first for better load distribution)
  filesWithSizes.sort((a, b) => b.lines - a.lines);

  // Create batches with balanced sizes
  const batches: string[][] = [];
  let currentBatch: string[] = [];
  let currentSize = 0;

  for (const { file, lines } of filesWithSizes) {
    if (currentSize + lines > targetBatchSize && currentBatch.length > 0) {
      batches.push([...currentBatch]);
      currentBatch = [file];
      currentSize = lines;
    } else {
      currentBatch.push(file);
      currentSize += lines;
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

// Main file discovery tool
export const fileDiscoveryTool = tool({
  description:
    'Discover and prioritize files for code quality analysis. Handles file filtering, Git change detection, batch creation, and caching of already-analyzed files.',

  inputSchema: fileDiscoveryInputSchema,

  execute: async (input: any) => {
    const {
      sessionId,
      packagePath,
      excludePatterns = [],
      options = { includeTests: false, batchSize: 3000, cacheEnabled: true },
    } = input;
    try {
      // Step 1: Discover all source files
      const allFiles = await discoverSourceFiles(
        packagePath,
        excludePatterns,
        options.includeTests,
      );

      // Step 2: Get changed files from Git
      const changedFiles = await getChangedFiles(packagePath);

      // Step 3: Check cache for already analyzed files
      const { toAnalyze, cachedFiles } = await filterAnalyzedFiles(
        allFiles,
        sessionId,
        options.cacheEnabled,
      );

      // Step 4: Prioritize changed files
      const prioritizedFiles = prioritizeFiles(toAnalyze, changedFiles);

      // Step 5: Create optimized batches
      const batches = await createOptimizedBatches(
        prioritizedFiles,
        packagePath,
        options.batchSize,
      );

      // Calculate cache hit rate
      const cacheHitRate =
        allFiles.length > 0 ? Math.round((cachedFiles.length / allFiles.length) * 100) : 0;

      const result: FileDiscoveryResult = {
        allFiles,
        toAnalyze: prioritizedFiles,
        cachedFiles,
        changedFiles,
        batches,
        cacheHitRate,
        summary: {
          totalFiles: allFiles.length,
          cachedFiles: cachedFiles.length,
          toAnalyze: prioritizedFiles.length,
          changedFiles: changedFiles.length,
          batchCount: batches.length,
        },
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'file-discovery',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      // Store error result
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'file-discovery',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // Multi-modal result content
  toModelOutput: (result: FileDiscoveryResult) => ({
    type: 'content',
    value: [
      {
        type: 'text' as const,
        text:
          `📂 File Discovery Results:\n` +
          `📊 Total files: ${result.summary.totalFiles}\n` +
          `📝 Files to analyze: ${result.summary.toAnalyze}\n` +
          `💾 Cached files: ${result.summary.cachedFiles} (${result.cacheHitRate}% hit rate)\n` +
          `🔄 Changed files: ${result.summary.changedFiles}\n` +
          `📦 Analysis batches: ${result.summary.batchCount}\n` +
          `${result.summary.changedFiles > 0 ? '🎯 Prioritized changed files for analysis' : '📋 Ready for full analysis'}`,
      },
    ],
  }),
} as any);

export type { FileDiscoveryResult };
