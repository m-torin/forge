/**
 * Mock Check Tool for Code Quality Analysis
 *
 * Identifies duplicate mocks across test files that should be centralized
 * in @repo/qa. Analyzes vi.mock usage patterns and suggests centralization
 * opportunities for better test maintenance.
 */

import { logInfo, logWarn } from '@repo/observability';
import { tool } from 'ai';
import { join, relative } from 'node:path';
import { z } from 'zod/v4';
import { mcpClient } from '../mcp-client';
import { CENTRALIZED_MOCK_MODULES } from '../utils';

// Import tool types for actual usage
interface _GrepResult {
  matches: Array<{
    file: string;
    line: number;
    content: string;
  }>;
}

interface GlobResult {
  matches: string[];
}

// Declare tool functions that will be available at runtime
declare function Grep(params: {
  pattern: string;
  path?: string;
  glob?: string;
  output_mode?: 'content' | 'files_with_matches' | 'count';
  '-n'?: boolean;
  '-i'?: boolean;
}): Promise<string>;

declare function Glob(params: { pattern: string; path?: string }): Promise<GlobResult>;

declare function Read(params: { file_path: string; limit?: number }): Promise<string>;

// Input schema for mock check
const mockCheckInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  packagePath: z.string().describe('Path to the package to analyze for duplicate mocks'),
  options: z
    .object({
      includeNodeModules: z
        .boolean()
        .default(false)
        .describe('Include mocks of node_modules in analysis'),
      suggestCentralization: z
        .boolean()
        .default(true)
        .describe('Suggest which mocks should be moved to @repo/qa'),
      checkQaIntegration: z
        .boolean()
        .default(true)
        .describe('Check if test setup properly imports @repo/qa mocks'),
    })
    .optional()
    .default({
      includeNodeModules: false,
      suggestCentralization: true,
      checkQaIntegration: true,
    }),
});

// Mock check result interfaces
interface DuplicateMock {
  module: string;
  locations: string[];
  count: number;
  shouldCentralize: boolean;
  reason: string;
  mockPatterns: string[];
}

interface LocalMock {
  module: string;
  location: string;
  shouldCentralize: boolean;
  reason: string;
}

interface MockWarning {
  type: 'conflict' | 'setup' | 'deprecation' | 'error';
  module?: string;
  message: string;
  locations?: string[];
  action?: string;
}

interface MockCheckResult {
  sessionId: string;
  packagePath: string;
  duplicateMocks: DuplicateMock[];
  localOnlyMocks: LocalMock[];
  warnings: MockWarning[];
  summary: {
    totalMocks: number;
    duplicateCount: number;
    centralizedCount: number;
    localOnlyCount: number;
    warningCount: number;
    requiresQaBuild: boolean;
  };
  recommendations: Array<{
    type: 'centralize' | 'cleanup' | 'setup' | 'remove';
    priority: 'high' | 'medium' | 'low';
    description: string;
    action: string;
    modules?: string[];
  }>;
}

