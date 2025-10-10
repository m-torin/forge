/**
 * Simplified Rate Limiting Plugin for Better Auth
 * Provides basic rate limiting without complex middleware context dependencies
 */

import { logError } from '@repo/observability';
import type { BetterAuthPlugin } from 'better-auth';
import 'server-only';

import { rateLimiter, RateLimitPresets } from '../rate-limiter';

export interface SimpleRateLimitOptions {
  /** Enable rate limiting */
  enabled?: boolean;
  /** Skip rate limiting for certain IPs */
  skipIPs?: string[];
  /** Custom rate limit configurations */
  customLimits?: Record<string, { limit: number; window: number }>;
}

/**
 * Simple Rate Limiting Plugin
 */
export const simpleRateLimit = (options: SimpleRateLimitOptions = {}): BetterAuthPlugin => {
  const { enabled = true, skipIPs = [], customLimits: _customLimits = {} } = options;

  if (!enabled) {
    return { id: 'simple-rate-limit' };
  }

  return {
    id: 'simple-rate-limit',

    hooks: {
      before: [
        {
          matcher: context => {
            // Apply to authentication endpoints
            return (
              context.path?.includes('/sign-in') ||
              context.path?.includes('/sign-up') ||
              context.path?.includes('/forget-password') ||
              context.path?.includes('/send-otp')
            );
          },
          handler: async context => {
            try {
              // Extract IP from headers - Better Auth provides headers as a record
              const headers = (context.headers as Record<string, string>) || {};
              const forwardedFor = headers['x-forwarded-for'];
              const realIP = headers['x-real-ip'];
              const cfIP = headers['cf-connecting-ip'];

              const clientIP = forwardedFor?.split(',')[0]?.trim() || realIP || cfIP || '127.0.0.1';

              // Skip if IP is in skip list
              if (skipIPs.includes(clientIP)) {
                return;
              }

              // Determine rate limit config based on endpoint
              let rateLimitConfig;
              const path = (context as any).path || '';

              if (path.includes('/sign-in')) {
                const identifier =
                  (context.body as any)?.email ||
                  (context.body as any)?.phoneNumber ||
                  `ip:${clientIP}`;
                rateLimitConfig = RateLimitPresets.signIn(identifier);
              } else if (path.includes('/sign-up')) {
                const identifier =
                  (context.body as any)?.email ||
                  (context.body as any)?.phoneNumber ||
                  `ip:${clientIP}`;
                rateLimitConfig = RateLimitPresets.signUp(identifier);
              } else if (path.includes('/forget-password')) {
                const email = (context.body as any)?.email || `ip:${clientIP}`;
                rateLimitConfig = RateLimitPresets.forgotPassword(email);
              } else if (path.includes('/send-otp')) {
                const identifier =
                  (context.body as any)?.email ||
                  (context.body as any)?.phoneNumber ||
                  `ip:${clientIP}`;
                rateLimitConfig = RateLimitPresets.sendOTP(identifier);
              } else {
                return; // No rate limiting for other endpoints
              }

              // Check rate limit
              const rateLimitResult = await rateLimiter.check(rateLimitConfig);

              if (!rateLimitResult.allowed) {
                // Create rate limit error response
                const error = new Error('Rate limit exceeded');
                (error as any).status = 429;
                (error as any).headers = {
                  'Retry-After': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
                  'X-RateLimit-Limit': rateLimitConfig.limit.toString(),
                  'X-RateLimit-Remaining': '0',
                  'X-RateLimit-Reset': new Date(
                    Date.now() + rateLimitResult.resetTime,
                  ).toISOString(),
                };

                throw error;
              }
            } catch (error) {
              // If it's a rate limit error, re-throw it
              if ((error as any).status === 429) {
                throw error;
              }

              // Log other errors but don't block the request
              logError(
                'Rate limiting error',
                error instanceof Error ? error : new Error(String(error)),
              );
            }
          },
        },
      ],
    },
  };
};
