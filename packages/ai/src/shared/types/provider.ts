import {
  Capability,
  ClassificationResult,
  CompletionOptions,
  CompletionResponse,
  EmbeddingResponse,
  EmbedOptions,
  EntityResult,
  ModerationResult,
  ObjectOptions,
  SentimentResult,
  StreamChunk,
  StreamOptions,
} from './core';

export interface AIManagerConfig {
  defaultProvider?: string;
  enableLogging?: boolean;
  enableRateLimit?: boolean;
  providers?: ProviderConfig[];
  routing?: Record<string, string>;
}

export interface AIProvider {
  analyzeSentiment?(text: string): Promise<SentimentResult>;
  readonly capabilities: Set<Capability>;
  classify?(text: string, labels?: string[]): Promise<ClassificationResult>;

  complete(options: CompletionOptions): Promise<CompletionResponse>;
  embed?(options: EmbedOptions): Promise<EmbeddingResponse>;
  extensions?: Record<string, (...args: unknown[]) => unknown>;

  extractEntities?(text: string): Promise<EntityResult>;
  generateObject?<T>(options: ObjectOptions<T>): Promise<T>;
  moderate?(content: string): Promise<ModerationResult>;
  readonly name: string;
  stream(options: StreamOptions): AsyncIterableIterator<StreamChunk>;

  readonly type: 'ai-sdk' | 'custom' | 'direct';
}

export interface ProviderConfig {
  capabilities?: Capability[];
  config: Record<string, unknown>;
  name: string;
  type: 'ai-sdk' | 'custom' | 'direct';
}
