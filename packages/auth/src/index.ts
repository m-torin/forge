/**
 * Main authentication package exports
 *
 * This is the primary entry point for the auth package.
 * Use specific imports for better tree-shaking:
 * - '@repo/auth/client' for client-side
 * - '@repo/auth/server' for server-side
 * - '@repo/auth/client-next' for Next.js client
 * - '@repo/auth/server-next' for Next.js server
 * - '@repo/auth/middleware' for middleware variants
 * - '@repo/auth/api-keys' for API key management
 * - '@repo/auth/teams' for team management
 * - '@repo/auth/organizations' for organization helpers
 * - '@repo/auth/testing' for testing utilities
 */

// Re-export types
export * from './shared/types';

// Re-export permissions
export { ac, roles } from './shared/permissions';
export { adminAccessController, adminRoles } from './shared/admin-permissions';

// Components
export * from './components';

// Configuration
export { createAuthConfig } from './shared/config';

// Environment keys
export { keys } from './keys';

// Conditional exports for runtime environments
export { createAuthMiddleware } from './middleware';

// Note: For specific features, use dedicated imports:
// - API Keys: import from '@repo/auth/api-keys'
// - Teams: import from '@repo/auth/teams'
// - Organizations: import from '@repo/auth/organizations'
// - Testing: import from '@repo/auth/testing'
