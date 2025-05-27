import 'server-only';
import { headers } from 'next/headers';
import { type NextRequest } from 'next/server';

import { auth } from './server';

interface ApiKeyValidationResult {
  error?: string;
  key?: any;
  session?: any;
  valid: boolean;
}

type PermissionCheck = Record<string, string[]>;

/**
 * Validates an API key from request headers and optionally checks permissions
 * @param request The Next.js request object or headers
 * @param permissions Optional permissions to check (e.g., { read: ['user'], write: ['organization'] })
 * @returns Validation result with session info if valid
 */
export async function validateApiKey(
  request: NextRequest | Headers,
  permissions?: PermissionCheck,
): Promise<ApiKeyValidationResult> {
  try {
    // Get headers from request or use directly
    const requestHeaders = request instanceof Headers ? request : request.headers;

    // Check for API key in headers
    const apiKey = requestHeaders.get('x-api-key');

    if (!apiKey) {
      return {
        valid: false,
        error: 'No API key provided',
      };
    }

    // Verify the API key
    const verifyOptions: any = { body: { key: apiKey } };

    if (permissions) {
      verifyOptions.body.permissions = permissions;
    }

    const result = await auth.api.verifyApiKey(verifyOptions);

    if (!result.valid) {
      return {
        valid: false,
        error: result.error?.message || 'Invalid API key',
      };
    }

    // Get session for the API key's user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return {
      valid: true,
      key: result.key,
      session,
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate API key',
    };
  }
}

/**
 * Ensures the request has valid authentication (API key or session)
 * @param request The Next.js request object
 * @returns Session info if authenticated, null otherwise
 */
export async function requireAuth(request: NextRequest) {
  // First check for API key
  const apiKeyResult = await validateApiKey(request.headers);

  if (apiKeyResult.valid) {
    return apiKeyResult.session;
  }

  // Fall back to session authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Checks if the request has permission to perform an action
 * @param request The Next.js request object
 * @param permissions Required permissions
 * @returns true if authorized, false otherwise
 */
export async function hasPermission(
  request: NextRequest,
  permissions: PermissionCheck,
): Promise<boolean> {
  const result = await validateApiKey(request.headers, permissions);

  if (result.valid) {
    return true;
  }

  // Check session permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return false;
  }

  // For session auth, we assume full permissions (you can customize this)
  return true;
}
