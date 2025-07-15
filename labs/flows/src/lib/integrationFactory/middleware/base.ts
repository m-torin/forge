// middleware/base.ts

/**
 * Core middleware context available to all middleware
 */
export interface MiddlewareContext {
  operation: string;
  startTime: number;
  metadata: Record<string, unknown>;
  signal?: AbortSignal;
}

/**
 * Standard result type for middleware operations
 */
export interface MiddlewareResult<T = unknown> {
  data?: T;
  error?: Error;
  metadata: Record<string, unknown>;
  duration: number;
}

/**
 * Function to call next middleware in chain
 */
export type NextFunction = () => Promise<MiddlewareResult>;

/**
 * Core middleware function type
 */
export type Middleware = (
  context: MiddlewareContext,
  next: NextFunction,
) => Promise<MiddlewareResult>;

/**
 * Configuration options available to all middleware
 */
export interface MiddlewareOptions {
  enabled?: boolean;
  order?: number;
  [key: string]: unknown;
}

/**
 * Base middleware class that can be extended
 */
export abstract class BaseMiddleware {
  constructor(protected readonly options: MiddlewareOptions = {}) {}

  abstract execute(
    context: MiddlewareContext,
    next: NextFunction,
  ): Promise<MiddlewareResult>;

  isEnabled(): boolean {
    return this.options.enabled !== false;
  }

  getOrder(): number {
    return this.options.order ?? 0;
  }
}

/**
 * Utility to compose multiple middleware into a chain
 */
export const composeMiddleware = (middlewares: Middleware[]): Middleware => {
  return async (context: MiddlewareContext, finalNext: NextFunction) => {
    let index = -1;

    const executeMiddleware = async (
      currentIndex: number,
    ): Promise<MiddlewareResult> => {
      if (currentIndex <= index) {
        throw new Error('next() called multiple times');
      }

      index = currentIndex;

      const middleware = middlewares[currentIndex];

      if (!middleware) {
        return finalNext();
      }

      return middleware(context, () => executeMiddleware(currentIndex + 1));
    };

    return executeMiddleware(0);
  };
};

/**
 * Create middleware with standard error handling
 */
export const createMiddleware = (
  handler: Middleware,
  options: MiddlewareOptions = {},
): Middleware => {
  return async (context, next) => {
    if (options.enabled === false) {
      return next();
    }

    try {
      return await handler(context, next);
    } catch (error) {
      return {
        error: error as Error,
        metadata: context.metadata,
        duration: Date.now() - context.startTime,
      };
    }
  };
};
