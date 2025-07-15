import { vi } from 'vitest';
import { MockUpstashRedis } from './redis';

// Rate limiter configuration types
interface LimiterConfig {
  type: 'slidingWindow' | 'fixedWindow' | 'tokenBucket' | 'cachedFixedWindow';
  requests: number;
  window: string;
  cache?: Map<string, any>;
}

interface RatelimitOptions {
  redis: MockUpstashRedis;
  limiter: LimiterConfig;
  prefix?: string;
  analytics?: boolean;
  enableProtection?: boolean;
  ephemeralCache?: Map<string, any>;
}

interface RatelimitResponse {
  success: boolean;
  limit: number;
  remaining: number;
  reset?: number;
  pending?: Promise<any>;
  reason?: string;
}

// Mock Upstash Ratelimit
export const createMockRatelimit = (redisInstance?: MockUpstashRedis) => {
  const mockRedis = redisInstance || new MockUpstashRedis();

  // Helper function to parse time window to milliseconds
  const parseWindow = (window: string): number => {
    const match = window.match(/(\d+)\s*(s|m|h|d)/);
    if (!match) return 60000; // default 1 minute

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return value * 1000;
    }
  };

  // Rate limit logic implementation
  const performRateLimit = async (
    identifier: string,
    config: LimiterConfig,
    prefix: string = '@upstash/ratelimit',
  ): Promise<RatelimitResponse> => {
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    const windowMs = parseWindow(config.window);

    if (config.type === 'fixedWindow') {
      // Fixed window implementation
      const windowStart = Math.floor(now / windowMs) * windowMs;
      const windowKey = `${key}:${windowStart}`;

      const currentCount = parseInt((await mockRedis.get(windowKey)) || '0', 10);
      const newCount = currentCount + 1;

      if (newCount <= config.requests) {
        await mockRedis.set(windowKey, newCount.toString(), { ex: Math.ceil(windowMs / 1000) });
        return {
          success: true,
          limit: config.requests,
          remaining: config.requests - newCount,
          reset: windowStart + windowMs,
        };
      } else {
        return {
          success: false,
          limit: config.requests,
          remaining: 0,
          reset: windowStart + windowMs,
        };
      }
    } else if (config.type === 'slidingWindow') {
      // Sliding window implementation (simplified)
      const windowKey = `${key}:sliding`;
      const countKey = `${windowKey}:count`;

      const currentCount = parseInt((await mockRedis.get(countKey)) || '0', 10);
      const newCount = currentCount + 1;

      if (newCount <= config.requests) {
        await mockRedis.set(countKey, newCount.toString(), { ex: Math.ceil(windowMs / 1000) });
        return {
          success: true,
          limit: config.requests,
          remaining: config.requests - newCount,
          reset: now + windowMs,
        };
      } else {
        return {
          success: false,
          limit: config.requests,
          remaining: 0,
          reset: now + windowMs,
        };
      }
    } else {
      // Default fallback
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
      };
    }
  };

  const mockLimit = vi
    .fn()
    .mockImplementation(
      async (
        identifier: string,
        options?: { ip?: string; userAgent?: string; country?: string },
      ) => {
        // This will be set by the constructor
        const config = (mockLimit as any)._config || {
          type: 'slidingWindow',
          requests: 10,
          window: '10 s',
        };
        const prefix = (mockLimit as any)._prefix || '@upstash/ratelimit';
        const analytics = (mockLimit as any)._analytics || false;

        const result = await performRateLimit(identifier, config, prefix);

        // Add pending promise for analytics if enabled
        if (analytics) {
          result.pending = Promise.resolve();
        }

        return result;
      },
    );

  // Create static methods that return limiter configurations
  const slidingWindow = (requests: number, window: string): LimiterConfig => ({
    type: 'slidingWindow',
    requests,
    window,
  });

  const fixedWindow = (requests: number, window: string): LimiterConfig => ({
    type: 'fixedWindow',
    requests,
    window,
  });

  const tokenBucket = (requests: number, window: string, tokens?: number): LimiterConfig => ({
    type: 'tokenBucket',
    requests,
    window,
  });

  const cachedFixedWindow = (requests: number, window: string): LimiterConfig => ({
    type: 'cachedFixedWindow',
    requests,
    window,
    cache: new Map(),
  });

  const mockRatelimit = vi.fn().mockImplementation((options: RatelimitOptions) => {
    // Store configuration on the mockLimit function for access during calls
    (mockLimit as any)._config = options.limiter;
    (mockLimit as any)._prefix = options.prefix;
    (mockLimit as any)._analytics = options.analytics;

    return {
      limit: mockLimit,
    };
  }) as any;

  // Add static methods to the mock constructor
  mockRatelimit.slidingWindow = slidingWindow;
  mockRatelimit.fixedWindow = fixedWindow;
  mockRatelimit.tokenBucket = tokenBucket;
  mockRatelimit.cachedFixedWindow = cachedFixedWindow;

  return {
    Ratelimit: mockRatelimit,
    mockLimit,
    mockRedis,
  };
};

