/**
 * Authentication Server Actions
 *
 * Handles sign in/out with analytics tracking and form validation using Better Auth
 */

'use server';

import { trackEvent } from '#/lib/analytics';
import { auth } from '#/lib/auth-config';
import { AuthAnalyticsEvents } from '#/lib/auth-events';
import { logInfo, logWarn } from '@repo/observability';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// Helper to safely get user role from Better Auth user object
function getUserRole(user: any): string {
  return user?.role || 'user';
}

// Sign in server action
export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'on';
  const redirectTo = (formData.get('redirectTo') as string) || '/';
  const isModal = formData.get('isModal') === 'true';

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

    // Use Better Auth API for sign in
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe,
      },
    });

    if (result?.user) {
      // Track successful login
      await trackEvent(AuthAnalyticsEvents.LOGIN_SUCCESS, {
        userId: result.user.id,
        userRole: getUserRole(result.user) || 'user',
        email: result.user.email,
        rememberMe,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Sign in successful', {
        userId: result.user.id,
        userRole: getUserRole(result.user) || 'user',
      });

      // For modal context, return success instead of redirecting
      if (isModal) {
        return {
          success: true,
          error: '',
          fields: { email, password: '' },
        };
      }

      // For non-modal context, redirect as normal
      redirect(redirectTo as any);
    } else {
      // Better Auth returns error or null, not a result object
      const errorMessage = 'Invalid email or password';

      // Track failed login
      await trackEvent(AuthAnalyticsEvents.LOGIN_FAILED, {
        email,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      logWarn('[Auth Action] Sign in failed', { email, error: errorMessage });

      return {
        success: false,
        error: errorMessage,
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

// Sign up server action
async function _signUpAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const redirectTo = (formData.get('redirectTo') as string) || '/';

  if (!name || !email || !password || !confirmPassword) {
    return {
      success: false,
      error: 'All fields are required',
      fields: { name, email, password: '', confirmPassword: '' },
    };
  }

  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Passwords do not match',
      fields: { name, email, password: '', confirmPassword: '' },
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long',
      fields: { name, email, password: '', confirmPassword: '' },
    };
  }

  try {
    // Track signup attempt
    await trackEvent(AuthAnalyticsEvents.LOGIN_ATTEMPT, {
      email,
      signUp: true,
      timestamp: new Date().toISOString(),
      userAgent: 'server-action',
    });

    logInfo('[Auth Action] Sign up attempt', { email, name });

    // Use Better Auth API for sign up
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (result?.user) {
      // Track successful signup
      await trackEvent(AuthAnalyticsEvents.LOGIN_SUCCESS, {
        userId: result.user.id,
        userRole: getUserRole(result.user) || 'user',
        email: result.user.email,
        signUp: true,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Sign up successful', {
        userId: result.user.id,
        userRole: getUserRole(result.user) || 'user',
      });

      redirect(redirectTo as any);
    } else {
      // Better Auth returns error or null, not a result object
      const errorMessage = 'Registration failed. User may already exist.';

      // Track failed signup
      await trackEvent(AuthAnalyticsEvents.LOGIN_FAILED, {
        email,
        error: errorMessage,
        signUp: true,
        timestamp: new Date().toISOString(),
      });

      logWarn('[Auth Action] Sign up failed', { email, error: errorMessage });

      return {
        success: false,
        error: errorMessage,
        fields: { name, email, password: '', confirmPassword: '' },
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';

    logWarn('[Auth Action] Sign up error', {
      email,
      error: errorMessage,
    });

    // Track error
    await trackEvent(AuthAnalyticsEvents.LOGIN_FAILED, {
      email,
      error: errorMessage,
      signUp: true,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: errorMessage,
      fields: { name, email, password: '', confirmPassword: '' },
    };
  }
}

// Sign out server action
export async function signOutAction() {
  try {
    // Get current session to track logout
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user) {
      // Track logout
      await trackEvent(AuthAnalyticsEvents.LOGOUT, {
        userId: session.user.id,
        userRole: getUserRole(session.user) || 'user',
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Sign out', { userId: session.user.id });
    }

    // Use Better Auth API for sign out
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect('/');
  } catch (error) {
    logWarn('[Auth Action] Sign out error', {
      error: error instanceof Error ? error.message : String(error),
    });
    redirect('/');
  }
}

// Get current user action (for client components)
async function _getCurrentUserAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return { success: true, user: session?.user || null };
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const user = session?.user;

    if (user) {
      await trackEvent(AuthAnalyticsEvents.PROFILE_VIEW, {
        userId: user.id,
        userRole: getUserRole(user),
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
async function _trackProtectedAccessAction(feature: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const user = session?.user;

    if (user) {
      await trackEvent(AuthAnalyticsEvents.PROTECTED_ACCESS, {
        userId: user.id,
        userRole: getUserRole(user),
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
async function _trackAuthFeatureFlagAction(flagName: string, flagResult: any, context?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const user = session?.user;

    if (user) {
      await trackEvent(AuthAnalyticsEvents.FEATURE_FLAG_AUTH_EVALUATED, {
        userId: user.id,
        userRole: getUserRole(user),
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const user = session?.user;

    if (user) {
      await trackEvent(AuthAnalyticsEvents.ROLE_BASED_FEATURE_USED, {
        userId: user.id,
        userRole: getUserRole(user) || 'user',
        feature,
        featureLevel,
        timestamp: new Date().toISOString(),
      });

      logInfo('[Auth Action] Role-based feature tracked', {
        userId: user.id,
        userRole: getUserRole(user) || 'user',
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const user = session?.user;

    if (user) {
      await trackEvent(AuthAnalyticsEvents.PERSONALIZED_CONTENT_VIEWED, {
        userId: user.id,
        userRole: getUserRole(user),
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const user = session?.user;

    if (user) {
      await trackEvent(AuthAnalyticsEvents.PREMIUM_FEATURE_PREVIEWED, {
        userId: user.id,
        userRole: getUserRole(user),
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
async function _trackAuthFlowCompletedAction(flowType: 'login' | 'logout', duration?: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const user = session?.user;

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
