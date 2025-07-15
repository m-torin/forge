/**
 * Server-side API key exports
 */

// Export validation functions - avoid duplicate validateApiKey by using explicit exports
export {
  requireAuth as apiKeyRequireAuth,
  extractApiKeyFromHeaders,
  hasPermissionForRequest,
  validateApiKey as validateApiKeyWithHeaders,
  validateApiKeyWithRateLimit,
} from './validation';

export * from './service-auth';

// Export actions - the validateApiKey here takes precedence
export * from './actions';
