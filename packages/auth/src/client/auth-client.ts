/**
 * Better Auth client implementation
 */

'use client';

import { createAuthClient } from 'better-auth/client';
import { adminClient, apiKeyClient, organizationClient } from 'better-auth/client/plugins';

import { adminAccessController, adminRoles } from '../shared/admin-permissions';
import { createAuthConfig } from '../shared/config';
import { ac, roles } from '../shared/permissions';

const config = createAuthConfig();

/**
 * Better Auth client instance
 */
export const authClient = createAuthClient({
  plugins: [
    // Organization plugin
    ...(config.features.organizations
      ? [
          organizationClient({
            ac,
            roles,
            teams: {
              enabled: config.features.teams,
            },
          }),
        ]
      : []),

    // API Key plugin
    ...(config.features.apiKeys ? [apiKeyClient()] : []),

    // Admin plugin
    ...(config.features.admin
      ? [
          adminClient({
            ac: adminAccessController,
            enableImpersonation: config.features.impersonation,
            roles: adminRoles,
          }),
        ]
      : []),
  ],
}) as any; // Type assertion for compatibility

// Export the raw client for advanced usage
export default authClient;
