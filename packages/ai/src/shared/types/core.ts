export interface AICoreConfig {
  capabilities: Capability[];
  defaultModel?: string;
  maxTokens?: number;
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
  reasoning: string;
}

export interface CompletionOptions {
  maxTokens?: number;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}

export interface CompletionResponse {
  finishReason?: 'content_filter' | 'length' | 'stop' | 'tool_calls';
  id?: string;
  model?: string;
  text: string;
  usage?: TokenUsage;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model?: string;
  usage?: TokenUsage;
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

export interface ObjectOptions<_T = unknown> {
  maxTokens?: number;
  model?: string;
  prompt: string;
  schema: object | Record<string, unknown>;
  temperature?: number;
}

export interface SentimentResult {
  confidence: number;
  reasoning: string;
  sentiment: 'negative' | 'neutral' | 'positive';
}

export interface StreamChunk {
  isFirst: boolean;
  isLast: boolean;
  text: string;
  usage?: TokenUsage;
}

export interface StreamOptions extends CompletionOptions {
  onChunk?: (chunk: StreamChunk) => void;
}

export interface TokenUsage {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
}
