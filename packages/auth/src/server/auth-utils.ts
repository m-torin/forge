/**
 * Auth Utilities for Rate Limiting and Analytics
 * Helper functions for custom authentication flows
 */

import { logError } from '@repo/observability/server/next';
import { headers } from 'next/headers';
import 'server-only';

import { authAnalytics, AuthAnalyticsHelpers } from './auth-analytics';
import { rateLimiter, RateLimitPresets } from './rate-limiter';

import type { RateLimitConfig, RateLimitResult } from './rate-limiter';

/**
 * Extract request information for tracking
 */
export async function getRequestInfo() {
  const headersList = await headers();

  return {
    ipAddress: getIPFromHeaders(headersList),
    userAgent: headersList.get('user-agent') || undefined,
    referer: headersList.get('referer') || undefined,
    origin: headersList.get('origin') || undefined,
  };
}

/**
 * Extract IP address from headers
 */
function getIPFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return '127.0.0.1';
}

/**
 * Rate limiting utilities
 */
export const RateLimitUtils = {
  /**
   * Check rate limit for sign-in attempts
   */
  checkSignInLimit: async (identifier: string): Promise<RateLimitResult> => {
    const config = RateLimitPresets.signIn(identifier);
    return await rateLimiter.check(config);
  },

  /**
   * Check rate limit for sign-up attempts
   */
  checkSignUpLimit: async (identifier: string): Promise<RateLimitResult> => {
    const config = RateLimitPresets.signUp(identifier);
    return await rateLimiter.check(config);
  },

  /**
   * Check rate limit for password operations
   */
  checkPasswordLimit: async (email: string): Promise<RateLimitResult> => {
    const config = RateLimitPresets.forgotPassword(email);
    return await rateLimiter.check(config);
  },

  /**
   * Check rate limit for OTP operations
   */
  checkOTPLimit: async (identifier: string): Promise<RateLimitResult> => {
    const config = RateLimitPresets.sendOTP(identifier);
    return await rateLimiter.check(config);
  },

  /**
   * Check custom rate limit
   */
  checkCustomLimit: async (config: RateLimitConfig): Promise<RateLimitResult> => {
    return await rateLimiter.check(config);
  },

  /**
   * Clear rate limit for an identifier
   */
  clearLimit: async (identifier: string): Promise<void> => {
    await rateLimiter.clear(identifier);
  },

  /**
   * Get rate limit status without incrementing
   */
  getStatus: async (config: RateLimitConfig): Promise<RateLimitResult> => {
    return await rateLimiter.status(config);
  },
} as const;

/**
 * Analytics tracking utilities
 */
