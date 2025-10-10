/**
 * Register all code quality tools with the unified tool registry
 */

import { globalToolRegistry, type ToolMetadata } from '../tool-registry';

// Import all code quality tools
import { analysisTool } from './tools/analysis';
import { contextDetectionTool } from './tools/context-detection';
import { dependencyAnalysisTool } from './tools/dependency-analysis';
import { fileDiscoveryTool } from './tools/file-discovery';
import { mockCheckTool } from './tools/mock-check';
import { modernizationTool } from './tools/modernization';
import { patternDetectionTool } from './tools/pattern-detection';
import { prCreationTool } from './tools/pr-creation';
import { reportGenerationTool } from './tools/report-generation';
import { sessionManagementTool } from './tools/session-management';
import { vercelOptimizationTool } from './tools/vercel-optimization';
import { wordRemovalTool } from './tools/word-removal';
import { worktreeTool } from './tools/worktree';

// Import new Phase 1 & 2 tools
import { documentationGeneratorTool } from './tools/documentation-generator';
import { performanceProfilerTool } from './tools/performance-profiler';
import { securityScannerTool } from './tools/security-scanner';
import { testCoverageTool } from './tools/test-coverage';

/**
 * Code quality tool metadata
 */
const codeQualityMetadata: Record<string, ToolMetadata> = {
  worktree: {
    name: 'Git Worktree Management',
    description: 'Creates and manages isolated Git worktrees for safe code analysis',
    category: 'code-quality',
    tags: ['git', 'worktree', 'isolation', 'core'],
    security: 'medium',
    version: '1.0.0',
    complexity: 'moderate',
    reliability: 0.95,
    performance: 0.8,
    dependencies: ['git'],
    requirements: {
      environmentVariables: ['GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL'],
      externalServices: ['git'],
    },
    isActive: true,
  },
  fileDiscovery: {
    name: 'File Discovery',
    description: 'Discovers and prioritizes files for code quality analysis',
    category: 'code-quality',
    tags: ['files', 'discovery', 'prioritization', 'core'],
    security: 'low',
    version: '1.0.0',
    complexity: 'simple',
    reliability: 0.98,
    performance: 0.9,
    dependencies: ['worktree'],
    isActive: true,
  },
  patternDetection: {
    name: 'Architectural Pattern Detection',
    description: 'Detects code patterns, architectural styles, and best practices',
    category: 'code-quality',
    tags: ['patterns', 'architecture', 'analysis'],
    security: 'low',
    version: '1.0.0',
    complexity: 'complex',
    reliability: 0.85,
    performance: 0.7,
    isActive: true,
  },
  analysis: {
    name: 'Code Quality Analysis',
    description: 'Comprehensive code quality analysis with TypeScript and ESLint',
    category: 'code-quality',
    tags: ['analysis', 'typescript', 'eslint', 'core'],
    security: 'low',
    version: '1.0.0',
    complexity: 'complex',
    reliability: 0.9,
    performance: 0.6,
    dependencies: ['fileDiscovery'],
    requirements: {
      externalServices: ['typescript', 'eslint'],
    },
    isActive: true,
  },
  vercelOptimization: {
    name: 'Vercel Optimization Check',
    description: 'Analyzes code for Vercel-specific optimization opportunities',
    category: 'code-quality',
    tags: ['vercel', 'optimization', 'performance'],
    security: 'low',
    version: '1.0.0',
    complexity: 'moderate',
    reliability: 0.85,
    performance: 0.8,
    isActive: true,
  },
  reportGeneration: {
    name: 'Quality Report Generation',
    description: 'Generates comprehensive code quality reports',
    category: 'code-quality',
    tags: ['report', 'documentation', 'core'],
    security: 'low',
    version: '1.0.0',
    complexity: 'moderate',
    reliability: 0.95,
    performance: 0.85,
    dependencies: ['analysis', 'patternDetection'],
    isActive: true,
  },
  prCreation: {
    name: 'Pull Request Creation',
    description: 'Creates pull requests with code quality improvements',
    category: 'code-quality',
    tags: ['git', 'pr', 'github', 'core'],
    security: 'high',
    version: '1.0.0',
    complexity: 'moderate',
    reliability: 0.9,
    performance: 0.7,
    dependencies: ['reportGeneration'],
    requirements: {
      environmentVariables: ['GITHUB_TOKEN'],
      externalServices: ['github'],
    },
    isActive: true,
  },
  contextDetection: {
    name: 'Project Context Detection',
    description: 'Detects project context, monorepo structure, and framework stack',
    category: 'code-quality',
    tags: ['context', 'detection', 'utility'],
    security: 'low',
    version: '1.0.0',
    complexity: 'simple',
    reliability: 0.95,
    performance: 0.9,
    isActive: true,
  },
  dependencyAnalysis: {
    name: 'Dependency Analysis',
    description: 'Analyzes package dependencies and their utilization',
    category: 'code-quality',
    tags: ['dependencies', 'analysis', 'packages'],
    security: 'low',
    version: '1.0.0',
    complexity: 'complex',
    reliability: 0.85,
    performance: 0.7,
    requirements: {
      externalServices: ['context7'],
    },
    isActive: true,
  },
  modernization: {
    name: 'Dependency Modernization',
    description: 'Identifies modernization opportunities for dependencies',
    category: 'code-quality',
    tags: ['modernization', 'dependencies', 'optimization'],
    security: 'low',
    version: '1.0.0',
    complexity: 'complex',
    reliability: 0.8,
    performance: 0.7,
    dependencies: ['dependencyAnalysis'],
    isActive: true,
  },
  mockCheck: {
    name: 'Mock Centralization Check',
    description: 'Identifies duplicate mocks that should be centralized',
    category: 'code-quality',
    tags: ['testing', 'mocks', 'analysis'],
    security: 'low',
    version: '1.0.0',
    complexity: 'moderate',
    reliability: 0.9,
    performance: 0.85,
    isActive: true,
  },
  sessionManagement: {
    name: 'Session Management',
    description: 'Manages analysis sessions with persistence and recovery',
    category: 'code-quality',
    tags: ['session', 'management', 'utility'],
    security: 'low',
    version: '1.0.0',
    complexity: 'moderate',
    reliability: 0.95,
    performance: 0.9,
    isActive: true,
  },
  wordRemoval: {
    name: 'Generic Word Removal',
    description: 'Removes generic words from code identifiers and file names',
    category: 'code-quality',
    tags: ['refactoring', 'naming', 'optimization'],
    security: 'medium',
    version: '1.0.0',
    complexity: 'moderate',
    reliability: 0.85,
    performance: 0.75,
    isActive: true,
  },
  securityScanner: {
    name: 'Security Vulnerability Scanner',
    description: 'Comprehensive security scanning for vulnerabilities and exposed secrets',
    category: 'code-quality',
    tags: ['security', 'vulnerability', 'secrets', 'analysis'],
    security: 'high',
    version: '1.0.0',
    complexity: 'complex',
    reliability: 0.94,
    performance: 0.7,
    isActive: true,
  },
  testCoverage: {
    name: 'Test Coverage & Generation',
    description: 'Analyzes test coverage and generates missing tests',
    category: 'code-quality',
    tags: ['testing', 'coverage', 'generation', 'quality'],
    security: 'low',
    version: '1.0.0',
    complexity: 'complex',
    reliability: 0.91,
    performance: 0.6,
    dependencies: ['analysis'],
    requirements: {
      externalServices: ['jest', 'vitest', 'mocha'],
    },
    isActive: true,
  },
  performanceProfiler: {
    name: 'Performance Profiler',
    description: 'Analyzes performance bottlenecks and optimization opportunities',
    category: 'code-quality',
    tags: ['performance', 'profiling', 'optimization', 'bundle'],
    security: 'low',
    version: '1.0.0',
    complexity: 'complex',
    reliability: 0.89,
    performance: 0.5,
    dependencies: ['analysis'],
    requirements: {
      externalServices: ['webpack', 'rollup', 'esbuild'],
    },
    isActive: true,
  },
  documentationGenerator: {
    name: 'Documentation Generator',
    description: 'Generates comprehensive documentation from code analysis',
    category: 'code-quality',
    tags: ['documentation', 'api', 'components', 'generation'],
    security: 'low',
    version: '1.0.0',
    complexity: 'moderate',
    reliability: 0.92,
    performance: 0.8,
    isActive: true,
  },
};

