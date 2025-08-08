/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * Dependency Analysis Tool for Code Quality Analysis
 *
 * Analyzes package dependencies and their utilization within a codebase.
 * Builds comprehensive dependency indexes, analyzes package usage, and fetches
 * documentation to identify modernization opportunities.
 */

import { BoundedCache } from '@repo/mcp-utils';
import { logError, logInfo, logWarn } from '@repo/observability';
import { tool } from 'ai';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod/v4';
import { mcpClient } from '../mcp-client';

// Create cache for dependency analysis results
const dependencyCache = new BoundedCache({
  maxSize: 100,
  ttl: 3600000, // 1 hour
  enableAnalytics: true,
});

/**
 * Find source files recursively
 */
async function findSourceFiles(dir: string, files: string[] = []): Promise<string[]> {
  const ignorePatterns = ['node_modules', 'dist', '.next', 'build', 'coverage', '.git'];
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

  try {
    const entries = await readdir(dir);

    for (const entry of entries) {
      if (ignorePatterns.includes(entry)) continue;

      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await findSourceFiles(fullPath, files);
      } else if (extensions.some(ext => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (_error) {
    // Skip directories we can't read
  }

  return files;
}

// Input schema for dependency analysis
const dependencyAnalysisInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  packagePath: z.string().describe('Path to the package to analyze'),
  options: z
    .object({
      includeDevDependencies: z
        .boolean()
        .default(true)
        .describe('Include devDependencies in analysis'),
      fetchDocs: z.boolean().default(true).describe('Fetch documentation from Context7'),
      analyzeUsage: z.boolean().default(true).describe('Analyze how packages are actually used'),
      maxConcurrency: z.number().default(5).describe('Maximum concurrent package analysis'),
    })
    .optional()
    .default({
      includeDevDependencies: true,
      fetchDocs: true,
      analyzeUsage: true,
      maxConcurrency: 5,
    }),
});

// Dependency analysis result interfaces
interface DependencyIndex {
  [packageName: string]: {
    package: string;
    files: string[];
    functions: Record<string, string[]>;
    patterns: string[];
    version?: string;
    type: 'dependency' | 'devDependency';
  };
}

interface UtilizationReport {
  [packageName: string]: {
    package: string;
    available: number | 'unknown';
    used: number;
    percentage: string;
    unusedFunctions: string[];
    recommendation: string;
    hasDeprecatedUsage?: boolean;
    deprecatedFunctions?: Array<{
      name: string;
      alternatives: string[];
    }>;
  };
}

interface DependencyAnalysisResult {
  sessionId: string;
  dependencyIndex: DependencyIndex;
  utilizationReport: UtilizationReport | null;
  summary: {
    totalDependencies: number;
    productionDependencies: number;
    devDependencies: number;
    underutilized: number;
    deprecated: number;
    fullyUtilized: number;
  };
  recommendations: Array<{
    type: 'remove' | 'optimize' | 'update' | 'deprecation';
    package: string;
    reason: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Extract dependencies from file content
async function extractDependenciesFromFile(
  content: string,
  _filePath: string,
): Promise<
  Map<
    string,
    {
      functions: Map<string, Set<string>>;
      patterns: Set<string>;
    }
  >
> {
  const dependencies = new Map();

  // Enhanced import detection patterns
  const importPatterns = [
    // ES6 imports: import { func } from 'package'
    /import\s+(?:(?:\*\s+as\s+(\w+))|(?:\{([^}]+)\})|(\w+))\s+from\s+['"]([^'"]+)['"]/g,
    // Dynamic imports: import('package')
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // Require statements: require('package')
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // Type imports: import type { Type } from 'package'
    /import\s+type\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g,
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const packageName = match[match.length - 1];

      // Skip relative imports and internal paths
      if (packageName.startsWith('.') || packageName.startsWith('@/')) continue;

      // Extract clean package name
      const pkgName = packageName.startsWith('@')
        ? packageName.split('/').slice(0, 2).join('/')
        : packageName.split('/')[0];

      if (!dependencies.has(pkgName)) {
        dependencies.set(pkgName, {
          functions: new Map(),
          patterns: new Set(),
        });
      }

      const dep = dependencies.get(pkgName);

      // Extract imported functions (named imports)
      if (match[2]) {
        const functions = match[2].split(',').map(f => f.trim().replace(/\s+as\s+\w+/, ''));
        functions.forEach(func => {
          if (!dep.functions.has(func)) {
            dep.functions.set(func, new Set());
          }
          dep.functions.get(func).add(`import { ${func} }`);
        });
      }

      // Extract default imports
      if (match[3] && !match[2]) {
        const defaultImport = match[3];
        if (!dep.functions.has(defaultImport)) {
          dep.functions.set(defaultImport, new Set());
        }
        dep.functions.get(defaultImport).add('default import');
      }

      // Detect usage patterns
      dep.patterns.add(detectUsagePattern(content, pkgName));
    }
  }

  return dependencies;
}

// Detect how a package is used in the code
function detectUsagePattern(content: string, packageName: string): string {
  const pkgBase = packageName.replace('@', '').split('/')[0];

  if (content.includes(`${pkgBase}.config`) || content.includes(`${packageName}.config`)) {
    return 'configuration';
  }
  if (content.includes(`new ${pkgBase}`) || content.includes(`new ${packageName}`)) {
    return 'instantiation';
  }
  if (content.includes(`${pkgBase}(`) || content.includes(`${packageName}(`)) {
    return 'function-call';
  }
  if (content.includes(`extends ${pkgBase}`) || content.includes(`extends ${packageName}`)) {
    return 'inheritance';
  }
  // React component pattern
  if (content.includes(`<${pkgBase}`) && pkgBase[0].toUpperCase() === pkgBase[0]) {
    return 'react-component';
  }
  if (content.includes(`${pkgBase}.`) || content.includes(`${packageName}.`)) {
    return 'method-call';
  }

  return 'import-only';
}

// Build comprehensive dependency index
async function buildDependencyIndex(packagePath: string): Promise<DependencyIndex> {
  const dependencyIndex: DependencyIndex = {};

  try {
    // Read package.json to get declared dependencies
    const packageJsonPath = join(packagePath, 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    // Initialize index with declared dependencies
    for (const [pkg, version] of Object.entries(dependencies)) {
      dependencyIndex[pkg] = {
        package: pkg,
        files: [],
        functions: {},
        patterns: [],
        version: version as string,
        type: 'dependency',
      };
    }

    for (const [pkg, version] of Object.entries(devDependencies)) {
      dependencyIndex[pkg] = {
        package: pkg,
        files: [],
        functions: {},
        patterns: [],
        version: version as string,
        type: 'devDependency',
      };
    }

    // Scan source files for actual usage
    const sourceFiles = await findSourceFiles(packagePath);

    // Process files in batches
    const BATCH_SIZE = 20;
    for (let i = 0; i < sourceFiles.length; i += BATCH_SIZE) {
      const batch = sourceFiles.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async filePath => {
          const relativePath = filePath.replace(packagePath + '/', '');
          try {
            const content = await readFile(filePath, 'utf-8');
            const fileDependencies = await extractDependenciesFromFile(content, relativePath);

            for (const [pkg, data] of fileDependencies) {
              // Initialize if not already present (e.g., indirect dependencies)
              if (!dependencyIndex[pkg]) {
                dependencyIndex[pkg] = {
                  package: pkg,
                  files: [],
                  functions: {},
                  patterns: [],
                  type: 'dependency', // Assume dependency for undeclared packages
                };
              }

              const entry = dependencyIndex[pkg];
              entry.files.push(relativePath);

              // Merge function usage
              for (const [func, patterns] of data.functions) {
                if (!entry.functions[func]) {
                  entry.functions[func] = [];
                }
                entry.functions[func].push(...Array.from(patterns));
              }

              // Merge patterns
              entry.patterns.push(...Array.from(data.patterns));
            }
          } catch (error) {
            logWarn(`Could not analyze ${relativePath}`, { error });
          }
        }),
      );
    }

    // Remove duplicates and clean up
    for (const pkg in dependencyIndex) {
      const entry = dependencyIndex[pkg];
      entry.files = [...new Set(entry.files)];
      entry.patterns = [...new Set(entry.patterns)];

      for (const func in entry.functions) {
        entry.functions[func] = [...new Set(entry.functions[func])];
      }
    }
  } catch (error) {
    logError('Error building dependency index', { error });
  }

  return dependencyIndex;
}

