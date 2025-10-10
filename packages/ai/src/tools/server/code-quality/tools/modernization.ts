/**
 * Modernization Tool for Code Quality Analysis
 *
 * Analyzes package dependencies and identifies modernization opportunities.
 * Checks for deprecated functions, suggests modern alternatives, and provides
 * migration guidance.
 */

import { logInfo, logWarn } from '@repo/observability';
import { tool, type Tool } from 'ai';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod/v3';
import { mcpClient } from '../mcp-client';
import type { DependencyIndex } from './dependency-analysis';

// Input schema for modernization analysis
const modernizationInputSchema = z.object({
  sessionId: z.string().describe('Unique session identifier'),
  packagePath: z.string().describe('Path to the package to analyze'),
  dependencyIndex: z
    .record(z.string(), z.any())
    .optional()
    .describe('Pre-built dependency index from dependency-analysis tool'),
  options: z
    .object({
      checkDeprecation: z.boolean().default(true).describe('Check for deprecated functions'),
      suggestAlternatives: z.boolean().default(true).describe('Suggest modern alternatives'),
      fetchLatestDocs: z.boolean().default(true).describe('Fetch latest documentation'),
      analysisDepth: z
        .enum(['quick', 'thorough', 'comprehensive'])
        .default('thorough')
        .describe('Analysis depth'),
    })
    .optional()
    .default({
      checkDeprecation: true,
      suggestAlternatives: true,
      fetchLatestDocs: true,
      analysisDepth: 'thorough',
    }),
});

// Modernization result interfaces
interface ModernizationOpportunity {
  package: string;
  function?: string;
  files: string[];
  currentPattern: string;
  modernPattern: string;
  reason: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  changes: Array<{
    type: 'replace-deprecated' | 'use-native-api' | 'upgrade-pattern' | 'remove-dependency';
    from: string;
    to: string;
    description: string;
  }>;
  migrationComplexity: 'simple' | 'moderate' | 'complex';
  breakingChanges: boolean;
}

interface ModernizationResult {
  sessionId: string;
  packagePath: string;
  opportunities: ModernizationOpportunity[];
  summary: {
    totalOpportunities: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    deprecatedFunctions: number;
    packagesAffected: number;
    estimatedEffort: string;
  };
  modernizationPlan: Array<{
    phase: number;
    title: string;
    opportunities: string[];
    estimatedTime: string;
    dependencies: string[];
  }>;
}

