import type {
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

export interface AIProvider {
  readonly capabilities: Set<Capability>;
  readonly name: string;
  readonly type: 'ai-sdk' | 'direct' | 'custom';

  complete(options: CompletionOptions): Promise<CompletionResponse>;
  embed?(options: EmbedOptions): Promise<EmbeddingResponse>;
  stream(options: StreamOptions): AsyncIterableIterator<StreamChunk>;

  analyzeSentiment?(text: string): Promise<SentimentResult>;
  classify?(text: string, labels?: string[]): Promise<ClassificationResult>;
  extractEntities?(text: string): Promise<EntityResult>;
  generateObject?<T>(options: ObjectOptions<T>): Promise<T>;
  moderate?(content: string): Promise<ModerationResult>;

  extensions?: Record<string, Function>;
}

export interface ProviderConfig {
  capabilities?: Capability[];
  config: Record<string, unknown>;
  name: string;
  type: 'ai-sdk' | 'direct' | 'custom';
}

export interface AIManagerConfig {
  defaultProvider?: string;
  enableLogging?: boolean;
  enableRateLimit?: boolean;
  providers?: ProviderConfig[];
  routing?: Record<string, string>;
}
