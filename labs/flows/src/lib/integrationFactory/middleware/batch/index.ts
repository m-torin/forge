// middleware/batch/index.ts
import { createBatchMiddleware } from './middleware';

export * from './types';
export { createBatchMiddleware } from './middleware';

// Optional: Export configured middleware with default options
export const batchMiddleware = createBatchMiddleware();
