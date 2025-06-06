import { type CircuitBreaker, circuitBreakerRegistry } from './circuit-breaker'

export interface RetryConfig {
  backoffMultiplier: number // Exponential backoff multiplier
  baseDelay: number         // Base delay in ms
  circuitBreakerName?: string
  jitter: boolean           // Add random jitter to prevent thundering herd
  maxAttempts: number
  maxDelay: number          // Maximum delay in ms
  onRetry?: (attempt: number, error: any, delay: number) => void
  retryCondition?: (error: any) => boolean
}

export interface RetryResult<T> {
  attempts: number
  errors: any[]
  result: T
  totalTime: number
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly isRetryable = true,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'RetryableError'
  }
}

export class RetryManager {
  private static defaultConfig: RetryConfig = {
    backoffMultiplier: 2,
    baseDelay: 1000,
    jitter: true,
    maxAttempts: 3,
    maxDelay: 30000,
    retryCondition: (error: any) => {
      // Default: retry on network errors, timeouts, and 5xx status codes
      if (error instanceof RetryableError) {
        return error.isRetryable
      }
      
      if (error.code === 'ECONNRESET' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNREFUSED') {
        return true
      }

      if (error.status >= 500 && error.status < 600) {
        return true
      }

      return false
    }
  }

  static async execute<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const finalConfig: RetryConfig = { ...this.defaultConfig, ...config }
    const errors: any[] = []
    const startTime = Date.now()

    // Get circuit breaker if specified
    let circuitBreaker: CircuitBreaker | undefined
    if (finalConfig.circuitBreakerName) {
      circuitBreaker = circuitBreakerRegistry.get(finalConfig.circuitBreakerName)
    }

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        let result: T

        if (circuitBreaker) {
          result = await circuitBreaker.execute(operation)
        } else {
          result = await operation()
        }

