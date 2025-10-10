/**
 * Comprehensive error handling for Upstash Vector operations
 */

/**
 * Base Vector error class
 */
export class VectorError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly operation: string;
  public readonly retryable: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(options: {
    message: string;
    code: string;
    statusCode?: number;
    operation: string;
    retryable?: boolean;
    context?: Record<string, any>;
    cause?: Error;
  }) {
    super(options.message);
    this.name = 'VectorError';
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.operation = options.operation;
    this.retryable = options.retryable || false;
    this.timestamp = new Date();
    this.context = options.context;

    if (options.cause) {
      this.cause = options.cause;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VectorError);
    }
  }
}

/**
 * Embedding generation error
 */
export class VectorEmbeddingError extends VectorError {
  public readonly provider: string;
  public readonly model: string;

  constructor(message: string, provider: string, model: string, context?: Record<string, any>) {
    super({
      message,
      code: 'EMBEDDING_ERROR',
      statusCode: 422,
      operation: 'embedding',
      retryable: true,
      context: { provider, model, ...context },
    });
    this.name = 'VectorEmbeddingError';
    this.provider = provider;
    this.model = model;
  }
}

/**
 * Dimension mismatch error
 */
export class VectorDimensionError extends VectorError {
  public readonly expected: number;
  public readonly actual: number;

  constructor(message: string, expected: number, actual: number, context?: Record<string, any>) {
    super({
      message,
      code: 'DIMENSION_MISMATCH',
      statusCode: 400,
      operation: 'validation',
      retryable: false,
      context: { expected, actual, ...context },
    });
    this.name = 'VectorDimensionError';
    this.expected = expected;
    this.actual = actual;
  }
}

/**
 * Index not found error
 */
export class VectorIndexError extends VectorError {
  public readonly indexName: string;

  constructor(message: string, indexName: string, context?: Record<string, any>) {
    super({
      message,
      code: 'INDEX_ERROR',
      statusCode: 404,
      operation: 'index',
      retryable: false,
      context: { indexName, ...context },
    });
    this.name = 'VectorIndexError';
    this.indexName = indexName;
  }
}

/**
 * Quota exceeded error
 */
export class VectorQuotaError extends VectorError {
  public readonly quotaType: string;
  public readonly limit: number;
  public readonly current: number;

  constructor(
    message: string,
    quotaType: string,
    limit: number,
    current: number,
    context?: Record<string, any>,
  ) {
    super({
      message,
      code: 'QUOTA_EXCEEDED',
      statusCode: 429,
      operation: 'quota',
      retryable: false,
      context: { quotaType, limit, current, ...context },
    });
    this.name = 'VectorQuotaError';
    this.quotaType = quotaType;
    this.limit = limit;
    this.current = current;
  }
}

/**
 * Vector validation error
 */
export class VectorValidationError extends VectorError {
  public readonly field: string;
  public readonly value: any;

  constructor(message: string, field: string, value: any, context?: Record<string, any>) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      operation: 'validation',
      retryable: false,
      context: { field, value, ...context },
    });
    this.name = 'VectorValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * AI provider error
 */
export class VectorAIProviderError extends VectorError {
  public readonly provider: string;
  public readonly providerCode?: string;

  constructor(
    message: string,
    provider: string,
    providerCode?: string,
    context?: Record<string, any>,
  ) {
    super({
      message,
      code: 'AI_PROVIDER_ERROR',
      statusCode: 502,
      operation: 'ai_provider',
      retryable: true,
      context: { provider, providerCode, ...context },
    });
    this.name = 'VectorAIProviderError';
    this.provider = provider;
    this.providerCode = providerCode;
  }
}

/**
 * Search error
 */
export class VectorSearchError extends VectorError {
  public readonly query: string | number[];
  public readonly searchType: string;

  constructor(
    message: string,
    query: string | number[],
    searchType: string,
    context?: Record<string, any>,
  ) {
    super({
      message,
      code: 'SEARCH_ERROR',
      statusCode: 500,
      operation: 'search',
      retryable: true,
      context: {
        queryType: typeof query,
        searchType,
        ...context,
      },
    });
    this.name = 'VectorSearchError';
    this.query = query;
    this.searchType = searchType;
  }
}

/**
 * Upsert error
 */
export class VectorUpsertError extends VectorError {
  public readonly vectorCount: number;
  public readonly namespace?: string;

