/**
 * MCP Tool: Circular Dependencies Detection
 * Provides programmatic madge integration for dependency analysis
 */

import madge from 'madge';
import picomatch from 'picomatch';
import type { MCPToolResponse } from '../types/mcp';
import { throwIfAborted } from '../utils/abort-support';
import { createMCPErrorResponse } from '../utils/error-handling';
/**
 * Validate exclude pattern for safety
 */
function validateExcludePattern(pattern: string): void {
  if (!pattern || typeof pattern !== 'string') {
    return;
  }

  // Check pattern length
  if (pattern.length > 256) {
    throw new Error('Exclude pattern too long (max 256 characters)');
  }

  // Validate it's a valid glob pattern using picomatch
  try {
    picomatch(pattern, { dot: true });
  } catch (error) {
    throw new Error(
      `Invalid glob pattern: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  // Block potentially dangerous patterns
  const dangerousPatterns = [
    /\.\./, // Parent directory traversal
    /\/\.\./,
    /\.\.\//,
  ];

  for (const dangerous of dangerousPatterns) {
    if (dangerous.test(pattern)) {
      throw new Error('Exclude pattern contains potentially dangerous path traversal');
    }
  }
}

export interface CircularDepsArgs {
  action:
    | 'detectCircular'
    | 'analyzeGraph'
    | 'getStatistics'
    | 'checkDirectory'
    | 'validatePackage';
  packagePath: string;
  globs?: string[];
  tsConfigPath?: string;
  extensions?: string[];
  excludePattern?: string;
  signal?: AbortSignal;
  includeNpm?: boolean;
}

export interface CircularDepsResult {
  circular: string[][];
  graph?: Record<string, string[]>;
  statistics?: {
    totalFiles: number;
    totalDependencies: number;
    circularCount: number;
    maxDepth: number;
    orphanedFiles: string[];
  };
}

/**
 * Analyze circular dependencies using madge
 */
export async function detectCircularDependencies(args: CircularDepsArgs): Promise<MCPToolResponse> {
  try {
    const {
      action,
      packagePath,
      globs = ['src/**/*.{ts,tsx,js,jsx}'],
      tsConfigPath,
      extensions = ['ts', 'tsx', 'js', 'jsx'],
      excludePattern,
      includeNpm = false,
      signal,
    } = args;

    throwIfAborted(signal);

    switch (action) {
      case 'detectCircular': {
        const result = await analyzeCircularDeps(
          packagePath,
          globs,
          tsConfigPath,
          extensions,
          excludePattern,
          includeNpm,
          signal,
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          metadata: {
            circularCount: result.circular.length,
            hasCircularDeps: result.circular.length > 0,
          },
        };
      }

      case 'analyzeGraph': {
        const result = await analyzeCompleteGraph(
          packagePath,
          globs,
          tsConfigPath,
          extensions,
          excludePattern,
          includeNpm,
          signal,
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          metadata: {
            totalFiles: result.statistics?.totalFiles,
            totalDependencies: result.statistics?.totalDependencies,
          },
        };
      }

      case 'getStatistics': {
        const result = await getDependencyStatistics(
          packagePath,
          globs,
          tsConfigPath,
          extensions,
          excludePattern,
          includeNpm,
          signal,
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.statistics, null, 2),
            },
          ],
          metadata: result.statistics,
        };
      }

      case 'checkDirectory': {
        const result = await quickCircularCheck(packagePath, globs, signal);

        return {
          content: [
            {
              type: 'text',
              text:
                result.circular.length === 0
                  ? 'No circular dependencies found'
                  : `Found ${result.circular.length} circular dependencies`,
            },
          ],
          metadata: {
            hasCircularDeps: result.circular.length > 0,
            circularCount: result.circular.length,
            circular: result.circular,
          },
        };
      }

      case 'validatePackage': {
        const result = await validatePackageStructure(packagePath, signal);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          metadata: result,
        };
      }

      default:
        return createMCPErrorResponse(`Unknown action: ${action}`, 'INVALID_ACTION');
    }
  } catch (error) {
    return createMCPErrorResponse(
      `Circular dependency analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'ANALYSIS_ERROR',
    );
  }
}

