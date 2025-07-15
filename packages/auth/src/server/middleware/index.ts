/**
 * Authentication middleware - unified exports
 */

// Re-export all middleware variants
export { apiMiddleware, createApiMiddleware } from './api';
export {
  createAdvancedMiddleware,
  createCombinedMiddleware,
  createSmartMiddleware,
} from './factory';
export { createNodeMiddleware, nodeMiddleware } from './node';
export { createWebMiddleware, webMiddleware } from './web';

// Legacy exports for backward compatibility
export {
  webMiddleware as authMiddleware,
  createWebMiddleware as createAuthMiddleware,
} from './web';

// Type exports
export type { MiddlewareOptions } from '../../shared/types';
export type { AdvancedMiddlewareOptions } from './factory';
