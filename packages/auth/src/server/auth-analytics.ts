/**
 * Authentication Analytics Service
 * Tracks auth events using the analytics emitters package
 */

import { logError, logInfo } from '@repo/observability/server/next';
import 'server-only';

import type { RateLimitResult } from './rate-limiter';

// Analytics event types
export interface AuthAnalyticsEvent {
  /** Event timestamp */
  timestamp: number;
  /** Event type */
  event: AuthEventType;
  /** User ID (if available) */
  userId?: string;
  /** Session ID */
  sessionId?: string;
  /** User agent */
  userAgent?: string;
  /** IP address */
  ipAddress?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Success/failure status */
  success: boolean;
  /** Error message (if failed) */
  error?: string;
  /** Duration in milliseconds */
  duration?: number;
  /** Geographic location */
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export type AuthEventType =
  // Authentication events
  | 'auth.signin.email'
  | 'auth.signin.oauth'
  | 'auth.signin.passkey'
  | 'auth.signin.phone'
  | 'auth.signin.magic_link'
  | 'auth.signin.anonymous'
  | 'auth.signup.email'
  | 'auth.signup.oauth'
  | 'auth.signup.passkey'
  | 'auth.signup.phone'
  | 'auth.signout'

  // Password operations
  | 'auth.password.forgot'
  | 'auth.password.reset'
  | 'auth.password.change'

  // Email operations
  | 'auth.email.verify'
  | 'auth.email.change'
  | 'auth.magic_link.send'
  | 'auth.magic_link.verify'
  | 'auth.email_otp.send'
  | 'auth.email_otp.verify'

  // Phone operations
  | 'auth.phone.add'
  | 'auth.phone.verify'
  | 'auth.sms_otp.send'
  | 'auth.sms_otp.verify'

  // Two-factor authentication
  | 'auth.2fa.enable'
  | 'auth.2fa.disable'
  | 'auth.2fa.verify'
  | 'auth.2fa.backup_codes'

  // Passkey operations
  | 'auth.passkey.add'
  | 'auth.passkey.delete'
  | 'auth.passkey.list'

  // Organization operations
  | 'auth.org.create'
  | 'auth.org.join'
  | 'auth.org.leave'
  | 'auth.org.invite'
  | 'auth.org.remove_member'

  // Session operations
  | 'auth.session.create'
  | 'auth.session.refresh'
  | 'auth.session.revoke'
  | 'auth.session.switch'

  // Security events
  | 'auth.rate_limit.exceeded'
  | 'auth.suspicious.activity'
  | 'auth.account.locked'
  | 'auth.account.unlocked'

  // API key operations
  | 'auth.api_key.create'
  | 'auth.api_key.revoke'
  | 'auth.api_key.use';

export interface AuthAnalyticsMetrics {
  /** Total authentication attempts */
  totalAttempts: number;
  /** Successful authentications */
  successfulAuth: number;
  /** Failed authentications */
  failedAuth: number;
  /** Success rate percentage */
  successRate: number;
  /** Active sessions */
  activeSessions: number;
  /** New user registrations */
  newUsers: number;
  /** Rate limit violations */
  rateLimitViolations: number;
  /** Most popular auth methods */
  authMethods: Record<string, number>;
  /** Geographic distribution */
  locations: Record<string, number>;
  /** Time-based metrics */
  timeMetrics: {
    hourly: Record<string, number>;
    daily: Record<string, number>;
    weekly: Record<string, number>;
  };
}

/**
 * Authentication Analytics Service
 */
export class AuthAnalytics {
  private analyticsEmitter: any = null;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.AUTH_FEATURES_ANALYTICS !== 'false';
    this.initializeAnalytics();
  }

  private async initializeAnalytics() {
    if (!this.enabled) {
      logInfo('Auth analytics disabled');
      return;
    }

    try {
      // Dynamic import to avoid bundling analytics in client
      const { track, identify, createServerAnalytics } = await import(
        '@repo/analytics/server/next'
      );

      // Create analytics instance with proper configuration
      this.analyticsEmitter = createServerAnalytics({
        debug: process.env.NODE_ENV === 'development',
        providers: {
          console: {
            events: 'all',
          },
        },
      });

      // Store the track and identify functions for easy access
      (this.analyticsEmitter as any).track = track;
      (this.analyticsEmitter as any).identify = identify;

      logInfo('Auth analytics initialized');
    } catch (error) {
      logError(
        'Failed to initialize auth analytics',
        error instanceof Error ? error : new Error(String(error)),
      );
      this.enabled = false;
    }
  }

