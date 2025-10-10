/**
 * PostHog event operations
 */

import type { PostHogEvent } from '../types';

export function createCustomEvent(
  eventName: string,
  properties?: Record<string, any>,
  distinctId?: string,
  groups?: Record<string, string>,
): PostHogEvent {
  return {
    event: eventName,
    properties,
    distinctId,
    groups,
    sendFeatureFlags: true,
    timestamp: new Date().toISOString(),
  };
}

export function trackPageView(
  url: string,
  title?: string,
  distinctId?: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: '$pageview',
    properties: {
      $current_url: url,
      $title: title,
      $pathname: new URL(url).pathname,
      $search: new URL(url).search,
      $hash: new URL(url).hash,
      ...properties,
    },
    distinctId,
  };
}

export function trackUserSignup(
  distinctId: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'User Signed Up',
    properties: {
      signup_method: properties?.method || 'unknown',
      ...properties,
    },
    distinctId,
  };
}

export function trackPurchase(
  distinctId: string,
  revenue: number,
  currency = 'USD',
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Purchase',
    properties: {
      $revenue: revenue,
      $currency: currency,
      ...properties,
    },
    distinctId,
  };
}

export function trackSubscription(
  distinctId: string,
  planName: string,
  planPrice: number,
  currency = 'USD',
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Subscription Created',
    properties: {
      plan_name: planName,
      plan_price: planPrice,
      currency,
      ...properties,
    },
    distinctId,
  };
}

export function trackConversion(
  distinctId: string,
  conversionType: string,
  value?: number,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Conversion',
    properties: {
      conversion_type: conversionType,
      conversion_value: value,
      ...properties,
    },
    distinctId,
  };
}

export function trackFeatureUsage(
  featureName: string,
  distinctId: string,
  usageCount = 1,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Feature Used',
    properties: {
      feature_name: featureName,
      usage_count: usageCount,
      ...properties,
    },
    distinctId,
  };
}

export function trackError(
  errorMessage: string,
  errorType?: string,
  distinctId?: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Error Occurred',
    properties: {
      error_message: errorMessage,
      error_type: errorType,
      $current_url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...properties,
    },
    distinctId,
  };
}

export function trackSearch(
  query: string,
  resultsCount?: number,
  distinctId?: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Search Performed',
    properties: {
      search_query: query,
      search_results_count: resultsCount,
      ...properties,
    },
    distinctId,
  };
}

export function trackEngagement(
  engagementType: 'like' | 'share' | 'comment' | 'view' | 'click',
  target: string,
  distinctId: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Content Engagement',
    properties: {
      engagement_type: engagementType,
      engagement_target: target,
      ...properties,
    },
    distinctId,
  };
}

export function trackFormSubmission(
  formName: string,
  distinctId: string,
  success = true,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Form Submitted',
    properties: {
      form_name: formName,
      form_success: success,
      ...properties,
    },
    distinctId,
  };
}

export function trackDownload(
  fileName: string,
  fileType?: string,
  distinctId?: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'File Downloaded',
    properties: {
      file_name: fileName,
      file_type: fileType,
      ...properties,
    },
    distinctId,
  };
}

export function trackSocialShare(
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'tiktok' | 'other',
  content: string,
  distinctId: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Content Shared',
    properties: {
      share_platform: platform,
      share_content: content,
      ...properties,
    },
    distinctId,
  };
}

export function trackVideoPlayback(
  videoTitle: string,
  action: 'play' | 'pause' | 'complete' | 'seek',
  position?: number,
  duration?: number,
  distinctId?: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Video Playback',
    properties: {
      video_title: videoTitle,
      playback_action: action,
      video_position: position,
      video_duration: duration,
      ...properties,
    },
    distinctId,
  };
}

export function trackOnboarding(
  step: string,
  stepNumber: number,
  completed = false,
  distinctId: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Onboarding Step',
    properties: {
      onboarding_step: step,
      step_number: stepNumber,
      step_completed: completed,
      ...properties,
    },
    distinctId,
  };
}

export function trackABTestExposure(
  testName: string,
  variant: string,
  distinctId: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'A/B Test Exposure',
    properties: {
      test_name: testName,
      test_variant: variant,
      ...properties,
    },
    distinctId,
  };
}

// Session and lifecycle events
export function trackSessionStart(
  distinctId: string,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Session Started',
    properties: {
      session_start_time: new Date().toISOString(),
      ...properties,
    },
    distinctId,
  };
}

export function trackSessionEnd(
  distinctId: string,
  sessionDuration: number,
  properties?: Record<string, any>,
): PostHogEvent {
  return {
    event: 'Session Ended',
    properties: {
      session_duration: sessionDuration,
      session_end_time: new Date().toISOString(),
      ...properties,
    },
    distinctId,
  };
}