// Analyze package utilization using Context7 API
async function analyzePackageUtilization(
  dependencyIndex: DependencyIndex,
  maxConcurrency: number = 5,
): Promise<UtilizationReport> {
  const utilizationReport: UtilizationReport = {};

  // Filter out @repo packages and get external packages
  const externalPackages = Object.entries(dependencyIndex).filter(
    ([pkg]) => !pkg.startsWith('@repo/') && !pkg.startsWith('@types/'),
  );

  // Process packages with concurrency limit
  const semaphore = Array(maxConcurrency).fill(null);
  let index = 0;

  const processPackage = async (): Promise<void> => {
    while (index < externalPackages.length) {
      const currentIndex = index++;
      const [packageName, depInfo] = externalPackages[currentIndex];

      try {
        // Try to fetch package API documentation
        const packageAPI = await fetchPackageAPI(packageName);

        if (!packageAPI) {
          utilizationReport[packageName] = {
            package: packageName,
            available: 'unknown',
            used: Object.keys(depInfo.functions).length,
            percentage: 'N/A',
            unusedFunctions: [],
            recommendation: 'Could not analyze - no API documentation available',
          };
          continue;
        }

        const allFeatures = [
          ...packageAPI.functions,
          ...packageAPI.classes,
          ...packageAPI.constants,
        ];

        const usedFeatures = Object.keys(depInfo.functions);
        const unusedFeatures = allFeatures.filter(f => !usedFeatures.includes(f));
        const percentage =
          allFeatures.length > 0 ? (usedFeatures.length / allFeatures.length) * 100 : 0;

        utilizationReport[packageName] = {
          package: packageName,
          available: allFeatures.length,
          used: usedFeatures.length,
          percentage: percentage.toFixed(1),
          unusedFunctions: unusedFeatures.slice(0, 10), // Top 10 unused
          recommendation: getUtilizationRecommendation(percentage, unusedFeatures.length),
        };
      } catch (error) {
        logWarn(`Error analyzing ${packageName}`, { error });
        utilizationReport[packageName] = {
          package: packageName,
          available: 'unknown',
          used: Object.keys(depInfo.functions).length,
          percentage: 'N/A',
          unusedFunctions: [],
          recommendation: 'Analysis failed',
        };
      }
    }
  };

  // Start concurrent processing
  await Promise.all(semaphore.map(() => processPackage()));

  return utilizationReport;
}

