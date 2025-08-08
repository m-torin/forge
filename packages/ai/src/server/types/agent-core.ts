/**
 * Core AI Agent Types
 * Essential type definitions for multi-step agent operations
 */

import type { ReactNode } from 'react';
import type { z } from 'zod';

/**
 * Agent execution context providing runtime information
 */
export interface AgentExecutionContext {
  sessionId: string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
  environment?: 'development' | 'staging' | 'production';
  traceId?: string;
  parentSpanId?: string;
}

/**
 * Result of agent execution
 */
export interface AgentExecutionResult {
  success: boolean;
  result?: any;
  error?: Error;
  steps: AgentStep[];
  totalTokens?: number;
  executionTime: number;
  context: AgentExecutionContext;
}

/**
 * Agent configuration interface
 */
export interface AgentConfiguration {
  maxSteps?: number;
  timeout?: number;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  tools?: string[];
  systemPrompt?: string;
  stopConditions?: Array<(context: any) => boolean>;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
}

/**
 * Individual agent step representation
 */
export interface AgentStep {
  id?: string;
  stepNumber: number;
  type: 'tool' | 'reasoning' | 'response' | 'error' | 'action' | 'parallel' | 'loop';
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, any>;
    result?: any;
    error?: string;
  }>;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Result of executing a single agent step
 */
export interface AgentStepResult {
  step: AgentStep;
  shouldContinue: boolean;
  nextAction?: 'continue' | 'stop' | 'retry' | 'error';
  error?: Error;
}

/**
 * Multi-step agent executor interface
 */
export interface MultiStepAgentExecutor {
  execute(
    prompt: string,
    config?: AgentConfiguration,
    context?: Partial<AgentExecutionContext>,
  ): Promise<AgentExecutionResult>;

  executeStep(step: Partial<AgentStep>, context: AgentExecutionContext): Promise<AgentStepResult>;

  abort(sessionId: string): Promise<void>;

  getStatus(sessionId: string): Promise<{
    status: 'running' | 'completed' | 'error' | 'aborted';
    currentStep?: number;
    totalSteps?: number;
  }>;

  // Additional methods for compatibility
  destroy?(): void;
}

/**
 * Prompt template engine interface
 */
export interface PromptTemplateEngine {
  compile(template: string, variables?: Record<string, any>): string;
  validate(template: string): { valid: boolean; errors: string[] };
  getVariables(template: string): string[];
  registerHelper(name: string, fn: (...args: any[]) => any): void;

  // Additional methods for compatibility
  registerTemplate?(name: string, template: string): void;
  render?(template: string, variables?: Record<string, any>): string;
  destroy?(): void;
}

/**
 * Agent tool definition
 */
export interface AgentTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<any>;
  execute: (args: any, context: AgentExecutionContext) => Promise<any>;
  timeout?: number;
  retryable?: boolean;
}

/**
 * Agent memory interface
 */
export interface AgentMemory {
  store(key: string, value: any, context: AgentExecutionContext): Promise<void>;
  retrieve(key: string, context: AgentExecutionContext): Promise<any>;
  search(
    query: string,
    context: AgentExecutionContext,
  ): Promise<Array<{ key: string; value: any; score: number }>>;
  clear(context: AgentExecutionContext): Promise<void>;
}

/**
 * Agent workflow state
 */
export interface AgentWorkflowState {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'paused';
  currentStep: number;
  totalSteps: number;
  data: Record<string, any>;
  error?: Error;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

/**
 * Agent event types
 */
export type AgentEvent =
  | { type: 'step_start'; step: AgentStep }
  | { type: 'step_complete'; step: AgentStep; result: any }
  | { type: 'step_error'; step: AgentStep; error: Error }
  | { type: 'execution_start'; context: AgentExecutionContext }
  | { type: 'execution_complete'; result: AgentExecutionResult }
  | { type: 'execution_error'; error: Error; context: AgentExecutionContext };

/**
 * Agent event listener
 */
export interface AgentEventListener {
  onEvent(event: AgentEvent): void | Promise<void>;
}

/**
 * Agent registry interface
 */
export interface AgentRegistry {
  register(name: string, executor: MultiStepAgentExecutor): void;
  get(name: string): MultiStepAgentExecutor | undefined;
  list(): string[];
  unregister(name: string): boolean;
}

/**
 * Chat-specific agent types
 */
export interface ChatAgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | ReactNode;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ChatAgentState {
  messages: ChatAgentMessage[];
  context: AgentExecutionContext;
  isThinking: boolean;
  currentStep?: AgentStep;
}

export interface ChatAgentConfig extends AgentConfiguration {
  maxMessages?: number;
  messageRetention?: number;
  enableThinking?: boolean;
  thinkingIndicator?: ReactNode;
}
