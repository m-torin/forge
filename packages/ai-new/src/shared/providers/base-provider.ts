import type {
  AIProvider,
  Capability,
  CompletionOptions,
  CompletionResponse,
  EmbeddingResponse,
  EmbedOptions,
  ObjectOptions,
  StreamChunk,
  StreamOptions,
} from '../types';

export abstract class BaseProvider implements AIProvider {
  abstract readonly name: string;
  abstract readonly type: 'ai-sdk' | 'direct' | 'custom';
  abstract readonly capabilities: Set<Capability>;

  abstract complete(options: CompletionOptions): Promise<CompletionResponse>;
  abstract stream(options: StreamOptions): AsyncIterableIterator<StreamChunk>;

  // Optional methods - subclasses should override if they support these capabilities
  async embed?(options: EmbedOptions): Promise<EmbeddingResponse>;
  async generateObject?<T>(options: ObjectOptions<T>): Promise<T>;

  protected formatError(error: unknown, context?: string): Error {
    if (error instanceof Error) {
      const contextStr = context ? `${context}: ` : '';
      const formattedError = new Error(`[${this.name}] ${contextStr}${error.message}`);

      // Preserve original stack trace
      if (error.stack) {
        formattedError.stack = error.stack;
      }

      // Preserve any custom properties
      if ('code' in error) {
        (formattedError as any).code = error.code;
      }
      if ('status' in error) {
        (formattedError as any).status = error.status;
      }

      return formattedError;
    }

    // Handle non-Error objects
    if (typeof error === 'object' && error !== null) {
      const message = 'message' in error ? String(error.message) : JSON.stringify(error);
      return new Error(`[${this.name}] ${context ? `${context}: ` : ''}${message}`);
    }

    return new Error(`[${this.name}] ${context ? `${context}: ` : ''}${String(error)}`);
  }

  protected validateOptions(options: CompletionOptions): void {
    if (!options.prompt || typeof options.prompt !== 'string') {
      throw new Error('Prompt is required and must be a string');
    }
  }
}
