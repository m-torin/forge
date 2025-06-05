import { createAuthHelpers } from "@repo/auth-new/server";

// Create auth helpers with web-specific configuration
const { getOptionalAuth, requireAuth } = createAuthHelpers({
  serviceEmail: "service@web.system",
  serviceName: "Web Service Account",
});

export { getOptionalAuth, requireAuth };
