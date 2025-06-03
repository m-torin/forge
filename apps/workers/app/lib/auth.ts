import { createAuthHelpers } from '@repo/auth/server-utils';

// Create auth helpers with workers-specific configuration
const { getOptionalAuth, requireAuth } = createAuthHelpers({
  serviceEmail: 'service@workers.system',
  serviceName: 'Workers Service Account',
});

export { getOptionalAuth, requireAuth };
