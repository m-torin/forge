/**
 * Ecommerce tracking wrapper that integrates with the core emitter system
 */

import { track } from '../emitters';
import type { EmitterOptions } from '../emitter-types';
import type { EcommerceEventSpec } from './types';

/**
 * Track an ecommerce event using the core analytics system
 * 
 * @param eventSpec - The ecommerce event specification
 * @param options - Optional emitter options
 * @param callback - Optional callback for client-side usage
 */
export function trackEcommerce(
  eventSpec: EcommerceEventSpec,
  options?: EmitterOptions,
  callback?: Function
): void {
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
          event_category: eventSpec.category 
        }
      })
    }
  };

  // Use the core track function with the event name and properties
  track(eventSpec.name, eventSpec.properties, enrichedOptions, callback);
}

/**
 * Helper to create a tracking function for a specific ecommerce event
 * This allows for cleaner usage in applications
 */
export function createEcommerceTracker<T extends Record<string, any>>(
  eventFactory: (properties: T) => EcommerceEventSpec
) {
  return (properties: T, options?: EmitterOptions, callback?: Function) => {
    const eventSpec = eventFactory(properties);
    trackEcommerce(eventSpec, options, callback);
  };
}