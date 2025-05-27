export * from './server';
export * from './keys';
export * from './helpers';
export * from './organization-helpers';

// Export middleware
export { authMiddleware } from './middleware';
export { nodeAuthMiddleware } from './middleware.node';
export { apiAuthMiddleware, createAuthMiddleware } from './middleware-api';

// Export Better Auth types
export type { Session, User } from 'better-auth';

// Export organization types from our database
export type { Invitation, Member, Organization, Team } from '@repo/database';

// Export API key types from our database
export type { ApiKey } from '@repo/database';

// Export permissions and access control
export { ac, roles } from './permissions';

// Export API key helpers
export { hasPermission, requireAuth, validateApiKey } from './api-key-helpers';

// Export server actions
export * from './actions';
