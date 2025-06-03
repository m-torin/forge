import { createAuthHelpers } from "@repo/auth/server-utils";

// Create auth helpers with web-specific configuration
const { getOptionalAuth, requireAuth } = createAuthHelpers({
  serviceEmail: "service@web.system",
  serviceName: "Web Service Account",
});

export { getOptionalAuth, requireAuth };
