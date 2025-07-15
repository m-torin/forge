/**
 * Rate limiting plugin for better-auth
 * Limits authentication attempts to prevent brute force attacks
 */

export interface RateLimiterOptions {
  enabled?: boolean;
  windowMs?: number; // Time window in milliseconds
  maxAttempts?: number; // Maximum attempts per window
  skipSuccessfulRequests?: boolean; // Don't count successful auth attempts
  keyGenerator?: (request: Request) => string; // Custom key generator
  message?: string; // Error message when rate limited
}

const DEFAULT_OPTIONS: RateLimiterOptions = {
  enabled: true,
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts. Please try again later.',
};

// In-memory store for rate limiting (should be replaced with Redis in production)
interface RateLimitEntry {
  attempts: number;
  firstAttempt: Date;
  lastAttempt: Date;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimiterPlugin(options: RateLimiterOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const getKey = (request: Request): string => {
    if (config.keyGenerator) {
      return config.keyGenerator(request);
    }

    // Default key: IP address + path
    const headers = request.headers;
    const ipAddress =
      headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown';
    const path = new URL(request.url).pathname;

    return `${ipAddress}:${path}`;
  };

  const cleanupExpiredEntries = () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.firstAttempt.getTime() > (config.windowMs ?? 15 * 60 * 1000)) {
        rateLimitStore.delete(key);
      }
    }
  };

  const checkRateLimit = (key: string): { allowed: boolean; retryAfter?: number } => {
    cleanupExpiredEntries();

    const entry = rateLimitStore.get(key);

    if (!entry) {
      return { allowed: true };
    }

    const windowStart = entry.firstAttempt.getTime();
    const now = Date.now();

    // If window has expired, reset
    if (now - windowStart > (config.windowMs ?? 15 * 60 * 1000)) {
      rateLimitStore.delete(key);
      return { allowed: true };
    }

    // Check if limit exceeded
    if (entry.attempts >= (config.maxAttempts ?? 5)) {
      const retryAfter = Math.ceil(
        (windowStart + (config.windowMs ?? 15 * 60 * 1000) - now) / 1000,
      );
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  };

  const recordAttempt = (key: string) => {
    const now = new Date();
    const entry = rateLimitStore.get(key);

    if (entry) {
      entry.attempts += 1;
      entry.lastAttempt = now;
      rateLimitStore.set(key, entry);
    } else {
      rateLimitStore.set(key, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    }
  };

  return {
    id: 'rate-limiter',
    hooks: {
      before: [
        {
          matcher: (context: any) => {
            // Rate limit auth endpoints
            const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/verify-2fa'];
            return authPaths.includes(context.path);
          },
          handler: async (context: any) => {
            if (!config.enabled) {
              return context;
            }

            const key = getKey(context.request);
            const { allowed, retryAfter } = checkRateLimit(key);

            if (!allowed) {
              // Set rate limit headers
              context.response = new Response(
                JSON.stringify({
                  error: config.message,
                  retryAfter,
                }),
                {
                  status: 429,
                  headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': (config.maxAttempts || 5).toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(
                      Date.now() + (retryAfter ?? 900) * 1000,
                    ).toISOString(),
                    'Retry-After': (retryAfter ?? 900).toString(),
                  },
                },
              );

              // Prevent further processing
              context.error = new Error(config.message);
              return context;
            }

            // Record attempt (will be removed if successful and skipSuccessfulRequests is true)
            recordAttempt(key);

            // Store key for potential cleanup in after hook
            context.rateLimitKey = key;

            return context;
          },
        },
      ],
      after: [
        {
          matcher: (context: any) => {
            return context.rateLimitKey !== undefined;
          },
          handler: async (context: any) => {
            // If request was successful and we should skip successful requests
            if (config.skipSuccessfulRequests && !context.error && context.rateLimitKey) {
              const entry = rateLimitStore.get(context.rateLimitKey);
              if (entry && entry.attempts > 0) {
                entry.attempts -= 1;
                if (entry.attempts === 0) {
                  rateLimitStore.delete(context.rateLimitKey);
                } else {
                  rateLimitStore.set(context.rateLimitKey, entry);
                }
              }
            }

            return context;
          },
        },
      ],
    },
  };
}

// Periodic cleanup function (run every hour)
export function startRateLimitCleanup(intervalMs: number = 60 * 60 * 1000) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.lastAttempt.getTime() > intervalMs) {
        rateLimitStore.delete(key);
      }
    }
  }, intervalMs);
}