// Built-in modernization patterns for common packages
const MODERNIZATION_PATTERNS: Record<string, any> = {
  lodash: {
    debounce: {
      modern: 'useDebouncedValue from @mantine/hooks or custom hook with setTimeout',
      reason: 'React hook alternatives provide better integration with component lifecycle',
      confidence: 0.8,
      priority: 'medium' as const,
      migrationComplexity: 'moderate' as const,
      breakingChanges: false,
    },
    throttle: {
      modern: 'useThrottledValue from @mantine/hooks or custom hook',
      reason: 'React hook alternatives provide better performance',
      confidence: 0.8,
      priority: 'medium' as const,
      migrationComplexity: 'moderate' as const,
      breakingChanges: false,
    },
    isEmpty: {
      modern: 'Object.keys(obj).length === 0 || !obj',
      reason: 'Native JavaScript provides equivalent functionality',
      confidence: 0.9,
      priority: 'low' as const,
      migrationComplexity: 'simple' as const,
      breakingChanges: false,
    },
    isEqual: {
      modern: 'JSON.stringify() comparison or custom deep equality',
      reason: 'Reduce bundle size with native alternatives',
      confidence: 0.7,
      priority: 'low' as const,
      migrationComplexity: 'moderate' as const,
      breakingChanges: false,
    },
    get: {
      modern: 'Optional chaining (obj?.nested?.property)',
      reason: 'Native JavaScript syntax is cleaner and faster',
      confidence: 0.9,
      priority: 'medium' as const,
      migrationComplexity: 'simple' as const,
      breakingChanges: false,
    },
    map: {
      modern: 'Array.prototype.map()',
      reason: 'Native array methods are faster and well-supported',
      confidence: 0.95,
      priority: 'high' as const,
      migrationComplexity: 'simple' as const,
      breakingChanges: false,
    },
  },
  moment: {
    '*': {
      modern: 'date-fns or dayjs',
      reason: 'Smaller bundle size and better tree-shaking. Moment.js is in maintenance mode',
      confidence: 0.8,
      priority: 'high' as const,
      migrationComplexity: 'complex' as const,
      breakingChanges: true,
    },
  },
  axios: {
    get: {
      modern: 'fetch API with proper error handling',
      reason: 'Native fetch API is now well-supported across browsers',
      confidence: 0.6,
      priority: 'low' as const,
      migrationComplexity: 'moderate' as const,
      breakingChanges: true,
    },
    post: {
      modern: 'fetch API with POST method',
      reason: 'Reduce dependency on external HTTP client',
      confidence: 0.6,
      priority: 'low' as const,
      migrationComplexity: 'moderate' as const,
      breakingChanges: true,
    },
  },
  uuid: {
    '*': {
      modern: 'crypto.randomUUID() for Node 14.17+ or browser crypto API',
      reason: 'Native UUID generation is now available',
      confidence: 0.7,
      priority: 'medium' as const,
      migrationComplexity: 'simple' as const,
      breakingChanges: false,
    },
  },
  classnames: {
    '*': {
      modern: 'clsx or native template literals',
      reason: 'Smaller alternatives with similar API',
      confidence: 0.8,
      priority: 'low' as const,
      migrationComplexity: 'simple' as const,
      breakingChanges: false,
    },
  },
  'react-router': {
    Switch: {
      modern: 'Routes component in React Router v6',
      reason: 'Switch component was replaced in React Router v6',
      confidence: 0.9,
      priority: 'high' as const,
      migrationComplexity: 'moderate' as const,
      breakingChanges: true,
    },
    useHistory: {
      modern: 'useNavigate hook in React Router v6',
      reason: 'useHistory was replaced with useNavigate',
      confidence: 0.95,
      priority: 'high' as const,
      migrationComplexity: 'simple' as const,
      breakingChanges: true,
    },
  },
  '@material-ui/core': {
    '*': {
      modern: '@mui/material (Material-UI v5)',
      reason: 'Material-UI v4 is deprecated, v5 offers better performance and TypeScript support',
      confidence: 0.9,
      priority: 'high' as const,
      migrationComplexity: 'complex' as const,
      breakingChanges: true,
    },
  },
  enzyme: {
    '*': {
      modern: '@testing-library/react',
      reason:
        'Enzyme is no longer actively maintained, Testing Library follows modern best practices',
      confidence: 0.9,
      priority: 'high' as const,
      migrationComplexity: 'complex' as const,
      breakingChanges: true,
    },
  },
};

// Check if a module is a built-in Node.js module
function isBuiltinModule(packageName: string): boolean {
  const builtins = [
    'fs',
    'path',
    'os',
    'crypto',
    'http',
    'https',
    'url',
    'querystring',
    'util',
    'events',
    'stream',
    'buffer',
    'process',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'net',
    'tls',
    'zlib',
  ];
  return builtins.includes(packageName) || packageName.startsWith('node:');
}

// Analyze a function for modernization opportunities
function analyzeFunction(
  funcName: string,
  packageName: string,
  usage: any,
): ModernizationOpportunity | null {
  // Check against known patterns
  const packagePatterns = MODERNIZATION_PATTERNS[packageName];
  if (!packagePatterns) return null;

  const pattern = packagePatterns[funcName] || packagePatterns['*'];
  if (!pattern) return null;

  return {
    package: packageName,
    function: funcName,
    files: usage.files || [],
    currentPattern: `${packageName}.${funcName}()`,
    modernPattern: pattern.modern,
    reason: pattern.reason,
    confidence: pattern.confidence,
    priority: pattern.priority,
    changes: [
      {
        type: 'replace-deprecated',
        from: `${packageName}.${funcName}`,
        to: pattern.modern,
        description: `Replace ${packageName}.${funcName} with ${pattern.modern}`,
      },
    ],
    migrationComplexity: pattern.migrationComplexity,
    breakingChanges: pattern.breakingChanges,
  };
}

// Build a comprehensive dependency index if not provided
async function buildDependencyIndex(packagePath: string): Promise<DependencyIndex> {
  const dependencyIndex: DependencyIndex = {};

  try {
    // Read package.json
    const packageJsonPath = join(packagePath, 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Initialize with declared dependencies
    for (const pkg of Object.keys(dependencies)) {
      dependencyIndex[pkg] = {
        package: pkg,
        files: [],
        functions: {},
        patterns: [],
        version: dependencies[pkg],
        type: 'dependency',
      };
    }

    // Scan source files for usage (simplified version)
    // Note: glob functionality is not available in this environment
    const sourceFiles: string[] = [];

    for (const file of sourceFiles.slice(0, 50)) {
      // Limit for performance
      try {
        const filePath = join(packagePath, file);
        const content = await readFile(filePath, 'utf-8');

        // Extract imports
        const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
          const packageName = match[1];
          if (packageName.startsWith('.') || packageName.startsWith('@/')) continue;

          const pkgName = packageName.startsWith('@')
            ? packageName.split('/').slice(0, 2).join('/')
            : packageName.split('/')[0];

          if (dependencyIndex[pkgName]) {
            dependencyIndex[pkgName].files.push(file);
          }
        }
      } catch (_error) {
        // Continue on file read errors
      }
    }
  } catch (error) {
    logWarn('Could not build dependency index', { error });
  }

  return dependencyIndex;
}

