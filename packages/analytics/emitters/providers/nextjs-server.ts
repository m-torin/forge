import { headers } from 'next/headers';
import { cookies } from 'next/headers';

import { Analytics } from '../analytics';

import type { AnalyticsProviders } from '../analytics';

/**
 * Server-side analytics instance for Next.js 15
 * Use this in Server Components, Route Handlers, and Server Actions
 */
export function createServerAnalytics(options?: {
  segment?: { writeKey: string };
  posthog?: { apiKey: string; apiHost?: string };
  debug?: boolean;
}) {
  const providers: AnalyticsProviders = {};

  if (options?.segment) {
    providers.segment = {
      writeKey: options.segment.writeKey,
    };
  }

  if (options?.posthog) {
    providers.posthog = {
      apiKey: options.posthog.apiKey,
      config: {
        apiHost: options.posthog.apiHost,
      },
    };
  }

  return new Analytics({
    providers,
    debug: options?.debug,
  });
}

/**
 * Get user context from Next.js request
 */
export async function getAnalyticsContext() {
  const headersList = await headers();
  const cookieStore = await cookies();

  // Extract user information from cookies or headers
  const userId = cookieStore.get('userId')?.value;
  const anonymousId = cookieStore.get('anonymousId')?.value;

  // Extract additional context
  const userAgent = headersList.get('user-agent') || undefined;
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
  const referer = headersList.get('referer') || undefined;

  return {
    anonymousId,
    context: {
      ip: ip?.split(',')[0], // Get first IP if multiple
      page: {
        referrer: referer,
      },
      userAgent,
    },
    userId,
  };
}

/**
 * Track server-side events with automatic context
 */
export async function trackServerEvent(
  event: string,
  properties?: Record<string, any>,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
    debug?: boolean;
  },
) {
  const analytics = createServerAnalytics(options);
  const { anonymousId, context, userId } = await getAnalyticsContext();

  await analytics.track(event, properties, {
    anonymousId,
    context,
    userId,
  });

  // Always flush server-side events
  await analytics.flush();
}

/**
 * Server Action wrapper with analytics
 */
export function withServerAnalytics<T extends (...args: any[]) => any>(
  action: T,
  eventName: string,
  options?: {
    segment?: { writeKey: string };
    posthog?: { apiKey: string; apiHost?: string };
    debug?: boolean;
  },
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    let success = false;
    let error: Error | undefined;

    try {
      const result = await action(...args);
      success = true;
      return result;
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      // Track the server action
      await trackServerEvent(
        eventName,
        {
          args: process.env.NODE_ENV === 'development' ? args : undefined,
          duration: Date.now() - startTime,
          error: error?.message,
          success,
        },
        options,
      );
    }
  }) as T;
}
