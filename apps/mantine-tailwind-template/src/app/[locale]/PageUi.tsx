'use client';

/**
 * Home Page UI Component with Analytics Tracking and Authentication
 *
 * Client component that handles all UI interactions, analytics emitters, and auth state
 */

import { AnalyticsDemo } from '#/components/analytics-demo';
import { AnimatedMenuIcon } from '#/components/AnimatedMenuIcon';
import { UserDropdown } from '#/components/auth/UserDropdown';
import { ColorSchemesSwitcher } from '#/components/color-schemes-switcher';
import { LanguageSwitcher } from '#/components/language-switcher';
import { useSidebar } from '#/components/SidebarProvider';
import { AnalyticsEvents, trackEvent, trackPageView } from '#/lib/analytics';
import { useAuth } from '#/lib/auth-client';
import { ActionIcon, Button, Card } from '@mantine/core';
import { logInfo, logWarn } from '@repo/observability';
import { IconBrandNextjs, IconBrandTailwind, IconLogin, IconUserPlus } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useEffect } from 'react';
// Moved shouldShowPremiumFeatures to avoid next/headers import issue
import {
  trackPersonalizedContentAction,
  trackPremiumFeaturePreviewAction,
  trackRoleBasedFeatureAction,
} from '#/app/actions/auth';
import type { AuthContext } from '#/lib/auth-context';
import type { Locale } from '#/lib/i18n';

interface PageUiProps {
  locale: Locale;
  dict: {
    header: { title: string };
    home: {
      welcome: string;
      description: string;
      features: {
        nextjs: { title: string; description: string };
        mantine: { title: string; description: string };
        tailwind: { title: string; description: string };
      };
    };
  };
  // Feature flag evaluation results from server (including auth-aware flags)
  flagResults: {
    showLangSwitcher: boolean;
    welcomeVariant: string;
    enhancedCards: boolean;
    showBanner: boolean;
    adminDashboardFeatures: boolean;
    enhancedAuthAnalytics: boolean;
    personalizedExperience: boolean;
    premiumFeaturePreview: string;
  };
  // Authentication context
  authContext: AuthContext;
}

