/**
 * Next.js client-side observability integration
 */

import { createClientObservability } from '../client-next';
import { ObservabilityConfig, ObservabilityManager } from '../shared/types/types';

export interface NextJSClientObservabilityConfig extends ObservabilityConfig {
  nextjs?: ObservabilityConfig['nextjs'] & {
    // Client-specific Next.js options
    useRouter?: boolean; // Auto-track route changes
    useWebVitals?: boolean; // Auto-track web vitals
  };
}

export class NextJSClientObservabilityManager {
  private manager: null | ObservabilityManager = null;

  constructor(private config: NextJSClientObservabilityConfig) {}

  getManager(): null | ObservabilityManager {
    return this.manager;
  }

  async initialize(): Promise<void> {
    this.manager = await createClientObservability(this.config);

    // Set up Next.js specific integrations
    if (this.config.nextjs?.useRouter && typeof window !== 'undefined') {
      this.setupRouterTracking();
    }
  }

  private setupRouterTracking(): void {
    if (!this.manager) return;

    // Track route changes (would need actual Next.js router integration)
    // This is a placeholder for the actual implementation
  }
}

/**
 * Create Next.js optimized client observability
 */
export async function createNextJSClientObservability(
  config: NextJSClientObservabilityConfig,
): Promise<ObservabilityManager> {
  // Apply Next.js specific defaults
  const nextConfig: NextJSClientObservabilityConfig = {
    ...config,
    nextjs: {
      disableLogger: true, // Reduce bundle size
      tunnelRoute: '/monitoring', // Default tunnel route
      ...config.nextjs,
    },
  };

  const manager = await createClientObservability(nextConfig);

  // Set up client-side error boundaries
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event: any) => {
      manager.captureException(event.error || new Error(event.message), {
        tags: { source: 'window.onerror' },
      });
    });

    window.addEventListener('unhandledrejection', (event: any) => {
      manager.captureException(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        tags: { source: 'unhandledrejection' },
      });
    });
  }

  return manager;
}
