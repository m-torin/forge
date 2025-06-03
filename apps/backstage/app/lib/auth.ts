import { createAuthHelpers } from '@repo/auth/server-utils';

// Create auth helpers with backstage-specific configuration
const { getOptionalAuth, requireAuth } = createAuthHelpers({
  serviceEmail: 'service@backstage.system',
  serviceName: 'Backstage Service Account',
});

export { getOptionalAuth, requireAuth };
