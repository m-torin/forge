/**
 * Factory functions for creating observability instances
 */

import { ObservabilityManager } from '../core/manager';
import type { ObservabilityPlugin, ObservabilityServerPlugin } from '../core/plugin';
import { ObservabilityBuilder } from './builder';

export { ObservabilityManager } from '../core/manager';
export { ObservabilityBuilder } from './builder';

/**
 * Create an observability instance with the provided plugins
 */
export function createObservability(
  plugins: (ObservabilityPlugin | ObservabilityServerPlugin)[],
  options?: {
    autoInitialize?: boolean;
  },
): ObservabilityManager {
  const builder = new ObservabilityBuilder();

  if (options?.autoInitialize !== undefined) {
    builder.withAutoInitialize(options.autoInitialize);
  }

  return builder.withPlugins(plugins).build();
}

/**
 * Create a no-op observability instance for testing or when observability is disabled
 */
export function createNoOpObservability(): ObservabilityManager {
  return new ObservabilityManager();
}
