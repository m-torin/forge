/**
 * Server-side API key exports
 */

// Export validation functions - avoid duplicate validateApiKey by using explicit exports
export {
  validateApiKey as validateApiKeyWithHeaders,
  requireAuth as apiKeyRequireAuth,
  hasPermissionForRequest,
  validateApiKeyWithRateLimit,
  extractApiKeyFromHeaders,
} from './validation';

export * from './service-auth';

// Export actions - the validateApiKey here takes precedence
export * from './actions';
