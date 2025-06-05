/**
 * Client-side authentication exports
 */

// Core client and hooks
export { authClient as default } from './auth-client';
export { useAuth, useSession, useUser, useOrganization } from './hooks';

// Authentication methods
export * from './methods';

// Types
export * from '../shared/types';