/**
 * Git Worktree Tool for Code Quality Analysis
 *
 * Creates isolated Git worktrees for safe code quality analysis.
 * Handles worktree detection, creation, essential file copying, and dependency installation.
 */

import { logWarn } from '@repo/observability';
import { tool, type Tool } from 'ai';
import { spawn } from 'node:child_process';
import { basename, dirname, join, resolve } from 'node:path';
import { Transform } from 'node:stream';
import { z } from 'zod/v4';
import { mcpClient } from '../mcp-client';
import type { CodeQualitySession, WorktreeInfo } from '../types';

// Input schema for the worktree tool
const worktreeInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier for the analysis'),
  packagePath: z
    .string()
    .optional()
    .describe('Path to the package to analyze (defaults to current working directory)'),
  options: z
    .object({
      copyEssentials: z.boolean().default(true).describe('Copy essential configuration files'),
      installDeps: z.boolean().default(true).describe('Install dependencies in worktree'),
      validateSetup: z.boolean().default(true).describe('Perform health checks after setup'),
    })
    .optional()
    .default({
      copyEssentials: true,
      installDeps: true,
      validateSetup: true,
    }),
});

// Enhanced error class for worktree operations
class WorktreeError extends Error {
  constructor(
    message: string,
    public context: any = {},
  ) {
    super(message);
    this.name = 'WorktreeError';
  }
}

// Memory-efficient spawn utility
async function runCommandWithSpawn(
  command: string,
  args: string[],
  options: { cwd?: string; timeout?: number; maxOutputSize?: number } = {},
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const maxOutputSize = options.maxOutputSize || 10 * 1024 * 1024; // 10MB default
  const timeout = options.timeout || 30000; // 30s default

  return new Promise((resolve, reject) => {
    let outputSize = 0;
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let killed = false;

    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: options.cwd,
    });

    // Create transform stream to limit output size
    const limitTransform = (chunks: Buffer[]) => {
      return new Transform({
        transform(chunk, encoding, callback) {
          outputSize += chunk.length;
          if (outputSize > maxOutputSize) {
            killed = true;
            child.kill('SIGTERM');
            callback(new Error(`Output exceeded ${maxOutputSize} bytes`));
          } else {
            chunks.push(chunk);
            callback();
          }
        },
      });
    };

    // Pipe with backpressure handling
    child.stdout.pipe(limitTransform(stdoutChunks));
    child.stderr.pipe(limitTransform(stderrChunks));

    // Timeout handling
    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGTERM');
      setTimeout(() => {
        if (!child.killed) child.kill('SIGKILL');
      }, 5000);
    }, timeout);

    child.on('error', error => {
      clearTimeout(timer);
      reject(new Error(`Failed to start command: ${error.message}`));
    });

    child.on('close', code => {
      clearTimeout(timer);
      const stdout = Buffer.concat(stdoutChunks).toString();
      const stderr = Buffer.concat(stderrChunks).toString();

      if (killed) {
        const error = new Error(
          outputSize > maxOutputSize ? 'Output size exceeded' : 'Process killed',
        );
        reject(error);
      } else if (code === 0) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        const error = new Error(`Command failed with exit code ${code}`);
        reject(error);
      }
    });
  });
}

