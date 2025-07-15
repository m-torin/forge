/**
 * Organization permissions and access control
 */

import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from 'better-auth/plugins/organization/access';

// Define custom permissions for our application
const customStatements = {
  billing: ['view', 'manage'],
  project: ['create', 'share', 'update', 'delete'],
  settings: ['view', 'update'],
} as const;

// Merge default organization statements with our custom ones
const statements = {
  ...defaultStatements,
  ...customStatements,
} as const;

// Create access controller
export const ac = createAccessControl(statements);

// Define roles with their permissions
export const owner = ac.newRole({
  ...ownerAc.statements, // Inherit all owner permissions
  billing: ['view', 'manage'],
  project: ['create', 'share', 'update', 'delete'],
  settings: ['view', 'update'],
});

export const admin = ac.newRole({
  ...adminAc.statements, // Inherit all admin permissions
  billing: ['view'], // Can only view billing, not manage
  project: ['create', 'share', 'update'], // No delete permission
  settings: ['view', 'update'],
});

export const member = ac.newRole({
  ...memberAc.statements, // Inherit all member permissions
  billing: [], // No billing access
  project: ['create'], // Can only create projects
  settings: ['view'], // Can only view settings
});

// Export all roles for use in configuration
export const roles = {
  admin,
  member,
  owner,
} as const;
