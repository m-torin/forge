// timeout/index.ts

import { createTimeoutMiddleware } from './middleware';

export * from './types';
export { createTimeoutMiddleware } from './middleware';

// Optional: Provide a default configured middleware
export const timeoutMiddleware = createTimeoutMiddleware();
