import { dedupe } from '@vercel/flags/next';
import { nanoid } from 'nanoid';

/**
 * Generate a visitor ID for anonymous users
 */
export const generateVisitorId = dedupe(async () => nanoid());

/**
 * Get or generate a visitor ID from cookies/headers
 */
export async function getOrGenerateVisitorId(
  cookies: any,
  headers?: any,
  cookieName = 'visitor-id',
): Promise<string> {
  // Check cookies first
  const cookieVisitorId = cookies.get(cookieName)?.value;
  if (cookieVisitorId) return cookieVisitorId;

  // Check headers in case middleware set a cookie on the response
  if (headers) {
    const headerVisitorId = headers.get(`x-${cookieName}`);
    if (headerVisitorId) return headerVisitorId;
  }

  // Generate new ID
  return generateVisitorId();
}

/**
 * Parse feature flag overrides from cookies (for Vercel Toolbar)
 */
export function parseOverrides(cookies: any) {
  const overrides = cookies.get('vercel-flag-overrides')?.value;
  if (!overrides) return undefined;

  try {
    return JSON.parse(overrides);
  } catch {
    return undefined;
  }
}
