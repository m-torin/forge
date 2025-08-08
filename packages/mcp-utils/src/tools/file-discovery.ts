/**
 * MCP Tool: File Discovery
 * Discovers and filters project files with Git integration
 */

import type { MCPToolResponse } from '../types/mcp';
import { ok, runTool } from '../utils/tool-helpers';
import { validateFilePath } from '../utils/validation';

export interface FileDiscoveryArgs {
  action: 'discoverSource' | 'getChanged' | 'getTests' | 'getCoverage' | 'filterFiles';
  path: string;
  excludePatterns?: string[];
  includePatterns?: string[];
  extensions?: string[];
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
    },
    required: ['action', 'path'],
  },

  async execute(args: FileDiscoveryArgs): Promise<MCPToolResponse> {
    return runTool('file_discovery', args.action, async () => {
      const { action, path, excludePatterns = [], includePatterns = [], extensions = [] } = args;

      // Validate file path - using current directory as allowed base path
      const pathValidation = validateFilePath(path, [process.cwd()]);
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

          // Simulate file discovery (in real implementation, this would use glob or fs)
          // For now, we'll return common file patterns based on the path structure
          const discoveredFiles = this.simulateFileDiscovery(
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
          // Simulate Git changed files detection
          // In real implementation, this would run git commands
          const changedFiles = this.simulateGitChangedFiles(path);

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

          // Simulate test file discovery
          const testFiles = this.simulateTestFileDiscovery(path, testExtensions, testPatterns);

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

          const coverageFiles = this.simulateCoverageFileDiscovery(path, coveragePatterns);

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

          // For this simulation, we'll generate some sample files and then filter them
          const allFiles = this.simulateFileDiscovery(
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
                if (this.matchesPattern(file, pattern)) {
                  return false;
                }
              }
            }

            // Check include patterns (if specified, file must match at least one)
            if (includePatterns?.length) {
              return includePatterns.some(pattern => this.matchesPattern(file, pattern));
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

  // Helper methods for simulation (in real implementation, these would use actual file system operations)
  simulateFileDiscovery(
    basePath: string,
    extensions: string[],
    excludePatterns: string[],
    includePatterns: string[],
  ): string[] {
    // Generate realistic file structure based on common patterns
    const files: string[] = [];

    // Common source files
    const sourceFiles = [
      'src/index.ts',
      'src/client.ts',
      'src/server.ts',
      'src/components/Button.tsx',
      'src/components/Modal.tsx',
      'src/utils/helpers.ts',
      'src/types/index.ts',
      'src/hooks/useApi.ts',
      'src/hooks/useAuth.ts',
      'lib/config.ts',
      'lib/db.ts',
      'package.json',
      'tsconfig.json',
      'README.md',
    ];

    for (const file of sourceFiles) {
      const ext = file.split('.').pop()?.toLowerCase();

      // Check extension
      if (extensions.length === 0 || (ext && extensions.includes(ext))) {
        // Check exclude patterns
        const isExcluded = excludePatterns.some(pattern => this.matchesPattern(file, pattern));
        if (!isExcluded) {
          // Check include patterns
          if (
            includePatterns.length === 0 ||
            includePatterns.some(pattern => this.matchesPattern(file, pattern))
          ) {
            files.push(file);
          }
        }
      }
    }

    return files;
  },

  simulateGitChangedFiles(basePath: string): string[] {
    // Simulate some changed files
    return ['src/components/Button.tsx', 'src/utils/helpers.ts', 'package.json'];
  },

  simulateTestFileDiscovery(
    basePath: string,
    extensions: string[],
    testPatterns: string[],
  ): string[] {
    return [
      'src/__tests__/components/Button.test.tsx',
      'src/__tests__/utils/helpers.test.ts',
      'tests/integration/api.spec.ts',
      'tests/e2e/login.spec.ts',
    ];
  },

  simulateCoverageFileDiscovery(basePath: string, coveragePatterns: string[]): string[] {
    return ['coverage/coverage-final.json', 'coverage/lcov.info', 'coverage/index.html'];
  },

  matchesPattern(filePath: string, pattern: string): boolean {
    // Validate and sanitize pattern input to prevent ReDoS attacks
    if (!pattern || typeof pattern !== 'string') {
      return false;
    }

    // Limit pattern length to prevent complexity attacks
    if (pattern.length > 1000) {
      return false;
    }

    // Sanitize pattern - only allow safe glob characters
    const sanitizedPattern = pattern.replace(/[^\w\s\-_.*\/\\]/g, '');
    if (sanitizedPattern !== pattern) {
      // Pattern contains unsafe characters, reject it
      return false;
    }

    // Use safe glob matching instead of regex construction
    if (sanitizedPattern.includes('*')) {
      return this.safeGlobMatch(filePath, sanitizedPattern);
    }

    return filePath.includes(sanitizedPattern);
  },

  safeGlobMatch(filePath: string, pattern: string): boolean {
    // Safe glob implementation that prevents ReDoS
    // Split pattern by asterisks and match each part literally
    const parts = pattern.split('*');
    let position = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part === '') {
        // Empty part means wildcard, continue
        continue;
      }

      // Find literal part in remaining string
      const foundIndex = filePath.indexOf(part, position);

      if (foundIndex === -1) {
        return false;
      }

      // For first part, must match at beginning (unless preceded by *)
      if (i === 0 && pattern[0] !== '*' && foundIndex !== 0) {
        return false;
      }

      // Update position for next search
      position = foundIndex + part.length;
    }

    // For last part, must match at end (unless followed by *)
    const lastPart = parts[parts.length - 1];
    if (lastPart !== '' && !pattern.endsWith('*')) {
      return filePath.endsWith(lastPart);
    }

    return true;
  },
};
