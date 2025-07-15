import { logWarn } from '@repo/observability';
import { dedupe } from 'flags/next';
import { nanoid } from 'nanoid';
import { cookies, headers } from 'next/headers';

export const identify = dedupe(async () => {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    // Get or generate visitor ID
    const visitorId = cookieStore.get('visitor-id')?.value || nanoid();
    const userId = cookieStore.get('user-id')?.value || 'anonymous';

    return {
      // Core identification
      userId,
      visitorId,

      // Request context
      country: headerStore.get('x-vercel-ip-country') || 'US',
      userAgent: headerStore.get('user-agent') || 'unknown',

      // User attributes
      tier: cookieStore.get('subscription')?.value || 'free',

      // Session info
      sessionId: cookieStore.get('session-id')?.value || `session-${Date.now()}`,
    };
  } catch (error) {
    logWarn('Context extraction failed, using minimal context:', error);

    // Fallback context
    return {
      userId: 'anonymous',
      visitorId: `visitor-${Date.now()}`,
      country: 'US',
      userAgent: 'unknown',
      tier: 'free',
      sessionId: `session-${Date.now()}`,
    };
  }
});

export type FlagContext = Awaited<ReturnType<typeof identify>>;
