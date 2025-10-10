/**
 * Authentication and user management fragments
 * Comprehensive fragments for auth-related models
 */

// User fragments
export * from './user';

// Organization fragments
export * from './organization';

// Re-export common patterns for easy access

// Type exports
export type {
  // Organization types
  OrganizationBasicResult,
  OrganizationCompleteResult,
  OrganizationCompleteWithRelationsResult,
  OrganizationComprehensiveResult,
  OrganizationWithInvitationsResult,
  OrganizationWithMembersResult,
  OrganizationWithSessionsResult,
} from './organization';

export type {
  // User types
  UserBasicResult,
  UserCompleteResult,
  UserCompleteWithRelationsResult,
  UserComprehensiveResult,
  UserWithAccountsResult,
  UserWithContentResult,
  UserWithFavoritesResult,
  UserWithMediaResult,
  UserWithOrganizationsResult,
  UserWithSessionsResult,
} from './user';