/**
 * Register all code quality tools
 */
function registerCodeQualityTools(): void {
  // Register core workflow tools
  globalToolRegistry.register('codeQuality.worktree', worktreeTool, codeQualityMetadata.worktree);
  globalToolRegistry.register(
    'codeQuality.fileDiscovery',
    fileDiscoveryTool,
    codeQualityMetadata.fileDiscovery,
  );
  globalToolRegistry.register(
    'codeQuality.patternDetection',
    patternDetectionTool,
    codeQualityMetadata.patternDetection,
  );
  globalToolRegistry.register('codeQuality.analysis', analysisTool, codeQualityMetadata.analysis);
  globalToolRegistry.register(
    'codeQuality.vercelOptimization',
    vercelOptimizationTool,
    codeQualityMetadata.vercelOptimization,
  );
  globalToolRegistry.register(
    'codeQuality.reportGeneration',
    reportGenerationTool,
    codeQualityMetadata.reportGeneration,
  );
  globalToolRegistry.register(
    'codeQuality.prCreation',
    prCreationTool,
    codeQualityMetadata.prCreation,
  );

  // Register additional analysis tools
  globalToolRegistry.register(
    'codeQuality.contextDetection',
    contextDetectionTool,
    codeQualityMetadata.contextDetection,
  );
  globalToolRegistry.register(
    'codeQuality.dependencyAnalysis',
    dependencyAnalysisTool,
    codeQualityMetadata.dependencyAnalysis,
  );
  globalToolRegistry.register(
    'codeQuality.modernization',
    modernizationTool,
    codeQualityMetadata.modernization,
  );
  globalToolRegistry.register(
    'codeQuality.mockCheck',
    mockCheckTool,
    codeQualityMetadata.mockCheck,
  );
  globalToolRegistry.register(
    'codeQuality.sessionManagement',
    sessionManagementTool,
    codeQualityMetadata.sessionManagement,
  );
  globalToolRegistry.register(
    'codeQuality.wordRemoval',
    wordRemovalTool,
    codeQualityMetadata.wordRemoval,
  );

  // Register Phase 1 & 2 tools
  globalToolRegistry.register(
    'codeQuality.securityScanner',
    securityScannerTool,
    codeQualityMetadata.securityScanner,
  );
  globalToolRegistry.register(
    'codeQuality.testCoverage',
    testCoverageTool,
    codeQualityMetadata.testCoverage,
  );
  globalToolRegistry.register(
    'codeQuality.performanceProfiler',
    performanceProfilerTool,
    codeQualityMetadata.performanceProfiler,
  );
  globalToolRegistry.register(
    'codeQuality.documentationGenerator',
    documentationGeneratorTool,
    codeQualityMetadata.documentationGenerator,
  );
}

