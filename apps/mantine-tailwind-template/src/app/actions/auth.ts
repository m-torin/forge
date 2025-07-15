/**
 * Authentication Server Actions
 *
 * Handles sign in/out with analytics tracking and form validation
 */

'use server';

import { trackEvent } from '#/lib/analytics';
import { getCurrentUser, signIn, signOut } from '#/lib/auth';
import { AuthAnalyticsEvents } from '#/lib/auth-events';
import { logInfo, logWarn } from '@repo/observability';
import { redirect } from 'next/navigation';

// Sign in server action
export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'on';
  const redirectTo = (formData.get('redirectTo') as string) || '/';

  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required',
      fields: { email, password: '' },
    };
  }

  try {
    // Track login attempt
    await trackEvent(AuthAnalyticsEvents.LOGIN_ATTEMPT, {
      email,
      rememberMe,
      timestamp: new Date().toISOString(),
      userAgent: 'server-action', // Server actions don't have access to user agent
    });

    logInfo('[Auth Action] Sign in attempt', { email });

    const result = await signIn(email, password);

    if (result.success && result.user) {
      // Track successful login
      await trackEvent(AuthAnalyticsEvents.LOGIN_SUCCESS, {
        userId: result.user.id,
        userRole: result.user.role,
        email: result.user.email,
        rememberMe,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Sign in successful', {
        userId: result.user.id,
        userRole: result.user.role,
      });

      redirect(redirectTo);
    } else {
      // Track failed login
      await trackEvent(AuthAnalyticsEvents.LOGIN_FAILED, {
        email,
        error: result.error,
        timestamp: new Date().toISOString(),
      });

      logWarn('[Auth Action] Sign in failed', { email, error: result.error });

      return {
        success: false,
        error: result.error || 'Authentication failed',
        fields: { email, password: '' },
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';

    logWarn('[Auth Action] Sign in error', {
      email,
      error: errorMessage,
    });

    // Track error
    await trackEvent(AuthAnalyticsEvents.LOGIN_FAILED, {
      email,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: errorMessage,
      fields: { email, password: '' },
    };
  }
}

// Sign out server action
export async function signOutAction() {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Track logout
      await trackEvent(AuthAnalyticsEvents.LOGOUT, {
        userId: user.id,
        userRole: user.role,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Sign out', { userId: user.id });
    }

    await signOut();
    redirect('/');
  } catch (error) {
    logWarn('[Auth Action] Sign out error', {
      error: error instanceof Error ? error.message : String(error),
    });
    redirect('/');
  }
}

// Get current user action (for client components)
export async function getCurrentUserAction() {
  try {
    const user = await getCurrentUser();
    return { success: true, user };
  } catch (error) {
    logWarn('[Auth Action] Get current user error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, user: null };
  }
}

// Track profile view (for analytics)
export async function trackProfileViewAction() {
  try {
    const user = await getCurrentUser();

    if (user) {
      await trackEvent(AuthAnalyticsEvents.PROFILE_VIEW, {
        userId: user.id,
        userRole: user.role,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Profile view tracked', { userId: user.id });
    }
  } catch (error) {
    logWarn('[Auth Action] Profile view tracking error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Track protected feature access
export async function trackProtectedAccessAction(feature: string) {
  try {
    const user = await getCurrentUser();

    if (user) {
      await trackEvent(AuthAnalyticsEvents.PROTECTED_ACCESS, {
        userId: user.id,
        userRole: user.role,
        feature,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Protected access tracked', {
        userId: user.id,
        feature,
      });
    }
  } catch (error) {
    logWarn('[Auth Action] Protected access tracking error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Track auth-specific feature flag evaluations
export async function trackAuthFeatureFlagAction(
  flagName: string,
  flagResult: any,
  context?: string,
) {
  try {
    const user = await getCurrentUser();

    if (user) {
      await trackEvent(AuthAnalyticsEvents.FEATURE_FLAG_AUTH_EVALUATED, {
        userId: user.id,
        userRole: user.role,
        flagName,
        flagResult,
        context,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Auth feature flag tracked', {
        userId: user.id,
        flagName,
        flagResult,
      });
    }
  } catch (error) {
    logWarn('[Auth Action] Auth feature flag tracking error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Track role-based feature usage
export async function trackRoleBasedFeatureAction(feature: string, featureLevel?: string) {
  try {
    const user = await getCurrentUser();

    if (user) {
      await trackEvent(AuthAnalyticsEvents.ROLE_BASED_FEATURE_USED, {
        userId: user.id,
        userRole: user.role,
        feature,
        featureLevel,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Role-based feature tracked', {
        userId: user.id,
        userRole: user.role,
        feature,
      });
    }
  } catch (error) {
    logWarn('[Auth Action] Role-based feature tracking error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Track personalized content views
export async function trackPersonalizedContentAction(contentType: string, contentId?: string) {
  try {
    const user = await getCurrentUser();

    if (user) {
      await trackEvent(AuthAnalyticsEvents.PERSONALIZED_CONTENT_VIEWED, {
        userId: user.id,
        userRole: user.role,
        contentType,
        contentId,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Personalized content tracked', {
        userId: user.id,
        contentType,
      });
    }
  } catch (error) {
    logWarn('[Auth Action] Personalized content tracking error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Track premium feature previews
export async function trackPremiumFeaturePreviewAction(feature: string, previewLevel: string) {
  try {
    const user = await getCurrentUser();

    if (user) {
      await trackEvent(AuthAnalyticsEvents.PREMIUM_FEATURE_PREVIEWED, {
        userId: user.id,
        userRole: user.role,
        feature,
        previewLevel,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Premium feature preview tracked', {
        userId: user.id,
        feature,
        previewLevel,
      });
    }
  } catch (error) {
    logWarn('[Auth Action] Premium feature preview tracking error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Track complete authentication flow
export async function trackAuthFlowCompletedAction(
  flowType: 'login' | 'logout',
  duration?: number,
) {
  try {
    const user = await getCurrentUser();

    if (user || flowType === 'logout') {
      await trackEvent(AuthAnalyticsEvents.AUTH_FLOW_COMPLETED, {
        userId: user?.id,
        userRole: user?.role,
        flowType,
        duration,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Auth flow completed tracked', {
        userId: user?.id,
        flowType,
        duration,
      });
    }
  } catch (error) {
    logWarn('[Auth Action] Auth flow completion tracking error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
