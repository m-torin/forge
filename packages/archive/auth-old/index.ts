export * from './client';
export * from './keys';

// Export Better Auth types
export type { Session, User } from 'better-auth';

// Export organization types from our database
export type { Invitation, Member, Organization, Team } from '@repo/database/prisma';

// Export API key types from our database
export type { ApiKey } from '@repo/database/prisma';

// Export permissions and access control
export { ac, roles } from './permissions';

// Export client-side API key helpers only
export { hasPermission } from './api-key-client';

// Server-only exports have been moved to index.server.ts
// Client components should import from '@repo/auth'
// Server components should import from '@repo/auth/index.server'
