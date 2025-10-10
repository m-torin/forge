/**
 * Middleware composition utilities
 *
 * Compose multiple middleware functions into a single execution chain
 * Supports priority ordering, conditional execution, and error handling
 */

type MiddlewareFunction<TRequest = any, TResponse = any> = (
  request: TRequest,
  next: (request: TRequest) => Promise<TResponse>,
) => Promise<TResponse>;

interface MiddlewareOptions {
  name?: string;
  priority?: number;
  condition?: (request: any) => boolean;
}

const composeMiddleware = <TRequest, TResponse>(
  ...middlewares: Array<
    | MiddlewareFunction<TRequest, TResponse>
    | [MiddlewareFunction<TRequest, TResponse>, MiddlewareOptions]
  >
) => {
  // Normalize middleware entries and sort by priority
  const normalizedMiddlewares = middlewares.map(middleware => {
    if (Array.isArray(middleware)) {
      const [fn, options] = middleware;
      return { fn, options: { priority: 0, ...options } };
    }
    return { fn: middleware, options: { priority: 0 } };
  });

  // Sort by priority (higher priority runs first)
  normalizedMiddlewares.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));

  return (finalHandler: (request: TRequest) => Promise<TResponse>) => {
    return async (request: TRequest): Promise<TResponse> => {
      // Build the middleware chain from right to left
      let index = -1;

      const dispatch = async (i: number, currentRequest: TRequest): Promise<TResponse> => {
        if (i <= index) {
          throw new Error('next() called multiple times');
        }
        index = i;

        // If we've reached the end, call the final handler
        if (i === normalizedMiddlewares.length) {
          return finalHandler(currentRequest);
        }

        const middlewareItem = normalizedMiddlewares[i];

        // Check condition if provided
        if (middlewareItem.options.condition && !middlewareItem.options.condition(currentRequest)) {
          return dispatch(i + 1, currentRequest);
        }

        return await middlewareItem.fn(currentRequest, async (nextRequest: TRequest) => {
          return dispatch(i + 1, nextRequest);
        });
      };

      return dispatch(0, request);
    };
  };
};

// Export alias for index.ts
export const compose = composeMiddleware;
