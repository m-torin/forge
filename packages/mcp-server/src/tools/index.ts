/**
 * MCP Utils - Tools Index
 * Exports MCP tool wrappers for Claude Code agents
 */

import { server } from '@repo/core-utils';
import { safeStringifyTool } from './safe-stringify';

export { safeStringifyTool };

// File & Batch Processing
export const batchProcessorTool: typeof server.batchProcessorTool = server.batchProcessorTool;
export const fileDiscoveryTool: typeof server.fileDiscoveryTool = server.fileDiscoveryTool;
export const fileStreamingTool: typeof server.fileStreamingTool = server.fileStreamingTool;
export const pathManagerTool: typeof server.pathManagerTool = server.pathManagerTool;

// Code Analysis
export const calculateComplexityTool: typeof server.calculateComplexityTool =
  server.calculateComplexityTool;
export const extractExportsTool: typeof server.extractExportsTool = server.extractExportsTool;
export const extractFileMetadataTool: typeof server.extractFileMetadataTool =
  server.extractFileMetadataTool;
export const extractImportsTool: typeof server.extractImportsTool = server.extractImportsTool;
export const patternAnalyzerTool: typeof server.patternAnalyzerTool = server.patternAnalyzerTool;
export const architectureDetectorTool: typeof server.architectureDetectorTool =
  server.architectureDetectorTool;

// Dependencies
export const dependencyAnalyzerTool: typeof server.dependencyAnalyzerTool =
  server.dependencyAnalyzerTool;
export const circularDepsTool: typeof server.circularDepsTool = server.circularDepsTool;

// Memory & Performance
export const memoryMonitorTool: typeof server.memoryMonitorTool = server.memoryMonitorTool;
export const advancedMemoryMonitorTool: typeof server.advancedMemoryMonitorTool =
  server.advancedMemoryMonitorTool;
export const memoryAwareCacheTool: typeof server.memoryAwareCacheTool = server.memoryAwareCacheTool;

// Workflow & Orchestration
export const workflowOrchestratorTool: typeof server.workflowOrchestratorTool =
  server.workflowOrchestratorTool;
export const worktreeManagerTool: typeof server.worktreeManagerTool = server.worktreeManagerTool;
export const resourceLifecycleManagerTool: typeof server.resourceLifecycleManagerTool =
  server.resourceLifecycleManagerTool;

// Session & Context
export const initializeSessionTool: typeof server.initializeSessionTool =
  server.initializeSessionTool;
export const closeSessionTool: typeof server.closeSessionTool = server.closeSessionTool;
export const contextSessionManagerTool: typeof server.contextSessionManagerTool =
  server.contextSessionManagerTool;

// Utilities
export const reportGeneratorTool: typeof server.reportGeneratorTool = server.reportGeneratorTool;
export const optimizationEngineTool: typeof server.optimizationEngineTool =
  server.optimizationEngineTool;

const REGISTERED_TOOL_OBJECTS = [
  safeStringifyTool,
  batchProcessorTool,
  fileDiscoveryTool,
  fileStreamingTool,
  pathManagerTool,
  extractImportsTool,
  extractExportsTool,
  calculateComplexityTool,
  extractFileMetadataTool,
  patternAnalyzerTool,
  architectureDetectorTool,
  dependencyAnalyzerTool,
  circularDepsTool,
  memoryMonitorTool,
  advancedMemoryMonitorTool,
  memoryAwareCacheTool,
  workflowOrchestratorTool,
  worktreeManagerTool,
  resourceLifecycleManagerTool,
  initializeSessionTool,
  closeSessionTool,
  contextSessionManagerTool,
  reportGeneratorTool,
  optimizationEngineTool,
] as const;

// Collect all active tool names for easy registration and catalog publication
export const ALL_TOOLS = REGISTERED_TOOL_OBJECTS.map(tool => tool.name).sort((a, b) =>
  a.localeCompare(b),
);
