/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * Context Detection Tool for Code Quality Analysis
 *
 * Detects project context and configuration including package scope,
 * monorepo structure, framework detection, and worktree status.
 */

import { logWarn } from '@repo/observability';
import { tool } from 'ai';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { z } from 'zod/v4';
import { mcpClient } from '../mcp-client';

// Input schema for context detection
const contextDetectionInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  path: z.string().describe('Path to analyze for context'),
  options: z
    .object({
      includeFrameworks: z.boolean().default(true).describe('Include framework version detection'),
      detectVercel: z.boolean().default(true).describe('Detect Vercel project configuration'),
      skipWorktreeDetection: z.boolean().default(false).describe('Skip Git worktree detection'),
      detectMonorepo: z.boolean().default(true).describe('Detect monorepo structure'),
    })
    .optional()
    .default({
      includeFrameworks: true,
      detectVercel: true,
      skipWorktreeDetection: false,
      detectMonorepo: true,
    }),
});

// Context detection result
interface ContextDetectionResult {
  sessionId: string;
  context: {
    type: 'monorepo' | 'package';
    path: string;
    packagePath: string;
    packageName: string;
    isMonorepo: boolean;
    monorepoType?: string;
    isVercelProject: boolean;
    isWorktree: boolean;
    worktreeInfo?: WorktreeInfo;
    stack: Record<string, string>;
    workspaces?: string[];
  };
  packageInfo: {
    name: string;
    version?: string;
    private?: boolean;
    path: string;
    dir: string;
  };
}

interface WorktreeInfo {
  isWorktree: boolean;
  path?: string;
  branch?: string;
  head?: string;
  bare?: boolean;
  detached?: boolean;
  locked?: boolean;
}

// Find nearest package.json by traversing up directory tree
async function detectPackageScope(cwd: string): Promise<{
  dir: string;
  name: string;
  path: string;
  version?: string;
  private?: boolean;
}> {
  let currentDir = cwd;

  while (currentDir !== dirname(currentDir)) {
    try {
      const packagePath = join(currentDir, 'package.json');
      const content = await readFile(packagePath, 'utf-8');
      const pkg = JSON.parse(content);

      return {
        dir: currentDir,
        name: pkg.name || basename(currentDir),
        path: packagePath,
        version: pkg.version,
        private: pkg.private,
      };
    } catch {
      currentDir = dirname(currentDir);
    }
  }

  throw new Error('No package.json found in directory tree');
}

// Detect if project is a monorepo
async function detectMonorepo(
  cwd: string,
): Promise<{ isMonorepo: boolean; type?: string; workspaces?: string[] }> {
  try {
    // Check for workspace indicators
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(cwd);
    const indicators = [
      { file: 'pnpm-workspace.yaml', type: 'pnpm' },
      { file: 'rush.json', type: 'rush' },
      { file: 'lerna.json', type: 'lerna' },
      { file: 'nx.json', type: 'nx' },
      { file: 'turbo.json', type: 'turbo' },
    ];

    // Check direct indicators
    for (const indicator of indicators) {
      if (files.includes(indicator.file)) {
        return { isMonorepo: true, type: indicator.type };
      }
    }

    // Check package.json for workspaces
    try {
      const packagePath = join(cwd, 'package.json');
      const content = await readFile(packagePath, 'utf-8');
      const pkg = JSON.parse(content);

      if (pkg.workspaces) {
        return {
          isMonorepo: true,
          type: 'yarn-workspaces',
          workspaces: Array.isArray(pkg.workspaces) ? pkg.workspaces : Object.keys(pkg.workspaces),
        };
      }
    } catch {}

    // Check for yarn workspaces with packages/apps directories
    if (files.includes('yarn.lock')) {
      const hasPackages = files.includes('packages') || files.includes('apps');
      if (hasPackages) {
        try {
          const packagePath = join(cwd, 'package.json');
          const content = await readFile(packagePath, 'utf-8');
          const pkg = JSON.parse(content);
          if (pkg.private === true) {
            return { isMonorepo: true, type: 'yarn-workspaces' };
          }
        } catch {}
      }
    }

    return { isMonorepo: false };
  } catch {
    return { isMonorepo: false };
  }
}

// Detect if project is configured for Vercel
async function detectVercelProject(packagePath: string): Promise<boolean> {
  try {
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(packagePath);

    // Direct Vercel indicators
    if (files.includes('vercel.json') || files.includes('.vercel')) {
      return true;
    }

    // Next.js project indicators
    const nextIndicators = ['next.config.js', 'next.config.ts', 'next.config.mjs', 'next-env.d.ts'];

    for (const indicator of nextIndicators) {
      if (files.includes(indicator)) return true;
    }

    // Check for Next.js app or pages directory structure
    if (files.includes('app') || files.includes('pages')) {
      try {
        // Check pages directory for Next.js files
        if (files.includes('pages')) {
          const pagesFiles = await readdir(join(packagePath, 'pages'));
          const nextjsFiles = ['_app.js', '_app.tsx', '_document.js', '_document.tsx'];
          if (nextjsFiles.some(file => pagesFiles.includes(file))) {
            return true;
          }
        }

        // Check app directory for Next.js 13+ files
        if (files.includes('app')) {
          const appFiles = await readdir(join(packagePath, 'app'));
          const nextjsAppFiles = ['layout.tsx', 'layout.js', 'page.tsx', 'page.js'];
          if (nextjsAppFiles.some(file => appFiles.includes(file))) {
            return true;
          }
        }
      } catch {}
    }

    return false;
  } catch {
    return false;
  }
}

