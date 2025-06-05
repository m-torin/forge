/**
 * Server-side authentication exports
 */

export { auth, getCurrentUser, getSession } from './auth';
export * from './actions';
export * from './utils';

// Server-side API key functionality
export * from './api-keys';

// Server-side team functionality
export * from './teams';

// Server-side organization functionality
export * from './organizations';

// Types and permissions
export * from '../shared/types';
export * from '../shared/permissions';
export * from '../shared/admin-permissions';

// Configuration
export { createAuthConfig } from '../shared/config';

// Note: For client-side functionality, use:
// - '@repo/auth/client' for client utilities
// - '@repo/auth/api-keys/client' for client API key management
// - '@repo/auth/teams/client' for client team management
// - '@repo/auth/middleware' for middleware variants
