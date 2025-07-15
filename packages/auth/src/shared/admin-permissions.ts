/**
 * Admin permissions and access control
 */

import { createAccessControl } from 'better-auth/plugins/access';

// Define admin-specific permissions
const adminStatements = {
  analytics: ['read'],
  billing: ['read', 'update'],
  organization: ['read', 'update', 'delete'],
  system: ['read', 'update'],
  user: ['create', 'read', 'update', 'delete', 'ban', 'unban'],
} as const;

// Create admin access controller
export const adminAccessController = createAccessControl(adminStatements);

// Define admin roles
export const superAdmin = adminAccessController.newRole({
  analytics: ['read'],
  billing: ['read', 'update'],
  organization: ['read', 'update', 'delete'],
  system: ['read', 'update'],
  user: ['create', 'read', 'update', 'delete', 'ban', 'unban'],
});

export const moderator = adminAccessController.newRole({
  analytics: ['read'],
  billing: [],
  organization: ['read'],
  system: ['read'],
  user: ['read', 'update', 'ban', 'unban'],
});

export const support = adminAccessController.newRole({
  analytics: ['read'],
  billing: ['read'],
  organization: ['read'],
  system: ['read'],
  user: ['read'],
});

export const adminRoles = {
  admin: superAdmin, // Alias for super-admin
  moderator: moderator,
  'super-admin': superAdmin,
  support: support,
} as const;
