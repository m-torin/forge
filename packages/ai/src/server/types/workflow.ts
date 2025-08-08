/**
 * Workflow and Condition Types
 * Advanced workflow management and condition handling for agent execution
 */

import type { AgentExecutionContext, AgentStep, AgentStepResult } from './agent-core';

/**
 * Step condition function type
 */
export type StepCondition = (context: {
  steps: AgentStep[];
  currentStep?: AgentStep;
  usage?: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
  toolResults?: Array<{ success: boolean; error?: string; result?: any }>;
  executionTime: number;
  metadata?: Record<string, any>;
}) => boolean;

/**
 * Optimized condition factory interface
 */
export interface OptimizedConditionFactory {
  createTokenLimitCondition(maxTokens: number): StepCondition;
  createTimeoutCondition(maxTimeMs: number): StepCondition;
  createStepLimitCondition(maxSteps: number): StepCondition;
  createErrorThresholdCondition(maxErrors: number): StepCondition;
  createCustomCondition(predicate: (context: any) => boolean): StepCondition;
  combineConditions(conditions: StepCondition[], operator: 'AND' | 'OR'): StepCondition;
}

/**
 * Flow control decision
 */
export type FlowDecision =
  | { action: 'continue'; reason?: string }
  | { action: 'pause'; reason: string; resumeCondition?: StepCondition }
  | { action: 'stop'; reason: string; final?: boolean }
  | { action: 'retry'; reason: string; maxRetries?: number }
  | { action: 'branch'; reason: string; branchId: string }
  | { action: 'error'; reason: string; error: Error };

/**
 * Flow controller interface with decision capabilities
 */
export interface FlowControllerWithDecisions {
  evaluate(
    context: AgentExecutionContext,
    currentStep: AgentStep,
    previousSteps: AgentStep[],
  ): Promise<FlowDecision>;

  onStepComplete(result: AgentStepResult): Promise<FlowDecision>;

  onError(error: Error, context: AgentExecutionContext): Promise<FlowDecision>;

  registerCondition(name: string, condition: StepCondition): void;

  removeCondition(name: string): boolean;

  getActiveConditions(): string[];
}

/**
 * Workflow node definition
 */
export interface WorkflowNode {
  id: string;
  type: 'start' | 'step' | 'condition' | 'parallel' | 'end';
  name: string;
  description?: string;
  config?: Record<string, any>;
  connections: Array<{
    to: string;
    condition?: StepCondition;
    label?: string;
  }>;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
    retryableErrors?: string[];
  };
}

/**
 * Workflow definition
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description?: string;
  nodes: WorkflowNode[];
  variables?: Record<string, any>;
  timeout?: number;
  metadata?: Record<string, any>;
}

/**
 * Workflow execution state
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentNodeId?: string;
  variables: Record<string, any>;
  context: AgentExecutionContext;
  startTime: number;
  endTime?: number;
  error?: Error;
  results: Record<string, any>;
  trace: Array<{
    nodeId: string;
    timestamp: number;
    input?: any;
    output?: any;
    error?: Error;
    duration: number;
  }>;
}

/**
 * Workflow engine interface
 */
export interface WorkflowEngine {
  execute(
    workflowId: string,
    input?: Record<string, any>,
    context?: Partial<AgentExecutionContext>,
  ): Promise<WorkflowExecution>;

  pause(executionId: string): Promise<void>;

  resume(executionId: string): Promise<void>;

  cancel(executionId: string): Promise<void>;

  getExecution(executionId: string): Promise<WorkflowExecution | null>;

  registerWorkflow(definition: WorkflowDefinition): Promise<void>;

  unregisterWorkflow(workflowId: string): Promise<boolean>;
}

/**
 * Parallel execution branch
 */
export interface ParallelBranch {
  id: string;
  nodes: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: Error;
  startTime?: number;
  endTime?: number;
}

/**
 * Parallel execution manager
 */
export interface ParallelExecutionManager {
  executeBranches(
    branches: ParallelBranch[],
    context: AgentExecutionContext,
  ): Promise<Array<{ branchId: string; result: any; error?: Error }>>;

  waitForAll(branchIds: string[]): Promise<Record<string, any>>;

  waitForAny(branchIds: string[]): Promise<{ branchId: string; result: any }>;

  cancelBranch(branchId: string): Promise<void>;

  getBranchStatus(branchId: string): Promise<ParallelBranch | null>;
}

/**
 * Workflow event types
 */
export type WorkflowEvent =
  | { type: 'workflow_start'; execution: WorkflowExecution }
  | { type: 'workflow_complete'; execution: WorkflowExecution }
  | { type: 'workflow_error'; execution: WorkflowExecution; error: Error }
  | { type: 'workflow_paused'; execution: WorkflowExecution }
  | { type: 'workflow_resumed'; execution: WorkflowExecution }
  | { type: 'node_enter'; executionId: string; nodeId: string }
  | { type: 'node_exit'; executionId: string; nodeId: string; result?: any }
  | { type: 'node_error'; executionId: string; nodeId: string; error: Error }
  | { type: 'branch_start'; executionId: string; branchId: string }
  | { type: 'branch_complete'; executionId: string; branchId: string; result: any };

/**
 * Workflow event listener
 */
export interface WorkflowEventListener {
  onEvent(event: WorkflowEvent): void | Promise<void>;
}

/**
 * Dynamic workflow builder
 */
export interface WorkflowBuilder {
  start(name: string): WorkflowBuilder;
  addStep(id: string, config: Partial<WorkflowNode>): WorkflowBuilder;
  addCondition(
    id: string,
    condition: StepCondition,
    trueNode: string,
    falseNode?: string,
  ): WorkflowBuilder;
  addParallel(id: string, branches: string[][]): WorkflowBuilder;
  connect(fromId: string, toId: string, condition?: StepCondition): WorkflowBuilder;
  end(id: string): WorkflowBuilder;
  build(): WorkflowDefinition;
  validate(): { valid: boolean; errors: string[] };
}

/**
 * Workflow template
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  definition: WorkflowDefinition;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    required: boolean;
    description?: string;
    default?: any;
  }>;
  examples?: Array<{
    name: string;
    description: string;
    input: Record<string, any>;
    expectedOutput?: Record<string, any>;
  }>;
}

/**
 * Workflow registry
 */
export interface WorkflowRegistry {
  register(template: WorkflowTemplate): Promise<void>;
  unregister(templateId: string): Promise<boolean>;
  get(templateId: string): Promise<WorkflowTemplate | null>;
  list(category?: string): Promise<WorkflowTemplate[]>;
  search(query: string): Promise<WorkflowTemplate[]>;
  instantiate(templateId: string, parameters: Record<string, any>): Promise<WorkflowDefinition>;
}
