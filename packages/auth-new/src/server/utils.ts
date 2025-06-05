import 'server-only';
import { NextResponse } from 'next/server';

import { auth } from './auth';

interface AuthHelpersConfig {
  serviceEmail?: string;
  serviceName?: string;
}

export function createAuthHelpers(config: AuthHelpersConfig = {}) {
  const { serviceEmail = 'service@system', serviceName = 'Service Account' } = config;

  async function requireAuth(request: Request) {
    // Check for service API key first (for service-to-service auth)
    const providedApiKey = request.headers.get('x-api-key');

    if (providedApiKey && process.env.SERVICE_API_KEY) {
      if (providedApiKey === process.env.SERVICE_API_KEY) {
        return {
          session: {
            id: 'service-session',
            activeOrganizationId: 'system',
            userId: 'service',
          },
          user: {
            id: 'service',
            name: serviceName,
            email: serviceEmail,
          },
        };
      }
    }

    // Otherwise, check for user session or user API key
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message:
            'Please provide a valid API key via x-api-key header or authenticate via session',
        },
        {
          headers: {
            'WWW-Authenticate': 'Bearer realm="api", charset="UTF-8"',
          },
          status: 401,
        },
      );
    }

    return session;
  }

  async function getOptionalAuth(request: Request) {
    // Check for service API key first
    const providedApiKey = request.headers.get('x-api-key');

    if (providedApiKey && process.env.SERVICE_API_KEY) {
      if (providedApiKey === process.env.SERVICE_API_KEY) {
        return {
          session: {
            id: 'service-session',
            activeOrganizationId: 'system',
            userId: 'service',
          },
          user: {
            id: 'service',
            name: serviceName,
            email: serviceEmail,
          },
        };
      }
    }

    // Otherwise, check for user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session;
  }

  return {
    getOptionalAuth,
    requireAuth,
  };
}

// Export convenience functions for auth middleware creation
export { createAuthMiddleware } from 'better-auth/api';