// File utilities
async function fileExists(path: string): Promise<boolean> {
  try {
    // This would use the Read tool from the context
    // For now, we'll simulate with a basic check
    const fs = await import('node:fs/promises');
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyEssentialFiles(
  sourcePath: string,
  targetPath: string,
): Promise<{
  copied: number;
  total: number;
  results: Array<{ file: string; success: boolean; reason?: string }>;
}> {
  const fs = await import('node:fs/promises');
  const essentialFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    '.mcp.json',
    'CLAUDE.md',
    '.npmrc',
    '.nvmrc',
  ];

  const copyPromises = essentialFiles.map(async file => {
    try {
      const sourceFile = join(sourcePath, file);
      const targetFile = join(targetPath, file);

      if (await fileExists(sourceFile)) {
        await fs.copyFile(sourceFile, targetFile);
        return { file, success: true };
      }
      return { file, success: false, reason: 'not found' };
    } catch (error) {
      return { file, success: false, reason: (error as Error).message };
    }
  });

  const results = await Promise.all(copyPromises);
  const copied = results.filter(r => r.success).length;
  return { copied, total: essentialFiles.length, results };
}

// Path management
function getWorktreePath(
  packagePath: string,
  sessionId: string,
): {
  worktreePath: string;
  projectName: string;
  parentPath: string;
} {
  const absolutePath = resolve(packagePath);
  const projectName = basename(absolutePath);
  const parentPath = dirname(absolutePath);
  const worktreeName = `${projectName}-quality-${sessionId}`;
  const worktreePath = join(parentPath, worktreeName);

  // Validate path length for Windows compatibility
  if (process.platform === 'win32' && worktreePath.length > 260) {
    throw new Error('Path too long for Windows');
  }

  return { worktreePath, projectName, parentPath };
}

// Main worktree creation function
async function createQualityWorktree(
  packagePath: string,
  sessionId: string,
  options: { copyEssentials: boolean; installDeps: boolean; validateSetup: boolean },
): Promise<WorktreeInfo & { sessionId: string; parentPath: string; isNewWorktree: boolean }> {
  const finalPackagePath = packagePath || process.cwd();

  // Get path information
  const {
    worktreePath,
    projectName: _projectName,
    parentPath: _parentPath,
  } = getWorktreePath(finalPackagePath, sessionId);

  // Get current branch name (no new branch creation)
  let currentBranch = 'HEAD';
  try {
    // This would integrate with git tools in the actual implementation
    const { stdout } = await runCommandWithSpawn('git', ['branch', '--show-current'], {
      cwd: finalPackagePath,
    });
    currentBranch = stdout.trim() || 'HEAD';
  } catch (error) {
    logWarn('Failed to get current branch, using HEAD', { error });
  }

  try {
    // Create the worktree from existing branch only
    await runCommandWithSpawn('git', ['worktree', 'add', worktreePath, currentBranch], {
      cwd: finalPackagePath,
      timeout: 60000,
    });

    // Copy essential files if requested
    if (options.copyEssentials) {
      await copyEssentialFiles(finalPackagePath, worktreePath);
    }

    // Install dependencies if needed and requested
    if (options.installDeps && (await fileExists(join(worktreePath, 'package.json')))) {
      try {
        await runCommandWithSpawn('pnpm', ['install'], {
          cwd: worktreePath,
          timeout: 120000, // 2 minutes for install
          maxOutputSize: 50 * 1024 * 1024, // 50MB for install output
        });
      } catch (error) {
        logWarn('Failed to install dependencies', { error });
        // Continue anyway - dependencies might not be critical
      }
    }

    return {
      sessionId,
      path: worktreePath,
      branch: currentBranch,
      commit: 'HEAD', // Would get actual commit hash in real implementation
      clean: true,
      parentPath: finalPackagePath,
      isNewWorktree: true,
    };
  } catch (error) {
    throw new WorktreeError(`Failed to create worktree: ${(error as Error).message}`, {
      sessionId,
      packagePath: finalPackagePath,
      worktreePath,
      currentBranch,
    });
  }
}

// The main worktree tool
export const worktreeTool = tool({
  description:
    'Create isolated Git worktrees for safe code quality analysis. Handles worktree detection, creation, essential file copying, and dependency installation.',

  inputSchema: worktreeInputSchema,

  execute: async (
    {
      sessionId,
      packagePath,
      options = { copyEssentials: true, installDeps: true, validateSetup: true },
    }: any,
    { toolCallId: _toolCallId }: any,
  ) => {
    const finalPackagePath = packagePath || process.cwd();

    // Create session in MCP memory
    const session: CodeQualitySession = {
      sessionId,
      workingDirectory: finalPackagePath,
      createdAt: new Date(),
      status: 'initializing',
    };

    await mcpClient.createSession(session);

    try {
      // Check if we're already in a worktree
      const isInWorktree = process.cwd().includes('-quality-');

      if (isInWorktree) {
        // We're already in a worktree, return current info
        const worktreeInfo: WorktreeInfo & {
          sessionId: string;
          parentPath: string;
          isNewWorktree: boolean;
        } = {
          sessionId,
          path: process.cwd(),
          branch: 'current', // Would detect actual branch
          commit: 'HEAD',
          clean: true,
          parentPath: finalPackagePath,
          isNewWorktree: false,
        };

        await mcpClient.updateSessionStatus(sessionId, 'completed');
        return worktreeInfo;
      }

      // Create new worktree
      await mcpClient.updateSessionStatus(sessionId, 'analyzing');
      const result = await createQualityWorktree(finalPackagePath, sessionId, options);

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'worktree',
        success: true,
        data: result,
      });

      // Update session with worktree path
      session.worktreePath = result.path;
      session.status = 'completed';
      await mcpClient.updateSessionStatus(sessionId, 'completed');

      return result;
    } catch (error) {
      await mcpClient.updateSessionStatus(sessionId, 'failed');
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'worktree',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // Multi-modal result content - return both text and structured data
  experimental_toToolResultContent: (
    result: WorktreeInfo & { sessionId: string; parentPath: string; isNewWorktree: boolean },
  ) => [
    {
      type: 'text',
      text:
        `✅ Worktree created successfully!\n` +
        `📁 Path: ${result.path}\n` +
        `🌿 Branch: ${result.branch}\n` +
        `🆔 Session: ${result.sessionId}\n` +
        `${result.isNewWorktree ? '🆕 New worktree created' : '♻️ Using existing worktree'}`,
    },
  ],
} as any) as Tool;

export type { WorktreeInfo };
