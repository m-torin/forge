/**
 * Multiplexed transport utilities for Sentry Micro Frontend Plugin
 */

import type { BackstageAppConfig } from './types';

/**
 * Create a multiplexed transport that routes events to different Sentry projects
 * based on backstageApp information
 */
export function createMultiplexedTransport(
  backstage: BackstageAppConfig[],
  fallbackDsn?: string,
  sentryClient?: any,
): any {
  // Import Sentry dynamically or use provided client (edge runtime compatible)
  const Sentry =
    sentryClient || (typeof globalThis !== 'undefined' ? (globalThis as any).Sentry : null);

  if (!Sentry || !Sentry.makeMultiplexedTransport || !Sentry.makeFetchTransport) {
    console.warn('Sentry multiplexed transport not available');
    return undefined;
  }

  return Sentry.makeMultiplexedTransport(Sentry.makeFetchTransport, (args: any) => {
    const event = args.getEvent();

    if (!event) {
      return [];
    }

    // Extract backstageApp information from various sources
    const backstageApp =
      event.tags?.backstageApp ||
      event.extra?.backstageApp ||
      event.contexts?.microFrontend?.backstageApp;

    if (backstageApp) {
      // Find backstageApp configuration
      const backstageAppConfig = backstage.find(z => z.name === backstageApp);

      if (backstageAppConfig && backstageAppConfig.dsn) {
        // Route to backstageApp-specific DSN
        const envelope: any[] = [
          {
            dsn: backstageAppConfig.dsn,
            release: backstageAppConfig.release || event.release,
          },
        ];

        // Add backstageApp-specific tags if configured
        if (backstageAppConfig.tags && event.tags) {
          Object.assign(event.tags, backstageAppConfig.tags);
        }

        return envelope;
      }
    }

    // Use fallback DSN if provided
    if (fallbackDsn) {
      return [{ dsn: fallbackDsn }];
    }

    // Let the default DSN handle it
    return [];
  });
}

/**
 * Create a transport matcher function for more complex routing logic
 */
export function createTransportMatcher(
  backstage: BackstageAppConfig[],
  customMatcher?: (event: any) => string | undefined,
): (args: any) => any[] {
  return (args: any) => {
    const event = args.getEvent();

    if (!event) {
      return [];
    }

    // Use custom matcher if provided
    let backstageApp: string | undefined;
    if (customMatcher) {
      backstageApp = customMatcher(event);
    }

    // Fall back to default backstageApp detection
    if (!backstageApp) {
      backstageApp =
        event.tags?.backstageApp ||
        event.extra?.backstageApp ||
        event.contexts?.microFrontend?.backstageApp;
    }

    // Try to detect backstageApp from stack frames
    if (!backstageApp && event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames;
      for (const frame of frames) {
        if (frame.filename) {
          // Check if filename contains backstageApp hints
          if (frame.filename.includes('/cms/')) {
            backstageApp = 'cms';
            break;
          } else if (frame.filename.includes('/workflows/')) {
            backstageApp = 'workflows';
            break;
          } else if (frame.filename.includes('/authmgmt/')) {
            backstageApp = 'authmgmt';
            break;
          }
        }
      }
    }

    if (backstageApp) {
      const backstageAppConfig = backstage.find(z => z.name === backstageApp);
      if (backstageAppConfig && backstageAppConfig.dsn) {
        return [
          {
            dsn: backstageAppConfig.dsn,
            release: backstageAppConfig.release,
          },
        ];
      }
    }

    return [];
  };
}

/**
 * Enhance an event with Backstage app information before sending
 */
export function enhanceEventWithBackstageApp(
  event: any,
  backstageApp: string,
  additionalContext?: Record<string, any>,
): any {
  // Add backstageApp tag
  if (!event.tags) {
    event.tags = {};
  }
  event.tags.backstageApp = backstageApp;
  event.tags.microFrontend = true;

  // Add backstageApp context
  if (!event.contexts) {
    event.contexts = {};
  }
  event.contexts.microFrontend = {
    backstageApp,
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };

  // Add backstageApp to extra for backward compatibility
  if (!event.extra) {
    event.extra = {};
  }
  event.extra.backstageApp = backstageApp;

  return event;
}

/**
 * Create a beforeSend hook that adds backstageApp information
 */
export function createBackstageBeforeSend(
  backstageApp: string,
  originalBeforeSend?: (event: any, hint: any) => any,
): (event: any, hint: any) => any {
  return (event: any, hint: any) => {
    // Enhance with backstageApp information
    enhanceEventWithBackstageApp(event, backstageApp);

    // Call original beforeSend if provided
    if (originalBeforeSend) {
      return originalBeforeSend(event, hint);
    }

    return event;
  };
}