// Declare MCP Context7 functions that will be available at runtime
declare function mcp__context7__resolve_library_id(params: { libraryName: string }): Promise<{
  selectedLibraryId?: string;
  matches?: Array<{
    libraryId: string;
    name: string;
    description: string;
  }>;
}>;

declare function mcp__context7__get_library_docs(params: {
  context7CompatibleLibraryID: string;
  topic?: string;
  tokens?: number;
}): Promise<{
  content?: string;
  error?: string;
}>;

// Fetch package API using Context7 MCP
async function fetchPackageAPI(packageName: string): Promise<{
  functions: string[];
  classes: string[];
  constants: string[];
} | null> {
  try {
    // Skip internal packages
    if (packageName.startsWith('@repo/') || packageName.startsWith('@types/')) {
      return null;
    }

    // Try to resolve library ID using Context7
    const libIdResult = await mcp__context7__resolve_library_id({
      libraryName: packageName,
    });

    if (!libIdResult?.selectedLibraryId) {
      // Fallback for common packages not in Context7
      const fallbackAPIs: Record<
        string,
        { functions: string[]; classes: string[]; constants: string[] }
      > = {
        react: {
          functions: [
            'useState',
            'useEffect',
            'useContext',
            'useReducer',
            'useMemo',
            'useCallback',
          ],
          classes: ['Component', 'PureComponent'],
          constants: ['StrictMode', 'Fragment'],
        },
        lodash: {
          functions: [
            'map',
            'filter',
            'reduce',
            'find',
            'some',
            'every',
            'pick',
            'omit',
            'merge',
            'cloneDeep',
          ],
          classes: [],
          constants: [],
        },
      };
      return fallbackAPIs[packageName] || null;
    }

    // Fetch API documentation
    const apiDocs = await mcp__context7__get_library_docs({
      context7CompatibleLibraryID: libIdResult.selectedLibraryId,
      topic: 'api',
      tokens: 5000,
    });

    if (!apiDocs?.content) {
      return null;
    }

    // Extract API information from documentation
    const api = {
      functions: extractFunctionsFromDocs(apiDocs.content),
      classes: extractClassesFromDocs(apiDocs.content),
      constants: extractConstantsFromDocs(apiDocs.content),
    };

    return api;
  } catch (error) {
    logWarn(`Could not fetch API for ${packageName}`, { error });
    return null;
  }
}

