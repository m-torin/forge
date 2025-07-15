// timeout/types.ts
import type {
  MiddlewareContext,
  MiddlewareResult,
  MiddlewareOptions,
} from '../base';

export interface TimeoutOptions extends MiddlewareOptions {
  timeout?: number; // Timeout in milliseconds
  onTimeout?: (context: TimeoutContext) => Promise<void>; // Optional timeout handler
  [key: string]: unknown; // Index signature to match MiddlewareOptions
}

export interface TimeoutContext extends MiddlewareContext {
  timeoutMs: number;
  timeoutHandler?: (error: Error) => void;
}

export interface TimeoutResult extends MiddlewareResult {
  timedOut?: boolean;
  timeoutMs?: number;
}
