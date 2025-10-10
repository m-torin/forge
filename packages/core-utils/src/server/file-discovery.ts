/**
 * MCP Tool: File Discovery
 * Discovers and filters project files with Git integration
 */

import type { MCPToolResponse } from '../types/mcp';
import { safeThrowIfAborted, type AbortableToolArgs } from './abort-support.js';
import { ok, runTool } from './tool-helpers';
import { validateFilePath } from './validation';

export interface FileDiscoveryArgs extends AbortableToolArgs {
  action: 'discoverSource' | 'getChanged' | 'getTests' | 'getCoverage' | 'filterFiles';
  path: string;
  excludePatterns?: string[];
  includePatterns?: string[];
  extensions?: string[];
  workingDirectory?: string;
}

export const fileDiscoveryTool = {
  name: 'file_discovery',
  description: 'Discover and filter project files with Git integration',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['discoverSource', 'getChanged', 'getTests', 'getCoverage', 'filterFiles'],
        description: 'Discovery action to perform',
      },
      path: {
        type: 'string',
        description: 'Base path to search from',
      },
      excludePatterns: {
        type: 'array',
        items: { type: 'string' },
        description: 'Patterns to exclude from discovery',
      },
      includePatterns: {
        type: 'array',
        items: { type: 'string' },
        description: 'Patterns to specifically include',
      },
      extensions: {
        type: 'array',
        items: { type: 'string' },
        description: 'File extensions to include (e.g., ["ts", "tsx", "js"])',
      },
      workingDirectory: {
        type: 'string',
        description: 'Preferred working directory (worktree path) for discovery',
      },
    },
    required: ['action', 'path'],
  },

  async execute(args: FileDiscoveryArgs): Promise<MCPToolResponse> {
    return runTool('file_discovery', args.action, async () => {
      const { action, path, excludePatterns = [], includePatterns = [], extensions = [] } = args;
      safeThrowIfAborted(args.signal);

      // Validate file path - prefer workingDirectory if provided
      const base = (args as any).workingDirectory || process.cwd();
      const pathValidation = validateFilePath(path, [base]);
      if (!pathValidation.isValid) {
        throw new Error(`Invalid path: ${pathValidation.error}`);
      }

      switch (action) {
        case 'discoverSource': {
          // Default patterns for source file discovery
          const defaultExcludes = [
            'node_modules',
            'dist',
            'build',
            '.next',
            'coverage',
            '.turbo',
            '.git',
            'out',
            '__tests__',
            '*.test.ts',
            '*.test.tsx',
            '*.test',
            '*.test.jsx',
            '*.spec.ts',
            '*.spec.tsx',
            '*.spec',
            '*.spec.jsx',
            '*.d.ts',
            'generated',
            '.cache',
            'tmp',
            'temp',
            '.DS_Store',
            '*.log',
          ];

          const allExcludes = [...defaultExcludes, ...excludePatterns];

          // Default extensions for source files - ES2023 nullish coalescing with array check
          const defaultExtensions = extensions?.length
            ? extensions
            : ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'];

          // Perform actual file discovery using file system operations
          const discoveredFiles = this.actualFileDiscovery(
            path,
            defaultExtensions,
            allExcludes,
            includePatterns,
          );

          const result = {
            path,
            discoveredFiles,
            totalFiles: discoveredFiles.length,
            excludePatterns: allExcludes,
            includePatterns,
            extensions: defaultExtensions,
            discoveredAt: Date.now(),
          };

          return ok(result);
        }

        case 'getChanged': {
          // Get actual Git changed files using git status
          const changedFiles = this.actualGitChangedFiles(path);

          const result = {
            path,
            changedFiles,
            totalChanged: changedFiles.length,
            gitAvailable: true, // In real implementation, check if git is available
            detectedAt: Date.now(),
          };

          return ok(result);
        }

        case 'getTests': {
          const testExtensions = extensions?.length ? extensions : ['ts', 'tsx', 'js', 'jsx'];
          const testPatterns = ['**/*.test.*', '**/*.spec.*', '**/tests/**/*', '**/__tests__/**/*'];

          // Discover actual test files
          const testFiles = this.actualTestFileDiscovery(path, testExtensions, testPatterns);

          const result = {
            path,
            testFiles,
            totalTests: testFiles.length,
            testPatterns,
            extensions: testExtensions,
            discoveredAt: Date.now(),
          };

          return ok(result);
        }

        case 'getCoverage': {
          // Simulate coverage file discovery
          const coveragePatterns = [
            '**/coverage/**/*',
            '**/.nyc_output/**/*',
            '**/coverage-final.json',
            '**/lcov.info',
            '**/clover.xml',
          ];

          const coverageFiles = this.actualCoverageFileDiscovery(path, coveragePatterns);

          const result = {
            path,
            coverageFiles,
            totalCoverageFiles: coverageFiles.length,
            coveragePatterns,
            discoveredAt: Date.now(),
          };

          return ok(result);
        }

        case 'filterFiles': {
          if (
            includePatterns.length === 0 &&
            excludePatterns.length === 0 &&
            extensions.length === 0
          ) {
            throw new Error(
              'At least one of includePatterns, excludePatterns, or extensions must be provided for filterFiles',
            );
          }

          // Get all files and then filter them according to the patterns
          const allFiles = this.actualFileDiscovery(
            path,
            ['ts', 'tsx', 'js', 'jsx', 'json', 'md'],
            [],
            [],
          );

          const filteredFiles = allFiles.filter(file => {
            // Check extensions
            if (extensions?.length) {
              const ext = file.split('.').pop()?.toLowerCase();
              if (!ext || !extensions.includes(ext)) {
                return false;
              }
            }

            // Check exclude patterns
            if (excludePatterns?.length) {
              for (const pattern of excludePatterns) {
                const fileName = file.split('/').pop() || '';
                if (localMatchesPattern(file, fileName, pattern)) {
                  return false;
                }
              }
            }

            // Check include patterns (if specified, file must match at least one)
            if (includePatterns?.length) {
              return includePatterns.some(pattern => {
                const fileName = file.split('/').pop() || '';
                return localMatchesPattern(file, fileName, pattern);
              });
            }

            return true;
          });

          const result = {
            path,
            originalCount: allFiles.length,
            filteredFiles,
            filteredCount: filteredFiles.length,
            excludePatterns,
            includePatterns,
            extensions,
            filteredAt: Date.now(),
          };

          return ok(result);
        }

        default:
          throw new Error(
            `Unknown action: ${action}. Supported actions: discoverSource, getChanged, getTests, getCoverage, filterFiles`,
          );
      }
    });
  },

  // Real file system discovery implementation
  actualFileDiscovery(
    basePath: string,
    extensions: string[],
    excludePatterns: string[],
    includePatterns: string[],
  ): string[] {
    const fs = require('fs');
    const path = require('path');
    const files: string[] = [];

    try {
      // Recursively walk directory tree
      const walkDirectory = (currentPath: string, relativePath = '') => {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(currentPath, entry.name);
          const relativeEntryPath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            // Skip node_modules, .git, and other common exclude directories
            if (
              !['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(entry.name)
            ) {
              walkDirectory(entryPath, relativeEntryPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).slice(1).toLowerCase();

            // Check extension filter
            if (extensions.length === 0 || extensions.includes(ext)) {
              // Check exclude patterns
              const isExcluded = excludePatterns.some(pattern => {
                return localMatchesPattern(relativeEntryPath, entry.name, pattern);
              });

              if (!isExcluded) {
                // Check include patterns
                if (
                  includePatterns.length === 0 ||
                  includePatterns.some(pattern => {
                    return localMatchesPattern(relativeEntryPath, entry.name, pattern);
                  })
                ) {
                  files.push(relativeEntryPath);
                }
              }
            }
          }
        }
      };

      if (fs.existsSync(basePath)) {
        walkDirectory(basePath);
      }
    } catch (error) {
      console.warn(`File discovery failed for ${basePath}:`, error);
      // Return empty array on error rather than failing
      return [];
    }

    return files;
  },

  actualGitChangedFiles(basePath: string): string[] {
    const { execSync } = require('child_process');

    try {
      // Get changed files using git status --porcelain
      const result = execSync('git status --porcelain', {
        cwd: basePath,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'], // Ignore stderr to avoid errors in non-git directories
      });

      return result
        .split('\n')
        .filter((line: string) => line.trim() !== '')
        .map((line: string) => line.substring(3)) // Remove git status flags (first 3 chars)
        .filter((file: string) => file.trim() !== '');
    } catch (error) {
      // If git command fails (not a git repo, etc.), return empty array
      console.warn(
        `Git status failed for ${basePath}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      return [];
    }
  },

  actualTestFileDiscovery(
    basePath: string,
    extensions: string[],
    testPatterns: string[],
  ): string[] {
    // Use the actualFileDiscovery method with test-specific patterns
    const testSpecificPatterns = [
      '**/*.test.*',
      '**/*.spec.*',
      '**/__tests__/**/*',
      '**/test/**/*',
      '**/tests/**/*',
      ...testPatterns,
    ];

    return this.actualFileDiscovery(
      basePath,
      extensions,
      [], // no exclusions
      testSpecificPatterns,
    );
  },

  actualCoverageFileDiscovery(basePath: string, coveragePatterns: string[]): string[] {
    // Look for actual coverage files in common locations
    const defaultCoveragePatterns = [
      '**/coverage/**/*',
      '**/.nyc_output/**/*',
      '**/coverage-final.json',
      '**/lcov.info',
      '**/clover.xml',
      '**/cobertura.xml',
      ...coveragePatterns,
    ];

    return this.actualFileDiscovery(
      basePath,
      ['json', 'info', 'xml', 'html'],
      [],
      defaultCoveragePatterns,
    );
  },
};

// Helper function to match file patterns (supports basic glob patterns)
function localMatchesPattern(filePath: string, fileName: string, pattern: string): boolean {
  // Simple pattern matching - supports * and ** wildcards
  const regexPattern = pattern
    .replace(/\*\*/g, '.*') // ** matches any characters including path separators
    .replace(/\*/g, '[^/]*') // * matches any characters except path separators
    .replace(/\./g, '\\.'); // Escape dots for literal matching

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath) || regex.test(fileName);
}
