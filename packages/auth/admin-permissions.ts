import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements as adminStatements } from 'better-auth/plugins/admin/access';
import { defaultStatements as orgStatements } from 'better-auth/plugins/organization/access';

// Define custom permissions for our application
const customStatements = {
  analytics: ['view', 'export'],
  billing: ['view', 'manage'],
  project: ['create', 'share', 'update', 'delete'],
  settings: ['view', 'update'],
  support: ['view', 'respond', 'close'],
} as const;

// Merge all statements
const statements = {
  ...orgStatements,
  ...adminStatements,
  ...customStatements,
} as const;

// Create access controller
export const adminAccessController = createAccessControl(statements);

// Define admin roles
export const superAdmin = adminAccessController.newRole({
  ...adminAc.statements, // Full admin access
  analytics: ['view', 'export'],
  billing: ['view', 'manage'],
  organization: ['update', 'delete'], // Use only available actions
  project: ['create', 'share', 'update', 'delete'],
  session: ['list', 'revoke', 'delete'],
  settings: ['view', 'update'],
  support: ['view', 'respond', 'close'],
  user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password'],
});

export const moderator = adminAccessController.newRole({
  project: ['create', 'update'], // Can create and update projects
  session: ['list', 'revoke'], // Can revoke sessions
  support: ['view', 'respond'], // Can handle support tickets
  user: ['list', 'ban'], // Can only list and ban users
});

export const support = adminAccessController.newRole({
  organization: ['update'], // Read-only access to organizations
  session: ['list'], // Can only list sessions
  support: ['view', 'respond', 'close'], // Full support access
  user: ['list'], // Can only list users
});

// Regular user roles (non-admin)
export const regularUser = adminAccessController.newRole({
  project: ['create'], // Can only create their own projects
  settings: ['view'], // Can only view settings
});

// Export all admin roles
export const adminRoles = {
  admin: superAdmin, // Map 'admin' to superAdmin for compatibility
  moderator,
  'super-admin': superAdmin,
  support,
  user: regularUser,
} as const;
