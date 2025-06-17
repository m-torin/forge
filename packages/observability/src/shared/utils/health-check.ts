/**
 * Provider health check utilities
 * Monitors provider health and fails gracefully without retries
 */

import { ObservabilityProvider } from '../types/types';

import { Environment } from './environment';

export interface ProviderHealth {
  name: string;
  healthy: boolean;
  lastCheck: Date;
  errorCount: number;
  lastError?: string;
}

export interface HealthCheckOptions {
  /** Time to wait for health check response (ms) */
  timeout?: number;
  /** Callback when provider health changes */
  onHealthChange?: (providerName: string, health: ProviderHealth) => void;
}

export class ProviderHealthMonitor {
  private healthStatus = new Map<string, ProviderHealth>();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(
    private providers: Map<string, ObservabilityProvider>,
    private options: HealthCheckOptions = {},
  ) {
    this.options.timeout = this.options.timeout ?? 5000;
  }

  /**
   * Get current health status for all providers
   */
  getHealthStatus(): Map<string, ProviderHealth> {
    return new Map(this.healthStatus);
  }

  /**
   * Get health for specific provider
   */
  getProviderHealth(providerName: string): ProviderHealth | undefined {
    return this.healthStatus.get(providerName);
  }

  /**
   * Check if a provider is healthy
   */
  isHealthy(providerName: string): boolean {
    const health = this.healthStatus.get(providerName);
    return health?.healthy ?? false;
  }

  /**
   * Perform health check on a single provider
   * Fails gracefully without retry
   */
  async checkProviderHealth(
    providerName: string,
    provider: ObservabilityProvider,
  ): Promise<ProviderHealth> {
    const currentHealth = this.healthStatus.get(providerName) ?? {
      name: providerName,
      healthy: true,
      lastCheck: new Date(),
      errorCount: 0,
    };

    try {
      // Simple health check: try to capture a test message
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), this.options.timeout);
      });

      await Promise.race([
        provider.captureMessage('Health check', 'info', {
          tags: { healthCheck: 'true' },
          extra: { timestamp: Date.now() },
        }),
        timeoutPromise,
      ]);

      // If successful, mark as healthy
      const newHealth: ProviderHealth = {
        name: providerName,
        healthy: true,
        lastCheck: new Date(),
        errorCount: 0,
      };

      this.healthStatus.set(providerName, newHealth);

      // Notify if health changed
      if (!currentHealth.healthy && this.options.onHealthChange) {
        this.options.onHealthChange(providerName, newHealth);
      }

      return newHealth;
    } catch (error: any) {
      // Health check failed - mark as unhealthy but don't retry
      const newHealth: ProviderHealth = {
        name: providerName,
        healthy: false,
        lastCheck: new Date(),
        errorCount: currentHealth.errorCount + 1,
        lastError:
          error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error',
      };

      this.healthStatus.set(providerName, newHealth);

      // Notify if health changed
      if (currentHealth.healthy && this.options.onHealthChange) {
        this.options.onHealthChange(providerName, newHealth);
      }

      // Log in development
      if (Environment.isDevelopment()) {
        console.warn(`[Observability] Provider ${providerName} health check failed: `, error);
      }

      return newHealth;
    }
  }

  /**
   * Check health of all providers
   * Each provider is checked independently, failures don't affect others
   */
  async checkAllProviders(): Promise<Map<string, ProviderHealth>> {
    const healthChecks = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      const health = await this.checkProviderHealth(name, provider);
      return [name, health] as const;
    });

    // Use allSettled to ensure all checks complete even if some fail
    const results = await Promise.allSettled(healthChecks);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const [name, health] = result.value;
        this.healthStatus.set(name, health);
      }
    }

    return this.getHealthStatus();
  }

  /**
   * Start periodic health checks
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    // Initial check
    this.checkAllProviders().catch(() => {
      // Silently handle errors in background monitoring
    });

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllProviders().catch(() => {
        // Silently handle errors in background monitoring
      });
    }, intervalMs);

    // Ensure interval doesn't prevent process exit
    if (this.checkInterval.unref) {
      this.checkInterval.unref();
    }
  }

  /**
   * Stop periodic health checks
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get summary of provider health
   */
  getHealthSummary(): {
    total: number;
    healthy: number;
    unhealthy: number;
    providers: Array<{ name: string; healthy: boolean; errorCount: number }>;
  } {
    const providers = Array.from(this.healthStatus.values());
    const healthy = providers.filter((p: any) => p.healthy).length;

    return {
      total: providers.length,
      healthy,
      unhealthy: providers.length - healthy,
      providers: providers.map((p: any) => ({
        name: p.name,
        healthy: p.healthy,
        errorCount: p.errorCount,
      })),
    };
  }
}

/**
 * Create a health monitor for providers
 */
export function createHealthMonitor(
  providers: Map<string, ObservabilityProvider>,
  options?: HealthCheckOptions,
): ProviderHealthMonitor {
  return new ProviderHealthMonitor(providers, options);
}
