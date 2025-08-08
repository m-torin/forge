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

// Note: Removed re-exports to avoid circular dependencies
// Import types directly from their source files when needed

export interface ToolExecutionContext {
  mcp: {
    createEntities: (params: {
      entities: Array<{ name: string; entityType: string; observations: string[] }>;
    }) => Promise<any>;
  };
}
