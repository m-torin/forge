// middleware/backpressure/index.ts

import { createBackpressureMiddleware } from './middleware';

export type {
  BackpressureOptions,
  QueueMetrics,
  BackpressureMetadata,
  Queue,
} from './types';

export { createBackpressureMiddleware } from './middleware';
export { QueueFullError } from './types';

// Optional: Export a pre-configured middleware
export const backpressureMiddleware = createBackpressureMiddleware();
