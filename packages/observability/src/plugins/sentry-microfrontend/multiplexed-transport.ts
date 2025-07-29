/**
 * Multiplexed transport utilities for Sentry Micro Frontend Plugin
 */

import type { ZoneConfig } from './types';

/**
 * Create a multiplexed transport that routes events to different Sentry projects
 * based on zone information
 */
export function createMultiplexedTransport(
  zones: ZoneConfig[],
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

    // Extract zone information from various sources
    const zone = event.tags?.zone || event.extra?.zone || event.contexts?.microFrontend?.zone;

    if (zone) {
      // Find zone configuration
      const zoneConfig = zones.find(z => z.name === zone);

      if (zoneConfig && zoneConfig.dsn) {
        // Route to zone-specific DSN
        const envelope: any[] = [
          {
            dsn: zoneConfig.dsn,
            release: zoneConfig.release || event.release,
          },
        ];

        // Add zone-specific tags if configured
        if (zoneConfig.tags && event.tags) {
          Object.assign(event.tags, zoneConfig.tags);
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
  zones: ZoneConfig[],
  customMatcher?: (event: any) => string | undefined,
): (args: any) => any[] {
  return (args: any) => {
    const event = args.getEvent();

    if (!event) {
      return [];
    }

    // Use custom matcher if provided
    let zone: string | undefined;
    if (customMatcher) {
      zone = customMatcher(event);
    }

    // Fall back to default zone detection
    if (!zone) {
      zone = event.tags?.zone || event.extra?.zone || event.contexts?.microFrontend?.zone;
    }

    // Try to detect zone from stack frames
    if (!zone && event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames;
      for (const frame of frames) {
        if (frame.filename) {
          // Check if filename contains zone hints
          if (frame.filename.includes('/cms/')) {
            zone = 'cms';
            break;
          } else if (frame.filename.includes('/workflows/')) {
            zone = 'workflows';
            break;
          } else if (frame.filename.includes('/authmgmt/')) {
            zone = 'authmgmt';
            break;
          }
        }
      }
    }

    if (zone) {
      const zoneConfig = zones.find(z => z.name === zone);
      if (zoneConfig && zoneConfig.dsn) {
        return [
          {
            dsn: zoneConfig.dsn,
            release: zoneConfig.release,
          },
        ];
      }
    }

    return [];
  };
}

/**
 * Enhance an event with zone information before sending
 */
export function enhanceEventWithZone(
  event: any,
  zone: string,
  additionalContext?: Record<string, any>,
): any {
  // Add zone tag
  if (!event.tags) {
    event.tags = {};
  }
  event.tags.zone = zone;
  event.tags.microFrontend = true;

  // Add zone context
  if (!event.contexts) {
    event.contexts = {};
  }
  event.contexts.microFrontend = {
    zone,
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };

  // Add zone to extra for backward compatibility
  if (!event.extra) {
    event.extra = {};
  }
  event.extra.zone = zone;

  return event;
}

/**
 * Create a beforeSend hook that adds zone information
 */
export function createZoneBeforeSend(
  zone: string,
  originalBeforeSend?: (event: any, hint: any) => any,
): (event: any, hint: any) => any {
  return (event: any, hint: any) => {
    // Enhance with zone information
    enhanceEventWithZone(event, zone);

    // Call original beforeSend if provided
    if (originalBeforeSend) {
      return originalBeforeSend(event, hint);
    }

    return event;
  };
}
