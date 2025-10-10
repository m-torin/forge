/**
 * User Journey Tracking Operations
 * Standard operations for user lifecycle and journey tracking
 */

import type { AnalyticsEvent } from '../types';

export interface UserJourneyEvent extends AnalyticsEvent {
  userId?: string;
  sessionId?: string;
  sequence?: number;
  timestamp: Date | string;
}

export interface RegistrationEvent extends UserJourneyEvent {
  name: 'user_registered';
  properties: {
    method: 'email' | 'social' | 'phone' | 'sso';
    provider?: string;
    source?: string;
    campaign?: string;
  };
}

export interface LoginEvent extends UserJourneyEvent {
  name: 'user_logged_in';
  properties: {
    method: 'email' | 'social' | 'phone' | 'sso';
    provider?: string;
    remember_me?: boolean;
    session_duration?: number;
  };
}

export interface LogoutEvent extends UserJourneyEvent {
  name: 'user_logged_out';
  properties: {
    session_duration?: number;
    reason?: 'manual' | 'timeout' | 'forced';
  };
}

export interface OnboardingEvent extends UserJourneyEvent {
  name: 'onboarding_step_completed' | 'onboarding_completed' | 'onboarding_skipped';
  properties: {
    step_name?: string;
    step_number?: number;
    total_steps?: number;
    completion_time?: number;
  };
}

export interface SubscriptionEvent extends UserJourneyEvent {
  name:
    | 'subscription_started'
    | 'subscription_upgraded'
    | 'subscription_downgraded'
    | 'subscription_cancelled';
  properties: {
    plan_name: string;
    plan_price: number;
    billing_cycle: 'monthly' | 'yearly' | 'weekly';
    currency: string;
    payment_method?: string;
    previous_plan?: string;
    cancellation_reason?: string;
  };
}

export interface EngagementEvent extends UserJourneyEvent {
  name: 'feature_used' | 'content_viewed' | 'action_performed';
  properties: {
    feature_name?: string;
    content_type?: string;
    content_id?: string;
    action_type?: string;
    engagement_duration?: number;
  };
}

// Registration tracking functions
export function createRegistrationEvent(
  userId: string,
  method: RegistrationEvent['properties']['method'],
  options: Partial<RegistrationEvent['properties']> = {},
): RegistrationEvent {
  return {
    name: 'user_registered',
    userId,
    timestamp: new Date(),
    properties: {
      method,
      ...options,
    },
  };
}

// Login/Logout tracking functions
export function createLoginEvent(
  userId: string,
  method: LoginEvent['properties']['method'],
  options: Partial<LoginEvent['properties']> = {},
): LoginEvent {
  return {
    name: 'user_logged_in',
    userId,
    timestamp: new Date(),
    properties: {
      method,
      ...options,
    },
  };
}

export function createLogoutEvent(
  userId: string,
  options: Partial<LogoutEvent['properties']> = {},
): LogoutEvent {
  return {
    name: 'user_logged_out',
    userId,
    timestamp: new Date(),
    properties: {
      ...options,
    },
  };
}

// Onboarding tracking functions
export function createOnboardingEvent(
  userId: string,
  eventType: OnboardingEvent['name'],
  options: Partial<OnboardingEvent['properties']> = {},
): OnboardingEvent {
  return {
    name: eventType,
    userId,
    timestamp: new Date(),
    properties: {
      ...options,
    },
  };
}

// Subscription tracking functions
export function createSubscriptionEvent(
  userId: string,
  eventType: SubscriptionEvent['name'],
  planDetails: Pick<
    SubscriptionEvent['properties'],
    'plan_name' | 'plan_price' | 'billing_cycle' | 'currency'
  >,
  options: Partial<
    Omit<SubscriptionEvent['properties'], 'plan_name' | 'plan_price' | 'billing_cycle' | 'currency'>
  > = {},
): SubscriptionEvent {
  return {
    name: eventType,
    userId,
    timestamp: new Date(),
    properties: {
      ...planDetails,
      ...options,
    },
  };
}

// Engagement tracking functions
export function createEngagementEvent(
  userId: string,
  eventType: EngagementEvent['name'],
  options: Partial<EngagementEvent['properties']> = {},
): EngagementEvent {
  return {
    name: eventType,
    userId,
    timestamp: new Date(),
    properties: {
      ...options,
    },
  };
}

// Higher-level convenience functions
export function trackUserRegistration(
  userId: string,
  method: RegistrationEvent['properties']['method'],
  source?: string,
  campaign?: string,
): RegistrationEvent {
  return createRegistrationEvent(userId, method, { source, campaign });
}

export function trackUserLogin(
  userId: string,
  method: LoginEvent['properties']['method'],
  provider?: string,
): LoginEvent {
  return createLoginEvent(userId, method, { provider });
}

export function trackUserLogout(
  userId: string,
  sessionDuration?: number,
  reason: LogoutEvent['properties']['reason'] = 'manual',
): LogoutEvent {
  return createLogoutEvent(userId, { session_duration: sessionDuration, reason });
}

export function trackOnboardingStep(
  userId: string,
  stepName: string,
  stepNumber: number,
  totalSteps: number,
): OnboardingEvent {
  return createOnboardingEvent(userId, 'onboarding_step_completed', {
    step_name: stepName,
    step_number: stepNumber,
    total_steps: totalSteps,
  });
}

export function trackSubscriptionChange(
  userId: string,
  action: 'started' | 'upgraded' | 'downgraded' | 'cancelled',
  planName: string,
  planPrice: number,
  billingCycle: SubscriptionEvent['properties']['billing_cycle'],
  currency: string,
  options: Partial<SubscriptionEvent['properties']> = {},
): SubscriptionEvent {
  return createSubscriptionEvent(
    userId,
    `subscription_${action}` as SubscriptionEvent['name'],
    { plan_name: planName, plan_price: planPrice, billing_cycle: billingCycle, currency },
    options,
  );
}

export function trackFeatureUsage(
  userId: string,
  featureName: string,
  engagementDuration?: number,
): EngagementEvent {
  return createEngagementEvent(userId, 'feature_used', {
    feature_name: featureName,
    engagement_duration: engagementDuration,
  });
}
