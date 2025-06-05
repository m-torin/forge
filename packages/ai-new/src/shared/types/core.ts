export interface CompletionOptions {
  maxTokens?: number;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}

export interface CompletionResponse {
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  id?: string;
  model?: string;
  text: string;
  usage?: TokenUsage;
}

export interface StreamOptions extends CompletionOptions {
  onChunk?: (chunk: StreamChunk) => void;
}

export interface StreamChunk {
  isFirst: boolean;
  isLast: boolean;
  text: string;
  usage?: TokenUsage;
}

export interface TokenUsage {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
}

export interface EmbedOptions {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model?: string;
  usage?: TokenUsage;
}

export type Capability =
  | 'complete'
  | 'stream'
  | 'embed'
  | 'generateObject'
  | 'tools'
  | 'vision'
  | 'moderate'
  | 'classify'
  | 'sentiment'
  | 'extraction'
  | 'analyze';

export interface ObjectOptions<T> {
  maxTokens?: number;
  model?: string;
  prompt: string;
  schema: Record<string, unknown> | object;
  temperature?: number;
}

export interface ModerationResult {
  confidence: number;
  explanation: string;
  safe: boolean;
  violations: string[];
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface SentimentResult {
  confidence: number;
  reasoning: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface EntityResult {
  entities: {
    type: string;
    value: string;
    confidence: number;
  }[];
}
