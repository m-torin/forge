/**
 * Edge-safe instrumentation for Next.js edge runtime
 * This file provides no-op implementations for edge environments
 */

import { isDevelopment } from '../../env';
import { ObservabilityConfig } from '../shared/types/types';

/**
 * No-op register function for edge runtime
 * Edge runtime doesn't support full observability features
 */
export async function register(_config?: ObservabilityConfig): Promise<void> {
  // No-op for edge runtime - observability is not supported
  if (isDevelopment()) {
    console.info(
      '[Observability] Edge runtime detected - skipping full observability initialization',
    );
  }
}

/**
 * No-op error handler for edge runtime
 */
export const onRequestError = (() => {}) as any;
