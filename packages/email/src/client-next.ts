/**
 * Next.js client-side email exports
 *
 * Note: Email functionality is server-only. This file exports only types
 * and templates that can be safely imported in Next.js client components.
 */

'use client';

// Export template components for preview/development
export {
  ApiKeyCreatedTemplate,
  ContactTemplate,
  MagicLinkTemplate,
  OrganizationInvitationTemplate,
  PasswordResetTemplate,
  VerificationTemplate,
  WelcomeTemplate,
} from './index';

// Note: Email sending functions are not available in client-side code.
// Use server actions or API routes to send emails from the client.
