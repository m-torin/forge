/**
 * Better Auth client implementation
 */

'use client';

import { createAuthClient } from 'better-auth/client';
import {
  adminClient,
  apiKeyClient,
  organizationClient,
} from 'better-auth/client/plugins';

import { ac, roles } from '../shared/permissions';
import { adminAccessController, adminRoles } from '../shared/admin-permissions';
import { createAuthConfig } from '../shared/config';

const config = createAuthConfig();

/**
 * Better Auth client instance
 */
export const authClient = createAuthClient({
  plugins: [
    // Organization plugin
    ...(config.features.organizations ? [organizationClient({
      ac,
      roles,
      teams: {
        enabled: true,
      },
    })] : []),

    // API Key plugin
    ...(config.features.apiKeys ? [apiKeyClient()] : []),

    // Admin plugin
    ...(config.features.admin ? [adminClient({
      ac: adminAccessController,
      roles: adminRoles,
    })] : []),
  ],
}) as any; // Type assertion for compatibility

// Export the raw client for advanced usage
export default authClient;