export default function PageUi({
  locale,
  dict,
  flagResults,
  authContext: _authContext,
}: PageUiProps) {
  const {
    showLangSwitcher,
    welcomeVariant,
    enhancedCards,
    showBanner,
    adminDashboardFeatures,
    enhancedAuthAnalytics,
    personalizedExperience,
    premiumFeaturePreview,
  } = flagResults;

  const sidebar = useSidebar();
  const clientAuth = useAuth(); // Use client-side auth state for reactive updates

  // Helper function to check if user should see premium features
  const shouldShowPremiumFeatures = (premiumPreview: string, userRole?: string | null): boolean => {
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
  };

  // Track page view and flag evaluations on mount
  useEffect(() => {
    const trackPageViewAndFlags = async () => {
      try {
        // Track page view
        await trackPageView('Home', {
          locale,
          feature_flags: flagResults,
          user_authenticated: clientAuth.isAuthenticated,
          user_role: clientAuth.user?.role,
          timestamp: new Date().toISOString(),
        });

        // Track individual feature flag evaluations (including auth-aware flags)
        const flagEvents = [
          { flag: 'show_language_switcher', result: showLangSwitcher },
          { flag: 'welcome_message_variant', result: welcomeVariant },
          { flag: 'enhanced_feature_cards', result: enhancedCards },
          { flag: 'show_beta_banner', result: showBanner },
          { flag: 'admin_dashboard_features', result: adminDashboardFeatures },
          { flag: 'enhanced_auth_analytics', result: enhancedAuthAnalytics },
          { flag: 'personalized_experience', result: personalizedExperience },
          { flag: 'premium_feature_preview', result: premiumFeaturePreview },
        ];

        for (const { flag, result } of flagEvents) {
          await trackEvent(AnalyticsEvents.FEATURE_FLAG_EVALUATED, {
            flag_name: flag,
            flag_result: result,
            user_segment: clientAuth.isAuthenticated ? 'authenticated' : 'anonymous',
            user_role: clientAuth.user?.role,
            locale,
          });
        }

        logInfo('[Page UI] Page view and flag evaluations tracked', {
          locale,
          flagCount: Object.keys(flagResults).length,
          userAuthenticated: clientAuth.isAuthenticated,
        });
      } catch (error) {
        logWarn('Analytics tracking failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    trackPageViewAndFlags();
  }, [
    locale,
    dict,
    flagResults,
    clientAuth.isAuthenticated,
    clientAuth.user,
    showLangSwitcher,
    welcomeVariant,
    enhancedCards,
    showBanner,
    adminDashboardFeatures,
    enhancedAuthAnalytics,
    personalizedExperience,
    premiumFeaturePreview,
  ]);

  // Track personalized content views
  useEffect(() => {
    if (clientAuth.isAuthenticated && personalizedExperience) {
      trackPersonalizedContentAction('homepage_experience', 'personalized_homepage');
    }
  }, [clientAuth.isAuthenticated, personalizedExperience]);

  // Track premium feature preview views
  useEffect(() => {
    if (
      clientAuth.isAuthenticated &&
      shouldShowPremiumFeatures(premiumFeaturePreview, clientAuth.user?.role)
    ) {
      trackPremiumFeaturePreviewAction('homepage_preview', premiumFeaturePreview);
    }
  }, [clientAuth.isAuthenticated, premiumFeaturePreview, clientAuth.user?.role]);

  // Track admin dashboard feature usage
  useEffect(() => {
    if (clientAuth.isAuthenticated && clientAuth.user?.role === 'admin' && adminDashboardFeatures) {
      trackRoleBasedFeatureAction('admin_dashboard', 'homepage_view');
    }
  }, [clientAuth.isAuthenticated, clientAuth.user?.role, adminDashboardFeatures]);

  // Track feature card interactions
  const handleFeatureCardClick = async (feature: string) => {
    try {
      await trackEvent(AnalyticsEvents.FEATURE_CARD_CLICKED, {
        feature_name: feature,
        enhanced_mode: enhancedCards,
        user_authenticated: clientAuth.isAuthenticated,
        user_role: clientAuth.user?.role,
        locale,
        timestamp: new Date().toISOString(),
      });
      logInfo('[Page UI] Feature card clicked', {
        feature,
        enhancedMode: enhancedCards,
        userAuth: clientAuth.isAuthenticated,
      });
    } catch (error) {
      logWarn('Feature card click tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleFeatureCardHover = async (feature: string) => {
    try {
      await trackEvent(AnalyticsEvents.FEATURE_CARD_HOVERED, {
        feature_name: feature,
        enhanced_mode: enhancedCards,
        user_authenticated: clientAuth.isAuthenticated,
        user_role: clientAuth.user?.role,
        locale,
      });
    } catch (error) {
      logWarn('Feature card hover tracking failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Get welcome message based on variant and auth state
  const getWelcomeMessage = () => {
    if (clientAuth.isAuthenticated && clientAuth.user) {
      const greeting = clientAuth.user.role === 'admin' ? 'Administrator' : 'Welcome back';
      return `${greeting}, ${clientAuth.user.name.split(' ')[0]}!`;
    }

    switch (welcomeVariant) {
      case 'friendly':
        return 'Hey there! Welcome to';
      case 'professional':
        return 'Welcome to the';
      case 'casual':
        return 'Check out';
      default:
        return dict.home.welcome;
    }
  };

  return (
    <div className="harmony-bg-background min-h-screen">
      {/* Header - Fixed and responsive */}
      <header className="harmony-bg-surface harmony-shadow-sm harmony-border sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Toggle Button and Logo */}
            <div className="flex items-center space-x-3">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={sidebar.toggle}
                aria-label={sidebar.isOpen ? 'Close navigation' : 'Open navigation'}
                className="harmony-text-primary hover:harmony-bg-surface transition-all duration-200 active:scale-95 lg:hover:scale-105"
              >
                <AnimatedMenuIcon isOpen={sidebar.isOpen} size={20} />
              </ActionIcon>
              <div className="flex items-center space-x-2">
                <IconBrandNextjs size={32} className="harmony-text-primary" />
                <h1 className="harmony-text-primary hidden text-lg font-bold sm:block lg:text-xl">
                  {dict.header.title}
                </h1>
                <h1 className="harmony-text-primary text-base font-bold sm:hidden">
                  {dict.header.title.split(' ')[0]} {/* Show first word only on mobile */}
                </h1>
              </div>
            </div>

            {/* Auth and Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {clientAuth.isAuthenticated && clientAuth.user ? (
                <UserDropdown user={clientAuth.user as any} locale={locale} />
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link href={`/${locale}/login` as Route}>
                    <Button
                      variant="outline"
                      size="sm"
                      leftSection={<IconLogin size={16} className="hidden sm:block" />}
                      className="harmony-transition text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Sign In</span>
                      <span className="sm:hidden">In</span>
                    </Button>
                  </Link>
                  <Link href={`/${locale}/signup` as Route}>
                    <Button
                      variant="filled"
                      size="sm"
                      leftSection={<IconUserPlus size={16} className="hidden sm:block" />}
                      className="harmony-transition text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Sign Up</span>
                      <span className="sm:hidden">Up</span>
                    </Button>
                  </Link>
                </div>
              )}
              {showLangSwitcher && (
                <div className="hidden md:block">
                  <LanguageSwitcher currentLocale={locale} />
                </div>
              )}
              <ColorSchemesSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="harmony-bg-background mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 text-center">
          {/* Beta Banner */}
          {showBanner && (
            <div className="harmony-shadow-md inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white">
              🚀 Beta Features Available - Try them now!
            </div>
          )}

          {/* Welcome Title */}
          <div>
            <h1 className="harmony-text-primary mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              {getWelcomeMessage()}{' '}
              {!clientAuth.isAuthenticated && (
                <>
                  <span className="bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent">
                    Mantine
                  </span>{' '}
                  +{' '}
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    Tailwind
                  </span>
                </>
              )}
            </h1>

            <p className="harmony-text-secondary mx-auto max-w-2xl text-lg">
              {dict.home.description}
              {welcomeVariant === 'friendly' && ' 😊'}
              {welcomeVariant === 'professional' && ' 🏢'}
              {welcomeVariant === 'casual' && ' ✨'}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Next.js Card */}
            <Card
              withBorder
              shadow="sm"
              radius="md"
              padding="lg"
              className={`harmony-card harmony-interactive cursor-pointer ${
                enhancedCards ? 'min-h-[120px]' : ''
              }`}
              onClick={() => handleFeatureCardClick('nextjs')}
              onMouseEnter={() => handleFeatureCardHover('nextjs')}
            >
              <div className="flex items-center gap-4">
                <IconBrandNextjs size={24} className="harmony-text-primary flex-shrink-0" />
                <div className="text-left">
                  <h3 className="harmony-text-primary font-semibold">
                    {dict.home.features.nextjs.title}
                  </h3>
                  <p className="harmony-text-secondary mt-1 text-sm">
                    {dict.home.features.nextjs.description}
                  </p>
                  {enhancedCards && (
                    <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      App Router • RSC • TypeScript
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Mantine Card */}
            <Card
              withBorder
              shadow="sm"
              radius="md"
              padding="lg"
              className={`harmony-card harmony-interactive cursor-pointer ${
                enhancedCards ? 'min-h-[120px]' : ''
              }`}
              onClick={() => handleFeatureCardClick('mantine')}
              onMouseEnter={() => handleFeatureCardHover('mantine')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-blue-500">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
                <div className="text-left">
                  <h3 className="harmony-text-primary font-semibold">
                    {dict.home.features.mantine.title}
                  </h3>
                  <p className="harmony-text-secondary mt-1 text-sm">
                    {dict.home.features.mantine.description}
                  </p>
                  {enhancedCards && (
                    <span className="mt-2 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      Hooks • Theming • Forms
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Tailwind Card */}
            <Card
              withBorder
              shadow="sm"
              radius="md"
              padding="lg"
              className={`harmony-card harmony-interactive cursor-pointer ${
                enhancedCards ? 'min-h-[120px]' : ''
              }`}
              onClick={() => handleFeatureCardClick('tailwind')}
              onMouseEnter={() => handleFeatureCardHover('tailwind')}
            >
              <div className="flex items-center gap-4">
                <IconBrandTailwind size={24} className="flex-shrink-0 text-cyan-500" />
                <div className="text-left">
                  <h3 className="harmony-text-primary font-semibold">
                    {dict.home.features.tailwind.title}
                  </h3>
                  <p className="harmony-text-secondary mt-1 text-sm">
                    {dict.home.features.tailwind.description}
                  </p>
                  {enhancedCards && (
                    <span className="mt-2 inline-block rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-800">
                      Utility-first • JIT • Mobile-first
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Analytics Demo Section */}
          <div className="mx-auto mt-16 max-w-2xl">
            <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">
              Analytics Integration Demo
            </h2>
            <p className="mb-8 text-center text-sm text-gray-600">
              This demonstrates the analytics emitter patterns integrated into the template. Events
              are tracked using the console provider for development.
            </p>
            <AnalyticsDemo />
          </div>

          {/* Personalized Experience Section */}
          {clientAuth.isAuthenticated && personalizedExperience && (
            <div className="mx-auto mt-16 max-w-2xl">
              <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-6">
                <h2 className="mb-4 text-center text-2xl font-bold text-green-900">
                  ✨ Personalized for You
                </h2>
                <p className="mb-6 text-center text-sm text-green-700">
                  Welcome back, {clientAuth.user?.name}! Here are features tailored to your
                  preferences.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-green-100 bg-white p-4 text-center">
                    <h3 className="mb-2 font-medium text-green-900">Your Dashboard</h3>
                    <p className="text-xs text-green-600">
                      Customized content based on your activity
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-100 bg-white p-4 text-center">
                    <h3 className="mb-2 font-medium text-green-900">Smart Recommendations</h3>
                    <p className="text-xs text-green-600">
                      AI-powered suggestions for your workflow
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Premium Features Preview */}
          {clientAuth.isAuthenticated &&
            shouldShowPremiumFeatures(premiumFeaturePreview, clientAuth.user?.role) && (
              <div className="mx-auto mt-16 max-w-2xl">
                <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
                  <h2 className="mb-4 text-center text-2xl font-bold text-amber-900">
                    🎯 Premium Features Preview
                  </h2>
                  <p className="mb-6 text-center text-sm text-amber-700">
                    You're seeing a preview of premium features! ({premiumFeaturePreview} level)
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 rounded-lg border border-amber-100 bg-white p-3">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-sm text-amber-800">Advanced Analytics Dashboard</span>
                    </div>
                    {(premiumFeaturePreview === 'advanced' || premiumFeaturePreview === 'full') && (
                      <div className="flex items-center space-x-3 rounded-lg border border-amber-100 bg-white p-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-sm text-amber-800">
                          AI-Powered Insights & Recommendations
                        </span>
                      </div>
                    )}
                    {premiumFeaturePreview === 'full' && (
                      <div className="flex items-center space-x-3 rounded-lg border border-amber-100 bg-white p-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-sm text-amber-800">
                          Custom Integrations & API Access
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Admin Features Section */}
          {clientAuth.isAuthenticated &&
            clientAuth.user?.role === 'admin' &&
            adminDashboardFeatures && (
              <div className="mx-auto mt-16 max-w-2xl">
                <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6">
                  <h2 className="mb-4 text-center text-2xl font-bold text-purple-900">
                    🛡️ Administrator Dashboard
                  </h2>
                  <p className="mb-6 text-center text-sm text-purple-700">
                    Advanced admin features enabled - manage users, analytics, and system settings.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-purple-100 bg-white p-4 text-center">
                      <h3 className="mb-2 font-medium text-purple-900">Enhanced Analytics</h3>
                      <p className="text-xs text-purple-600">
                        {enhancedAuthAnalytics ? 'Advanced tracking enabled' : 'Standard analytics'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-purple-100 bg-white p-4 text-center">
                      <h3 className="mb-2 font-medium text-purple-900">Feature Flag Control</h3>
                      <p className="text-xs text-purple-600">
                        Real-time flag management and A/B testing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