/**
 * Core circular dependency analysis
 */
async function analyzeCircularDeps(
  packagePath: string,
  globs: string[],
  tsConfigPath?: string,
  extensions?: string[],
  excludePattern?: string,
  includeNpm?: boolean,
  signal?: AbortSignal,
): Promise<CircularDepsResult> {
  throwIfAborted(signal);

  const madgeOptions: any = {
    baseDir: packagePath,
    fileExtensions: extensions || ['ts', 'tsx', 'js', 'jsx'],
    includeNpm: includeNpm || false,
    detectiveOptions: {
      ts: {
        skipTypeImports: true, // Skip type-only imports
      },
      tsx: {
        skipTypeImports: true,
      },
    },
  };

  // Add TypeScript config if provided
  if (tsConfigPath) {
    madgeOptions.tsConfig = tsConfigPath;
  }

  // Add exclude pattern if provided (safely) - use string-based exclusion instead of RegExp
  if (excludePattern) {
    validateExcludePattern(excludePattern);
    // Use glob-style exclusion instead of regex for safety
    madgeOptions.exclude = excludePattern;
  }

  try {
    const res = await madge(globs, madgeOptions);
    const circular = res.circular();
    const graph = await res.obj();

    return {
      circular,
      graph,
    };
  } catch (error) {
    // Handle common madge errors
    if (error instanceof Error) {
      if (error.message.includes('Could not find TypeScript config')) {
        // Retry without TypeScript config
        delete madgeOptions.tsConfig;
        const res = await madge(globs, madgeOptions);
        return {
          circular: res.circular(),
          graph: await res.obj(),
        };
      }
    }
    throw error;
  }
}

/**
 * Complete graph analysis with statistics
 */
async function analyzeCompleteGraph(
  packagePath: string,
  globs: string[],
  tsConfigPath?: string,
  extensions?: string[],
  excludePattern?: string,
  includeNpm?: boolean,
  signal?: AbortSignal,
): Promise<CircularDepsResult> {
  const result = await analyzeCircularDeps(
    packagePath,
    globs,
    tsConfigPath,
    extensions,
    excludePattern,
    includeNpm,
    signal,
  );

  if (!result.graph) {
    return result;
  }

  // Calculate statistics
  const files = Object.keys(result.graph);
  const totalFiles = files.length;
  let totalDependencies = 0;
  let maxDepth = 0;
  const orphanedFiles: string[] = [];

  // Calculate dependency stats
  for (const [file, deps] of Object.entries(result.graph)) {
    totalDependencies += deps.length;

    // Find orphaned files (no dependencies and not depended on)
    const hasIncomingDeps = files.some(f => result.graph![f]?.includes(file));

    if (deps.length === 0 && !hasIncomingDeps) {
      orphanedFiles.push(file);
    }

    // Calculate max depth (simplified)
    if (deps.length > maxDepth) {
      maxDepth = deps.length;
    }
  }

  result.statistics = {
    totalFiles,
    totalDependencies,
    circularCount: result.circular.length,
    maxDepth,
    orphanedFiles: orphanedFiles.slice(0, 10), // Limit to first 10
  };

  return result;
}

/**
 * Get dependency statistics only
 */
async function getDependencyStatistics(
  packagePath: string,
  globs: string[],
  tsConfigPath?: string,
  extensions?: string[],
  excludePattern?: string,
  includeNpm?: boolean,
  signal?: AbortSignal,
): Promise<CircularDepsResult> {
  return analyzeCompleteGraph(
    packagePath,
    globs,
    tsConfigPath,
    extensions,
    excludePattern,
    includeNpm,
    signal,
  );
}

/**
 * Quick circular dependency check
 */