// Extract module name from vi.mock call
function extractModuleName(line: string): string | null {
  const patterns = [
    /vi\.mock\s*\(\s*['"`]([^'"`]+)['"`]/,
    /vi\.doMock\s*\(\s*['"`]([^'"`]+)['"`]/,
    /vi\.spyOn\s*\([^,]+,\s*['"`]([^'"`]+)['"`]/,
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// Check if a mock is already centralized in @repo/qa
async function isMockCentralized(module: string, packagePath: string): Promise<boolean> {
  try {
    // Check in @repo/qa mock directories
    const qaPath = join(packagePath, '../../qa/src/vitest/mocks');

    // Search for the module in centralized mocks
    const grepResult = await Grep({
      pattern: `vi\\.mock\\(['"\\\`]${module.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\\\`]`,
      path: qaPath,
      output_mode: 'count',
    });

    return parseInt(grepResult) > 0;
  } catch (_error) {
    // If @repo/qa doesn't exist or can't be accessed, assume not centralized
    return false;
  }
}

// Check if test setup properly imports @repo/qa mocks
async function checkQaSetupIntegration(packagePath: string): Promise<{
  hasQaSetup: boolean;
  setupFiles: string[];
  missingImports: string[];
}> {
  try {
    // Find test setup files
    const setupPatterns = await Glob({
      pattern: '**/test-setup.{ts,js,mjs,cjs}',
      path: packagePath,
    });

    const vitestSetupPatterns = await Glob({
      pattern: '**/vitest.setup.{ts,js,mjs,cjs}',
      path: packagePath,
    });

    const setupFiles = [...(setupPatterns.matches || []), ...(vitestSetupPatterns.matches || [])];
    let hasQaSetup = false;
    const missingImports: string[] = [];

    // Check each setup file for @repo/qa imports
    for (const setupFile of setupFiles) {
      try {
        const content = await Read({ file_path: setupFile });
        if (content.includes('@repo/qa/vitest/setup')) {
          hasQaSetup = true;
        } else {
          missingImports.push(setupFile);
        }
      } catch (error) {
        logWarn(`Could not read setup file ${setupFile}`, { error });
      }
    }

    return {
      hasQaSetup,
      setupFiles,
      missingImports,
    };
  } catch (_error) {
    return {
      hasQaSetup: false,
      setupFiles: [],
      missingImports: [],
    };
  }
}

// Analyze mock usage patterns
async function analyzeMockPatterns(packagePath: string): Promise<{
  mocksByModule: Map<string, string[]>;
  mockPatterns: Map<string, string[]>;
}> {
  const mocksByModule = new Map<string, string[]>();
  const mockPatterns = new Map<string, string[]>();

  try {
    // Search for vi.mock calls in test files
    const mockCalls = await Grep({
      pattern: 'vi\\.mock\\(|vi\\.doMock\\(|vi\\.spyOn\\(',
      path: packagePath,
      glob: '**/*.{test,spec}.{ts,tsx,js,jsx}',
      output_mode: 'content',
      '-n': true,
    });

    if (!mockCalls) {
      return { mocksByModule, mockPatterns };
    }

    // Parse mock calls to identify what's being mocked
    const lines = mockCalls.split('\n').filter(line => line.trim());

    for (const line of lines) {
      // Extract file path and module being mocked
      const fileMatch = line.match(/^([^:]+):(\d+):(.*)/);
      if (!fileMatch) continue;

      const [, filePath, _lineNumber, lineContent] = fileMatch;
      const moduleName = extractModuleName(lineContent);

      if (moduleName) {
        // Store by module
        if (!mocksByModule.has(moduleName)) {
          mocksByModule.set(moduleName, []);
          mockPatterns.set(moduleName, []);
        }

        const files = mocksByModule.get(moduleName) as string[];
        if (!files.includes(filePath)) {
          files.push(filePath);
        }

        (mockPatterns.get(moduleName) as string[]).push(lineContent.trim());
      }
    }
  } catch (error) {
    logWarn('Could not analyze mock patterns', { error });
  }

  return { mocksByModule, mockPatterns };
}

// Generate recommendations based on analysis
function generateRecommendations(
  duplicateMocks: DuplicateMock[],
  warnings: MockWarning[],
  qaSetup: { hasQaSetup: boolean; missingImports: string[] },
): Array<{
  type: 'centralize' | 'cleanup' | 'setup' | 'remove';
  priority: 'high' | 'medium' | 'low';
  description: string;
  action: string;
  modules?: string[];
}> {
  const recommendations = [];

  // High priority: centralize critical duplicates
  const criticalDuplicates = duplicateMocks.filter(
    m => CENTRALIZED_MOCK_MODULES.includes(m.module) || m.count > 2,
  );

  if (criticalDuplicates.length > 0) {
    recommendations.push({
      type: 'centralize' as const,
      priority: 'high' as const,
      description: `${criticalDuplicates.length} critical mocks are duplicated across test files`,
      action: 'Move these mocks to @repo/qa for centralized management',
      modules: criticalDuplicates.map(m => m.module),
    });
  }

  // Medium priority: setup @repo/qa integration
  if (!qaSetup.hasQaSetup && duplicateMocks.length > 0) {
    recommendations.push({
      type: 'setup' as const,
      priority: 'medium' as const,
      description: 'Test setup does not import @repo/qa centralized mocks',
      action: 'Add import "@repo/qa/vitest/setup" to test setup files',
    });
  } else if (qaSetup.missingImports.length > 0) {
    recommendations.push({
      type: 'setup' as const,
      priority: 'medium' as const,
      description: `${qaSetup.missingImports.length} setup files missing @repo/qa imports`,
      action: 'Update setup files to import centralized mocks',
    });
  }

  // Low priority: cleanup remaining duplicates
  const remainingDuplicates = duplicateMocks.filter(
    m => !CENTRALIZED_MOCK_MODULES.includes(m.module) && m.count <= 2,
  );

  if (remainingDuplicates.length > 0) {
    recommendations.push({
      type: 'cleanup' as const,
      priority: 'low' as const,
      description: `${remainingDuplicates.length} minor mock duplicates found`,
      action: 'Consider centralizing or consolidating these mocks',
      modules: remainingDuplicates.map(m => m.module),
    });
  }

  // Handle conflicts from warnings
  const conflicts = warnings.filter(w => w.type === 'conflict');
  if (conflicts.length > 0) {
    recommendations.push({
      type: 'remove' as const,
      priority: 'high' as const,
      description: `${conflicts.length} mocks conflict with centralized versions`,
      action: 'Remove local mocks that duplicate @repo/qa centralized mocks',
    });
  }

  return recommendations;
}

// Main mock check tool
export const mockCheckTool = tool({
  description:
    'Check for duplicate mocks across test files that should be centralized. Identifies mocks that appear in multiple locations and suggests moving them to @repo/qa for better maintainability.',

  inputSchema: mockCheckInputSchema,

  execute: async ({
    sessionId,
    packagePath,
    options = {
      includeNodeModules: false,
      suggestCentralization: true,
      checkQaIntegration: true,
    },
  }: any) => {
    try {
      logInfo(`🔍 Checking duplicate mocks in ${packagePath}...`);

      // Analyze mock patterns across test files
      const { mocksByModule, mockPatterns } = await analyzeMockPatterns(packagePath);

      // Check @repo/qa setup integration
      const qaSetup = options.checkQaIntegration
        ? await checkQaSetupIntegration(packagePath)
        : { hasQaSetup: false, setupFiles: [], missingImports: [] };

      const duplicateMocks: DuplicateMock[] = [];
      const localOnlyMocks: LocalMock[] = [];
      const warnings: MockWarning[] = [];

      // Analyze each mocked module
      for (const [module, locations] of mocksByModule) {
        // Skip relative imports unless specifically requested
        if (module.startsWith('./') || module.startsWith('../')) {
          localOnlyMocks.push({
            module,
            location: locations[0],
            shouldCentralize: false,
            reason: 'Local module - test-specific mock',
          });
          continue;
        }

        const isDuplicate = locations.length > 1;
        const shouldCentralize = CENTRALIZED_MOCK_MODULES.includes(module);
        const isCentralized = await isMockCentralized(module, packagePath);

        if (isDuplicate || shouldCentralize) {
          if (isCentralized && locations.length > 0) {
            // Mock exists in both @repo/qa and local tests
            warnings.push({
              type: 'conflict',
              module,
              message: `Mock for '${module}' exists in both @repo/qa and local tests`,
              locations: locations.map(loc => relative(packagePath, loc)),
              action: 'Remove local mock to avoid conflicts',
            });
          } else if (!isCentralized) {
            // Should be centralized but isn't yet
            duplicateMocks.push({
              module,
              locations: locations.map(loc => relative(packagePath, loc)),
              count: locations.length,
              shouldCentralize: true,
              reason: isDuplicate ? 'Duplicate mock found' : 'Common module should be centralized',
              mockPatterns: mockPatterns.get(module) || [],
            });
          }
        } else {
          // Single use, test-specific mock
          localOnlyMocks.push({
            module,
            location: relative(packagePath, locations[0]),
            shouldCentralize: false,
            reason: 'Single use - test-specific mock',
          });
        }
      }

      // Add setup warning if needed
      if (!qaSetup.hasQaSetup && duplicateMocks.length > 0) {
        warnings.push({
          type: 'setup',
          message: 'Test setup does not import @repo/qa centralized mocks',
          action: 'Add "@repo/qa/vitest/setup" import to test setup',
        });
      }

      // Generate summary
      const summary = {
        totalMocks: mocksByModule.size,
        duplicateCount: duplicateMocks.length,
        centralizedCount: Array.from(mocksByModule.keys()).filter(m =>
          CENTRALIZED_MOCK_MODULES.includes(m),
        ).length,
        localOnlyCount: localOnlyMocks.length,
        warningCount: warnings.length,
        requiresQaBuild: duplicateMocks.some(m => CENTRALIZED_MOCK_MODULES.includes(m.module)),
      };

      // Generate recommendations
      const recommendations = generateRecommendations(duplicateMocks, warnings, qaSetup);

      const result: MockCheckResult = {
        sessionId,
        packagePath,
        duplicateMocks,
        localOnlyMocks,
        warnings,
        summary,
        recommendations,
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'mock-check',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'mock-check',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // AI SDK v5: toModelOutput with proper content shapes
  toModelOutput: (result: MockCheckResult) => ({
    type: 'content',
    value: [
      {
        type: 'text',
        text:
          `🔍 Mock Check Complete!\n` +
          `📊 Total Mocks: ${result.summary.totalMocks}\n` +
          `🔄 Duplicates Found: ${result.summary.duplicateCount}\n` +
          `📦 Already Centralized: ${result.summary.centralizedCount}\n` +
          `🏠 Local Only: ${result.summary.localOnlyCount}\n` +
          `⚠️ Warnings: ${result.summary.warningCount}\n` +
          `${result.summary.requiresQaBuild ? '🏗️ Requires @repo/qa rebuild after changes' : ''}\n\n` +
          `${
            result.duplicateMocks.length > 0
              ? `🔄 Duplicates to Centralize:\n${result.duplicateMocks
                  .slice(0, 3)
                  .map(mock => `• ${mock.module} (found in ${mock.count} files) - ${mock.reason}`)
                  .join('\n')}\n\n`
              : ''
          }` +
          `${
            result.recommendations.length > 0
              ? `💡 Top Recommendations:\n${result.recommendations
                  .slice(0, 2)
                  .map((rec: any) => `• ${rec.priority.toUpperCase()}: ${rec.description}`)
                  .join('\n')}`
              : '✅ No centralization needed - mocks are well organized!'
          }`,
      },
    ],
  }),
} as any);

export type { DuplicateMock, LocalMock, MockCheckResult, MockWarning };
