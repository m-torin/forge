import { createAuthHelpers } from '@repo/auth-new/server';

// Create auth helpers with backstage-specific configuration
const { getOptionalAuth, requireAuth } = createAuthHelpers({
  serviceEmail: 'service@backstage.system',
  serviceName: 'Backstage Service Account',
});

export { getOptionalAuth, requireAuth };
