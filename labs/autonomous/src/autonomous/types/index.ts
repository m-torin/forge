// Type definitions for the autonomous workflow system

export interface WorkflowSpecification {
  name: string;
  description: string;
  type?: 'general' | 'data-processing' | 'api-integration' | 'notification' | 'scheduled';
  inputContract: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
    $schema?: string;
  };
  outputContract: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
    $schema?: string;
  };
  businessLogic: string[];
  errorHandling?: string[];
  performance?: {
    timeout?: number;
    retries?: number;
    rateLimit?: string;
  };
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
  };
}

export interface AutonomousConfig {
  maxIterations: number;
  enableLearning: boolean;
  commitOnSuccess: boolean;
  generateReports: boolean;
  useCICD: boolean;
  timeoutMs?: number;
  claudeModel?: string;
}

export interface TestResult {
  allPassed: boolean;
  vitest: TestFramework;
  playwright: TestFramework;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    duration: number;
  };
  performanceMetrics?: {
    unitTestDuration: number;
    e2eTestDuration: number;
    totalDuration: number;
    averageTestDuration: number;
    slowestTests: any[];
  };
  coverage?: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
}

export interface TestFramework {
  framework: 'vitest' | 'playwright';
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  failures: TestFailure[];
  rawOutput: string;
  screenshots?: string[];
}

export interface TestFailure {
  testName: string;
  error: string;
  message?: string;
  expected: string;
  actual: string;
  stack: string;
  duration?: number;
  file?: string;
}

export type ErrorCategory =
  | 'syntax-error'
  | 'type-error'
  | 'reference-error'
  | 'import-error'
  | 'contract-violation'
  | 'logic-error'
  | 'performance-issue'
  | 'network-error'
  | 'async-error';

export interface ErrorAnalysis {
  errors: Array<{
    message: string;
    file: string;
    line: number;
    category?: ErrorCategory;
    confidence?: number;
  }>;
  categories: ErrorCategory[];
  suggestedStrategy: string;
  testFailures: TestFailure[];
  confidence: number;
  rootCauses?: string[];
  aiInsights?: any;
  repairComplexity?: 'low' | 'medium' | 'high';
  estimatedFixTime?: number; // in minutes
}

export interface RepairStrategy {
  name: string;
  pattern: string;
  successRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  considerations: string[];
  confidence?: number;
}

export interface RepairAttempt {
  workflowName: string;
  iteration: number;
  errorAnalysis: ErrorAnalysis;
  timestamp: Date;
  repairStrategy: string;
  complexity?: 'low' | 'medium' | 'high';
}

export interface RepairOutcome {
  success: boolean;
  iterations: number;
  finalCode?: string;
  error?: string;
  fixesApplied: string[];
  testPassRate: number;
  successRate: number;
  totalTime: number;
  coverage?: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
  linesOfCode?: number;
  testCount?: number;
}

export interface LearningEvent {
  timestamp: Date;
  workflowType: string;
  errorCategories: ErrorCategory[];
  repairStrategy: string;
  success: boolean;
  iterations: number;
  timeToFix: number; // milliseconds
  codeComplexity: number;
  confidence: number;
}

export interface WorkflowContract {
  input: {
    schema: any;
    examples: any[];
    validation: {
      required: string[];
      constraints: any[];
    };
  };
  output: {
    schema: any;
    guarantees: string[];
    format: string;
  };
  errors: {
    types: string[];
    handling: Record<string, string>;
  };
}

export interface AutonomousMetrics {
  totalWorkflows: number;
  successfulCompletions: number;
  averageIterations: number;
  averageTimeToCompletion: number;
  errorCategories: Record<ErrorCategory, number>;
  learningProgress: {
    date: Date;
    successRate: number;
    confidence: number;
  }[];
}

export interface GitCommitInfo {
  branch: string;
  hash: string;
  message: string;
  timestamp: Date;
  filesChanged: string[];
}

export interface PRInfo {
  url: string;
  number: number;
  title: string;
  status: 'open' | 'closed' | 'merged';
  labels: string[];
}

// Zero-Human-Intervention specific types
export interface ZHIProtocol {
  name: string;
  description: string;
  steps: ProtocolStep[];
  successCriteria: string[];
  failureCriteria: string[];
  maxDuration: number;
}

export interface ProtocolStep {
  name: string;
  action: string;
  validation: string;
  onSuccess: string;
  onFailure: string;
  timeout?: number;
}

export interface AutonomousSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  workflow: WorkflowSpecification;
  status: 'running' | 'succeeded' | 'failed' | 'timeout';
  iterations: number;
  commits: GitCommitInfo[];
  pullRequest?: PRInfo;
  metrics: AutonomousMetrics;
  logs: string[];
}