  constructor(
    message: string,
    vectorCount: number,
    namespace?: string,
    context?: Record<string, any>,
  ) {
    super({
      message,
      code: 'UPSERT_ERROR',
      statusCode: 500,
      operation: 'upsert',
      retryable: true,
      context: { vectorCount, namespace, ...context },
    });
    this.name = 'VectorUpsertError';
    this.vectorCount = vectorCount;
    this.namespace = namespace;
  }
}

/**
 * Namespace error
 */
export class VectorNamespaceError extends VectorError {
  public readonly namespace: string;

  constructor(message: string, namespace: string, context?: Record<string, any>) {
    super({
      message,
      code: 'NAMESPACE_ERROR',
      statusCode: 404,
      operation: 'namespace',
      retryable: false,
      context: { namespace, ...context },
    });
    this.name = 'VectorNamespaceError';
    this.namespace = namespace;
  }
}

/**
 * Document processing error
 */
export class VectorDocumentError extends VectorError {
  public readonly documentId: string;
  public readonly processingStep: string;

  constructor(
    message: string,
    documentId: string,
    processingStep: string,
    context?: Record<string, any>,
  ) {
    super({
      message,
      code: 'DOCUMENT_ERROR',
      statusCode: 422,
      operation: 'document_processing',
      retryable: true,
      context: { documentId, processingStep, ...context },
    });
    this.name = 'VectorDocumentError';
    this.documentId = documentId;
    this.processingStep = processingStep;
  }
}

/**
 * Create appropriate error from vector operation error
 */
export function createVectorError(
  error: any,
  operation: string,
  context?: Record<string, any>,
): VectorError {
  const message = error?.message || 'Unknown vector error';
  const statusCode = error?.response?.status || error?.statusCode || 500;

  // Map common vector API errors
  if (statusCode === 400 || message.toLowerCase().includes('dimension')) {
    if (context?.expected && context?.actual) {
      return new VectorDimensionError(message, context.expected, context.actual, context);
    }
    return new VectorValidationError(message, context?.field || 'unknown', context?.value, context);
  }

  if (statusCode === 404) {
    if (context?.indexName) {
      return new VectorIndexError(message, context.indexName, context);
    }
    if (context?.namespace) {
      return new VectorNamespaceError(message, context.namespace, context);
    }
  }

  if (statusCode === 429 || message.toLowerCase().includes('quota')) {
    return new VectorQuotaError(
      message,
      context?.quotaType || 'unknown',
      context?.limit || 0,
      context?.current || 0,
      context,
    );
  }

  if (statusCode === 422 || message.toLowerCase().includes('embedding')) {
    return new VectorEmbeddingError(
      message,
      context?.provider || 'unknown',
      context?.model || 'unknown',
      context,
    );
  }

  if (statusCode === 502 || message.toLowerCase().includes('provider')) {
    return new VectorAIProviderError(
      message,
      context?.provider || 'unknown',
      context?.providerCode,
      context,
    );
  }

  if (operation === 'search') {
    return new VectorSearchError(
      message,
      context?.query || [],
      context?.searchType || 'unknown',
      context,
    );
  }

  if (operation === 'upsert') {
    return new VectorUpsertError(message, context?.vectorCount || 0, context?.namespace, context);
  }

  // Default error
  return new VectorError({
    message,
    code: 'VECTOR_ERROR',
    statusCode,
    operation,
    retryable: isRetryableError(statusCode, message),
    context,
    cause: error,
  });
}

/**
 * Check if error is retryable
 */
export function isRetryableError(statusCode: number, message: string): boolean {
  // Server errors are generally retryable
  if (statusCode >= 500) return true;

  // Rate limits are retryable
  if (statusCode === 429) return true;

  // Timeout errors are retryable
  if (message.toLowerCase().includes('timeout')) return true;

  // Connection errors are retryable
  if (message.toLowerCase().includes('connection')) return true;

  // Client errors are generally not retryable
  if (statusCode >= 400 && statusCode < 500) return false;

  return false;
}

/**
 * Vector operation retry configuration
 */
export interface VectorRetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
  retryCondition?: (error: VectorError) => boolean;
}

/**
 * Default retry configuration for vector operations
 */
export const DEFAULT_VECTOR_RETRY_CONFIG: VectorRetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true,
};

/**
 * Retry vector operation with exponential backoff
 */
