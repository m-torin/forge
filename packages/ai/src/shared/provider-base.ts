/**
 * Base provider patterns and middleware utilities
 * Provides common patterns while preserving provider-specific features
 */
import { z } from 'zod/v3';

/**
 * Base provider configuration
 */
export interface BaseProviderConfig {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * Provider capabilities interface
 */
export interface ProviderCapabilities {
  // Model support
  supportsTextGeneration: boolean;
  supportsImageGeneration: boolean;
  supportsImageInput: boolean;
  supportsAudioInput: boolean;
  supportsVideoInput: boolean;
  supportsPDF: boolean;

  // Advanced features
  supportsTools: boolean;
  supportsMultiStep: boolean;
  supportsStreaming: boolean;
  supportsStructuredOutput: boolean;

  // Provider-specific features
  supportsReasoning?: boolean;
  supportsThinking?: boolean;
  supportsCaching?: boolean;
  supportsWebSearch?: boolean;
  supportsComputerUse?: boolean;

  // Context and limits
  maxContextTokens: number;
  maxOutputTokens: number;
  supportedLanguages: string[];
}

/**
 * Provider metadata extracted from responses
 */
export interface ProviderMetadata {
  provider: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedTokens?: number;
  };
  timing?: {
    requestTime: number;
    firstTokenTime?: number;
    totalTime: number;
  };
  reasoningText?: {
    tokens?: number;
    steps?: number;
  };
  safety?: {
    filtered: boolean;
    categories?: string[];
  };
  custom?: Record<string, unknown>;
}

/**
 * Middleware function type
 */
export type ProviderMiddleware<TRequest = any, TResponse = any> = (
  request: TRequest,
  next: (request: TRequest) => Promise<TResponse>,
) => Promise<TResponse>;

/**
 * Base middleware configuration
 */
export interface MiddlewareConfig {
  name: string;
  enabled: boolean;
  order: number;
  options?: Record<string, unknown>;
}

/**
 * Creates a provider middleware function
 */
export function createProviderMiddleware<TRequest, TResponse>(config: {
  name: string;
  beforeRequest?: (request: TRequest) => TRequest | Promise<TRequest>;
  afterResponse?: (response: TResponse, request: TRequest) => TResponse | Promise<TResponse>;
  onError?: (error: unknown, request: TRequest) => void | Promise<void>;
}): ProviderMiddleware<TRequest, TResponse> {
  return async (request: TRequest, next: (request: TRequest) => Promise<TResponse>) => {
    try {
      // Transform request if needed
      const transformedRequest = config.beforeRequest
        ? await config.beforeRequest(request)
        : request;

      // Execute the next middleware/provider
      const response = await next(transformedRequest);

      // Transform response if needed
      return config.afterResponse
        ? await config.afterResponse(response, transformedRequest)
        : response;
    } catch (error) {
      // Handle errors
      if (config.onError) {
        await config.onError(error, request);
      }
      throw error;
    }
  };
}

/**
 * Middleware composer for chaining multiple middleware
 */
export class MiddlewareComposer<TRequest, TResponse> {
  private middlewares: ProviderMiddleware<TRequest, TResponse>[] = [];

  /**
   * Add middleware to the chain
   */
  use(middleware: ProviderMiddleware<TRequest, TResponse>): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Compose all middleware into a single function
   */
  compose(
    baseHandler: (request: TRequest) => Promise<TResponse>,
  ): (request: TRequest) => Promise<TResponse> {
    return this.middlewares.reduceRight(
      (
        next: (request: TRequest) => Promise<TResponse>,
        middleware: ProviderMiddleware<TRequest, TResponse>,
      ) =>
        async (request: TRequest) =>
          middleware(request, next),
      baseHandler,
    );
  }
}

/**
 * Common middleware implementations
 */
