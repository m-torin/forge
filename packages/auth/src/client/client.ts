/**
 * Better Auth Client Configuration
 */

'use client';

import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  oneTapClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { AuthInstance } from '../shared/auth';

/**
 * Base Auth client configuration for non-Next.js environments
 * Uses static plugin configuration for proper TypeScript inference
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [
    // Always include field inference for server compatibility
    inferAdditionalFields<AuthInstance>(),

    // Core plugins - always included for type safety and consistency
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
  ],
});
