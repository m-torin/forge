/**
 * Auth-aware Feature Flag Utilities
 *
 * Helper functions for evaluating feature flags based on authentication state
 */

import type { AuthContext } from '#/lib/auth';
import {
  adminDashboardFeatures,
  enhancedAuthAnalytics,
  personalizedExperience,
  premiumFeaturePreview,
} from '#/lib/flags';

/**
 * Context for auth-aware flag evaluation
 */
export interface AuthFlagContext {
  authContext: AuthContext;
}

/**
 * Evaluate auth-specific feature flags based on user context
 */
export async function evaluateAuthFlags(context: AuthFlagContext) {
  const { authContext } = context;

  // Base flag evaluations
  let adminFeatures = false;
  let enhancedAnalytics = false;
  let personalizedExp = false;
  let premiumPreview = 'none';

  if (authContext.isAuthenticated && authContext.user) {
    const { user } = authContext;

    // Admin features - only evaluate for admin users
    if (user.role === 'admin') {
      adminFeatures = await adminDashboardFeatures();
    }

    // Enhanced analytics for authenticated users
    enhancedAnalytics = await enhancedAuthAnalytics();

    // Personalized experience for authenticated users
    personalizedExp = await personalizedExperience();

    // Premium feature preview based on user role
    const premiumFlags = await premiumFeaturePreview();

    // Bias premium features based on user role
    if (user.role === 'admin') {
      // Admins get higher chance of advanced features
      premiumPreview = premiumFlags === 'none' ? 'basic' : premiumFlags;
    } else {
      premiumPreview = premiumFlags;
    }
  }

  return {
    adminDashboardFeatures: adminFeatures,
    enhancedAuthAnalytics: enhancedAnalytics,
    personalizedExperience: personalizedExp,
    premiumFeaturePreview: premiumPreview,
  };
}

/**
 * Get comprehensive flag results including auth-aware flags
 */
export async function getAllFlagResults(authContext: AuthContext) {

  // Import the base flags dynamically to avoid circular dependencies
  const { showLanguageSwitcher, welcomeMessageVariant, enhancedFeatureCards, showBetaBanner } =
    await import('#/lib/flags');

  // Evaluate base flags
  const baseFlags = {
    showLangSwitcher: await showLanguageSwitcher(),
    welcomeVariant: await welcomeMessageVariant(),
    enhancedCards: await enhancedFeatureCards(),
    showBanner: await showBetaBanner(),
  };

  // Evaluate auth-aware flags
  const authFlags = await evaluateAuthFlags({
    authContext,
  });

  return {
    ...baseFlags,
    ...authFlags,
  };
}

/**
 * Check if user should see premium features based on flag and role
 */
export function shouldShowPremiumFeatures(premiumPreview: string, userRole?: string): boolean {
  if (!userRole) return false;

  switch (premiumPreview) {
    case 'full':
      return true;
    case 'advanced':
      return userRole === 'admin' || Math.random() > 0.5;
    case 'basic':
      return userRole === 'admin' || Math.random() > 0.7;
    default:
      return false;
  }
}

/**
 * Get analytics configuration based on auth and flags
 */
export function getAnalyticsConfig(enhancedAnalytics: boolean, authContext: AuthContext) {
  const baseConfig = {
    trackPageViews: true,
    trackClicks: true,
    trackHovers: false,
  };

  if (!authContext.isAuthenticated || !enhancedAnalytics) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    trackHovers: true,
    trackScrollDepth: true,
    trackTimeOnPage: true,
    trackUserInteractions: true,
    customDimensions: {
      userRole: authContext.user?.role,
      userId: authContext.user?.id,
    },
  };
}
