/**
 * Better Auth Client Configuration for Next.js
 */

'use client';

import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  emailOTPClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  oneTapClient,
  organizationClient,
  passkeyClient,
  phoneNumberClient,
  twoFactorClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { AuthInstance } from '../shared/auth';

/**
 * Next.js Auth client with proper type inference and static plugin configuration
 * Configured with all plugins for comprehensive authentication functionality
 * @returns Better Auth client instance optimized for Next.js
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [
    // Always include field inference for server compatibility
    inferAdditionalFields<AuthInstance>(),

    // Core plugins - always included for type safety
    organizationClient(),
    twoFactorClient(),
    adminClient(),
    apiKeyClient(),
    passkeyClient(),
    magicLinkClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    }),

    // New authentication plugins
    anonymousClient(),
    phoneNumberClient(),
    emailOTPClient(),
  ],
});