// Detect if currently in a Git worktree
async function detectIfInWorktree(): Promise<WorktreeInfo> {
  try {
    // This would integrate with MCP Git client in real implementation
    // For now, we'll use a basic check
    const { execSync } = await import('node:child_process');

    try {
      const result = execSync('git worktree list --porcelain', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      const currentPath = process.cwd();
      const worktrees = result.split('\n\n').filter(Boolean);

      for (const worktreeBlock of worktrees) {
        const lines = worktreeBlock.split('\n');
        const worktreePath = lines[0]?.replace('worktree ', '');

        if (worktreePath && currentPath.includes(worktreePath)) {
          const branch = lines
            .find(line => line.startsWith('branch '))
            ?.replace('branch refs/heads/', '');
          const head = lines.find(line => line.startsWith('HEAD '))?.replace('HEAD ', '');
          const bare = lines.some(line => line === 'bare');
          const detached = lines.some(line => line === 'detached');
          const locked = lines.some(line => line.startsWith('locked'));

          return {
            isWorktree: true,
            path: worktreePath,
            branch,
            head,
            bare,
            detached,
            locked,
          };
        }
      }
    } catch (_gitError) {
      // Not in a git repository or git not available
      return { isWorktree: false };
    }

    return { isWorktree: false };
  } catch (error) {
    logWarn('Could not detect worktree status', { error });
    return { isWorktree: false };
  }
}

// Extract framework versions from package.json
async function detectFrameworkStack(packagePath: string): Promise<Record<string, string>> {
  try {
    const packageJsonPath = join(packagePath, 'package.json');
    const content = await readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);

    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const stack: Record<string, string> = {};

    // Common frameworks to detect
    const frameworks = {
      react: 'react',
      next: 'next',
      typescript: 'typescript',
      vitest: 'vitest',
      jest: 'jest',
      mantine: '@mantine/core',
      tailwind: 'tailwindcss',
      vite: 'vite',
      webpack: 'webpack',
      eslint: 'eslint',
      prettier: 'prettier',
    };

    for (const [key, depName] of Object.entries(frameworks)) {
      if (allDeps[depName]) {
        stack[key] = allDeps[depName];
      }
    }

    // Special case for testing frameworks
    if (!stack.vitest && !stack.jest) {
      if (allDeps['@testing-library/react']) {
        stack.testing = '@testing-library/react';
      }
    }

    return stack;
  } catch (error) {
    logWarn(`Could not read package.json`, { error });
    return {};
  }
}

// Main context detection tool
export const contextDetectionTool = tool({
  description: 'Detect project context and configuration',
  inputSchema: contextDetectionInputSchema,
  execute: async ({
    sessionId,
    path,
    options = {
      includeFrameworks: true,
      detectVercel: true,
      skipWorktreeDetection: false,
      detectMonorepo: true,
    },
  }: any) => {
    try {
      // Detect package scope
      const packageInfo = await detectPackageScope(path);

      // Detect monorepo structure
      let monorepoResult: { isMonorepo: boolean; type?: string; workspaces?: string[] } = {
        isMonorepo: false,
      };
      if (options.detectMonorepo) {
        monorepoResult = await detectMonorepo(path);
      }

      // Build context object
      const context = {
        type: monorepoResult.isMonorepo ? ('monorepo' as const) : ('package' as const),
        path,
        packagePath: packageInfo.dir,
        packageName: packageInfo.name,
        isMonorepo: monorepoResult.isMonorepo,
        monorepoType: monorepoResult.type,
        isVercelProject: false,
        isWorktree: false,
        worktreeInfo: undefined as WorktreeInfo | undefined,
        stack: {} as Record<string, string>,
        workspaces: monorepoResult.workspaces,
      };

      // Detect Vercel project
      if (options.detectVercel) {
        context.isVercelProject = await detectVercelProject(context.packagePath);
      }

      // Detect worktree status
      if (!options.skipWorktreeDetection) {
        const worktreeStatus = await detectIfInWorktree();
        context.isWorktree = worktreeStatus.isWorktree;
        if (worktreeStatus.isWorktree) {
          context.worktreeInfo = worktreeStatus;
        }
      }

      // Detect framework stack
      if (options.includeFrameworks) {
        context.stack = await detectFrameworkStack(context.packagePath);
      }

      const result: ContextDetectionResult = {
        sessionId,
        context,
        packageInfo,
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'context-detection',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'context-detection',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // AI SDK v5: toModelOutput with proper content shapes
  toModelOutput: (result: ContextDetectionResult) => ({
    type: 'content',
    value: [
      {
        type: 'text',
        text:
          `🔍 Project Context Detected!\n` +
          `📁 Type: ${result.context.type.toUpperCase()}\n` +
          `📦 Package: ${result.context.packageName}\n` +
          `📂 Path: ${result.context.packagePath}\n` +
          `${result.context.isMonorepo ? `🏢 Monorepo: ${result.context.monorepoType}` : '📦 Single Package'}\n` +
          `${result.context.isVercelProject ? '▲ Vercel Project: Yes' : '🌐 Vercel Project: No'}\n` +
          `${result.context.isWorktree ? `🌿 Git Worktree: ${result.context.worktreeInfo?.branch || 'Unknown'}` : '📋 Git: Main Repository'}\n` +
          `🛠️ Stack: ${
            Object.keys(result.context.stack).length > 0
              ? Object.entries(result.context.stack)
                  .map(([name, version]) => `${name}@${version}`)
                  .join(', ')
              : 'No frameworks detected'
          }\n` +
          `${result.context.workspaces ? `📋 Workspaces: ${result.context.workspaces.length} configured` : ''}`,
      },
    ],
  }),
} as any);

export type { ContextDetectionResult, WorktreeInfo };