// Create test scenarios for different rate limit states
export const createRatelimitScenarios = () => {
  const baseMock = createMockRatelimit();

  return {
    // Standard successful rate limit
    success: {
      ...baseMock,
      mockLimit: vi.fn().mockResolvedValue({
        success: true,
        remaining: 95,
        limit: 100,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      }),
    },

    // Rate limit exceeded
    exceeded: {
      ...baseMock,
      mockLimit: vi.fn().mockResolvedValue({
        success: false,
        remaining: 0,
        limit: 100,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      }),
    },

    // Error during rate limit check
    error: {
      ...baseMock,
      mockLimit: vi.fn().mockRejectedValue(new Error('Rate limit service unavailable')),
    },

    // Custom rate limit response
    custom: (response: any) => ({
      ...baseMock,
      mockLimit: vi.fn().mockResolvedValue(response),
    }),

    // Sliding window scenario
    slidingWindow: {
      ...baseMock,
      mockLimit: vi.fn().mockImplementation(async (identifier: string) => {
        const result = await baseMock.mockLimit(identifier);
        return { ...result, reset: Date.now() + 10000 }; // 10s window
      }),
    },

    // Fixed window scenario
    fixedWindow: {
      ...baseMock,
      mockLimit: vi.fn().mockImplementation(async (identifier: string) => {
        const result = await baseMock.mockLimit(identifier);
        const windowStart = Math.floor(Date.now() / 60000) * 60000;
        return { ...result, reset: windowStart + 60000 }; // 1min window
      }),
    },

    // Analytics enabled scenario
    withAnalytics: {
      ...baseMock,
      mockLimit: vi.fn().mockResolvedValue({
        success: true,
        remaining: 95,
        limit: 100,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      }),
    },

    // Protection enabled scenario
    withProtection: {
      ...baseMock,
      mockLimit: vi.fn().mockImplementation(async (identifier: string, options?: any) => {
        const isBlocked = options?.ip === '192.168.1.1'; // Mock blocked IP
        return {
          success: !isBlocked,
          remaining: isBlocked ? 0 : 95,
          limit: 100,
          reset: Date.now() + 60000,
          pending: Promise.resolve(),
          reason: isBlocked ? 'blocked' : undefined,
        };
      }),
    },
  };
};

// Export the main mock instance
export const mockUpstashRatelimit = createMockRatelimit();

// Setup function for automatic mocking
export const setupRatelimitMocks = () => {
  const mock = createMockRatelimit();

  // Mock @upstash/ratelimit
  vi.doMock('@upstash/ratelimit', () => mock);

  return mock;
};

// Reset function
export const resetRatelimitMocks = (mocks: ReturnType<typeof createMockRatelimit>) => {
  vi.clearAllMocks();

  // Reset to default behavior
  mocks.mockLimit.mockResolvedValue({
    success: true,
    remaining: 95,
    limit: 100,
    reset: Date.now() + 60000,
  });
};

// Mock the @upstash/ratelimit module for automatic Vitest usage
vi.mock('@upstash/ratelimit', () => createMockRatelimit());