// Helper functions to extract API info from documentation
function extractFunctionsFromDocs(content: string): string[] {
  const functions: string[] = [];
  // Match function declarations in various formats
  const patterns = [
    // eslint-disable-next-line security/detect-unsafe-regex
    /export\s+(?:async\s+)?function\s+(\w+)/g,
    // eslint-disable-next-line security/detect-unsafe-regex
    /export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
    /\.(\w+)\s*\(/g, // method calls
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (!functions.includes(match[1])) {
        functions.push(match[1]);
      }
    }
  }

  return functions;
}

function extractClassesFromDocs(content: string): string[] {
  const classes: string[] = [];
  // eslint-disable-next-line security/detect-unsafe-regex
  const pattern = /(?:export\s+)?(?:class|interface)\s+(\w+)/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    if (!classes.includes(match[1])) {
      classes.push(match[1]);
    }
  }

  return classes;
}

function extractConstantsFromDocs(content: string): string[] {
  const constants: string[] = [];
  const pattern = /export\s+const\s+([A-Z_]+)\s*=/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    if (!constants.includes(match[1])) {
      constants.push(match[1]);
    }
  }

  return constants;
}

// Generate utilization recommendation
function getUtilizationRecommendation(percentage: number, _unusedCount: number): string {
  if (percentage === 100) return '✅ Fully utilized';
  if (percentage >= 75) return '✅ Well utilized';
  if (percentage >= 50) return '📊 Moderately utilized';
  if (percentage >= 20) return '⚠️ Consider using more features or a lighter alternative';
  if (percentage >= 5) return '⚠️ Underutilized - consider removing or using a specific utility';
  return '❌ Barely used - strong candidate for removal';
}

// Generate recommendations based on analysis
function generateRecommendations(
  dependencyIndex: DependencyIndex,
  utilizationReport: UtilizationReport | null,
): Array<{
  type: 'remove' | 'optimize' | 'update' | 'deprecation';
  package: string;
  reason: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const recommendations = [];

  // Check for unused dependencies
  for (const [pkg, info] of Object.entries(dependencyIndex)) {
    if (info.files.length === 0) {
      recommendations.push({
        type: 'remove' as const,
        package: pkg,
        reason: 'Package is declared but never imported',
        action: `Remove ${pkg} from ${info.type === 'devDependency' ? 'devDependencies' : 'dependencies'}`,
        priority: 'medium' as const,
      });
    }
  }

  // Check utilization report for optimization opportunities
  if (utilizationReport) {
    for (const [pkg, util] of Object.entries(utilizationReport)) {
      if (util.percentage !== 'N/A') {
        const percentage = parseFloat(util.percentage);

        if (percentage < 5) {
          recommendations.push({
            type: 'remove' as const,
            package: pkg,
            reason: `Only using ${util.used} of ${util.available} available features (${util.percentage}%)`,
            action: 'Consider removing this dependency or using a more specific alternative',
            priority: 'high' as const,
          });
        } else if (percentage < 20) {
          recommendations.push({
            type: 'optimize' as const,
            package: pkg,
            reason: `Low utilization: ${util.percentage}% of available features`,
            action: 'Consider tree-shaking or using a lighter alternative',
            priority: 'medium' as const,
          });
        }
      }

      if (util.hasDeprecatedUsage) {
        recommendations.push({
          type: 'deprecation' as const,
          package: pkg,
          reason: 'Using deprecated functions that may be removed in future versions',
          action: 'Update to use recommended alternatives',
          priority: 'high' as const,
        });
      }
    }
  }

  return recommendations;
}