// Generate a modernization plan with phases
function generateModernizationPlan(opportunities: ModernizationOpportunity[]): Array<{
  phase: number;
  title: string;
  opportunities: string[];
  estimatedTime: string;
  dependencies: string[];
}> {
  // Group opportunities by priority and complexity
  const highPriority = opportunities.filter(o => o.priority === 'high');
  const mediumPriority = opportunities.filter(o => o.priority === 'medium');
  const lowPriority = opportunities.filter(o => o.priority === 'low');

  const plan = [];

  // Phase 1: High priority, simple changes
  const phase1 = highPriority.filter(o => o.migrationComplexity === 'simple');
  if (phase1.length > 0) {
    plan.push({
      phase: 1,
      title: 'Quick Wins - High Priority Simple Changes',
      opportunities: phase1.map(o => `${o.package}.${o.function || '*'}: ${o.reason}`),
      estimatedTime: `${phase1.length * 2} hours`,
      dependencies: [],
    });
  }

  // Phase 2: High priority, moderate changes
  const phase2 = highPriority.filter(o => o.migrationComplexity === 'moderate');
  if (phase2.length > 0) {
    plan.push({
      phase: 2,
      title: 'High Priority Moderate Changes',
      opportunities: phase2.map(o => `${o.package}.${o.function || '*'}: ${o.reason}`),
      estimatedTime: `${phase2.length * 4} hours`,
      dependencies: phase1.length > 0 ? ['Phase 1 completion'] : [],
    });
  }

  // Phase 3: Medium priority changes
  if (mediumPriority.length > 0) {
    plan.push({
      phase: 3,
      title: 'Medium Priority Optimizations',
      opportunities: mediumPriority.map(o => `${o.package}.${o.function || '*'}: ${o.reason}`),
      estimatedTime: `${mediumPriority.length * 3} hours`,
      dependencies: plan.length > 0 ? ['Previous phases'] : [],
    });
  }

  // Phase 4: Complex changes
  const complexChanges = opportunities.filter(o => o.migrationComplexity === 'complex');
  if (complexChanges.length > 0) {
    plan.push({
      phase: plan.length + 1,
      title: 'Complex Migrations',
      opportunities: complexChanges.map(o => `${o.package}.${o.function || '*'}: ${o.reason}`),
      estimatedTime: `${complexChanges.length * 8} hours`,
      dependencies: ['Testing framework setup', 'Team coordination'],
    });
  }

  // Phase 5: Low priority optimizations
  if (lowPriority.length > 0) {
    plan.push({
      phase: plan.length + 1,
      title: 'Low Priority Clean-up',
      opportunities: lowPriority.map(o => `${o.package}.${o.function || '*'}: ${o.reason}`),
      estimatedTime: `${lowPriority.length * 1.5} hours`,
      dependencies: [],
    });
  }

  return plan;
}

// Calculate estimated effort
function calculateEstimatedEffort(opportunities: ModernizationOpportunity[]): string {
  let totalHours = 0;

  for (const opp of opportunities) {
    switch (opp.migrationComplexity) {
      case 'simple':
        totalHours += 2;
        break;
      case 'moderate':
        totalHours += 4;
        break;
      case 'complex':
        totalHours += 8;
        break;
    }

    // Add extra time for breaking changes
    if (opp.breakingChanges) {
      totalHours += 2;
    }
  }

  if (totalHours <= 8) return `${totalHours} hours`;
  if (totalHours <= 40) return `${Math.ceil(totalHours / 8)} days`;
  return `${Math.ceil(totalHours / 40)} weeks`;
}

