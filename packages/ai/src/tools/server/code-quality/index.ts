/**
 * Code Quality Tools for AI SDK v5 - Enhanced Edition
 *
 * Provides comprehensive code analysis capabilities including:
 * - Intelligent agent routing and fallback mechanisms
 * - Real-time progress tracking and error recovery
 * - Support for large codebases (10k+ files)
 * - Advanced edge case handling and memory management
 * - Consolidated agents for improved reliability
 * - Git worktree management for safe isolation
 * - File discovery and prioritization
 * - Architectural pattern detection
 * - Code quality analysis
 * - Vercel-specific optimizations
 * - Report generation and PR creation
 */

// Register all tools with the global registry on import
import './register';

// Export enhanced main components
// Export individual tools for direct usage
export { analysisTool } from './tools/analysis';
export { fileDiscoveryTool } from './tools/file-discovery';
export { patternDetectionTool } from './tools/pattern-detection';
export { prCreationTool } from './tools/pr-creation';
export { reportGenerationTool } from './tools/report-generation';
export { vercelOptimizationTool } from './tools/vercel-optimization';
export { worktreeTool } from './tools/worktree';
// Export new Phase 1 & 2 tools
// Export registry functions
// Export shared utilities
export * from './utils';

// Export workflows
export {
  codeQualityWorkflow,
  createCodeQualityWorkflow,
  workflowPresets,
} from './workflows/full-analysis';

// Export types
export type { CodeQualityConfig, CodeQualitySession } from './types';
export type { CodeQualityWorkflowConfig } from './workflows/full-analysis';

// Export enhanced types;;
