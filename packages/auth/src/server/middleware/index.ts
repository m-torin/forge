/**
 * Authentication middleware - unified exports
 */

// Re-export all middleware variants
export { apiMiddleware, createApiMiddleware } from './api';
export { createNodeMiddleware, nodeMiddleware } from './node';
export { createWebMiddleware, webMiddleware } from './web';
export {
  createAdvancedMiddleware,
  createCombinedMiddleware,
  createSmartMiddleware,
} from './factory';

// Legacy exports for backward compatibility
export { createWebMiddleware as createAuthMiddleware } from './web';
export { webMiddleware as authMiddleware } from './web';

// Type exports
export type { MiddlewareOptions } from '../../shared/types';
export type { AdvancedMiddlewareOptions } from './factory';
