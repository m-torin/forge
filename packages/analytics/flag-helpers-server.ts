import { flags } from './flags-server';
import { FLAGS } from './types/flags';

import type { AIFlags, AnalyticsFlags, AuthFlags, PaymentFlags, UIFlags } from './types/flags';

/**
 * Server-safe helper functions to get typed flag groups
 * These replace the complex functions from the old feature-flags package
 */

export async function getAnalyticsFlags(userId?: string): Promise<AnalyticsFlags> {
  const [
    enabled,
    segmentEnabled,
    posthogEnabled,
    googleEnabled,
    debug,
    productionOnly,
    consentRequired,
  ] = await Promise.all([
    flags([FLAGS.analytics.enabled], userId).then((r) => r[FLAGS.analytics.enabled]),
    flags([FLAGS.analytics.segment], userId).then((r) => r[FLAGS.analytics.segment]),
    flags([FLAGS.analytics.posthog], userId).then((r) => r[FLAGS.analytics.posthog]),
    flags([FLAGS.analytics.google], userId).then((r) => r[FLAGS.analytics.google]),
    flags([FLAGS.analytics.debug], userId).then((r) => r[FLAGS.analytics.debug]),
    flags(['analytics.production-only'], userId).then((r) => r['analytics.production-only']),
    flags(['analytics.consent-required'], userId).then((r) => r['analytics.consent-required']),
  ]);

  return {
    consentRequired,
    debug,
    enabled,
    googleEnabled,
    posthogEnabled,
    productionOnly,
    segmentEnabled,
  };
}

export async function getAuthFlags(userId?: string): Promise<AuthFlags> {
  const flagKeys = [
    FLAGS.auth.emailPassword,
    FLAGS.auth.magicLink,
    'auth.passkey.enabled',
    FLAGS.auth.oauth.google,
    FLAGS.auth.oauth.github,
    FLAGS.auth.oauth.discord,
    'auth.oauth.microsoft',
    FLAGS.auth.twoFactor,
    'auth.two-factor.optional',
    FLAGS.auth.organizations,
    'auth.impersonation.enabled',
    FLAGS.auth.apiKeys,
  ];

  const results = await flags(flagKeys, userId);

  return {
    apiKeysEnabled: results[FLAGS.auth.apiKeys] ?? false,
    discordOAuthEnabled: results[FLAGS.auth.oauth.discord] ?? false,
    emailPasswordEnabled: results[FLAGS.auth.emailPassword] ?? false,
    githubOAuthEnabled: results[FLAGS.auth.oauth.github] ?? false,
    googleOAuthEnabled: results[FLAGS.auth.oauth.google] ?? false,
    impersonationEnabled: results['auth.impersonation.enabled'] ?? false,
    magicLinkEnabled: results[FLAGS.auth.magicLink] ?? false,
    microsoftOAuthEnabled: results['auth.oauth.microsoft'] ?? false,
    organizationsEnabled: results[FLAGS.auth.organizations] ?? false,
    passkeyEnabled: results['auth.passkey.enabled'] ?? false,
    twoFactorOptional: results['auth.two-factor.optional'] ?? false,
    twoFactorRequired: results[FLAGS.auth.twoFactor] ?? false,
  };
}

export async function getPaymentFlags(userId?: string): Promise<PaymentFlags> {
  const flagKeys = [
    FLAGS.payments.stripe,
    'payments.lemonsqueezy.enabled',
    FLAGS.payments.subscriptions,
    FLAGS.payments.trials,
    FLAGS.payments.refunds,
    'payments.credits.enabled',
    'payments.invoices.enabled',
    'payments.tax.enabled',
  ];

  const results = await flags(flagKeys, userId);

  return {
    creditsEnabled: results['payments.credits.enabled'] ?? false,
    invoicesEnabled: results['payments.invoices.enabled'] ?? false,
    lemonSqueezyEnabled: results['payments.lemonsqueezy.enabled'] ?? false,
    refundsEnabled: results[FLAGS.payments.refunds] ?? false,
    stripeEnabled: results[FLAGS.payments.stripe] ?? false,
    subscriptionsEnabled: results[FLAGS.payments.subscriptions] ?? false,
    taxEnabled: results['payments.tax.enabled'] ?? false,
    trialsEnabled: results[FLAGS.payments.trials] ?? false,
  };
}

export async function getAIFlags(userId?: string): Promise<AIFlags> {
  const flagKeys = [
    FLAGS.ai.enabled,
    FLAGS.ai.openai,
    FLAGS.ai.anthropic,
    'ai.google.enabled',
    FLAGS.ai.chat,
    'ai.code-generation.enabled',
    'ai.moderation.enabled',
    'ai.rate-limiting.enabled',
  ];

  const results = await flags(flagKeys, userId);

  return {
    anthropicEnabled: results[FLAGS.ai.anthropic] ?? false,
    chatEnabled: results[FLAGS.ai.chat] ?? false,
    codeGenerationEnabled: results['ai.code-generation.enabled'] ?? false,
    enabled: results[FLAGS.ai.enabled] ?? false,
    googleEnabled: results['ai.google.enabled'] ?? false,
    moderationEnabled: results['ai.moderation.enabled'] ?? false,
    openAIEnabled: results[FLAGS.ai.openai] ?? false,
    rateLimitingEnabled: results['ai.rate-limiting.enabled'] ?? false,
  };
}

export async function getUIFlags(userId?: string): Promise<UIFlags> {
  const flagKeys = [
    FLAGS.ui.darkMode,
    FLAGS.ui.animations,
    FLAGS.ui.betaComponents,
    FLAGS.ui.newNavigation,
    'ui.advanced-tables',
    'ui.charts.enabled',
    'ui.mobile-optimized',
  ];

  const results = await flags(flagKeys, userId);

  return {
    advancedTables: results['ui.advanced-tables'] ?? false,
    animationsEnabled: results[FLAGS.ui.animations] ?? false,
    betaComponents: results[FLAGS.ui.betaComponents] ?? false,
    chartsEnabled: results['ui.charts.enabled'] ?? false,
    darkModeEnabled: results[FLAGS.ui.darkMode] ?? false,
    mobileOptimized: results['ui.mobile-optimized'] ?? false,
    newNavigation: results[FLAGS.ui.newNavigation] ?? false,
  };
}