// Main dependency analysis tool
export const dependencyAnalysisTool = tool({
  description:
    'Analyze package dependencies and their utilization. Builds dependency indexes, analyzes package usage, and identifies optimization opportunities.',

  inputSchema: dependencyAnalysisInputSchema,

  execute: async ({
    sessionId,
    packagePath,
    options = {
      includeDevDependencies: true,
      fetchDocs: false,
      analyzeUsage: true,
      maxConcurrency: 3,
    },
  }: any) => {
    try {
      logInfo(`📦 Building dependency index for ${packagePath}...`);

      // Build comprehensive dependency index
      const dependencyIndex = await buildDependencyIndex(packagePath);

      let utilizationReport: UtilizationReport | null = null;

      // Analyze utilization if requested
      if (options.analyzeUsage) {
        logInfo('📊 Analyzing package utilization...');
        utilizationReport = await analyzePackageUtilization(
          dependencyIndex,
          options.maxConcurrency,
        );
      }

      // Generate summary statistics
      const totalDeps = Object.keys(dependencyIndex).length;
      const prodDeps = Object.values(dependencyIndex).filter(d => d.type === 'dependency').length;
      const devDeps = Object.values(dependencyIndex).filter(d => d.type === 'devDependency').length;

      let underutilized = 0;
      let deprecated = 0;
      let fullyUtilized = 0;

      if (utilizationReport) {
        for (const util of Object.values(utilizationReport)) {
          if (util.percentage !== 'N/A') {
            const pct = parseFloat(util.percentage);
            if (pct === 100) fullyUtilized++;
            else if (pct < 20) underutilized++;
          }
          if (util.hasDeprecatedUsage) deprecated++;
        }
      }

      // Generate recommendations
      const recommendations = generateRecommendations(dependencyIndex, utilizationReport);

      const result: DependencyAnalysisResult = {
        sessionId,
        dependencyIndex,
        utilizationReport,
        summary: {
          totalDependencies: totalDeps,
          productionDependencies: prodDeps,
          devDependencies: devDeps,
          underutilized,
          deprecated,
          fullyUtilized,
        },
        recommendations,
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'dependency-analysis',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'dependency-analysis',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // AI SDK v5: toModelOutput with proper content shapes
  toModelOutput: (result: DependencyAnalysisResult) => ({
    type: 'content',
    value: [
      {
        type: 'text',
        text:
          `📦 Dependency Analysis Complete!\n` +
          `📊 Total Dependencies: ${result.summary.totalDependencies}\n` +
          `🏗️ Production: ${result.summary.productionDependencies} | 🛠️ Development: ${result.summary.devDependencies}\n` +
          `${
            result.utilizationReport
              ? `✅ Fully Utilized: ${result.summary.fullyUtilized}\n` +
                `⚠️ Underutilized: ${result.summary.underutilized}\n` +
                `🚨 Deprecated Usage: ${result.summary.deprecated}\n`
              : '📋 Usage analysis skipped\n'
          }` +
          `💡 Recommendations: ${result.recommendations.length}\n` +
          `${
            result.recommendations.length > 0
              ? `\nTop Recommendations:\n${result.recommendations
                  .slice(0, 3)
                  .map((rec: any) => `• ${rec.type.toUpperCase()}: ${rec.package} - ${rec.reason}`)
                  .join('\n')}`
              : '✅ No optimization recommendations at this time'
          }`,
      },
    ],
  }),
} as any);

export type { DependencyAnalysisResult, DependencyIndex, UtilizationReport };