export const commonMiddleware = {
  /**
   * Request/response logging middleware
   */
  logging: <TRequest, TResponse>(
    options: {
      logRequests?: boolean;
      logResponses?: boolean;
      logger?: (message: string, data?: any) => void;
    } = {},
  ) =>
    createProviderMiddleware<TRequest, TResponse>({
      name: 'logging',
      beforeRequest: async request => {
        if (options.logRequests) {
          const logger = options.logger ?? console.log;
          logger('Provider Request:', request);
        }
        return request;
      },
      afterResponse: async (response, request) => {
        if (options.logResponses) {
          const logger = options.logger ?? console.log;
          logger('Provider Response:', response);
        }
        return response;
      },
    }),

  /**
   * Timing middleware
   */
  timing: <TRequest, TResponse>() => {
    const timings = new Map<TRequest, number>();

    return createProviderMiddleware<TRequest, TResponse>({
      name: 'timing',
      beforeRequest: async request => {
        timings.set(request, Date.now());
        return request;
      },
      afterResponse: async (response, request) => {
        const startTime = timings.get(request);
        if (startTime) {
          const duration = Date.now() - startTime;
          console.log(`Request completed in ${duration}ms`);
          timings.delete(request);
        }
        return response;
      },
    });
  },

  /**
   * Error handling middleware
   */
  errorHandling: <TRequest, TResponse>(
    options: {
      retries?: number;
      retryDelay?: number;
      shouldRetry?: (error: unknown) => boolean;
      onError?: (error: unknown, attempt: number) => void;
    } = {},
  ) => {
    const maxRetries = options.retries ?? 3;
    const retryDelay = options.retryDelay ?? 1000;
    const shouldRetry = options.shouldRetry ?? (error => error instanceof Error);

    return createProviderMiddleware<TRequest, TResponse>({
      name: 'errorHandling',
      beforeRequest: async request => request,
      afterResponse: async (response, request) => response,
      onError: async (error, request) => {
        if (options.onError) {
          options.onError(error, 0);
        }
      },
    });
  },
};

/**
 * Provider model registry interface
 */
export interface ModelRegistryEntry {
  id: string;
  name: string;
  provider: string;
  capabilities: ProviderCapabilities;
  pricing?: {
    inputTokens: number; // per 1000 tokens
    outputTokens: number; // per 1000 tokens
    currency: string;
  };
  limits?: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerMinute: number;
  };
}

/**
 * Base provider class that other providers can extend
 */
export abstract class BaseProvider {
  protected readonly config: BaseProviderConfig;
  protected readonly middleware: MiddlewareComposer<any, any>;

  constructor(config: BaseProviderConfig = {}) {
    this.config = config;
    this.middleware = new MiddlewareComposer();
  }

  /**
   * Get provider capabilities
   */
  abstract getCapabilities(): ProviderCapabilities;

  /**
   * Get available models
   */
  abstract getModels(): ModelRegistryEntry[];

  /**
   * Extract metadata from provider response
   */
  abstract extractMetadata(response: any): ProviderMetadata;

  /**
   * Add middleware to this provider
   */
  use(middleware: ProviderMiddleware<any, any>): this {
    this.middleware.use(middleware);
    return this;
  }
}

/**
 * Utility function to merge provider capabilities
 */
export function mergeCapabilities(
  base: ProviderCapabilities,
  override: Partial<ProviderCapabilities>,
): ProviderCapabilities {
  return {
    ...base,
    ...override,
  };
}

/**
 * Utility function to check if a provider supports a specific feature
 */
export function supportsFeature(
  capabilities: ProviderCapabilities,
  feature: keyof ProviderCapabilities,
): boolean {
  return Boolean(capabilities[feature]);
}

/**
 * Schema for provider configuration validation
 */
export const providerConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().url().optional(),
  timeout: z.number().min(1000).max(300000).optional(),
  retries: z.number().min(0).max(10).optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export type ValidatedProviderConfig = z.infer<typeof providerConfigSchema>;
