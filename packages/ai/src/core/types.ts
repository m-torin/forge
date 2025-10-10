/**
 * Core types for @repo/ai
 * Enhanced with AI SDK v5 features
 */

import type { LanguageModelV2 } from '@ai-sdk/provider';
import type { StopCondition, TextStreamPart, ToolSet } from 'ai';

// Re-export LanguageModelV2 for convenience
export type { LanguageModelV2 };

export interface AIOperationConfig {
  model?: string | LanguageModelV2;
  messages?: any[];
  tools?: Record<string, any>;
  /**
   * @deprecated Use stopWhen with stepCountIs/hasToolCall helpers instead.
   */
  maxSteps?: number;
  stopWhen?: StopCondition<any> | StopCondition<any>[];
  telemetry?: boolean | { functionId?: string; metadata?: any };
  retry?: RetryConfig;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  seed?: number;
  userId?: string;
  conversationId?: string;
  sessionId?: string;
  schema?: any;
  // AI SDK v5 Structured Data Support
  output?: 'object' | 'array' | 'enum' | 'no-schema';
  enum?: string[] | readonly string[];
  schemaName?: string;
  schemaDescription?: string;
  experimental_repairText?: (options: { text: string; error: any }) => Promise<string>;
  experimental_output?: any;
  // AI SDK v5 Callback Support
  onError?: (error: { error: Error }) => void;
  onFinish?: (result: FinishCallbackResult) => void;
  onChunk?: (chunk: { chunk: TextStreamPart<ToolSet> }) => void;
  // AI SDK v5 Stream Transformation
  experimental_transform?: any;
  // AI SDK v5 Stream Hooks
  experimental_streamHooks?: StreamHooks;
}

export interface AIOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: { message: string; error: any };
  usage?: UsageInfo;
  metrics?: { duration: number };
  operationId?: string;
  // AI SDK v5 Enhanced Result Properties
  text?: string;
  object?: T;
  finishReason?: string;
  cost?: number;
  timestamp?: string;
  // AI SDK v5 Response Access
  response?: {
    headers?: Record<string, string>;
    body?: any;
    messages?: any[];
  };
  // AI SDK v5 Additional Properties
  content?: any;
  reasoningText?: string;
  files?: any[];
  sources?: SourceInfo[];
  toolCalls?: any[];
  toolResults?: any[];
  warnings?: any[];
  request?: any;
  providerOptions?: any;
  steps?: any[];
  totalUsage?: UsageInfo;
  experimental_output?: any;
  // Streaming specific
  textStream?: ReadableStream;
  fullStream?: ReadableStream;
  toUIMessageStreamResponse?: () => Response;
  pipeTextStreamToResponse?: (response: any) => void;
  pipeUIMessageStreamToResponse?: (response: any) => void;
  toTextStreamResponse?: () => Response;
  // AI SDK v5 Structured Streaming
  partialObjectStream?: ReadableStream<T>;
  elementStream?: ReadableStream<T>;
  experimental_partialOutputStream?: ReadableStream<T>;
}

export interface AIStreamResult extends AIOperationResult {
  stream: ReadableStream;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  priority?: number;
  enabled?: boolean;
}

export interface ToolConfig {
  name: string;
  description: string;
  parameters: any;
  execute: (input: any) => Promise<any>;
  category?: string;
  lifecycle?: ToolLifecycle;
}

export interface ToolLifecycle {
  onStart?: (name: string, params: any) => void;
  onComplete?: (name: string, params: any, result: any) => void;
  onError?: (name: string, params: any, error: any) => void;
}

export interface RAGConfig {
  vectorStore: any;
  embedModel?: string;
  defaultLimit?: number;
  defaultThreshold?: number;
  queryOptions?: any;
}

