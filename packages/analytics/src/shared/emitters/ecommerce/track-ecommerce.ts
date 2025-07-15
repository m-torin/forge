/**
 * Ecommerce tracking wrapper that integrates with the core emitter system
 */

import { track } from '../emitters';

import type { EmitterOptions, EmitterTrackPayload } from '../emitter-types';
import type { EcommerceEventSpec } from './types';

/**
 * Convert an ecommerce event specification to a track payload
 *
 * @param eventSpec - The ecommerce event specification
 * @param options - Optional emitter options
 * @returns Track payload ready to be sent to analytics providers
 */
export function trackEcommerce(
  eventSpec: EcommerceEventSpec,
  options?: EmitterOptions,
): EmitterTrackPayload {
  // Add ecommerce context to options
  const enrichedOptions: EmitterOptions = {
    ...options,
    context: {
      ...options?.context,
      // Add ecommerce-specific context if needed
      ...(eventSpec.category && {
        // Store category as a custom field since EmitterContext doesn't have category
        traits: {
          ...options?.context?.traits,
          event_category: eventSpec.category,
        },
      }),
    },
  };

  // Return the track payload with the event name and properties
  return track(eventSpec.name, eventSpec.properties, enrichedOptions);
}

/**
 * Helper to create a tracking function for a specific ecommerce event
 * This allows for cleaner usage in applications
 */
export function createEcommerceTracker<T extends Record<string, any>>(
  eventFactory: (properties: T) => EcommerceEventSpec,
) {
  return (properties: T, options?: EmitterOptions): EmitterTrackPayload => {
    const eventSpec = eventFactory(properties);
    return trackEcommerce(eventSpec, options);
  };
}
