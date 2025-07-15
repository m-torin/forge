/**
 * Auth helpers for server
 */

import { NextResponse } from 'next/server';
import 'server-only';
import { auth } from '../shared/auth';

interface AuthHelpersConfig {
  serviceEmail?: string;
  serviceName?: string;
}

export function createAuthHelpers(config: AuthHelpersConfig = {}) {
  const { serviceEmail = 'service@system', serviceName = 'Service Account' } = config;

  async function requireAuth(request: Request) {
    const providedApiKey = request.headers.get('x-api-key');

    // Check service API key
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

    // Check user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Please authenticate',
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
    const providedApiKey = request.headers.get('x-api-key');

    // Check service API key
    if (providedApiKey && process.env.SERVICE_API_KEY === providedApiKey) {
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

    // Check user session (optional)
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session;
  }

  return {
    requireAuth,
    getOptionalAuth,
  };
}
