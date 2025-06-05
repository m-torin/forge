/**
 * Admin permissions and access control
 */

import { createAccessControl } from 'better-auth/plugins/access';

// Define admin-specific permissions
const adminStatements = {
  user: ['create', 'read', 'update', 'delete', 'ban', 'unban'],
  organization: ['read', 'update', 'delete'],
  system: ['read', 'update'],
  analytics: ['read'],
  billing: ['read', 'update'],
} as const;

// Create admin access controller
export const adminAccessController = createAccessControl(adminStatements);

// Define admin roles
export const superAdmin = adminAccessController.newRole({
  user: ['create', 'read', 'update', 'delete', 'ban', 'unban'],
  organization: ['read', 'update', 'delete'],
  system: ['read', 'update'],
  analytics: ['read'],
  billing: ['read', 'update'],
});

export const moderator = adminAccessController.newRole({
  user: ['read', 'update', 'ban', 'unban'],
  organization: ['read'],
  system: ['read'],
  analytics: ['read'],
  billing: [],
});

export const support = adminAccessController.newRole({
  user: ['read'],
  organization: ['read'],
  system: ['read'],
  analytics: ['read'],
  billing: ['read'],
});

export const adminRoles = {
  'super-admin': superAdmin,
  'admin': superAdmin, // Alias for super-admin
  'moderator': moderator,
  'support': support,
} as const;