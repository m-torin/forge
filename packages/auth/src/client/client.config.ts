/**
 * Better Auth Client Configuration
 */

'use client';

import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import {
  adminClient,
  apiKeyClient,
  organizationClient,
  magicLinkClient,
  twoFactorClient,
} from 'better-auth/client/plugins';
import type { AuthInstance } from '../shared/auth.config';

/**
 * Auth client with proper type inference
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',

  plugins: [
    // Infer additional fields from server
    inferAdditionalFields<AuthInstance>(),

    // Admin functionality
    adminClient(),

    // API Keys
    apiKeyClient(),

    // Organizations
    organizationClient(),

    // Magic Links
    magicLinkClient(),

    // Two Factor
    twoFactorClient(),
  ],
});
