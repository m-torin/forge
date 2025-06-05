/**
 * Main authentication package exports
 * 
 * This is the primary entry point for the auth package.
 * Use specific imports for better tree-shaking:
 * - '@repo/auth-new/client' for client-side
 * - '@repo/auth-new/server' for server-side
 * - '@repo/auth-new/client-next' for Next.js client
 * - '@repo/auth-new/server-next' for Next.js server
 */

// Re-export types
export * from './shared/types';

// Re-export permissions
export { ac, roles } from './shared/permissions';
export { adminAccessController, adminRoles } from './shared/admin-permissions';

// Components
export * from './components';

// Environment keys
export { keys } from './keys';