async function quickCircularCheck(
  packagePath: string,
  globs: string[],
  signal?: AbortSignal,
): Promise<{ circular: string[][] }> {
  throwIfAborted(signal);

  const madgeOptions = {
    baseDir: packagePath,
    fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    includeNpm: false, // Faster without npm modules
    detectiveOptions: {
      ts: {
        skipTypeImports: true,
      },
      tsx: {
        skipTypeImports: true,
      },
    },
  };

  try {
    const res = await madge(globs, madgeOptions);
    return {
      circular: res.circular(),
    };
  } catch (error) {
    console.warn('[CircularDeps] Quick check failed, returning empty result:', error);
    return { circular: [] };
  }
}

/**
 * Validate package structure for common issues
 */
async function validatePackageStructure(
  packagePath: string,
  signal?: AbortSignal,
): Promise<{
  hasPackageJson: boolean;
  hasTsConfig: boolean;
  hasSourceFiles: boolean;
  recommendedGlobs: string[];
  issues: string[];
}> {
  throwIfAborted(signal);

  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const issues: string[] = [];
  const recommendedGlobs: string[] = [];

  try {
    // Check package.json
    const packageJsonPath = path.join(packagePath, 'package.json');
    const hasPackageJson = await fs
      .access(packageJsonPath)
      .then(() => true)
      .catch(() => false);

    if (!hasPackageJson) {
      issues.push('No package.json found');
    }

    // Check tsconfig.json
    const tsConfigPath = path.join(packagePath, 'tsconfig.json');
    const hasTsConfig = await fs
      .access(tsConfigPath)
      .then(() => true)
      .catch(() => false);

    // Check for common source directories
    const commonDirs = ['src', 'lib', 'app', 'pages', 'components'];
    let hasSourceFiles = false;

    for (const dir of commonDirs) {
      const dirPath = path.join(packagePath, dir);
      try {
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          hasSourceFiles = true;
          recommendedGlobs.push(`${dir}/**/*.{ts,tsx,js,jsx}`);
        }
      } catch {
        // Directory doesn't exist, skip
      }
    }

    if (!hasSourceFiles) {
      issues.push('No common source directories found (src, lib, app, pages, components)');
      recommendedGlobs.push('**/*.{ts,tsx,js,jsx}'); // Fallback
    }

    return {
      hasPackageJson,
      hasTsConfig,
      hasSourceFiles,
      recommendedGlobs,
      issues,
    };
  } catch (error) {
    issues.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      hasPackageJson: false,
      hasTsConfig: false,
      hasSourceFiles: false,
      recommendedGlobs: ['src/**/*.{ts,tsx,js,jsx}'], // Default fallback
      issues,
    };
  }
}

// MCP Tool Definition
export const circularDepsTool = {
  name: 'circular_deps',
  description: 'Detect and analyze circular dependencies using madge',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'detectCircular',
          'analyzeGraph',
          'getStatistics',
          'checkDirectory',
          'validatePackage',
        ],
        description: 'Circular dependency analysis action to perform',
      },
      packagePath: {
        type: 'string',
        description: 'Path to the package/project to analyze',
      },
      globs: {
        type: 'array',
        items: { type: 'string' },
        description: 'Glob patterns for files to analyze',
        default: ['src/**/*.{ts,tsx,js,jsx}'],
      },
      tsConfigPath: {
        type: 'string',
        description: 'Path to TypeScript config file',
      },
      extensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'File extensions to analyze',
        default: ['ts', 'tsx', 'js', 'jsx'],
      },
      excludePattern: {
        type: 'string',
        description:
          'Glob pattern to exclude files (e.g., "**/__tests__/**", "**/node_modules/**")',
      },
      includeNpm: {
        type: 'boolean',
        description: 'Include npm modules in analysis',
        default: false,
      },
    },
    required: ['action', 'packagePath'],
  },

  async execute(args: CircularDepsArgs): Promise<MCPToolResponse> {
    return detectCircularDependencies(args);
  },
};

// Export for use in other tools
export { analyzeCircularDeps, quickCircularCheck, validatePackageStructure };
