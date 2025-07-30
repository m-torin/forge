// retry/index.ts

import { createRetryMiddleware } from './middleware';

export type { RetryOptions, RetryState, RetryMetadata } from './types';
export { createRetryMiddleware } from './middleware';

// Convenience export with default options
export const retryMiddleware = createRetryMiddleware();
