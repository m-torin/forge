/**
 * Feature flag types for packages to import without circular dependencies
 * Import from '@repo/analytics/types/flags' to avoid importing the full package
 */

/**
 * Feature flag constants
 */
export const FLAGS = {
  ai: {
    anthropic: 'ai.anthropic',
    chat: 'ai.chat',
    enabled: 'ai.enabled',
    openai: 'ai.openai',
  },
  analytics: {
    debug: 'analytics.debug',
    enabled: 'analytics.enabled',
    google: 'analytics.google',
    posthog: 'analytics.posthog',
    segment: 'analytics.segment',
  },
  auth: {
    apiKeys: 'auth.api-keys',
    magicLink: 'auth.magic-link',
    oauth: {
      discord: 'auth.oauth.discord',
      github: 'auth.oauth.github',
      google: 'auth.oauth.google',
    },
    organizations: 'auth.organizations',
    twoFactor: 'auth.two-factor',
  },
  payments: {
    refunds: 'payments.refunds',
    stripe: 'payments.stripe',
    subscriptions: 'payments.subscriptions',
    trials: 'payments.trials',
  },
  ui: {
    animations: 'ui.animations',
    betaComponents: 'ui.beta-components',
    darkMode: 'ui.dark-mode',
    newNavigation: 'ui.new-navigation',
  },
} as const;

export interface AnalyticsFlags {
  consentRequired: boolean;
  debug: boolean;
  enabled: boolean;
  googleEnabled: boolean;
  posthogEnabled: boolean;
  productionOnly: boolean;
  segmentEnabled: boolean;
}

export interface AuthFlags {
  apiKeysEnabled: boolean;
  discordOAuthEnabled: boolean;
  githubOAuthEnabled: boolean;
  googleOAuthEnabled: boolean;
  impersonationEnabled: boolean;
  magicLinkEnabled: boolean;
  microsoftOAuthEnabled: boolean;
  organizationsEnabled: boolean;
  passkeyEnabled: boolean;
  twoFactorOptional: boolean;
  twoFactorRequired: boolean;
}

export interface PaymentFlags {
  creditsEnabled: boolean;
  invoicesEnabled: boolean;
  lemonSqueezyEnabled: boolean;
  refundsEnabled: boolean;
  stripeEnabled: boolean;
  subscriptionsEnabled: boolean;
  taxEnabled: boolean;
  trialsEnabled: boolean;
}

export interface AIFlags {
  anthropicEnabled: boolean;
  chatEnabled: boolean;
  codeGenerationEnabled: boolean;
  enabled: boolean;
  googleEnabled: boolean;
  moderationEnabled: boolean;
  openAIEnabled: boolean;
  rateLimitingEnabled: boolean;
}

export interface UIFlags {
  advancedTables: boolean;
  animationsEnabled: boolean;
  betaComponents: boolean;
  chartsEnabled: boolean;
  darkModeEnabled: boolean;
  mobileOptimized: boolean;
  newNavigation: boolean;
}