export interface FragmentConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  modelSelector?: string | ((context: any) => string);
}

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export interface ChatConfig {
  model?: string | LanguageModelV2;
  messages?: any[];
  tools?: Record<string, any>;
  temperature?: number;
  maxOutputTokens?: number;
  stream?: boolean;
  /**
   * @deprecated Use stopWhen with stepCountIs/hasToolCall helpers instead.
   */
  maxSteps?: number;
  stopWhen?: StopCondition<any> | StopCondition<any>[];
  // AI SDK v5 Stream Hooks
  experimental_streamHooks?: StreamHooks;
  experimental_transform?: any;
  // AI SDK v5 Callback Support
  onChunk?: (chunk: { chunk: TextStreamPart<ToolSet> }) => void;
  onError?: (error: { error: Error }) => void;
  onFinish?: (result: FinishCallbackResult) => void;
}

export interface ChatResult {
  success: boolean;
  error?: { message: string; error: any };
  message?: string;
  text?: string;
  messages?: any[];
  usage?: UsageInfo;
  steps?: any[];
  finishReason?: string;
  // AI SDK v5 Streaming Support
  toUIMessageStreamResponse?: () => Response;
  pipeTextStreamToResponse?: (response: any) => void;
  // AI SDK v5 Response Access
  response?: {
    headers?: Record<string, string>;
    body?: any;
    messages?: any[];
  };
}

// AI SDK v5 Type Definitions
interface UsageInfo {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
}

interface SourceInfo {
  id: string;
  sourceType: 'url';
  url?: string;
  title?: string;
  providerOptions?: any;
}

interface FinishCallbackResult {
  text: string;
  finishReason: string;
  usage: UsageInfo;
  response: {
    id: string;
    modelId: string;
    timestamp: Date;
    messages: any[];
  };
  steps: any[];
  totalUsage: UsageInfo;
}

interface StreamHooks {
  onStart?: () => void;
  onChunk?: (chunk: { chunk: TextStreamPart<ToolSet> }) => void;
  onFinish?: (result: FinishCallbackResult) => void;
  onError?: (error: { error: Error }) => void;
}

// AI SDK v5 Stream Event Types (aligned with latest version)
type StreamEventType =
  | 'start'
  | 'start-step'
  | 'text-start'
  | 'text-delta'
  | 'text-end'
  | 'reasoning-start'
  | 'reasoning-delta'
  | 'reasoning-end'
  | 'reasoning-part-finish'
  | 'source'
  | 'file'
  | 'tool-call'
  | 'tool-call-streaming-start'
  | 'tool-call-delta'
  | 'tool-input-start'
  | 'tool-input-delta'
  | 'tool-input-end'
  | 'tool-result'
  | 'tool-error'
  | 'finish-step'
  | 'finish'
  | 'error'
  | 'abort'
  | 'raw';

interface StreamEvent {
  type: StreamEventType;
  [key: string]: any;
}

// Stream Transform Function Type
export interface StreamTransform<TOOLS extends ToolSet> {
  (options: {
    tools: TOOLS;
    stopStream: () => void;
  }): TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>;
}

// AI SDK v5 Structured Data Types
export interface StructuredDataConfig<_T = any> extends Omit<AIOperationConfig, 'schema'> {
  schema?: any;
  output?: 'object' | 'array' | 'enum' | 'no-schema';
  enum?: string[] | readonly string[];
  schemaName?: string;
  schemaDescription?: string;
  experimental_repairText?: (options: { text: string; error: any }) => Promise<string>;
}

export interface ObjectGenerationResult<T = any> extends AIOperationResult<T> {
  object?: T;
  partialObjectStream?: ReadableStream<T>;
  elementStream?: ReadableStream<T>;
}

export interface ArrayGenerationResult<T = any>
  extends Omit<AIOperationResult<T[]>, 'elementStream'> {
  object?: T[];
  partialObjectStream?: ReadableStream<T[]>;
  elementStream?: ReadableStream<T>;
}

export interface EnumGenerationResult<T extends string = string> extends AIOperationResult<T> {
  object?: T;
}

export interface NoSchemaGenerationResult extends AIOperationResult<any> {
  object?: any;
}

// Error types for structured data generation
export interface StructuredDataError extends Error {
  name: 'AI_NoObjectGeneratedError';
  text?: string;
  response?: {
    id: string;
    modelId: string;
    timestamp: Date;
  };
  usage?: UsageInfo;
  cause?: Error;
}