  /**
   * Track an authentication event
   */
  async trackEvent(
    event: Partial<AuthAnalyticsEvent> & { event: AuthEventType; success: boolean },
  ): Promise<void> {
    if (!this.enabled || !this.analyticsEmitter) {
      return;
    }

    try {
      const fullEvent: AuthAnalyticsEvent = {
        timestamp: Date.now(),
        ...event,
      };

      await this.analyticsEmitter.track('auth_event', fullEvent);

      // Also track metrics
      await this.updateMetrics(fullEvent);
    } catch (error) {
      logError(
        'Failed to track auth event',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Track authentication attempt
   */
  async trackAuthAttempt(params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone' | 'magic_link' | 'anonymous';
    success: boolean;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    duration?: number;
    error?: string;
    provider?: string; // For OAuth
  }): Promise<void> {
    const eventType = params.success
      ? (`auth.signin.${params.method}` as AuthEventType)
      : (`auth.signin.${params.method}` as AuthEventType);

    await this.trackEvent({
      event: eventType,
      success: params.success,
      userId: params.userId,
      sessionId: params.sessionId,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      duration: params.duration,
      error: params.error,
      metadata: {
        method: params.method,
        provider: params.provider,
      },
    });
  }

  /**
   * Track user registration
   */
  async trackRegistration(params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone';
    success: boolean;
    userId?: string;
    userAgent?: string;
    ipAddress?: string;
    error?: string;
    provider?: string;
  }): Promise<void> {
    await this.trackEvent({
      event: `auth.signup.${params.method}` as AuthEventType,
      success: params.success,
      userId: params.userId,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      error: params.error,
      metadata: {
        method: params.method,
        provider: params.provider,
      },
    });
  }

  /**
   * Track rate limit violation
   */
  async trackRateLimit(params: {
    key: string;
    ipAddress?: string;
    userId?: string;
    limit: number;
    current: number;
    rateLimitResult: RateLimitResult;
  }): Promise<void> {
    await this.trackEvent({
      event: 'auth.rate_limit.exceeded',
      success: false,
      userId: params.userId,
      ipAddress: params.ipAddress,
      metadata: {
        rateLimitKey: params.key,
        limit: params.limit,
        current: params.current,
        algorithm: 'sliding-window', // Could be dynamic
        remaining: params.rateLimitResult.remaining,
        resetTime: params.rateLimitResult.resetTime,
      },
    });
  }

  /**
   * Track security event
   */
  async trackSecurityEvent(params: {
    event: 'suspicious.activity' | 'account.locked' | 'account.unlocked';
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.trackEvent({
      event: `auth.${params.event}` as AuthEventType,
      success: false,
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      error: params.reason,
      metadata: params.metadata,
    });
  }

  /**
   * Track OTP operations
   */
  async trackOTP(params: {
    type: 'email' | 'sms';
    action: 'send' | 'verify';
    success: boolean;
    identifier: string; // email or phone
    userId?: string;
    ipAddress?: string;
    error?: string;
  }): Promise<void> {
    const eventType =
      params.type === 'email'
        ? (`auth.email_otp.${params.action}` as AuthEventType)
        : (`auth.sms_otp.${params.action}` as AuthEventType);

    await this.trackEvent({
      event: eventType,
      success: params.success,
      userId: params.userId,
      ipAddress: params.ipAddress,
      error: params.error,
      metadata: {
        identifier: params.identifier,
        otpType: params.type,
      },
    });
  }

  /**
   * Track organization operations
   */
  async trackOrganization(params: {
    action: 'create' | 'join' | 'leave' | 'invite' | 'remove_member';
    success: boolean;
    userId?: string;
    organizationId?: string;
    targetUserId?: string; // For invite/remove operations
    ipAddress?: string;
    error?: string;
  }): Promise<void> {
    await this.trackEvent({
      event: `auth.org.${params.action}` as AuthEventType,
      success: params.success,
      userId: params.userId,
      ipAddress: params.ipAddress,
      error: params.error,
      metadata: {
        organizationId: params.organizationId,
        targetUserId: params.targetUserId,
      },
    });
  }

  /**
   * Update aggregated metrics
   */
  private async updateMetrics(event: AuthAnalyticsEvent): Promise<void> {
    try {
      // Use analytics emitter to update metrics
      await this.analyticsEmitter.increment('auth_metrics', {
        event_type: event.event,
        success: event.success,
        timestamp: event.timestamp,
        user_id: event.userId,
        ip_address: event.ipAddress,
      });

      // Track hourly metrics
      const hour = new Date(event.timestamp).toISOString().slice(0, 13);
      await this.analyticsEmitter.increment(`auth_hourly_${hour}`, {
        event_type: event.event,
        success: event.success,
      });
    } catch (error) {
      logError(
        'Failed to update auth metrics',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Get authentication metrics for a time period
   */
  async getMetrics(params: {
    startDate: Date;
    endDate: Date;
    userId?: string;
    organizationId?: string;
  }): Promise<AuthAnalyticsMetrics | null> {
    if (!this.enabled || !this.analyticsEmitter) {
      return null;
    }

    try {
      // Query analytics data
      const metrics = await this.analyticsEmitter.query('auth_metrics', {
        start_date: params.startDate.toISOString(),
        end_date: params.endDate.toISOString(),
        user_id: params.userId,
        organization_id: params.organizationId,
      });

      return this.processMetrics(metrics);
    } catch (error) {
      logError(
        'Failed to get auth metrics',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }

  /**
   * Process raw metrics into structured format
   */
  private processMetrics(rawMetrics: any): AuthAnalyticsMetrics {
    // This would process the raw analytics data into the structured format
    // Implementation depends on the analytics package structure

    return {
      totalAttempts: rawMetrics.total_attempts || 0,
      successfulAuth: rawMetrics.successful_auth || 0,
      failedAuth: rawMetrics.failed_auth || 0,
      successRate: rawMetrics.success_rate || 0,
      activeSessions: rawMetrics.active_sessions || 0,
      newUsers: rawMetrics.new_users || 0,
      rateLimitViolations: rawMetrics.rate_limit_violations || 0,
      authMethods: rawMetrics.auth_methods || {},
      locations: rawMetrics.locations || {},
      timeMetrics: {
        hourly: rawMetrics.hourly || {},
        daily: rawMetrics.daily || {},
        weekly: rawMetrics.weekly || {},
      },
    };
  }

  /**
   * Get real-time auth statistics
   */
  async getRealtimeStats(): Promise<{
    activeUsers: number;
    recentSignIns: number;
    failedAttempts: number;
    rateLimitViolations: number;
  } | null> {
    if (!this.enabled || !this.analyticsEmitter) {
      return null;
    }

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const stats = await this.analyticsEmitter.query('auth_realtime', {
        start_date: oneHourAgo.toISOString(),
        end_date: now.toISOString(),
      });

      return {
        activeUsers: stats.active_users || 0,
        recentSignIns: stats.recent_signins || 0,
        failedAttempts: stats.failed_attempts || 0,
        rateLimitViolations: stats.rate_limit_violations || 0,
      };
    } catch (error) {
      logError(
        'Failed to get realtime auth stats',
        error instanceof Error ? error : new Error(String(error)),
      );
      return null;
    }
  }
}

// Export singleton instance
export const authAnalytics = new AuthAnalytics();

/**
 * Helper functions for common tracking scenarios
 */
export const AuthAnalyticsHelpers = {
  /**
   * Track successful sign-in
   */
  signInSuccess: (params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone' | 'magic_link';
    userId: string;
    sessionId: string;
    userAgent?: string;
    ipAddress?: string;
    duration?: number;
    provider?: string;
  }) => authAnalytics.trackAuthAttempt({ ...params, success: true }),

  /**
   * Track failed sign-in
   */
  signInFailure: (params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone' | 'magic_link';
    userAgent?: string;
    ipAddress?: string;
    duration?: number;
    error: string;
    provider?: string;
  }) => authAnalytics.trackAuthAttempt({ ...params, success: false }),

  /**
   * Track successful registration
   */
  signUpSuccess: (params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone';
    userId: string;
    userAgent?: string;
    ipAddress?: string;
    provider?: string;
  }) => authAnalytics.trackRegistration({ ...params, success: true }),

  /**
   * Track failed registration
   */
  signUpFailure: (params: {
    method: 'email' | 'oauth' | 'passkey' | 'phone';
    userAgent?: string;
    ipAddress?: string;
    error: string;
    provider?: string;
  }) => authAnalytics.trackRegistration({ ...params, success: false }),
} as const;
