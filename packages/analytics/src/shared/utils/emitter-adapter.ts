/**
 * Adapter functions to convert emitter payloads to analytics method calls
 * This bridges the gap between the Segment.io spec emitters and the analytics manager
 */

import type {
  EmitterAliasPayload,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterPagePayload,
  EmitterPayload,
  EmitterTrackPayload,
} from '../emitters/emitter-types';
import type { AnalyticsManager } from '../types/types';

/**
 * Process an emitter payload through the analytics manager
 */
export async function processEmitterPayload(
  analytics: AnalyticsManager,
  payload: EmitterPayload,
): Promise<void> {
  switch (payload.type) {
    case 'identify':
      return processIdentifyPayload(analytics, payload as EmitterIdentifyPayload);
    case 'track':
      return processTrackPayload(analytics, payload as EmitterTrackPayload);
    case 'page':
      return processPagePayload(analytics, payload as EmitterPagePayload);
    case 'group':
      return processGroupPayload(analytics, payload as EmitterGroupPayload);
    case 'alias':
      return processAliasPayload(analytics, payload as EmitterAliasPayload);
    default:
      throw new Error(`Unknown emitter payload type: ${(payload as any).type}`);
  }
}

/**
 * Process an identify payload
 */
export async function processIdentifyPayload(
  analytics: AnalyticsManager,
  payload: EmitterIdentifyPayload,
): Promise<void> {
  const { traits, userId, ...options } = payload;

  // Convert emitter options to tracking options
  const trackingOptions = {
    context: options.context,
    // Add other options as needed
  };

  await analytics.identify(userId, traits, trackingOptions);
}

/**
 * Process a track payload
 */
export async function processTrackPayload(
  analytics: AnalyticsManager,
  payload: EmitterTrackPayload,
): Promise<void> {
  const { event, properties, ...options } = payload;

  const trackingOptions = {
    context: options.context,
  };

  await analytics.track(event, properties, trackingOptions);
}

/**
 * Process a page payload
 */
export async function processPagePayload(
  analytics: AnalyticsManager,
  payload: EmitterPagePayload,
): Promise<void> {
  const { name, properties, ...options } = payload;

  const trackingOptions = {
    context: options.context,
  };

  await analytics.page(name, properties, trackingOptions);
}

/**
 * Process a group payload
 */
export async function processGroupPayload(
  analytics: AnalyticsManager,
  payload: EmitterGroupPayload,
): Promise<void> {
  const { groupId, traits, ...options } = payload;

  const trackingOptions = {
    context: options.context,
  };

  await analytics.group(groupId, traits, trackingOptions);
}

/**
 * Process an alias payload
 */
export async function processAliasPayload(
  analytics: AnalyticsManager,
  payload: EmitterAliasPayload,
): Promise<void> {
  const { previousId, userId, ...options } = payload;

  const trackingOptions = {
    context: options.context,
  };

  await analytics.alias(userId, previousId || '', trackingOptions);
}

/**
 * Create a bound emitter processor for convenience
 */
export function createEmitterProcessor(analytics: AnalyticsManager) {
  return (payload: EmitterPayload) => processEmitterPayload(analytics, payload);
}

/**
 * Helper to track ecommerce events
 */
export async function trackEcommerceEvent(
  analytics: AnalyticsManager,
  eventSpec: { name: string; properties: any },
): Promise<void> {
  await analytics.track(eventSpec.name, eventSpec.properties);
}
