/**
 * Code Quality Tools for AI SDK v5
 *
 * Provides comprehensive code analysis capabilities including:
 * - Git worktree management for safe isolation
 * - File discovery and prioritization
 * - Architectural pattern detection
 * - Code quality analysis
 * - Vercel-specific optimizations
 * - Report generation and PR creation
 */

// Register all tools with the global registry on import
import './register';

// Export individual tools for direct usage
export { analysisTool } from './tools/analysis';
export { contextDetectionTool } from './tools/context-detection';
export { dependencyAnalysisTool } from './tools/dependency-analysis';
export { fileDiscoveryTool } from './tools/file-discovery';
export { mockCheckTool } from './tools/mock-check';
export { modernizationTool } from './tools/modernization';
export { patternDetectionTool } from './tools/pattern-detection';
export { prCreationTool } from './tools/pr-creation';
export { reportGenerationTool } from './tools/report-generation';
export { sessionManagementTool } from './tools/session-management';
export { vercelOptimizationTool } from './tools/vercel-optimization';
export { wordRemovalTool } from './tools/word-removal';
export { worktreeTool } from './tools/worktree';

// Export registry functions
export {
  getCodeQualityMetrics,
  getCodeQualityTools,
  getCodeQualityToolsByTags,
  getCoreWorkflowTools,
  getToolExecutionOrder,
  registerCodeQualityTools,
} from './register';

// Export shared utilities
export * from './utils';

// Export workflows
export {
  codeQualityWorkflow,
  createCodeQualityWorkflow,
  workflowPresets,
} from './workflows/full-analysis';

// Export types
export type { CodeQualityConfig, CodeQualitySession, CodeQualityWorkflowConfig } from './types';