// Main modernization tool
export const modernizationTool = tool({
  description:
    'Analyze package dependencies and identify modernization opportunities. Suggests modern alternatives for deprecated functions and packages.',

  inputSchema: modernizationInputSchema,

  execute: async (
    { sessionId, packagePath, dependencyIndex, options: _options = {} }: any,
    _toolOptions: any = { toolCallId: 'modernization', messages: [] },
  ) => {
    try {
      logInfo(`🔄 Analyzing modernization opportunities for ${packagePath}...`);

      // Use provided dependency index or build one
      const depIndex = dependencyIndex || (await buildDependencyIndex(packagePath));

      // Filter out built-in modules and types
      const externalPackages = Object.entries(depIndex).filter(
        ([pkg]) => !isBuiltinModule(pkg) && !pkg.startsWith('@types/'),
      );

      const opportunities: ModernizationOpportunity[] = [];

      // Analyze each package for modernization opportunities
      for (const [packageName, depInfo] of externalPackages) {
        const typedDepInfo = depInfo as any;
        // Check against known patterns
        const packagePatterns = MODERNIZATION_PATTERNS[packageName];
        if (!packagePatterns) continue;

        // If package has a wildcard pattern (entire package needs modernization)
        if (packagePatterns['*']) {
          const pattern = packagePatterns['*'];
          opportunities.push({
            package: packageName,
            files: typedDepInfo.files || [],
            currentPattern: `${packageName} package`,
            modernPattern: pattern.modern,
            reason: pattern.reason,
            confidence: pattern.confidence,
            priority: pattern.priority,
            changes: [
              {
                type: 'replace-deprecated',
                from: packageName,
                to: pattern.modern,
                description: `Replace ${packageName} with ${pattern.modern}`,
              },
            ],
            migrationComplexity: pattern.migrationComplexity,
            breakingChanges: pattern.breakingChanges,
          });
        } else {
          // Check individual functions
          const functions = typedDepInfo.functions || {};
          for (const funcName of Object.keys(functions)) {
            const opportunity = analyzeFunction(funcName, packageName, typedDepInfo);
            if (opportunity) {
              opportunities.push(opportunity);
            }
          }
        }
      }

      // Sort opportunities by priority and confidence
      opportunities.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });

      // Generate summary statistics
      const summary = {
        totalOpportunities: opportunities.length,
        highPriority: opportunities.filter(o => o.priority === 'high').length,
        mediumPriority: opportunities.filter(o => o.priority === 'medium').length,
        lowPriority: opportunities.filter(o => o.priority === 'low').length,
        deprecatedFunctions: opportunities.filter(o =>
          o.reason.toLowerCase().includes('deprecated'),
        ).length,
        packagesAffected: new Set(opportunities.map(o => o.package)).size,
        estimatedEffort: calculateEstimatedEffort(opportunities),
      };

      // Generate modernization plan
      const modernizationPlan = generateModernizationPlan(opportunities);

      const result: ModernizationResult = {
        sessionId,
        packagePath,
        opportunities,
        summary,
        modernizationPlan,
      };

      // Store result in MCP memory
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'modernization',
        success: true,
        data: result,
      });

      return result;
    } catch (error) {
      await mcpClient.storeResult({
        sessionId,
        timestamp: Date.now(),
        toolName: 'modernization',
        success: false,
        data: {},
        error: (error as Error).message,
      });

      throw error;
    }
  },

  // Multi-modal result content
  toModelOutput: (result: ModernizationResult) => ({
    type: 'content',
    value: [
      {
        type: 'text' as const,
        text:
          `🔄 Modernization Analysis Complete!\n` +
          `📊 Total Opportunities: ${result.summary.totalOpportunities}\n` +
          `🚨 High Priority: ${result.summary.highPriority}\n` +
          `⚠️ Medium Priority: ${result.summary.mediumPriority}\n` +
          `ℹ️ Low Priority: ${result.summary.lowPriority}\n` +
          `📦 Packages Affected: ${result.summary.packagesAffected}\n` +
          `⏱️ Estimated Effort: ${result.summary.estimatedEffort}\n` +
          `📋 Modernization Plan: ${result.modernizationPlan.length} phases\n\n` +
          `${
            result.opportunities.length > 0
              ? `Top Opportunities:\n${result.opportunities
                  .slice(0, 3)
                  .map(
                    (opp: any) =>
                      `• ${opp.priority.toUpperCase()}: ${opp.package}${opp.function ? `.${opp.function}` : ''} → ${opp.modernPattern}`,
                  )
                  .join('\n')}\n\n` +
                `Next Steps:\n${result.modernizationPlan
                  .slice(0, 2)
                  .map(
                    (phase: any, i: number) => `${i + 1}. ${phase.title} (${phase.estimatedTime})`,
                  )
                  .join('\n')}`
              : '✅ No modernization opportunities found - your dependencies are up to date!'
          }`,
      },
    ],
  }),
} as any) as Tool;
