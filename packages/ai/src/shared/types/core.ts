import type { LanguageModelUsage } from 'ai';

export interface AICoreConfig {
  capabilities: Capability[];
  defaultModel?: string;
  maxOutputTokens?: number;
  temperature?: number;
  timeout?: number;
}

export type Capability =
  | 'analyze'
  | 'classify'
  | 'complete'
  | 'embed'
  | 'extraction'
  | 'generateObject'
  | 'moderate'
  | 'sentiment'
  | 'stream'
  | 'tools'
  | 'vision';

export interface ClassificationResult {
  category: string;
  confidence: number;
  reasoningText: string;
}

export interface ChatMessage {
  content: string;
  role: 'assistant' | 'system' | 'user';
}

export interface CompletionOptions {
  maxOutputTokens?: number;
  messages?: ChatMessage[];
  model?: string;
  prompt?: string;
  systemPrompt?: string;
  temperature?: number;
  filter?: Record<string, any>;
}

export interface SearchSource {
  title?: string;
  url: string;
  description?: string;
}

export interface CompletionResponse {
  finishReason?: 'content_filter' | 'length' | 'stop' | 'tool_calls';
  id?: string;
  model?: string;
  sources?: SearchSource[];
  text: string;
  usage?: LanguageModelUsage;
  // Anthropic reasoning support
  reasoningText?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model?: string;
  usage?: LanguageModelUsage;
}

export interface EmbedOptions {
  input: string | string[];
  model?: string;
}

export interface EntityResult {
  entities: {
    confidence: number;
    type: string;
    value: string;
  }[];
}

export interface ModerationResult {
  confidence: number;
  explanation: string;
  safe: boolean;
  violations: string[];
}

export interface ObjectOptions<T = unknown> {
  maxOutputTokens?: number;
  model?: string;
  output?: 'array' | 'object';
  prompt: string;
  schema: object | Record<string, unknown>;
  temperature?: number;
}

export interface SentimentResult {
  confidence: number;
  reasoningText: string;
  sentiment: 'negative' | 'neutral' | 'positive';
}

export interface StreamChunk {
  isFirst: boolean;
  isLast: boolean;
  text: string;
  usage?: LanguageModelUsage;
  sources?: SearchSource[];
  providerOptions?: any;
}

export interface StreamOptions extends CompletionOptions {
  onChunk?: (chunk: StreamChunk) => void;
  // Provider-specific options following AI SDK patterns
  providerOptions?: {
    anthropic?: {
      thinking?: { type: 'enabled'; budgetTokens?: number };
      cacheControl?: { type: 'ephemeral' };
    };
    perplexity?: {
      return_images?: boolean;
    };
  };
  // Tools support as per AI SDK documentation
  tools?: Record<string, any>;
}

export interface TokenUsage {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
}