export const AnalyticsUtils = {
  /**
   * Track successful authentication
   */
  trackAuthSuccess: async (params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone' | 'magic_link';
    userId: string;
    sessionId: string;
    provider?: string;
    duration?: number;
  }): Promise<void> => {
    try {
      const requestInfo = await getRequestInfo();

      await AuthAnalyticsHelpers.signInSuccess({
        ...params,
        ...requestInfo,
      });
    } catch (error) {
      logError(
        'Failed to track auth success',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  },

  /**
   * Track failed authentication
   */
  trackAuthFailure: async (params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone' | 'magic_link';
    error: string;
    provider?: string;
    duration?: number;
  }): Promise<void> => {
    try {
      const requestInfo = await getRequestInfo();

      await AuthAnalyticsHelpers.signInFailure({
        ...params,
        ...requestInfo,
      });
    } catch (error) {
      logError(
        'Failed to track auth failure',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  },

  /**
   * Track user registration
   */
  trackRegistration: async (params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone';
    success: boolean;
    userId?: string;
    error?: string;
    provider?: string;
  }): Promise<void> => {
    try {
      const requestInfo = await getRequestInfo();

      if (params.success) {
        if (!params.userId) {
          throw new Error('userId is required for successful sign up');
        }
        await AuthAnalyticsHelpers.signUpSuccess({
          method: params.method,
          userId: params.userId,
          provider: params.provider,
          ...requestInfo,
        });
      } else {
        if (!params.error) {
          throw new Error('error is required for failed sign up');
        }
        await AuthAnalyticsHelpers.signUpFailure({
          method: params.method,
          error: params.error,
          provider: params.provider,
          ...requestInfo,
        });
      }
    } catch (error) {
      logError(
        'Failed to track registration',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  },

  /**
   * Track OTP operations
   */
  trackOTP: async (params: {
    type: 'email' | 'sms';
    action: 'send' | 'verify';
    success: boolean;
    identifier: string;
    userId?: string;
    error?: string;
  }): Promise<void> => {
    try {
      const requestInfo = await getRequestInfo();

      await authAnalytics.trackOTP({
        ...params,
        ipAddress: requestInfo.ipAddress,
      });
    } catch (error) {
      logError('Failed to track OTP', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Track organization operations
   */
  trackOrganization: async (params: {
    action: 'create' | 'join' | 'leave' | 'invite' | 'remove_member';
    success: boolean;
    userId: string;
    organizationId?: string;
    targetUserId?: string;
    error?: string;
  }): Promise<void> => {
    try {
      const requestInfo = await getRequestInfo();

      await authAnalytics.trackOrganization({
        ...params,
        ipAddress: requestInfo.ipAddress,
      });
    } catch (error) {
      logError(
        'Failed to track organization',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  },

  /**
   * Track security events
   */
  trackSecurityEvent: async (params: {
    event: 'suspicious.activity' | 'account.locked' | 'account.unlocked';
    userId?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }): Promise<void> => {
    try {
      const requestInfo = await getRequestInfo();

      await authAnalytics.trackSecurityEvent({
        event: params.event,
        userId: params.userId,
        reason: params.reason,
        metadata: params.metadata,
        ...requestInfo,
      });
    } catch (error) {
      logError(
        'Failed to track security event',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  },

  /**
   * Get authentication metrics
   */
  getMetrics: async (params: {
    startDate: Date;
    endDate: Date;
    userId?: string;
    organizationId?: string;
  }) => {
    try {
      return await authAnalytics.getMetrics(params);
    } catch (error) {
      logError('Failed to get metrics', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  },

  /**
   * Get real-time statistics
   */
  getRealtimeStats: async () => {
    try {
      return await authAnalytics.getRealtimeStats();
    } catch (error) {
      logError(
        'Failed to get realtime stats',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  },
} as const;

/**
 * Combined utilities for common auth flows
 */
export const AuthFlowUtils = {
  /**
   * Handle sign-in with rate limiting and analytics
   */
  handleSignIn: async <T>(
    identifier: string,
    authMethod: 'email' | 'oauth' | 'passkey' | 'phone' | 'magic_link',
    authFunction: () => Promise<T>,
    options?: {
      provider?: string;
      skipRateLimit?: boolean;
    },
  ): Promise<{ success: boolean; data?: T; error?: string; rateLimited?: boolean }> => {
    const startTime = Date.now();

    try {
      // Check rate limit
      if (!options?.skipRateLimit) {
        const rateLimitResult = await RateLimitUtils.checkSignInLimit(identifier);

        if (!rateLimitResult.allowed) {
          await AnalyticsUtils.trackAuthFailure({
            method: authMethod,
            error: 'Rate limit exceeded',
            provider: options?.provider,
            duration: Date.now() - startTime,
          });

          return {
            success: false,
            error: 'Too many sign-in attempts. Please try again later.',
            rateLimited: true,
          };
        }
      }

      // Execute authentication
      const result = await authFunction();
      const duration = Date.now() - startTime;

      // Track success
      await AnalyticsUtils.trackAuthSuccess({
        method: authMethod,
        userId: (result as any)?.user?.id || 'unknown',
        sessionId: (result as any)?.session?.id || 'unknown',
        provider: options?.provider,
        duration,
      });

      return { success: true, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

      // Track failure
      await AnalyticsUtils.trackAuthFailure({
        method: authMethod,
        error: errorMessage,
        provider: options?.provider,
        duration,
      });

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Handle sign-up with rate limiting and analytics
   */
  handleSignUp: async <T>(
    identifier: string,
    authMethod: 'email' | 'oauth' | 'passkey' | 'phone',
    authFunction: () => Promise<T>,
    options?: {
      provider?: string;
      skipRateLimit?: boolean;
    },
  ): Promise<{ success: boolean; data?: T; error?: string; rateLimited?: boolean }> => {
    const _startTime = Date.now();

    try {
      // Check rate limit
      if (!options?.skipRateLimit) {
        const rateLimitResult = await RateLimitUtils.checkSignUpLimit(identifier);

        if (!rateLimitResult.allowed) {
          await AnalyticsUtils.trackRegistration({
            method: authMethod,
            success: false,
            error: 'Rate limit exceeded',
            provider: options?.provider,
          });

          return {
            success: false,
            error: 'Too many registration attempts. Please try again later.',
            rateLimited: true,
          };
        }
      }

      // Execute registration
      const result = await authFunction();

      // Track success
      await AnalyticsUtils.trackRegistration({
        method: authMethod,
        success: true,
        userId: (result as any)?.user?.id || 'unknown',
        provider: options?.provider,
      });

      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';

      // Track failure
      await AnalyticsUtils.trackRegistration({
        method: authMethod,
        success: false,
        error: errorMessage,
        provider: options?.provider,
      });

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Handle OTP operations with rate limiting and analytics
   */
  handleOTP: async <T>(
    identifier: string,
    otpType: 'email' | 'sms',
    action: 'send' | 'verify',
    otpFunction: () => Promise<T>,
    options?: {
      userId?: string;
      skipRateLimit?: boolean;
    },
  ): Promise<{ success: boolean; data?: T; error?: string; rateLimited?: boolean }> => {
    try {
      // Check rate limit for OTP sending
      if (action === 'send' && !options?.skipRateLimit) {
        const rateLimitResult = await RateLimitUtils.checkOTPLimit(identifier);

        if (!rateLimitResult.allowed) {
          await AnalyticsUtils.trackOTP({
            type: otpType,
            action,
            success: false,
            identifier,
            userId: options?.userId,
            error: 'Rate limit exceeded',
          });

          return {
            success: false,
            error: 'Too many OTP requests. Please try again later.',
            rateLimited: true,
          };
        }
      }

      // Execute OTP operation
      const result = await otpFunction();

      // Track success
      await AnalyticsUtils.trackOTP({
        type: otpType,
        action,
        success: true,
        identifier,
        userId: options?.userId,
      });

      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP operation failed';

      // Track failure
      await AnalyticsUtils.trackOTP({
        type: otpType,
        action,
        success: false,
        identifier,
        userId: options?.userId,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },
} as const;

// Export everything
export { authAnalytics, rateLimiter, RateLimitPresets };
