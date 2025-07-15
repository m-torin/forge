/**
 * Authentication Analytics Event Constants
 *
 * Shared constants for auth-related analytics events
 */

// Auth analytics events
export const AuthAnalyticsEvents = {
  LOGIN_ATTEMPT: 'Login Attempt',
  LOGIN_SUCCESS: 'Login Success',
  LOGIN_FAILED: 'Login Failed',
  LOGOUT: 'User Logout',
  PROFILE_VIEW: 'Profile Page Viewed',
  PROTECTED_ACCESS: 'Protected Feature Access',
  SESSION_EXTENDED: 'Session Extended',
  FEATURE_FLAG_AUTH_EVALUATED: 'Auth Feature Flag Evaluated',
  ROLE_BASED_FEATURE_USED: 'Role-Based Feature Used',
  AUTH_FLOW_COMPLETED: 'Authentication Flow Completed',
  PERSONALIZED_CONTENT_VIEWED: 'Personalized Content Viewed',
  PREMIUM_FEATURE_PREVIEWED: 'Premium Feature Previewed',
} as const;