export async function retryVectorOperation<T>(
  operation: () => Promise<T>,
  config: Partial<VectorRetryConfig> = {},
  context?: Record<string, any>,
): Promise<T> {
  const retryConfig = { ...DEFAULT_VECTOR_RETRY_CONFIG, ...config };
  let lastError: VectorError;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const vectorError =
        error instanceof VectorError ? error : createVectorError(error, 'retry', context);

      lastError = vectorError;

      // Check custom retry condition
      if (retryConfig.retryCondition && !retryConfig.retryCondition(vectorError)) {
        throw vectorError;
      }

      // Don't retry non-retryable errors
      if (!vectorError.retryable) {
        throw vectorError;
      }

      // Don't retry on last attempt
      if (attempt === retryConfig.maxAttempts) {
        throw vectorError;
      }

      // Calculate delay with exponential backoff
      let delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt - 1);
      delay = Math.min(delay, retryConfig.maxDelay);

      // Add jitter to prevent thundering herd
      if (retryConfig.jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      console.warn(
        `Vector operation failed (attempt ${attempt}/${retryConfig.maxAttempts}), retrying in ${delay}ms:`,
        {
          error: vectorError.message,
          code: vectorError.code,
          operation: vectorError.operation,
          context,
        },
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Circuit breaker for vector operations
 */
export class VectorCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt = 0;

  constructor(
    private config: {
      failureThreshold: number;
      timeout: number;
      resetTimeout: number;
    } = {
      failureThreshold: 5,
      timeout: 60000, // Longer timeout for AI operations
      resetTimeout: 120000,
    },
  ) {}

  async execute<T>(operation: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now >= this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new VectorError({
          message: 'Vector circuit breaker is OPEN',
          code: 'CIRCUIT_BREAKER_OPEN',
          operation: 'circuit_breaker',
          retryable: true,
          context: {
            state: this.state,
            failures: this.failures,
            nextAttempt: this.nextAttempt,
            ...context,
          },
        });
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Circuit breaker timeout')), this.config.timeout),
        ),
      ]);

      // Success - reset failure count
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.nextAttempt = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.config.resetTimeout;
    }
  }

  getState(): {
    state: string;
    failures: number;
    nextAttempt: number;
    healthy: boolean;
  } {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.nextAttempt,
      healthy: this.state === 'CLOSED',
    };
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
    this.nextAttempt = 0;
  }
}

/**
 * Error recovery strategies for vector operations
 */
export const vectorErrorRecoveryStrategies = {
  /**
   * Fallback to cached embeddings
   */
  async fallbackToCachedEmbeddings<T>(
    operation: () => Promise<T>,
    cacheKey: string,
    cache: { get: (key: string) => Promise<T | null> },
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof VectorEmbeddingError || error instanceof VectorAIProviderError) {
        const cached = await cache.get(cacheKey);
        if (cached) {
          console.warn('Fallback to cached embeddings for key:', cacheKey);
          return cached;
        }
      }
      throw error;
    }
  },

  /**
   * Degrade search quality
   */
  async degradeSearchQuality<T>(
    primarySearch: () => Promise<T[]>,
    fallbackSearch: () => Promise<T[]>,
    minimumResults = 1,
  ): Promise<T[]> {
    try {
      const results = await primarySearch();
      if (results.length >= minimumResults) {
        return results;
      }

      console.warn('Primary search returned insufficient results, trying fallback');
      return await fallbackSearch();
    } catch (error) {
      console.warn('Primary search failed, using fallback:', error);
      return await fallbackSearch();
    }
  },

  /**
   * Use alternative AI provider
   */
  async useAlternativeProvider<T>(
    providers: Array<{ name: string; operation: () => Promise<T> }>,
    context?: Record<string, any>,
  ): Promise<T> {
    let lastError: VectorError | null = null;

    for (const provider of providers) {
      try {
        console.log(`Trying provider: ${provider.name}`);
        return await provider.operation();
      } catch (error) {
        lastError =
          error instanceof VectorError
            ? error
            : createVectorError(error, 'provider_fallback', {
                ...context,
                provider: provider.name,
              });

        console.warn(`Provider ${provider.name} failed:`, lastError.message);

        // If it's a non-retryable error (like quota), try next provider
        if (!lastError.retryable) {
          continue;
        }

        // For retryable errors, we might want to wait before trying next provider
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw (
      lastError ||
      new VectorError({
        message: 'All providers failed',
        code: 'ALL_PROVIDERS_FAILED',
        operation: 'provider_fallback',
        retryable: false,
        context,
      })
    );
  },

  /**
   * Partial index search
   */
  async partialIndexSearch<T>(
    searchOperations: Array<() => Promise<T[]>>,
    minimumPartialResults = 1,
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: VectorError[] = [];

    const settled = await Promise.allSettled(searchOperations.map(op => op()));

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      } else {
        const error =
          result.reason instanceof VectorError
            ? result.reason
            : createVectorError(result.reason, 'partial_search');
        errors.push(error);
      }
    }

    if (results.length >= minimumPartialResults) {
      if (errors.length > 0) {
        console.warn(
          `Partial search success: ${results.length} results from ${searchOperations.length - errors.length}/${searchOperations.length} indices`,
        );
      }
      return results;
    }

    throw new VectorSearchError(
      `Insufficient partial results: ${results.length} < ${minimumPartialResults}`,
      [],
      'partial',
      {
        resultCount: results.length,
        minimumRequired: minimumPartialResults,
        errorCount: errors.length,
        totalIndices: searchOperations.length,
      },
    );
  },

  /**
   * Chunk size adaptation
   */
  async adaptiveChunking<T>(
    text: string,
    chunkOperation: (text: string, chunkSize: number) => Promise<T>,
    initialChunkSize = 1000,
    minChunkSize = 100,
  ): Promise<T> {
    let currentChunkSize = initialChunkSize;

    while (currentChunkSize >= minChunkSize) {
      try {
        return await chunkOperation(text, currentChunkSize);
      } catch (error) {
        if (error instanceof VectorValidationError || error instanceof VectorQuotaError) {
          console.warn(`Chunk size ${currentChunkSize} failed, trying smaller chunks`);
          currentChunkSize = Math.floor(currentChunkSize / 2);
          continue;
        }
        throw error;
      }
    }

    throw new VectorDocumentError(
      `Failed to process text even with minimum chunk size ${minChunkSize}`,
      'adaptive_chunking',
      'chunk_size_adaptation',
      { originalLength: text.length, minChunkSize },
    );
  },
};

