// Type definitions for the autonomous workflow system

export interface WorkflowSpecification {
  businessLogic: string[];
  description: string;
  errorHandling?: string[];
  inputContract: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
    $schema?: string;
  };
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
  };
  name: string;
  outputContract: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
    $schema?: string;
  };
  performance?: {
    timeout?: number;
    retries?: number;
    rateLimit?: string;
  };
  type?: 'general' | 'data-processing' | 'api-integration' | 'notification' | 'scheduled';
}

export interface AutonomousConfig {
  claudeModel?: string;
  commitOnSuccess: boolean;
  enableLearning: boolean;
  generateReports: boolean;
  maxIterations: number;
  timeoutMs?: number;
  useCICD: boolean;
}

export interface TestResult {
  allPassed: boolean;
  coverage?: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
  performanceMetrics?: {
    unitTestDuration: number;
    e2eTestDuration: number;
    totalDuration: number;
    averageTestDuration: number;
    slowestTests: any[];
  };
  playwright: TestFramework;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    duration: number;
  };
  vitest: TestFramework;
}

export interface TestFramework {
  duration: number;
  failedTests: number;
  failures: TestFailure[];
  framework: 'vitest' | 'playwright';
  passed: boolean;
  passedTests: number;
  rawOutput: string;
  screenshots?: string[];
  skippedTests: number;
  totalTests: number;
}

export interface TestFailure {
  actual: string;
  duration?: number;
  error: string;
  expected: string;
  file?: string;
  message?: string;
  stack: string;
  testName: string;
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
  aiInsights?: any;
  categories: ErrorCategory[];
  confidence: number;
  errors: {
    message: string;
    file: string;
    line: number;
    category?: ErrorCategory;
    confidence?: number;
  }[];
  estimatedFixTime?: number; // in minutes
  repairComplexity?: 'low' | 'medium' | 'high';
  rootCauses?: string[];
  suggestedStrategy: string;
  testFailures: TestFailure[];
}

export interface RepairStrategy {
  confidence?: number;
  considerations: string[];
  name: string;
  pattern: string;
  riskLevel: 'low' | 'medium' | 'high';
  successRate: number;
}

export interface RepairAttempt {
  complexity?: 'low' | 'medium' | 'high';
  errorAnalysis: ErrorAnalysis;
  iteration: number;
  repairStrategy: string;
  timestamp: Date;
  workflowName: string;
}

export interface RepairOutcome {
  coverage?: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
  error?: string;
  finalCode?: string;
  fixesApplied: string[];
  iterations: number;
  linesOfCode?: number;
  success: boolean;
  successRate: number;
  testCount?: number;
  testPassRate: number;
  totalTime: number;
}

export interface LearningEvent {
  codeComplexity: number;
  confidence: number;
  errorCategories: ErrorCategory[];
  iterations: number;
  repairStrategy: string;
  success: boolean;
  timestamp: Date;
  timeToFix: number; // milliseconds
  workflowType: string;
}

export interface WorkflowContract {
  errors: {
    types: string[];
    handling: Record<string, string>;
  };
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
}

export interface AutonomousMetrics {
  averageIterations: number;
  averageTimeToCompletion: number;
  errorCategories: Record<ErrorCategory, number>;
  learningProgress: {
    date: Date;
    successRate: number;
    confidence: number;
  }[];
  successfulCompletions: number;
  totalWorkflows: number;
}

export interface GitCommitInfo {
  branch: string;
  filesChanged: string[];
  hash: string;
  message: string;
  timestamp: Date;
}

export interface PRInfo {
  labels: string[];
  number: number;
  status: 'open' | 'closed' | 'merged';
  title: string;
  url: string;
}

// Zero-Human-Intervention specific types
export interface ZHIProtocol {
  description: string;
  failureCriteria: string[];
  maxDuration: number;
  name: string;
  steps: ProtocolStep[];
  successCriteria: string[];
}

export interface ProtocolStep {
  action: string;
  name: string;
  onFailure: string;
  onSuccess: string;
  timeout?: number;
  validation: string;
}

export interface AutonomousSession {
  commits: GitCommitInfo[];
  endTime?: Date;
  id: string;
  iterations: number;
  logs: string[];
  metrics: AutonomousMetrics;
  pullRequest?: PRInfo;
  startTime: Date;
  status: 'running' | 'succeeded' | 'failed' | 'timeout';
  workflow: WorkflowSpecification;
}