/**
 * Get all code quality tools from the registry
 */
function getCodeQualityTools() {
  return globalToolRegistry.getByCategory('code-quality');
}

/**
 * Get code quality tools by tags
 */
function getCodeQualityToolsByTags(tags: string[]) {
  return globalToolRegistry.getByTags(tags);
}

/**
 * Get core workflow tools
 */
function getCoreWorkflowTools() {
  return globalToolRegistry.getByTags(['core']);
}

/**
 * Get tool dependencies for execution planning
 */
function getToolExecutionOrder(): string[] {
  // Define execution order based on dependencies
  return [
    'codeQuality.sessionManagement',
    'codeQuality.contextDetection',
    'codeQuality.worktree',
    'codeQuality.fileDiscovery',
    'codeQuality.patternDetection',
    'codeQuality.analysis',
    'codeQuality.securityScanner',
    'codeQuality.testCoverage',
    'codeQuality.performanceProfiler',
    'codeQuality.dependencyAnalysis',
    'codeQuality.modernization',
    'codeQuality.mockCheck',
    'codeQuality.vercelOptimization',
    'codeQuality.wordRemoval',
    'codeQuality.documentationGenerator',
    'codeQuality.reportGeneration',
    'codeQuality.prCreation',
  ];
}

/**
 * Get tool performance metrics
 */
function getCodeQualityMetrics() {
  const metrics = globalToolRegistry.getMetrics();
  if (!metrics || !(metrics instanceof Map)) return null;

  const codeQualityMetrics = new Map();
  for (const [toolId, toolMetrics] of metrics) {
    if (toolId.startsWith('codeQuality.')) {
      codeQualityMetrics.set(toolId, toolMetrics);
    }
  }

  return codeQualityMetrics;
}

/**
 * Initialize code quality tools on module load
 */
declare global {
  var __codeQualityToolsRegistered: boolean | undefined;
}

if (typeof globalThis !== 'undefined' && !globalThis.__codeQualityToolsRegistered) {
  registerCodeQualityTools();
  globalThis.__codeQualityToolsRegistered = true;
}