/**
 * Vector operation validator
 */
export const vectorValidator = {
  /**
   * Validate vector dimensions
   */
  validateVectorDimensions(vector: number[], expectedDimensions: number): void {
    if (!Array.isArray(vector)) {
      throw new VectorValidationError('Vector must be an array', 'vector', vector);
    }

    if (vector.length !== expectedDimensions) {
      throw new VectorDimensionError(
        `Vector dimension mismatch: expected ${expectedDimensions}, got ${vector.length}`,
        expectedDimensions,
        vector.length,
      );
    }

    for (let i = 0; i < vector.length; i++) {
      if (typeof vector[i] !== 'number' || !isFinite(vector[i])) {
        throw new VectorValidationError(
          `Invalid vector value at index ${i}: ${vector[i]}`,
          `vector[${i}]`,
          vector[i],
        );
      }
    }
  },

  /**
   * Validate batch size
   */
  validateBatchSize(batchSize: number, maxBatchSize = 100): void {
    if (!Number.isInteger(batchSize) || batchSize <= 0) {
      throw new VectorValidationError(
        'Batch size must be a positive integer',
        'batchSize',
        batchSize,
      );
    }

    if (batchSize > maxBatchSize) {
      throw new VectorValidationError(
        `Batch size ${batchSize} exceeds maximum ${maxBatchSize}`,
        'batchSize',
        batchSize,
      );
    }
  },

  /**
   * Validate search parameters
   */
  validateSearchParams(params: { topK?: number; threshold?: number; namespace?: string }): void {
    if (params.topK !== undefined) {
      if (!Number.isInteger(params.topK) || params.topK <= 0 || params.topK > 1000) {
        throw new VectorValidationError(
          'topK must be a positive integer <= 1000',
          'topK',
          params.topK,
        );
      }
    }

    if (params.threshold !== undefined) {
      if (typeof params.threshold !== 'number' || params.threshold < 0 || params.threshold > 1) {
        throw new VectorValidationError(
          'threshold must be a number between 0 and 1',
          'threshold',
          params.threshold,
        );
      }
    }

    if (params.namespace !== undefined) {
      if (typeof params.namespace !== 'string' || params.namespace.length === 0) {
        throw new VectorValidationError(
          'namespace must be a non-empty string',
          'namespace',
          params.namespace,
        );
      }
    }
  },

  /**
   * Validate text for embedding
   */
  validateTextForEmbedding(text: string, maxLength = 8000): void {
    if (typeof text !== 'string') {
      throw new VectorValidationError('Text must be a string', 'text', text);
    }

    if (text.trim().length === 0) {
      throw new VectorValidationError('Text cannot be empty', 'text', text);
    }

    if (text.length > maxLength) {
      throw new VectorValidationError(
        `Text length ${text.length} exceeds maximum ${maxLength}`,
        'text',
        text.slice(0, 100) + '...',
      );
    }
  },
};
