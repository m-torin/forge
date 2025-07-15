/**
 * Type definitions for Code Quality tools
 */

export interface CodeQualitySession {
  sessionId: string;
  workingDirectory: string;
  worktreePath?: string;
  createdAt: Date;
  status: 'initializing' | 'analyzing' | 'reporting' | 'completed' | 'failed';
}

export interface CodeQualityConfig {
  /** Maximum analysis duration in milliseconds */
  maxDuration?: number;
  /** File patterns to include in analysis */
  includePatterns?: string[];
  /** File patterns to exclude from analysis */
  excludePatterns?: string[];
  /** Enable TypeScript analysis */
  typescript?: boolean;
  /** Enable ESLint analysis */
  eslint?: boolean;
  /** Enable Vercel optimizations */
  vercelOptimizations?: boolean;
  /** Target branch for PR creation */
  targetBranch?: string;
}

export interface AnalysisResult {
  sessionId: string;
  timestamp: number;
  toolName: string;
  success: boolean;
  data: any;
  error?: string;
}

export interface FileAnalysis {
  path: string;
  size: number;
  lastModified: Date;
  complexity?: number;
  issues?: Issue[];
  patterns?: Pattern[];
}

export interface Issue {
  type: 'error' | 'warning' | 'info';
  severity: number;
  message: string;
  line?: number;
  column?: number;
  rule?: string;
}

export interface Pattern {
  type: 'architecture' | 'framework' | 'state' | 'styling' | 'testing';
  name: string;
  confidence: number;
  evidence: string[];
}

export interface WorktreeInfo {
  path: string;
  branch: string;
  commit: string;
  clean: boolean;
}

export interface ProgressUpdate {
  sessionId: string;
  step: string;
  progress: number;
  message: string;
  timestamp: number;
}

// Re-export types from tools
export type { CodeAnalysisResult } from './tools/analysis';
export type { FileDiscoveryResult } from './tools/file-discovery';
export type { PatternDetectionResult } from './tools/pattern-detection';
export type { PRCreationResult } from './tools/pr-creation';
export type { QualityReport } from './tools/report-generation';
export type {
  OptimizationRecommendation,
  VercelOptimizationResult,
} from './tools/vercel-optimization';

// Re-export workflow types
export type { CodeQualityWorkflowConfig } from './workflows/full-analysis';
