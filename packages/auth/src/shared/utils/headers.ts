/**
 * Shared header creation utilities
 */

/**
 * Creates headers with API key authentication
 */
export function createApiKeyHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Creates bearer token headers
 */
export function createBearerHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Creates basic JSON headers
 */
export function createJsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}
