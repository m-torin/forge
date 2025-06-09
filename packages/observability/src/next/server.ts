/**
 * Next.js server-side observability integration
 */

import { createServerObservability } from '../server-next';

import type { ObservabilityConfig, ObservabilityManager } from '../shared/types/types';

export interface NextJSServerObservabilityConfig extends ObservabilityConfig {
  nextjs?: ObservabilityConfig['nextjs'];
}

export class NextJSServerObservabilityManager {
  private manager: ObservabilityManager | null = null;

  constructor(private config: NextJSServerObservabilityConfig) {}

  async initialize(): Promise<void> {
    this.manager = await createServerObservability(this.config);
  }

  getManager(): ObservabilityManager | null {
    return this.manager;
  }
}

/**
 * Create Next.js optimized server observability
 */
export async function createNextJSServerObservability(
  config: NextJSServerObservabilityConfig,
): Promise<ObservabilityManager> {
  // Apply Next.js specific defaults
  const nextConfig: NextJSServerObservabilityConfig = {
    ...config,
    nextjs: {
      ...config.nextjs,
    },
  };

  return createServerObservability(nextConfig);
}
