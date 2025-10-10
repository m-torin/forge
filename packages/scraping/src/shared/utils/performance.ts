/**
 * Performance optimization utilities
 */

interface PerformanceProfile {
  name: string;
  concurrency: number;
  timeout: number;
  retries: number;
  cacheEnabled: boolean;
  resourceBlocking: string[];
  viewport?: { width: number; height: number };
}

/**
 * Create a performance profile for specific use cases
 */
export function createPerformanceProfile(
  useCase: 'fast' | 'reliable' | 'thorough' = 'fast',
): PerformanceProfile {
  const profiles: Record<string, PerformanceProfile> = {
    fast: {
      name: 'fast',
      concurrency: 10,
      timeout: 10000,
      retries: 1,
      cacheEnabled: true,
      resourceBlocking: ['image', 'media', 'font', 'stylesheet'],
      viewport: { width: 1280, height: 720 },
    },
    reliable: {
      name: 'reliable',
      concurrency: 3,
      timeout: 30000,
      retries: 3,
      cacheEnabled: false,
      resourceBlocking: ['media'],
      viewport: { width: 1920, height: 1080 },
    },
    thorough: {
      name: 'thorough',
      concurrency: 1,
      timeout: 60000,
      retries: 5,
      cacheEnabled: false,
      resourceBlocking: [],
      viewport: { width: 1920, height: 1080 },
    },
  };

  return profiles[useCase] || profiles.fast;
}

/**
 * Optimize configuration for speed
 */
export function optimizeForSpeed(config: any): any {
  return {
    ...config,
    timeout: Math.min(config.timeout || 10000, 10000),
    waitUntil: 'domcontentloaded',
    blockResources: ['image', 'media', 'font', 'stylesheet'],
    viewport: { width: 1280, height: 720 },
    headless: true,
  };
}

/**
 * Optimize configuration for memory usage
 */
export function optimizeForMemory(config: any): any {
  return {
    ...config,
    viewport: { width: 800, height: 600 },
    disableImages: true,
    disableJavaScript: !config.requiresJavaScript,
    args: [
      ...(config.args || []),
      '--max-old-space-size=512',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  };
}

interface ResourceManager {
  acquire(resource: string): Promise<void>;
  release(resource: string): void;
  isAvailable(resource: string): boolean;
  getUsage(): Record<string, number>;
}

/**
 * Create a resource manager for controlling concurrent operations
 */
export function createResourceManager(limits: Record<string, number> = {}): ResourceManager {
  const usage: Record<string, number> = {};
  const waiting: Record<string, Array<() => void>> = {};

  const defaultLimits: Record<string, number> = {
    browsers: 5,
    requests: 100,
    memory: 1024 * 1024 * 1024, // 1GB
    ...limits,
  };

  return {
    async acquire(resource: string) {
      const limit = defaultLimits[resource] || Infinity;
      const current = usage[resource] || 0;

      if (current < limit) {
        usage[resource] = current + 1;
        return;
      }

      // Wait for resource to become available
      return new Promise((resolve: any) => {
        if (!waiting[resource]) {
          waiting[resource] = [];
        }
        waiting[resource].push(resolve);
      });
    },

    release(resource: string) {
      const current = usage[resource] || 0;
      if (current > 0) {
        usage[resource] = current - 1;

        // Notify waiting requests
        const waitingList = waiting[resource];
        if (waitingList && waitingList.length > 0) {
          const next = waitingList.shift();
          if (next) {
            usage[resource] = (usage[resource] || 0) + 1;
            next();
          }
        }
      }
    },

    isAvailable(resource: string): boolean {
      const limit = defaultLimits[resource] || Infinity;
      const current = usage[resource] || 0;
      return current < limit;
    },

    getUsage(): Record<string, number> {
      return { ...usage };
    },
  };
}