        return {
          attempts: attempt,
          errors,
          result,
          totalTime: Date.now() - startTime
        }
      } catch (error) {
        errors.push(error)

        // Check if error is retryable
        const isRetryable = finalConfig.retryCondition!(error)
        
        if (!isRetryable || attempt === finalConfig.maxAttempts) {
          throw new RetryableError(
            `Operation failed after ${attempt} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
            false,
            error instanceof Error ? error : new Error(String(error))
          )
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, finalConfig)
        
        // Call retry callback if provided
        if (finalConfig.onRetry) {
          finalConfig.onRetry(attempt, error, delay)
        }

        console.warn(`Retry attempt ${attempt} failed, retrying in ${delay}ms:`, error instanceof Error ? error.message : error)

        // Wait before next attempt
        await this.delay(delay)
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error('Retry logic error: exceeded max attempts without resolution')
  }

  private static calculateDelay(attempt: number, config: RetryConfig): number {
    // Calculate exponential backoff
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1)
    
    // Apply maximum delay limit
    delay = Math.min(delay, config.maxDelay)
    
    // Add jitter to prevent thundering herd
    if (config.jitter) {
      const jitterAmount = delay * 0.1 // 10% jitter
      delay += (Math.random() * 2 - 1) * jitterAmount
    }
    
    return Math.round(Math.max(delay, 0))
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Predefined retry strategies
  static readonly strategies = {
    // Quick retry for fast operations
    quick: {
      backoffMultiplier: 2,
      baseDelay: 100,
      jitter: true,
      maxAttempts: 3,
      maxDelay: 1000
    },

    // Standard retry for most operations
    standard: {
      backoffMultiplier: 2,
      baseDelay: 1000,
      jitter: true,
      maxAttempts: 5,
      maxDelay: 10000
    },

    // Conservative retry for expensive operations
    conservative: {
      backoffMultiplier: 2.5,
      baseDelay: 2000,
      jitter: true,
      maxAttempts: 3,
      maxDelay: 30000
    },

    // Aggressive retry for critical operations
    aggressive: {
      backoffMultiplier: 1.5,
      baseDelay: 500,
      jitter: true,
      maxAttempts: 10,
      maxDelay: 60000
    },

    // Linear backoff
    linear: {
      backoffMultiplier: 1, // Linear (no exponential growth)
      baseDelay: 1000,
      jitter: false,
      maxAttempts: 5,
      maxDelay: 5000
    }
  }

  // Utility methods for common retry patterns
  static async withQuickRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.execute(operation, this.strategies.quick)
    return result.result
  }

  static async withStandardRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.execute(operation, this.strategies.standard)
    return result.result
  }

  static async withConservativeRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.execute(operation, this.strategies.conservative)
    return result.result
  }

  static async withAggressiveRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.execute(operation, this.strategies.aggressive)
    return result.result
  }

  static async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    circuitBreakerName: string,
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<T> {
    const result = await this.execute(operation, {
      ...this.strategies.standard,
      ...retryConfig,
      circuitBreakerName
    })
    return result.result
  }

  // HTTP-specific retry conditions
  static httpRetryCondition(error: any): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (error.status >= 400 && error.status < 500) {
      // Retry on rate limiting and request timeout
      return error.status === 429 || error.status === 408
    }

    // Retry on server errors (5xx)
    if (error.status >= 500 && error.status < 600) {
      return true
    }

    // Retry on network errors
    return this.defaultConfig.retryCondition!(error)
  }

  // Database-specific retry conditions
  static databaseRetryCondition(error: any): boolean {
    // Common database error codes that are retryable
    const retryableErrorCodes = [
      'ECONNRESET',
      'ECONNREFUSED', 
      'ETIMEDOUT',
      'PROTOCOL_CONNECTION_LOST',
      'ER_LOCK_WAIT_TIMEOUT',
      'ER_LOCK_DEADLOCK'
    ]

    if (retryableErrorCodes.includes(error.code)) {
      return true
    }

    return false
  }

  // File system specific retry conditions
  static fileSystemRetryCondition(error: any): boolean {
    const retryableErrorCodes = [
      'ENOENT',    // File not found (might be temporary)
      'EACCES',    // Permission denied (might be temporary)
      'EMFILE',    // Too many open files
      'EAGAIN',    // Resource temporarily unavailable
      'EBUSY'      // Resource busy
    ]

    return retryableErrorCodes.includes(error.code)
  }
}

// Decorator for easy retry application
export function Retryable(config?: Partial<RetryConfig>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await RetryManager.execute(
        () => method.apply(this, args),
        config
      )
      return result.result
    }

    return descriptor
  }
}

// Examples of specialized retry managers
export class HttpRetryManager {
  static async get<T>(url: string, options: any = {}): Promise<T> {
    return RetryManager.withStandardRetry(async () => {
      const response = await fetch(url, options)
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        ;(error as any).status = response.status
        throw error
      }
      return response.json()
    })
  }

  static async post<T>(url: string, data: any, options: any = {}): Promise<T> {
    return RetryManager.execute(async () => {
      const response = await fetch(url, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        method: 'POST',
        ...options
      })
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        ;(error as any).status = response.status
        throw error
      }
      
      return response.json()
    }, {
      ...RetryManager.strategies.standard,
      retryCondition: RetryManager.httpRetryCondition
    }).then(result => result.result)
  }
}

export class DatabaseRetryManager {
  static async query<T>(queryFn: () => Promise<T>): Promise<T> {
    const result = await RetryManager.execute(queryFn, {
      ...RetryManager.strategies.conservative,
      onRetry: (attempt, error, delay) => {
        console.warn(`Database query failed (attempt ${attempt}), retrying in ${delay}ms:`, error.message)
      },
      retryCondition: RetryManager.databaseRetryCondition
    })
    return result.result
  }
}

export class FileSystemRetryManager {
  static async readFile(filePath: string): Promise<string> {
    const fs = await import('fs/promises')
    
    const result = await RetryManager.execute(
      () => fs.readFile(filePath, 'utf-8'),
      {
        ...RetryManager.strategies.quick,
        retryCondition: RetryManager.fileSystemRetryCondition
      }
    )
    return result.result
  }

  static async writeFile(filePath: string, data: string): Promise<void> {
    const fs = await import('fs/promises')
    
    const result = await RetryManager.execute(
      () => fs.writeFile(filePath, data, 'utf-8'),
      {
        ...RetryManager.strategies.quick,
        retryCondition: RetryManager.fileSystemRetryCondition
      }
    )
    return result.result
  }
}